import firebase_admin
from firebase_admin import credentials
import os

_app = None

def get_firebase_app():
    global _app
    if _app is not None:
        return _app

    sa_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./service-account.json")

    if os.path.exists(sa_path):
        print(f"[Firebase] Initializing with service account: {sa_path}")
        cred = credentials.Certificate(sa_path)
    else:
        print("[Firebase] service-account.json not found, falling back to ADC")
        cred = credentials.ApplicationDefault()

    _app = firebase_admin.initialize_app(cred, {
        "projectId": os.getenv("GCP_PROJECT_ID", "mythical-way-491518-v6"),
    })
    print(f"[Firebase] Initialized for project: {os.getenv('GCP_PROJECT_ID')}")
    return _app
