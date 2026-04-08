import os
from pathlib import Path

def write_file(rel_path, content):
    p = Path(rel_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

FILES = {}

FILES["backend/requirements.txt"] = """
fastapi
uvicorn
google-cloud-documentai
google-cloud-aiplatform
googlemaps
google-cloud-firestore
google-cloud-bigquery
firebase-admin
pydantic
python-multipart
python-dotenv
httpx
"""

FILES["backend/Dockerfile"] = """
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ app/
COPY main.py .
EXPOSE 8080
CMD uvicorn main:app --host 0.0.0.0 --port 8080
"""

FILES["backend/cloudbuild.yaml"] = """
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/smart-resource-backend', './backend']
"""

FILES["backend/.env.example"] = """
GCP_PROJECT_ID=your-project
GOOGLE_MAPS_API_KEY=your-key
DOCUMENT_AI_PROCESSOR_ID=your-processor
# FCM_SERVER_KEY is no longer needed (uses google-auth ADC instead)
BIGQUERY_DATASET=resource_allocator
"""

FILES["backend/main.py"] = """
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ingest, needs, volunteers, match, analytics

app = FastAPI(title="Smart Resource Allocator")

# CORS middleware allowing localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(needs.router)
app.include_router(volunteers.router)
app.include_router(match.router)
app.include_router(analytics.router)

@app.get("/health")
def health_check():
    # TODO: Check connection to database and return health status
    return {"status": "ok"}
"""

FILES["backend/app/__init__.py"] = ""
FILES["backend/app/routers/__init__.py"] = ""

FILES["backend/app/routers/ingest.py"] = """
from fastapi import APIRouter

router = APIRouter(prefix="/api/ingest", tags=["Ingest"])

@router.post("/")
def ingest_data():
    # TODO: Ingest unstructured data via Document AI
    pass
"""

FILES["backend/app/routers/needs.py"] = """
from fastapi import APIRouter

router = APIRouter(prefix="/api/needs", tags=["Needs"])

@router.get("/")
def get_needs():
    # TODO: Fetch all active needs from Firestore
    pass

@router.post("/")
def create_need():
    # TODO: Create a new resource need
    pass
"""

FILES["backend/app/routers/volunteers.py"] = """
from fastapi import APIRouter

router = APIRouter(prefix="/api/volunteers", tags=["Volunteers"])

@router.get("/")
def get_volunteers():
    # TODO: Fetch available volunteers
    pass
"""

FILES["backend/app/routers/match.py"] = """
from fastapi import APIRouter

router = APIRouter(prefix="/api/match", tags=["Match"])

@router.post("/")
def match_resources():
    # TODO: Trigger the matching algorithm to assign volunteers to needs
    pass
"""

FILES["backend/app/routers/analytics.py"] = """
from fastapi import APIRouter

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/")
def get_analytics():
    # TODO: Fetch analytical data from BigQuery
    pass
"""

FILES["backend/app/services/__init__.py"] = ""

FILES["backend/app/services/document_ai.py"] = """
# TODO: Implement Document AI client initialization and parsing logic
def parse_document(file_content):
    # TODO: Send content to Document AI and extract entities
    pass
"""

FILES["backend/app/services/gemini.py"] = """
# TODO: Implement Gemini / Vertex AI client for unstructured entity extraction
def extract_entities_from_text(text):
    # TODO: Prompt Gemini to extract structured need/volunteer info
    pass
"""

FILES["backend/app/services/geocoding.py"] = """
# TODO: Implement Google Maps API client
def geocode_address(address):
    # TODO: Convert address string to lat/lng
    pass
"""

FILES["backend/app/services/firestore.py"] = """
# TODO: Initialize Firebase Admin SDK and Firestore client
def get_firestore_client():
    # TODO: Return configured client
    pass
"""

FILES["backend/app/services/matcher.py"] = """
# TODO: Implement core matching logic
def find_best_matches(needs, volunteers):
    # TODO: Use distance and skills to propose optimal assignments
    pass
"""

FILES["backend/app/services/notifications.py"] = """
# TODO: Implement FCM or SMS notification service
def notify_volunteer(volunteer_id, assignment_details):
    # TODO: Send a push notification or dispatch message
    pass
"""

FILES["backend/app/services/bigquery.py"] = """
# TODO: Implement BigQuery client for analytics inserting
def load_data_to_bq(data):
    # TODO: Stream assignment data into BigQuery dataset
    pass
"""

FILES["backend/app/models/__init__.py"] = ""

FILES["backend/app/models/need.py"] = """
from pydantic import BaseModel

class Need(BaseModel):
    # TODO: Define Need schema: id, description, location, urgency, status
    pass
"""

FILES["backend/app/models/volunteer.py"] = """
from pydantic import BaseModel

class Volunteer(BaseModel):
    # TODO: Define Volunteer schema: id, name, skills, location, availability
    pass
"""

FILES["backend/app/models/assignment.py"] = """
from pydantic import BaseModel

class Assignment(BaseModel):
    # TODO: Define Assignment schema: need_id, volunteer_id, status, timestamp
    pass
"""

FILES["backend/app/functions/prioritiser.py"] = """
def prioritize_needs(needs):
    # TODO: Sort and rank needs based on urgency, age, and severity
    pass
"""

FILES["backend/app/functions/scheduler.py"] = """
def schedule_assignments(assignments):
    # TODO: Build an optimal route or time schedule for given assignments
    pass
"""

FILES["backend/tests/test_ingest.py"] = """
def test_ingest():
    # TODO: Implement tests for data ingestion pipeline
    pass
"""

FILES["backend/tests/test_matcher.py"] = """
def test_matching_logic():
    # TODO: Implement tests for volunteer to need matching algorithm
    pass
"""

FILES["frontend/package.json"] = """
{
  "name": "frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "react-router-dom": "^6.20.0",
    "@googlemaps/js-api-loader": "^1.16.2",
    "firebase": "^10.7.0",
    "recharts": "^2.10.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
"""

FILES["frontend/vite.config.js"] = """
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
"""

FILES["frontend/index.html"] = """
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smart Resource Allocator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""

FILES["frontend/.env.example"] = """
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=your-api-key
VITE_FIREBASE_CONFIG=your-config
"""

FILES["frontend/src/main.jsx"] = """
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""

FILES["frontend/src/App.jsx"] = """
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NeedsMap from './pages/NeedsMap';
import Volunteers from './pages/Volunteers';
import Ingest from './pages/Ingest';
import Analytics from './pages/Analytics';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // TODO: Implement actual auth check
  const isAuth = true; 
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><NeedsMap /></ProtectedRoute>} />
        <Route path="/volunteers" element={<ProtectedRoute><Volunteers /></ProtectedRoute>} />
        <Route path="/ingest" element={<ProtectedRoute><Ingest /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
"""

FILES["frontend/src/pages/Dashboard.jsx"] = """
import React from 'react';

export default function Dashboard() {
  // TODO: Implement overall metrics, recent activity, and quick access links
  return <div>Dashboard Page</div>;
}
"""

FILES["frontend/src/pages/NeedsMap.jsx"] = """
import React from 'react';

export default function NeedsMap() {
  // TODO: Render Google Map with HeatmapLayer and Need markers
  return <div>Needs Map Page</div>;
}
"""

FILES["frontend/src/pages/Volunteers.jsx"] = """
import React from 'react';

export default function Volunteers() {
  // TODO: List volunteers, show availability and current assignments
  return <div>Volunteers Page</div>;
}
"""

FILES["frontend/src/pages/Ingest.jsx"] = """
import React from 'react';
import UploadZone from '../components/UploadZone';

export default function Ingest() {
  // TODO: Provide UI for uploading unstructured reports or texts
  return (
    <div>
      <h2>Data Ingestion</h2>
      <UploadZone />
    </div>
  );
}
"""

FILES["frontend/src/pages/Analytics.jsx"] = """
import React from 'react';

export default function Analytics() {
  // TODO: Render Recharts graphs for historical allocation efficiency
  return <div>Analytics Page</div>;
}
"""

FILES["frontend/src/pages/Login.jsx"] = """
import React from 'react';

export default function Login() {
  // TODO: Provide Firebase Auth login UI
  return <div>Login Page</div>;
}
"""

FILES["frontend/src/components/NeedCard.jsx"] = """
import React from 'react';

export default function NeedCard({ need }) {
  // TODO: Render a summary of a single need (urgency, required skills)
  return <div>Need Card</div>;
}
"""

FILES["frontend/src/components/VolunteerCard.jsx"] = """
import React from 'react';

export default function VolunteerCard({ volunteer }) {
  // TODO: Render volunteer details
  return <div>Volunteer Card</div>;
}
"""

FILES["frontend/src/components/UploadZone.jsx"] = """
import React from 'react';

export default function UploadZone() {
  // TODO: Provide drag-and-drop file upload for Document AI
  return <div>Upload Zone Component</div>;
}
"""

FILES["frontend/src/components/HeatmapLayer.jsx"] = """
import React from 'react';

export default function HeatmapLayer() {
  // TODO: Integrate with google maps to show density of needs
  return <div>Heatmap Layer Overlay</div>;
}
"""

FILES["frontend/src/components/StatCard.jsx"] = """
import React from 'react';

export default function StatCard({ title, value }) {
  // TODO: Reusable UI component for KPIs
  return <div>Stat Card</div>;
}
"""

FILES["frontend/src/components/Sidebar.jsx"] = """
import React from 'react';

export default function Sidebar() {
  // TODO: Render application navigation menu
  return <nav>Sidebar Navigation</nav>;
}
"""

FILES["frontend/src/components/MatchPanel.jsx"] = """
import React from 'react';

export default function MatchPanel() {
  // TODO: UI to propose and confirm volunteer assignments
  return <div>Match Panel</div>;
}
"""

FILES["frontend/src/services/api.js"] = """
import axios from 'axios';

// TODO: Configure base Axios instance pointing to backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
});
"""

FILES["frontend/src/services/firebase.js"] = """
// TODO: Initialize Firebase app for frontend auth and possible realtime listeners
export const initFirebase = () => {};
"""

FILES["frontend/src/services/maps.js"] = """
// TODO: Initialize and export Google Maps loader utilities
export const loadMaps = () => {};
"""

FILES["frontend/src/hooks/useNeeds.js"] = """
// TODO: Custom hook to fetch and manage needs state from Redux/API
export default function useNeeds() {
  return { needs: [], loading: false };
}
"""

FILES["frontend/src/hooks/useVolunteers.js"] = """
// TODO: Custom hook to fetch and manage volunteers state
export default function useVolunteers() {
  return { volunteers: [], loading: false };
}
"""

FILES["frontend/src/hooks/useAuth.js"] = """
// TODO: Custom hook to interface with Firebase Authentication state
export default function useAuth() {
  return { isAuthenticated: false, user: null };
}
"""

FILES["frontend/src/store/needsSlice.js"] = """
import { createSlice } from '@reduxjs/toolkit';

const needsSlice = createSlice({
  name: 'needs',
  initialState: { data: [] },
  reducers: {
    // TODO: Add reducers for updating needs
  }
});

export const { actions: needsActions, reducer: needsReducer } = needsSlice;
"""

FILES["frontend/src/store/volunteerSlice.js"] = """
import { createSlice } from '@reduxjs/toolkit';

const volunteerSlice = createSlice({
  name: 'volunteers',
  initialState: { data: [] },
  reducers: {
    // TODO: Add reducers for updating volunteers
  }
});

export const { actions: volunteerActions, reducer: volunteerReducer } = volunteerSlice;
"""

FILES["seed/seed_data.py"] = """
def seed_database():
    # TODO: Insert dummy data into Firestore for testing purposes
    pass

if __name__ == "__main__":
    seed_database()
"""

FILES["docker-compose.yml"] = """
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8080
"""

FILES["README.md"] = """
# Smart Resource Allocator

## Project Overview
This project manages resources, matching volunteers to needs, and providing analytics.

## Backend
- FastAPI
- Google Cloud Document AI, BigQuery, Firestore, Geocoding

## Frontend
- React, Vite, Tailwind CSS (optional)
- Map integrations
"""

if __name__ == "__main__":
    for path, content in FILES.items():
        write_file(path, content)
    print("Scaffolding complete!")
