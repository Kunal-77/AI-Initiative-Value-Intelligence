# AI Initiative Value Intelligence

## Personal Workspace Schema Specification v0.1

**Status:** Draft / Technical Specification\
**Owner:** Database & Architecture Engineering\
**Last Updated:** August 2026

---

# 1. Executive Summary

This document defines the logical PostgreSQL relational database schema for the Personal Workspace within the Value Intelligence platform. 

The Personal Workspace operates as a user-centric domain isolated from the organization-centric Business Workspace. The schema is designed to track recurring expenses, memberships, utilities, cloud services, and AI subscriptions, overlaying these financial outputs with user-defined value metrics, usage patterns, and AI-driven spending optimization models.

---

# 2. Design Principles

* **Strict Tenancy Isolation:** All personal records must resolve to a single `user_id` context. There are no shared organizations or group-based RBAC in the Personal Workspace by default.
* **Traceability and Provenance:** Ingested financial data must point to its source, whether imported manually, scraped from email receipts, or pulled from bank transactions.
* **Auditability and Audit Logging:** Financial ledgers are append-only. Cancellations, modifications, and deletions must maintain state history to support continuous cash-flow prediction.
* **No Business Pollution:** Personal tables must remain separated from the Business schema. Business initiatives, organizational claims, and corporate budgets must not intersect with Personal workspace models.

---

# 3. Entity Relationship Overview

```
  +--------------+          +-----------------------+          +-------------------+
  |    users     | <------+ |    payment_methods    | <------+ |   subscriptions   |
  +--------------+          +-----------------------+          +-------------------+
         |                             |                                 |
         | (1:N)                       | (1:N)                           | (1:N)
         v                             v                                 v
  +--------------+          +-----------------------+          +-------------------+
  | savings_goals|          |    recurring_bills    |          |   usage_records   |
  +--------------+          +-----------------------+          +-------------------+
```

---

# 4. Core Entities Specification

## 4.1 users (Personal Profile Context)
* **Purpose:** Represents the foundational profile of an authenticated individual in the Personal Workspace. Mapped directly to Clerk Identity.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Canonical user identifier. |
  | `clerk_user_id` | VARCHAR(255) | No | Unique mapping token to Clerk Authentication. |
  | `email_address` | VARCHAR(255) | No | Primary user email address used for receipts and alerts. |
  | `currency_code` | CHAR(3) | No | Default currency (e.g. `USD`, `EUR`, `INR`). Defaults to `USD`. |
  | `created_at` | TIMESTAMPTZ | No | Timestamp when the profile was generated. |
  | `updated_at` | TIMESTAMPTZ | No | Timestamp of the last profile modification. |
* **Relationships:** 
  * Has many `subscriptions` (1:N)
  * Has many `payment_methods` (1:N)
  * Has many `savings_goals` (1:N)
* **Indexes:**
  * `uq_users_clerk_id` UNIQUE (`clerk_user_id`)
* **Validation Rules:**
  * `email_address` must follow strict RFC 5322 format.
  * `currency_code` must be a valid ISO 4217 standard value.
* **Lifecycle:** `REGISTERED` -> `ACTIVE` -> `DEACTIVATED` -> `ANONYMIZED`.
* **Future Expansion Notes:** Support multiple associated email addresses (e.g., matching secondary emails for receipt scraping).

---

## 4.2 subscriptions
* **Purpose:** Represents a recurring subscription service (SaaS, AI tool, streaming service, newsletter).
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Unique subscription identifier. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `category_id` | UUID (FK) | No | Reference to `subscription_categories.id`. |
  | `name` | VARCHAR(255) | No | Name of the service (e.g., Netflix, Spotify). |
  | `cost_amount` | NUMERIC(12, 4) | No | Cost per billing cycle. |
  | `currency_code` | CHAR(3) | No | ISO 4217 currency code. |
  | `billing_cycle` | VARCHAR(50) | No | Frequency: `MONTHLY`, `ANNUAL`, `WEEKLY`, `CUSTOM`. |
  | `status` | VARCHAR(50) | No | `ACTIVE`, `PAUSED`, `CANCELLED`, `TRIAL`. |
  | `trial_ends_at` | TIMESTAMPTZ | Yes | Date when the trial expires, if status is `TRIAL`. |
  | `payment_method_id` | UUID (FK) | Yes | Reference to `payment_methods.id`. |
  | `created_at` | TIMESTAMPTZ | No | Date record created. |
  | `updated_at` | TIMESTAMPTZ | No | Date record updated. |
