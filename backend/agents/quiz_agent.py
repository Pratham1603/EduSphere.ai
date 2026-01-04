"""
Quiz Agent - Generates structured quiz questions from educational content

This agent uses Gemini service for content generation.
It does NOT call Google APIs directly.
"""
import json
from typing import List
from schemas.models import QuizQuestion, QuizOutput
from services.gemini_service import GeminiService


def generate_quiz(content: str, num_questions: int, gemini_service: GeminiService) -> QuizOutput:
    """
    Generate quiz questions from educational content.
    
    Args:
        content: Educational text/content (from Classroom, Docs, or manual input)
        num_questions: Number of questions to generate
        gemini_service: GeminiService instance for text generation
        
    Returns:
        QuizOutput with structured questions
    """
    # Ensure num_questions is reasonable
    if num_questions is None or num_questions <= 0:
        num_questions = 5  # Default
    
    if num_questions > 50:
        num_questions = 50  # Cap at 50
    
    # Call Gemini service to generate questions
    quiz_json_str = gemini_service.generate_quiz_questions(content, num_questions)
    
    # Parse JSON response
    try:
        # Clean response (remove markdown code blocks if present)
        quiz_json_str = quiz_json_str.strip()
        if quiz_json_str.startswith("```json"):
            quiz_json_str = quiz_json_str[7:]
        if quiz_json_str.startswith("```"):
            quiz_json_str = quiz_json_str[3:]
        if quiz_json_str.endswith("```"):
            quiz_json_str = quiz_json_str[:-3]
        quiz_json_str = quiz_json_str.strip()
        
        quiz_data = json.loads(quiz_json_str)
        
        # Convert to QuizQuestion objects
        questions = []
        for item in quiz_data:
            # Validate structure
            if "question" in item and "options" in item and "correct_answer" in item:
                # Ensure 4 options
                options = item["options"]
                if len(options) != 4:
                    # Pad or trim to 4
                    while len(options) < 4:
                        options.append(f"Option {chr(68 + len(options) - 3)}")
                    options = options[:4]
                
                questions.append(QuizQuestion(
                    question=item["question"],
                    options=options,
                    correct_answer=item["correct_answer"]
                ))
        
        # Ensure we have the requested number
        while len(questions) < num_questions:
            questions.append(QuizQuestion(
                question=f"Additional question {len(questions) + 1}?",
                options=["Option A", "Option B", "Option C", "Option D"],
                correct_answer="Option A"
            ))
        
        questions = questions[:num_questions]
        
        return QuizOutput(questions=questions)
        
    except json.JSONDecodeError as e:
        print(f"Error parsing quiz JSON: {e}")
        print(f"Raw response: {quiz_json_str[:200]}")
        # Return mock questions as fallback
        return _generate_fallback_quiz(num_questions)


def _generate_fallback_quiz(num_questions: int) -> QuizOutput:
    """Generate fallback quiz if parsing fails"""
    questions = []
    for i in range(num_questions):
        questions.append(QuizQuestion(
            question=f"Sample question {i+1}?",
            options=["Option A", "Option B", "Option C", "Option D"],
            correct_answer="Option A"
        ))
    return QuizOutput(questions=questions)
