from pydantic import BaseModel, Field
from pydantic import EmailStr
from decimal import Decimal


#  LOGIN SCHEMA 
class LoginSchema(BaseModel):
    email: str
    password: str

# RESET PASSWORD SCHEMA
class ResetPasswordSchema(BaseModel):
    token: str
    new_password: str

# FORGOT PASSWORD SCHEMA
class ForgotPasswordSchema(BaseModel):
    email: str


# ---------- CATEGORY ----------

class CategorySchema(BaseModel):
    name: str


# ---------- LOCATION ----------

class LocationSchema(BaseModel):
    name: str
    latitude: Decimal = Field(..., ge=-90, le=90, decimal_places=6)
    longitude: Decimal = Field(..., ge=-180, le=180, decimal_places=6)
    category_id: int


class LocationUpdate(BaseModel):
    name: str
    latitude: Decimal = Field(..., ge=-90, le=90, decimal_places=6)
    longitude: Decimal = Field(..., ge=-180, le=180, decimal_places=6)
    category_id: int

# ---------- USER ----------

class UserCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool