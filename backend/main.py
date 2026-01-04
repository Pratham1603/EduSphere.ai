"""
EduSphere AI - Main Orchestrator (FastAPI)

This is the central orchestrator that:
1. Receives user prompts
2. Calls Intent Agent
3. Routes to appropriate agent
4. Calls Google Workspace APIs
5. Returns results

Agents NEVER call Google APIs directly - only this orchestrator does.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from schemas.models import OrchestrateRequest, OrchestrateResponse, IntentOutput
from agents.intent_agent import parse_intent
from agents.quiz_agent import generate_quiz
from agents.content_agent import extract_content
from agents.classroom_agent import assign_to_classroom
from agents.learning_agent import generate_learning_plan
from agents.analytics_agent import analyze_quiz_results
from agents.workflow_agent import optimize_schedule
from services.gemini_service import GeminiService
from services.classroom_service import ClassroomService
from services.forms_service import FormsService
from services.docs_service import DocsService
from services.sheets_service import SheetsService
from services.calendar_service import CalendarService
import os
import json
import asyncio
import time
import re

# Ensure environment variables from .env are loaded before service initialization
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # dotenv is optional at runtime; app can still run with OS env vars
    pass

app = FastAPI(
    title="EduSphere AI",
    description="AI-powered orchestration system for Google Workspace education tools",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (with error handling to prevent startup failures)
try:
    gemini_service = GeminiService(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Warning: Failed to initialize GeminiService: {e}. Creating with default (mock) mode.")
    gemini_service = GeminiService(api_key=None)  # Force mock mode

classroom_service = ClassroomService()
forms_service = FormsService()
docs_service = DocsService()
sheets_service = SheetsService()
calendar_service = CalendarService()


# ─────────────────────────────────────────────────────────────────────────────
# Google OAuth endpoints for Forms authorization
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/auth/google")
def google_auth_start():
    """Start Google OAuth flow - returns URL to redirect user to."""
    auth_url = forms_service.get_authorization_url()
    if auth_url:
        return {"auth_url": auth_url, "message": "Open this URL in your browser to authorize Google Forms"}
    return {"error": "Could not generate auth URL. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"}


@app.get("/auth/google/callback")
def google_auth_callback(code: str = None, error: str = None):
    """Handle OAuth callback from Google."""
    if error:
        return {"success": False, "error": error}
    
    if not code:
        return {"success": False, "error": "No authorization code received"}
    
    try:
        from google_auth_oauthlib.flow import Flow
        
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI") or "http://localhost:8000/auth/google/callback"
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        
        if client_id and client_secret:
            client_config = {
                "web": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri],
                }
            }
            flow = Flow.from_client_config(
                client_config, 
                scopes=["https://www.googleapis.com/auth/forms.body"],
                redirect_uri=redirect_uri
            )
        else:
            return {"success": False, "error": "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET"}
        
        # Exchange code for tokens
        flow.fetch_token(code=code)
        creds = flow.credentials
        
        # Save token to file
        with open("token.json", "w") as f:
            f.write(creds.to_json())
        
        # Reload forms service
        global forms_service
        forms_service = FormsService()
        
        return {
            "success": True, 
            "message": "Google Forms authorized successfully! You can now create real forms.",
            "note": "Restart the backend or make a new request to use real Forms."
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/auth/status")
def auth_status():
    """Check current authorization status."""
    return {
        "forms_ready": forms_service._is_ready,
        "auth_url": forms_service.get_authorization_url() if not forms_service._is_ready else None,
        "message": "Forms ready to create!" if forms_service._is_ready else "Not authorized. Visit /auth/google to start."
    }


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Extract subject and chapter from prompt
# ─────────────────────────────────────────────────────────────────────────────

def extract_subject_chapter(prompt: str) -> tuple:
    """Extract subject and chapter from user prompt."""
    prompt_lower = prompt.lower()
    
    # Detect subject
    subjects = ["physics", "chemistry", "biology", "mathematics", "math", "history", "geography"]
    subject = "Physics"  # Default
    for s in subjects:
        if s in prompt_lower:
            subject = s.capitalize()
            if subject == "Math":
                subject = "Mathematics"
            break
    
    # Detect chapter
    chapter = "Chapter 1"  # Default
    chapter_match = re.search(r'chapter\s*(\d+)', prompt_lower)
    if chapter_match:
        chapter = f"Chapter {chapter_match.group(1)}"
    
    return subject, chapter


# ─────────────────────────────────────────────────────────────────────────────
# Streaming endpoint for real-time agent updates (Server-Sent Events)
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/orchestrate/stream")
async def orchestrate_stream(request: OrchestrateRequest):
    """
    Streaming orchestration with real-time agent updates via SSE.
    
    Flow: Intent Agent → Content Agent → Quiz Agent → Classroom Agent
    """
    async def event_generator():
        start_time = time.time()
        
        # Helper to send SSE events
        def sse(event: str, data: dict):
            return f"event: {event}\ndata: {json.dumps(data)}\n\n"
        
        try:
            # ═══════════════════════════════════════════════════════════════
            # STEP 1: Intent Agent - Understand the request
            # ═══════════════════════════════════════════════════════════════
            yield sse("agent_start", {"agent": "intent", "message": "Analyzing your request..."})
            await asyncio.sleep(0.3)
            
            intent = parse_intent(request.prompt)
            intent_time = round(time.time() - start_time, 2)
            
            yield sse("agent_complete", {
                "agent": "intent",
                "duration": intent_time,
                "result": intent.model_dump()
            })
            
            # ═══════════════════════════════════════════════════════════════
            # QUIZ CREATION FLOW
            # ═══════════════════════════════════════════════════════════════
            if intent.intent_type == "quiz_creation":
                
                # Extract subject and chapter from prompt
                subject, chapter = extract_subject_chapter(request.prompt)
                
                # ───────────────────────────────────────────────────────────
                # STEP 2: Content Agent - Extract key topics
                # ───────────────────────────────────────────────────────────
                yield sse("agent_start", {"agent": "content", "message": f"Extracting key topics from {subject} {chapter}..."})
                content_start = time.time()
                
                # Get notes content (from prompt or external source)
                notes = request.prompt
                if intent.source == "google_classroom":
                    notes = classroom_service.get_course_materials("course_1")
                elif intent.source == "google_docs":
                    notes = docs_service.get_document_content("doc_1")
                
                content_output = extract_content(subject, chapter, notes, gemini_service)
                content_time = round(time.time() - content_start, 2)
                
                yield sse("agent_complete", {
                    "agent": "content",
                    "duration": content_time,
                    "result": {
                        "key_topics": content_output.key_topics,
                        "summary": content_output.summary
                    }
                })
                
                # ───────────────────────────────────────────────────────────
                # STEP 3: Quiz Agent - Generate questions
                # ───────────────────────────────────────────────────────────
                yield sse("agent_start", {"agent": "quiz", "message": "Generating quiz questions with AI..."})
                quiz_start = time.time()
                
                # Build enriched content for quiz generation
                enriched_content = f"""
