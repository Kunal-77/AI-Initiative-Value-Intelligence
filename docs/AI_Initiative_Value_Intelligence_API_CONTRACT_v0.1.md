AI INITIATIVE VALUE INTELLIGENCE

API CONTRACT v0.1

Backend boundary for the first decision-intelligence vertical slice

Item

Decision

Status

Working contract — refine payload details during implementation without changing domain semantics

Date

July 29, 2026

API

REST/JSON over HTTPS

Backend

FastAPI

Authentication

Clerk; backend verifies identity and resolves tenant

Canonical identity

Internal UUIDs; Clerk IDs are mappings

Primary slice

Initiative → Measurement → Data → Evidence → Review → Recommendation → Human Decision → Outcome

1. Purpose

This document defines the V0 application API. It exposes product workflows rather than mirroring database tables. The contract is designed around tenant safety, explicit state transitions, evidence traceability, deterministic analytics and human decision authority.

2. Contract Principles

Base path /api/v1.

Protected endpoints authenticate through Clerk and authorize in FastAPI.

Client-supplied organization_id never proves tenant access.

Internal UUIDs are resource IDs.

Money uses decimal strings plus ISO currency.

ISO 8601 UTC timestamps.

Deterministic services calculate authoritative KPI, ROI and guardrail outputs.

AI output is advisory and identified as such.

Material mutations are auditable.

Version conflicts fail explicitly.

Additive optional fields should not require a new API version.

3. Request Context & Security

For each protected request the backend verifies Clerk identity, maps Clerk user/organization context to internal UUIDs, confirms active membership, resolves capabilities and attaches a request/correlation ID.

Cross-tenant resource IDs must not reveal another tenant's resource existence.

Object-level authorization is required even after authentication.

Server-controlled fields such as organization_id, created_by and calculated outputs cannot be mass-assigned.

AI tools independently enforce the same authorization rules.

4. Standard Headers and Errors

Header

Use

Authorization

Clerk bearer/session mechanism for protected API.

Content-Type

application/json except upload operations.

Idempotency-Key

Duplicate-sensitive create/import/review/AI/decision operations.

X-Request-ID

Correlation; server creates one when absent.

If-Match / version

Candidate optimistic-concurrency mechanism.

Error envelope: error.code, error.message, optional error.details, error.request_id.

HTTP

Code

Meaning

400

INVALID_REQUEST

Malformed or semantically invalid request.

401

UNAUTHENTICATED

Missing/invalid authentication.

403

FORBIDDEN

Action not permitted.

404

RESOURCE_NOT_FOUND

Resource unavailable in authorized tenant scope.

409

VERSION_CONFLICT

Concurrent/version conflict.

409

INVALID_STATE_TRANSITION

Workflow action invalid from current state.

422

VALIDATION_ERROR

Typed/business validation.

429

RATE_LIMITED

Resource/AI/import limit.

503

DEPENDENCY_UNAVAILABLE

Required provider temporarily unavailable.

5. Common Conventions

Collections use bounded cursor pagination.

Money example: amount='300000.00', currency='USD'.

Approved definitions/baselines create versions instead of silent overwrite.

Frozen review snapshots are immutable to normal workflows.

Manual and imported observations remain distinguishable.

Asynchronous imports/exports/selected AI tasks return an operation/status resource.

6. Identity & Organization

Method

Endpoint

Purpose

GET

/me

Current internal user, active organization and capabilities.

GET

/me/organizations

Available organizations if switching is needed.

GET

/organization

Current organization profile.

PATCH

/organization

Permitted organization settings.

GET

/organization/members

List members.

PATCH

/organization/members/{membership_id}

Permitted role/status change.

Clerk remains the identity provider. Product APIs should not duplicate Clerk administration unless the validated UX requires it.

7. Initiatives

Method

Endpoint

Purpose

POST

/initiatives

Create initiative draft.

GET

/initiatives

Tenant-scoped list/filter.

GET

/initiatives/{id}

Initiative detail.

PATCH

/initiatives/{id}

Edit permitted fields.

POST

/initiatives/{id}/submit

