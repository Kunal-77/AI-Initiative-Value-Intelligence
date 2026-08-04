AI INITIATIVE VALUE INTELLIGENCE

TECHNICAL REQUIREMENTS DOCUMENT v0.1

Evidence-first, multi-tenant architecture for AI investment decision intelligence



Status

Working architecture — validation-stage

Date

July 29, 2026

Frontend

Next.js + TypeScript

Backend

FastAPI + Python

Authentication

Clerk

Primary data platform

PostgreSQL; managed deployment may use Supabase without Supabase Auth



1. Purpose

This TRD translates the approved product direction, application flow, UX principles and Data & Evidence specification into a technical architecture. It deliberately avoids enterprise-scale infrastructure before requirements justify it.

The architecture must support trustworthy measurement, traceable evidence, multi-tenant isolation, human decision authority and fast iteration during customer validation.

2. Architecture Principles

Modular monolith first — preserve clear domain boundaries without premature microservices.

PostgreSQL as the system of record — relational integrity and auditability matter more than infrastructure novelty.

Authentication is not authorization — Clerk proves identity/membership; backend policy controls product access.

Deterministic analytics before AI interpretation — authoritative metrics and financial calculations must be reproducible.

Structured retrieval first — query canonical product data directly; semantic retrieval supplements unstructured evidence.

Evidence lineage by design — consequential outputs must trace to source, method and version.

Human authority — AI recommendations never become material business decisions automatically.

Async where necessary — imports, calculations, connector sync and AI jobs should not block interactive requests.

Provider abstraction at expensive boundaries — model, object storage and external integrations should be replaceable where practical.

Earn complexity — Temporal, ClickHouse, Kafka, graph databases and dedicated vector stores are later options, not V0 defaults.

3. System Context

Primary users interact with a Next.js web application. Clerk authenticates users. Next.js calls the FastAPI application API. FastAPI enforces tenant authorization and coordinates PostgreSQL, background jobs, object storage, analytics and model providers.

Logical flow:

Browser → Next.js → Clerk identity/session → FastAPI API → Authorization → Domain services → PostgreSQL / Object Storage / Async Jobs → Analytics & Evidence Engine → AI Assistance → Human Review

4. Recommended V0 Stack

Layer

Choice

Reason

Web

Next.js + TypeScript

Application shell, server/client rendering, typed frontend.

UI foundation

React-based accessible component primitives; exact library chosen during prototyping

Avoid locking visual identity to a template library.

Authentication

Clerk

Identity, sessions, organization membership/invitations.

API

FastAPI + Python

Domain APIs, authorization, analytics coordination and AI/tool integration.

Validation

Pydantic

Typed request/response and internal contracts.

Database

PostgreSQL

Canonical transactional and evidence data.

Managed DB option

Supabase Postgres

Infrastructure convenience only; Supabase Auth excluded.

ORM / migrations

SQLAlchemy 2.x + Alembic

Explicit persistence model and versioned schema migrations.

Object storage

S3-compatible object storage

CSV/Parquet imports, evidence attachments and generated artifacts.

Analytics

Polars + DuckDB

Efficient local/batch transformation and analytical processing of imports.

Vector retrieval

pgvector when semantic retrieval becomes necessary

Keep vectors near relational evidence initially.

Cache / queue infrastructure

Redis-compatible service

Caching, rate-control and job coordination if adopted.

Background jobs

Simple worker/job framework selected during implementation spike

Imports, calculations, model calls, connector work.

AI integration

Direct provider SDK behind internal adapter

Avoid unnecessary orchestration framework in V0.

Workflow AI later

LangGraph only when durable stateful/HITL agent workflows justify it

Not required for basic AI assistance.

Observability

OpenTelemetry + structured application logs

Trace API/jobs/model calls and operational failures.

Packaging

Docker

Reproducible local and deployed services.

5. Deployment Topology — V0

Web application deployed on a managed Next.js-capable platform.

FastAPI deployed as a containerized service.

Managed PostgreSQL in a region appropriate for pilot customers.

Managed object storage for imports/evidence files.

Worker process deployed separately from the API when background workloads begin.

Managed Redis introduced only when queue/cache requirements require it.

Secrets stored in deployment secret management, never source control.

Separate development, staging and production environments.

Kubernetes is not a V0 requirement.

6. Multi-Tenancy and Identity

6.1 Canonical Tenant Identity

The application owns an internal organization UUID. Clerk organization IDs are external identity references mapped to internal organizations.

organizations.id = canonical internal UUID.

organizations.clerk_org_id = unique external mapping.

users maintain internal IDs mapped to Clerk user IDs.

organization_memberships represent product membership/role state where required.

Every tenant-owned domain record carries organization_id directly or through a strongly constrained parent.

6.2 Authentication Flow

User authenticates through Clerk.

Frontend receives valid Clerk session/token.

API verifies token/signature and expected claims.

Backend resolves Clerk organization/user to internal organization/user.

Authorization service evaluates product permission for requested resource/action.

Domain service executes only inside resolved tenant scope.

6.3 Authorization

Clerk roles may help bootstrap membership context, but product authorization remains backend-controlled.

Role-based permissions for V0.

Resource ownership/assignment checks where needed.

Explicit permissions for sensitive finance, validation, approval and administration actions.

Deny by default when tenant/permission context is absent.

Audit consequential authorization-sensitive actions.

7. Initial Role Model

Working Role

Intent

ORG_ADMIN

Manage organization, members, integration configuration and governance.

EXECUTIVE

Review/approve initiatives and record material decisions.

FINANCE_ANALYST

Manage/validate investment assumptions, financial metrics and evidence.

INITIATIVE_OWNER

Manage assigned initiative context, measurement and interventions.

REVIEWER

Validate assigned operational/evidence items.

VIEWER

Read permitted product information without mutation.

These roles are working technical concepts, not final customer-facing role names. Permission design will be finalized in SECURITY_PRIVACY / BACKEND_SCHEMA.

8. Backend Architecture

Use a modular monolith with explicit domain modules rather than one large routes/services folder.

identity — Clerk mapping, users, organizations, memberships.

initiatives — lifecycle, owners, business case and state.

investments — planned/actual cost and assumptions.

metrics — definitions, versions, targets, observations and guardrails.

data_sources — imports, source mappings, freshness and quality.

evidence — claims, evidence records, provenance and validation.

analysis — deterministic calculations, comparisons and quality evaluation.

reviews — scheduled review snapshots and review packages.

recommendations — recommendation generation/versioning/conditions.

decisions — human decisions, rationale, approvals and external-decision records.

outcomes — post-decision measurement and learning.

ai — provider adapters, prompts, tool contracts and grounded assistance.

audit — consequential action/change history.

Modules may share one PostgreSQL database in V0 while maintaining domain-level ownership of models and services.

9. API Design

REST-style JSON API for V0; no requirement for GraphQL.

Version API paths when public compatibility becomes necessary; internal V0 may begin under /api/v1.

Typed Pydantic contracts.

Idempotency support for imports, webhook processing and consequential commands where duplicate execution is risky.

Pagination for collections.

Consistent error envelope with user-safe message, machine code and trace/correlation ID.

Optimistic concurrency/version checks for high-value editable records such as approved measurement definitions.

Never trust organization_id supplied by the client without validating it against authenticated context.

10. Canonical Domain Relationships

High-level relational model:

Organization → Initiative → Investment / Metric Assignment / Claim / Review → Evidence → Recommendation → Decision → Action → Outcome / Learning

Metric Definition → Metric Version → Observation → Evidence

Data Source → Import/Sync Run → Dataset/Source Record → Observation / Evidence

The formal table/field design belongs in BACKEND_SCHEMA v0.1.

11. Data Ingestion Architecture

11.1 V0 Input Paths

Manual entry for low-volume business assumptions and validation.

CSV upload for operational/financial observations.

Optional Parquet support for larger structured imports.

Evidence document/file attachment where needed.

Direct connectors only when pilot demand justifies specific integrations.

11.2 Import Pipeline

Upload → Object Storage → Import Job → Schema Inspection → Mapping → Validation → Transformation → Quality Checks → Canonical Observations/Evidence → Import Report

Original file remains immutable for audit/lineage during its retention period.

Mapping configuration is versioned.

Failed rows are reported rather than silently discarded.

Import reruns are idempotent where practical.

DuckDB/Polars may process large files without forcing raw data into transactional tables first.

12. Analytics Engine

Authoritative calculations are deterministic Python/SQL computations.

Metric formulas implemented as versioned calculation definitions or trusted code paths.

Baseline/current comparisons use explicit period and scope.

Guardrail evaluation uses deterministic threshold rules.

Expected-vs-actual variance is reproducible.

Financial value formulas preserve assumptions and distinguish realized savings, avoided cost, released capacity and modeled value.

Calculation output records input references and calculation version.

Polars handles transformations; DuckDB supports analytical queries over imported CSV/Parquet/object-storage data where useful.

13. Evidence Engine

The Evidence Engine consumes canonical observations, calculations, source lineage, assumptions, limitations and reviewer validation.

Claims are explicit objects.

Evidence can SUPPORT, CONFLICT or provide CONTEXT.

Evidence level follows the working E0–E6 taxonomy from DATA_EVIDENCE_SPEC.

Data Quality and Evidence Strength are separate.

Evidence Strength is claim-specific.

Recommendation packages snapshot the evidence state used at generation/review time.

Historical evidence packages are not silently rewritten after later data arrives.

14. Recommendation Engine

V0 recommendation generation should combine deterministic policy/rules with explainable AI assistance rather than asking an LLM to freely decide.

Conceptual flow:

Review Snapshot → KPI/Guardrail Evaluation → Data Quality → Evidence Assessment → Decision Policy → Candidate Recommendation → AI Explanation/Draft → Human Review

Core types: SCALE, KEEP, OPTIMIZE, STOP, CONTINUE_MEASUREMENT.

Conditions are metadata, not recommendation types.

Rule/policy version is stored.

AI model/provider/version and prompt/template version are stored when AI contributes materially.

Recommendation may be blocked or return CONTINUE_MEASUREMENT when evidence is insufficient.

Human can disagree; decision record preserves both recommendation and human rationale.

15. AI Architecture

15.1 Design

Use an internal model gateway/adapter so product code is not coupled to one LLM provider. Begin with direct SDK calls; introduce orchestration frameworks only when workflows require them.

15.2 Tool-Based Access

get_initiative_context

get_metric_definition_and_observations

get_baseline_and_target

get_guardrail_status

get_evidence_for_claim

get_investment_summary

get_review_snapshot

get_decision_history

search_unstructured_evidence

The model should receive structured results from these tools instead of direct unrestricted database access.

15.3 Grounding Rules

Structured product records are primary truth for metrics/decisions.

Semantic retrieval is used for relevant documents/notes, not as a substitute for SQL/domain queries.

Consequential AI statements include evidence/source references in the product.

Model output is validated against a schema before use.

AI suggestions do not mutate approved records without explicit product workflow.

Prompts and model configuration are versioned for consequential features.

16. RAG / Retrieval Strategy

The product should not be architected as 'put everything in a vector database and ask the model.'

Structured retrieval: PostgreSQL/domain services for initiatives, metrics, evidence, investments and decisions.

Semantic retrieval: pgvector for chunks/embeddings of approved unstructured evidence when required.

Keyword/metadata filters: organization, initiative, source type, period, sensitivity and document state.

Reranking may be introduced if retrieval quality requires it.

Dedicated vector infrastructure is considered only after benchmarked need.

17. Background Processing

Candidate asynchronous workloads include imports, data-quality checks, recalculation, evidence refresh, model calls, connector sync and notifications.

Jobs carry organization and actor/system context.

Retries use bounded backoff.

Idempotency prevents duplicate consequential writes.

Dead/failed jobs remain inspectable.

Job status should map to user-relevant states only where appropriate.

Temporal is reserved for genuinely durable, long-running workflows with waits/human checkpoints; do not adopt solely for simple jobs.

18. Event Model

V0 may use transactional domain events/outbox patterns inside the modular monolith rather than Kafka.

initiative.approved

initiative.activated

metric.observation_ingested

guardrail.breached

data_source.stale

review.due

recommendation.generated

decision.recorded

outcome.ready

An outbox table can provide reliable asynchronous handoff if event-driven behavior grows. Kafka is not required for V0.

19. Auditability and Versioning

Approved business case/measurement definitions preserve versions.

Baseline changes preserve prior value and rationale.

Manual overrides preserve original values.

Recommendation snapshots preserve evidence/rule/model versions.

Human decisions preserve actor, timestamp, rationale and conditions.

External approvals/decisions, if supported, record source/reference and recorder.

Audit records should identify actor, organization, action, target, timestamp and relevant before/after metadata.

20. Security Requirements

TLS in transit and managed encryption at rest.

Clerk token verification server-side.

Backend tenant authorization on every tenant-owned resource.

Parameterized ORM/SQL usage.

Strict file type/size validation and safe object-storage access.

Signed/short-lived file access where appropriate.

Secrets stored in secret manager/environment injection, never database plaintext where avoidable.

Connector OAuth tokens encrypted and access-restricted if connectors are introduced.

Rate limiting for authentication-adjacent, import and AI-heavy endpoints.

Audit logging for material decisions, permission changes and sensitive operations.

Security headers, CSRF strategy appropriate to auth/session architecture, and secure cookie/token handling.

Dependency and container scanning in CI.

A dedicated SECURITY_PRIVACY document should define threat model, retention, privacy, incident handling, enterprise SSO requirements and compliance roadmap.

21. Database Isolation

Application-layer authorization is mandatory. Database-level tenant controls may provide defense in depth.

organization_id indexed on tenant-scoped tables.

Composite uniqueness includes organization scope where appropriate.

Foreign keys prevent cross-tenant parent/child relationships.

If Supabase/Postgres RLS is used, policies must be designed for backend service access and tested explicitly; Clerk does not automatically configure Postgres RLS.

Never rely on frontend filtering for tenant isolation.

22. File and Evidence Storage

Store binary/raw files in object storage, not PostgreSQL blobs by default.

Database stores metadata, checksum, owner organization, source type, object key, retention state and access classification.

Original imports should be immutable; transformed derivatives receive new references.

Malware/content scanning requirements should be evaluated before external pilots involving arbitrary uploads.

Deletion must consider derived evidence and audit/legal retention requirements.

23. Observability

Structured JSON logs with correlation/trace IDs.

OpenTelemetry traces across web/API/worker/external model calls where supported.

Metrics: request latency/error rate, job success/failure, import duration, data freshness, model latency/error/cost, database health.

Do not log secrets, raw tokens or unnecessarily sensitive customer evidence.

AI observability should capture provider/model, latency, token usage/cost, tool calls and outcome status without exposing hidden chain-of-thought.

24. Reliability and Performance Targets — Working

Interactive read APIs: target p95 under 500 ms for common cached/indexed product reads, excluding external model calls.

Interactive mutations: target p95 under 1 s for normal transactional commands.

AI-assisted actions: asynchronous/streaming UX when response may exceed normal interaction latency.

Imports: background processing with progress/status rather than HTTP request blocking.

Availability target for early pilots: 99.5% monthly working target; revise based on customer commitments.

Backups and point-in-time recovery should be enabled for production managed PostgreSQL.

Recovery objectives must be formalized before production contracts.

These are engineering targets, not customer SLA commitments.

25. Frontend Technical Requirements

TypeScript throughout application code.

Server/client component boundaries chosen based on interaction/data needs, not trend.

Central typed API client/contracts.

Role-aware navigation and actions; backend remains enforcement authority.

