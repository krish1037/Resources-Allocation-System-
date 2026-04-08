import asyncio
import os
from datetime import datetime, timedelta
from google.cloud import firestore
from app.services.gemini import score_need_cluster
from app.services.firestore import get_open_needs, update_need_priority, update_assignment_status

db = firestore.Client(project=os.getenv("GCP_PROJECT_ID"))

async def reprioritise_all_needs():
    """
    Called every 6 hours by Cloud Scheduler via POST /internal/reprioritise.
    Groups all open needs by need_type, scores each cluster with Gemini,
    then writes the updated priority_score back to each Firestore document.
    Returns a summary dict: {"updated": int, "types_processed": List[str]}
    """
    open_needs = await get_open_needs(limit=200)
    
    # Group by need_type
    from collections import defaultdict
    clusters = defaultdict(list)
    for need in open_needs:
        clusters[need.need_type].append(need.dict())
    
    updated_count = 0
    for need_type, cluster in clusters.items():
        score = await score_need_cluster(cluster)
        # Apply the cluster score to each need in the cluster,
        # weighted by the individual need's own urgency_score
        for need in open_needs:
            if need.need_type == need_type and need.id:
                weighted = round((score * 0.6) + (need.urgency_score / 5.0 * 10 * 0.4), 2)
                await update_need_priority(need.id, weighted)
                updated_count += 1
    
    return {"updated": updated_count, "types_processed": list(clusters.keys())}


async def expire_stale_assignments():
    """
    Called every 24 hours by Cloud Scheduler via POST /internal/expire-assignments.
    Finds task_assignments with status="pending" older than 48 hours
    and sets them to status="expired". Also sets the linked volunteer back
    to availability=True and clears their assigned_need_id.
    Returns {"expired": int}
    """
    cutoff = datetime.utcnow() - timedelta(hours=48)
    
    stale = db.collection("task_assignments") \
        .where("status", "==", "pending") \
        .where("created_at", "<", cutoff) \
        .stream()
    
    expired_count = 0
    for doc in stale:
        data = doc.to_dict()
        await update_assignment_status(doc.id, "expired")
        
        # Free the volunteer
        volunteer_id = data.get("volunteer_id")
        if volunteer_id:
            db.collection("volunteers").document(volunteer_id).update({
                "availability": True,
                "assigned_need_id": None
            })
        expired_count += 1
    
    return {"expired": expired_count}
