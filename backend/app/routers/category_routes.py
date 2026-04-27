from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app import models
from app.schemas import CategorySchema

router = APIRouter()


# DB Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# GET ALL CATEGORIES
@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):

    cats = db.query(models.Category).all()

    return [
        {"id": c.id, "name": c.name}
        for c in cats
    ]


# CREATE CATEGORY
@router.post("/categories")
def create_category(category: CategorySchema, db: Session = Depends(get_db)):

    new_category = models.Category(name=category.name)

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return {
        "id": new_category.id,
        "name": new_category.name
    }


# UPDATE CATEGORY
@router.put("/categories/{id}")
def update_category(id: int, category: CategorySchema, db: Session = Depends(get_db)):

    cat = db.query(models.Category).filter(models.Category.id == id).first()

    if not cat:
        return {"error": "Category not found"}

    cat.name = category.name

    db.commit()
    db.refresh(cat)

    return {
        "id": cat.id,
        "name": cat.name
    }


# DELETE CATEGORY
@router.delete("/categories/{id}")
def delete_category(id: int, db: Session = Depends(get_db)):

    cat = db.query(models.Category).filter(models.Category.id == id).first()

    if cat:
        db.delete(cat)
        db.commit()

    return {"message": "deleted"}
