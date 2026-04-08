from fastapi import APIRouter, Body
from app.services import firestore
from app.models.volunteer import Volunteer

router = APIRouter(prefix="/api/volunteers", tags=["volunteers"])

@router.post("/")
async def create_volunteer(volunteer: Volunteer):
    volunteer_id = await firestore.save_volunteer(volunteer)
    return {"volunteer_id": volunteer_id}

@router.get("/")
async def get_volunteers():
    volunteers = await firestore.get_available_volunteers()
    return [v.model_dump() for v in volunteers]

@router.patch("/{volunteer_id}/availability")
async def update_availability(volunteer_id: str, body: dict = Body(...)):
    availability = body.get("availability")
    if availability is not None:
        doc_ref = firestore.db.collection("volunteers").document(volunteer_id)
        doc_ref.update({"availability": bool(availability)})
        doc = doc_ref.get()
        return doc.to_dict()
    return {"message": "availability not provided"}
