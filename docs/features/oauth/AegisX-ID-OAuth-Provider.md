# Blueprint: AegisX ID - OAuth2/OIDC Identity Provider

**Version:** 2.0
**Status:** Design Final

## 1. Overview & Goals

This document is the definitive blueprint for "AegisX ID," a centralized OAuth2/OIDC Identity Provider. It contains all necessary architectural, design, and task-level details for implementation.

- **Goal 1 (Security):** Establish a secure, single source of truth for user identity.
- **Goal 2 (Scalability):** Design a stateless, horizontally scalable service.
- **Goal 3 (Maintainability):** Follow Clean Architecture and DDD principles.
- **Goal 4 (Developer Experience):** Provide a clear, standards-compliant OIDC interface.

## 2. Technical Stack

- **Runtime:** Node.js (Latest LTS)
- **Framework:** Fastify (v4+)
- **Language:** TypeScript (Strict Mode)
- **OIDC Engine:** `node-oidc-provider` (Latest)
- **Database:** PostgreSQL (v15+)
- **ORM:** Prisma (Latest)
- **Validation:** Zod (`fastify-type-provider-zod`)
- **Containerization:** Docker & Docker Compose
- **Logging:** Pino (Structured JSON logging)
- **Security:** `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit`, `argon2`

## 3. Architectural Design

### 3.1. Monorepo Integration

AegisX ID will be a new application named `oauth` within the `apps/` directory of the Nx monorepo, ensuring logical isolation and independent deployment.

### 3.2. Application Structure (DDD)

The `apps/oauth` directory will adhere to the following structure:

```
apps/oauth/
├── prisma/
│   └── schema.prisma
└── src/
    ├── config/
    ├── database/
    ├── modules/
    │   ├── oidc/
    │   ├── user/
    │   └── auth/
    ├── shared/
    ├── app.ts
    └── server.ts
```

### 3.3. OIDC Data Flow

The system implements the OIDC Authorization Code Flow with PKCE. The flow is orchestrated by `node-oidc-provider`, which redirects to our custom interaction views when user input (login/consent) is required.

## 4. API Endpoint Specification

### 4.1. Standard OIDC Routes (Handled by `node-oidc-provider`)

These routes will be automatically exposed and managed by the OIDC provider instance.

| Method | Path                                | Description                                                                |
| :----- | :---------------------------------- | :------------------------------------------------------------------------- |
| `GET`  | `/oauth/authorize`                  | Starts the authorization flow. The entry point for all clients.            |
| `POST` | `/oauth/token`                      | Exchanges authorization codes or refresh tokens for new tokens.            |
| `GET`  | `/oauth/jwks.json`                  | Exposes the JSON Web Key Set for clients to verify token signatures.       |
| `GET`  | `/oauth/userinfo`                   | Returns claims about the authenticated user, protected by an access token. |
| `POST` | `/oauth/revocation`                 | Revokes a refresh or access token.                                         |
| `GET`  | `/oauth/session/end`                | Ends the user's session with the provider.                                 |
| `GET`  | `/.well-known/openid-configuration` | The OIDC discovery document, providing metadata about the provider.        |

### 4.2. Custom Interaction Routes (To be Implemented)

These routes are triggered by the OIDC provider when it needs user interaction.

#### `GET /interaction/:uid`

- **Description:** Renders the login and/or consent prompt based on the state of the interaction.
- **Response `200 OK`:**
  ```json
  // Describes what the provider needs from the user.
  {
    "uid": "...",
    "prompt": { "name": "login", "details": {} },
    "params": { "client_id": "..." },
    "client": { "clientName": "Client App Name" }
  }
  ```

#### `POST /interaction/:uid/login`

- **Description:** Authenticates a user's credentials.
- **Request Body (application/json):**
  ```json
  {
    "email": "user@example.com",
    "password": "user_password"
  }
  ```
- **Response (on success):** Redirects the browser back to the OIDC flow.
- **Response `401 Unauthorized` (on failure):** Renders an error on the page.

## 5. Database Schema Definition (`prisma/schema.prisma`)

This is the complete, final schema for the AegisX ID database.

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("OAUTH_DATABASE_URL")
}

enum UserStatus {
  ACTIVE
  SUSPENDED
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}

