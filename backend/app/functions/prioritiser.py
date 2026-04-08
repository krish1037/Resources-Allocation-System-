# Deploy: gcloud functions deploy on_need_created --runtime python311 --trigger-event providers/cloud.firestore/eventTypes/document.create --trigger-resource "projects/{PROJECT_ID}/databases/(default)/documents/community_needs/{needId}" --region asia south 1

import asyncio
from firebase_functions import firestore_fn
from google.cloud import firestore
from app.services import gemini

@firestore_fn.on_document_created(document="community_needs/{needId}")
def on_need_created(event: firestore_fn.Event) -> None:
    need_data = event.data.to_dict()
    need_id = event.params["needId"]

    # Get all needs of the same type to cluster
    db = firestore.Client()
    similar_needs = db.collection("community_needs") \
        .where("need_type", "==", need_data.get("need_type")) \
        .where("status", "==", "open") \
        .limit(10).stream()
        
    cluster = [n.to_dict() for n in similar_needs]

    # Score the cluster
    priority_score = asyncio.run(gemini.score_need_cluster(cluster))

    # Write back
    db.collection("community_needs").document(need_id).update({
        "priority_score": priority_score
    })
