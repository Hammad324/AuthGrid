# 🚀 Postman Testing Guide — AuthGrid MVP

This guide walks you through the complete lifecycle of the AuthGrid platform, from creating an account to managing organizations and third-party apps.

---

## 🏁 Prerequisites
1.  **Postman** installed.
2.  **AuthGrid Backend** running (`npm run start:dev`).
3.  **Port**: `3000` (default).

---

## 👤 Phase 1: User Onboarding
### 1. Register a New Account
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/users`
*   **Body (raw JSON)**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "passwordHash": "securepassword123"
    }
    ```
*   **Expect**: `201 Created`

### 2. Login to get Tokens
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/auth/login`
*   **Body (raw JSON)**:
    ```json
    {
      "email": "john@example.com",
      "passwordHash": "securepassword123"
    }
    ```
*   **Expect**: `201 Created` with an `accessToken` and a `refreshToken`.
*   **Action**: **Copy the `accessToken`**. You will need it for the `Authorization` header in the next steps.

---

## 🏢 Phase 2: Workspace Management
### 3. Create a Tenant (Organization)
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/tenants/create`
*   **Auth**: `Bearer Token` -> Paste your `accessToken`.
*   **Body (raw JSON)**:
    ```json
    {
      "name": "Acme Corp"
    }
    ```
*   **Expect**: `201 Created`. The `slug` will be `acme-corp`.

### 4. Verify your Memberships
*   **Method**: `GET`
*   **URL**: `http://localhost:3000/tenants/me`
*   **Auth**: `Bearer Token` -> Paste your `accessToken`.
*   **Expect**: `200 OK`. You should see `Acme Corp` with role `OWNER`.

---

## 🏗️ Phase 3: Developer Platform
### 5. Create an Application
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/tenants/acme-corp/apps/create`
*   **Auth**: `Bearer Token` -> Paste your `accessToken`.
*   **Body (raw JSON)**:
    ```json
    {
      "name": "Internal Dashboard"
    }
    ```
*   **Expect**: `201 Created`. 
*   ⚠️ **IMPORTANT**: Copy the `clientSecret` now. It is hashed in the database and will **never** be shown again.

### 6. List Apps in Workspace
*   **Method**: `GET`
*   **URL**: `http://localhost:3000/tenants/acme-corp/apps`
*   **Auth**: `Bearer Token`.
*   **Expect**: `200 OK`. Note that the `clientSecret` is hidden for security.

---

## 🤖 Phase 4: Machine-to-Machine Auth
### 7. Exchange App Keys for a JWT
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/auth/app/token`
*   **Body (raw JSON)**:
    ```json
    {
      "clientId": "PASTE_YOUR_CLIENT_ID",
      "clientSecret": "PASTE_YOUR_CLIENT_SECRET"
    }
    ```
*   **Expect**: `201 Created`. You get a dedicated token for that specific App.

---

## 🔄 Phase 5: Security Lifecycle
### 8. Rotate your Refresh Token
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/auth/refresh`
*   **Body (raw JSON)**:
    ```json
    {
        "refreshToken": "PASTE_YOUR_REFRESH_TOKEN"
    }
    ```
*   **Expect**: `201 Created` with a brand new set of tokens. The old one is now invalid.

---

## 🛡️ Role Enforcement Check (RBAC)
To verify that the security is working:
1. Create a **second user** (e.g., `jane@example.com`).
2. Log in as Jane and get her token.
3. Try to create an app in **Acme Corp** (John's tenant):
   * `POST http://localhost:3000/tenants/acme-corp/apps/create`
4. **Result**: Jane will get a `403 Forbidden` because she is not a member of John's tenant! 💂
