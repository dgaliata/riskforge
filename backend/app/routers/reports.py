import io
import csv

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary", response_model=schemas.DashboardSummary)
def summary(db: Session = Depends(get_db)):
    by_level_rows = db.query(models.Risk.risk_level, func.count(models.Risk.id)).group_by(models.Risk.risk_level).all()
    by_status_rows = db.query(models.Risk.status, func.count(models.Risk.id)).group_by(models.Risk.status).all()
    by_function_rows = (
        db.query(models.AIRisk.function_code, func.count(models.AIRisk.id)).group_by(models.AIRisk.function_code).all()
    )
    by_char_rows = (
        db.query(models.AIRisk.trust_characteristic, func.count(models.AIRisk.id))
        .group_by(models.AIRisk.trust_characteristic)
        .all()
    )
    heat_rows = (
        db.query(models.Risk.likelihood, models.Risk.impact, func.count(models.Risk.id))
        .group_by(models.Risk.likelihood, models.Risk.impact)
        .all()
    )

    recent = (
        db.query(models.Risk)
        .order_by(models.Risk.updated_at.desc())
        .limit(8)
        .all()
    )

    return schemas.DashboardSummary(
        total_risks=db.query(models.Risk).count(),
        total_ai_risks=db.query(models.AIRisk).count(),
        by_level={k or "Unknown": v for k, v in by_level_rows},
        by_status={k or "Unknown": v for k, v in by_status_rows},
        ai_by_function={k or "Unknown": v for k, v in by_function_rows},
        ai_by_characteristic={k or "Unknown": v for k, v in by_char_rows},
        open_critical_high=db.query(models.Risk)
        .filter(models.Risk.status == "Open", models.Risk.risk_level.in_(["High", "Critical"]))
        .count(),
        matrix_heat={f"{l}x{i}": c for l, i, c in heat_rows},
        recent_risks=recent,
    )


def _risk_rows(db: Session):
    rows = db.query(models.Risk, models.NISTControl.control_id).outerjoin(models.NISTControl).all()
    for risk, control_id in rows:
        yield {
            "title": risk.title,
            "description": risk.description or "",
            "status": risk.status,
            "category": risk.category or "",
            "likelihood": risk.likelihood,
            "impact": risk.impact,
            "risk_score": risk.risk_score,
            "risk_level": risk.risk_level,
            "owner": risk.owner or "",
            "identified_date": risk.identified_date.isoformat() if risk.identified_date else "",
            "target_mitigation_date": risk.target_mitigation_date.isoformat() if risk.target_mitigation_date else "",
            "mitigation_notes": risk.mitigation_notes or "",
            "nist_control": control_id or "",
        }


@router.get("/risk-export")
def export_risks(db: Session = Depends(get_db), format: str = Query("csv"), risk_type: str = Query("standard")):
    if risk_type == "ai":
        rows = (
            db.query(models.AIRisk)
            .outerjoin(models.OwaspLLMCategory)
            .add_columns(models.OwaspLLMCategory.code.label("owasp_code"))
            .all()
        )
        fieldnames = [
            "title", "description", "status", "ai_system_name", "taxonomy", "function_code",
            "subcategory", "owasp_category", "trust_characteristic", "gai_risk_category",
            "likelihood", "impact", "risk_score", "risk_level", "risk_response",
            "residual_risk", "owner", "review_date",
        ]
        data = [
            {
                "title": r.title,
                "description": r.description or "",
                "status": r.status,
                "ai_system_name": r.ai_system_name or "",
                "taxonomy": r.taxonomy,
                "function_code": r.function_code or "",
                "subcategory": r.subcategory.code if r.subcategory else "",
                "owasp_category": owasp_code or "",
                "trust_characteristic": r.trust_characteristic or "",
                "gai_risk_category": r.gai_risk_category or "",
                "likelihood": r.likelihood,
                "impact": r.impact,
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "risk_response": r.risk_response or "",
                "residual_risk": r.residual_risk or "",
                "owner": r.owner or "",
                "review_date": r.review_date.isoformat() if r.review_date else "",
            }
            for r, owasp_code in rows
        ]
    else:
        fieldnames = [
            "title", "description", "status", "category", "likelihood", "impact",
            "risk_score", "risk_level", "owner", "identified_date", "target_mitigation_date",
            "mitigation_notes", "nist_control",
        ]
        data = list(_risk_rows(db))

    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)

    filename = "ai_risks.csv" if risk_type == "ai" else "risks.csv"
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )