AI INITIATIVE VALUE INTELLIGENCE

IMPLEMENTATION PLAN v0.1

Validation-first build plan from product definition to external pilot



Status

Working execution plan — subject to validation and technical spikes

Date

July 29, 2026

Build strategy

Vertical slices + validation gates

Architecture

Next.js + FastAPI + PostgreSQL + Clerk

Primary V0 input

Manual entry + CSV

Primary outcome

Trustworthy review → recommendation → human decision → measured outcome



1. Purpose

This plan turns the approved product direction and working technical specifications into an executable build sequence. The objective is not to implement every document literally. The objective is to build the smallest credible product that can validate whether organizations will trust and use evidence-based AI initiative reviews for real decisions.

The plan uses vertical slices so that product behavior, data, evidence, security and UX are tested together instead of building isolated frontend/backend layers for months.

2. Definition of V0 Success

A real organization can create an initiative and define investment, primary KPI, baseline, target and guardrail.

Operational data can be entered manually or imported from CSV with provenance and quality feedback.

The system calculates authoritative metric changes deterministically.

Claims and supporting/conflicting evidence can be represented and inspected.

A review package can be generated from a reproducible snapshot.

The product can produce a grounded recommendation without pretending association is causation.

A human can record a decision, rationale and conditions.

The product can later compare expected and actual post-decision outcomes.

Tenant isolation, authorization, audit and basic production security are implemented before external customer data.

At least a small number of target users can complete the core workflow and find it meaningfully better than spreadsheet + slide + meeting workflows.

3. Delivery Strategy

Build one end-to-end reference scenario first: AI Support Automation. Use it as the design, data, evidence, testing and demo fixture.

Vertical slice:

Sign in → Organization → Initiative → Measurement Plan → Data → Evidence → Review → Recommendation → Human Decision → Follow-up Outcome

Do not begin with a connector marketplace.

Do not begin with autonomous agents.

Do not begin with a generic executive dashboard.

Do not build a separate warehouse, graph database or dedicated vector database for V0.

Do not add infrastructure because it appears in enterprise architecture diagrams.

Every major feature must answer a validated user problem or support the core scenario.

4. Workstreams

Workstream

Responsibility

Product validation

Customer interviews, workflow validation, pilot definition, acceptance criteria.

UX/product design

Prototype flows, information hierarchy, states, evidence inspection, usability testing.

Frontend

Next.js application, typed API client, accessible UI.

Backend/domain

FastAPI modules, authorization, domain rules, APIs.

Data/evidence

Imports, metric engine, provenance, quality, claims/evidence.

AI

Grounded assistance, tool contracts, structured outputs, evaluations.

Security/privacy

Tenant isolation, secrets, uploads, logging, provider/privacy controls.

Platform/operations

Environments, database, storage, worker, observability, CI/CD.

Quality

Automated tests, scenario fixtures, AI evals, security tests.

5. Phase 0 — Validation and Scope Freeze

Goal: reduce product risk before implementation volume increases.

Interview target users across finance, operations, transformation/AI leadership and initiative owners.

Validate the actual review workflow: who prepares evidence, who challenges it, who decides, and where approval occurs.

Test whether the five recommendation types match real decision language.

Validate whether customers will begin with CSV/manual data.

Identify the first 3–5 metrics/value models that repeat across target use cases.

Validate which financial value categories buyers accept: realized savings, avoided cost, released capacity, modeled value.

Test evidence-strength language with users; avoid academic terminology if it slows decisions.

Validate whether external decisions/approvals must be recorded.

Identify minimum enterprise security requirements for first pilots.

Select one initial pilot use case.

Exit gate: Core Scenario #1 and V0 scope are updated from customer evidence; unresolved product assumptions are explicitly accepted, changed or removed.

6. Phase 1 — Product Prototype

Goal: prove the workflow and information design before full backend implementation.

Build high-fidelity prototype for initiative creation, measurement plan, initiative detail, review workspace and decision recording.

Design the evidence drawer/source inspection behavior.

Design partial/stale/blocked data states.

Test recommendation support language and conditions.

Test executive summary density with target users.

Test how much methodology users want visible by default.

Test role-specific views without creating separate products.

Exit gate: target users can understand what the initiative is, what changed, what evidence supports it, what is uncertain and what decision is being requested without product-team explanation.

7. Phase 2 — Engineering Foundation

Goal: establish a secure, boring foundation that supports rapid vertical-slice development.

Frontend

Create Next.js + TypeScript application.

Set application routing/layout and authenticated shell.

Introduce accessible UI primitives after prototype direction is established.

Create typed API client and error/loading patterns.

Backend

Create FastAPI modular-monolith project.

Configure Pydantic settings/contracts.

Configure SQLAlchemy 2.x and Alembic.

Create domain module boundaries from TRD.

Add structured error envelope and correlation IDs.

Infrastructure

Provision development/staging PostgreSQL.

Provision private object storage.

Configure Clerk development/staging instances.

Create environment secret management.

Containerize backend/worker.

Create CI pipeline for lint/type/test/secret/dependency checks.

Add structured logs and basic telemetry.

Exit gate: authenticated frontend can call a protected backend endpoint, resolve an internal organization/user and perform a tenant-scoped database operation in staging.

8. Phase 3 — Identity, Tenancy and Authorization

Goal: security boundary exists before business data expands.

Implement organizations and users.

Implement Clerk user/org mapping.

Implement organization memberships.

Define permission matrix for working roles.

Create centralized authorization checks.

Add tenant scope to repositories/services.

Implement membership/admin flows needed for V0.

Audit role/membership changes.

Write cross-tenant API/integration tests.

Exit gate: automated tests prove a user cannot access or mutate another tenant's resources by changing IDs.

9. Phase 4 — Initiative and Business Case Slice

Goal: create the first meaningful product object.

Initiative create/read/update/archive.

Owner and lifecycle.

Problem statement, intervention and expected business outcome.

Planned/actual start and review date.

Initiative version snapshot for submitted/approved business meaning.

Investment model and cost items.

Audit material edits.

Frontend initiative list/detail/create flow.

Exit gate: AI Support Automation can be represented accurately with its initial investment and business case.

10. Phase 5 — Measurement Plan

Goal: define what success means before ingesting outcome data.

Metric definitions and versions.

Primary KPI, guardrail, secondary/context assignment.

Baseline creation and approval.

Target/threshold configuration.

Validator ownership.

Metric definition/version UI.

Guardrail evaluation rules.

Version-preserve approved baseline changes.

Seed the reference scenario with cost per resolved case as PRIMARY_KPI and CSAT as GUARDRAIL.

Exit gate: the product can explain what will be measured, against which baseline, toward which target and under which guardrail.

11. Phase 6 — Manual Data and CSV Ingestion

Goal: get real evidence into the product without waiting for connectors.

Create data source.

Upload file to private object storage.

Create ingestion run.

Inspect columns/schema.

Map source columns to required metric inputs.

Validate data types, periods and required fields.

Process with Polars/DuckDB where useful.

Write canonical observations.

Generate import report with accepted/rejected rows.

Update source freshness/health.

Implement file type and size limits.

Checksum files.

Keep original import immutable for defined retention.

Escape spreadsheet export formula risks.

Do not silently discard bad rows.

Exit gate: a pilot-format CSV can produce traceable canonical observations and visible quality state.

12. Phase 7 — Deterministic Analytics

Goal: make authoritative calculations reproducible before adding AI.

Metric formula execution.

Baseline/current comparison.

Target attainment.

Guardrail status.

Expected-vs-actual calculations.

Investment planned/actual variance.

Financial value categories with explicit assumptions.

Calculation version metadata.

Unit tests and edge-case fixtures.

No LLM is used to calculate authoritative KPI, ROI, thresholds or guardrail status.

Exit gate: reference-scenario numbers can be reproduced from source inputs and calculation version.

13. Phase 8 — Data Quality and Provenance

Goal: tell users whether the numbers are decision-ready.

Completeness checks.

Freshness checks.

Validity checks.

Coverage/comparability rules for the reference scenario.

Provenance links from observation to ingestion/source.

HEALTHY / PARTIAL / STALE / BLOCKED state.

UI treatment for data issues.

Block or downgrade review readiness when required.

Exit gate: users can inspect why a metric is trusted, partial, stale or blocked.

14. Phase 9 — Claims and Evidence

Goal: move from 'numbers changed' to 'what can responsibly be said.'

Claim CRUD/lifecycle.

Evidence SUPPORTS / CONFLICTS / CONTEXT.

Observation/file/source references.

Assumptions and limitations.

Evidence level E0–E6 internally.

Claim-specific LIMITED / MODERATE / STRONG assessment.

Confounder capture.

Evidence validation.

Evidence/source inspection UI.

Exit gate: the product can represent observed improvement while explicitly refusing to call it causal without appropriate evidence.

15. Phase 10 — Review Board

Goal: create the decision artifact.

Create review and decision question.

Generate review snapshot.

Snapshot initiative/business case version.

Snapshot investment state.

Snapshot KPI/guardrail outputs.

Snapshot data-quality state.

Snapshot evidence references/assessments.

Show assumptions, limitations and conflicting evidence.

Review-ready state and blockers.

Executive-oriented review board.

Exit gate: later source changes cannot silently change what the reviewer saw in a completed review.

16. Phase 11 — Recommendation Policy

Goal: produce explainable candidate recommendations without AI first.

Implement working recommendation types: SCALE, KEEP, OPTIMIZE, STOP, CONTINUE_MEASUREMENT.

Implement support states: SUPPORTED, SUPPORTED_WITH_CONDITIONS, CONFLICTING, INSUFFICIENT.

Create policy versioning.

Use KPI, guardrail, investment, data quality and evidence state as explicit inputs.

Generate conditions metadata.

Return CONTINUE_MEASUREMENT or block when decision evidence is inadequate.

Create golden scenario tests.

Exit gate: recommendation behavior is deterministic enough to test and challenge.

17. Phase 12 — Grounded AI Assistance

Goal: add AI where it reduces analysis effort, not where deterministic logic is stronger.

First AI capabilities

Draft review narrative from structured review snapshot.

Summarize supporting/conflicting evidence.

Suggest investigation questions.

Suggest possible confounders for human review.

Assist source-column/metric mapping.

Explain calculations using deterministic results.

Technical tasks

Create internal model provider adapter.

Define typed tool contracts.

Implement tenant-scoped read tools.

Validate structured model output.

Version prompts/configuration.

Create AI run trace.

Add timeout/retry/cost controls.

Build evaluation fixtures for groundedness and causality overclaiming.

Do not add LangGraph unless a concrete multi-step stateful workflow needs it.

Exit gate: AI output remains grounded in authorized evidence, does not invent sources and cannot change approved records.

18. Phase 13 — Human Decision

Goal: preserve human authority and disagreement.

Record decision independent of recommendation.

Capture rationale.

Capture conditions/scope/budget where applicable.

Support disagreeing with recommendation.

Audit decision.

Create expected follow-up metrics/window.

Support external-decision recording only if validation confirms it.

Exit gate: recommendation history and human decision history remain distinct and attributable.

19. Phase 14 — Post-Decision Outcome

Goal: close the learning loop.

Schedule follow-up measurement.

Ingest/enter post-decision observation.

Compare expected vs actual.

Validate/dispute outcome.

Show variance and relevant evidence.

Capture learning if included in V0.

Use outcome in future review context without rewriting prior decisions.

Exit gate: product demonstrates that it measures whether its recommended/approved action actually delivered.

20. Phase 15 — Notifications and Attention

Review due.

Guardrail breach.

Decision assigned.

Data/evidence blocker.

Decision-critical source stale.

Outcome ready.

Start with in-app and email. Slack/Teams should wait for validated demand.

21. Phase 16 — Security Hardening

Goal: satisfy the SECURITY_PRIVACY first-pilot gate.

Production Clerk setup and internal admin MFA.

Authorization/tenant isolation suite.

Private encrypted database/storage.

Production secret management.

Safe upload controls.

Logging redaction.

Rate/resource limits.

Dependency/secret scanning.

AI prompt-injection/tool-boundary tests.

Audit coverage.

Backup/PITR.

Manual export/deletion runbook.

Incident-response runbook.

Production access policy.

AI provider privacy/configuration review.

Exit gate: security checklist reviewed before any external confidential customer data is onboarded.

22. Phase 17 — Pilot Readiness

Create onboarding/import template.

Create demo/reference dataset.

Create pilot admin setup.

Add product feedback channel.

Instrument core workflow analytics.

Prepare support/debug runbook.

Define pilot success metrics.

Prepare security/data-handling summary.

Verify backups/restoration procedure.

Perform internal end-to-end rehearsal.

Run usability test with users not involved in building the product.

Exit gate: a new pilot organization can be onboarded without engineering manually modifying production data.

23. Suggested Build Order — Dependency View

Foundation → Identity/Tenant → Initiative → Measurement → Ingestion → Deterministic Analytics → Data Quality → Evidence → Review Snapshot → Recommendation Policy → AI Assistance → Human Decision → Outcome → Notifications → Pilot Hardening

This order intentionally places AI late enough that the product has trustworthy structured context for the model to use.

24. Suggested Milestone Plan

The following is a planning range, not a promise. Duration depends heavily on team size, design maturity and customer validation.

Milestone

Scope

Indicative Range

M0 — Validated Workflow

Interviews + prototype + scope

1–3 weeks

M1 — Secure Foundation

App/API/DB/Clerk/tenancy/CI

1–2 weeks

M2 — Initiative & Measurement

Business case, investment, metrics, baselines, guardrails

2–3 weeks

M3 — Data & Analytics

CSV, observations, formulas, quality, provenance

2–4 weeks

M4 — Evidence & Review

Claims, evidence, snapshots, review workspace

2–3 weeks

M5 — Recommendation & Decision

Policy, AI assistance, decision, expectations

2–3 weeks

M6 — Outcome & Pilot Hardening

Follow-up, notifications, security, onboarding

2–4 weeks

A focused small team may reach a pilot-quality vertical slice in roughly 12–20 weeks, but the schedule should be revised after Phase 0 and the first engineering spike.

25. If Building Solo

A solo founder should reduce parallel scope further.

Use managed hosting/database/storage.

Build one role experience first while preserving backend permission boundaries.

Use one reference value model.

Manual/CSV only.

One LLM provider behind a small adapter.

No connector until a pilot explicitly needs it.

No custom workflow engine.

Use managed email.

Prefer a manual security/operations process where safe rather than building an admin platform.

Ship the full core loop before adding portfolio breadth.

For a solo build, the first demoable internal slice should target initiative → measurement → CSV → review, then add recommendation/decision.

26. Repository Structure — Working

One repository or coordinated web/api repositories can work. For an early team, a monorepo can reduce coordination overhead.

Suggested logical structure:

apps/web — Next.js

apps/api — FastAPI

apps/worker — background worker when introduced

packages/contracts — generated/shared API types where practical

packages/ui — product UI primitives if reuse justifies it

infra — deployment/IaC when stabilized

docs — product/technical decisions, ADR/TDR records

tests/fixtures — reference scenario and import fixtures

27. Database Migration Plan

Identity/tenancy.

Initiatives/versions.

Investments.

Metrics/versions/initiative metrics/baselines.

Data sources/files/ingestion/observations.

Quality.

Claims/evidence.

Interventions.

Reviews/snapshots.

Recommendations/AI runs.

Decisions/expectations/outcomes.

Notifications/audit.

Documents/chunks only when semantic retrieval is implemented.

Use Alembic.

Prefer additive/backward-compatible migrations during pilot iterations.

Seed only stable reference/template data.

Never use destructive schema reset on production.

Test migrations against representative staging data.

28. Testing Plan by Layer

Layer

Minimum V0 Coverage

Domain

Metric formulas, thresholds, recommendation policy, versions.

Authorization

Role matrix and cross-tenant denial.

Database

Constraints, tenant relationships, migrations.

API

Happy path + invalid state + authorization.

Imports

Malformed, duplicate, partial, large-enough fixture, rejected rows.

Evidence

Supporting/conflicting evidence and causality boundaries.

AI

Groundedness, source use, schema compliance, prompt injection, overclaiming.

Frontend

Critical workflow and accessibility basics.

E2E

Core Scenario #1 from organization to decision/outcome.

Security

IDOR/cross-tenant, uploads, secrets/logging, tool authorization.

Operations

Backup restore and failure handling before pilot.

29. Reference Scenario Test Fixture

Maintain a stable fixture for AI Support Automation:

Planned investment: $300,000 example fixture.

Baseline cost/case: $8.40.

Target: 20% reduction.

CSAT guardrail: at least 90%.

90-day observed cost/case: $6.90.

Observed CSAT: 91.4%.

Include at least one confounder/intervention.

Include supporting and conflicting/context evidence.

Expected recommendation outcome is defined by policy fixture, not hardcoded UI.

These are test/demo values from the working scenario, not market claims.

30. Product Analytics for Validation

Initiative creation completion.

Measurement-plan completion.

Import success/failure.

Time to review-ready.

Evidence/source inspection usage.

Recommendation disagreement rate.

Decision completion.

Time from review-ready to decision.

Frequency of data blockers.

Post-decision follow-up completion.

User-reported trust/clarity after review.

Do not optimize engagement metrics that conflict with faster, better decisions.

31. Pilot Success Criteria — Working

Users can set up an initiative without product-team intervention after onboarding.

