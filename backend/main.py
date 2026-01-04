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
from schemas.models import OrchestrateRequest, OrchestrateResponse, IntentOutput
from agents.intent_agent import parse_intent
from agents.quiz_agent import generate_quiz
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


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "EduSphere AI Orchestrator is running",
        "version": "1.0.0",
        "mode": "MVP"
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
    Handle quiz creation workflow:
    1. Fetch content from source (Classroom/Docs/manual)
    2. Generate quiz questions via Quiz Agent
    3. Create Google Form
    4. Assign to Classroom (if requested)
    """
    # Step 1: Get content from source
    content = ""
    if intent.source == "google_classroom":
        # Extract course ID from prompt (simplified - real implementation would parse better)
        # For MVP: Use mock course
        course_id = "course_1"  # Would extract from prompt
        content = classroom_service.get_course_materials(course_id)
    
    elif intent.source == "google_docs":
        # Extract document ID from prompt
        doc_id = "doc_1"  # Would extract from prompt
        content = docs_service.get_document_content(doc_id)
    
    else:  # manual_text
        # Use prompt itself as content (for MVP)
        content = request.prompt
    
    # Step 2: Generate quiz via Quiz Agent
    num_questions = intent.num_questions or 5
    quiz_output = generate_quiz(content, num_questions, gemini_service)
    
    # Step 3: Create Google Form
    form_title = f"Quiz - {intent.source.replace('_', ' ').title()}"
    form_result = forms_service.create_quiz_form(form_title, quiz_output.questions)
    
    # Step 4: Assign to Classroom if target is classroom
    assignment_result = None
    if intent.target == "google_classroom":
        course_id = "course_1"  # Would extract from prompt
        assignment_result = classroom_service.assign_form_to_classroom(
            course_id=course_id,
            form_url=form_result["form_url"],
            title=form_title
        )
    
    return OrchestrateResponse(
        success=True,
        message=f"Quiz created successfully with {len(quiz_output.questions)} questions",
        data={
            "form_url": form_result["form_url"],
            "form_id": form_result["form_id"],
            "num_questions": len(quiz_output.questions),
            "assignment": assignment_result
        },
        intent=intent
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
