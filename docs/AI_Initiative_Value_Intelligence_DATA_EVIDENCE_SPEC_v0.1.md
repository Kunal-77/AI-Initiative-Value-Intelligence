AI INITIATIVE VALUE INTELLIGENCE

DATA & EVIDENCE SPEC v0.1

Measurement, lineage, evidence, attribution and decision-trust specification



Status

Working specification — derived from PRD, APP_FLOW and UI/UX Brief

Date

July 29, 2026

Core principle

No material conclusion without traceable evidence

Primary boundary

Observation and association must not be presented as causation

V0 objective

Reproducible initiative assessments from limited, trustworthy data



1. Purpose

Defines how the product represents metrics, baselines, observations, evidence, assumptions, attribution, data quality, recommendations and validated outcomes. This is the contract connecting product behavior, analytics, AI, backend models and user-facing trust.

The Evidence Engine is not an LLM confidence layer. It preserves what was measured, where it came from, how it was calculated, what can responsibly be concluded, and what remains uncertain.

2. Core Measurement Model

INVESTMENT → INTERVENTION → PROCESS CHANGE → METRIC CHANGE → BUSINESS OUTCOME → EVIDENCE → RECOMMENDATION → HUMAN DECISION → ACTION → POST-DECISION OUTCOME → LEARNING

Each relationship may have supporting evidence, conflicting evidence, assumptions and limitations. Coexistence inside one initiative does not establish causality.

3. Canonical Concepts

Concept

Definition

Metric Definition

Reusable definition: meaning, unit, formula/method, direction and scope.

Observation

Measured value for a metric over a specific period, scope and source.

Baseline

Approved reference observation/aggregate used for comparison.

Target

Desired value, change, range or threshold.

Guardrail

Metric protecting against unacceptable side effects.

Claim

Statement to evaluate, such as 'the initiative reduced cost per case.'

Evidence

Traceable information supporting, conflicting with or contextualizing a claim.

Assumption

Condition used in analysis but not fully established.

Limitation

Known constraint reducing interpretation strength.

Confounder

Concurrent factor that could explain observed change.

Recommendation

Advisory next action based on current evidence.

Decision

Human-recorded action after review.

Outcome

Observed result after an initiative or decision.

Learning

Reusable expected-vs-actual conclusion with context and evidence.

4. Evidence Taxonomy

Level

Meaning

E0 — Unverified Input

User-entered/imported information not yet validated.

E1 — Source Fact

Direct source observation with provenance.

E2 — Derived Measure

Deterministic calculation from defined inputs.

E3 — Observed Change

Measured change across defined periods/populations.

E4 — Association

Relationship that does not establish causality.

E5 — Stronger Attribution

Explicit comparison/quasi-experimental evidence reducing alternative explanations.

E6 — Validated Business Outcome

Outcome accepted under the organization's agreed validation methodology.

E6 does not mean scientific proof. Methodology remains visible. The E0–E6 taxonomy is initially an internal working model and may map to simpler user-facing language.

5. Claim Types

Descriptive — what is true in the data now.

Change — what changed relative to a defined comparison.

Association — variables/segments move together without a causal claim.

Attribution — initiative likely contributed under an explicit method.

Causal — only when methodology supports causal inference.

Financial value — operational outcome translated into financial value using explicit formulas/assumptions.

Decision — evidence supports a proposed next action under stated conditions.

6. Metric Definition Contract

Stable ID and version.

Human-readable name/business definition.

Unit and formatting.

Direction of improvement where meaningful.

Aggregation method.

Formula/method for derived metrics.

Numerator/denominator definitions.

Population/scope.

Time grain/comparison rules.

Expected sources.

Owner/validator.

Effective dates.

Approved metric definitions are versioned. Historical comparisons retain the definition used at decision time.

7. Observation Contract

Metric definition/version.

Value and unit.

Period/timestamp.

Population/scope.

Source reference.

Ingestion/calculation timestamp.

Observed, derived or reconstructed status.

Data-quality flags.

Optional validation state.

Decision-critical observations require both period and scope.

8. Baseline Rules

Reference a defined metric version.

Explicit period and population.

Establish before deployment where possible.

Preserve source/method.

Label reconstructed baselines.

Version approved baseline changes with rationale.

Use comparable baseline/current scope and method or disclose normalization/differences.

If a trustworthy baseline cannot be established, dependent claims are downgraded or blocked rather than filled with manufactured values.

9. Targets and Guardrails

Targets may be absolute values, relative changes, ranges, thresholds or directional objectives.

Guardrail threshold/direction.

Measurement period.

Severity.

Response owner where applicable.

Whether breach blocks SCALE or requires review.

Defined threshold evaluation should be deterministic.

10. Provenance and Lineage

RECOMMENDATION → CLAIM → EVIDENCE → OBSERVATION / CALCULATION → SOURCE

Source system/file.

Import/sync job.

Original mapping where relevant.

Transformation/calculation version.

Metric definition version.

