from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy import DateTime

# CREATE USERS TABLE (ADMIN + REGULAR USERS)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)          
    phone = Column(String, nullable=False)          

    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="user") # user or superadmin
    is_active = Column(Boolean, default=True)

# CREATE CATEGORIES TABLE
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

# CREATE LOCATIONS TABLE
class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    latitude = Column(Numeric(9,6))
    longitude = Column(Numeric(9,6))
    category_id = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category")

# CREATE PASSWORD RESET TOKENS TABLE
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    token = Column(String, unique=True, index=True, nullable=False)

    expires_at = Column(DateTime, nullable=False)

    is_used = Column(Boolean, default=False)

    user = relationship("User")