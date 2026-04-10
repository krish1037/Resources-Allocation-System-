import os
from datetime import datetime, timezone
from google.cloud import bigquery
from app.models.need import NeedRecord

project_id = os.getenv("GCP_PROJECT_ID")
kwargs = {"project": project_id} if project_id else {}
client = bigquery.Client(**kwargs)

DATASET = os.getenv("BIGQUERY_DATASET", "resource_allocator")

async def log_need_event(need: NeedRecord):
    table_id = f"{client.project}.{DATASET}.need_events" if client.project else f"{DATASET}.need_events"
    
    data = need.model_dump(exclude_none=True)
    
    # Convert datetime objects to ISO format strings for BigQuery
    if "created_at" in data and isinstance(data["created_at"], datetime):
        data["created_at"] = data["created_at"].isoformat()
        
    data["event_time"] = datetime.now(timezone.utc).isoformat()
        
    errors = client.insert_rows_json(table_id, [data])
    if errors:
        raise RuntimeError(f"Error inserting into BigQuery: {errors}")
