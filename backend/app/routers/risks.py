from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/risks", tags=["risks"])

RISK_NOT_FOUND = "Risk not found"


@router.get("", response_model=list[schemas.RiskOut])
def list_risks(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    control: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    query = db.query(models.Risk).options(joinedload(models.Risk.control)).order_by(models.Risk.updated_at.desc())
    if status:
        query = query.filter(models.Risk.status == status)
    if level:
        query = query.filter(models.Risk.risk_level == level)
    if category:
        query = query.filter(models.Risk.category == category)
    if control:
        query = query.filter(
            models.Risk.control_id.in_(db.query(models.NISTControl.id).filter(models.NISTControl.control_id == control))
        )
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                models.Risk.title.ilike(like),
                models.Risk.description.ilike(like),
                models.Risk.owner.ilike(like),
            )
        )
    return query.all()


@router.post("", response_model=schemas.RiskOut, status_code=201)
def create_risk(payload: schemas.RiskCreate, db: Session = Depends(get_db)):
    return crud.create_risk(db, payload)


@router.get("/{risk_id}", response_model=schemas.RiskOut)
def get_risk(risk_id, db: Session = Depends(get_db)):
    risk = (
        db.query(models.Risk).options(joinedload(models.Risk.control)).filter(models.Risk.id == risk_id).first()
    )
    if not risk:
        raise HTTPException(status_code=404, detail=RISK_NOT_FOUND)
    return risk


@router.put("/{risk_id}", response_model=schemas.RiskOut)
def update_risk(risk_id, payload: schemas.RiskUpdate, db: Session = Depends(get_db)):
    risk = db.query(models.Risk).filter(models.Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail=RISK_NOT_FOUND)
    return crud.update_risk(db, risk, payload)


@router.delete("/{risk_id}", status_code=204)
def delete_risk(risk_id, db: Session = Depends(get_db)):
    risk = db.query(models.Risk).filter(models.Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail=RISK_NOT_FOUND)
    db.delete(risk)
    db.commit()