from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/controls", tags=["controls"])


@router.get("", response_model=list[schemas.NISTControlOut])
def list_controls(
    db: Session = Depends(get_db),
    family: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    query = db.query(models.NISTControl).order_by(models.NISTControl.control_id)
    if family:
        query = query.filter(models.NISTControl.family_code == family.upper())
    if search:
        like = f"%{search}%"
        query = query.filter(
            (models.NISTControl.control_id.ilike(like))
            | (models.NISTControl.control_name.ilike(like))
            | (models.NISTControl.description.ilike(like))
        )
    return query.all()


@router.get("/families")
def list_families(db: Session = Depends(get_db)):
    rows = (
        db.query(
            models.NISTControl.family_code,
            models.NISTControl.family_name,
            func.count(models.NISTControl.id).label("control_count"),
        )
        .group_by(models.NISTControl.family_code, models.NISTControl.family_name)
        .order_by(models.NISTControl.family_code)
        .all()
    )
    return [
        {"family_code": code, "family_name": name, "control_count": count} for code, name, count in rows
    ]


@router.get("/{control_id}", response_model=schemas.NISTControlDetail)
def get_control(control_id: str, db: Session = Depends(get_db)):
    control = db.query(models.NISTControl).filter(models.NISTControl.control_id == control_id.upper()).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    risk_count = db.query(func.count(models.Risk.id)).filter(models.Risk.control_id == control.id).scalar() or 0
    control.risk_count = risk_count
    return control