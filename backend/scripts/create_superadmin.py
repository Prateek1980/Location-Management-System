import os
import sys

BACKEND_ROOT = os.path.dirname(os.path.dirname(__file__))
if BACKEND_ROOT not in sys.path:
    sys.path.append(BACKEND_ROOT)

from app.core.database import SessionLocal
from app.core.config import get_required_env
from app import models
from app.routers.auth_routes import hash_password

db = SessionLocal()

email = get_required_env("SUPERADMIN_EMAIL")
password = get_required_env("SUPERADMIN_PASSWORD")

existing = db.query(models.User).filter(models.User.email == email).first()

if existing:
    existing.password = hash_password(password)
    existing.role = "superadmin"
    existing.is_active = True
    db.commit()
    print("Superadmin already exists. Password, role, and status updated.")
else:
    super_admin = models.User(
        name="Super Admin",
        phone="9999999999",
        email=email,
        password=hash_password(password),
        role="superadmin",
        is_active=True
    )

    db.add(super_admin)
    db.commit()
    print("Superadmin created successfully.")

db.close()
