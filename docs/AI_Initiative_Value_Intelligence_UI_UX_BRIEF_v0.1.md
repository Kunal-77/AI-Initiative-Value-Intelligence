AI INITIATIVE VALUE INTELLIGENCE

UI / UX BRIEF v0.1

Modern, high-trust, decision-intelligence product design specification



Status

Working specification — derived from approved PRD v0.1 and APP_FLOW v0.1

Date

July 29, 2026

Product character

Calm, precise, evidence-led, executive-grade

Primary design objective

Make complex investment evidence understandable without hiding uncertainty

Anti-pattern

Generic AI dashboard / chatbot-first / decorative analytics



1. Design Intent

The product should feel like a serious decision environment for finance, technology and operating leaders—not like an AI demo. The interface must earn trust through clarity, traceability, restraint and consistent treatment of evidence.

Modern does not mean futuristic decoration. Modern means strong hierarchy, responsive interaction, useful density, fast navigation, contextual assistance, clear system state and minimal friction.

2. Product Personality

Calm — avoids visual noise, alarm fatigue and unnecessary motion.

Precise — labels, values, units, periods and evidence states are explicit.

Credible — visual treatment fits decisions involving meaningful budgets and operational consequences.

Investigative — users can move from conclusion to evidence without losing context.

Human-controlled — AI assists analysis but does not visually impersonate authority.

Confident about facts, careful about uncertainty — the interface distinguishes what is known from what is inferred.

3. Design Principles

Principle

Meaning

Decision before dashboard

Start with what needs attention or a decision, not a collection of generic KPI cards.

Progressive disclosure

Executives see the conclusion and material context first; analysts can drill into formulas, lineage and source data.

Evidence is navigable

Every material claim should have an obvious route to supporting and conflicting evidence.

Guardrails are first-class

A positive primary metric must not visually overpower a failed quality/risk guardrail.

Uncertainty is designed

Missing data, weak attribution and partial evidence receive intentional states rather than footnotes.

AI stays contextual

AI appears where interpretation or investigation is useful; it should not dominate global navigation.

No fake precision

Ranges, unknown values and evidence levels are preferable to invented decimals or confidence percentages.

Actions have consequences

Approve, stop, scale and modify actions should show what changes and require rationale when appropriate.

Professional density

Use space deliberately. Avoid both consumer-app emptiness and legacy-enterprise clutter.

Consistency over novelty

Interaction patterns should be learnable and repeatable across initiative, evidence and decision views.

4. Visual Direction

4.1 Overall Character

Aim for an executive-grade analytical workspace: restrained surfaces, clear typography, high information quality and subtle hierarchy. Avoid the visual language of crypto dashboards, consumer AI chat apps and template-heavy admin panels.

4.2 Color Strategy

Use a restrained neutral foundation with one primary brand accent.

Reserve semantic colors for meaning: positive, warning, critical, informational and neutral states.

Do not make 'AI' a special neon/gradient color category.

Never communicate evidence strength or risk by color alone.

Guardrail breaches should be visible but not theatrically alarming.

4.3 Typography

Use a modern, highly legible sans-serif system suitable for dense tables and executive summaries.

Use tabular numerals where financial/metric alignment benefits from them.

Maintain clear hierarchy between page title, decision headline, section label, body copy and metadata.

Avoid oversized marketing-style headings inside the application.

4.4 Shape and Surface

Moderate corner radius; avoid excessive pill-shaped containers.

Use borders, spacing and tonal surfaces before heavy shadows.

Cards should represent meaningful objects or decisions—not become the default container for everything.

Tables and structured lists are acceptable when they communicate professional data more clearly than cards.

4.5 Motion

Motion should explain state changes, navigation or newly revealed detail.

Avoid ambient animation, pulsing AI elements and decorative dashboard motion.

Respect reduced-motion preferences.

5. Information Architecture

Primary navigation remains intentionally small: Home, Initiatives, Decisions, Data, Organization/Settings.

Evidence, metrics and investigations are generally reached in context from an initiative. This keeps the product organized around decisions rather than around technical data objects.

