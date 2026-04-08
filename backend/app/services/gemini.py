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

async def score_need_cluster(needs: List[dict]) -> float:
    needs_json = json.dumps(needs[:10])
    prompt = f"""
Given the following cluster of needs:
{needs_json}

Return a single float between 0.0 and 10.0 representing the overall urgency and severity of this cluster of needs. Output ONLY the float number.
"""
    response = model.generate_content(prompt)
    try:
        return float(response.text.strip())
    except ValueError:
        return 0.0

async def generate_task_briefing(need: NeedRecord, volunteer: Volunteer) -> str:
    prompt = f"""
Write a 3-sentence task briefing addressing a volunteer named {volunteer.name} in the second person ("You").
The task entails the following need: {need.description}
Location: {need.location_description}
Skills to use: {', '.join(volunteer.skills)}
"""
    response = model.generate_content(prompt)
    return response.text.strip()
