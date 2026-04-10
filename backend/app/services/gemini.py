import os
import json
import time
import random
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL_ID = "llama-3.1-8b-instant"


# ----------------------------------
# CORE CALL WITH RETRY
# ----------------------------------
def _call_with_retry(prompt: str, max_retries: int = 5) -> str:
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=MODEL_ID,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )

            content = response.choices[0].message.content

            if not content:
                raise Exception("Empty response from Groq")

            return content.strip()

        except Exception as e:
            err_str = str(e).lower()

            if "rate" in err_str or "limit" in err_str or "429" in err_str:
                wait = (2 ** attempt) * 5 + random.uniform(0, 3)
                print(f"[Groq] Rate limit → retrying in {wait:.1f}s...")
                time.sleep(wait)
            else:
                print(f"[Groq] Fatal error: {e}")
                raise

    raise Exception("[Groq] Failed after retries")


# ----------------------------------
# SAFE JSON PARSER (IMPORTANT FIX)
# ----------------------------------
def _safe_json_parse(text: str) -> dict:
    try:
        # Remove markdown fences if present
        if text.startswith("```"):
            text = "\n".join(text.split("\n")[1:-1])

        return json.loads(text)

    except Exception:
        # Try extracting JSON manually
        try:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except Exception:
            pass

    raise ValueError("Invalid JSON from LLM")


# ----------------------------------
# 1. TEXT STRUCTURING
# ----------------------------------
async def structure_need_from_text(raw_text: str) -> dict:
    prompt = f"""
Extract structured data from the following report.

TEXT:
{raw_text}

Return ONLY valid JSON (no explanation, no markdown):

{{
  "need_type": "food | medical | shelter | water | education | other",
  "location_description": "string",
  "urgency_score": 1-5,
  "affected_count": number,
  "description": "one sentence summary"
}}
"""

    try:
        text = _call_with_retry(prompt)
        structured = _safe_json_parse(text)
        
        # Validation Fix: Clamp score to 1-5 range to satisfy Pydantic
        if "urgency_score" in structured:
            try:
                raw_score = int(structured["urgency_score"])
                structured["urgency_score"] = max(1, min(5, raw_score))
            except (ValueError, TypeError):
                structured["urgency_score"] = 3
        else:
            structured["urgency_score"] = 3
            
        return structured

    except Exception as e:
        print(f"[Groq] structure fallback → {e}")

        urgency = 5 if any(w in raw_text.lower() for w in ["urgent", "critical", "emergency"]) else 3

        need_type = "food"
        for t in ["medical", "shelter", "water", "education"]:
            if t in raw_text.lower():
                need_type = t
                break

        return {
            "need_type": need_type,
            "location_description": raw_text[:80],
            "urgency_score": urgency,
            "affected_count": 10,
            "description": raw_text[:200],
        }


# ----------------------------------
# 2. CLUSTER SCORING
# ----------------------------------
async def score_need_cluster(needs: list) -> float:
    if not needs:
        return 0.0

    sample = needs[:5]

    prompt = f"""
Rate urgency from 0 to 10.

10 = critical emergency
0 = minor issue

DATA:
{json.dumps(sample, default=str)}

Return ONLY a number.
"""

    try:
        text = _call_with_retry(prompt, max_retries=2)

        match = re.search(r"(\d+(\.\d+)?)", text)
        if match:
            return min(10.0, max(0.0, float(match.group(1))))

        return 5.0

    except Exception as e:
        print(f"[Groq] scoring fallback → {e}")

        avg = sum(n.get("urgency_score", 3) for n in needs) / len(needs)
        return round(avg * 2, 1)


# ----------------------------------
# 3. TASK BRIEFING
# ----------------------------------
async def generate_task_briefing(need, volunteer) -> str:
    prompt = f"""
Write a 3-sentence task briefing for a volunteer.

Need: {need.need_type}
Location: {need.location_description}
Urgency: {need.urgency_score}/5
People affected: {need.affected_count}
Skills: {", ".join(volunteer.skills)}

Rules:
- Sentence 1: Describe need + urgency
- Sentence 2: Where to go
- Sentence 3: What to do

Return ONLY plain text.
"""

    try:
        return _call_with_retry(prompt, max_retries=2)

    except Exception:
        return (
            f"You have been assigned a {need.need_type} task "
            f"({need.urgency_score}/5 urgency). Go to "
            f"{need.location_description} and assist "
            f"{need.affected_count} people using your skills."
        )