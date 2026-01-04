"""
Google Calendar Service - MOCK VERSION

This service handles Google Calendar API interactions.
For MVP: Returns mocked calendar events.
For Production: Replace with real Google Calendar API calls.
"""
from typing import List, Dict
from datetime import datetime, timedelta


class CalendarService:
    """Service for Google Calendar API interactions"""
    
    def __init__(self, credentials: Dict = None):
        """
        Initialize Calendar service.
        
        Args:
            credentials: OAuth2 credentials (for real API)
        """
        self.credentials = credentials
        self.mock_mode = True  # MVP: Always mock
    
    def create_schedule(self, events: List[Dict]) -> List[Dict]:
        """
        Create calendar events for a schedule.
        
        Args:
            events: List of event dictionaries with:
                - title: Event title
                - start_time: Start datetime
                - end_time: End datetime
                - description: Event description
                
        Returns:
            List of created event information
        """
        # MOCK: Return event info
        created_events = []
        for i, event in enumerate(events):
            created_events.append({
                "event_id": f"mock_event_{i}",
                "title": event.get("title", "Event"),
                "start_time": event.get("start_time"),
                "end_time": event.get("end_time"),
                "status": "created"
            })
        
        return created_events
        
        # REAL API would:
        # 1. Use Google Calendar API to create events
        # 2. Set appropriate times and descriptions
        # 3. Return event IDs and details
