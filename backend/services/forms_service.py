"""
Google Forms Service - MOCK VERSION

This service handles Google Forms API interactions.
For MVP: Returns mocked form creation.
For Production: Replace with real Google Forms API calls.
"""
from typing import List, Dict
from schemas.models import QuizQuestion


class FormsService:
    """Service for Google Forms API interactions"""
    
    def __init__(self, credentials: Dict = None):
        """
        Initialize Forms service.
        
        Args:
            credentials: OAuth2 credentials (for real API)
        """
        self.credentials = credentials
        self.mock_mode = True  # MVP: Always mock
    
    def create_quiz_form(self, title: str, questions: List[QuizQuestion]) -> Dict:
        """
        Create a Google Form quiz from structured questions.
        
        Args:
            title: Form title
            questions: List of QuizQuestion objects
            
        Returns:
            Form information including URL
        """
        # MOCK: Return form info
        form_id = f"mock_form_{hash(title) % 10000}"
        
        return {
            "form_id": form_id,
            "title": title,
            "form_url": f"https://docs.google.com/forms/d/{form_id}/viewform",
            "edit_url": f"https://docs.google.com/forms/d/{form_id}/edit",
            "num_questions": len(questions),
            "status": "created"
        }
        
        # REAL API would:
        # 1. Create form via Google Forms API
        # 2. Add questions with correct answers
        # 3. Set as quiz mode
        # 4. Return form URLs
