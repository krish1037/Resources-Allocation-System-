from dotenv import load_dotenv
load_dotenv()  # does nothing on Cloud Run, safe to keep

from app.services.firebase_admin_init import get_firebase_app
get_firebase_app()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ingest, needs, volunteers, match, analytics
from app.functions.scheduler import reprioritise_all_needs, expire_stale_assignments
import os

app = FastAPI(title="Smart Resource Allocator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                          # local dev
        "https://mythical-way-491518-v6.web.app",        # Firebase Hosting
        "https://mythical-way-491518-v6.firebaseapp.com" # Firebase Hosting alt
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(needs.router)
app.include_router(volunteers.router)
app.include_router(match.router)
app.include_router(analytics.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/internal/reprioritise")
async def trigger_reprioritise():
    return await reprioritise_all_needs()

@app.post("/internal/expire-assignments")
async def trigger_expire():
    return await expire_stale_assignments()
