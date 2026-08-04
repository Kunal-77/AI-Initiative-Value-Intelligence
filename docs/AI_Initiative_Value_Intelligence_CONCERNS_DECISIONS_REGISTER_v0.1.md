AI INITIATIVE VALUE INTELLIGENCE

CONCERNS & DECISIONS REGISTER v0.1

What is decided, what must be validated, and what must not be forgotten



Status

Working cross-document register

Date

July 29, 2026

Purpose

Prevent assumptions and unresolved concerns from disappearing during implementation

Decision principle

Resolve blockers now; validate product unknowns with customers; defer complexity until justified

Primary references

PRD, APP_FLOW, UI_UX_BRIEF, DATA_EVIDENCE_SPEC, TRD, BACKEND_SCHEMA, SECURITY_PRIVACY, IMPLEMENTATION_PLAN

Next review

Before prototype/build scope freeze and again before external pilot



1. Purpose

This register consolidates the decisions, concerns, assumptions and unresolved questions accumulated while defining the product. It is intentionally separate from the PRD and technical documents so those documents can remain readable while uncertainty stays visible.

An item appearing here is not evidence that the design is wrong. It means the item should be resolved by customer validation, a technical decision, implementation evidence, security/legal review, or later scale requirements.

2. Status Model

Status

Meaning

DECIDED

Direction is accepted unless new evidence materially changes it.

VALIDATE

Requires customer/user evidence before finalizing.

TDR / SPIKE

Requires a technical decision record or engineering experiment.

BEFORE PILOT

Can wait during prototype/build, but must be resolved before confidential external customer use.

LATER

Intentionally deferred until demand/scale justifies it.

MONITOR

Current direction is acceptable; watch for evidence that assumptions break.

3. Priority Model

Priority

Meaning

P0

Blocks safe or coherent implementation/pilot if unresolved.

P1

Material product/technical decision that should be resolved during V0.

P2

Important but can be validated during pilot.

P3

Future optimization/scale concern.

4. Decisions Already Made

ID

Decision

Reference

Status

D-001

Product is decision intelligence for AI initiatives, not generic SaaS spend management.

PRD

DECIDED

D-002

Initial product value is evidence-based review of AI investments: continue, optimize, scale, stop, or measure more.

PRD / APP_FLOW

DECIDED

D-003

Human remains decision authority; AI is advisory.

PRD / DATA_EVIDENCE_SPEC / SECURITY_PRIVACY

DECIDED

D-004

Clerk is the authentication provider.

TRD / BACKEND_SCHEMA / SECURITY_PRIVACY

DECIDED

D-005

Backend owns authorization; authentication does not equal authorization.

TRD / SECURITY_PRIVACY

DECIDED

D-006

Internal organization UUID is canonical; Clerk organization ID is a mapping.

TRD / BACKEND_SCHEMA

DECIDED

D-007

PostgreSQL is system of record.

TRD / BACKEND_SCHEMA

DECIDED

D-008

Supabase may host PostgreSQL, but Supabase Auth is not part of the architecture.

TRD / BACKEND_SCHEMA

DECIDED

D-009

Modular monolith first; microservices are deferred.

TRD

DECIDED

D-010

Manual entry and CSV are first-class V0 data paths.

TRD / IMPLEMENTATION_PLAN

DECIDED

D-011

Authoritative KPI, ROI and guardrail calculations are deterministic, not LLM-generated.

DATA_EVIDENCE_SPEC / TRD

DECIDED

D-012

Structured retrieval is primary; semantic/vector retrieval is supplemental.

TRD

DECIDED

D-013

No arbitrary universal numeric AI confidence score in V0.

DATA_EVIDENCE_SPEC

DECIDED

D-014

Data Quality, Evidence Strength and Recommendation Support are separate concepts.

DATA_EVIDENCE_SPEC

DECIDED

D-015

Observed change must not silently become causal attribution.

DATA_EVIDENCE_SPEC

DECIDED

D-016

Recommendation and human decision are separate records.

BACKEND_SCHEMA

DECIDED

D-017

SCALE WITH CONDITIONS is SCALE plus support/conditions metadata, not a separate recommendation type.

DATA_EVIDENCE_SPEC / BACKEND_SCHEMA

DECIDED

D-018

Financial value distinguishes realized savings, avoided cost, released capacity and modeled value.

DATA_EVIDENCE_SPEC

DECIDED

D-019

Raw data minimization is a product and security principle.

SECURITY_PRIVACY

DECIDED

D-020

Do not claim certifications/compliance that have not actually been achieved/validated.

SECURITY_PRIVACY

DECIDED

D-021

Advanced infrastructure such as Kafka, Kubernetes, ClickHouse, graph DB and dedicated vector DB is deferred until justified.

TRD / IMPLEMENTATION_PLAN

DECIDED

D-022

Core Scenario #1 — AI Support Automation — is the initial reference scenario/test fixture.

APP_FLOW / IMPLEMENTATION_PLAN

DECIDED

D-023

AI is added after deterministic data/evidence foundations in implementation order.

IMPLEMENTATION_PLAN

DECIDED

D-024

Product UI should feel deliberately designed for the workflow, not like a generic AI dashboard/template.

UI_UX_BRIEF

DECIDED

5. Product / Market Concerns

ID

Concern / Question

Why It Matters

Priority

Status / Resolution Path

PM-001

Will target customers pay for a dedicated AI initiative value-intelligence product?

Strong product architecture does not prove budget or urgency.

P0

VALIDATE — discovery + pilot willingness to pay/continue.

PM-002

Which buyer owns the budget: CFO, transformation/AI leader, CIO, operations, procurement, or another role?

Changes positioning, workflow, permissions and sales motion.

P0

VALIDATE.

PM-003

Is the painful workflow frequent enough to support recurring SaaS usage?

AI investment reviews may be periodic rather than daily.

P0

VALIDATE review cadence and portfolio size.

PM-004

Is the initial segment SMEs, mid-market, enterprise, or a narrower AI-heavy segment?

Security, integrations, pricing and onboarding differ significantly.

P0

VALIDATE; do not serve everyone initially.

PM-005

Does the product need a narrow first use-case template or can it start horizontal?

Horizontal value models risk generic recommendations.

P1

Start reference scenario; validate repeated models.

PM-006

How much of the value is workflow vs analytics vs AI explanation?

Determines where engineering effort creates differentiation.

P1

VALIDATE through prototype/pilot.

PM-007

Will customers trust a new vendor with investment and operational evidence?

Trust/security may be a sales blocker.

P1

Validate during interviews; security baseline before pilot.

PM-008

Is spreadsheet + BI + meetings 'good enough' for target customers?

Primary substitute may be process, not software competitor.

P0

VALIDATE comparative pain/time/error.

PM-009

What is the pricing unit: organization, initiatives, portfolio size, seats, managed spend/value, or tier?

Pricing affects product architecture and go-to-market.

P2

Defer until willingness-to-pay interviews/pilot.

PM-010

Can the product prove its own ROI?

Buyers will expect decision/preparation savings or better capital allocation.

P1

Instrument review preparation/decision outcomes.

6. Workflow / APP_FLOW Concerns

ID

Concern / Question

Current Direction

Priority

Status

WF-001

Approvals may occur outside the product.

Allow decision_source=EXTERNAL concept; do not build full external workflow yet.

P1

VALIDATE

WF-002

Recorder may not be the actual external decision maker.

Schema may need recorded_by and actual_decider separately.

P1

VALIDATE before external decision feature.

WF-003

Too many visible lifecycle/data/evidence states may overwhelm users.

Keep precise backend states; map to fewer user-facing states.

P1

VALIDATE in prototype.

WF-004

Review ownership may differ by company.

Role/assignment model remains configurable enough to evolve.

P1

VALIDATE.

WF-005

Recommendation types may not match customer vocabulary.

Keep internal types; test labels in interviews.

P1

