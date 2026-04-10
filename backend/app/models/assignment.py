from pydantic import BaseModel
from typing import Optional, Literal, List
from datetime import datetime
from .need import NeedRecord

class Assignment(BaseModel):
    id: Optional[str] = None
    need_id: str
    volunteer_id: str
    volunteer_name: Optional[str] = None
    match_score: float
    task_briefing: str
    status: Literal["pending", "accepted", "in_progress", "completed"] = "pending"
    created_at: Optional[datetime] = None
    estimated_distance_km: float

class MatchRequest(BaseModel):
    need_id: str

class MatchResponse(BaseModel):
    assignments: List[Assignment]
    need: NeedRecord
