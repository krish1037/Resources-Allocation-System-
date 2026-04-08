from fastapi import APIRouter
from app.services import firestore, bigquery
from collections import Counter
import os

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview")
async def get_overview():
    docs = firestore.db.collection("community_needs").stream()
    
    total = 0
    open_count = 0
    assigned_count = 0
    done_count = 0
    categories = Counter()
    
    for doc in docs:
        total += 1
        data = doc.to_dict()
        categories[data.get("need_type", "other")] += 1
        
        status = data.get("status", "open")
        if status == "open":
            open_count += 1
        elif status == "assigned":
            assigned_count += 1
        elif status == "done":
            done_count += 1
            
    return {
        "total_needs": total,
        "open": open_count,
        "assigned": assigned_count,
        "done": done_count,
        "by_category": dict(categories)
    }

@router.get("/trends")
async def get_trends():
    dataset = os.getenv("BIGQUERY_DATASET", "resource_allocator")
    table_ref = f"{bigquery.client.project}.{dataset}.need_events" if bigquery.client.project else f"{dataset}.need_events"
    
    query = f"""
        SELECT DATE(event_time) as date, need_type, COUNT(*) as count 
        FROM `{table_ref}` 
        GROUP BY 1, 2 
        ORDER BY 1
    """
    
    query_job = bigquery.client.query(query)
    results = query_job.result()
    
    trends = []
    for row in results:
        trends.append({
            "date": str(row.date),
            "need_type": row.need_type,
            "count": row.count
        })
        
    return trends
