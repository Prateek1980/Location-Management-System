import os

from fastapi import APIRouter, Depends 
from sqlalchemy.orm import Session 
from app.core.database import SessionLocal 
from app.core.config import get_required_env
from app import models
from passlib.context import CryptContext # for password hashing
from app.schemas import UserCreate # for user registration
import re # for email validation

from app.schemas import LoginSchema 
from app.schemas import ResetPasswordSchema 
from app.schemas import ForgotPasswordSchema

# For email validation
import secrets # for generating random tokens
import smtplib 
from email.mime.text import MIMEText 
from datetime import datetime, timedelta # for token expiration

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HASH PASSWORD
def hash_password(password: str):
    return pwd_context.hash(password)

# VERIFY PASSWORD
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


router = APIRouter()

# DEPENDENCY TO GET DB SESSION
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# SEND PASSWORD RESET EMAIL
def send_reset_email(to_email: str, token: str):
    frontend_reset_url = os.getenv(
        "FRONTEND_RESET_URL",
        "http://127.0.0.1:5500/frontend/admin/pages/reset/reset.html",
    )
    reset_link = f"{frontend_reset_url}?token={token}"

    sender_email = get_required_env("SMTP_SENDER_EMAIL")
    app_password = get_required_env("SMTP_APP_PASSWORD")

    subject = "Password Reset Request"
    body = f"""
    Click the link below to reset your password:

    {reset_link}

    This link will expire in 15 minutes.
    """

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, app_password)
        server.send_message(msg)


# FORGOT PASSWORD ROUTE
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordSchema, db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.email == data.email).first()

    if user:
        # Delete old unused tokens
        db.query(models.PasswordResetToken).filter(
            models.PasswordResetToken.user_id == user.id,
            models.PasswordResetToken.is_used == False
        ).delete()

        token = secrets.token_urlsafe(32)

        expires = datetime.utcnow() + timedelta(minutes=15)

        reset_token = models.PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires
        )

        db.add(reset_token)
        db.commit()

        send_reset_email(user.email, token)

    # Always return same message
    return {"message": "If the email exists, a reset link has been sent."}



# RESET PASSWORD ROUTE
@router.post("/reset-password")
def reset_password(data: ResetPasswordSchema, db: Session = Depends(get_db)):

    token_entry = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == data.token,
        models.PasswordResetToken.is_used == False
    ).first()

    if not token_entry:
        return {"error": "Invalid or expired token"}

    if token_entry.expires_at < datetime.utcnow():
        return {"error": "Token expired"}

    user = db.query(models.User).filter(models.User.id == token_entry.user_id).first()

    user.password = hash_password(data.new_password)

    token_entry.is_used = True

    db.commit()

    return {"message": "Password reset successful"}


#  LOGIN ROUTE 
@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        return {"error": "Invalid email"}

    if not verify_password(data.password, user.password):
        return {"error": "Invalid password"}

    if not user.is_active:
        return {"error": "Account disabled"}

    return {
        "token": "logged_in",
        "name": user.name,
        "email": user.email,
        "role": user.role
    }

#  REGISTER ROUTE
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    # Validate email format using regex
    email_pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$"

    if not re.match(email_pattern, user.email):# if email doesn't match the pattern, return an error message
        return {"error": "Invalid email format"}

    # check if email already exists and returns the first matching record
    existing = db.query(models.User).filter(models.User.email == user.email).first() 

    if existing:
        return {"error": "Email already registered"}

    new_user = models.User( # create new user
        name=user.name,
        phone=user.phone,
        email=user.email,
        password=hash_password(user.password),
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}
