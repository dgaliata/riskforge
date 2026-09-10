import uuid
from datetime import date, datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .database import Base


class TimestampMixin:
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)


class NISTControl(Base, TimestampMixin):
    """A NIST SP 800-53 Rev 5 control."""

    __tablename__ = "nist_controls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    control_id = Column(String(20), unique=True, nullable=False, index=True)  # e.g. AC-2
    family_code = Column(String(2), nullable=False, index=True)  # e.g. AC
    family_name = Column(String(64), nullable=False)
    control_name = Column(String(160), nullable=False)
    description = Column(Text, nullable=False)
    baseline = Column(String(48), nullable=True)  # e.g. "Low, Moderate, High"
    priority = Column(String(8), nullable=True)  # P1 / P2 / P3 / P0
    related_controls = Column(Text, nullable=True)

    risks = relationship("Risk", back_populates="control")


class Risk(Base, TimestampMixin):
    """A traditional information security risk mapped to NIST SP 800-53."""

    __tablename__ = "risks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(24), default="Open", nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)
    likelihood = Column(Integer, nullable=False, index=True)  # 1-5
    impact = Column(Integer, nullable=False, index=True)  # 1-5
    risk_score = Column(Integer, nullable=True)  # likelihood * impact
    risk_level = Column(String(16), nullable=True, index=True)  # Low/Medium/High/Critical
    owner = Column(String(120), nullable=True)
    identified_date = Column(Date, nullable=True)
    target_mitigation_date = Column(Date, nullable=True)
    mitigation_notes = Column(Text, nullable=True)
    control_id = Column(UUID(as_uuid=True), ForeignKey("nist_controls.id"), nullable=True)

    control = relationship("NISTControl", back_populates="risks")


class AIMFunction(Base):
    """NIST AI RMF top-level function (GOVERN / MAP / MEASURE / MANAGE)."""

    __tablename__ = "ai_functions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(16), unique=True, nullable=False, index=True)
    name = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)

    categories = relationship("AIMCategory", back_populates="function", cascade="all, delete-orphan")


class AIMCategory(Base):
    """NIST AI RMF category under a function (e.g. GOV-1)."""

    __tablename__ = "ai_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(16), unique=True, nullable=False, index=True)
    function_id = Column(UUID(as_uuid=True), ForeignKey("ai_functions.id"), nullable=False)
    title = Column(String(200), nullable=False)
    sort_order = Column(Integer, default=0)

    function = relationship("AIMFunction", back_populates="categories")
    subcategories = relationship("AIMSubcategory", back_populates="category", cascade="all, delete-orphan")


class AIMSubcategory(Base):
    """NIST AI RMF subcategory (e.g. GOV-1.1)."""

    __tablename__ = "ai_subcategories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("ai_categories.id"), nullable=False)
    description = Column(Text, nullable=False)

    category = relationship("AIMCategory", back_populates="subcategories")
    risks = relationship("AIRisk", back_populates="subcategory")


class OwaspLLMCategory(Base):
    """OWASP GenAI LLM Top 10 category (2026 edition: LLM01..LLM10)."""

    __tablename__ = "owasp_llm_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(8), unique=True, nullable=False, index=True)  # LLM01
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    edition = Column(String(16), default="2026", nullable=False)
    sort_order = Column(Integer, default=0)

    risks = relationship("AIRisk", back_populates="owasp_category")


class AIRisk(Base, TimestampMixin):
    """An AI risk mapped to NIST AI RMF 1.0 and/or the OWASP GenAI LLM Top 10."""

    __tablename__ = "ai_risks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(24), default="Identified", nullable=False, index=True)
    ai_system_name = Column(String(160), nullable=True)
    taxonomy = Column(String(24), default="ai_rmf", nullable=False, index=True)  # ai_rmf | owasp
    function_code = Column(String(16), nullable=True, index=True)  # GOVERN / MAP / MEASURE / MANAGE
    subcategory_id = Column(UUID(as_uuid=True), ForeignKey("ai_subcategories.id"), nullable=True)
    owasp_llm_id = Column(UUID(as_uuid=True), ForeignKey("owasp_llm_categories.id"), nullable=True)
    trust_characteristic = Column(String(64), nullable=True, index=True)  # Valid & Reliable, Safe, etc.
    gai_risk_category = Column(String(64), nullable=True)  # NIST AI 600-1 GenAI risk type, optional
    likelihood = Column(Integer, nullable=False, index=True)  # 1-5
    impact = Column(Integer, nullable=False, index=True)  # 1-5
    risk_score = Column(Integer, nullable=True)
    risk_level = Column(String(16), nullable=True, index=True)
    risk_response = Column(String(24), nullable=True)  # Mitigate / Transfer / Avoid / Accept
    residual_risk = Column(Float, nullable=True)
    owner = Column(String(120), nullable=True)
    review_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    subcategory = relationship("AIMSubcategory", back_populates="risks")
    owasp_category = relationship("OwaspLLMCategory", back_populates="risks")


def risk_level_for(likelihood: int, impact: int) -> tuple[int, str]:
    """Compute 5x5 risk score and level using NIST/ISO-style thresholding."""
    score = likelihood * impact
    if score >= 20:
        level = "Critical"
    elif score >= 12:
        level = "High"
    elif score >= 6:
        level = "Medium"
    else:
        level = "Low"
    return score, level