VALIDATE.

WF-006

A formal approval may not exist for every initiative.

Decision record is more general than approval workflow.

P1

VALIDATE.

WF-007

Post-decision follow-up may be ignored without ownership/notifications.

Create expectation + due follow-up; validate behavior.

P2

MONITOR during pilot.

WF-008

Some customers may review portfolios rather than individual initiatives.

Individual initiative first; portfolio layer later.

P2

LATER unless pilot requires.

7. UI / UX Concerns

ID

Concern / Question

Current Direction

Priority

Status

UX-001

Product may look like a generic AI-generated dashboard.

Workflow-specific hierarchy, restrained AI presence, evidence-first details.

P1

VALIDATE prototype.

UX-002

Executives may not want methodological detail.

Progressive disclosure: decision summary first, evidence/method available.

P1

VALIDATE.

UX-003

Evidence taxonomy E0–E6 may be too technical externally.

Keep internal; map to simpler language if testing confirms.

P1

VALIDATE.

UX-004

Too many badges/scores can create false precision.

Prefer descriptive states and explanation.

P1

DECIDED / monitor.

UX-005

Role-specific needs may fragment the interface.

Shared initiative model with contextual views/actions.

P2

VALIDATE.

UX-006

AI chat could become a distracting primary interface.

AI contextual to workflow; not primary navigation.

P1

DECIDED.

UX-007

Charts may imply causality or certainty unintentionally.

Label periods/interventions/evidence and pair visuals with interpretation.

P1

Carry to design/testing.

UX-008

Users need fast source inspection without leaving decision context.

Evidence/source drawer or contextual inspection pattern.

P1

VALIDATE prototype.

8. Data & Evidence Concerns

ID

Concern / Question

Current Direction

Priority

Status

DE-001

Evidence-strength methodology could appear pseudo-scientific.

Descriptive LIMITED/MODERATE/STRONG with explicit factors; no arbitrary score.

P0

VALIDATE methodology.

DE-002

Attribution methodology differs by initiative type.

Progressive analysis; no universal causal promise.

P1

VALIDATE by use case.

DE-003

Before/after change may be mistaken for initiative effect.

Explicit observed-change vs attribution distinction.

P0

DECIDED.

DE-004

Released capacity may be misrepresented as cash savings.

Separate value categories.

P0

DECIDED.

DE-005

Baseline may be missing or reconstructed.

Label reconstructed baseline and downgrade/block claims as appropriate.

P1

DECIDED / validate thresholds.

DE-006

Baseline/current populations or methods may not be comparable.

Comparability quality dimension + disclosure/normalization.

P1

Carry to analytics.

DE-007

Confounders may be incomplete because users do not record them.

Interventions + investigation prompts + reviewer challenge.

P1

MONITOR.

DE-008

Metric definitions may change over time.

Version definitions and preserve decision-time meaning.

P1

DECIDED.

DE-009

Financial value assumptions may dominate result.

Expose assumptions and sensitivity/ranges where needed.

P1

VALIDATE.

DE-010

Customers may disagree with our evidence-strength labels.

Human review/override with rationale; methodology versioned.

P1

VALIDATE.

DE-011

E0–E6 taxonomy itself is unvalidated.

Treat as internal working taxonomy.

P2

VALIDATE.

DE-012

Data quality could collapse into another meaningless score.

Use dimensions + transparent states.

P1

DECIDED.

9. Technical Architecture Concerns

ID

Concern / Question

Current Direction

Priority

Status

TA-001

Which managed PostgreSQL provider?

Standard PostgreSQL architecture; Supabase Postgres is an option.

P1

TDR / SPIKE

TA-002

Should PostgreSQL RLS be mandatory in V0?

Backend auth mandatory; RLS defense-in-depth candidate.

P0

TDR / SPIKE before pilot.

TA-003

Which background job framework?

Use simple worker; Temporal only if durable workflow needs emerge.

P1

TDR / SPIKE.

TA-004

Which object-storage provider?

S3-compatible abstraction.

