"""
Data models and schemas for EduSphere AI
"""
from typing import Optional, List, Literal
from pydantic import BaseModel


class IntentOutput(BaseModel):
    """Intent Agent output - structured intent from user prompt"""
    intent_type: Literal["quiz_creation", "learning_plan", "analytics", "scheduling"]
    source: Literal["google_classroom", "google_docs", "manual_text"]
    target: Literal["google_forms", "google_classroom", "google_calendar"]
    num_questions: Optional[int] = None
    confidence: float  # 0.0 to 1.0


class QuizQuestion(BaseModel):
    """Single quiz question structure"""
    question: str
    options: List[str]  # Should have 4 options (A, B, C, D)
    correct_answer: str  # One of the options


class QuizOutput(BaseModel):
    """Quiz Agent output - list of structured questions"""
    questions: List[QuizQuestion]


class OrchestrateRequest(BaseModel):
    """Request to /orchestrate endpoint"""
    prompt: str
    user_token: Optional[str] = None  # OAuth token for Google APIs


class OrchestrateResponse(BaseModel):
    """Response from /orchestrate endpoint"""
    success: bool
    message: str
    data: Optional[dict] = None  # Agent-specific response data
    intent: Optional[IntentOutput] = None
