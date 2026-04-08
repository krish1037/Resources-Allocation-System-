import os
import json
import httpx
import google.auth
import google.auth.transport.requests
from app.models.need import NeedRecord

FCM_ENDPOINT = "https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"

def _get_access_token() -> str:
    """
    Gets a short-lived OAuth2 access token using Application Default Credentials.
    Scoped to Firebase Messaging. Works with gcloud ADC locally and with the
    Cloud Run service account in production — no key file needed.
    """
    credentials, _ = google.auth.default(
        scopes=["https://www.googleapis.com/auth/firebase.messaging"]
    )
    request = google.auth.transport.requests.Request()
    credentials.refresh(request)
    return credentials.token


def send_task_notification(
    device_token: str,
    task_briefing: str,
    need_type: str,
    need_id: str,
) -> str:
    """
    Sends a push notification to a volunteer's device via FCM HTTP v1 API.
    Returns the FCM message name string on success.
    Raises httpx.HTTPStatusError on failure (caller should catch and log, not crash).
    """
    project_id = os.getenv("GCP_PROJECT_ID")
    if not project_id:
        raise ValueError("GCP_PROJECT_ID environment variable is not set")

    access_token = _get_access_token()

    url = FCM_ENDPOINT.format(project_id=project_id)

    payload = {
        "message": {
            "token": device_token,
            "notification": {
                "title": f"New task: {need_type.replace('_', ' ').title()}",
                "body": task_briefing[:160],   # FCM body limit
            },
            "data": {
                "need_id": need_id,
                "need_type": need_type,
                "type": "task_assignment",
            },
            "android": {
                "priority": "high",
                "notification": {
                    "channel_id": "task_assignments",
                    "click_action": "OPEN_TASK_DETAIL",
                },
            },
            "apns": {
                "payload": {
                    "aps": {
                        "alert": {
                            "title": f"New task: {need_type.replace('_', ' ').title()}",
                            "body": task_briefing[:160],
                        },
                        "sound": "default",
                        "badge": 1,
                    }
                }
            },
            "webpush": {
                "notification": {
                    "title": f"New task: {need_type.replace('_', ' ').title()}",
                    "body": task_briefing[:160],
                    "icon": "/logo.png",
                    "badge": "/badge.png",
                },
                "fcm_options": {
                    "link": f"/map?need_id={need_id}",
                },
            },
        }
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; UTF-8",
    }

    response = httpx.post(url, json=payload, headers=headers, timeout=10.0)
    response.raise_for_status()
    return response.json().get("name", "")


def send_task_notification_safe(
    device_token: str | None,
    task_briefing: str,
    need_type: str,
    need_id: str,
) -> str | None:
    """
    Wrapper that silently skips notification if device_token is None or empty.
    Use this in the match router — volunteers registered without a device token
    should still get matched, the notification just won't fire.
    Returns the message name or None.
    """
    if not device_token:
        return None
    try:
        return send_task_notification(device_token, task_briefing, need_type, need_id)
    except Exception as e:
        print(f"[FCM] Notification failed for token {device_token[:10]}...: {e}")
        return None
