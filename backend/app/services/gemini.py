import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


async def structure_need_from_text(raw_text: str) -> dict:
    prompt = f"""
You are parsing a community field report. Extract structured data and return ONLY valid JSON, no explanation, no markdown fences.
TEXT: {raw_text}
Return JSON with exactly these keys:
  need_type: one of [food, medical, shelter, water, education, other]
  location_description: string (address or area name mentioned in the text)
  urgency_score: integer 1-5 (5=life threatening, 1=minor inconvenience)
  affected_count: integer (estimated number of people affected, use 10 if unknown)
  description: string (one clear sentence summarizing the need)
Return ONLY the JSON object. No preamble. No explanation. No markdown.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
    return json.loads(text)


async def score_need_cluster(needs: list) -> float:
    if not needs:
        return 0.0
    sample = needs[:10]
    prompt = f"""
You are a humanitarian coordinator. Analyse this cluster of community needs.
Return ONLY a single float between 0.0 and 10.0 representing urgency (10=critical emergency, 0=minor).
Consider: number of people affected, urgency scores, severity of descriptions.
Return ONLY the number. Nothing else.

Cluster:
{json.dumps(sample, default=str)}
"""
    try:
        response = model.generate_content(prompt)
        return min(10.0, max(0.0, float(response.text.strip())))
    except (ValueError, AttributeError):
        avg = sum(n.get("urgency_score", 3) for n in needs) / len(needs)
        return round(avg * 2, 1)


async def generate_task_briefing(need, volunteer) -> str:
    prompt = f"""
Write a clear 3-sentence task briefing for a volunteer. Use second person.
Sentence 1: What the need is and how urgent.
Sentence 2: Exactly where to go.
Sentence 3: What to do using their specific skills.

Need type: {need.need_type}
Location: {need.location_description}
Description: {need.description}
Urgency: {need.urgency_score}/5
People affected: {need.affected_count}
Volunteer skills: {", ".join(volunteer.skills)}

Return ONLY the 3-sentence briefing. No greeting. No sign-off.
"""
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return (
            f"You have been assigned a {need.need_type} relief task rated "
            f"{need.urgency_score}/5 urgency. Please go to {need.location_description} "
            f"as soon as possible. Use your {', '.join(volunteer.skills[:2])} skills "
            f"to help the {need.affected_count} people affected."
        )