Subject: {subject}
Chapter: {chapter}
Key Topics: {', '.join(content_output.key_topics)}
Summary: {content_output.summary}

Original Request: {request.prompt}
"""
                
                num_questions = intent.num_questions or 5
                quiz_output = generate_quiz(enriched_content, num_questions, gemini_service)
                quiz_time = round(time.time() - quiz_start, 2)
                
                yield sse("agent_complete", {
                    "agent": "quiz",
                    "duration": quiz_time,
                    "result": {"num_questions": len(quiz_output.questions)}
                })
                
                # ───────────────────────────────────────────────────────────
                # STEP 4a: Forms Agent - Create Google Form
                # ───────────────────────────────────────────────────────────
                yield sse("agent_start", {"agent": "forms", "message": "Creating Google Form..."})
                forms_start = time.time()
                
                form_title = f"{subject} {chapter} Quiz"
                form_result = forms_service.create_quiz_form(form_title, quiz_output.questions)
                forms_time = round(time.time() - forms_start, 2)
                
                yield sse("agent_complete", {
                    "agent": "forms",
                    "duration": forms_time,
                    "result": {"form_url": form_result.get("form_url"), "form_id": form_result.get("form_id")}
                })
                
                # ───────────────────────────────────────────────────────────
                # STEP 4b: Classroom Agent - Assign to Classroom (Demo)
                # ───────────────────────────────────────────────────────────
                yield sse("agent_start", {"agent": "classroom", "message": "Assigning to Google Classroom (Demo Mode)..."})
                classroom_start = time.time()
                
                delivery = assign_to_classroom(
                    quiz_title=form_title,
                    questions=[q.model_dump() for q in quiz_output.questions],
                    form_url=form_result.get("form_url"),
                    class_name=f"{subject} Class"
                )
                classroom_time = round(time.time() - classroom_start, 2)
                
                yield sse("agent_complete", {
                    "agent": "classroom",
                    "duration": classroom_time,
                    "result": delivery.model_dump()
                })
                
                # ───────────────────────────────────────────────────────────
                # FINAL: Complete response
                # ───────────────────────────────────────────────────────────
                total_time = round(time.time() - start_time, 2)
                yield sse("complete", {
                    "success": True,
                    "message": f"Quiz created and assigned with {len(quiz_output.questions)} questions",
                    "total_duration": total_time,
                    "data": {
                        "form_url": form_result.get("form_url"),
                        "form_id": form_result.get("form_id"),
                        "questions": [q.model_dump() for q in quiz_output.questions],
                        "content": content_output.model_dump(),
                        "delivery": delivery.model_dump(),
                        "intent": intent.model_dump()
                    }
                })
            else:
                # Other intent types
                yield sse("complete", {
                    "success": True,
                    "message": f"Processed {intent.intent_type}",
                    "total_duration": round(time.time() - start_time, 2),
                    "data": {"intent": intent.model_dump()}
                })
                
        except Exception as e:
            yield sse("error", {"message": str(e)})
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "EduSphere AI Orchestrator is running",
        "version": "1.0.0",
        "mode": "MVP",
        "forms_authorized": forms_service._is_ready
    }


@app.post("/orchestrate", response_model=OrchestrateResponse)
async def orchestrate(request: OrchestrateRequest):
    """
    Main orchestration endpoint.
    
    Flow:
    1. Parse intent from user prompt
    2. Route to appropriate agent
    3. Call Google APIs as needed
    4. Return structured response
    """
    try:
        # Step 1: Parse intent
        intent = parse_intent(request.prompt)
        
        # Step 2: Route based on intent type
        if intent.intent_type == "quiz_creation":
            return await handle_quiz_creation(request, intent)
        
        elif intent.intent_type == "learning_plan":
            return await handle_learning_plan(request, intent)
        
        elif intent.intent_type == "analytics":
            return await handle_analytics(request, intent)
        
        elif intent.intent_type == "scheduling":
            return await handle_scheduling(request, intent)
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported intent type: {intent.intent_type}"
            )
    
    except HTTPException:
        # Re-raise HTTPExceptions as-is (they're already formatted)
        raise
    except Exception as e:
        # Filter out sensitive information like Request IDs from error messages
        error_msg = str(e)
        
        # Check for Google API errors (Request IDs, connection errors)
        if "Request ID" in error_msg or "connection" in error_msg.lower():
            # Don't expose API connection errors to users
            raise HTTPException(
                status_code=500,
                detail="Service temporarily unavailable. Please try again later."
            )
        
        # For other errors, provide a generic message to avoid exposing internal details
        print(f"Internal error: {error_msg}")  # Log full error for debugging
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred. Please try again."
        )


async def handle_quiz_creation(request: OrchestrateRequest, intent: IntentOutput):
    """
    Handle quiz creation workflow with full agent pipeline:
    1. Content Agent - Extract key topics
    2. Quiz Agent - Generate questions
    3. Forms Agent - Create Google Form
    4. Classroom Agent - Assign to Classroom (Demo)
    """
    # Extract subject and chapter from prompt
    subject, chapter = extract_subject_chapter(request.prompt)
    
    # Step 1: Get content from source
    content = ""
    if intent.source == "google_classroom":
        course_id = "course_1"
        content = classroom_service.get_course_materials(course_id)
    elif intent.source == "google_docs":
        doc_id = "doc_1"
        content = docs_service.get_document_content(doc_id)
    else:
        content = request.prompt
    
    # Step 2: Content Agent - Extract key topics
    content_output = extract_content(subject, chapter, content, gemini_service)
    
    # Step 3: Quiz Agent - Generate quiz with enriched content
    enriched_content = f"""
