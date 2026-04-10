import os
import base64
from fastapi import HTTPException
from google.cloud import documentai
from google.api_core.exceptions import GoogleAPIError

def get_processor_name():
    project = os.getenv("GCP_PROJECT_ID")
    processor_id = os.getenv("DOCUMENT_AI_PROCESSOR_ID")
    location = os.getenv("DOCUMENT_AI_LOCATION", "us")
    return f"projects/{project}/locations/{location}/processors/{processor_id}"

async def extract_text_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    try:
        location = os.getenv("DOCUMENT_AI_LOCATION", "us")
        client_options = {"api_endpoint": f"{location}-documentai.googleapis.com"}
        client = documentai.DocumentProcessorServiceClient(client_options=client_options)
        
        raw_document = documentai.RawDocument(content=image_bytes, mime_type=mime_type)
        request = documentai.ProcessRequest(
            name=get_processor_name(),
            raw_document=raw_document
        )
        result = client.process_document(request=request)
        return result.document.text
    except GoogleAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))
