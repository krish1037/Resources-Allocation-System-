import os
from typing import List
from datetime import datetime, timezone
from google.cloud import firestore
from app.models.need import NeedRecord
from app.models.volunteer import Volunteer
from app.models.assignment import Assignment

project_id = os.getenv("GCP_PROJECT_ID")
kwargs = {"project": project_id} if project_id else {}
db = firestore.Client(**kwargs)

async def save_need(need: NeedRecord) -> str:
    data = need.model_dump(exclude_none=True)
    if need.created_at is None:
        data["created_at"] = datetime.now(timezone.utc)
    
    doc_ref = db.collection("community_needs").document()
    if data.get("id") is None:
        data["id"] = doc_ref.id
    doc_ref.set(data)
    return doc_ref.id

async def get_need(need_id: str) -> NeedRecord:
    doc = db.collection("community_needs").document(need_id).get()
    if not doc.exists:
        raise ValueError(f"Need {need_id} not found")
    return NeedRecord(**doc.to_dict())

async def get_open_needs(limit: int = 50) -> List[NeedRecord]:
    docs = db.collection("community_needs").where(firestore.FieldFilter("status", "==", "open")).order_by("priority_score", direction=firestore.Query.DESCENDING).limit(limit).stream()
    return [NeedRecord(**doc.to_dict()) for doc in docs]

async def update_need_priority(need_id: str, priority_score: float):
    db.collection("community_needs").document(need_id).update({"priority_score": priority_score})

async def save_volunteer(volunteer: Volunteer) -> str:
    data = volunteer.model_dump(exclude_none=True)
    doc_ref = db.collection("volunteers").document()
    if data.get("id") is None:
        data["id"] = doc_ref.id
    doc_ref.set(data)
    return doc_ref.id

async def get_available_volunteers() -> List[Volunteer]:
    docs = db.collection("volunteers").where(firestore.FieldFilter("availability", "==", True)).stream()
    return [Volunteer(**doc.to_dict()) for doc in docs]

async def save_assignment(assignment: Assignment) -> str:
    data = assignment.model_dump(exclude_none=True)
    doc_ref = db.collection("task_assignments").document()
    if data.get("id") is None:
        data["id"] = doc_ref.id
    doc_ref.set(data)
    return doc_ref.id

async def update_assignment_status(assignment_id: str, status: str):
    db.collection("task_assignments").document(assignment_id).update({"status": status})
