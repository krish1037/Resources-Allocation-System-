# WARNING: This deletes ALL existing data in community_needs, volunteers, task_assignments
# before seeding. Only run during demo setup.

import os
import random
from datetime import datetime, timezone
from google.cloud import firestore

def delete_collection(coll_ref, batch_size):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0
    for doc in docs:
        doc.reference.delete()
        deleted += 1
    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)

def seed_database():
    project_id = os.getenv("GCP_PROJECT_ID")
    db = firestore.Client(project=project_id) if project_id else firestore.Client()
    
    print("Clearing existing data...")
    delete_collection(db.collection("community_needs"), 100)
    delete_collection(db.collection("volunteers"), 100)
    delete_collection(db.collection("task_assignments"), 100)

    base_lat = 26.9124
    base_lng = 75.7873

    def get_offset():
        return random.uniform(-0.05, 0.05)

    need_configs = [
        ("food", 8, 3, 5, 20, 200, "Requires immediate food distribution to displaced residents."),
        ("medical", 4, 4, 5, 5, 50, "Medical aid requested for injuries and health check-ups."),
        ("shelter", 4, 2, 4, 10, 100, "Temporary shelter requested due to damage in the area."),
        ("water", 2, 4, 5, 50, 300, "Clean drinking water supply required urgently."),
        ("education", 2, 1, 3, 30, 150, "Educational materials and teaching aid needed for children.")
    ]

    need_ids = []
    
    print("Seeding Needs...")
    for n_type, count, urg_min, urg_max, aff_min, aff_max, desc in need_configs:
        for i in range(count):
            doc_ref = db.collection("community_needs").document()
            data = {
                "id": doc_ref.id,
                "need_type": n_type,
                "location_description": f"Jaipur {n_type.capitalize()} Relief Zone {i+1}",
                "lat": base_lat + get_offset(),
                "lng": base_lng + get_offset(),
                "urgency_score": random.randint(urg_min, urg_max),
                "affected_count": random.randint(aff_min, aff_max),
                "description": desc,
                "status": "open",
                "priority_score": random.uniform(50.0, 95.0),
                "created_at": datetime.now(timezone.utc),
                "source": "form"
            }
            doc_ref.set(data)
            need_ids.append(doc_ref.id)

    names = [
        "Aarav Patel", "Rohan Sharma", "Kavya Singh", "Priya Verma", "Vikram Gupta", 
        "Anjali Desai", "Rishabh Joshi", "Neha Reddy", "Aditya Iyer", "Sneha Nair"
    ]
    skills_pool = ["medical", "food_distribution", "teaching", "transport", "construction", "counseling", "general"]
    
    volunteer_ids = []
    
    print("Seeding Volunteers...")
    for i, name in enumerate(names):
        doc_ref = db.collection("volunteers").document()
        data = {
            "id": doc_ref.id,
            "name": name,
            "email": f"{name.lower().replace(' ', '.')}@example.com",
            "phone": f"+9198765432{i:02d}",
            "skills": random.sample(skills_pool, random.randint(1, 3)),
            "availability": True,
            "lat": base_lat + get_offset(),
            "lng": base_lng + get_offset(),
            "device_token": None,
            "assigned_need_id": None
        }
        doc_ref.set(data)
        volunteer_ids.append(doc_ref.id)

    print("Seeding Assignments...")
    for i in range(3):
        n_id = need_ids[i]
        v_id = volunteer_ids[i]
        
        db.collection("community_needs").document(n_id).update({"status": "assigned"})
        db.collection("volunteers").document(v_id).update({
            "availability": False, 
            "assigned_need_id": n_id
        })
        
        doc_ref = db.collection("task_assignments").document()
        data = {
            "id": doc_ref.id,
            "need_id": n_id,
            "volunteer_id": v_id,
            "match_score": random.uniform(70.0, 99.0),
            "task_briefing": f"Hi {names[i]}, you have been assigned to cover a critical area. Please bring supplies to the requested location.",
            "status": "accepted",
            "created_at": datetime.now(timezone.utc),
            "estimated_distance_km": round(random.uniform(1.0, 15.0), 1)
        }
        doc_ref.set(data)

    print("Seeded: 20 needs, 10 volunteers, 3 assignments")
    print("Run: python seed/seed_data.py to reset demo data")

if __name__ == "__main__":
    seed_database()