P1

TDR.

TA-005

Which LLM provider/model?

Internal adapter; benchmark privacy, quality, tools, latency and cost.

P0

TDR / SPIKE before external AI data.

TA-006

Do we need pgvector in V0?

Only when unstructured evidence retrieval is implemented.

P2

LATER / benchmark.

TA-007

Do we need LangGraph?

No unless concrete stateful multi-step AI workflow justifies it.

P2

LATER.

TA-008

Will PostgreSQL handle pilot analytical load?

Postgres + Polars/DuckDB first.

P2

MONITOR.

TA-009

Review snapshots: reference-only vs materialized copy?

Hybrid approach proposed.

P1

TDR / SPIKE before review module.

TA-010

Monorepo vs separate repos?

Monorepo preferred for early team, not architectural requirement.

P2

DECIDE during setup.

TA-011

Hosting topology not selected.

Managed web + container API/worker + managed DB/storage.

P1

TDR.

TA-012

API type sharing strategy between Python and TypeScript?

Typed contracts/generation where practical.

P2

Implementation decision.

10. Backend Schema Concerns

ID

Concern / Question

Current Direction

Priority

Status

BS-001

Generic data_quality_assessments target_type/target_id weakens referential integrity.

Consider domain-specific assessment tables or constrained generic design.

P1

TDR before DDL freeze.

BS-002

Multi-currency initiatives are underdefined.

Currency per monetary record; conversion model deferred.

P2

VALIDATE need.

BS-003

Observation scope JSONB may become hard to query.

JSONB in V0; normalize proven dimensions later.

P2

MONITOR.

BS-004

Audit before/after JSON can duplicate sensitive data.

Store only relevant changes; redact/minimize.

P1

BEFORE PILOT.

BS-005

Review snapshots may duplicate substantial data.

Hybrid references + materialized decision context.

P1

TDR.

BS-006

External decision identity is ambiguous.

Separate actual decider/recorder if feature validated.

P1

VALIDATE.

BS-007

Immutability boundaries are not fully defined.

Approved definitions/baselines/reviews/decisions versioned; DB enforcement TBD.

P1

Implementation/TDR.

BS-008

Raw event-level data may outgrow observations model.

Keep raw events outside canonical observations; warehouse later if needed.

P2

MONITOR.

BS-009

Generic audit resource_type/resource_id lacks FK integrity.

Acceptable for audit flexibility if application guarantees references.

P2

MONITOR.

BS-010

Organization deletion conflicts with retained decision/audit history.

Controlled deletion/anonymization policy required.

P0

BEFORE PILOT/legal.

11. Security & Privacy Concerns

ID

Concern / Question

Current Direction

Priority

Status

SP-001

RLS strategy with Clerk/backend context is unresolved.

Prototype and test; never rely on Clerk to configure DB isolation automatically.

P0

TDR / SPIKE.

SP-002

AI provider may retain/process data incompatibly with customer requirements.

Provider terms/configuration review + minimum context + possible AI disablement.

P0

BEFORE PILOT.

SP-003

Exact retention periods unknown.

Do not publish promises yet.

P0

BEFORE PILOT.

SP-004

Uploaded files may contain malware or parser attacks.

Type/size validation; evaluate scanning for external arbitrary uploads.

P0

BEFORE PILOT.

SP-005

Uploaded evidence may contain prompt injection.

Treat evidence as untrusted; narrow tools + authorization at tool boundary.

P0

DECIDED; implement/test.

SP-006

Operator access could bypass tenant controls.

MFA, least privilege, logged access, synthetic dev data.

P0

BEFORE PILOT.

SP-007

Data residency requirements unknown.

Select pilot region based on target customer needs.

P1

VALIDATE before provider freeze.

SP-008

Enterprise SAML/SCIM demand unknown.

Use Clerk capabilities if demanded; don't implement preemptively.

P2

VALIDATE sales pipeline.

SP-009

Field-level encryption needs unknown.

Encrypt secrets; evaluate proven sensitive business fields.

