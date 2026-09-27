"""
=============================================================================
task_engine.py - Modular Task Engine (Tomorrow's Problem-Specific Hook)
=============================================================================
THIS IS THE PRIMARY FILE YOU WILL MODIFY WHEN THE HACKATHON STATEMENT DROPS!

WHY THIS FILE EXISTS:
During a 36-hour hackathon, you don't want to waste hours restructuring your
web server or rewiring the frontend. 

Instead, whatever educational challenge is assigned tomorrow
(e.g., automated quiz creator, essay grader, personalized math tutor,
curriculum summarizer), you simply create a specialized prompt or pipeline
function inside this file.

HOW TO USE IT:
1. Define a function below tailored to the problem statement.
2. Formulate your prompt template.
3. Call `generate_gemini_response()` from `ai.ai_service`.
4. Return clean, structured results to your backend router.
=============================================================================
"""

from typing import Dict, Any, Optional
from .ai_service import generate_gemini_response


def execute_task(
    task_type: str,
    user_input: str,
    context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main dispatch function for educational tasks.

    Parameters:
        task_type (str): Type of task to perform (e.g., 'explain', 'quiz', 'summarize').
        user_input (str): The primary input from the student/teacher.
        context (str, optional): Additional text/document context if available.

    Returns:
        Dict[str, Any]: Structured output ready to send back to the frontend.
    """
    if task_type == "explain":
        return explain_concept(concept=user_input, context=context)
    elif task_type == "quiz":
        return generate_quick_quiz(topic=user_input)
    elif task_type == "summarize":
        return summarize_educational_content(content=user_input)
    else:
        # Fallback / Generic prompt handler
        response_text = generate_gemini_response(prompt=user_input)
        return {
            "task": task_type,
            "result": response_text,
            "status": "completed"
        }


# =============================================================================
# Starter Education Tasks (Templates you can adapt tomorrow!)
# =============================================================================

def explain_concept(concept: str, context: Optional[str] = None) -> Dict[str, Any]:
    """
    Explains an educational concept simply with examples and analogies.
    """
    system_prompt = (
        "You are an encouraging, expert educational tutor. "
        "Explain the requested topic clearly, using an intuitive real-world analogy, "
        "bullet points for key takeaways, and a quick check-for-understanding question at the end."
    )
    
    prompt = f"Please explain this concept: {concept}"
    if context:
        prompt += f"\n\nReference Material:\n{context}"

    explanation = generate_gemini_response(
        prompt=prompt,
        system_instruction=system_prompt,
        temperature=0.5
    )

    return {
        "task": "explain",
        "concept": concept,
        "explanation": explanation,
        "status": "completed"
    }


def generate_quick_quiz(topic: str) -> Dict[str, Any]:
    """
    Generates a 3-question formative assessment quiz on a topic.
    """
    system_prompt = (
        "You are an educational assessment creator. "
        "Create 3 multiple-choice questions testing understanding of the topic. "
        "For each question, provide 4 options (A, B, C, D) and specify the correct answer "
        "with a short explanation."
    )

    prompt = f"Generate a 3-question quiz on: {topic}"

    quiz_content = generate_gemini_response(
        prompt=prompt,
        system_instruction=system_prompt,
        temperature=0.6
    )

    return {
        "task": "quiz",
        "topic": topic,
        "quiz": quiz_content,
        "status": "completed"
    }


def summarize_educational_content(content: str) -> Dict[str, Any]:
    """
    Summarizes long educational text into key study notes.
    """
    system_prompt = (
        "You are a study notes assistant. Summarize the provided text into: "
        "1. Big Idea (1-2 sentences), "
        "2. Core Concepts (bulleted), "
        "3. Key Vocabulary terms and definitions."
    )

    summary = generate_gemini_response(
        prompt=f"Summarize these study materials:\n\n{content}",
        system_instruction=system_prompt,
        temperature=0.3
    )

    return {
        "task": "summarize",
        "summary": summary,
        "status": "completed"
    }
