# AI Initiative Value Intelligence

## Personal Workspace Implementation Plan v1.0

**Status:** Technical Design Proposal\
**Owner:** Chief Software Architect\
**Last Updated:** August 2026

---

# 1. Executive Summary

This document specifies the technical execution strategy for introducing the Personal Workspace into the Value Intelligence platform. 

The implementation path is designed to maximize code and infrastructure reuse of the existing V1 Business platform (authentication, styling systems, database connections, and AI gateways) while ensuring absolute operational isolation. Business code is kept intact with no structural changes, except for standardizing shared components.

---

# 2. Component Reuse Matrix

This matrix classifies the platform’s subsystems by their reuse potential to accelerate the development of the Personal Workspace:

| Subsystem | Classification | Current Implementation | Personal Workspace Reuse Strategy |
| :--- | :--- | :--- | :--- |
| **Authentication & Identity** | ✅ Shared | `ClerkTokenVerifier` extracts and verifies bearer JWT signatures. | Reuses verifier directly. If no `org_id` claim is present in JWT, the session is routed to the Personal Context. |
| **Workspace Routing** | 🟡 Needs Refactoring | Single root `/` path serves as business portfolio dashboard. | Refactor Next.js router: split routes into `/business` and `/personal`, with `/` serving as Workspace Selector. |
| **Organization Context** | 🟠 Business Only | Checks `active_organization_id` using role capabilities. | Bypassed. Personal API endpoints query strictly by Clerk `user_id`. |
| **Navigation & Sidebar** | 🟡 Needs Refactoring | Clerk `OrganizationSwitcher` and `UserButton` in main header. | Refactor UI layouts: extract reusable layout wrappers. Render workspace-specific links. |
| **Dashboard Framework** | 🟡 Needs Refactoring | Flex-grid layout card elements inline in `page.tsx`. | Extract standard grid, page headers, and panel blocks into a `/components/ui` shared folder. |
| **Notification Engine** | ✅ Shared | Design specification in place. | Shared Notification Service mapping to users/channels. |
| **Background Scheduler** | ✅ Shared | TRD proposed Celery + Redis queues. | Shared worker pool, executing tasks scoped to user/org parameters. |
| **AI Services & Gateway** | 🟡 Needs Refactoring | Model router mapping to OpenAI, Claude, and Gemini. | Share provider configuration and prompt sanitizers; isolate prompt templates. |
| **Theme & Tailwind CSS** | ✅ Shared | Style design tokens in `globals.css` and `tailwind.config`. | Reused directly to maintain a consistent premium look. |
| **API Client Middleware** | ✅ Shared | Frontend fetch helper attaching Clerk bearer JWT. | Reused directly with no modifications. |
| **Database Utilities** | ✅ Shared | SQLAlchemy engine and `get_db` session dependencies. | Reused directly, mapping to the new personal schema tables. |
| **Testing Framework** | ✅ Shared | Pytest configurations and Mock clerk payload fixtures. | Reused to write personal unit and integration tests. |

---

# 3. Dependency Map

```
                 Shared Infrastructure
                 - Clerk Token Verification
                 - Tailwind CSS Design System
                 - SQLAlchemy Engine & DB Session
                 - Notification dispatchers (Email/Slack)
                 - Model Routing Gateway
                     /              \
                    /                \
                   v                  v
        Business Workspace       Personal Workspace
        - Organization scope     - User profile scope
        - RBAC capabilities      - Single-owner permissions
        - Initiatives model      - Subscriptions model
        - Business metrics       - Bill tracking
        - Enterprise FinOps      - Personal bank APIs
```

---

# 4. Milestone Implementation Plan

## Milestone 1: Workspace Selector & Next.js Router Split
* **Objective:** Establish the layout routing boundaries separating Business and Personal pages.
* **Dependencies:** None.
* **Risk:** Routing conflicts and broken navigation links on legacy business pages.
* **Estimated Complexity:** Low (1 week).

## Milestone 2: Personal Authentication Flow & Identity Mapping
* **Objective:** Enable user login to Personal Workspace without requiring active organization memberships.
* **Dependencies:** Milestone 1.
* **Risk:** Token mapping might raise authorization errors if `active_organization_id` is null on shared pages.
* **Estimated Complexity:** Medium (1 week).

## Milestone 3: Personal Database Schema Migrations
* **Objective:** Generate and apply migrations for the personal subscription, bills, and payment method tables.
* **Dependencies:** Milestone 2.
* **Risk:** DB migrations locking production tables or creating foreign key conflicts.
* **Estimated Complexity:** Medium (1.5 weeks).

