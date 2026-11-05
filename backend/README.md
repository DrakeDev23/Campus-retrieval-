# Backend Application — Campus Lost-and-Found System

## Overview

This directory contains the FastAPI REST API backend application for the Campus Lost-and-Found Retrieval System.

## Technology Stack

- **Runtime & Language:** Python 3.11+
- **API Framework:** FastAPI
- **Data Validation & Settings:** Pydantic v2 & Pydantic-Settings
- **ORM & Database:** SQLAlchemy ORM with Neon PostgreSQL
- **Server:** Uvicorn (ASGI)
- **Testing:** Pytest & HTTPX AsyncClient

## Application Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # Application factory, CORS, and root endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py               # Centralized configuration (Settings class)
│   └── api/
│       ├── __init__.py
│       └── v1/
│           ├── __init__.py
│           ├── router.py           # v1 APIRouter mounting sub-routers
│           └── endpoints/
│               ├── __init__.py
│               └── health.py       # Health-check endpoints
├── requirements.txt
└── tests/
    └── test_health.py              # Automated tests for health endpoints
```

## Getting Started

### 1. Create and Activate Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive Swagger UI: `http://127.0.0.1:8000/api/v1/docs`
- ReDoc: `http://127.0.0.1:8000/api/v1/redoc`
- Health Endpoint: `http://127.0.0.1:8000/api/v1/health`

### 4. Run Test Suite
```bash
pytest -v
```
