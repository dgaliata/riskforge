"""Seed the database with NIST 800-53 controls and the NIST AI RMF 1.0 framework."""

from sqlalchemy.orm import Session

from .ai_rmf_data import AI_CATEGORIES, AI_FUNCTIONS, AI_SUBCATEGORIES
from .models import AIMCategory, AIMFunction, AIMSubcategory, NISTControl, OwaspLLMCategory
from .nist_controls_data import NIST_CONTROLS
from .owasp_llm_data import OWASP_LLM_CATEGORIES


def seed_all(db: Session) -> None:
    _seed_nist_controls(db)
    _seed_ai_rmf(db)
    _seed_owasp_llm(db)
    db.commit()


def _seed_nist_controls(db: Session) -> None:
    existing = db.query(NISTControl).count()
    if existing > 0:
        return
    for row in NIST_CONTROLS:
        (
            control_id,
            family_code,
            family_name,
            control_name,
            description,
            baseline,
            priority,
            related,
        ) = row
        db.add(
            NISTControl(
                control_id=control_id,
                family_code=family_code,
                family_name=family_name,
                control_name=control_name,
                description=description,
                baseline=baseline,
                priority=priority,
                related_controls=related,
            )
        )


def _seed_ai_rmf(db: Session) -> None:
    if db.query(AIMFunction).count() > 0:
        return

    function_map = {}
    for f in AI_FUNCTIONS:
        func = AIMFunction(
            code=f["code"], name=f["name"], description=f["description"], sort_order=f["sort_order"]
        )
        db.add(func)
        db.flush()
        function_map[f["code"]] = func

    category_map = {}
    for function_code, category_code, title, sort_order in AI_CATEGORIES:
        cat = AIMCategory(
            code=category_code,
            title=title,
            sort_order=sort_order,
            function=function_map[function_code],
        )
        db.add(cat)
        db.flush()
        category_map[category_code] = cat

    for category_code, subcategory_code, description in AI_SUBCATEGORIES:
        db.add(
            AIMSubcategory(
                code=subcategory_code,
                description=description,
                category=category_map[category_code],
            )
        )


def _seed_owasp_llm(db: Session) -> None:
    if db.query(OwaspLLMCategory).count() > 0:
        return
    for i, (code, name, description) in enumerate(OWASP_LLM_CATEGORIES, start=1):
        db.add(
            OwaspLLMCategory(
                code=code,
                name=name,
                description=description,
                edition="2026",
                sort_order=i,
            )
        )