## Milestone 4: Subscription Management Engine & APIs
* **Objective:** Implement backend services and REST APIs to CRUD personal subscriptions, categories, and tracking limits.
* **Dependencies:** Milestone 3.
* **Risk:** Validation bugs in target value formats.
* **Estimated Complexity:** High (2 weeks).

## Milestone 5: Recurring Bills & Utility Utilities Ingestion
* **Objective:** Implement backend models and APIs for utilities, mobile, and rent bills, projecting due dates on the calendar.
* **Dependencies:** Milestone 4.
* **Risk:** Calculation discrepancies on leap years or monthly edge cases (e.g. 31st of month).
* **Estimated Complexity:** Medium (1.5 weeks).

## Milestone 6: Personal Dashboard & UI Widgets
* **Objective:** Build frontend layouts, subscription tables, spend metrics grids, and payment methods list.
* **Dependencies:** Milestone 5.
* **Risk:** UI alignment and responsiveness bugs on mobile.
* **Estimated Complexity:** Medium (2 weeks).

## Milestone 7: Notification Engine & Reminder Dispatcher
* **Objective:** Wire up cron jobs checking upcoming renewals, triggering email/slack reminders.
* **Dependencies:** Milestone 6.
* **Risk:** Background worker pool overloading or double-sending alerts.
* **Estimated Complexity:** High (2 weeks).

## Milestone 8: AI Advisor & Model Routing
* **Objective:** Hook up prompt orchestration to propose subscription optimizations and underutilization warnings.
* **Dependencies:** Milestone 7.
* **Risk:** High LLM latency, cost variance, or prompt hallucinations recommending incorrect actions.
* **Estimated Complexity:** High (2.5 weeks).

## Milestone 9: Personal Connectors Integration (Stripe, Gmail)
* **Objective:** Integrate Stripe webhook events and Gmail receipt scanning.
* **Dependencies:** Milestone 8.
* **Risk:** Google OAuth scopes audit requirement delays, receipt parsing failures due to template changes.
* **Estimated Complexity:** Critical / High (3 weeks).

## Milestone 10: Portfolio Analytics & Cash-Flow Forecasting
* **Objective:** Set up Polars + DuckDB pipeline to aggregate personal transactions and predict monthly/annual recurring spend curves.
* **Dependencies:** Milestone 9.
* **Risk:** Float rounding errors during large aggregations.
* **Estimated Complexity:** Medium (2 weeks).

---

# 5. Risk Register

| Risk Category | Risk Description | Mitigating Strategy |
| :--- | :--- | :--- |
| **Architectural** | Business endpoints accidentally allow personal users to access resources due to missing capability validation. | Enforce `Depends(require_capability("..."))` on *all* business routes. Personal routes rely on a separate `require_personal_owner` dependency. |
| **Database** | Database connections pool gets exhausted due to high-frequency personal background cron runs. | Implement separate database connection pools or read-replicas for personal background task processing. |
| **Security** | Third-party OAuth tokens (Gmail, Plaid) leak during multi-tenant breaches. | Encrypt credentials in the database using envelope encryption with workspace-unique KMS keys. |
| **UX** | Workspace switching causes page layout state loss or visible flicker. | Use Next.js persistent layouts and React Context state providers to cache transitions locally. |
| **AI** | Recommender engine makes incorrect subscription cancellation warnings. | Display clear metadata flags indicating that warnings are advisory and require human confirmation. |

---

# 6. Technical Debt Prioritization

Before implementing the Personal Workspace, the following business platform technical debt items should be addressed:

1. **Extract UI Component Primitives (Priority: High):** Inline JSX for cards, buttons, and tables must be extracted into generic components in a `/components/ui` library to prevent duplicate markup.
2. **Standardize Decimal Money (Priority: Medium):** Convert backend FastAPI request fields from float to Decimal validation to prevent formatting discrepancies.
3. **Establish Shared Worker Pools (Priority: Medium):** Configure the Redis and Celery worker foundations to support async task routing before queuing integrations.

---

# 7. Final Recommendations

* **Build Order:** Start by splitting next.js layouts (Milestone 1) and authenticating personal users (Milestone 2) before provisioning database tables.
* **Recommendation:** Proceed to Milestone 1. The core identity verifiers, database setups, and Tailwind CSS themes are fully ready to support the expansion.
