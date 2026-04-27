from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app import models
from app.schemas import LocationSchema, LocationUpdate
from decimal import Decimal, ROUND_HALF_UP

router = APIRouter()

# DB Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




# GET ALL LOCATIONS (Map UI)
@router.get("/locations")
def get_locations(db: Session = Depends(get_db)):
    locations = db.query(models.Location).all()

    return [
        {
            "id": loc.id,
            "name": loc.name,
            "latitude": float(loc.latitude),
            "longitude": float(loc.longitude),
            "category_id": loc.category_id,  # REAL ID
            "category_name": loc.category.name if loc.category else "",
        }
        for loc in locations
    ]



# CREATE LOCATION
@router.post("/locations")
def create_location(location: LocationSchema, db: Session = Depends(get_db)):

    new_location = models.Location(
        name=location.name,
        latitude=location.latitude.quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP),
        longitude=location.longitude.quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP),
        category_id=location.category_id,
    )

    db.add(new_location)
    db.commit()
    db.refresh(new_location)

    return {"id": new_location.id, "name": new_location.name}


# UPDATE LOCATION
@router.put("/locations/{id}")
def update_location(id: int, location: LocationUpdate, db: Session = Depends(get_db)):

    loc = db.query(models.Location).filter(models.Location.id == id).first()

    if not loc:
        return {"error": "Location not found"}

    loc.name = location.name
    loc.latitude = location.latitude.quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP)
    loc.longitude = location.longitude.quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP)
    loc.category_id = location.category_id

    db.commit()
    db.refresh(loc)

    return loc


# DELETE LOCATION
@router.delete("/locations/{id}")
def delete_location(id: int, db: Session = Depends(get_db)):

    loc = db.query(models.Location).filter(models.Location.id == id).first()

    if loc:
        db.delete(loc)
        db.commit()

    return {"message": "deleted"}
