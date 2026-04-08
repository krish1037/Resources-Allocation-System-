import os
import json
from typing import List
import vertexai
from vertexai.generative_models import GenerativeModel
from app.models.need import NeedRecord
from app.models.volunteer import Volunteer

project_id = os.getenv("GCP_PROJECT_ID")
if project_id:
    vertexai.init(project=project_id, location="us-central1")
model = GenerativeModel("gemini-1.5-pro")

async def structure_need_from_text(raw_text: str) -> dict:
    prompt = f"""
You are parsing a community field report. Extract structured data from this text and return ONLY valid JSON, no explanation:
TEXT: {raw_text}
Return JSON with exactly these keys:
  need_type: one of [food, medical, shelter, water, education, other]
  location_description: string (address or area name mentioned)
  urgency_score: integer 1-5 (5=life threatening, 1=minor)
  affected_count: integer (estimated number of people affected)
  description: string (1-2 sentence summary)
If a field cannot be determined, use a sensible default.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)

async def score_need_cluster(needs: list) -> float:
    """
    Takes a list of need dicts (same type), returns a float 0.0-10.0
    representing how urgently that cluster needs attention.
    Higher score = more urgent cluster.
    """
    if not needs:
        return 0.0

    sample = needs[:10]
    prompt = f"""
You are a humanitarian aid coordinator. Analyse this cluster of {len(sample)} similar community needs
and return ONLY a single float number between 0.0 and 10.0 representing overall cluster urgency.
10.0 = life-threatening mass emergency. 0.0 = minor inconvenience.
Consider: number of people affected, urgency scores, and description severity.
Return ONLY the number. No explanation. No units. Just the float.

Needs cluster:
{json.dumps(sample, default=str, indent=2)}
"""
    try:
        response = model.generate_content(prompt)
        return min(10.0, max(0.0, float(response.text.strip())))
    except (ValueError, AttributeError):
        avg_urgency = sum(n.get('urgency_score', 3) for n in needs) / len(needs)
        return round(avg_urgency * 2, 1)


async def generate_task_briefing(need, volunteer) -> str:
    """
    Generates a 3-sentence task briefing for the matched volunteer.
    need: NeedRecord, volunteer: Volunteer
    """
    prompt = f"""
Write a clear, friendly 3-sentence task briefing for a volunteer. Use second person ("You").
Sentence 1: What the need is and how urgent it is.
Sentence 2: Where to go — be specific about the location.
Sentence 3: What to do when you get there, using the volunteer's skills.

Need type: {need.need_type}
Location: {need.location_description}
Description: {need.description}
Urgency: {need.urgency_score}/5
People affected: {need.affected_count}
Volunteer skills: {', '.join(volunteer.skills)}

Return ONLY the 3-sentence briefing. No preamble, no sign-off.
"""
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return (
            f"You have been assigned a {need.need_type} relief task rated {need.urgency_score}/5 urgency. "
            f"Please go to {need.location_description} as soon as possible. "
            f"Use your {', '.join(volunteer.skills[:2])} skills to assist the {need.affected_count} people affected."
        )
