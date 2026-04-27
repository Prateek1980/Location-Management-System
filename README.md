# Location Management System

This repository contains:

- A FastAPI backend in `backend`
- A static admin frontend in `frontend/admin`
- A static map viewer in `frontend/map-view`

## Documentation

Detailed project documentation is available in [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

That document covers:

- full architecture
- technologies used and why they were chosen
- backend and frontend module breakdown
- API and data model summary
- authentication approach
- setup and runtime flow
- current limitations and recommended improvements

## Quick Start

### 1. Install backend dependencies

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Configure local secrets

Create a local `.env` file from the safe example file:

```powershell
cd ..
Copy-Item .env.example .env
notepad .env
```

Fill in your local database URL, email app password, and superadmin credentials.
Do not commit `.env` to GitHub.

### 3. Configure PostgreSQL

Create a PostgreSQL database matching your `DATABASE_URL`.

### 4. Run migrations

```powershell
cd backend
alembic upgrade head
```

### 5. Start the backend

```powershell
uvicorn app.main:app --reload
```

Or from `backend/app`:

```powershell
uvicorn main:app --reload
```

Backend default URL(API will run at):

- `http://127.0.0.1:8000`

### 6. Create the initial superadmin

```powershell
python scripts/create_superadmin.py
```

### 7. Serve the frontend

From the repository root:

```powershell
python -m http.server 5500
```

Useful entry pages:

- Login: `http://127.0.0.1:5500/frontend/admin/pages/login/login.html`
- Home: `http://127.0.0.1:5500/frontend/admin/pages/home/home.html`
- Dashboard: `http://127.0.0.1:5500/frontend/admin/pages/dashboard.html`
- Manage Users: `http://127.0.0.1:5500/frontend/admin/pages/manage-users/manage-users.html`
- Map View: `http://127.0.0.1:5500/frontend/map-view/pages/index.html`

## Notes

- Frontend API calls currently target `http://127.0.0.1:8000`
- Start the backend before opening the frontend pages
