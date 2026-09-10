from sqlalchemy.orm import Session

from . import models, schemas


def create_risk(db: Session, data: schemas.RiskCreate) -> models.Risk:
    score, level = models.risk_level_for(data.likelihood, data.impact)
    risk = models.Risk(**data.model_dump(), risk_score=score, risk_level=level)
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return risk


def update_risk(db: Session, risk: models.Risk, data: schemas.RiskUpdate) -> models.Risk:
    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(risk, key, value)
    if "likelihood" in payload or "impact" in payload:
        score, level = models.risk_level_for(risk.likelihood, risk.impact)
        risk.risk_score = score
        risk.risk_level = level
    db.commit()
    db.refresh(risk)
    return risk


def create_ai_risk(db: Session, data: schemas.AIRiskCreate) -> models.AIRisk:
    score, level = models.risk_level_for(data.likelihood, data.impact)
    risk = models.AIRisk(**data.model_dump(), risk_score=score, risk_level=level)
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return risk


def update_ai_risk(db: Session, risk: models.AIRisk, data: schemas.AIRiskUpdate) -> models.AIRisk:
    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(risk, key, value)
    if "likelihood" in payload or "impact" in payload:
        score, level = models.risk_level_for(risk.likelihood, risk.impact)
        risk.risk_score = score
        risk.risk_level = level
    db.commit()
    db.refresh(risk)
    return risk