* **Relationships:**
  * Belongs to `users` (N:1)
  * Belongs to `subscription_categories` (N:1)
  * Belongs to `payment_methods` (N:1)
  * Has many `usage_records` (1:N)
* **Indexes:**
  * `idx_subscriptions_user_status` (`user_id`, `status`)
* **Validation Rules:**
  * `cost_amount` must be greater than or equal to zero.
  * `trial_ends_at` must be in the future if set during creation.
* **Lifecycle:** `TRIAL` -> `ACTIVE` -> `PAUSED` -> `CANCELLED`.
* **Future Expansion Notes:** Support group/shared subscription bill splitting models.

---

## 4.3 subscription_categories
* **Purpose:** Lookup table for categorizing subscriptions (e.g., Entertainment, Productivity, AI Tools, Cloud Services).
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Unique category identifier. |
  | `name` | VARCHAR(100) | No | Name (e.g., `ENTERTAINMENT`, `PRODUCTIVITY`, `AI_TOOL`). |
  | `description` | TEXT | Yes | Purpose of the category. |
* **Relationships:**
  * Has many `subscriptions` (1:N)
* **Indexes:**
  * `uq_categories_name` UNIQUE (`name`)
* **Validation Rules:**
  * `name` must be uppercase alphanumeric with no spaces (snake_case).
* **Lifecycle:** Static lookup data, populated via database seed.
* **Future Expansion Notes:** Custom user-defined sub-categories.

---

## 4.4 memberships
* **Purpose:** Tracks personal organizations, gyms, clubs, or professional association memberships.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Unique membership identifier. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `name` | VARCHAR(255) | No | Name of the club or association. |
  | `dues_amount` | NUMERIC(12, 4) | No | Dues value. |
  | `cycle` | VARCHAR(50) | No | `MONTHLY`, `ANNUAL`, `SEMESTER`. |
  | `next_due_date` | TIMESTAMPTZ | No | Next payment collection deadline. |
  | `created_at` | TIMESTAMPTZ | No | Timestamp of creation. |
* **Relationships:**
  * Belongs to `users` (N:1)
* **Indexes:**
  * `idx_memberships_due` (`user_id`, `next_due_date`)
* **Validation Rules:**
  * `dues_amount` must be >= 0.0000.
* **Lifecycle:** `ACTIVE` -> `LAPSED` -> `TERMINATED`.

---

## 4.5 recurring_bills
* **Purpose:** Records utility bills, rent, mobile bills, internet, insurance premiums, and mortgage payments.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Unique bill identifier. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `name` | VARCHAR(255) | No | E.g., Electric Bill, Rent, Car Insurance. |
  | `estimated_amount` | NUMERIC(12, 4) | No | Anticipated amount. |
  | `due_day_of_month` | INT | No | Day of month when payment is collected (1-31). |
  | `payment_method_id` | UUID (FK) | Yes | Reference to `payment_methods.id`. |
* **Relationships:**
  * Belongs to `users` (N:1)
  * Belongs to `payment_methods` (N:1)
* **Indexes:**
  * `idx_bills_due` (`user_id`, `due_day_of_month`)
* **Validation Rules:**
  * `due_day_of_month` must be between 1 and 31.

---

## 4.6 cloud_subscriptions (Sub-type table)
* **Purpose:** Specialized extension mapping developer and personal sandbox accounts (e.g. AWS Free Tier extensions, GCP credits, Heroku dynos).
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Reference to `subscriptions.id` (FK PK). |
  | `provider` | VARCHAR(50) | No | `AWS`, `GCP`, `AZURE`, `HEROKU`, `SUPABASE`. |
  | `project_identifier` | VARCHAR(255) | Yes | Account ID or Project ID. |
  | `spend_alert_threshold` | NUMERIC(12, 4) | Yes | Maximum limit allowed before alerts. |
* **Relationships:**
  * Inheritance mapping to `subscriptions` (1:1)
* **Indexes:**
  * `idx_cloud_sub_provider` (`provider`)

---