Review preparation is materially faster or clearer than the customer's prior workflow.

Decision makers understand evidence and uncertainty.

Users can identify the source behind material numbers.

At least one real decision is recorded using the product.

Customer is willing to return for the next review cycle.

Customer can articulate a credible reason to pay, expand or continue the pilot.

No severe tenant/security incident.

No recommendation relies on invented evidence or misleading causal language.

Commercial thresholds should be defined after customer discovery rather than invented in the technical plan.

32. What Not to Build Before Pilot Evidence

Dozens of integrations.

AI chatbot as the primary navigation.

Autonomous executive agent.

Automated vendor purchasing.

Cross-customer benchmark network.

Custom causal ML platform.

Fine-tuned proprietary LLM.

Native mobile app.

Complex workflow builder.

Customer-configurable formula language.

Full enterprise data warehouse.

Microservices/Kubernetes/Kafka.

Large dashboard catalog.

33. Technical Spikes Required

Spike

Question

Output

Database/RLS

Should RLS be mandatory from V0 with Clerk/backend architecture?

TDR + tested prototype.

Job framework

Which simple worker fits imports/AI/retries?

TDR + failure/retry spike.

LLM provider

Privacy, tool use, structured output, quality, latency, cost?

Provider benchmark + TDR.

Object storage

Best managed choice for deployment/data region?

TDR.

CSV analytics

Polars/DuckDB boundary and memory behavior?

Import benchmark.

Review snapshot

Reference-only vs materialized hybrid?

Schema/implementation decision.

AI evaluation

How will groundedness/causal overclaim be tested?

Initial eval harness.

Hosting

Operationally simple staging/production topology?

Deployment TDR.

34. Decision Gates

Gate

Question

G0

Do target users have the problem strongly enough to continue?

G1

Does the workflow match how real reviews/decisions happen?

G2

Can the core scenario work without direct connectors?

G3

Can deterministic evidence/analytics produce decision value before AI?

G4

Does AI materially improve speed/clarity without reducing trust?

G5

Will a customer use the product for a real decision?

G6

Will a customer pay/expand/continue?

G7

Which enterprise/security investments are justified by pipeline?

35. Risks and Mitigations

Risk

Mitigation

Product becomes dashboard software

Keep decision question/review/action as core workflow.

Users do not trust recommendations

Expose evidence, uncertainty, calculations and human authority.

Data onboarding is too hard

Manual/CSV first, templates, narrow required fields.

AI overclaims causality

Claim taxonomy, deterministic policy, AI evals, explicit methodology.

Architecture overbuilt

Modular monolith + managed services + deferred infrastructure.

Security slows pilot late

Implement tenant/security foundations before customer data.

ROI becomes misleading

Separate realized savings, avoided cost, capacity and modeled value.

Too many states/terms

Prototype and simplify user-facing language while retaining precise backend states.

Customers require integrations early

Build only the connector demanded by a qualified pilot.

Founder spends months coding wrong workflow

Phase 0 + prototype gate before full build.

36. Documentation to Maintain During Build

PRD — product requirements and validated scope.

APP_FLOW — product workflow.

UI_UX_BRIEF — experience principles.

DATA_EVIDENCE_SPEC — evidence/measurement contract.

TRD — architecture.

BACKEND_SCHEMA — data model.

SECURITY_PRIVACY — security/privacy baseline.

IMPLEMENTATION_PLAN — execution plan.

ADR/TDR log — technical decisions and why.

API_CONTRACT — endpoints and request/response contracts once implementation begins.

TEST_EVAL_PLAN — deterministic, security and AI evaluation suites.

PILOT_RUNBOOK — onboarding/support/incident/data process.

CONCERNS_DECISIONS_REGISTER — final cross-document unresolved items and decisions.

37. Definition of Done — Feature

Product acceptance behavior defined.

Authorization/tenant behavior defined.

API/data contract implemented.

Happy/error/empty/partial states implemented.

Audit requirements implemented where material.

Automated tests passing.

Observability added.

Security/privacy implications reviewed.

Documentation updated when architecture/product behavior changed.

No hidden manual production step unless documented as an intentional pilot operation.

38. Definition of Pilot Ready

Core scenario works end to end in production-like environment.

Tenant isolation and authorization tests pass.

Customer data import path is documented.

Review/recommendation can be traced to evidence.

Human decision and outcome loop works.

AI features have grounding/security eval coverage.

Backups and restore process exist.

Secrets/logging/upload security baseline implemented.

