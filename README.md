# RiskForge

A modern, web-based risk register for **NIST SP 800-53 (Rev 5)** and **NIST AI RMF 1.0**
built to be deployed on AWS. It provides a 5×5 risk matrix, dashboards, control mapping,
an AI-risk section, and CSV reporting.

## Features

- **Risk Register** — full CRUD with filters, search, owners, mitigation tracking
- **5×5 Risk Matrix** — interactive heat map (likelihood × impact) with per-cell drills-down
- **NIST 800-53 Controls Browser** — all 20 control families, baselines, priority, and linked risks
- **AI Risk Register** — two selectable taxonomies per risk:
  - **NIST AI RMF 1.0** — GOVERN / MAP / MEASURE / MANAGE, all 72 subcategories,
    7 trustworthy characteristics, 12 GenAI risk categories (NIST AI 600-1), risk responses
  - **OWASP GenAI LLM Top 10 (2026)** — LLM01–LLM10, filterable, with coverage reporting
- **Dashboard** — posture summary, level/status charts, heat map, recently updated risks
- **Reports** — AI RMF + OWASP LLM coverage, control family coverage, CSV exports for both registers
- **Containerized** — Docker Compose for local testing, ECS Fargate + RDS for AWS

### Why two AI taxonomies?

The two AI frameworks serve different jobs by design:

- **AI RMF subcategories are not controls** — they are activities/outcomes ("legal and
  regulatory requirements understood and documented"). Mapping an individual risk to a
  subcategory like `GOV-1.1` tells you little about the actual failure mode; it is a
  *governance umbrella*, not a per-risk technical mapping.
- **OWASP GenAI LLM Top 10 (2026)** is the load-bearing layer — it supplies the concrete,
  testable technical taxonomy (prompt injection, sensitive-information disclosure, etc.).

Think of it as: **AI RMF = "are we governing AI risk?"** · **OWASP = "what technical thing
can go wrong?"** Together this is the current best-practice pairing and what most GRC tools
ship.

## Tech stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React 18, Vite, TypeScript, Tailwind, Recharts |
| Backend  | Python 3.12, FastAPI, SQLAlchemy, PostgreSQL   |
| Infra    | Docker Compose (local), ECS Fargate + RDS (AWS)|

## Quick start (local, containerized)

```bash
cp .env.example .env     # then set a strong POSTGRES_PASSWORD
docker compose up --build
```

- Web app: http://localhost:3000
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

The backend seeds **191 NIST 800-53 controls** across 20 families, the full **NIST AI
RMF 1.0 framework (4 functions / 19 categories / 72 subcategories)**, and the
**OWASP GenAI LLM Top 10 2026 (LLM01–LLM10)** on first startup.
The register itself starts empty — add risks from the UI.

### Local development (no Docker)

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# needs a Postgres at localhost:5432; provide the connection string (use your real password)
export DATABASE_URL=postgresql+psycopg2://riskuser:YOUR_PGPASS@localhost:5432/riskregister
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## API overview

| Method | Path                       | Description                          |
|--------|----------------------------|--------------------------------------|
| GET    | `/api/risks`               | List risk register entries           |
| POST   | `/api/risks`               | Create a risk                        |
| GET/PUT/DELETE | `/api/risks/{id}` | Read / update / delete a risk        |
| GET    | `/api/controls`            | Browse NIST 800-53 controls          |
| GET    | `/api/controls/families`   | Control family summary               |
| GET    | `/api/ai/framework`        | Full AI RMF hierarchy                |
| GET    | `/api/ai/taxonomy`         | Characteristics / GenAI categories   |
| GET    | `/api/ai/owasp`            | OWASP GenAI LLM Top 10 2026 list     |
| GET/POST| `/api/ai/risks`           | List / create AI risks               |
| GET    | `/api/reports/summary`     | Dashboard summary                    |
| GET    | `/api/reports/risk-export` | CSV export (`risk_type=standard\|ai`)|

## Risk scoring (5×5)

`Score = likelihood × impact` — level thresholds:

| Level    | Score   |
|----------|---------|
| Low      | 1–5     |
| Medium   | 6–11    |
| High     | 12–19   |
| Critical | 20–25   |

## Project structure

```
risk-register/
├── backend/            # FastAPI app
│   ├── app/
│   │   ├── main.py            # app + router wiring
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── seed.py            # control + AI RMF seeding
│   │   ├── nist_controls_data.py
│   │   ├── ai_rmf_data.py     # AI RMF 1.0 dataset
│   │   └── routers/           # risks, controls, ai, reports
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/             # Dashboard, Register, Matrix, Controls, AI, Reports
│   │   ├── components/        # forms, heat map, badges
│   │   ├── api/               # typed API client
│   │   └── lib/risk.ts        # scoring + color helpers
│   └── Dockerfile             # multi-stage, nginx
├── deploy/                     # ECR push + ECS task definitions
├── docs/aws-deployment.md      # step-by-step AWS guide
└── docker-compose.yml
```

## License

MIT