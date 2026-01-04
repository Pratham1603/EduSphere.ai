"""
Analytics Agent - Analyzes quiz results and provides insights

This agent processes quiz results data and generates analytics.
"""
from typing import List, Dict


def analyze_quiz_results(results: List[Dict]) -> Dict:
    """
    Analyze quiz results and provide insights.
    
    Args:
        results: List of student results with score/total fields
        
    Returns:
        Analytics with weak topics, suggestions, statistics
    """
    # MVP: Basic analytics
    # Future: Advanced ML-based analysis
    
    if not results:
        return {
            "error": "No results to analyze"
        }
    
    # Calculate statistics
    scores = [r.get("score", 0) for r in results]
    total_questions = results[0].get("total", 100) if results else 100
    
    avg_score = sum(scores) / len(scores) if scores else 0
    max_score = max(scores) if scores else 0
    min_score = min(scores) if scores else 0
    
    # Determine performance level
    performance_level = "excellent" if avg_score >= 90 else \
                       "good" if avg_score >= 75 else \
                       "fair" if avg_score >= 60 else "needs_improvement"
    
    # Mock weak topics (would be calculated from actual question analysis)
    weak_topics = [
        "Topic A needs more practice",
        "Topic B requires additional review"
    ] if avg_score < 80 else []
    
    suggestions = []
    if avg_score < 75:
        suggestions.append("Consider additional practice sessions")
        suggestions.append("Review foundational concepts")
    elif avg_score >= 90:
        suggestions.append("Excellent performance! Consider advanced topics")
    
    return {
        "statistics": {
            "average_score": round(avg_score, 2),
            "max_score": max_score,
            "min_score": min_score,
            "total_students": len(results),
            "total_questions": total_questions
        },
        "performance_level": performance_level,
        "weak_topics": weak_topics,
        "suggestions": suggestions
    }
