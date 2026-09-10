import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class NISTControlOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    control_id: str
    family_code: str
    family_name: str
    control_name: str
    description: str
    baseline: Optional[str] = None
    priority: Optional[str] = None


class NISTControlDetail(NISTControlOut):
    related_controls: Optional[str] = None
    risk_count: int = 0


class RiskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    status: str = "Open"
    category: Optional[str] = None
    likelihood: int = Field(ge=1, le=5)
    impact: int = Field(ge=1, le=5)
    owner: Optional[str] = None
    identified_date: Optional[date] = None
    target_mitigation_date: Optional[date] = None
    mitigation_notes: Optional[str] = None
    control_id: Optional[uuid.UUID] = None


class RiskCreate(RiskBase):
    pass


class RiskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    likelihood: Optional[int] = Field(default=None, ge=1, le=5)
    impact: Optional[int] = Field(default=None, ge=1, le=5)
    owner: Optional[str] = None
    identified_date: Optional[date] = None
    target_mitigation_date: Optional[date] = None
    mitigation_notes: Optional[str] = None
    control_id: Optional[uuid.UUID] = None


class RiskOut(RiskBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    control: Optional[NISTControlOut] = None


class AIMFunctionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    name: str
    description: str
    sort_order: int
    categories: list["AIMCategoryOut"] = []


class AIMCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    title: str
    sort_order: int
    subcategories: list["AIMSubcategoryOut"] = []


class AIMSubcategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    description: str


class AIFrameOut(BaseModel):
    """A single AI RMF node with its subcategories."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    title: str
    sort_order: int
    subcategories: list[AIMSubcategoryOut] = []


class AIRiskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    status: str = "Identified"
    ai_system_name: Optional[str] = None
    taxonomy: str = "ai_rmf"  # ai_rmf | owasp
    function_code: Optional[str] = None
    subcategory_id: Optional[uuid.UUID] = None
    owasp_llm_id: Optional[uuid.UUID] = None
    trust_characteristic: Optional[str] = None
    gai_risk_category: Optional[str] = None
    likelihood: int = Field(ge=1, le=5)
    impact: int = Field(ge=1, le=5)
    risk_response: Optional[str] = None
    residual_risk: Optional[float] = None
    owner: Optional[str] = None
    review_date: Optional[date] = None
    notes: Optional[str] = None


class AIRiskCreate(AIRiskBase):
    pass


class AIRiskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    ai_system_name: Optional[str] = None
    taxonomy: Optional[str] = None
    function_code: Optional[str] = None
    subcategory_id: Optional[uuid.UUID] = None
    owasp_llm_id: Optional[uuid.UUID] = None
    trust_characteristic: Optional[str] = None
    gai_risk_category: Optional[str] = None
    likelihood: Optional[int] = Field(default=None, ge=1, le=5)
    impact: Optional[int] = Field(default=None, ge=1, le=5)
    risk_response: Optional[str] = None
    residual_risk: Optional[float] = None
    owner: Optional[str] = None
    review_date: Optional[date] = None
    notes: Optional[str] = None


class OwaspLLMCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    name: str
    description: str


class AIRiskOut(AIRiskBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    subcategory: Optional[AIMSubcategoryOut] = None
    owasp_category: Optional[OwaspLLMCategoryOut] = None


class DashboardSummary(BaseModel):
    total_risks: int
    total_ai_risks: int
    by_level: dict[str, int]
    by_status: dict[str, int]
    ai_by_function: dict[str, int]
    ai_by_characteristic: dict[str, int]
    open_critical_high: int
    matrix_heat: dict[str, int]  # "5x5" -> count
    recent_risks: list[RiskOut]