"""
Classroom Agent - Handles delivery of quiz content (Demo/Mock Mode)

This agent simulates assignment to Google Classroom.
In production, it would use real Google Classroom API.
"""
import json
from typing import Dict, List, Optional
from datetime import datetime


class DeliveryOutput:
    """Output structure for Classroom Agent delivery"""
    def __init__(
        self,
        delivery_status: str,
        platform: str,
        mode: str,
        message: str,
        assignment_id: Optional[str] = None,
        classroom_url: Optional[str] = None
    ):
        self.delivery_status = delivery_status
        self.platform = platform
        self.mode = mode
        self.message = message
        self.assignment_id = assignment_id
        self.classroom_url = classroom_url
    
    def model_dump(self) -> Dict:
        return {
            "delivery_status": self.delivery_status,
            "platform": self.platform,
            "mode": self.mode,
            "message": self.message,
            "assignment_id": self.assignment_id,
            "classroom_url": self.classroom_url
        }


def assign_to_classroom(
    quiz_title: str,
    questions: List[Dict],
    form_url: Optional[str] = None,
    class_name: str = "Demo Class",
    due_date: Optional[str] = None
) -> DeliveryOutput:
    """
    Assign quiz to Google Classroom (Demo Mode).
    
    Args:
        quiz_title: Title of the quiz
        questions: List of quiz questions
        form_url: Optional Google Form URL
        class_name: Target classroom name
        due_date: Optional due date string
        
    Returns:
        DeliveryOutput with assignment details
    """
    # Generate mock assignment ID
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    assignment_id = f"demo_assignment_{timestamp}"
    
    # Generate mock classroom URL
    classroom_url = f"https://classroom.google.com/c/demo_{timestamp}/a/{assignment_id}"
    
    # Build success message
    question_count = len(questions) if questions else 0
    
    if form_url:
        message = f"Quiz '{quiz_title}' with {question_count} questions successfully assigned to {class_name} (Demo Mode). Form URL attached."
    else:
        message = f"Quiz '{quiz_title}' with {question_count} questions successfully assigned to {class_name} (Demo Mode)."
    
    return DeliveryOutput(
        delivery_status="assigned",
        platform="Google Classroom",
        mode="demo",
        message=message,
        assignment_id=assignment_id,
        classroom_url=classroom_url
    )


def get_classroom_status() -> Dict:
    """
    Get current Classroom integration status.
    
    Returns:
        Status dict with integration details
    """
    return {
        "connected": False,
        "mode": "demo",
        "available_classes": [
            {"id": "demo_class_1", "name": "Physics 101", "students": 25},
            {"id": "demo_class_2", "name": "Chemistry 201", "students": 30},
            {"id": "demo_class_3", "name": "Biology 101", "students": 22},
        ],
        "message": "Running in Demo Mode. Connect Google Classroom for live integration."
    }


def simulate_notification(
    assignment_id: str,
    class_name: str,
    student_count: int = 25
) -> Dict:
    """
    Simulate sending notifications to students (Demo Mode).
    
    Args:
        assignment_id: The assignment ID
        class_name: Target classroom name
        student_count: Number of students to notify
        
    Returns:
        Notification status dict
    """
    return {
        "notification_sent": True,
        "mode": "demo",
        "recipients": student_count,
        "class_name": class_name,
        "assignment_id": assignment_id,
        "message": f"Notification simulated for {student_count} students in {class_name} (Demo Mode)"
    }


# ─────────────────────────────────────────────────────────────────────────────
# Future: Real Google Classroom Integration
# ─────────────────────────────────────────────────────────────────────────────
# 
# When ready to integrate with real Google Classroom API:
# 
# 1. Add OAuth scopes:
#    - https://www.googleapis.com/auth/classroom.courses.readonly
#    - https://www.googleapis.com/auth/classroom.coursework.students
#    - https://www.googleapis.com/auth/classroom.announcements
# 
# 2. Use Google Classroom API:
#    from googleapiclient.discovery import build
#    service = build('classroom', 'v1', credentials=creds)
#    
#    # List courses
#    courses = service.courses().list().execute()
#    
#    # Create coursework
#    coursework = {
#        'title': quiz_title,
#        'materials': [{'link': {'url': form_url}}],
#        'workType': 'ASSIGNMENT',
#        'state': 'PUBLISHED'
#    }
#    service.courses().courseWork().create(courseId=course_id, body=coursework).execute()
# 
# 3. Update this agent to switch between demo and live mode based on auth status
# ─────────────────────────────────────────────────────────────────────────────
