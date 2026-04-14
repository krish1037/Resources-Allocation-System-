# 🚀 Smart Resource Allocator

A high-performance, intelligent system for real-time community resource management and volunteer orchestration. Built with a modern full-stack architecture leveraging Google Cloud's AI suite and Firebase.

---

## 🏗️ Project Overview

The **Smart Resource Allocator** is designed to streamline the process of identifying community needs and matching them with the right volunteers in real-time. By leveraging **Gemini AI** for need extraction and **Google Maps** for spatial intelligence, the system ensures that critical resources reach the right place at the right time.

### ✨ Key Features

- **🧠 AI-Powered Ingestion**: Automated extraction of need details from unstructured data using Gemini 2.0 Flash and Document AI.
- **🗺️ Real-time Geospatial Dashboard**: Interactive Google Maps integration for visualizing needs and volunteer distribution.
- **📊 Advanced Analytics**: Comprehensive insights and data visualization using Recharts and BigQuery.
- **⚡ Proximity Matching**: Intelligent volunteer-to-need assignment based on real-time location and urgency.
- **🔄 Automated Lifecycle Management**: Background tasks for need reprioritization and clearing stale assignments.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Data Fetching**: [React Query](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Visuals**: [Recharts](https://recharts.org/), Framer Motion, Lucide React
- **Maps**: Google Maps JavaScript API

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [Google Firestore](https://firebase.google.com/products/firestore)
- **AI/ML**: Google Gemini 2.0 Flash, Cloud Document AI
- **Data Warehouse**: Google BigQuery
- **Authentication**: Firebase Admin SDK

---

## 📂 Project Structure

```bash
smart-resource-allocator/
├── backend/            # FastAPI application logic and services
│   ├── app/            # Source code (routers, models, services)
│   └── tests/          # Pytest suite
├── frontend/           # React application (Vite template)
│   ├── src/            # Components, hooks, and State management
│   └── public/         # Static assets
├── seed/               # Database seeding and migration scripts
└── docker-compose.yml  # Local development orchestration
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18+)
- Python (3.9+)
- Docker
- Google Cloud Project with Billing Enabled

### **Installation**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/krish1037/Resources-Allocation-System-.git
   cd Resources-Allocation-System-
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 👥 Contributors

- **Creator**: [Krish Sharma](https://github.com/krish1037)
- **Support Team**: 
  - AVI MATHUR
  - ABHIKRITI SAXENA
  - PRANAV KHANDEWAL

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the Community.
</p>
