"""
Authentication utilities for Google OAuth2

For MVP: Simplified authentication handling
For Production: Full OAuth2 flow implementation
"""
from typing import Optional, Dict
import os


def get_google_credentials(token: Optional[str] = None) -> Optional[Dict]:
    """
    Get Google OAuth2 credentials.
    
    For MVP: Returns mock credentials structure
    For Production: Validates and returns real OAuth2 credentials
    
    Args:
        token: OAuth2 access token from frontend
        
    Returns:
        Credentials dictionary (or None if invalid)
    """
    if token:
        # MVP: Accept any token (mock mode)
        # Production: Validate token with Google OAuth2
        return {
            "token": token,
            "scopes": [
                "https://www.googleapis.com/auth/classroom.readonly",
                "https://www.googleapis.com/auth/forms",
                "https://www.googleapis.com/auth/documents.readonly",
                "https://www.googleapis.com/auth/spreadsheets.readonly",
                "https://www.googleapis.com/auth/calendar"
            ]
        }
    
    # For testing without frontend
    test_token = os.getenv("GOOGLE_TEST_TOKEN")
    if test_token:
        return {"token": test_token}
    
    return None