Incident/export/deletion processes exist.

Pilot onboarding and support runbook exists.

Known limitations are documented and communicated.

No unverified compliance/security claims in pitch or product.

39. Immediate Next Actions

Review the implementation plan against the approved PRD and Core Scenario.

Create the final CONCERNS_DECISIONS_REGISTER from all documents.

Resolve only blockers required before prototyping/building; do not wait for every long-term question.

Create API_CONTRACT v0.1 for the first vertical slice.

Create TEST_EVAL_PLAN v0.1.

Prototype the core workflow.

Run Phase 0 customer validation in parallel with the prototype.

Freeze V0 after evidence from those conversations.

Start engineering foundation and the first vertical slice.

40. Acceptance Criteria for This Plan

Build order reflects dependencies rather than document order.

AI is introduced after deterministic data/evidence foundations.

Security is implemented before external confidential data.

Customer validation can change scope before major build cost.

Core Scenario #1 is the reference fixture throughout implementation.

Every milestone has an observable exit gate.

Advanced infrastructure remains deferred until justified.

Pilot readiness includes product, security, operations and validation — not only working code.

The plan can be executed by a small team and reduced further for a solo founder.

Appendix A — V0 Dependency Map

VALIDATE

  ↓

PROTOTYPE

  ↓

FOUNDATION → IDENTITY/TENANCY

  ↓

INITIATIVE → INVESTMENT → MEASUREMENT

  ↓

MANUAL/CSV DATA → OBSERVATIONS → ANALYTICS

  ↓

QUALITY/PROVENANCE → CLAIMS/EVIDENCE

  ↓

REVIEW SNAPSHOT → RECOMMENDATION POLICY

  ↓

GROUNDED AI ASSISTANCE

  ↓

HUMAN DECISION → EXPECTATION → OUTCOME

  ↓

PILOT HARDENING → EXTERNAL PILOT

Appendix B — Cross-Document Decisions Carried Forward

PRD v0.1 remains approved for validation, not immutable.

Clerk is authentication provider; backend owns authorization.

Internal organization UUID is canonical.

PostgreSQL is system of record; managed Supabase Postgres remains an option without Supabase Auth.

Manual/CSV is a first-class V0 input path.

Structured retrieval is primary; semantic retrieval is supplemental.

AI is advisory; deterministic analytics own authoritative calculations.

Data Quality, Evidence Strength and Recommendation support are distinct.

Recommendation and human decision are separate.

SCALE WITH CONDITIONS is SCALE + conditions/support metadata.

Raw data minimization is a product/security principle.

Advanced infrastructure is deferred until measured need.

Appendix C — Concerns / Final Review Register Inputs

Reference

Concern / Decision

Implementation Treatment

Status

IMPLEMENTATION_PLAN v0.1

12–20 week range may be unrealistic for a solo founder if full V0 is attempted.

Use reduced solo sequence and revise after Phase 0.

Planning estimate only

IMPLEMENTATION_PLAN v0.1

Building before customer workflow validation could waste months.

Phase 0 + prototype precede full implementation.

Direction set

IMPLEMENTATION_PLAN v0.1

AI may distract from core value.

AI added only after deterministic review slice.

Direction set

IMPLEMENTATION_PLAN v0.1

Direct connectors may be required by first pilot.

Manual/CSV default; build first validated connector if it becomes a pilot blocker.

Validate

IMPLEMENTATION_PLAN v0.1

Recommendation policy may be too generic across initiative types.

Start with reference use case and version policy; validate templates by use case.

Open

SECURITY_PRIVACY v0.1

RLS remains undecided.

Technical spike before production tenant architecture freeze.

Open TDR

SECURITY_PRIVACY v0.1

AI provider/privacy may constrain customers.

Provider benchmark before external data.

Open TDR

BACKEND_SCHEMA v0.1

Review snapshot strategy needs implementation detail.

Dedicated technical spike before review module.

Open

BACKEND_SCHEMA v0.1

External decider vs recorder remains unresolved.

Do not build external approval workflow until validation.

Validate

UI_UX_BRIEF v0.1

Too much methodology may overwhelm executives.

Prototype progressive disclosure.

Validate

DATA_EVIDENCE_SPEC v0.1

Evidence strength methodology may look pseudo-scientific.

Use descriptive states and validate language/method.

Validate

PRD / Market

Willingness to pay remains the largest commercial unknown.

Pilot success includes willingness to continue/pay/expand.

Critical validation