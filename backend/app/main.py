import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
BACKEND_ROOT = os.path.dirname(CURRENT_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.append(BACKEND_ROOT)

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.core.config import get_csv_env
from app.routers import auth_routes, category_routes, location_routes
from app.routers import user_routes

# FASTAPI APP SETUP
app = FastAPI()

allowed_origins = get_csv_env(
    "ALLOWED_ORIGINS",
    "http://127.0.0.1:5500,http://localhost:5500",
)

if "null" not in allowed_origins:
    # Browsers send Origin: null when opening local HTML files directly.
    allowed_origins.append("null")

# Permit localhost/127.0.0.1 on any dev port (e.g. Live Server 5500/5501)
# Also allow private LAN ranges for mobile/LAN testing (10.x, 172.16-31.x, 192.168.x)
local_dev_origin_regex = (
    r"https?://(localhost|127\.0\.0\.1|"
    r"10\.\d+\.\d+\.\d+|"
    r"192\.168\.\d+\.\d+|"
    r"172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$"
)

# CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=local_dev_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REGISTER ROUTES
app.include_router(auth_routes.router)
app.include_router(category_routes.router)
app.include_router(location_routes.router)
app.include_router(user_routes.router)

# ROOT ENDPOINT
@app.get("/")
def root():
    return {"message": "Backend running with PostgreSQL"}
