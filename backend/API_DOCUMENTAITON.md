# AuthGrid MVP — Complete Technical Documentation

## 🧬 Overview
AuthGrid is a premium, multi-tenant Identity-as-a-Service (IDaaS) platform built for modern B2B SaaS. It provides a robust foundation for user authentication, organization management, and secure third-party application integrations.

---

## 🏗️ Architecture & Tech Stack

### 🧩 Modular Design (NestJS)
The backend is built with a strictly modular architecture, ensuring clear separation of concerns:
- **AuthModule**: Handles JWT issuance, Refresh Token Rotation, and App Key exchange.
- **TenantsModule**: Manages organization lifecycles and user memberships.
- **UsersModule**: Core user profile and registration logic.
- **AppsModule**: Developer platform for creating and managing third-party integrations.

### 💾 Data Layer
- **Prisma ORM**: Type-safe database access with a clean schema-first approach.
- **PostgreSQL**: Reliable relational storage for complex multi-tenant relationships.
- **Repository Pattern**: All database interactions are abstracted into repositories for better testability and isolation.

---

## 🔒 Security Architecture

### 🛡️ Core Protections
- **Argon2 Hashing**: Industry-leading password and API secret hashing. Plain-text secrets are **never** stored and only shown once at creation.
- **Stateless JWT**: Standardized session management using `passport-jwt`.
- **Refresh Token Rotation**: Every time a session is renewed, the old token is invalidated and a new pair is issued, preventing session hijacking.
- **Tenant Isolation**: Every request is scoped to a `tenantId`, ensuring users only see data they are authorized to access.

### 💂 Role-Based Access Control (RBAC)
AuthGrid uses a declarative `@Roles()` decorator and a global `RolesGuard` to enforce permissions:
- **OWNER**: Full administrative control.
- **ADMIN**: Can manage apps and settings.
- **MEMBER**: Read-only access to tenant resources.

---

## 🔑 Authentication Models

### 1. User Authentication (JWT)
Used by human users to manage their profile and tenants.
- **Header**: `Authorization: Bearer <token>`
- **Endpoint**: `POST /auth/login`

### 2. Application Authentication (API Keys)
Used by third-party services to interact with AuthGrid.
- **Credentials**: `clientId` (Public) & `clientSecret` (Secret)
- **Token Exchange**: `POST /auth/app/token` → Returns a machine-to-machine JWT.

---

## 📡 API Reference

### 👤 Users
- `POST /users`: Register a new account.
- `GET /users/me`: Current user profile (JWT).

### 🔑 Auth
- `POST /auth/login`: Login & get tokens.
- `POST /auth/refresh`: Securely rotate your session.
- `POST /auth/logout`: Invalidate a session (JWT).
- `POST /auth/app/token`: API Key exchange.

### 🏢 Tenants
- `POST /tenants/create`: Create a new workspace.
- `GET /tenants/me`: List your organization memberships.

### 🏗️ Apps
- `POST /tenants/:slug/apps/create`: Create an app (OWNER/ADMIN).
- `GET /tenants/:slug/apps`: List apps in a workspace.

---

## ⚙️ Environment Blueprint
Required keys in your `.env` file:
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: The master key for signing all tokens (Keep this safe!).
- `PORT`: The internal server port (Default: 3000).

---

## 🧪 Validation & Global Infrastructure
- **ValidationPipe**: Strictly enforces DTO structures and data types.
- **HttpExceptionFilter**: Standardizes all error responses into a clean JSON format.
- **ApiResponseInterceptor**: (Optional) Standardizes the wrap of successful responses.