P1

Security review.

SP-010

Deletion from backups cannot be immediate in many architectures.

Document backup expiry behavior; avoid false promises.

P0

BEFORE PILOT.

SP-011

Compliance could be overstated in pitch.

Explicit claim restrictions documented.

P0

DECIDED.

SP-012

Incident response lacks named owners/timelines until company ops are defined.

Create runbook before external pilot.

P0

BEFORE PILOT.

SP-013

Customer may require AI opt-out/provider controls.

Architecture permits constraint; validate demand.

P1

VALIDATE.

SP-014

Arbitrary document uploads may expand sensitive-data footprint.

Prefer structured inputs first; enable docs when justified.

P1

VALIDATE.

12. Implementation / Delivery Concerns

ID

Concern / Question

Current Direction

Priority

Status

IM-001

12–20 week small-team estimate may not apply to solo build.

Use reduced vertical slice and revise after validation.

P1

MONITOR.

IM-002

Coding before workflow validation could waste months.

Phase 0 + prototype gate first.

P0

DECIDED.

IM-003

AI work could consume time before core value is proven.

AI follows deterministic review slice.

P0

DECIDED.

IM-004

First pilot may demand a connector.

Manual/CSV default; build only a qualified pilot blocker connector.

P1

VALIDATE.

IM-005

Recommendation policy may be too generic.

Start with reference use case and version policies.

P1

VALIDATE.

IM-006

Security may be postponed under launch pressure.

Explicit before-pilot security gate.

P0

DECIDED.

IM-007

Documentation may drift from code.

ADR/TDR + update docs when behavior/architecture changes.

P1

MONITOR.

IM-008

Founder/team may build breadth before closing the outcome loop.

Core loop must reach post-decision outcome before portfolio breadth.

P1

DECIDED.

IM-009

No pilot customer means technical progress may hide market risk.

Product gates include willingness to use/pay/continue.

P0

VALIDATE.

IM-010

Too many unresolved questions could prevent starting.

Resolve blockers only; defer non-blockers deliberately.

P0

DECIDED.

13. P0 — Must Resolve Before or During Early Build

These items deserve immediate attention because they affect product viability or foundational correctness.

PM-001 — willingness to pay / meaningful customer urgency.

PM-002 — actual buyer and decision participants.

PM-003 — review frequency/recurring usage.

PM-004 — initial customer segment.

PM-008 — whether current spreadsheet/BI process is painful enough to replace.

DE-001 — credible evidence-strength approach and language.

TA-002 / SP-001 — RLS strategy, while backend authorization remains mandatory regardless.

TA-005 / SP-002 — LLM provider privacy/quality strategy before real confidential AI processing.

BS-010 / SP-003 / SP-010 — retention/deletion/backups before external customer commitments.

SP-004 / SP-005 — safe uploads and prompt-injection boundary.

SP-006 — production operator access.

SP-012 — incident-response baseline.

IM-002 / IM-009 — validate workflow and real customer interest before treating coding as progress.

14. Decisions Required Before Prototype

Who exactly is the first prototype persona?

What real decision are they trying to make?

What minimum information must appear in the review board?

Which evidence terminology is understandable without training?

Which recommendation labels feel natural?

Does decision/approval happen inside or outside the tool?

Which parts of the methodology belong on-screen versus behind progressive disclosure?

15. Decisions Required Before Engineering Foundation Freeze

Managed PostgreSQL provider.

Hosting topology.

Object storage.

Repository structure.

Clerk environment/organization integration pattern.

Initial RBAC matrix.

Whether RLS is included immediately or introduced before pilot.

Background worker framework.

Baseline observability stack.

16. Decisions Required Before External Pilot

LLM provider/model and customer-data terms/configuration.

Data region.

Retention schedule.

Deletion/export process.

Backup/PITR and restoration procedure.

Production access policy.

File scanning/allowed upload formats.

Incident response owner/process.

Security/privacy customer documentation.

Tenant isolation test results.

