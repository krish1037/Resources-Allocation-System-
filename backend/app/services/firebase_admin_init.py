import firebase_admin
from firebase_admin import credentials
import os

_app = None

def get_firebase_app():
    """
    Initializes the Firebase Admin SDK exactly once using the service account JSON file.
    Safe to call multiple times — returns the existing app after first initialization.
    The service account file path is read from GOOGLE_APPLICATION_CREDENTIALS env var,
    which should point to your downloaded service account JSON.
    Falls back to Application Default Credentials if the env var is not set.
    """
    global _app
    if _app is not None:
        return _app

    sa_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if sa_path and os.path.exists(sa_path):
        cred = credentials.Certificate(sa_path)
    else:
        cred = credentials.ApplicationDefault()

    _app = firebase_admin.initialize_app(cred, {
        "projectId": os.getenv("GCP_PROJECT_ID"),
    })
    return _app