Create reviewable business-case version/transition.

POST

/initiatives/{id}/activate

Activate after required conditions.

POST

/initiatives/{id}/pause

Pause with reason.

POST

/initiatives/{id}/archive

Archive without deleting history.

GET

/initiatives/{id}/versions

Version history.

Create fields: name, business_area, owner_user_id, problem_statement, proposed_intervention, expected_business_outcome, planned_start_date and next_review_at. Server supplies tenant, state, actor and timestamps.

8. Investment

Method

Endpoint

Purpose

POST

/initiatives/{id}/investments

Create investment assumption version.

GET

/initiatives/{id}/investments/current

Current investment model.

GET

/initiatives/{id}/investments

History.

POST

/investments/{id}/cost-items

Add cost item.

POST

/investments/{id}/approve

Approve/freeze version.

The reference scenario's $300,000 planned investment is serialized as decimal money, not a float.

9. Metrics & Measurement Plan

Method

Endpoint

Purpose

GET

/metrics

Available organization/template metrics.

POST

/metrics

Create organization metric.

POST

/metrics/{id}/versions

Create revised definition.

GET

/initiatives/{id}/measurement-plan

Assigned metrics/baselines/targets/guardrails.

POST

/initiatives/{id}/metrics

Assign metric version.

PATCH

/initiative-metrics/{id}

Edit permitted draft fields.

POST

/initiative-metrics/{id}/approve

Approve assignment.

POST

/initiative-metrics/{id}/baselines

Create baseline version.

POST

/baselines/{id}/approve

Approve baseline.

GET

/initiative-metrics/{id}/observations

Observation timeline.

Metric roles: PRIMARY_KPI, GUARDRAIL, SECONDARY, CONTEXT. Reference scenario uses cost per resolved case as PRIMARY_KPI and CSAT as GUARDRAIL.

10. Data Sources, Uploads & Imports

Method

Endpoint

Purpose

POST

/data-sources

Create logical source.

GET

/data-sources

List sources and health.

GET

/data-sources/{id}

Source detail/freshness.

POST

/uploads

Authorize/accept private upload; exact mechanism is a TDR.

POST

/data-sources/{id}/imports

Create ingestion run from uploaded file.

GET

/imports/{id}

Status and safe summary.

GET

/imports/{id}/errors

Rejected-row/error details.

POST

/imports/{id}/mapping

Submit draft column mapping.

POST

/imports/{id}/process

Start validated processing.

Large imports are asynchronous. Secrets and provider tokens are never returned as data-source configuration.

11. Observations & Analytics

Method

Endpoint

Purpose

POST

/initiative-metrics/{id}/observations

Create manual observation.

GET

/observations/{id}

Observation + provenance.

POST

/observations/{id}/validate

Validate.

POST

/observations/{id}/reject

Reject with reason.

GET

/initiatives/{id}/analytics/summary

Deterministic KPI/target/guardrail/investment summary.

GET

/initiative-metrics/{id}/analytics

Metric analysis.

GET

/initiatives/{id}/data-quality

Decision-relevant quality summary.

Analytics responses include periods, calculation version, input/source references and result states. Quality exposes dimensions/issues rather than a universal 0–100 score.

12. Interventions, Claims & Evidence

Method

Endpoint

Purpose

POST

/initiatives/{id}/interventions

Record material concurrent change/confounder.

GET

/initiatives/{id}/interventions

Timeline.

POST

/initiatives/{id}/claims

Create claim.

GET

/initiatives/{id}/claims

Claims.

GET

/claims/{id}

Claim detail.

POST

/claims/{id}/evidence

Attach evidence.

GET

/claims/{id}/evidence

Supporting/conflicting/context evidence.

GET

/evidence/{id}

Evidence + provenance.

POST

/evidence/{id}/validate

Human validation.

POST

/evidence/{id}/reject

Reject/dispute.

GET

/claims/{id}/strength

Claim-specific evidence strength.

Claim types include DESCRIPTIVE, CHANGE, ASSOCIATION, ATTRIBUTION, CAUSAL, FINANCIAL_VALUE and DECISION. Evidence stance is SUPPORTS, CONFLICTS or CONTEXT.