Accessible forms, tables, dialogs and keyboard behavior.

Error boundaries and explicit loading/empty/partial states.

Charts use accessible textual summaries and never encode status by color alone.

Do not expose internal evidence IDs, tenant IDs or technical job states unnecessarily.

26. Integration Architecture

Direct connectors are an expansion capability. Each connector should implement a common adapter contract.

Authorization/credential setup.

Connection test.

Schema/capability discovery.

Incremental/full sync strategy.

Source-to-canonical mapping.

Freshness/health reporting.

Retry/error classification.

Credential rotation/revocation.

Audit metadata.

Initial connector priorities should come from customer validation, not from building a large connector catalog.

27. Notifications

Notifications are triggered by product events requiring attention, not routine sync traffic.

Decision assigned.

Guardrail breach.

Review approaching/due.

Evidence/data issue blocking review.

Recommendation materially changed.

Decision-critical source stale.

Post-decision outcome ready.

Delivery may begin with in-app + email. Slack/Teams can be added if validated.

28. Testing Strategy

Unit tests for metric formulas, guardrail rules, evidence assessment and authorization policy.

Property/edge tests for financial calculations and period comparisons.

Integration tests for database constraints and tenant isolation.

API contract tests.

Import fixtures covering malformed, partial, duplicate and large datasets.

Golden test cases for recommendation policy.

AI evaluation dataset for groundedness, citation/source use, refusal to overclaim causality and schema compliance.

End-to-end tests for Core Scenario #1.

Security tests for cross-tenant access attempts and privilege boundaries.

Migration tests for schema evolution.

29. CI/CD and Environments

Git-based workflow with protected production deployment path.

Automated lint/type/test checks.

Database migrations reviewed and applied through deployment workflow.

Separate environment secrets and databases.

Preview/staging environment for product validation.

Production deploy supports rollback of application code; schema migrations should be backward-compatible where practical.

Infrastructure-as-code can be introduced as deployment stabilizes; avoid manual production configuration drift.

30. V0 Technical Scope

Clerk sign-in and organization mapping.

Backend RBAC/tenant authorization.

Initiative/business case/investment CRUD with version-sensitive records.

Metric registry, targets, baselines and guardrails.

Manual + CSV ingestion.

Deterministic calculations and basic data quality.

Claims/evidence/provenance.

Review snapshot.

Recommendation policy + grounded AI explanation.

Human decision/rationale.

Post-decision expected outcome and follow-up observation.

Audit trail.

Basic in-app/email attention notifications.

Operational logging and production-safe deployment.

31. Explicitly Deferred

Microservices.

Kubernetes.

Kafka.

ClickHouse.

Dedicated graph database.

Dedicated vector database.

Full enterprise connector marketplace.

Autonomous purchasing/capital allocation.

Universal causal inference engine.

Cross-customer benchmarking without explicit governance.

Complex multi-stage agent architecture.

Custom ML model training.

Native mobile applications.

32. Technical Decision Records to Create Later

TDR-001: Managed PostgreSQL provider selection.

TDR-002: Object storage provider.

TDR-003: Background job framework.

TDR-004: Initial LLM provider/model strategy.

TDR-005: AI evaluation/observability approach.

TDR-006: Database RLS defense-in-depth strategy.

TDR-007: First external connector based on pilot demand.

TDR-008: UI component foundation after prototypes.

TDR-009: Notification provider.

TDR-010: Deployment hosting topology.

33. Open Technical Questions

Will early pilot customers require enterprise SSO/SAML/SCIM beyond standard Clerk organization flows?

Should Postgres RLS be mandatory defense-in-depth from V0 or introduced after backend authorization tests stabilize?

Which background job framework best balances reliability and simplicity for V0?

Which managed PostgreSQL/object-storage deployment best fits pilot data residency and cost requirements?

Which LLM provider(s) meet required privacy, structured-output, tool-use and cost constraints?

Do customer security requirements permit third-party model APIs for their evidence data?

How much raw imported data must be retained versus normalized observations only?