6. Home / Attention Experience

6.1 Purpose

Answer: What requires my attention, and why?

6.2 Recommended Hierarchy

Page context: organization, role-aware greeting/context only if useful.

Decision queue: items requiring the current user's action.

Material exceptions: guardrail breaches, evidence degradation, review blockers.

Upcoming reviews: initiatives approaching a planned decision point.

Recent meaningful changes: only changes that affect interpretation or action.

Compact portfolio context: optional and secondary.

6.3 Avoid

Four generic KPI cards across the top.

Large 'Ask AI anything' hero area.

Charts without a decision or question attached.

Activity feeds containing routine sync events.

Gamified scores for executive decisions.

7. Initiatives Experience

Initiatives should read as investment cases, not project-management tickets.

Show initiative name, objective, lifecycle state, owner, next review, primary outcome trajectory and material issue.

Support useful views such as Needs Attention, Awaiting Review, Active, Paused and Completed.

Do not expose technical sync states as initiative statuses.

Filtering should reflect real review needs: owner, business area, lifecycle, review date, evidence health and outcome status.

8. Create Initiative Experience

Use progressive steps rather than one intimidating enterprise form. Preserve context and allow draft saving.

What are we considering?

Why does it matter?

What are we investing?

What does success mean?

Can we measure it?

Review before submission.

AI assistance may help turn rough business language into structured candidate fields, but proposed content must remain visibly editable and attributable to user confirmation.

9. Investment Review Experience

This surface should feel closer to an investment memo than an analytics dashboard.

Decision headline and requested investment.

Business problem and expected outcome.

Baseline → target comparison.

Primary KPI and guardrails.

Measurement readiness.

Assumptions and material risks.

Evidence/data readiness.

Review history/version.

Actions: Approve, Request Changes, Reject, or record external approval if later validated.

The visual hierarchy must make the decision and its conditions clearer than the underlying implementation details.

10. Active Initiative Experience

The page should answer: Is this initiative moving toward the outcome we approved?

10.1 Top Summary

Outcome statement.

Lifecycle state.

Next review date.

Investment actual vs plan.

Primary KPI trajectory.

Guardrail health.

Evidence/data health.

10.2 Narrative Change

Instead of showing only charts, include a concise 'What changed since last review?' summary grounded in calculated data. Users can inspect the evidence behind each material statement.

10.3 Timeline

A lightweight initiative timeline may connect approval, deployment, interventions, reviews and decisions. It should not become a generic activity feed.

11. Metric and Guardrail Design

Always show metric name, current value, baseline, target/threshold, direction, period and unit.

Show whether a metric is observed, derived or reconstructed.

Allow drill-down into formula, scope and source.

Guardrail status should remain visible beside primary outcomes.

Charts should mark relevant events such as deployment or intervention where useful.

Do not imply statistical significance through visual styling unless it has actually been calculated.

12. Evidence Design

Evidence is one of the product's signature interaction systems.

12.1 Evidence Object

Claim.

Evidence type/level.

Supporting observations.

Conflicting observations.

Source and freshness.

Methodology.

Scope/time period.

Assumptions.

Known limitations.

Reviewer/validation state where applicable.

12.2 Evidence Strength

Use descriptive levels and explanation rather than a mysterious 0–100 AI score. Data Quality, Evidence Strength and Recommendation Confidence must remain distinct concepts.

12.3 Evidence Drawer / Drill-In

A user should be able to open evidence from a recommendation without losing the decision context. A side panel or layered detail view may work better than forcing a full navigation jump; final interaction will be tested in design prototypes.

13. AI Interaction Design

13.1 Where AI Appears

Business-case structuring.

Metric/guardrail suggestions.

Investigation assistance.

Evidence summarization.

Review preparation.

Executive Q&A within initiative context.

Scenario explanation.

13.2 How AI Should Look

Use the same product visual language as other assistance; no glowing orb is required.

Label AI-generated interpretation when material.

Provide evidence references directly beside consequential claims.

Allow users to inspect what data/context informed an answer.

Make suggested edits reviewable before they become product records.

