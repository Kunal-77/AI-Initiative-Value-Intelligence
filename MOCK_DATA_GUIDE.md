# AI Initiative Value Intelligence — Canonical Mock Data Guide

This document defines the canonical mock dataset for the **AI Initiative Value Intelligence** platform. It serves as the single source of truth for all mock data used across UI components, dashboards, initiative ledgers, AI Decision Studio scenarios, and audit logs.

All future UI features, mock pages, and demo states **MUST** import and reuse this dataset from `apps/web/src/lib/mockData.ts` to prevent data drift and inline duplicates.

---

## 1. Enterprise Organizations

| Organization ID | Name | Legal Entity | Industry | Annual AI Budget | Primary Region |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `org_acme_corp` | **Acme Enterprise Solutions** | Acme Corp Inc. | Financial Services & Fintech | $5,000,000 | US-East (Virginia) |
| `org_globex_tech` | **Globex Global Technologies** | Globex Holdings Ltd. | Cloud Infrastructure & SaaS | $8,500,000 | US-West (Oregon) |
| `org_soylent_corp` | **Soylent Health & Life Sciences** | Soylent Pharma AG | Healthcare & Life Sciences | $3,200,000 | EU-Central (Frankfurt) |

---

## 2. Business Units & Departments

| Business Unit ID | Name | Code | Executive Lead | Focus Area |
| :--- | :--- | :--- | :--- | :--- |
| `bu_ops` | **Operations & Customer Care** | `OPS` | Sarah Jenkins (CFO) | Customer Support Automation, Tier-1 LLM Triage |
| `bu_eng` | **Software Engineering & Cloud** | `ENG` | Alex Rivera (VP Eng) | Developer Throughput, AI Code Generation |
| `bu_fin` | **Finance & Risk Analytics** | `FIN` | Marcus Vance (CTO) | Fraud Detection, Portfolio Risk Modeling |
| `bu_leg` | **Legal & Compliance** | `LEG` | Elena Rostova (General Counsel) | Contract Analysis, Document Processing |
| `bu_log` | **Logistics & Supply Chain** | `LOG` | James Thornton (COO) | Demand Forecasting, Inventory Optimization |

---

## 3. Executive Personas & User Profiles

| Persona ID | Name | Role | Email | Department | Initials |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `usr_cfo` | **Sarah Jenkins** | Chief Financial Officer (CFO) | `sarah.jenkins@acme.com` | Executive / Finance | `SJ` |
| `usr_vp_eng` | **Alex Rivera** | VP of Software Engineering | `alex.rivera@acme.com` | Engineering | `AR` |
| `usr_cto` | **Marcus Vance** | Chief Technology Officer (CTO) | `marcus.vance@acme.com` | Technology | `MV` |
| `usr_pm` | **David Miller** | Principal Product Manager | `david.miller@acme.com` | Operations | `DM` |
| `usr_ai_engine` | **Value Intel AI Engine** | Decision Intelligence Agent | `ai-engine@system.internal` | AI Value Studio | `VI` |

---

## 4. Canonical Strategic Initiatives Portfolio

| Initiative ID | Initiative Name | Business Area | Lifecycle State | Planned Budget | Realized Benefit | ROI % |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `init_cs_auto` | **Customer Support Automation** | Operations & Care | `ACTIVE` | $650,000 | $1,400,000 / yr | 215% |
| `init_dev_pilot` | **AI Code Assistant Pilot** | Software Engineering | `ACTIVE` | $320,000 | $850,000 / yr | 265% |
| `init_doc_proc` | **Automated Document Processing** | Legal & Compliance | `SUBMITTED` | $280,000 | $620,000 / yr | 221% |
| `init_supply_chain` | **Predictive Supply Chain Demand** | Logistics & Supply | `COMPLETED` | $750,000 | $1,980,000 / yr | 264% |
| `init_fraud_detect` | **Real-Time Fraud Triage Engine** | Finance & Risk | `ACTIVE` | $900,000 | $2,450,000 / yr | 272% |
| `init_hr_onboard` | **HR Onboarding Assistant** | Operations & Care | `DRAFT` | $150,000 | $310,000 / yr | 206% |

---

## 5. Cost Categories & Line Items

| Category ID | Category Name | Description | Default Allocation % |
| :--- | :--- | :--- | :--- |
| `cat_gpu` | **Cloud Compute & Inference** | GPU Clusters (NVIDIA A100/H100), Vertex AI / Bedrock endpoints | 45% |
| `cat_llm` | **LLM API & Model Licenses** | OpenAI API, Anthropic Claude, HuggingFace Enterprise | 30% |
| `cat_eng` | **Engineering & Integration** | Internal dev hours, consulting, MLOps pipeline setup | 20% |
| `cat_sec` | **Security & Compliance** | Data masking, SOC2 auditing, red-teaming evaluations | 5% |

---

## 6. AI Decision Studio Recommendations

| Recommendation ID | Title | Impact Category | Expected Savings | Confidence | Citation Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `rec_gpu_opt` | **Consolidate GPU Inference Clusters** | Compute Optimization | +$140,000 / yr | 94% | `AI Baseline Projections v2.4` |
| `rec_base_recal` | **Recalibrate Support Bot Target Baseline** | Target Metric Realignment | +12% Uplift | 88% | `Customer Care Performance Audit` |
| `rec_model_dist` | **Distill Llama-3 70B to 8B for Triage** | Latency & Cost Reduction | +$85,000 / yr | 91% | `MLOps Model Evaluation Gate` |

---

## 7. Audit & Event Logs

| Log ID | Event Description | Actor Name | Timestamp | Severity |
| :--- | :--- | :--- | :--- | :--- |
| `log_001` | Baseline Financial Milestone approved for Customer Support Automation | Sarah Jenkins (CFO) | 25m ago | `SUCCESS` |
| `log_002` | AI Value Studio generated GPU cost optimization scenario (-$140k/yr) | Value Intel AI Engine | 2h ago | `INFO` |
| `log_003` | New cost line item added: NVIDIA A100 Tensor Cloud Compute Cluster | Alex Rivera (VP Eng) | 5h ago | `NEUTRAL` |
| `log_004` | Initiative status transitioned to ACTIVE for AI Code Assistant Pilot | David Miller (PM) | 1d ago | `SUCCESS` |

---

## 8. Portfolio KPI Aggregates

* **Total Realized Value**: `$4.85M` (+$18.4% vs. target baseline `$4.10M`)
* **Average Initiative ROI**: `284%` (+24.2% across 12 active initiatives)
* **Active Portfolio Count**: `14` (+2 new in Q3, 1 completed)
* **Budget Utilization Rate**: `78.2%` ($1.82M spent of $2.33M budget)
* **Portfolio Health**: 9 Healthy & On Track, 3 Cost Variance Risk, 2 Pending Review

---

## 9. Business Terminology Standards

* **Initiative**: A strategic business investment deploying AI technology to solve a specific operational problem.
* **Baseline Value**: The historical pre-AI performance metric or financial cost level used to measure net value creation.
* **Realized Benefit**: Quantifiable monetary savings or revenue increase produced by an active initiative.
* **Cost Variance**: Percentage deviation between actual cloud/operational spend and planned budget.
* **Lifecycle State**: The formal approval phase (`DRAFT`, `SUBMITTED`, `ACTIVE`, `COMPLETED`, `ABANDONED`).