Subject: {subject}
Chapter: {chapter}
Key Topics: {', '.join(content_output.key_topics)}
Summary: {content_output.summary}

Original Request: {request.prompt}
"""
    num_questions = intent.num_questions or 5
    quiz_output = generate_quiz(enriched_content, num_questions, gemini_service)
    
    # Step 4: Forms Agent - Create Google Form
    form_title = f"{subject} {chapter} Quiz"
    form_result = forms_service.create_quiz_form(form_title, quiz_output.questions)
    
    # Step 5: Classroom Agent - Assign to Classroom (Demo Mode)
    delivery = assign_to_classroom(
        quiz_title=form_title,
        questions=[q.model_dump() for q in quiz_output.questions],
        form_url=form_result.get("form_url"),
        class_name=f"{subject} Class"
    )
    
    # Return comprehensive response
    return OrchestrateResponse(
        success=True,
        message=f"Quiz created and assigned: {len(quiz_output.questions)} questions on {subject} {chapter}",
        data={
            "form_url": form_result.get("form_url"),
            "form_id": form_result.get("form_id"),
            "questions": [q.model_dump() for q in quiz_output.questions],
            "content": content_output.model_dump(),
            "delivery": delivery.model_dump(),
            "intent": intent.model_dump()
        }
    )


async def handle_learning_plan(request: OrchestrateRequest, intent: IntentOutput):
    """Handle learning plan generation"""
    # Extract syllabus from source (simplified for MVP)
    syllabus = request.prompt  # Would fetch from source in real implementation
    
    plan = generate_learning_plan(syllabus)
    
    return OrchestrateResponse(
        success=True,
        message="Learning plan generated successfully",
        data=plan,
        intent=intent
    )


async def handle_analytics(request: OrchestrateRequest, intent: IntentOutput):
    """Handle analytics on quiz results"""
    # Fetch results from Sheets
    spreadsheet_id = "sheet_1"  # Would extract from prompt
    results = sheets_service.get_quiz_results(spreadsheet_id)
    
    analytics = analyze_quiz_results(results)
    
    return OrchestrateResponse(
        success=True,
        message="Analytics generated successfully",
        data=analytics,
        intent=intent
    )


async def handle_scheduling(request: OrchestrateRequest, intent: IntentOutput):
    """Handle schedule optimization"""
    # Extract tasks and deadlines from prompt (simplified for MVP)
    # Real implementation would parse structured input
    tasks = [
        {"name": "Task 1", "duration": "2 hours", "priority": "high"},
        {"name": "Task 2", "duration": "1 hour", "priority": "medium"}
    ]
    deadlines = [
        {"task_name": "Task 1", "due_date": None},
        {"task_name": "Task 2", "due_date": None}
    ]
    
    schedule = optimize_schedule(tasks, deadlines)
    
    # Create calendar events if target is calendar
    if intent.target == "google_calendar":
        events = calendar_service.create_schedule([
            {
                "title": task["task"],
                "start_time": None,  # Would calculate from schedule
                "end_time": None,
                "description": f"Priority: {task['priority']}"
            }
            for task in schedule["schedule"]
        ])
        schedule["calendar_events"] = events
    
    return OrchestrateResponse(
        success=True,
        message="Schedule optimized successfully",
        data=schedule,
        intent=intent
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
