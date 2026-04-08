import os
import firebase_admin
from firebase_admin import messaging

if not firebase_admin._apps:
    firebase_admin.initialize_app()

def send_task_notification(device_token: str, task_briefing: str, need_type: str, need_id: str) -> str:
    notification = messaging.Notification(
        title=f"New task: {need_type}",
        body=task_briefing[:100]
    )
    message = messaging.Message(
        notification=notification,
        data={"need_id": need_id, "type": "task_assignment"},
        token=device_token
    )
    message_id = messaging.send(message)
    return message_id
