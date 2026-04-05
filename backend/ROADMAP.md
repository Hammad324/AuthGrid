# AuthGrid Evolution: Hardening and AaaS Roadmap

This document outlines the strategic path to evolve AuthGrid from a successful MVP into a production-ready **Authentication as a Service (AaaS)** platform.

---

## 🛡️ Phase 1: API Hardening (Security-First)

Before scaling, the core API must be resilient against common attack vectors.

### 1. Security Headers (`helmet`)
- **Action**: Integrate `helmet` middleware in `main.ts`.
- **Reason**: Protects against well-known web vulnerabilities like XSS, Clickjacking, and MIME-sniffing.
- **Config**: Ensure `Content-Security-Policy` (CSP) is optimized for an API-only service.

### 2. Global Rate Limiting (`@nestjs/throttler`)
- **Action**: Implement `@nestjs/throttler` across all sensitive endpoints (Login, Register, Password Reset).
- **Reason**: Mitigates brute-force attacks and DDoS.
- **Scaling**: Use a **Redis** store for distributed rate limiting in production.

### 3. Strict Input Validation & Sanitization
- **Action**: Refine `ValidationPipe` with `forbidNonWhitelisted: true`.
- **Reason**: Prevents "Mass Assignment" attacks where attackers inject un-declared fields into the DB.
- **Extra**: Use `dompurify` or similar for sanitizing any user-provided HTML/strings.

### 4. Audit Logging & Observability
- **Action**: Implement a structured logger (e.g., `pino` or `winston`).
- **Audit Points**:
    - Failed login attempts with IP address.
    - Password change events.
    - Tenant creation and deletion.
    - Token rotation failures.

---

## 🧩 Phase 2: Module-Level Deep Dive (The "Brains" of AaaS)

To provide a robust service, each module must be expanded with production-grade logic.

### 1. Auth Module (Core Authentication)
- **MFA (Multi-Factor Auth)**:
    - **Add**: `MfaService` to handle TOTP (Google Authenticator) and Email OTP.
    - **Endpoint**: `/auth/mfa/enable`, `/auth/mfa/verify`.
- **Session Management**:
    - **Add**: `SessionService` to track active logins per user across devices.
    - **Endpoint**: `/auth/sessions` (list), `/auth/sessions/:id` (revoke).
- **OAuth2 / OIDC Support**:
    - **Add**: Authorization Code flow helpers for client apps to redirect to AuthGrid.

### 2. Users Module (Profile & Identity)
- **Profile Management**:
    - **Add**: `ProfileService` to handle PII (Profile Pictures, Bio, Preferences).
    - **Endpoint**: `/users/profile` (PATCH).
- **Security Actions**:
    - **Add**: `PasswordService` to handle "Forgot Password" flows with expirable email links.
    - **Add**: Account deletion workflow (soft vs hard delete).
- **Activity Log**:
    - **Add**: `ActivityService` to store user-visible activity (e.g., "Logged in from London, UK").

### 3. Tenants Module (Organization Architecture)
- **Membership & RBAC**:
    - **Add**: `MembershipService` to handle invitations and role changes (OWNER, ADMIN, MEMBER).
    - **Role Checks**: Custom `@Roles()` decorator and `RolesGuard` for granular access.
- **Organization Settings**:
    - **Add**: `SettingsService` for tenant-level config (Custom Login Branding, SSO/SAML integration).

### 4. Apps Module (B2B Infrastructure)
- **Webhook Management**:
    - **Add**: `WebhookService` to allow developers to register URLs for events like `user.registered`.
    - **Security**: Sign payloads with an `X-AuthGrid-Signature` (HMAC).
- **Key Secrets & API Keys**:
    - **Add**: `SecretRotationService` to allow developers to rotate Client Secrets without downtime.
    - **Endpoint**: `/apps/:id/rotate-secret`.

---

## 🚀 Phase 3: Auth as a Service (AaaS) Core Features

### 1. Hosted Login Page (The "Fascinating" UI)
- **Concept**: A centralized, customizable login UI hosted by AuthGrid.
- **Features**:
    - Theme customization (colors, logo) per tenant.
    - Seamless redirection back to the client app with an authorization code.

### 2. Client Authentication (B2B)
- **Action**: Implement a `ClientAuthGuard` that validates `X-App-Id` and `X-App-Secret` headers.
- **Use Case**: Allows backend services to talk to AuthGrid directly to verify users or fetch metadata.

---

## 🧪 Phase 4: The Testing Suite (Automated Reliability)

### 1. Unit Testing (Services & Repositories)
- **Focus**: Pure logic (e.g., password hashing, token generation).
- **Framework**: `jest` with `@nestjs/testing`.
- **Coverage Goal**: 80%+ on critical business logic.

### 2. Integration Testing (API Endpoints + Prisma)
- **Focus**: Testing the full request-response cycle with a test database.
- **Tool**: `supertest` + dedicated test database (`.env.test`).

### 3. End-to-End (E2E) Testing
- **Focus**: Complete user journeys and multi-tenant isolation (User A cannot access Tenant B data).

---

## 🏗️ Phase 5: Deployment & DevOps

### 1. Containerization
- **Action**: Optimize `Dockerfile` for multi-stage builds.
- **Service Mesh**: Use **Docker Compose** or **Kubernetes** for scaling.

### 2. CI/CD Pipeline
- **Action**: GitHub Actions for automated linting, testing, and deployment.

### 3. Environment Secrets Management
- **Action**: Use **HashiCorp Vault**, **AWS Secrets Manager**, or **Railway Secrets**.

---

## 🔍 Manual Checks & Security Auditing Checklist

- [ ] **Brute Force Detection**: Try to login with incorrect passwords 10+ times.
- [ ] **JWT Tampering**: Manually decode a JWT, change the `userId`, and verify rejection.
- [ ] **Tenant Isolation**: Verify User A cannot access any resource of Tenant B.
- [ ] **Token Expiry**: Set `JWT_EXPIRY` to 5 seconds and test refresh logic.
- [ ] **PII Masking**: Ensure NO passwords or sensitive tokens are written to logs.
