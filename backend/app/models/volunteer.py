from pydantic import BaseModel
from typing import Optional, List

class Volunteer(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    phone: Optional[str] = None
    skills: List[str]
    availability: bool = True
    lat: float
    lng: float
    device_token: Optional[str] = None
    assigned_need_id: Optional[str] = None
