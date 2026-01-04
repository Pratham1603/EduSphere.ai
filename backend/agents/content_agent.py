"""
Content Agent - Extracts key academic concepts from chapter notes

This agent uses Gemini service to identify important topics
and prepare structured data for the Quiz Agent.
"""
import json
from typing import Dict, List, Optional
from services.gemini_service import GeminiService


class ContentOutput:
    """Output structure for Content Agent"""
    def __init__(self, key_topics: List[str], summary: str):
        self.key_topics = key_topics
        self.summary = summary
    
    def model_dump(self) -> Dict:
        return {
            "key_topics": self.key_topics,
            "summary": self.summary
        }


def extract_content(
    subject: str,
    chapter: str,
    notes: Optional[str],
    gemini_service: GeminiService
) -> ContentOutput:
    """
    Extract key academic concepts from chapter notes.
    
    Args:
        subject: Subject name (e.g., "Physics")
        chapter: Chapter name/number (e.g., "Chapter 5")
        notes: Raw notes text (or None for mock notes)
        gemini_service: GeminiService instance
        
    Returns:
        ContentOutput with key_topics and summary
    """
    # If no notes provided, use mock notes for demo
    if not notes or len(notes.strip()) < 20:
        notes = _generate_mock_notes(subject, chapter)
    
    # Build prompt for Gemini
    prompt = f"""You are an academic content analyzer for education.

Analyze the following {subject} notes from {chapter} and extract:
1. The most important key topics (3-7 topics)
2. A brief academic summary (1-2 sentences)

NOTES:
{notes}

Respond with ONLY valid JSON in this exact format (no markdown, no explanation):
{{
    "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
    "summary": "Brief academic summary of the chapter content."
}}

Rules:
- Extract only the most important concepts
- Use academic tone
- Keep summary under 50 words
- JSON only, no extra text"""

    try:
        # Call Gemini
        response = gemini_service.generate_content(prompt)
        
        # Clean response
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        # Parse JSON
        data = json.loads(response)
        
        key_topics = data.get("key_topics", [])
        summary = data.get("summary", "")
        
        # Validate
        if not key_topics:
            key_topics = _fallback_topics(subject, chapter)
        if not summary:
            summary = f"Key concepts from {subject} - {chapter}"
        
        return ContentOutput(key_topics=key_topics, summary=summary)
        
    except (json.JSONDecodeError, Exception) as e:
        print(f"Content Agent error: {e}")
        # Return fallback
        return ContentOutput(
            key_topics=_fallback_topics(subject, chapter),
            summary=f"Academic concepts from {subject} - {chapter}"
        )


def _generate_mock_notes(subject: str, chapter: str) -> str:
    """Generate mock notes for demo purposes."""
    mock_notes = {
        "Physics": {
            "default": """
            Electric Charges and Fields
            
            Electric charge is a fundamental property of matter. There are two types: 
            positive and negative. Like charges repel, unlike charges attract.
            
            Coulomb's Law describes the force between two point charges:
            F = k * q1 * q2 / r²
            
            Electric field (E) is the force per unit charge at any point in space.
            Field lines originate from positive charges and terminate at negative charges.
            
            Gauss's Law relates electric flux through a closed surface to enclosed charge.
            Applications include electrostatic shielding and capacitors.
            """,
        },
        "Chemistry": {
            "default": """
            Periodic Table and Chemical Bonding
            
            The periodic table organizes elements by atomic number and properties.
            Periods are horizontal rows; groups are vertical columns.
            
            Chemical bonds form when atoms share or transfer electrons:
            - Ionic bonds: electron transfer between metals and non-metals
            - Covalent bonds: electron sharing between non-metals
            - Metallic bonds: electron sea model in metals
            
            Electronegativity determines bond polarity.
            VSEPR theory predicts molecular geometry.
            """,
        },
        "Biology": {
            "default": """
            Cell Structure and Function
            
            Cells are the basic unit of life. Two main types:
            - Prokaryotic: no membrane-bound nucleus (bacteria)
            - Eukaryotic: membrane-bound nucleus (plants, animals)
            
            Key organelles:
            - Nucleus: contains DNA, controls cell activities
            - Mitochondria: powerhouse, produces ATP
            - Ribosomes: protein synthesis
            - Endoplasmic reticulum: protein and lipid processing
            
            Cell membrane is a phospholipid bilayer with selective permeability.
            """,
        },
        "Mathematics": {
            "default": """
            Calculus: Differentiation and Integration
            
            Differentiation finds the rate of change of a function.
            The derivative of f(x) is written as f'(x) or df/dx.
            
            Key rules:
            - Power rule: d/dx(x^n) = nx^(n-1)
            - Product rule: d/dx(uv) = u'v + uv'
            - Chain rule: d/dx(f(g(x))) = f'(g(x)) * g'(x)
            
            Integration is the reverse of differentiation.
            Definite integrals calculate area under curves.
            """,
        },
    }
    
    subject_notes = mock_notes.get(subject, mock_notes.get("Physics"))
    return subject_notes.get(chapter, subject_notes.get("default", ""))


def _fallback_topics(subject: str, chapter: str) -> List[str]:
    """Return fallback topics when extraction fails."""
    fallbacks = {
        "Physics": ["Electric Field", "Coulomb's Law", "Electrostatics", "Gauss's Law"],
        "Chemistry": ["Periodic Table", "Chemical Bonding", "Electronegativity"],
        "Biology": ["Cell Structure", "Organelles", "Cell Membrane"],
        "Mathematics": ["Differentiation", "Integration", "Calculus Rules"],
    }
    return fallbacks.get(subject, ["Key Concept 1", "Key Concept 2", "Key Concept 3"])