AI grounding/prompt-injection evaluation results.

Known limitations and claims allowed in sales material.

17. Decisions That Should Explicitly Wait

Kafka/event streaming platform.

Kubernetes.

Microservices split.

Dedicated vector database.

Graph database.

ClickHouse/warehouse.

LangGraph unless workflow requires it.

Custom/fine-tuned LLM.

Large connector catalog.

Native mobile application.

Complex workflow builder.

Cross-customer benchmark network.

Customer-managed encryption keys.

Full enterprise SCIM unless pipeline demands it.

18. Assumptions We Must Not Treat as Facts

SMEs/mid-market are definitely the best first segment.

CFO is definitely the buyer.

Every company has enough AI initiatives to need a dedicated platform.

Users want an AI-generated recommendation.

Customers will accept our evidence taxonomy.

CSV onboarding is sufficient for a paid pilot.

Customers will upload financial/operational evidence to a startup.

20% savings or any generic ROI threshold applies across initiatives.

More integrations automatically create more product value.

AI agents are required for differentiation.

Enterprise infrastructure makes the product enterprise-ready.

Competitors ignoring a feature proves there is market whitespace.

19. Decision Log Template

Future decisions should be added with:

Field

Meaning

Decision ID

Stable ID such as TDR-003 or PD-012.

Date

When decision was accepted.

Question

What had to be decided.

Context

Why the decision matters.

Options

Real alternatives considered.

Evidence

Customer, technical, cost, security or operational evidence.

Decision

Chosen direction.

Why

Reasoning.

Consequences

Trade-offs/new constraints.

Revisit Trigger

Evidence that should cause reconsideration.

Owner

Person accountable for follow-through.

20. Recommended Immediate Resolution Sequence

Validate initial persona, buyer and review workflow with real target users.

Prototype the review/decision experience and test terminology.

Freeze the narrow first use case and V0 success criteria.

Run RLS/Clerk tenant-isolation spike.

Benchmark LLM providers against privacy + structured tool-use + groundedness requirements.

Select hosting/Postgres/storage/job foundation.

Finalize initial RBAC and review-snapshot design.

Create API_CONTRACT v0.1 and TEST_EVAL_PLAN v0.1.

Begin the first vertical slice.

Resolve retention/deletion/incident/provider-security items before external confidential data.

21. Final Product Guardrails

We do not confuse polished UI with validated demand.

We do not confuse observed change with causality.

We do not confuse modeled value with realized savings.

We do not confuse AI confidence with evidence strength.

We do not confuse authentication with authorization.

We do not confuse using a cloud/security product with being compliant.

We do not confuse infrastructure complexity with product maturity.

We do not hide conflicting evidence to make recommendations look stronger.

We do not let AI silently become the decision maker.

We do not build a feature solely because a competitor has it.

We do not let unresolved long-term questions block a testable V0.

We update decisions when real evidence proves an assumption wrong.

Appendix A — Document Review Status

Document

Working Status

Key Remaining Validation

PRD v0.1

Approved for validation

Buyer, segment, willingness to pay, repeated use cases.

APP_FLOW v0.1

Working approved

External decisions, roles, state simplification.

UI_UX_BRIEF v0.1

Working approved

Executive density, terminology, evidence disclosure.

DATA_EVIDENCE_SPEC v0.1

Working approved

Evidence-strength methodology, attribution by use case.

TRD v0.1

Working approved

Providers, RLS, jobs, hosting, model choice.

BACKEND_SCHEMA v0.1

Working approved

Quality target model, snapshots, external decision identity, deletion.

SECURITY_PRIVACY v0.1

Working approved

Retention, provider terms, region, RLS, operator/incident process.

IMPLEMENTATION_PLAN v0.1

Working approved

Timeline after validation/team capacity, first pilot requirements.

Appendix B — Register Ownership

During validation and implementation, this register should be reviewed whenever a major product, architecture, security or pilot decision is made. Resolved items should remain in the register with their final decision rather than being deleted, preserving why the product evolved.