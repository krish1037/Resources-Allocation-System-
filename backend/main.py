from dotenv import load_dotenv
load_dotenv()

from app.services.firebase_admin_init import get_firebase_app
get_firebase_app()   # initialize once at startup

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ingest, needs, volunteers, match, analytics
from app.functions.scheduler import reprioritise_all_needs, expire_stale_assignments

app = FastAPI(title="Smart Resource Allocator")

# CORS middleware allowing localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
    # TODO: Check connection to database and return health status
    return {"status": "ok"}

@app.post("/internal/reprioritise")
async def trigger_reprioritise():
    return await reprioritise_all_needs()

@app.post("/internal/expire-assignments")
async def trigger_expire():
    return await expire_stale_assignments()
