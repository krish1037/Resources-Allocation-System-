from pydantic import BaseModel, Field, model_validator
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
    assigned_volunteer_id: Optional[str] = None
    priority_score: Optional[float] = None
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now())
    source: Literal["image", "text", "form"] = "form"

    @model_validator(mode='after')
    def compute_priority(self) -> 'NeedRecord':
        if self.priority_score is None and self.urgency_score is not None and self.affected_count is not None:
            self.priority_score = float(self.urgency_score * self.affected_count)
        return self

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
