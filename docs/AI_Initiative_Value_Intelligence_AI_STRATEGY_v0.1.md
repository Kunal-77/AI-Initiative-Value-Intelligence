# AI Initiative Value Intelligence

## AI Strategy & Model Architecture Specification v0.1

**Status:** Draft / Technical Specification\
**Owner:** AI & Data Engineering\
**Last Updated:** August 2026

---

# 1. Executive Summary

This document specifies the Artificial Intelligence (AI) architecture for the Value Intelligence platform. It outlines prompt design, model routing policies, context window management, and deterministic guardrails. It defines distinct strategies for Business and Personal AI workloads, ensuring zero tenant cross-contamination and strict explainability.

---

# 2. AI Principles & Philosophy

* **Deterministic Priority:** Financial ROI, cost-variance, and KPI targets are computed using deterministic math. AI never calculates numbers; it interprets, explains, and summarizes them.
* **Traceable Attribution:** AI-generated claims or risk scores must point directly to supporting evidence (E0-E6 taxonomy).
* **Advisory Role:** AI is strictly advisory. Decision authority remains with the human user (CFO, manager, individual).
* **Tenant Isolation:** Prompts and context vectors are completely isolated. Organization data never trains public models or leaks to other users.

---

# 3. Model Routing & Provider Abstraction

The platform uses a unified gateway middleware to route prompts to different LLM providers based on:
1. **Context Size Requirements**
2. **Cost-to-Latency Tradeoffs**
3. **Reasoning Strength**

```
                   +------------------------+
                   |       FastAPI API      |
                   +------------------------+
                               |
                               v
                   +------------------------+
                   |   Model Router Layer   |
                   +------------------------+
                     /         |          \
                    v          v           v
            Gemini Flash   Claude Sonnet   GPT-4o
            (Low Latency)  (High Reason)   (Structured)
```

### 3.1 Model Selection Matrix
| Capability | Target Model | Fallback Model | Selection Criteria |
| :--- | :--- | :--- | :--- |
| **Business Case Drafting** | OpenAI GPT-4o | Gemini Flash | High structured schema conformance (Pydantic). |
| **Causal Evidence Analysis** | Claude 3.5 Sonnet | OpenAI GPT-4o | Superior reasoning on dense multi-variable text context. |
| **Personal Renewal Reminders** | Google Gemini Flash | Local Llama 3 | Low latency, low token cost for simple task alerts. |
| **Autonomous Portfolio Audit** | Claude 3.5 Sonnet | OpenAI GPT-4o | Massive context window support. |

---

# 4. Context Management & Retrieval Strategy

## 4.1 Retrieval-Augmented Generation (RAG)
To explain outcomes, the platform implements a local semantic search over unstructured evidence:
1. **Ingestion:** Text-based evidence attachments are chunked (500 tokens) and embedded using `text-embedding-3-small`.
2. **Vector Store:** Embeddings are persisted in PostgreSQL using `pgvector` scoped strictly to `organization_id` or `user_id`.
3. **Retrieval:** Cosine similarity retrieves the top 5 relevant evidence chunks which are appended to the LLM prompt.

## 4.2 Context Window Sanitation
Before prompts are dispatched, a PII scrubbing middleware scans text to redact:
* Credit card numbers
* Bank account details
* Individual names
* Personal phone numbers

---

# 5. Business AI Domain Capabilities

The Business AI engine processes organization data to support tech finance leaders:

### 5.1 Business Case Generator
* **Input:** Raw proposal notes, category, planned cost.
* **Output:** Drafted problem statement, proposed interventions, candidate KPIs, and suggested target thresholds.
* **Guardrails:** Target values are left blank or prompted for manual input to prevent speculative calculations.

### 5.2 ROI Explanation Engine
* **Input:** Planned costs, realized actual expenses, baseline KPI observations, and current outcomes.
* **Output:** Natural language summary explaining cost-variance causes and mapping progress toward objectives.

---

# 6. Personal AI Domain Capabilities

The Personal AI engine processes user data to optimize consumer spend portfolios:

### 6.1 Subscription Advisor
* **Input:** Active subscriptions, cost details, and logs of active login/usage patterns.
* **Output:** Flagging duplicate subscriptions (e.g. holding both ChatGPT Plus and Claude Pro) and recommending optimizations.

### 6.2 Renewal Prediction Engine
* **Input:** Invoice dates and credit card charge transaction histories.
* **Output:** Predictions on upcoming renewal dates, reminding the user to cancel trials before billing triggers.

---

# 7. AI Guardrails & Human-in-the-Loop

To prevent model hallucinations, the platform enforces strict validation controls:
1. **Calculated Verification:** The system cross-checks LLM summaries against SQL-computed ROI metrics. If values conflict by >0.01%, the prompt output is flagged as "Calculation Mismatch" and blocked from display.
2. **Explainability Score:** AI outputs must display a confidence score (0-100) based on the completeness of retrieved evidence.
3. **Explicit Disclaimer:** All AI-generated summaries and advice must render with a standard warning indicating they are model-generated advice.
