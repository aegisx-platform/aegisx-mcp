# Audit System Architecture

**System design and technical architecture**

Version: 1.0.0
Last Updated: 2025-11-02

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagrams](#architecture-diagrams)
- [Component Design](#component-design)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)
- [Design Decisions](#design-decisions)

## System Overview

The Audit System is a full-stack feature for tracking and analyzing security-related events:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Audit System Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌─────────────┐        ┌───────────┐ │
│  │   Frontend   │────────►│   Backend   │───────►│ Database  │ │
│  │  (Angular)   │◄────────│  (Fastify)  │◄───────│(PostgreSQL│ │
│  └──────────────┘         └─────────────┘        └───────────┘ │
│        │                          │                      │       │
│        │                          │                      │       │
│    Signals                   TypeBox                  Knex.js   │
│    RxJS                      Validation               Migrations │
│    Material                  Plugins                  Indexes    │
│    Routes                    Controllers                         │
│                              Services                            │
│                              Repositories                        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

- **Frontend**: Angular 19 with Signals, Material Design, TailwindCSS
- **Backend**: Fastify 4 with TypeBox validation, plugin architecture
- **Database**: PostgreSQL 15 with optimized indexes
- **State Management**: Angular Signals + RxJS Observables
- **Type Safety**: TypeBox schemas generate both validation and TypeScript types

## Architecture Diagrams

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Browser (User Interface)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Angular Application (Port 4200)                              │  │
│  │                                                                │  │
│  │  ┌──────────────┐    ┌──────────────┐    ┌─────────────────┐│  │
│  │  │ Login        │    │ File         │    │ Shared          ││  │
│  │  │ Attempts     │    │ Activity     │    │ Components      ││  │
│  │  │ Component    │    │ Component    │    │ - Tables        ││  │
│  │  │              │    │              │    │ - Filters       ││  │
│  │  │ - Table      │    │ - Table      │    │ - Pagination    ││  │
│  │  │ - Filters    │    │ - Filters    │    │ - Dialogs       ││  │
│  │  │ - Export     │    │ - Export     │    └─────────────────┘│  │
│  │  └──────────────┘    └──────────────┘                        │  │
│  │         │                    │                                │  │
│  │         └────────┬───────────┘                                │  │
│  │                  │                                             │  │
│  │         ┌────────▼──────────┐                                 │  │
│  │         │  Audit Services    │                                 │  │
│  │         │                    │                                 │  │
│  │         │  - LoginAttempts   │                                 │  │
│  │         │  - FileAudit       │                                 │  │
│  │         │                    │                                 │  │
│  │         │  State: Signals    │                                 │  │
│  │         │  HTTP: HttpClient  │                                 │  │
│  │         └────────┬───────────┘                                 │  │
│  └──────────────────┼─────────────────────────────────────────────┘  │
│                     │                                                 │
│                     │ HTTP/JSON (REST API)                           │
│                     │ Authentication: JWT Bearer Token              │
│                     ▼                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Fastify Backend (Port 3333)                                  │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │  Plugin Registration Layer                            │    │  │
│  │  │  - loginAttemptsPlugin                                │    │  │
│  │  │  - fileAuditPlugin                                    │    │  │
│  │  └───────────────┬──────────────────────────────────────┘    │  │
│  │                  │                                             │  │
│  │         ┌────────▼───────┐        ┌───────────────────┐      │  │
│  │         │ Routes Layer    │        │ Middleware        │      │  │
│  │         │                 │        │                   │      │  │
│  │         │ - Login Routes  │        │ - Authentication  │      │  │
│  │         │ - File Routes   │        │ - Authorization   │      │  │
│  │         └────────┬────────┘        │ - Rate Limiting   │      │  │
│  │                  │                 │ - Validation      │      │  │
│  │         ┌────────▼────────┐        └───────────────────┘      │  │
│  │         │ Controllers     │                                    │  │
│  │         │                 │                                    │  │
│  │         │ - Login Ctrl    │                                    │  │
│  │         │ - File Ctrl     │                                    │  │
│  │         └────────┬────────┘                                    │  │
│  │                  │                                             │  │
│  │         ┌────────▼────────┐                                    │  │
│  │         │ Services        │                                    │  │
│  │         │                 │                                    │  │
│  │         │ - Business Logic│                                    │  │
│  │         │ - Data Transform│                                    │  │
│  │         └────────┬────────┘                                    │  │
│  │                  │                                             │  │
│  │         ┌────────▼────────┐                                    │  │
│  │         │ Repositories    │                                    │  │
│  │         │                 │                                    │  │
│  │         │ - Query Builder │                                    │  │
│  │         │ - DB Operations │                                    │  │
│  │         └────────┬────────┘                                    │  │
│  └──────────────────┼─────────────────────────────────────────────┘  │
│                     │                                                 │
│                     │ SQL Queries (Knex.js)                          │
│                     ▼                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (Port 5432)                              │  │
│  │                                                                │  │
│  │  ┌──────────────────────┐    ┌─────────────────────────────┐│  │
│  │  │  login_attempts      │    │  file_audit_logs            ││  │
│  │  │                      │    │                             ││  │
│  │  │  - id (PK)           │    │  - id (PK)                  ││  │
│  │  │  - user_id (FK)      │    │  - file_id                  ││  │
│  │  │  - email             │    │  - user_id (FK)             ││  │
│  │  │  - ip_address        │    │  - operation                ││  │
│  │  │  - success           │    │  - file_name                ││  │
│  │  │  - created_at        │    │  - created_at               ││  │
│  │  │                      │    │                             ││  │
│  │  │  Indexes:            │    │  Indexes:                   ││  │
│  │  │  - created_at (DESC) │    │  - created_at (DESC)        ││  │
│  │  │  - success           │    │  - file_id                  ││  │
│  │  │  - email             │    │  - operation                ││  │
│  │  └──────────────────────┘    └─────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Design

#### Backend Plugin Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Plugin Architecture                        │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Main App (app.ts)                                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  await app.register(loginAttemptsPlugin)              │    │
│  │  await app.register(fileAuditPlugin)                  │    │
│  └─────────────┬────────────────────────────────────────┘    │
│                │                                               │
│       ┌────────▼──────────┐         ┌─────────────────────┐  │
│       │ loginAttempts     │         │ fileAudit           │  │
│       │ Plugin            │         │ Plugin              │  │
│       │                   │         │                     │  │
│       │ 1. Register Routes│         │ 1. Register Routes  │  │
│       │ 2. Decorate Server│         │ 2. Decorate Server  │  │
│       │ 3. Setup Services │         │ 3. Setup Services   │  │
│       └────────┬──────────┘         └──────────┬──────────┘  │
│                │                                │              │
│       ┌────────▼──────────┐         ┌──────────▼──────────┐  │
│       │ Routes            │         │ Routes              │  │
│       │ - GET /list       │         │ - GET /list         │  │
│       │ - GET /stats      │         │ - GET /stats        │  │
│       │ - DELETE /cleanup │         │ - DELETE /cleanup   │  │
│       │ - GET /export     │         │ - GET /export       │  │
│       └────────┬──────────┘         └──────────┬──────────┘  │
│                │                                │              │
│       ┌────────▼──────────┐         ┌──────────▼──────────┐  │
│       │ Controller        │         │ Controller          │  │
│       │ - Request handling│         │ - Request handling  │  │
│       │ - Response format │         │ - Response format   │  │
│       └────────┬──────────┘         └──────────┬──────────┘  │
│                │                                │              │
│       ┌────────▼──────────┐         ┌──────────▼──────────┐  │
│       │ Service           │         │ Service             │  │
│       │ - Business logic  │         │ - Business logic    │  │
│       │ - Data validation │         │ - Data validation   │  │
│       └────────┬──────────┘         └──────────┬──────────┘  │
│                │                                │              │
│       ┌────────▼──────────┐         ┌──────────▼──────────┐  │
│       │ Repository        │         │ Repository          │  │
│       │ - Query building  │         │ - Query building    │  │
│       │ - DB operations   │         │ - DB operations     │  │
│       └───────────────────┘         └─────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### Frontend Service Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                 Frontend Service Architecture                 │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Component (login-attempts.component.ts)                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  private service = inject(LoginAttemptsService)       │    │
│  │                                                        │    │
│  │  // Signal-based state (read-only)                    │    │
│  │  loginAttempts = this.service.loginAttempts;          │    │
│  │  loading = this.service.loading;                      │    │
│  │  error = this.service.error;                          │    │
│  │                                                        │    │
│  │  ngOnInit() {                                         │    │
│  │    this.service.getLoginAttempts({...}).subscribe();  │    │
│  │  }                                                    │    │
│  └────────────────┬───────────────────────────────────────┘    │
│                   │                                            │
│          ┌────────▼──────────┐                                │
│          │ LoginAttempts     │                                │
│          │ Service           │                                │
│          │                   │                                │
│          │ Private State:    │                                │
│          │ ┌──────────────┐ │                                │
│          │ │ _state       │ │                                │
│          │ │ = signal({   │ │                                │
│          │ │   attempts:[]│ │                                │
│          │ │   loading:0  │ │                                │
│          │ │   error:null │ │                                │
│          │ │ })           │ │                                │
│          │ └──────────────┘ │                                │
│          │                   │                                │
│          │ Public Signals:   │                                │
│          │ - loginAttempts() │                                │
│          │ - loading()       │                                │
│          │ - error()         │                                │
│          │                   │                                │
│          │ Methods:          │                                │
│          │ - getLoginAttempts│                                │
│          │ - getStats        │                                │
│          │ - deleteAttempt   │                                │
│          │ - cleanupAttempts │                                │
│          │ - exportAttempts  │                                │
│          └────────┬──────────┘                                │
│                   │                                            │
│          ┌────────▼──────────┐                                │
│          │ HttpClient        │                                │
│          │ - GET /api/...    │                                │
│          │ - DELETE /api/... │                                │
│          │                   │                                │
│          │ RxJS Operators:   │                                │
│          │ - map()           │                                │
│          │ - tap()           │                                │
│          │ - catchError()    │                                │
│          │ - finalize()      │                                │
│          └───────────────────┘                                │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### Login Attempt Tracking Flow

```
User Login Attempt
      │
      ▼
┌─────────────────┐
│  Auth Service   │  1. User submits credentials
│  (login method) │
└────────┬────────┘
         │
         │ 2. Validate credentials
         ▼
┌─────────────────┐
│  Database Query │  3. Check email/password
│  (users table)  │
└────────┬────────┘
         │
         │ 4. Authentication result
         ▼
    ┌────────┐
    │Success?│
    └───┬────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
Success    Failed
   │         │
   │         ▼
   │    ┌────────────────────┐
   │    │ Determine failure  │
   │    │ reason:            │
   │    │ - INVALID_PASSWORD │
   │    │ - USER_NOT_FOUND   │
   │    │ - ACCOUNT_DISABLED │
   │    └────────┬───────────┘
   │             │
   │             ▼
   │    ┌─────────────────────────┐
   │    │ Create login attempt:   │
   │    │ - success: false        │
   │    │ - failureReason: XXX    │
   │    │ - email, ip, userAgent  │
   │    └─────────┬───────────────┘
   │              │
   ▼              ▼
┌──────────────────────────────┐
│ Create login attempt:         │
│ - success: true               │
│ - userId, email, username     │
│ - ip, userAgent, timestamp    │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ INSERT INTO login_attempts   │
│ (PostgreSQL)                 │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Return response to user      │
│ - JWT token (if success)     │
│ - Error message (if failed)  │
└──────────────────────────────┘
```

### File Operation Tracking Flow

```
User File Operation
      │
      ▼
┌─────────────────┐
│ File Controller │  1. User uploads/downloads/deletes file
│ (upload/etc)    │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │Try-Catch│
    └───┬────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
Success    Failed
   │         │
   │         ▼
   │    ┌────────────────────┐
   │    │ Capture error:     │
   │    │ - Error message    │
   │    │ - Stack trace      │
   │    │ - Failed operation │
   │    └────────┬───────────┘
   │             │
   │             ▼
   │    ┌─────────────────────────┐
   │    │ Create audit log:       │
   │    │ - success: false        │
   │    │ - errorMessage: XXX     │
   │    │ - operation, file info  │
   │    └─────────┬───────────────┘
   │              │
   ▼              ▼
┌──────────────────────────────┐
│ Create audit log:             │
│ - success: true               │
│ - operation: upload/download  │
│ - fileId, fileName, fileSize  │
│ - userId, ip, userAgent       │
│ - filePath, mimeType          │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ INSERT INTO file_audit_logs  │
│ (PostgreSQL)                 │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Return response to user      │
│ - File data (if success)     │
│ - Error message (if failed)  │
└──────────────────────────────┘
```

## Database Design

### Schema Design Principles

1. **Immutable Records** - Audit logs are never updated, only created or deleted
2. **Indexed Queries** - All common filters have database indexes
3. **Foreign Keys** - Referential integrity with CASCADE/SET NULL
4. **Timestamps** - All records have creation timestamps
5. **Type Safety** - ENUM constraints for operation types

### Entity Relationship Diagram

```
┌──────────────────────┐
│      users           │
│  (existing table)    │
├──────────────────────┤
│ id (PK)              │ ────┐
│ email                │     │
│ username             │     │
│ ...                  │     │
└──────────────────────┘     │
                              │ user_id (FK, SET NULL)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ login_attempts   │ │ file_audit_logs  │ │ (future audits)  │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ id (PK)          │ │ id (PK)          │ │ ...              │
│ user_id (FK)     │ │ file_id          │ │                  │
│ email            │ │ user_id (FK)     │ │                  │
│ username         │ │ operation        │ │                  │
│ ip_address       │ │ success          │ │                  │
│ user_agent       │ │ file_name        │ │                  │
│ success          │ │ file_size        │ │                  │
│ failure_reason   │ │ file_path        │ │                  │
│ created_at       │ │ mime_type        │ │                  │
│                  │ │ ip_address       │ │                  │
│ Indexes:         │ │ user_agent       │ │                  │
│ - created_at DESC│ │ error_message    │ │                  │
│ - success        │ │ created_at       │ │                  │
│ - email          │ │                  │ │                  │
│ - ip_address     │ │ Indexes:         │ │                  │
│ - user_id        │ │ - created_at DESC│ │                  │
└──────────────────┘ │ - file_id        │ └──────────────────┘
                     │ - operation      │
                     │ - success        │
                     │ - user_id        │
                     └──────────────────┘
```

### Index Strategy

#### Login Attempts Indexes

```sql
-- Timestamp queries (most common)
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at DESC);

-- Filter by success/failure
CREATE INDEX idx_login_attempts_success ON login_attempts(success);

-- User-specific queries
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);

-- Email search
CREATE INDEX idx_login_attempts_email ON login_attempts(email);

-- IP address analysis
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);

-- Composite index for common query pattern
CREATE INDEX idx_login_attempts_success_created
  ON login_attempts(success, created_at DESC);
```

#### File Audit Logs Indexes

```sql
-- Timestamp queries (most common)
CREATE INDEX idx_file_audit_created_at ON file_audit_logs(created_at DESC);

-- File-specific queries
CREATE INDEX idx_file_audit_file_id ON file_audit_logs(file_id);

-- Operation filtering
CREATE INDEX idx_file_audit_operation ON file_audit_logs(operation);

-- Success/failure filtering
CREATE INDEX idx_file_audit_success ON file_audit_logs(success);

-- User-specific queries
CREATE INDEX idx_file_audit_user_id ON file_audit_logs(user_id);

-- Filename search
CREATE INDEX idx_file_audit_file_name ON file_audit_logs(file_name);

-- Composite index for file history queries
CREATE INDEX idx_file_audit_file_created
  ON file_audit_logs(file_id, created_at DESC);
```

## Security Architecture

### Authentication & Authorization

```
┌──────────────────────────────────────────────────────────────┐
│             Security Layers                                   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Layer 1: Authentication (JWT)                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  - Verify JWT token in Authorization header          │    │
│  │  - Extract user ID and permissions from token        │    │
│  │  - Reject requests with invalid/expired tokens       │    │
│  └──────────────────────────────────────────────────────┘    │
│                          │                                     │
│                          ▼                                     │
│  Layer 2: Authorization (Permissions)                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  - Check user has required permission                │    │
│  │  - audit:read - View audit logs                      │    │
│  │  - audit:delete - Delete individual records          │    │
│  │  - audit:cleanup - Bulk delete operations            │    │
│  │  - audit:export - Export data to CSV                 │    │
│  └──────────────────────────────────────────────────────┘    │
│                          │                                     │
│                          ▼                                     │
│  Layer 3: Rate Limiting                                       │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  - List/Stats: 60 requests/minute                    │    │
│  │  - Export: 10 requests/hour                          │    │
│  │  - Cleanup: 5 requests/hour                          │    │
│  └──────────────────────────────────────────────────────┘    │
│                          │                                     │
│                          ▼                                     │
│  Layer 4: Input Validation (TypeBox)                          │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  - Validate all request parameters                   │    │
│  │  - Sanitize user input                               │    │
│  │  - Type checking and coercion                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                          │                                     │
│                          ▼                                     │
│  Layer 5: Database Security                                   │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  - Parameterized queries (prevent SQL injection)     │    │
│  │  - Foreign key constraints                           │    │
│  │  - Row-level security policies (if needed)           │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Query Optimization

- **Pagination**: Always use LIMIT/OFFSET for large datasets
- **Indexes**: All filter columns have database indexes
- **Date Range**: Indexed created_at for fast time-based queries
- **Composite Indexes**: Common query patterns optimized

### Frontend Performance

- **Lazy Loading**: Audit components loaded on-demand
- **Signal-Based**: Reactive UI updates without full re-renders
- **Debouncing**: Search inputs debounced (can be enhanced)
- **Virtual Scrolling**: For very large datasets (future enhancement)

### Caching Strategy

Currently no caching implemented (stateless design). Future enhancements:

- Redis cache for statistics endpoints
- Edge caching for export endpoints
- Client-side caching with SWR strategy

## Design Decisions

### Why Separate Audit Tables?

**Decision**: Use separate tables (`login_attempts`, `file_audit_logs`) instead of single unified audit table

**Rationale**:

- Different schemas for different event types
- Optimized indexes per table type
- Better query performance
- Easier to maintain and extend
- Type-safe schemas

### Why Signal-Based State?

**Decision**: Use Angular Signals for state management instead of NgRx or services with BehaviorSubject

**Rationale**:

- Native Angular 19 feature (no extra dependencies)
- Simpler mental model than NgRx
- Better performance than zone-based change detection
- Automatic cleanup (no subscription management)
- Type-safe computed values

### Why TypeBox Over Zod?

**Decision**: Use TypeBox for schema validation instead of Zod

**Rationale**:

- Generates both runtime validation AND TypeScript types from single source
- Better integration with Fastify
- OpenAPI schema generation built-in
- Faster runtime performance
- JSON Schema standard compliance

### Why Immutable Audit Logs?

**Decision**: Audit logs can only be created or deleted, never updated

**Rationale**:

- Compliance requirements (audit trail integrity)
- Simpler codebase (no update logic)
- Better performance (append-only operations)
- Security (prevents tampering)

### Why No WebSockets for Audit?

**Decision**: Use REST API only, no real-time WebSocket updates

**Rationale**:

- Audit logs don't need real-time updates
- Lower complexity and resource usage
- Better for large datasets (pagination)
- Simpler client code
- Can add later if needed

---

**Related Documentation:**

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Integration examples
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production setup