13.3 AI Anti-Patterns

Chatbot as the homepage.

Anthropomorphic AI executive/CFO persona.

AI-generated ROI presented as fact.

AI confidence percentages without methodology.

Hidden autonomous actions.

Verbose conversational responses where a structured comparison is clearer.

14. Decision Review Design

Decision Review is a signature surface and should be visually distinct without becoming theatrical.

What was expected?

What happened?

What evidence supports that conclusion?

What worked against it?

What is uncertain?

What does the system recommend?

Under what conditions?

What does the human decide?

The system recommendation and human decision must never be visually merged into one state.

15. Recommendation Presentation

SCALE, KEEP, OPTIMIZE, STOP and CONTINUE MEASUREMENT are the core recommendation types.

Conditions are attached metadata, not separate recommendation categories.

Show rationale in concise structured form before long narrative.

Show guardrails and conflicting evidence near the recommendation.

Expose evidence strength and data quality without collapsing them into one score.

A recommendation can explicitly say that evidence is insufficient.

16. Data / Integration UX

The Data area exists to answer whether decision-critical information is available and trustworthy—not to showcase connector logos.

Source name and purpose.

Which initiatives/metrics depend on it.

Freshness.

Last successful update.

Data-quality issues.

Required remediation.

Read-only scope/permission context where useful.

CSV/manual import must feel like a legitimate V0 workflow rather than a second-class workaround.

17. Empty, Partial and Failure States

No initiatives yet — guide user toward evaluating or importing an initiative, not toward connecting every integration.

No baseline — explain why it matters and offer establish/reconstruct paths.

Partial evidence — show what is usable and what remains missing.

Stale source — mark dependent conclusions appropriately.

Failed integration — explain affected decisions and remediation.

No recommendation — explain whether the reason is timing, missing data or insufficient evidence.

No portfolio history — avoid meaningless charts until enough data exists.

18. Responsive Design

Desktop is likely the primary analysis environment, but review and decision experiences should remain useful on tablet and mobile.

Do not merely stack desktop cards vertically.

Preserve decision headline, outcome, guardrails and required action first.

Move detailed evidence tables behind drill-in patterns on smaller screens.

Avoid horizontal-scroll dependence for core executive decisions.

Mobile may prioritize review/acknowledgment while deep analysis remains desktop-oriented.

19. Accessibility

WCAG-aligned contrast targets.

Keyboard-accessible navigation and actions.

Visible focus states.

Semantic headings and form labels.

Color-independent status communication.

Accessible charts with textual summaries/data alternatives.

Reduced-motion support.

Error messages that identify both the problem and corrective action.

20. Trust and Safety UX

Show source/freshness for decision-critical evidence.

Require confirmation for material decisions.

Record rationale where governance requires it.

Warn when a recommendation depends on stale, reconstructed or incomplete data.

Make permission boundaries understandable.

Avoid dark patterns that push users toward SCALE or any other preferred decision.

Preserve audit history rather than silently rewriting past decisions.

21. Design System Component Families

The future design system should be built around product concepts, not only generic UI primitives.

Decision Card.

Initiative Header.

Outcome Summary.

Baseline-to-Target Indicator.

Metric / Guardrail Row.

Evidence Strength Badge with explanation.

Data Health Indicator.

Evidence Drawer.

Assumption / Limitation Callout.

Recommendation Panel.

Human Decision Panel.

Review Timeline.

Source / Freshness Metadata.

Intervention Event.

Insufficient Evidence State.

These product-specific components can sit on top of a standard component library later; they should not be reduced to renamed generic cards.

22. Design Rationale Examples

Decision

Rationale

Product Connection

No chatbot-first Home

Executives primarily need decisions and exceptions; conversation is useful during investigation.

APP_FLOW Home + Evidence Investigation

Guardrails beside primary KPI

A cost improvement can be harmful if quality falls.

Core Scenario CSAT breach

Evidence drill-in from recommendation

Users must understand why a consequential recommendation exists.

PRD evidence-first principle

CSV treated seriously

V0 needs fast time-to-value and may not justify connector development.