## 4.7 ai_subscriptions (Sub-type table)
* **Purpose:** Extension mapping specific generative AI tools (e.g., ChatGPT Plus, Midjourney, Github Copilot, Claude Pro).
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Reference to `subscriptions.id` (FK PK). |
  | `model_provider` | VARCHAR(100) | No | OpenAI, Anthropic, Midjourney, etc. |
  | `allocated_tokens_limit` | BIGINT | Yes | Monthly token limit. |
  | `shared_seat` | BOOLEAN | No | Is this account shared with family/friends? |
* **Relationships:**
  * Inheritance mapping to `subscriptions` (1:1)

---

## 4.8 investments
* **Purpose:** Tracks personal wealth allocations, savings portfolios, and retirement accounts.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Unique identifier. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `institution_name` | VARCHAR(255) | No | Brokerage/bank (e.g. Vanguard, Fidelity). |
  | `asset_type` | VARCHAR(100) | No | Stocks, Mutual Funds, Crypto, cash. |
  | `balance_amount` | NUMERIC(16, 4) | No | Account balance. |
  | `as_of_date` | TIMESTAMPTZ | No | Last balance refresh. |
* **Relationships:**
  * Belongs to `users` (N:1)

---

## 4.9 savings_goals
* **Purpose:** Tracks user financial achievements (e.g., buying a home, emergency fund, travel fund).
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Goal ID. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `name` | VARCHAR(255) | No | Goal description (e.g., Emergency Fund). |
  | `target_amount` | NUMERIC(12, 4) | No | Target value. |
  | `current_amount` | NUMERIC(12, 4) | No | Saved value. |
  | `target_date` | TIMESTAMPTZ | Yes | Intended date. |
* **Relationships:**
  * Belongs to `users` (N:1)

---

## 4.10 payment_methods
* **Purpose:** Vault maps payment instruments (Credit cards, bank accounts, PayPal) used to pay for subscriptions and bills.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Payment method ID. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `type` | VARCHAR(50) | No | `CREDIT_CARD`, `BANK_ACCOUNT`, `PAYPAL`. |
  | `provider_token` | VARCHAR(255) | Yes | Stripped representation mapping token (Stripe Token). |
  | `card_brand` | VARCHAR(50) | Yes | Visa, Mastercard, Amex. |
  | `last_four` | CHAR(4) | Yes | Last four digits for UI displaying. |
  | `expires_at` | DATE | Yes | Expiration date of the card. |
* **Relationships:**
  * Belongs to `users` (N:1)
  * Has many `subscriptions` (1:N)
  * Has many `recurring_bills` (1:N)
* **Indexes:**
  * `idx_payment_expiry` (`expires_at`)

---

## 4.11 renewal_schedules
* **Purpose:** Concrete calendar projections mapping subscription payment frequencies to upcoming dates.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Schedule ID. |
  | `subscription_id` | UUID (FK) | No | Reference to `subscriptions.id`. |
  | `upcoming_date` | DATE | No | Expected renewal day. |
  | `projected_amount` | NUMERIC(12, 4) | No | Charge value. |
  | `notified` | BOOLEAN | No | True if notification has already fired. |
* **Relationships:**
  * Belongs to `subscriptions` (N:1)
* **Indexes:**
  * `idx_renewal_date_notified` (`upcoming_date`, `notified`)

---

## 4.12 reminders
* **Purpose:** User-configured alert parameters (e.g. notify me 3 days before Netflix renews).
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Reminder ID. |
  | `subscription_id` | UUID (FK) | Yes | Nullable. Reference to `subscriptions.id`. |
  | `bill_id` | UUID (FK) | Yes | Nullable. Reference to `recurring_bills.id`. |
  | `lead_days` | INT | No | Days before renewal to trigger notification. |
  | `active` | BOOLEAN | No | Enabled state. |
* **Relationships:**
  * Belongs to `subscriptions` (N:1)
  * Belongs to `recurring_bills` (N:1)

---

## 4.13 notifications
* **Purpose:** System-level record of sent alerts (push, email, slack messages) for audit.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Notification ID. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `title` | VARCHAR(255) | No | Summary header. |
  | `message` | TEXT | No | Alert body. |
  | `channel` | VARCHAR(50) | No | `EMAIL`, `PUSH`, `SLACK`. |
  | `sent_at` | TIMESTAMPTZ | No | Sent timestamp. |
