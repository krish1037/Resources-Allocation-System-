from math import radians, sin, cos, sqrt, atan2
from typing import List, Tuple
from app.models.need import NeedRecord
from app.models.volunteer import Volunteer

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0 # Earth radius in kilometers

    lat1_rad = radians(lat1)
    lon1_rad = radians(lng1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lng2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c

def skill_overlap_score(need_type: str, volunteer_skills: List[str]) -> float:
    mapping = {
        "food": ["food_distribution", "general"],
        "medical": ["medical", "counseling"],
        "shelter": ["construction", "general"],
        "water": ["general", "construction"],
        "education": ["teaching", "general"],
        "other": ["general"]
    }
    
    required_skills = mapping.get(need_type, ["general"])
    intersection = set(required_skills).intersection(set(volunteer_skills))
    if not required_skills:
        return 0.0
    return float(len(intersection)) / float(len(required_skills))

def compute_match_score(need: NeedRecord, volunteer: Volunteer) -> float:
    if need.lat is None or need.lng is None:
        distance_score = 0
    else:
        distance = haversine_km(need.lat, need.lng, volunteer.lat, volunteer.lng)
        distance_score = max(0, 1 - (distance / 20.0))
        
    skill_score = skill_overlap_score(need.need_type, volunteer.skills)
    urgency_weight = need.urgency_score / 5.0
    
    score = (distance_score * 0.4) + (skill_score * 0.4) + (urgency_weight * 0.2)
    return round(score * 100, 2)

async def find_best_matches(need: NeedRecord, volunteers: List[Volunteer], top_n: int = 3) -> List[Tuple[Volunteer, float]]:
    eligible_volunteers = [v for v in volunteers if v.availability and v.assigned_need_id is None]
    
    scored_volunteers = []
    for vol in eligible_volunteers:
        score = compute_match_score(need, vol)
        scored_volunteers.append((vol, score))
        
    scored_volunteers.sort(key=lambda x: x[1], reverse=True)
    return scored_volunteers[:top_n]
