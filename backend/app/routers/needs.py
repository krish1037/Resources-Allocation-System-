from fastapi import APIRouter, Query
from typing import Optional
from app.services import firestore
from app.models.need import NeedRecord

router = APIRouter(prefix="/api/needs", tags=["needs"])

@router.get("/")
async def get_needs(status: Optional[str] = None, limit: int = Query(50)):
    # Note: Currently get_open_needs only gets open, but we follow the signature
    needs = await firestore.get_open_needs(limit)
    if status is not None:
        needs = [n for n in needs if n.status == status]
    return {"needs": [n.model_dump() for n in needs], "count": len(needs)}

@router.get("/summary")
async def get_needs_summary():
    needs = await firestore.get_open_needs(10)
    sorted_needs = sorted(needs, key=lambda n: n.priority_score or 0, reverse=True)[:10]
    
    by_category = {}
    for n in sorted_needs:
        by_category[n.need_type] = by_category.get(n.need_type, 0) + 1
        
    return {"top_needs": [n.model_dump() for n in sorted_needs], "by_category": by_category}

@router.get("/{need_id}")
async def get_need(need_id: str):
    need = await firestore.get_need(need_id)
    return need.model_dump()