13. Reviews

Method

Endpoint

Purpose

POST

/initiatives/{id}/reviews

Create review.

GET

/initiatives/{id}/reviews

Review history.

GET

/reviews/{id}

Review/status/readiness.

POST

/reviews/{id}/prepare

Generate/refresh draft review package.

POST

/reviews/{id}/freeze

Create decision-time snapshot.

GET

/reviews/{id}/snapshot

Snapshot.

POST

/reviews/{id}/complete

Complete after required decision workflow.

Review readiness should expose blockers, KPI/guardrail result, investment/value summary, data quality, evidence support, assumptions/limitations, conflicting evidence and version metadata. Readiness is deterministic product logic.

14. Recommendations

Method

Endpoint

Purpose

POST

/reviews/{id}/recommendations

Generate policy-grounded candidate.

GET

/reviews/{id}/recommendations

History.

GET

/recommendations/{id}

Rationale, conditions, snapshot/policy references.

Types: SCALE, KEEP, OPTIMIZE, STOP, CONTINUE_MEASUREMENT. Support states: SUPPORTED, SUPPORTED_WITH_CONDITIONS, CONFLICTING, INSUFFICIENT. A recommendation is bound to an exact frozen review snapshot and policy version.

15. AI Assistance

Method

Endpoint

Purpose

POST

/reviews/{id}/ai/draft-summary

Grounded review narrative draft.

POST

/reviews/{id}/ai/investigate

Suggest investigation questions/confounders.

POST

/imports/{id}/ai/suggest-mapping

Suggest mapping for human confirmation.

POST

/recommendations/{id}/ai/explain

Explain deterministic recommendation from evidence.

GET

/ai-runs/{id}

Safe execution status/metadata where exposed.

AI cannot approve baselines or validate evidence as a human.

AI cannot record the executive decision.

AI cannot alter membership/permissions.

AI cannot execute arbitrary SQL/network actions.

AI response returns safe content, source references, limitations and ai_run_id; hidden chain-of-thought is never exposed.

16. Human Decisions

Method

Endpoint

Purpose

POST

/reviews/{id}/decisions

Record human decision.

GET

/initiatives/{id}/decisions

Decision history.

GET

/decisions/{id}

Decision detail.

POST

/decisions/{id}/expectations

Define expected follow-up result.

GET

/decisions/{id}/expectations

Follow-up plan.

Decision fields include decision_type, optional recommendation_id, rationale, conditions, decision_source, decided_at and permitted external_reference. Recommendation and decision remain separate even when they agree.

17. Outcomes

Method

Endpoint

Purpose

POST

/decisions/{id}/outcomes

Attach/record post-decision outcome.

GET

/decisions/{id}/outcomes

Outcome history.

GET

/outcomes/{id}

Expected vs actual.

POST

/outcomes/{id}/validate

Human validation.

POST

/outcomes/{id}/dispute

Dispute with rationale.

18. Notifications, Audit & Export

Method

Endpoint

Purpose

GET

/notifications

Current user's notifications.

POST

/notifications/{id}/read

Mark read.

GET

/audit

Privileged tenant audit query.

GET

/initiatives/{id}/audit

Initiative audit history.

POST

/reviews/{id}/exports

Generate authorized review export.

GET

/exports/{id}

Export status.

POST

/exports/{id}/access

Issue short-lived authorized access where applicable.

Audit API is curated and permission-controlled; it is not a raw application-log endpoint.

19. Idempotency, Concurrency & Async

Imports, review freeze, recommendation generation, AI tasks and decisions use duplicate protection where consequential.

Approved/frozen records are versioned rather than overwritten.

409 VERSION_CONFLICT signals stale writes.

Imports, large exports and selected AI tasks may return 202 with status resource.

Workers receive trusted tenant context and recheck ownership before mutation.

V0 does not require WebSockets for job progress.

20. Working Authorization Model

Implementation should check capabilities rather than scatter role-name comparisons. Working personas are Viewer/Reviewer, Initiative Owner, Validator/Analyst, Decision Maker and Org Admin.