Filters/time/scope.

Manual edits/overrides.

Validator metadata.

A displayed decision-critical number should be explainable without asking an LLM to reconstruct its calculation.

11. Data Quality

Dimension

Question

Completeness

Are required fields/periods present?

Freshness

Is data current enough for this decision?

Validity

Does data satisfy expected type/range/business rules?

Consistency

Does the concept reconcile where expected?

Coverage

Does data represent enough of the relevant scope?

Comparability

Can baseline/current values be compared meaningfully?

Provenance

Can the value be traced to source/method?

V0 should prefer transparent states such as HEALTHY, PARTIAL, STALE and BLOCKED over an unexplained composite score.

12. Evidence Strength

Evidence Strength is claim-specific and separate from Data Quality.

Claim type.

Quality/relevance of supporting evidence.

Conflicting evidence.

Baseline/comparison quality.

Coverage/duration.

Known confounders.

Attribution methodology.

Independent validation where applicable.

Working states: LIMITED, MODERATE, STRONG. Methodology must be validated before production claims of rigor.

13. Recommendation Confidence

Recommendation Confidence is not an LLM self-reported probability. It considers evidence strength, guardrails, data quality, target attainment, investment variance, uncertainty, decision policy and material risk.

V0 should use language such as Supported, Supported with conditions, Conflicting evidence or Insufficient evidence instead of a 73% confidence badge.

14. Attribution and Causality

Before/after improvement is observed change, not proof of causality.

Record concurrent changes/confounders.

Use comparison cohorts when appropriate and available.

Account for seasonality or mix/volume shifts where relevant.

Preserve method and assumptions.

Allow analyst/domain challenge or downgrade.

State explicitly when initiative effect cannot be separated from other factors.

15. Progressive Analysis Methods

Descriptive analysis.

Baseline comparison.

Segment/cohort comparison.

Trend analysis.

Association analysis.

Stronger attribution such as matched comparisons or difference-in-differences when justified.

Experimental evidence where a real controlled design exists.

V0 does not need every method. The taxonomy prevents weak analysis from being labeled as stronger evidence.

16. Financial Value

Separate observed financial facts from modeled value.

Preserve every input and formula.

Distinguish realized cash savings, avoided cost/hiring, released capacity and theoretical time value.

Do not automatically turn hours saved into cash savings.

Match cost and outcome period/scope.

Support ranges/sensitivity where assumptions are uncertain.

Authoritative ROI comes from deterministic calculations, not free-form LLM math.

For example, reduced handling time may create capacity without reducing payroll; the product must not call all released capacity realized savings.

17. Expected vs Actual

Expected metric/change.

Expected horizon.

Expected investment.

Expected guardrails.

Assumptions.

Actual outcome.

Variance.

Evidence strength.

Material variance explanation.

Subsequent decision/action.

Original expectations are version-preserved rather than overwritten by later forecasts.

18. Conflicting Evidence

Supporting evidence.

Conflicting evidence.

Relative relevance/quality.

Possible explanation for disagreement.

Additional analysis needed.

Reviewer interpretation.

Conflicting evidence may justify OPTIMIZE or CONTINUE MEASUREMENT even when a primary KPI improves.

19. Manual Inputs and Overrides

Manual inputs are allowed in V0.

Record author, timestamp and source/context.

Preserve original values after overrides.

Require rationale for decision-critical overrides.

AI suggestions require human confirmation before becoming approved records.

Spreadsheet imports are evidence inputs, not automatically validated truth.

20. AI Boundaries in Evidence

Allowed

Suggest metric mappings.

Extract candidate claims/assumptions from supplied material.

Summarize evidence.

Suggest investigation questions/confounders.

Explain deterministic calculations.

Retrieve unstructured evidence.

Draft grounded review narratives.

Prohibited

Invent observations/sources.

Create authoritative financial metrics outside deterministic calculation.

Upgrade evidence strength because the model sounds confident.

Turn association into causation.

Hide conflicting evidence.

Silently change baselines/metric definitions.

Use inaccessible model reasoning as the sole justification for a decision.

21. Evidence Object — Minimum Fields

Field

Purpose

evidence_id

Stable identifier.

organization_id

Tenant owner.

initiative_id

Initiative.

claim_id

Claim supported/conflicted.

evidence_level

Working E0–E6 taxonomy.

stance

SUPPORTS / CONFLICTS / CONTEXT.

source_type

System, file, manual, derived, validated review, etc.

source_reference

Traceable source pointer.

method

How evidence was produced.

scope

Population/entity boundaries.

period

Time boundaries.

assumptions

Explicit assumptions.

limitations

Known limitations.

data_quality_state

Relevant quality state.

created_by / created_at

Audit metadata.

validated_by / validated_at

Optional human validation.

22. Recommendation Evidence Package

Initiative/version.

Decision question.

Expected objective.

Current outcome state.

Primary KPI results.

Guardrail results.

Investment actual vs plan.

Supporting/conflicting evidence.

