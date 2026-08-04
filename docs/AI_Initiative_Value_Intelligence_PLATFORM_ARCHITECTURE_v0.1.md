# AI Initiative Value Intelligence

## Platform Architecture

**Version:** v0.1\
**Status:** Draft\
**Owner:** Architecture Team\
**Last Updated:** August 2026

# Purpose

This document defines how the Value Intelligence platform evolves into a
multi-workspace ecosystem while keeping Business and Personal products
operationally independent.

------------------------------------------------------------------------

# Platform Vision

Value Intelligence is one platform with multiple workspaces.

    Value Intelligence
            |
     Authentication
            |
     Workspace Selector
       |              |
    Business      Personal

------------------------------------------------------------------------

# Shared Components

The following services are shared:

-   Authentication
-   User Profile
-   Notification Engine
-   Design System
-   AI Infrastructure
-   Audit Logging
-   Settings Framework

------------------------------------------------------------------------

# Business Workspace

Purpose:

Measure business initiative value.

Primary Modules:

-   Dashboard
-   Initiatives
-   Portfolio
-   Financials
-   Measurement Plans
-   Evidence
-   Reviews
-   Administration

Business data is isolated from personal data.

------------------------------------------------------------------------

# Personal Workspace

Purpose:

Help individuals understand recurring spending and personal financial
value.

Primary Modules:

-   Dashboard
-   Subscriptions
-   Bills
-   Memberships
-   Investments
-   Spending
-   AI Advisor
-   Settings

Personal data is isolated from organizational data.

------------------------------------------------------------------------

# Data Isolation

Business Workspace

-   Organization scoped
-   RBAC enabled
-   Multi-tenant

Personal Workspace

-   User scoped
-   Single-owner model
-   No organizational sharing by default

------------------------------------------------------------------------

# AI Layer

Shared AI platform provides:

-   Recommendation engine
-   Summaries
-   Forecasts
-   Insight generation
-   Conversational assistant

Business and Personal prompts remain independent.

------------------------------------------------------------------------

# Integration Layer

Business

-   AWS
-   Azure
-   GCP
-   Jira
-   GitHub
-   Salesforce

Personal

-   Gmail
-   Banks
-   Stripe
-   Razorpay
-   OTT
-   AI subscriptions

# Clerk Tenancy & Workspace Selection Mapping

The Workspace Selector UI leverages Clerk’s User and Organization context to segregate workspaces:

* **Personal Workspace Routing:** Toggling to the Personal Workspace routes the user to a context with `orgId = null` (no active organization selected). The user operates under their Clerk User Account session, mapping to user-scoped data.
* **Business Workspace Routing:** Toggling to a Business Workspace transitions Clerk’s active context to a selected Clerk Organization ID (`orgId = clerk_org_uuid`). Backend authorization verifies that the user holds a valid membership mapping to the corresponding internal organization database UUID.

------------------------------------------------------------------------

# Future Expansion

Future workspaces may include:

-   Education
-   Health
-   Family
-   Investments
-   Enterprise Portfolio

The architecture is designed so new workspaces can be added without
impacting existing domains.

------------------------------------------------------------------------

# Guiding Principle

One platform.

Multiple independent workspaces.

Shared infrastructure.

Independent business domains.

# End of Document
