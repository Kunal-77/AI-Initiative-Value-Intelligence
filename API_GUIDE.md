# API Specification Guide — FastAPI Endpoints

## Overview
The backend API is built using FastAPI with Pydantic validation and PostgreSQL RLS tenant isolation.

---

## 1. Initiative Management (`/api/v1/initiatives`)
- `GET /api/v1/initiatives` — List tenant initiatives with search, filtering, and pagination.
- `POST /api/v1/initiatives` — Create new initiative with planned budget and ROI target.
- `GET /api/v1/initiatives/{id}` — Fetch detailed initiative model.
- `PATCH /api/v1/initiatives/{id}` — Update initiative status or budget.

---

## 2. AI Decision Studio (`/api/v1/ai`)
- `POST /api/v1/ai/analyze` — Run AI analysis on initiative.
- `POST /api/v1/ai/stream` — Stream LLM response chunks.
- `GET /api/v1/ai/recommendations` — Fetch AI recommendation feed.

---

## 3. Financial Intelligence (`/api/v1/financials`)
- `GET /api/v1/financials/metrics` — Fetch Executive financial summary.
- `GET /api/v1/financials/benefits` — List realized and forecast benefits.
- `POST /api/v1/financials/costs` — Record CAPEX/OPEX cost ledger entries.

---

## 4. Governance & Workflows (`/api/v1/workflows`)
- `GET /api/v1/workflows/approvals` — Fetch pending approval queue.
- `POST /api/v1/workflows/approvals/{id}/transition` — Execute approval action (`APPROVE`, `REJECT`, `REQUEST_CHANGES`, `ESCALATE`).

---

## 5. System Administration (`/api/v1/admin`)
- `GET /api/v1/admin/users` — List enterprise user directory.
- `POST /api/v1/admin/invitations` — Send user invitations.
- `GET /api/v1/admin/security` — Retrieve security posture metrics.
