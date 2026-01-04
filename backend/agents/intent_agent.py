"""
Intent Agent - Converts user language to structured intent

MVP: Uses keyword and pattern matching
Future: Can integrate Gemini for complex intent parsing
"""
from schemas.models import IntentOutput
from typing import Dict


def parse_intent(user_prompt: str) -> IntentOutput:
    """
    Parse user prompt into structured intent.
    
    Rules:
    - Quiz creation: keywords like "quiz", "test", "questions", "exam"
    - Learning plan: keywords like "plan", "schedule", "syllabus", "curriculum"
    - Analytics: keywords like "analyze", "results", "performance", "stats"
    - Scheduling: keywords like "schedule", "calendar", "deadline", "timeline"
    
    Returns IntentOutput with structured intent.
    """
    prompt_lower = user_prompt.lower()
    
    # Initialize defaults
    intent_type = "quiz_creation"  # Default
    source = "manual_text"  # Default
    target = "google_forms"  # Default
    num_questions = None
    confidence = 0.7  # Medium confidence for keyword matching
    
    # Detect intent type
    quiz_keywords = ["quiz", "test", "questions", "exam", "assessment", "mcq"]
    learning_keywords = ["plan", "learning path", "syllabus", "curriculum", "study plan"]
    analytics_keywords = ["analyze", "analysis", "results", "performance", "stats", "statistics"]
    scheduling_keywords = ["schedule", "calendar", "deadline", "timeline", "plan time"]
    
    quiz_score = sum(1 for kw in quiz_keywords if kw in prompt_lower)
    learning_score = sum(1 for kw in learning_keywords if kw in prompt_lower)
    analytics_score = sum(1 for kw in analytics_keywords if kw in prompt_lower)
    scheduling_score = sum(1 for kw in scheduling_keywords if kw in prompt_lower)
    
    scores = {
        "quiz_creation": quiz_score,
        "learning_plan": learning_score,
        "analytics": analytics_score,
        "scheduling": scheduling_score
    }
    
    intent_type = max(scores, key=scores.get)
    
    # Boost confidence if strong keyword match
    max_score = max(scores.values())
    if max_score > 0:
        confidence = min(0.9, 0.6 + (max_score * 0.1))
    else:
        confidence = 0.5  # Low confidence if no keywords found
    
    # Detect source (where content comes from)
    if "classroom" in prompt_lower or "google classroom" in prompt_lower:
        source = "google_classroom"
    elif "doc" in prompt_lower or "document" in prompt_lower:
        source = "google_docs"
    else:
        source = "manual_text"
    
    # Detect target (where output goes)
    if "form" in prompt_lower:
        target = "google_forms"
    elif "classroom" in prompt_lower and "assign" in prompt_lower:
        target = "google_classroom"
    elif "calendar" in prompt_lower or "schedule" in prompt_lower:
        target = "google_calendar"
    
    # Extract number of questions (simple pattern matching)
    import re
    num_match = re.search(r'(\d+)\s*(?:question|q|quiz|test)', prompt_lower)
    if num_match:
        num_questions = int(num_match.group(1))
    else:
        # Try other patterns
        num_match = re.search(r'(?:create|make|generate)\s*(\d+)', prompt_lower)
        if num_match:
            num_questions = int(num_match.group(1))
    
    return IntentOutput(
        intent_type=intent_type,
        source=source,
        target=target,
        num_questions=num_questions,
        confidence=confidence
    )