PRD V0 scope

Human decision separate from AI recommendation

The product advises; accountable people decide.

PRD AI boundary

Limited top-level navigation

The product is about an investment lifecycle, not exposing internal data objects.

APP_FLOW navigation model

No universal confidence score

Data quality, evidence strength and recommendation confidence are different.

PRD evidence requirements

23. Anti-Template Checklist

Before approving a major screen, ask:

Does this screen exist because the workflow needs it?

Can we explain why each primary element is present?

Would the screen still make sense if all 'AI' labels were removed?

Are we using a chart because it answers a question, or because dashboards usually have charts?

Are cards representing real product objects, or merely decorating layout?

Does the information hierarchy match the persona's decision responsibility?

Are uncertainty and conflicting evidence visible?

Does the interaction preserve the investment lifecycle established in APP_FLOW?

Could this screen belong unchanged to a CRM, project manager or generic admin template? If yes, redesign the product-specific parts.

24. Initial Design Deliverables After This Brief

Low-fidelity information architecture and wireflows.

Home / Attention wireframe.

Create Initiative flow.

Investment Review.

Active Initiative.

Evidence Investigation.

Decision Review.

Data Health.

Responsive review-state concepts.

Design-system foundation and product-specific components.

Clickable prototype for Core Scenario #1.

Usability test script for buyer/user validation.

25. Open Design Questions

Should Executive Home be a frequent destination, or are notifications/deep links the primary entry for executives?

How much information should be visible before Evidence drill-in?

Should evidence open in a side panel, expandable layer or dedicated page for complex cases?

Which lifecycle states should users see versus internal/backend states?

How should external approvals be represented if investment approval happens in another system?

Which collaboration behaviors are required: comments, mentions, assignments or approval chains?

Should mobile support final decisions or only review/acknowledgment for higher-risk actions?

What brand identity and primary accent should the product use?

Which component foundation should be adopted after visual prototyping?

What density level do real CFO/CTO/analyst users prefer?

26. Acceptance Criteria for UI/UX Brief v0.1

Visual direction supports trust, analysis and executive decision-making.

The brief does not depend on a generic AI-chat interface.

Major interaction patterns trace back to PRD or APP_FLOW requirements.

Evidence, guardrails, uncertainty and human decisions are first-class design concepts.

Desktop and responsive behavior are considered.

Accessibility and failure states are included from the beginning.

The design system includes product-specific component families.

Open questions remain explicit where user validation is still required.

Appendix A — Current Decisions Affecting Design

PRD v0.1 approved for validation.

APP_FLOW v0.1 approved with validation concerns to track.

Clerk is the current authentication choice.

Backend controls product authorization/tenant permissions.

Internal organization UUID mapped to Clerk organization ID is preferred.

AI Support is a wedge hypothesis, not a permanent product boundary.

Structured retrieval is primary for metrics/evidence/decisions; semantic retrieval is supplemental.

Core recommendation types remain SCALE, KEEP, OPTIMIZE, STOP and CONTINUE MEASUREMENT.

Appendix B — Running Concerns / Revision Notes

Reference

Concern / Decision

Treatment Here

Final Register

APP_FLOW v0.1

V0 flow may be too complete.

Brief defines design direction without requiring every surface in V0.

Track

APP_FLOW v0.1

Approval may happen outside product.

External approval representation kept as open design question.

Track

APP_FLOW v0.1

Executive Home usage is unvalidated.

Home designed as attention surface; frequency remains an open question.

Track

APP_FLOW v0.1

Too many lifecycle states may confuse users.

Visible vs internal states explicitly left for validation.

Track

APP_FLOW v0.1

Collaboration scope is undefined.

Comments/mentions/approval chains remain open.

Track

APP_FLOW v0.1

SCALE WITH CONDITIONS should not become a new state.

Conditions are metadata attached to SCALE.

Resolved in design; update relevant docs during final pass

Architecture

Clerk replaces Supabase Auth.

Auth visual flow assumes Clerk; authorization remains product/backend concern.

Track for TRD/schema/security