from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class NeedRecord(BaseModel):
    id: Optional[str] = None
    need_type: Literal["food", "medical", "shelter", "water", "education", "other"]
    location_description: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    urgency_score: int = Field(ge=1, le=5)
    affected_count: int
    description: str
    status: Literal["open", "assigned", "done"] = "open"
    priority_score: Optional[float] = None
    created_at: Optional[datetime] = None
    source: Literal["image", "text", "form"] = "form"

class NeedInput(BaseModel):
    need_type: Literal["food", "medical", "shelter", "water", "education", "other"]
    location_description: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    urgency_score: int = Field(ge=1, le=5)
    affected_count: int
    description: str
    status: Literal["open", "assigned", "done"] = "open"
    source: Literal["image", "text", "form"] = "form"
