"""
Gemini Service - Text generation for agents

This service wraps Google Gemini API calls.
Used by agents for content generation (NOT for Google Workspace API calls).
"""
import os
from typing import Optional

# Try to load dotenv if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    import google.generativeai as genai
except ImportError:
    genai = None  # Will use mock mode if not installed


class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini service.
        
        For MVP: Can use mock mode if API key not provided
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = None
        self._initialized = False
        
        # Try to initialize, but don't fail hard - we can retry later
        self._try_initialize()
    
    def _try_initialize(self) -> bool:
        """
        Attempt to initialize Gemini API.
        Returns True if successful, False otherwise.
        """
        if not self.api_key or not genai:
            self.mock_mode = True
            if not self.api_key:
                print("Info: GEMINI_API_KEY not found. Using mock mode.")
            return False
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.mock_mode = False
            self._initialized = True
            print("Gemini API initialized successfully.")
            return True
        except Exception as e:
            error_msg = str(e)
            if "Request ID" in error_msg or "connection" in error_msg.lower():
                print("Warning: Gemini API connection error during initialization. Will retry on next request.")
            else:
                print(f"Warning: Gemini initialization failed. Will retry on next request.")
            self.mock_mode = True
            self.model = None
            self._initialized = False
            return False
    
    def generate_quiz_questions(self, content: str, num_questions: int) -> str:
        """
        Generate quiz questions from educational content.
        
        Args:
            content: Educational text/content
            num_questions: Number of questions to generate
            
        Returns:
            JSON string with quiz questions
        """
        # If not initialized or in mock mode, try to initialize (recovery from previous failures)
        if not self._initialized or self.model is None:
            if self.api_key and genai:
                # Retry initialization - connection might be stable now
                if self._try_initialize():
                    print("Info: Successfully reconnected to Gemini API.")
                else:
                    # Still can't connect, use mock mode
                    return self._mock_quiz_generation(content, num_questions)
            else:
                # No API key or library not available, use mock
                return self._mock_quiz_generation(content, num_questions)
        
        prompt = f"""
Generate {num_questions} multiple-choice quiz questions based on the following content.

Content:
{content}

Requirements:
- Each question should have exactly 4 options (A, B, C, D)
- One correct answer per question
- Questions should test understanding, not just recall
- Return ONLY valid JSON array (no markdown, no explanation)

Format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A"
  }}
]

Generate exactly {num_questions} questions. Return JSON only.
"""
        
        try:
            response = self.model.generate_content(prompt)
            if response and hasattr(response, 'text'):
                return response.text.strip()
            else:
                # Invalid response format
                print("Warning: Invalid response from Gemini API. Using mock mode.")
                return self._mock_quiz_generation(content, num_questions)
        except Exception as e:
            # Catch all API errors (connection, authentication, rate limit, etc.)
            error_msg = str(e)
            
            # Check if it's a connection error - mark as not initialized so we retry next time
            if "Request ID" in error_msg or "connection" in error_msg.lower() or "network" in error_msg.lower():
                print("Warning: Gemini API connection error. Will retry on next request. Using mock mode for now.")
                self._initialized = False
                self.model = None
            else:
                # Other errors (auth, rate limit, etc.) - log but don't disable permanently
                print(f"Warning: Gemini API error ({type(e).__name__}). Using mock mode for this request.")
            
            # Fallback to mock for this request, but keep trying real API next time
            return self._mock_quiz_generation(content, num_questions)
    
    def _mock_quiz_generation(self, content: str, num_questions: int) -> str:
        """
        Mock quiz generation for MVP/testing.
        Generates simple questions based on content length.
        """
        import json
        
        # Simple mock: create generic questions
        questions = []
        for i in range(num_questions):
            questions.append({
                "question": f"Based on the content, which statement is most accurate? (Question {i+1})",
                "options": [
                    "Option A is correct",
                    "Option B is correct",
                    "Option C is correct",
                    "Option D is correct"
                ],
                "correct_answer": "Option A is correct"
            })
        
        return json.dumps(questions)
