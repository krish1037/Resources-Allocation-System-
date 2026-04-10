from fastapi import APIRouter, UploadFile, File, Body
from app.services import document_ai, gemini, geocoding, firestore, bigquery
from app.models.need import NeedRecord, NeedInput

router = APIRouter(prefix="/api/ingest", tags=["ingest"])

@router.post("/image")
async def ingest_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    raw_text = await document_ai.extract_text_from_image(image_bytes, file.content_type)
    structured = await gemini.structure_need_from_text(raw_text)
    lat, lng = await geocoding.geocode_location(structured.get("location_description", ""))
    
    need = NeedRecord(**structured, lat=lat, lng=lng, source="image")
    need_id = await firestore.save_need(need)
    need.id = need_id
    await bigquery.log_need_event(need)
    
    return {"need_id": need_id, "need": need.model_dump(), "message": "Ingested from image"}

@router.post("/text")
async def ingest_text(body: dict = Body(...)):
    raw_text = body.get("text", "")
    structured = await gemini.structure_need_from_text(raw_text)
    lat, lng = await geocoding.geocode_location(structured.get("location_description", ""))
    
    need = NeedRecord(**structured, lat=lat, lng=lng, source="text")
    need_id = await firestore.save_need(need)
    need.id = need_id
    await bigquery.log_need_event(need)
    
    return {"need_id": need_id, "need": need.model_dump(), "message": "Ingested from text"}

@router.post("/form")
async def ingest_form(body: NeedInput):
    """
    Accepts a pre-structured form submission.
    Geocodes location_description only if lat/lng are missing or zero.
    Does NOT call Gemini — the form data is already structured.
    """
    data = body.model_dump()

    # Only geocode if lat/lng are missing or explicitly zero
    lat = data.get("lat")
    lng = data.get("lng")

    if not lat or not lng or (lat == 0 and lng == 0):
        try:
            lat, lng = await geocoding.geocode_location(data["location_description"])
        except Exception as e:
            print(f"[Geocoding] Failed for form ingest: {e}, using defaults")
            lat, lng = 26.9124, 75.7873  # Jaipur centre fallback

    # Build the NeedRecord — remove lat/lng/source from data dict first to avoid duplicates
    data.pop("lat", None)
    data.pop("lng", None)
    data.pop("source", None)

    need = NeedRecord(**data, lat=lat, lng=lng, source="form")
    need_id = await firestore.save_need(need)
    need.id = need_id

    await bigquery.log_need_event(need)

    return {
        "need_id": need_id,
        "need": need.model_dump(),
        "message": "Ingested from form"
    }

