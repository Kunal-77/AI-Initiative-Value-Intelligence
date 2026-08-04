AI INITIATIVE VALUE INTELLIGENCE

APP FLOW v0.1

Modern, decision-first workflow specification



Status

Working specification — derived from approved PRD v0.1

Date

July 29, 2026

Auth decision

Clerk

Core wedge hypothesis

AI Customer Support Value



1. Purpose

This document defines how people move through the product, what question they are trying to answer at each stage, what information is required, and what decision follows. Screens are derived from the investment lifecycle rather than from a generic SaaS dashboard template.

Core loop: PROPOSE → DEFINE SUCCESS → BASELINE → REVIEW → ACTIVATE → MEASURE → INVESTIGATE → DECIDE → MEASURE THE DECISION → LEARN.

2. Primary Actors

Executive / Approver

CFO, CTO, CIO or delegated leader. Decides whether an initiative deserves capital and what to do next.

Initiative Owner

Functional or AI program leader. Defines the case, operates the initiative and responds to issues.

Finance / Analyst

Validates cost, metrics, methodology, evidence and reporting.

Functional Reviewer

Validates operational interpretation and guardrails.

Organization Admin

Manages access, integrations and governance.

3. Navigation Model

Home — decisions, exceptions, reviews and material changes requiring attention.

Initiatives — proposed, active, paused, completed and stopped initiatives.

Decisions — recommendations awaiting action plus decision history.

Data — imports, integrations, freshness and data-quality issues.

Organization / Settings — members, roles and governance.

Evidence remains primarily contextual to an initiative in V0. Home should not become a wall of KPI cards or a chatbot-first interface.

4. First-Time Entry

4.1 Authentication

Sign in through Clerk. Paths: existing member → organization; new user → create/join organization; invitee → accept membership → organization.

4.2 Organization Setup

Ask only for immediately useful information: organization name, size band, industry and the user's role.

4.3 Intent Entry

Evaluate a proposed AI initiative.

Measure an initiative already underway.

Review an existing initiative.

The choice changes the flow. A proposed initiative establishes measurement before deployment; an existing initiative may require reconstructed-baseline warnings.

5. Home — Attention Surface

Primary question: What requires my attention today?

Decisions assigned to the user.

Guardrail breaches and material metric changes.

Upcoming reviews.

Missing/stale evidence blocking a decision.

Recently changed outcomes.

Compact portfolio context where useful.

6. Core Flow A — Proposed Initiative

Create Initiative

Business Case

Investment

Define Success

Measurement Plan

Baseline Readiness

Investment Review

Approve / Request Changes / Reject

Activate

6.1 Create Initiative

Capture name, owner, business area, short problem statement and timing. Keep this step short.

6.2 Business Case

Capture the current problem, proposed intervention, affected process, expected business outcome, and known constraints. AI may structure supplied information but must not invent business claims.

6.3 Investment

Vendor/software cost.

Infrastructure/usage cost.

Implementation cost.

Relevant labor/change-management cost.

One-time vs recurring cost.

Unknowns and assumptions.

Support ranges and unknown values instead of forcing fake precision.

6.4 Define Success

Primary objective.

Primary KPI and desired direction.

Target or acceptable range.

Guardrails.

Review period.

Optional secondary outcomes.

Vague goals such as 'improve productivity' should trigger a request for an observable outcome.

6.5 Measurement Plan

Metric definition/unit.

Data source.

Frequency.

Baseline period.

Validator.

Known confounders/limitations.

6.6 Baseline Readiness

READY — required baseline and sources exist.

PARTIAL — useful measurement is possible but important evidence is missing.

NOT READY — a core success claim cannot currently be measured.

6.7 Investment Review

Executive sees requested investment, problem, expected outcome, baseline, target, KPIs, guardrails, measurement readiness, assumptions and planned review date.

Actions: APPROVE, REQUEST CHANGES, REJECT. The decision records actor, time, rationale and the reviewed version.

7. Core Flow B — Existing Initiative

Create/import initiative

Record original objective and investment

Identify deployment date