// AegisX core models
model User {
  id              String        @id @default(uuid())
  email           String        @unique
  passwordHash    String
  isEmailVerified Boolean       @default(false)
  status          UserStatus    @default(ACTIVE)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  memberships     OrganizationMember[]
  auditLogs       AuditLog[]

  @@map("users")
}

model Organization {
  id              String        @id @default(uuid())
  name            String
  slug            String        @unique
  domainAllowList String[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  members         OrganizationMember[]

  @@map("organizations")
}

model OrganizationMember {
  role      MemberRole @default(MEMBER)
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now())

  @@id([userId, orgId])
  @@map("organization_members")
}

model AuditLog {
  id        String   @id @default(uuid())
  actorId   String
  actor     User     @relation(fields: [actorId], references: [id])
  action    String
  resource  String   // e.g., "user:create", "oidc:login"
  ip        String?
  userAgent String?
  metadata  Json?
  createdAt DateTime @default(now())

  @@map("audit_logs")
}


// node-oidc-provider specific model
// A single, flexible table to store all OIDC-related payloads
// (sessions, access tokens, auth codes, etc.) as recommended
// by the oidc-provider library authors.
model OidcPayload {
  id         String     @id @map("_id")
  type       Int
  payload    Json
  grantId    String?
  userCode   String?    @unique
  uid        String?    @unique
  expiresAt  DateTime?
  consumedAt DateTime?

  @@index([expiresAt])
  @@index([grantId])
  @@map("oidc_payloads")
}
```

## 6. Implementation Plan & Tasks

### Phase 1: Project Scaffolding & Setup

- [ ] **Task 1.1:** Generate `oauth` app via `pnpm nx g @nx/fastify:app oauth --unitTestRunner=none --e2eTestRunner=none`.
- [ ] **Task 1.2:** Install dependencies: `pnpm add fastify fastify-type-provider-zod @fastify/helmet @fastify/cors @fastify/rate-limit node-oidc-provider zod argon2`.
- [ ] **Task 1.3:** Install dev dependencies: `pnpm add -D @types/node @types/argon2 prisma`.
- [ ] **Task 1.4:** Create `docker-compose.oauth.yml` with a `postgres:15` service and define the `OAUTH_DATABASE_URL` environment variable.

### Phase 2: Database & ORM

- [ ] **Task 2.1:** Create `apps/oauth/prisma/schema.prisma` and copy the schema from Section 5 into it.
- [ ] **Task 2.2:** Create an `.env` file in `apps/oauth` with the `OAUTH_DATABASE_URL`.
- [ ] **Task 2.3:** Run `pnpm prisma generate --schema=apps/oauth/prisma/schema.prisma` to generate the Prisma Client.
- [ ] **Task 2.4:** Run `pnpm prisma migrate dev --schema=apps/oauth/prisma/schema.prisma --name 'initial-oauth-schema'` to create the initial migration.

### Phase 3: OIDC Core Implementation

- [ ] **Task 3.1:** Create `src/database/prisma.ts` to export a singleton Prisma client instance.
- [ ] **Task 3.2:** Implement the `PrismaAdapter` class in `src/modules/oidc/adapter.ts`. This class must implement the `Adapter` interface from `oidc-provider`.
- [ ] **Task 3.3:** Create the OIDC provider configuration in `src/config/oidc.ts`, initializing the provider with the Prisma adapter and other settings (PKCE, cookies, claims).

### Phase 4: Application & Interaction Logic

- [ ] **Task 4.1:** Implement the main Fastify server in `src/app.ts`. Register plugins (`helmet`, `cors`).
- [ ] **Task 4.2:** Mount the OIDC provider's callback function as a catch-all route (`server.all('/oauth/*', provider.callback())`).
- [ ] **Task 4.3:** Create the `auth` module with `hashPassword` and `verifyPassword` functions using `argon2`.
- [ ] **Task 4.4:** Implement the interaction routes (`GET /interaction/:uid` and `POST /interaction/:uid/login`).

### Phase 5: Verification

- [ ] **Task 5.1:** Create a health-check endpoint (`/health`) that confirms database connectivity.
- [ ] **Task 5.2:** Run `pnpm nx build oauth` to compile the app and ensure there are no TypeScript errors.
- [ ] **Task 5.3:** Start the service and manually test the OIDC flow using a tool like `oidc-debug`.
