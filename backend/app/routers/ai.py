from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from .. import crud, models, schemas
from ..ai_rmf_data import GAI_RISK_CATEGORIES, RISK_RESPONSES, TRUST_CHARACTERISTICS
from ..database import get_db

router = APIRouter(prefix="/api/ai", tags=["ai-rmf"])

AI_RISK_NOT_FOUND = "AI risk not found"


@router.get("/functions")
def list_functions(db: Session = Depends(get_db)):
    functions = db.query(models.AIMFunction).order_by(models.AIMFunction.sort_order).all()
    return [
        {
            "code": f.code,
            "name": f.name,
            "description": f.description,
        }
        for f in functions
    ]


@router.get("/framework", response_model=list[schemas.AIMFunctionOut])
def get_framework(db: Session = Depends(get_db)):
    functions = (
        db.query(models.AIMFunction)
        .options(joinedload(models.AIMFunction.categories).joinedload(models.AIMCategory.subcategories))
        .order_by(models.AIMFunction.sort_order)
        .all()
    )
    return functions


@router.get("/taxonomy")
def get_taxonomy():
    return {
        "trust_characteristics": TRUST_CHARACTERISTICS,
        "gai_risk_categories": GAI_RISK_CATEGORIES,
        "risk_responses": RISK_RESPONSES,
    }


@router.get("/owasp", response_model=list[schemas.OwaspLLMCategoryOut])
def list_owasp_alignment(db: Session = Depends(get_db)):
    """OWASP GenAI LLM Top 10 2026 categories (LLM01..LLM10)."""
    return (
        db.query(models.OwaspLLMCategory)
        .order_by(models.OwaspLLMCategory.sort_order)
        .all()
    )


@router.get("/risks", response_model=list[schemas.AIRiskOut])
def list_ai_risks(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None),
    function: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    characteristic: Optional[str] = Query(None),
    taxonomy: Optional[str] = Query(None),
    owasp: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    query = (
        db.query(models.AIRisk)
        .options(
            joinedload(models.AIRisk.subcategory).joinedload(models.AIMSubcategory.category),
            joinedload(models.AIRisk.owasp_category),
        )
        .order_by(models.AIRisk.updated_at.desc())
    )
    if status:
        query = query.filter(models.AIRisk.status == status)
    if function:
        query = query.filter(models.AIRisk.function_code == function)
    if level:
        query = query.filter(models.AIRisk.risk_level == level)
    if characteristic:
        query = query.filter(models.AIRisk.trust_characteristic == characteristic)
    if taxonomy:
        query = query.filter(models.AIRisk.taxonomy == taxonomy)
    if owasp:
        query = query.join(models.OwaspLLMCategory).filter(models.OwaspLLMCategory.code == owasp)
    if search:
        like = f"%{search}%"
        query = query.filter(
            (models.AIRisk.title.ilike(like))
            | (models.AIRisk.ai_system_name.ilike(like))
            | (models.AIRisk.description.ilike(like))
        )
    return query.all()


@router.post("/risks", response_model=schemas.AIRiskOut, status_code=201)
def create_ai_risk(payload: schemas.AIRiskCreate, db: Session = Depends(get_db)):
    _validate_ai_mapping(db, payload.taxonomy, payload.subcategory_id, payload.owasp_llm_id)
    return crud.create_ai_risk(db, payload)


@router.get("/risks/{risk_id}", response_model=schemas.AIRiskOut)
def get_ai_risk(risk_id, db: Session = Depends(get_db)):
    risk = (
        db.query(models.AIRisk)
        .options(
            joinedload(models.AIRisk.subcategory).joinedload(models.AIMSubcategory.category),
            joinedload(models.AIRisk.owasp_category),
        )
        .filter(models.AIRisk.id == risk_id)
        .first()
    )
    if not risk:
        raise HTTPException(status_code=404, detail=AI_RISK_NOT_FOUND)
    return risk


@router.put("/risks/{risk_id}", response_model=schemas.AIRiskOut)
def update_ai_risk(risk_id, payload: schemas.AIRiskUpdate, db: Session = Depends(get_db)):
    risk = db.query(models.AIRisk).filter(models.AIRisk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail=AI_RISK_NOT_FOUND)
    _validate_ai_mapping(
        db, payload.taxonomy or risk.taxonomy, payload.subcategory_id, payload.owasp_llm_id
    )
    return crud.update_ai_risk(db, risk, payload)


@router.delete("/risks/{risk_id}", status_code=204)
def delete_ai_risk(risk_id, db: Session = Depends(get_db)):
    risk = db.query(models.AIRisk).filter(models.AIRisk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail=AI_RISK_NOT_FOUND)
    db.delete(risk)
    db.commit()


def _validate_ai_mapping(db: Session, taxonomy: str, subcategory_id, owasp_llm_id) -> None:
    if taxonomy not in ("ai_rmf", "owasp"):
        raise HTTPException(status_code=400, detail="taxonomy must be 'ai_rmf' or 'owasp'")
    if subcategory_id:
        sub = (
            db.query(models.AIMSubcategory)
            .filter(models.AIMSubcategory.id == subcategory_id)
            .first()
        )
        if not sub:
            raise HTTPException(status_code=400, detail="Unknown AI RMF subcategory")
    if owasp_llm_id:
        cat = (
            db.query(models.OwaspLLMCategory)
            .filter(models.OwaspLLMCategory.id == owasp_llm_id)
            .first()
        )
        if not cat:
            raise HTTPException(status_code=400, detail="Unknown OWASP LLM category")