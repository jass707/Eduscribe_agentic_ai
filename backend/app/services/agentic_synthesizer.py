"""
Agentic Note Synthesizer for EduScribe
Combines multiple transcription chunks into structured, coherent notes
"""
import asyncio
from typing import List, Dict, Any, Optional
from app.core.config import settings

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except Exception:
    GROQ_AVAILABLE = False

# Initialize Groq client
groq_client = None
if GROQ_AVAILABLE and settings.GROQ_API_KEY:
    groq_client = Groq(api_key=settings.GROQ_API_KEY)


async def synthesize_structured_notes(
    transcriptions: List[Dict[str, Any]],
    rag_context: List[str],
    lecture_id: str,
    previous_structured_notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Synthesize multiple transcription chunks into structured, coherent notes.
    
    Args:
        transcriptions: List of transcription dicts with 'text', 'timestamp', etc.
        rag_context: Relevant document chunks from FAISS
        lecture_id: Current lecture ID
        previous_structured_notes: Previously generated structured notes
    
    Returns:
        Dict with structured notes and metadata
    """
    # Combine all transcriptions
    full_transcription = "\n".join([t.get("text", "") for t in transcriptions])
    
    if not full_transcription.strip():
        return {
            "success": False,
            "error": "No transcription content to synthesize"
        }
    
    # Run synthesis in executor to avoid blocking
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        _synthesize_sync,
        full_transcription,
        rag_context,
        previous_structured_notes
    )
    
    return {
        "success": True,
        "structured_notes": result,
        "transcription_count": len(transcriptions),
        "lecture_id": lecture_id
    }


def _synthesize_sync(
    full_transcription: str,
    rag_context: List[str],
    previous_notes: Optional[str]
) -> str:
    """Synchronous synthesis function."""
    
    if not groq_client:
        return _fallback_synthesis(full_transcription)
    
    # Build context
    context_text = "\n\n".join(rag_context[:5]) if rag_context else "No additional context available."
    previous_text = previous_notes if previous_notes else "This is the first set of notes for this lecture."
    
    # System prompt for agentic synthesis
    system_prompt = """You are an expert educational note-taker creating structured lecture notes.

Your task:
1. Analyze the lecture transcription carefully
2. Identify main topics, subtopics, and key concepts
3. Create well-organized, hierarchical notes
4. Use clear markdown formatting
5. Include important details and examples
6. Make connections between concepts
7. Avoid redundancy with previous notes

Output format:
- Use ## for main topics
- Use ### for subtopics  
- Use bullet points for key information
- Use **bold** for important terms
- Keep it concise but comprehensive
- Focus on educational value"""

    # User prompt with all context
    user_prompt = f"""Create structured lecture notes from this transcription:

TRANSCRIPTION:
\"\"\"
{full_transcription}
\"\"\"

SUPPORTING CONTEXT FROM DOCUMENTS:
\"\"\"
{context_text}
\"\"\"

PREVIOUS NOTES (avoid repetition):
\"\"\"
{previous_text}
\"\"\"

Generate comprehensive, well-structured notes that capture the key learning points from this lecture segment."""

    try:
        response = groq_client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,  # Slightly creative but mostly factual
            max_tokens=1000,  # Allow for detailed notes
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"Error in agentic synthesis: {e}")
        return _fallback_synthesis(full_transcription)


def _fallback_synthesis(transcription: str) -> str:
    """Simple fallback if Groq is unavailable."""
    # Basic structure extraction
    sentences = transcription.split('.')
    
    notes = "## Lecture Notes\n\n"
    notes += "### Key Points\n\n"
    
    for i, sentence in enumerate(sentences[:10], 1):
        sentence = sentence.strip()
        if sentence:
            notes += f"- {sentence}\n"
    
    return notes


async def detect_topic_shift(
    current_transcription: str,
    previous_transcriptions: List[str]
) -> bool:
    """
    Detect if there's a significant topic shift in the lecture.
    This can trigger early synthesis even before 60 seconds.
    
    Args:
        current_transcription: Latest transcription text
        previous_transcriptions: Previous transcription texts
    
    Returns:
        True if topic shift detected, False otherwise
    """
    # Simple keyword-based detection for now
    # Can be enhanced with embeddings similarity
    
    if not previous_transcriptions:
        return False
    
    # Keywords that indicate topic transitions
    transition_keywords = [
        "now let's move on",
        "next topic",
        "moving on to",
        "let's discuss",
        "now we'll talk about",
        "switching to",
        "another important topic"
    ]
    
    current_lower = current_transcription.lower()
    
    for keyword in transition_keywords:
        if keyword in current_lower:
            return True
    
    return False