Attempt baseline reconstruction

Connect/import current data

Assess measurement quality

Begin monitored review

A reconstructed baseline must be labeled as reconstructed. Weak historical evidence must remain visible as a limitation.

8. Active Initiative

Primary question: Is the initiative moving toward the outcome we approved?

Status and next review.

Expected outcome vs observed trajectory.

Primary KPI.

Guardrails.

Actual spend vs plan.

Evidence/data-quality health.

Material changes.

Recorded interventions.

Usage/adoption is supporting context unless adoption itself is an approved objective.

9. Exception — Guardrail Breach

Threshold breach detected.

Initiative becomes NEEDS ATTENTION.

Owner/reviewer receives the issue.

User opens affected metric.

System shows timing, magnitude, segments and evidence.

AI may propose investigation questions.

Human records an intervention.

System measures recovery.

The product must never celebrate a primary KPI improvement while hiding a failed guardrail.

10. Evidence Investigation

Primary question: Why does the system believe this, and how strong is the evidence?

Claim under review.

Supporting and conflicting observations.

Sources.

Formula/methodology.

Period and scope.

Data-quality issues.

Assumptions/confounders.

Evidence strength.

AI explanation separated from source facts.

Conversational analysis belongs here contextually—for example, 'Which ticket categories changed most after rollout?' Structured tools retrieve metrics/decisions; semantic retrieval supports unstructured evidence.

11. Exception — Insufficient Evidence

Show what evidence is missing or unreliable.

Explain how that affects the conclusion.

Offer concrete next steps.

Support CONTINUE MEASUREMENT as a legitimate recommendation.

Do not convert uncertainty into an unexplained AI confidence percentage.

12. Exception — Data Failure

Source becomes stale/fails.

Affected metrics become stale/unavailable.

Dependent evidence/recommendations are downgraded or blocked.

Data owner receives remediation action.

After recovery, metrics recalculate and material changes are surfaced.

Failed data must never leave apparently current executive metrics on screen.

13. Scheduled Review

Expected vs actual outcome.

Baseline vs current state.

Primary KPI and guardrails.

Planned vs actual investment.

Operational context.

Evidence strength/data quality.

Assumptions/confounders.

Interventions.

Recommendation and conditions.

14. Recommendation

SCALE — support broader investment/deployment.

KEEP — continue current scope.

OPTIMIZE — value is plausible but changes are needed.

STOP — evidence does not justify continuation under current conditions.

CONTINUE MEASUREMENT — evidence is insufficient for a responsible directional decision.

Every recommendation includes rationale, evidence, conditions, uncertainty and next-review logic.

15. Decision Review

Executive question: Given what we now know, what should we do?

Accept recommendation.

Choose a different decision.

Request analysis.

Defer.

Record budget/scope/conditions.

Record rationale.

Recommendation and human decision are separate records.

16. Post-Decision Flow

Record decision.

Record action/scope/budget change.

Define expected result of that decision.

Set follow-up window.

Measure actual result.

Compare expected vs actual.

Attach learning to initiative and decision history.

The workflow continues after the decision; this is how institutional investment memory is created.

17. Rejected, Paused and Stopped

Rejected — preserve proposal, assumptions and rejection rationale.

Paused — preserve reason, timing, measurement impact and resume conditions.

Stopped — capture reason, outcome to date, residual obligations and lessons.

18. Persona-Specific Home Priorities

Persona

Prioritize

Avoid

Executive

Pending decisions, material exceptions, reviews

Operational noise

Initiative Owner

Health, guardrails, evidence gaps, interventions

Portfolio finance overload

Finance / Analyst

Cost, definitions, data quality, evidence

Decorative summaries

Functional Reviewer

Operational outcomes and guardrails

Unrelated financial detail

Admin

Access, integrations, failures

Decision workflow unless assigned

19. Notification Philosophy

Decision assigned.

Guardrail breached.

Required evidence missing.

Review due.

Recommendation materially changed.

Data failure affects decision-critical metric.

Post-decision outcome ready.

Do not notify users for routine data movement.

