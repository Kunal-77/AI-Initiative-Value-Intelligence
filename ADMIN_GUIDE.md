# Admin Guide — Enterprise Administration & Security

## 1. Role-Based Access Control (RBAC)
The platform features 10 system roles (`SUPER_ADMIN`, `ORG_ADMIN`, `EXECUTIVE`, `PORTFOLIO_MANAGER`, `FINANCE_MANAGER`, `AI_ANALYST`, `DEPARTMENT_MANAGER`, `PROJECT_MANAGER`, `AUDITOR`, `VIEWER`).

To manage user roles:
1. Navigate to **System Administration** -> **Enterprise Administration** (`/business/admin`).
2. Search for the user in the **Enterprise User Directory**.
3. Toggle their role or user status (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`).

---

## 2. Organization Configuration & Branding
- Set legal corporate entity name, timezone, primary currency (`USD ($)`, `EUR (€)`), and fiscal year start date in **Organization Settings**.

---

## 3. Security Posture & SSO
- **MFA Enforcement**: Mandatory TOTP authentication for administrators.
- **SAML 2.0 / SSO**: Integration hooks for Azure AD and Okta.
- **Session Timeout**: 30-minute idle token expiration policy.
