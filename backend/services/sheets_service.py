"""
Google Sheets Service - MOCK VERSION

This service handles Google Sheets API interactions.
For MVP: Returns mocked data.
For Production: Replace with real Google Sheets API calls.
"""
from typing import List, Dict


class SheetsService:
    """Service for Google Sheets API interactions"""
    
    def __init__(self, credentials: Dict = None):
        """
        Initialize Sheets service.
        
        Args:
            credentials: OAuth2 credentials (for real API)
        """
        self.credentials = credentials
        self.mock_mode = True  # MVP: Always mock
    
    def get_quiz_results(self, spreadsheet_id: str, sheet_name: str = "Form Responses 1") -> List[Dict]:
        """
        Fetch quiz results from Google Sheets.
        
        Args:
            spreadsheet_id: Google Sheets spreadsheet ID
            sheet_name: Sheet name (default: Form Responses)
            
        Returns:
            List of student results
        """
        # MOCK: Return sample results
        return [
            {"student": "Student 1", "score": 85, "total": 100},
            {"student": "Student 2", "score": 92, "total": 100},
            {"student": "Student 3", "score": 78, "total": 100},
            {"student": "Student 4", "score": 88, "total": 100},
        ]
        
        # REAL API would:
        # 1. Use Google Sheets API to read data
        # 2. Parse student responses
        # 3. Calculate scores
        # 4. Return structured results