* **Relationships:**
  * Belongs to `users` (N:1)

---

## 4.14 ai_insights
* **Purpose:** Caches recommendations generated by the Personal AI model (e.g. duplicate SaaS alerts, cheaper alternatives).
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Insight ID. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `type` | VARCHAR(100) | No | `DUPLICATE_ALERT`, `UNDERUTILIZED`, `PRICE_INCREASE`. |
  | `recommendation` | TEXT | No | Action proposal. |
  | `status` | VARCHAR(50) | No | `ACTIVE`, `DISMISSED`, `APPLIED`. |
  | `created_at` | TIMESTAMPTZ | No | Insight timestamp. |
* **Relationships:**
  * Belongs to `users` (N:1)

---

## 4.15 usage_records
* **Purpose:** Tracks actual user usage of a subscription (e.g., number of logins, gigabytes of transfer, streaming hours) to calculate value scores.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Record ID. |
  | `subscription_id` | UUID (FK) | No | Reference to `subscriptions.id`. |
  | `usage_metric` | VARCHAR(100) | No | E.g. `LOGINS`, `API_CALLS`, `HOURS_STREAMED`. |
  | `value_measure` | NUMERIC(12, 4) | No | Value consumed. |
  | `recorded_date` | DATE | No | Date of usage. |
* **Relationships:**
  * Belongs to `subscriptions` (N:1)
* **Indexes:**
  * `idx_usage_sub_date` (`subscription_id`, `recorded_date`)

---

## 4.16 receipts
* **Purpose:** Represents a single billing transaction record. Keeps billing PDFs and metadata.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Receipt ID. |
  | `subscription_id` | UUID (FK) | Yes | Nullable. Reference to `subscriptions.id`. |
  | `bill_id` | UUID (FK) | Yes | Nullable. Reference to `recurring_bills.id`. |
  | `billing_date` | DATE | No | Transaction date. |
  | `amount_paid` | NUMERIC(12, 4) | No | Charge. |
  | `pdf_storage_url` | VARCHAR(512) | Yes | S3 storage link to file. |
* **Relationships:**
  * Belongs to `subscriptions` (N:1)
  * Belongs to `recurring_bills` (N:1)

---

## 4.17 email_imports
* **Purpose:** Audit ledger documenting receipts parsed from the user's Gmail/Outlook boxes.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Import ID. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `message_id` | VARCHAR(255) | No | Unique message ID in email provider. |
  | `received_at` | TIMESTAMPTZ | No | Email received timestamp. |
  | `parsed_amount` | NUMERIC(12, 4) | Yes | Extracted amount. |
  | `success` | BOOLEAN | No | True if parsing succeeded. |
* **Relationships:**
  * Belongs to `users` (N:1)
* **Indexes:**
  * `uq_email_message` UNIQUE (`message_id`)

---

## 4.18 manual_entries
* **Purpose:** Audit record documenting manual user edits and creations for fallback validation.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Entry ID. |
  | `target_entity_type` | VARCHAR(100) | No | `subscription`, `bill`, `payment_method`. |
  | `target_entity_id` | UUID | No | Target PK. |
  | `edited_fields` | JSONB | No | Delta updates. |
  | `edited_at` | TIMESTAMPTZ | No | Edit timestamp. |

---

## 4.19 future_bank_transactions (Future expansion placeholder)
* **Purpose:** Captures raw transactional streams from bank providers to reconcile with subscriptions.
* **Attributes:**
  | Field | Type | Nullable | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | UUID (PK) | No | Transaction ID. |
  | `user_id` | UUID (FK) | No | Reference to `users.id`. |
  | `provider_transaction_id` | VARCHAR(255) | No | Transaction ID from Plaid. |
  | `merchant_name` | VARCHAR(255) | No | E.g. `Netflix.com`. |
  | `amount` | NUMERIC(12, 4) | No | Transaction value. |
  | `transaction_date` | DATE | No | Date of charge. |
  | `matched_subscription_id` | UUID (FK) | Yes | Reference to `subscriptions.id` once matched. |
* **Relationships:**
  * Belongs to `users` (N:1)
  * Belongs to `subscriptions` (N:1)
* **Indexes:**
  * `idx_bank_trans_date` (`transaction_date`)
  * `uq_provider_trans` UNIQUE (`provider_transaction_id`)
