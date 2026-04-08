import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
from main import app


MOCK_STRUCTURED_NEED = {
    "need_type": "food",
    "location_description": "Malviya Nagar, Jaipur",
    "urgency_score": 4,
    "affected_count": 85,
    "description": "Severe food shortage affecting 85 families in the Malviya Nagar area.",
}

MOCK_GEOCODE = (26.8647, 75.8028)   # lat, lng for Malviya Nagar
MOCK_NEED_ID = "test-need-id-001"


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture
async def client():
    """Async test client for FastAPI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.fixture(autouse=True)
def mock_all_external_services():
    """
    Patches every Google Cloud service used by the ingest router.
    autouse=True means this runs for every test in this file automatically.
    """
    with (
        patch("app.routers.ingest.gemini.structure_need_from_text",
              new=AsyncMock(return_value=MOCK_STRUCTURED_NEED)) as mock_gemini,
        patch("app.routers.ingest.geocoding.geocode_location",
              new=AsyncMock(return_value=MOCK_GEOCODE)) as mock_geo,
        patch("app.routers.ingest.firestore.save_need",
              new=AsyncMock(return_value=MOCK_NEED_ID)) as mock_fs,
        patch("app.routers.ingest.bigquery.log_need_event",
              new=AsyncMock(return_value=None)) as mock_bq,
        patch("app.routers.ingest.document_ai.extract_text_from_image",
              new=AsyncMock(return_value="Food shortage in Malviya Nagar 85 families urgent")) as mock_doc,
    ):
        yield {
            "gemini": mock_gemini,
            "geocoding": mock_geo,
            "firestore": mock_fs,
            "bigquery": mock_bq,
            "document_ai": mock_doc,
        }


class TestIngestText:
    @pytest.mark.anyio
    async def test_ingest_text_returns_200(self, client):
        response = await client.post(
            "/api/ingest/text",
            json={"text": "Food shortage in Malviya Nagar affecting 85 families, urgent."}
        )
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_ingest_text_returns_need_id(self, client):
        response = await client.post(
            "/api/ingest/text",
            json={"text": "Medical camp needed in Vaishali Nagar urgently, 30 patients."}
        )
        body = response.json()
        assert "need_id" in body
        assert body["need_id"] == MOCK_NEED_ID

    @pytest.mark.anyio
    async def test_ingest_text_returns_need_object(self, client):
        response = await client.post(
            "/api/ingest/text",
            json={"text": "Shelter needed for flood victims near Mansarovar."}
        )
        body = response.json()
        assert "need" in body
        need = body["need"]
        assert need["need_type"] == "food"          # from MOCK_STRUCTURED_NEED
        assert need["urgency_score"] == 4
        assert need["lat"] == MOCK_GEOCODE[0]
        assert need["lng"] == MOCK_GEOCODE[1]
        assert need["source"] == "text"

    @pytest.mark.anyio
    async def test_ingest_text_calls_gemini(self, client, mock_all_external_services):
        await client.post(
            "/api/ingest/text",
            json={"text": "Water supply disrupted in C-Scheme for 3 days."}
        )
        mock_all_external_services["gemini"].assert_called_once()

    @pytest.mark.anyio
    async def test_ingest_text_calls_geocoding(self, client, mock_all_external_services):
        await client.post(
            "/api/ingest/text",
            json={"text": "Education resources missing in Sanganer."}
        )
        mock_all_external_services["geocoding"].assert_called_once_with("Malviya Nagar, Jaipur")

    @pytest.mark.anyio
    async def test_ingest_text_calls_firestore_save(self, client, mock_all_external_services):
        await client.post(
            "/api/ingest/text",
            json={"text": "Medical emergency in Jagatpura."}
        )
        mock_all_external_services["firestore"].assert_called_once()

    @pytest.mark.anyio
    async def test_ingest_text_calls_bigquery_log(self, client, mock_all_external_services):
        await client.post(
            "/api/ingest/text",
            json={"text": "Food needed in Sodala."}
        )
        mock_all_external_services["bigquery"].assert_called_once()

    @pytest.mark.anyio
    async def test_ingest_text_missing_body_returns_422(self, client):
        response = await client.post("/api/ingest/text", json={})
        assert response.status_code == 422

    @pytest.mark.anyio
    async def test_ingest_text_empty_string_returns_422(self, client):
        response = await client.post("/api/ingest/text", json={"text": ""})
        assert response.status_code in (422, 400)


class TestIngestImage:
    @pytest.mark.anyio
    async def test_ingest_image_returns_200(self, client):
        fake_image = b'\xff\xd8\xff\xe0' + b'\x00' * 100   # minimal JPEG header bytes
        response = await client.post(
            "/api/ingest/image",
            files={"file": ("survey.jpg", fake_image, "image/jpeg")},
        )
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_ingest_image_calls_document_ai(self, client, mock_all_external_services):
        fake_image = b'\xff\xd8\xff\xe0' + b'\x00' * 100
        await client.post(
            "/api/ingest/image",
            files={"file": ("survey.jpg", fake_image, "image/jpeg")},
        )
        mock_all_external_services["document_ai"].assert_called_once()

    @pytest.mark.anyio
    async def test_ingest_image_source_is_image(self, client):
        fake_image = b'\xff\xd8\xff\xe0' + b'\x00' * 100
        response = await client.post(
            "/api/ingest/image",
            files={"file": ("survey.jpg", fake_image, "image/jpeg")},
        )
        assert response.json()["need"]["source"] == "image"

    @pytest.mark.anyio
    async def test_ingest_image_no_file_returns_422(self, client):
        response = await client.post("/api/ingest/image")
        assert response.status_code == 422


class TestIngestForm:
    @pytest.mark.anyio
    async def test_ingest_form_returns_200(self, client):
        response = await client.post(
            "/api/ingest/form",
            json={
                "need_type": "medical",
                "location_description": "Vaishali Nagar, Jaipur",
                "urgency_score": 5,
                "affected_count": 12,
                "description": "Dialysis patients need medical supplies.",
            }
        )
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_ingest_form_source_is_form(self, client):
        response = await client.post(
            "/api/ingest/form",
            json={
                "need_type": "shelter",
                "location_description": "Mansarovar, Jaipur",
                "urgency_score": 3,
                "affected_count": 40,
                "description": "Families displaced after building collapse.",
            }
        )
        assert response.json()["need"]["source"] == "form"

    @pytest.mark.anyio
    async def test_ingest_form_does_not_call_document_ai(
        self, client, mock_all_external_services
    ):
        await client.post(
            "/api/ingest/form",
            json={
                "need_type": "water",
                "location_description": "C-Scheme, Jaipur",
                "urgency_score": 4,
                "affected_count": 200,
                "description": "Water supply cut for 3 days.",
            }
        )
        mock_all_external_services["document_ai"].assert_not_called()

    @pytest.mark.anyio
    async def test_ingest_form_invalid_urgency_score_returns_422(self, client):
        response = await client.post(
            "/api/ingest/form",
            json={
                "need_type": "food",
                "location_description": "Jaipur",
                "urgency_score": 99,    # invalid — must be 1-5
                "affected_count": 10,
                "description": "Test.",
            }
        )
        assert response.status_code == 422

    @pytest.mark.anyio
    async def test_ingest_form_invalid_need_type_returns_422(self, client):
        response = await client.post(
            "/api/ingest/form",
            json={
                "need_type": "rockets",   # not in enum
                "location_description": "Jaipur",
                "urgency_score": 2,
                "affected_count": 5,
                "description": "Test.",
            }
        )
        assert response.status_code == 422


class TestHealthCheck:
    @pytest.mark.anyio
    async def test_health_returns_200(self, client):
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