20. Business State Model

DRAFT

MEASUREMENT SETUP

AWAITING REVIEW

APPROVED / PLANNED

ACTIVE

NEEDS ATTENTION

REVIEW DUE

DECISION PENDING

PAUSED

STOPPED

COMPLETED

Technical sync/calculation health is separate from the business lifecycle state.

21. Core Scenario — AI Customer Support

A fictional 520-person B2B SaaS company proposes a $300,000 annual AI support initiative.

Baseline: cost/case $8.40; resolution time 11.2h; CSAT 91%; escalation 14%.

Target: reduce cost/case 20%; CSAT guardrail ≥90%; escalation ≤15%.

Finance validates assumptions; executive approves.

During rollout, efficiency improves but CSAT falls to 88.8%.

System raises a guardrail breach rather than declaring success.

Investigation finds the decline concentrated in sensitive categories and labels it association—not proven causality.

Team changes routing and records the intervention.

At 90 days: cost/case $6.90; resolution 8.1h; CSAT 91.4%; escalation 12.7%.

System recommends SCALE WITH CONDITIONS.

Executive approves limited expansion.

Platform later measures whether scaling produced the expected result.

22. Screen Inventory Derived from Flow

Sign In / Invitation

Organization Setup

Intent Entry

Home / Attention

Initiatives

Create Initiative

Business Case

Investment

Success Definition

Measurement Plan

Baseline Readiness

Investment Review

Active Initiative

Metric / Guardrail Detail

Evidence Investigation

Scheduled Review

Decision Review

Post-Decision Outcome

Decision History

Data / Integrations

Organization / Access / Settings

These are candidate product surfaces, not a requirement that each become a separate route.

23. Modern UX Constraints for UI_UX_BRIEF

Decision-first, not dashboard-first.

Progressive disclosure: executives get conclusions; analysts can drill into evidence.

Contextual AI, not a permanent chatbot dominating the product.

Calm, high-trust visual language appropriate for financial and strategic decisions.

Professional information density without legacy-enterprise clutter.

Evidence, uncertainty and guardrails as first-class UI objects.

Natural product language; avoid unnecessary 'AI-powered' labels.

Responsive layouts preserve decision hierarchy rather than merely stacking desktop cards.

24. Acceptance Criteria

Proposed initiatives can reach review without requiring integrations first.

Existing initiatives have an explicit reconstructed-baseline path.

Business lifecycle and data health are distinguishable.

Guardrail breaches change expected user action.

Insufficient evidence is supported.

Recommendations trace to evidence.

Human decisions remain independent records.

Post-decision outcomes are measured.

Persona differences affect priority without creating separate products.

25. Open Questions

Should in-product investment approval be mandatory or optional when approval occurs elsewhere?

Does V0 need multiple approvers?

How should post-approval metric-definition changes be versioned/re-approved?

Which actions require rationale?

Should reviews be calendar-based, threshold-triggered, or both?

How much portfolio context belongs on Executive Home early on?

Does customer discovery confirm AI Support as the first wedge?

Which collaboration features are actually required for pilots?

Appendix A — Architecture Decisions Affecting Flow

Authentication: Clerk.

Authentication and product authorization are separate.

Backend controls product permissions/tenant authorization.

Prefer internal organization UUID mapped to Clerk organization ID.

Supabase Auth is excluded.

Structured retrieval is primary for metrics/evidence/decisions; semantic retrieval is supplemental.

Material AI recommendations remain advisory and human-reviewed.

Appendix B — Running Change Log

Version

Date

Decision

Affected Documents

0.1

2026-07-29

Initial APP FLOW derived from approved PRD and Core Scenario #1.

APP_FLOW

0.1

2026-07-29

Clerk authentication; backend authorization; internal org UUID preferred.

TRD, BACKEND_SCHEMA, SECURITY_PRIVACY, IMPLEMENTATION_PLAN

0.1

2026-07-29

Workflow/design must be rationale-driven and product-specific, not a renamed generic AI/SaaS template.

APP_FLOW, UI_UX_BRIEF