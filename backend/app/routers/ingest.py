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
    lat, lng = await geocoding.geocode_location(body.location_description)
    
    structured = body.model_dump()
    need = NeedRecord(**structured, lat=lat, lng=lng, source="form")
    need_id = await firestore.save_need(need)
    need.id = need_id
    await bigquery.log_need_event(need)
    
    return {"need_id": need_id, "need": need.model_dump(), "message": "Ingested from form"}
