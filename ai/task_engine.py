"""
=============================================================================
task_engine.py - Modular Task Engine (Central Hackathon Extension Point)
=============================================================================
THIS IS THE PRIMARY FILE YOU WILL MODIFY WHEN THE HACKATHON STATEMENT DROPS!

WHY THIS FILE EXISTS:
During a 36-hour hackathon, you don't want to waste hours restructuring your
web server or rewiring the frontend. 

Instead, whatever educational challenge is assigned tomorrow
(e.g., document summarization, automated quiz creator, visual diagram explainer,
essay grader, personalized curriculum planner), you simply register a specialized
handler inside this engine without changing API routes or React components.

HOW TO EXTEND TOMORROW:
1. Define a function below: `def my_problem_solution(payload: dict) -> dict:`
2. Decorate it with `@task_dispatcher.register("my_task_name")`
3. Call it from frontend or API with `POST /api/ai/task` { "task_type": "my_task_name", "payload": {...} }
=============================================================================
"""

from typing import Dict, Any, Optional, Callable, List
from .ai_service import generate_text, analyze_image


class TaskDispatcher:
    """
    Generic task registry and dispatcher for plug-and-play AI workflows.
    Allows registering tasks dynamically so tomorrow's problem statement
    can be hooked in with zero architectural rework.
    """

    def __init__(self):
        self._registry: Dict[str, Callable[[Dict[str, Any]], Dict[str, Any]]] = {}
        self._descriptions: Dict[str, str] = {}

    def register(self, task_name: str, description: str = ""):
        """
        Decorator to register a task handler.
        """
        def decorator(fn: Callable[[Dict[str, Any]], Dict[str, Any]]):
            self._registry[task_name.lower().strip()] = fn
            self._descriptions[task_name.lower().strip()] = description or (fn.__doc__ or "").strip().split("\n")[0]
            return fn
        return decorator

    def register_handler(self, task_name: str, fn: Callable[[Dict[str, Any]], Dict[str, Any]], description: str = ""):
        """
        Explicit registration without decorator.
        """
        self._registry[task_name.lower().strip()] = fn
        self._descriptions[task_name.lower().strip()] = description or (fn.__doc__ or "").strip().split("\n")[0]

    def list_tasks(self) -> List[Dict[str, str]]:
        """
        Returns all registered tasks and their descriptions.
        """
        return [
            {"task_type": name, "description": desc}
            for name, desc in self._descriptions.items()
        ]

    def dispatch(self, task_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dispatches a task to its registered handler.
        """
        key = (task_type or "").lower().strip()
        if key not in self._registry:
            valid_tasks = ", ".join(sorted(self._registry.keys()))
            raise ValueError(
                f"Unknown task type '{task_type}'. Registered tasks: {valid_tasks}"
            )
        return self._registry[key](payload)


# Global dispatcher instance
task_dispatcher = TaskDispatcher()


# =============================================================================
# Core Modular Task Interfaces (Ready for Tomorrow's Problem Statement)
# =============================================================================

@task_dispatcher.register("analyze_document", description="Analyzes educational document text against instructions")
def task_analyze_document(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hook for document analysis, summarization, or synthesis.
    """
    document_text = payload.get("document_text") or payload.get("text") or payload.get("context", "")
    instruction = payload.get("instruction") or payload.get("prompt", "Analyze this educational document and highlight key takeaways.")

    if not document_text.strip():
        raise ValueError("Document text cannot be empty.")

    system_instruction = (
        "You are an expert educational research assistant. Analyze the provided "
        "document text thoroughly, accurately, and clearly based on the user's instructions."
    )
    prompt = f"Instruction: {instruction}\n\nDocument Text:\n{document_text}"

    analysis = generate_text(prompt=prompt, system_instruction=system_instruction)
    return {
        "task": "analyze_document",
        "analysis": analysis,
        "status": "completed",
    }


@task_dispatcher.register("analyze_image", description="Multimodal visual analysis of diagrams, charts, or worksheets")
def task_analyze_image(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hook for visual learning, diagram explanation, or handwriting inspection.
    """
    image_bytes = payload.get("image_bytes")
    mime_type = payload.get("mime_type", "image/png")
    instruction = payload.get("instruction") or payload.get("prompt", "Analyze this educational image and explain its components.")

    if not image_bytes:
        raise ValueError("Image bytes are required for visual analysis task.")

    analysis = analyze_image(
        image_bytes=image_bytes,
        mime_type=mime_type,
        prompt=instruction,
    )
    return {
        "task": "analyze_image",
        "analysis": analysis,
        "status": "completed",
    }


@task_dispatcher.register("generate_questions", description="Generates formative or summative assessment questions")
def task_generate_questions(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hook for generating quizzes, diagnostic questions, or flashcards.
    """
    content = payload.get("content") or payload.get("topic") or payload.get("user_input", "")
    count = payload.get("count", 3)
    question_type = payload.get("question_type", "multiple-choice")

    if not content.strip():
        raise ValueError("Topic or content is required to generate questions.")

    system_instruction = (
        f"You are an expert curriculum designer. Generate {count} high-quality {question_type} "
        "assessment questions based on the provided material. Include the questions, "
        "options/rubric, and clear answer keys with explanations."
    )
    prompt = f"Generate {count} {question_type} questions on:\n{content}"

    result = generate_text(prompt=prompt, system_instruction=system_instruction)
    return {
        "task": "generate_questions",
        "count": count,
        "question_type": question_type,
        "questions": result,
        "status": "completed",
    }


@task_dispatcher.register("evaluate_answer", description="Evaluates student response against a rubric or question")
def task_evaluate_answer(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hook for automated grading, feedback generation, or misconception detection.
    """
    question = payload.get("question", "")
    student_answer = payload.get("student_answer") or payload.get("answer", "")
    rubric = payload.get("rubric", "Standard accuracy, clarity, and completeness rubric.")

    if not question.strip() or not student_answer.strip():
        raise ValueError("Both 'question' and 'student_answer' are required.")

    system_instruction = (
        "You are an encouraging, precise educational evaluator. Evaluate the student's answer "
        "against the question and rubric. Provide:\n"
        "1. Estimated Score / Performance Level\n"
        "2. Strengths\n"
        "3. Misconceptions or Areas for Improvement\n"
        "4. Constructive Suggestion"
    )
    prompt = f"Question: {question}\nRubric: {rubric}\nStudent Answer: {student_answer}"

    evaluation = generate_text(prompt=prompt, system_instruction=system_instruction)
    return {
        "task": "evaluate_answer",
        "evaluation": evaluation,
        "status": "completed",
    }


@task_dispatcher.register("generate_learning_plan", description="Generates a structured multi-day study/lesson plan")
def task_generate_learning_plan(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hook for personalized learning pathways, revision timetables, or lesson plans.
    """
    subject = payload.get("subject") or payload.get("topic") or payload.get("user_input", "")
    target_level = payload.get("target_level", "Beginner to Intermediate")
    duration_days = payload.get("duration_days", 7)

    if not subject.strip():
        raise ValueError("Subject or topic is required to generate a learning plan.")

    system_instruction = (
        "You are a master pedagogy advisor. Create an engaging, structured step-by-step learning plan "
        "divided into daily milestones, core objectives, practice activities, and self-checks."
    )
    prompt = f"Create a {duration_days}-day learning roadmap for '{subject}' for a {target_level} learner."

    plan = generate_text(prompt=prompt, system_instruction=system_instruction)
    return {
        "task": "generate_learning_plan",
        "subject": subject,
        "duration_days": duration_days,
        "learning_plan": plan,
        "status": "completed",
    }


# =============================================================================
# Starter Education Tasks (Preserving Existing Functionality)
# =============================================================================

@task_dispatcher.register("explain", description="Explains concepts with analogies and examples")
def explain_concept_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    concept = payload.get("concept") or payload.get("user_input", "")
    context = payload.get("context")
    return explain_concept(concept=concept, context=context)


@task_dispatcher.register("quiz", description="Creates 3 multiple choice questions on a topic")
def quiz_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    topic = payload.get("topic") or payload.get("user_input", "")
    return generate_quick_quiz(topic=topic)


@task_dispatcher.register("summarize", description="Summarizes study materials into structured notes")
def summarize_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    content = payload.get("content") or payload.get("user_input", "")
    return summarize_educational_content(content=content)


def explain_concept(concept: str, context: Optional[str] = None) -> Dict[str, Any]:
    """
    Explains an educational concept simply with examples and analogies.
    """
    if not concept.strip():
        raise ValueError("Concept cannot be empty.")

    system_prompt = (
        "You are an encouraging, expert educational tutor. "
        "Explain the requested topic clearly, using an intuitive real-world analogy, "
        "bullet points for key takeaways, and a quick check-for-understanding question at the end."
    )
    prompt = f"Please explain this concept: {concept}"
    if context:
        prompt += f"\n\nReference Material:\n{context}"

    explanation = generate_text(
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
    if not topic.strip():
        raise ValueError("Topic cannot be empty.")

    system_prompt = (
        "You are an educational assessment creator. "
        "Create 3 multiple-choice questions testing understanding of the topic. "
        "For each question, provide 4 options (A, B, C, D) and specify the correct answer "
        "with a short explanation."
    )
    prompt = f"Generate a 3-question quiz on: {topic}"

    quiz_content = generate_text(
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
    if not content.strip():
        raise ValueError("Content cannot be empty.")

    system_prompt = (
        "You are a study notes assistant. Summarize the provided text into: "
        "1. Big Idea (1-2 sentences), "
        "2. Core Concepts (bulleted), "
        "3. Key Vocabulary terms and definitions."
    )
    summary = generate_text(
        prompt=f"Summarize these study materials:\n\n{content}",
        system_instruction=system_prompt,
        temperature=0.3
    )

    return {
        "task": "summarize",
        "summary": summary,
        "status": "completed"
    }


def execute_task(
    task_type: str,
    user_input: Optional[str] = None,
    context: Optional[str] = None,
    payload: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Main dispatch function for educational tasks.
    Supports both legacy arguments (task_type, user_input, context)
    and modern structured dictionary payloads.

    Parameters:
        task_type (str): Type of task to perform.
        user_input (str, optional): Legacy text input.
        context (str, optional): Additional text/document context.
        payload (dict, optional): Structured dictionary payload.

    Returns:
        Dict[str, Any]: Structured output ready for the frontend.
    """
    merged_payload: Dict[str, Any] = {}
    if payload:
        merged_payload.update(payload)

    if user_input is not None and "user_input" not in merged_payload:
        merged_payload["user_input"] = user_input
    if context is not None and "context" not in merged_payload:
        merged_payload["context"] = context

    # If payload didn't provide specific keys, alias user_input to common names
    if "user_input" in merged_payload:
        val = merged_payload["user_input"]
        merged_payload.setdefault("concept", val)
        merged_payload.setdefault("topic", val)
        merged_payload.setdefault("content", val)
        merged_payload.setdefault("subject", val)
        merged_payload.setdefault("prompt", val)
        merged_payload.setdefault("document_text", val)

    return task_dispatcher.dispatch(task_type, merged_payload)
