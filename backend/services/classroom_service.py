"""
Google Classroom Service - MOCK VERSION

This service handles Google Classroom API interactions.
For MVP: Returns mocked data.
For Production: Replace with real Google Classroom API calls.
"""
from typing import List, Dict, Optional


class ClassroomService:
    """Service for Google Classroom API interactions"""
    
    def __init__(self, credentials: Optional[dict] = None):
        """
        Initialize Classroom service.
        
        Args:
            credentials: OAuth2 credentials (for real API)
        """
        self.credentials = credentials
        self.mock_mode = True  # MVP: Always mock
    
    def get_course_materials(self, course_id: str, topic: Optional[str] = None) -> str:
        """
        Fetch materials/notes from a Google Classroom course.
        
        Args:
            course_id: Google Classroom course ID
            topic: Optional topic/chapter filter
            
        Returns:
            Combined text content from course materials
        """
        # MOCK: Return sample educational content
        if topic:
            return f"""
# {topic} - Educational Content

This is sample educational content for {topic}.

## Key Concepts

1. Fundamental principles apply in this domain
2. Advanced techniques build upon basic understanding
3. Practical applications demonstrate theoretical concepts
4. Critical thinking enhances learning outcomes

## Important Points

- First important concept to understand
- Second concept builds on the first
- Third concept integrates previous knowledge
- Fourth concept requires synthesis of all prior learning

## Applications

Real-world applications include various scenarios where these concepts are utilized effectively.
"""
        else:
            return """
# Sample Educational Content

This is sample content from Google Classroom.

## Introduction

Educational content covers various topics and concepts.

## Main Topics

Topic 1: Fundamental principles
Topic 2: Advanced applications
Topic 3: Real-world examples

## Conclusion

These concepts form the foundation for further learning.
"""
    
    def assign_form_to_classroom(self, course_id: str, form_url: str, title: str) -> Dict:
        """
        Assign a Google Form quiz to a Classroom course.
        
        Args:
            course_id: Google Classroom course ID
            form_url: URL of the created Google Form
            title: Assignment title
            
        Returns:
            Assignment information
        """
        # MOCK: Return assignment info
        return {
            "assignment_id": f"mock_assignment_{course_id}",
            "course_id": course_id,
            "form_url": form_url,
            "title": title,
            "status": "created"
        }
    
    def list_courses(self) -> List[Dict]:
        """List available courses"""
        # MOCK: Return sample courses
        return [
            {"id": "course_1", "name": "Physics 101"},
            {"id": "course_2", "name": "Mathematics 201"},
            {"id": "course_3", "name": "Chemistry 101"}
        ]