Do we need a separate analytical warehouse before real customer volume proves Postgres/DuckDB insufficient?

What exact events require immutable audit treatment versus normal version history?

How should external approval systems integrate if approval is not performed in-product?

What RPO/RTO and availability commitments will pilot contracts require?

Which sensitive fields need column-level/application-level encryption beyond managed database encryption?

34. Acceptance Criteria

Architecture supports Core Scenario #1 end to end.

Tenant identity is independent from Clerk provider IDs.

Backend is authoritative for authorization.

Authoritative calculations are deterministic and versionable.

Recommendations trace to evidence and source lineage.

AI cannot directly mutate approved/decision-critical records without workflow authorization.

Manual/CSV workflows are first-class V0 paths.

Data quality, evidence strength and recommendation support remain distinct.

Async workloads do not block normal request handling.

Architecture can evolve without requiring microservices or a separate warehouse/vector database in V0.

Security, audit and tenant isolation are designed before customer data is onboarded.

Appendix A — Architecture Sketch

CLIENT

Next.js Web App

  ↓ Clerk session

FASTAPI APPLICATION

  ├─ Identity & Authorization

  ├─ Initiative / Investment

  ├─ Metrics / Data Sources

  ├─ Analytics / Evidence

  ├─ Reviews / Recommendations / Decisions

  ├─ Outcomes / Learning

  └─ AI Gateway + Structured Tools

      ↓

DATA & INFRASTRUCTURE

  ├─ PostgreSQL

  ├─ Object Storage

  ├─ Worker / Redis when required

  ├─ Polars / DuckDB

  └─ LLM Provider(s)

Later only if justified: Temporal / ClickHouse / dedicated vector DB / graph DB / Kafka.

Appendix B — Cross-Document Decisions

PRD v0.1 approved for validation.

APP_FLOW v0.1 approved with validation items.

UI_UX_BRIEF v0.1 requires decision-first, evidence-first, contextual-AI design.

DATA_EVIDENCE_SPEC v0.1 defines the evidence taxonomy and deterministic calculation boundary.

Clerk replaces Supabase Auth.

Internal organization UUID mapped to Clerk organization ID remains preferred.

SCALE WITH CONDITIONS is SCALE plus conditions metadata.

Structured retrieval is primary; semantic retrieval is supplemental.

Advanced infrastructure is deferred until requirements justify it.

Appendix C — Concerns / Final Review Register Inputs

Reference

Concern / Decision

TRD Treatment

Status

Architecture

Clerk should not become the product authorization authority.

Backend policy layer + internal tenant IDs.

Direction set; validate implementation.

TRD v0.1

Supabase as managed Postgres could create accidental coupling.

Treat as provider; no Supabase Auth dependency.

Carry to implementation.

TRD v0.1

Background job technology not yet justified.

Keep framework TBD; select through implementation spike.

Open.

TRD v0.1

RLS with Clerk requires deliberate design.

Application authorization mandatory; RLS considered defense in depth.

Open technical decision.

TRD v0.1

LLM provider choice is premature and customer privacy may constrain it.

Internal adapter; provider/model TDR later.

Open.

DATA_EVIDENCE_SPEC v0.1

Evidence scoring can become pseudo-scientific.

No arbitrary numeric confidence; deterministic + descriptive states.

Direction set.

DATA_EVIDENCE_SPEC v0.1

ROI may confuse capacity with realized savings.

Separate value categories in analytics model.

Carry to schema/UI.

APP_FLOW v0.1

Approval may occur outside product.

Decision module allows future external approval records.

Validate with customers.

APP_FLOW v0.1

Too many visible states.

Backend can retain granular states; UI may map them to fewer stages.

Carry to UI prototype.

UI_UX_BRIEF v0.1

Component library could make product look templated.

Choose primitives after product-specific prototypes.

Open.

TRD v0.1

Early architecture could still overbuild AI infrastructure.

Direct SDK + tools first; LangGraph/vector specialization only when earned.

Direction set.