Data-quality state.

Evidence-strength assessment.

Assumptions/confounders.

Recommendation type and conditions.

Rule/model version where AI contributes.

Human review/decision outcome.

23. Core Scenario Example

AI Support Automation: baseline cost/case $8.40; target reduction 20%; CSAT guardrail ≥90%. After 90 days, cost/case is $6.90 and CSAT is 91.4%.

Vendor cost = source fact.

Resolved case count = source fact.

Cost/case = derived measure.

17.9% reduction = observed change.

CSAT above guardrail = observed guardrail result.

High containment in categories with earlier CSAT decline = association unless stronger analysis exists.

'AI caused the entire reduction' is not justified by before/after evidence alone.

SCALE can be supported with conditions if evidence, quality and guardrails meet decision policy.

Staffing, ticket mix, pricing, seasonality and other concurrent changes should be disclosed where material.

24. V0 Boundary

Versioned metric registry.

Manual/CSV observations.

Baseline/target records.

Primary KPI/guardrail evaluation.

Deterministic derived calculations.

Source provenance.

Basic quality rules.

Evidence records with SUPPORTS/CONFLICTS/CONTEXT.

Descriptive evidence-strength states.

Expected-vs-actual comparison.

Recommendation evidence package.

Human validation/decision record.

Advanced causal inference, universal evidence scoring and automated cross-customer benchmarks are not required for V0.

25. MVP Expansion

Direct connectors/source mapping.

Reusable value-model templates.

Richer quality/reconciliation tests.

Cohort/trend analysis.

Configurable decision policies.

Scenario/sensitivity analysis.

AI-assisted evidence mapping/investigation.

Stronger attribution modules where justified.

Portfolio-level expected-vs-actual learning.

26. Data Governance

Tenant ownership on all decision-relevant records.

Version-preserved history for approved definitions, baselines, recommendations and decisions.

Audit trail for manual changes/overrides.

Role-aware access to sensitive financial evidence.

Retention/deletion defined in SECURITY_PRIVACY.

Credentials/tokens stored outside analytical records.

No cross-customer learning from customer data without explicit authorization and policy.

27. Open Questions

Which evidence-strength methodology will customers accept as credible and understandable?

Which roles may validate metrics, baselines and financial outcomes?

Should customers configure decision policies or use product defaults?

Which guardrail breaches block SCALE?

How should realized savings, avoided cost and released capacity be represented across industries?

What minimum history is required for a baseline by use case?

Which statistical methods belong in-product versus analyst-assisted workflows?

Should E0–E6 be visible to users or mapped to simpler language?

How do metric-definition changes affect existing recommendations?

Which data-quality failures block a review entirely?

28. Acceptance Criteria

Every material metric traces to definition, period, scope and source/method.

Baseline and reconstructed baseline are distinguishable.

Observed change cannot silently become causal language.

Data Quality, Evidence Strength and Recommendation Confidence remain distinct.

Guardrail thresholds are evaluated deterministically.

Financial value distinguishes realized and modeled value.

AI cannot create authoritative evidence without source/method.

Conflicting evidence is representable.

Recommendations preserve their evidence package.

Expected outcomes are version-preserved.

V0 supports manual/CSV data with auditability.

Appendix A — Cross-Document Decisions

PRD v0.1 approved for validation.

APP_FLOW v0.1 approved with validation concerns.

UI_UX_BRIEF v0.1 makes evidence/uncertainty first-class UI concepts.

Clerk handles authentication; backend owns product authorization.

Internal organization UUID mapped to Clerk organization ID is preferred.

Structured retrieval is primary for metrics/evidence/decisions.

Semantic retrieval is supplemental.

SCALE WITH CONDITIONS = SCALE plus conditions metadata.

Appendix B — Concerns / Final Register Inputs

Reference

Concern

Current Treatment

Status

DATA_EVIDENCE_SPEC v0.1

E0–E6 may be too technical for end users.

Keep internal initially; test simpler UI language.

Validate

DATA_EVIDENCE_SPEC v0.1

Evidence scoring could become pseudo-scientific.

Use descriptive states and explicit factors.

Validate methodology

DATA_EVIDENCE_SPEC v0.1

ROI can mislead when time saved is not realized cash.

Separate realized savings, avoided cost, capacity and modeled value.

Carry forward

DATA_EVIDENCE_SPEC v0.1

Attribution varies heavily by initiative type.

Progressive methods; no universal causal promise.

Carry forward

APP_FLOW v0.1

Approval may happen outside product.

Support recording external decisions if validation confirms need.

Open

APP_FLOW v0.1

Visible lifecycle states may be too numerous.

Keep evidence/data health separate; simplify visible stages later.

Open

UI_UX_BRIEF v0.1

No universal confidence score.

Formalized three separate trust concepts.

Direction resolved

Architecture

Clerk replaces Supabase Auth.

Evidence uses internal organization_id; auth mapping stays outside evidence model.

Carry to schema/security