Only authorized owners/admins edit initiative/business-case data.

Validators/authorized analysts validate baseline/evidence.

Only authorized decision makers record final decisions.

Only admins manage members/roles.

Privileged audit access is restricted.

Exact role names and capability matrix remain a validation item.

21. Core Scenario Walkthrough

GET /me initializes tenant context.

POST /initiatives creates AI Support Automation.

Investment API records the $300,000 plan.

Measurement API assigns cost/case PRIMARY_KPI and CSAT GUARDRAIL.

Baselines record $8.40 cost/case and 91% CSAT.

Upload/import ingests the 90-day fixture.

Analytics returns the deterministic fixture results of $6.90 cost/case and 91.4% CSAT.

Claims/evidence capture what can responsibly be said and conflicting/context evidence.

Review is prepared and frozen.

Recommendation candidate is generated from snapshot + policy.

AI may draft explanation/investigation support.

Human decision is recorded independently.

Expectations and later outcomes close the loop.

These figures are reference test/demo inputs, not market or customer-result claims.

22. Explicitly Deferred Endpoints

Generic autonomous /agent/run.

Arbitrary SQL/query API.

Public developer API.

Large connector catalog.

Generic workflow builder.

Billing API.

Fine-tuning/training API.

Graph traversal API.

Cross-customer benchmark API.

Mobile-specific API.

23. Open Decisions

Exact Clerk token/session integration between Next.js and FastAPI.

Exact RBAC capability matrix.

Presigned upload vs backend multipart upload.

Worker/job framework and operation-resource shape.

ETag/If-Match vs explicit version counter.

Review prepare/freeze semantics after prototype testing.

Synchronous vs asynchronous small AI tasks.

External actual-decider vs recorder representation.

Export formats.

RLS/service database identity strategy.

OpenAPI-to-TypeScript client generation approach.

24. Acceptance Criteria

Core Scenario #1 can be completed through documented routes.

Every business route is tenant-scoped and object-authorized.

Changing a UUID cannot cross tenant boundaries.

Approved/versioned meaning is not silently overwritten.

Manual/imported data retain provenance.

Authoritative analytics are deterministic and versioned.

Evidence can support, conflict or contextualize.

Frozen review preserves decision-time context.

Recommendation references exact snapshot/policy.

Human can disagree with recommendation.

Outcome can be compared with expectation.

AI remains optional to authoritative workflow.

Secrets/tokens never appear in ordinary responses.

Material mutations are auditable.

Appendix A — Module Map

Module

Route Areas

identity

/me, /organization, /members

initiatives

/initiatives

investments

/investments

metrics

/metrics, /initiative-metrics, /baselines

ingestion

/data-sources, /uploads, /imports, /observations

analytics

/analytics, /data-quality

evidence

/claims, /evidence

reviews

/reviews

recommendations

/recommendations

decisions

/decisions, /expectations, /outcomes

ai

task-specific /ai routes, /ai-runs

notifications

/notifications

audit

/audit

exports

/exports

Appendix B — Decisions Carried Forward

Clerk authentication, not Supabase Auth.

Internal UUIDs canonical; backend authorization authoritative.

PostgreSQL system of record.

Manual/CSV first.

Deterministic calculations own authoritative numbers.

Data Quality, Evidence Strength and Recommendation Support remain separate.

AI is advisory and evidence-grounded.

Recommendation and human decision remain distinct.

Historical review/decision meaning is preserved.

Advanced infrastructure remains deferred.

Appendix C — New Concerns

Concern

Treatment

Status

Role/capability model remains unvalidated.

Implement capability checks and validate persona mapping.

VALIDATE

Upload mechanism not selected.

Presigned vs multipart spike.

TDR

Review prepare/freeze semantics may change after prototype.

Freeze final contract after workflow test.

VALIDATE

AI sync/async depends on provider latency.

Benchmark without changing domain semantics.

TDR

External decider identity ambiguous.

Do not overbuild before workflow evidence.

VALIDATE

RLS/Clerk strategy remains foundational.

Backend tenant enforcement regardless; run RLS spike.

P0 TDR