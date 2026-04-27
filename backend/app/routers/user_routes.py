from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.core.config import get_required_env
from app.core.database import SessionLocal
from app import models

router = APIRouter()
PROTECTED_SUPERADMIN_EMAIL = get_required_env("SUPERADMIN_EMAIL")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_superadmin(role: str = Header(...)):
    if role != "superadmin":
        return {"error": "Unauthorized"}

@router.get("/users")
def get_users(role: str = Header(...), db: Session = Depends(get_db)):

    if role != "superadmin":
        return {"error": "Unauthorized"}

    users = db.query(models.User).all()

    return [
        {
            "id": u.id,
            "id": u.id,
            "name": u.name,
            "phone": u.phone,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active
        }
        for u in users
    ]


@router.put("/users/{id}/role")
def change_role(id: int, new_role: str, role: str = Header(...), current_user_email: str = Header(...), db: Session = Depends(get_db)):

    if role != "superadmin":
        return {"error": "Unauthorized"}

    user = db.query(models.User).filter(models.User.id == id).first()

    if not user:
        return {"error": "User not found"}

    # Prevent user from changing their own role
    if user.email == current_user_email:
        return {"error": "You cannot change your own role"}

    # Prevent demoting the configured main superadmin
    if user.email == PROTECTED_SUPERADMIN_EMAIL:
        return {"error": "Main superadmin account cannot be demoted"}

    user.role = new_role
    db.commit()

    return {"message": "Role updated"}


@router.put("/users/{id}/status")
def toggle_status(id: int, role: str = Header(...), current_user_email: str = Header(...), db: Session = Depends(get_db)):

    if role != "superadmin":
        return {"error": "Unauthorized"}

    user = db.query(models.User).filter(models.User.id == id).first()

    if not user:
        return {"error": "User not found"}

    # Prevent user from changing their own status
    if user.email == current_user_email:
        return {"error": "You cannot change your own status"}

    # Prevent disabling the configured main superadmin
    if user.email == PROTECTED_SUPERADMIN_EMAIL:
        return {"error": "Main superadmin account cannot be disabled"}

    user.is_active = not user.is_active
    db.commit()

    return {"message": "Status updated"}


@router.delete("/users/{id}")
def delete_user(id: int, role: str = Header(...), current_user_email: str = Header(...), db: Session = Depends(get_db)):

    if role != "superadmin":
        return {"error": "Unauthorized"}

    user = db.query(models.User).filter(models.User.id == id).first()

    if not user:
        return {"error": "User not found"}

    # Prevent deleting the configured main superadmin
    if user.email == PROTECTED_SUPERADMIN_EMAIL:
        return {"error": "Main superadmin account cannot be deleted"}

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}
