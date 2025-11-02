# File Logs Analysis & Recommendation

**Created:** 2025-11-02
**Status:** Analysis Complete
**Decision:** Merge into Enhanced `file_audit_logs`

---

## 📊 Executive Summary

The codebase currently has **two separate file logging tables** with overlapping purposes:

- `file_audit_logs` - Operation-focused audit logging (newer, 2024-10-28)
- `file_access_logs` - HTTP access logging (older, migration 019)

**Recommendation:** **Merge into a single enhanced `file_audit_logs` table** that combines the best features of both.

---

## 🔍 Detailed Comparison

### file_audit_logs (Migration: 20251028140200)

#### Purpose

Comprehensive audit logging for all file operations - supports compliance, security monitoring, and analytics.

#### Schema (14 fields)

```sql
- id                 UUID PRIMARY KEY
- file_id            UUID NOT NULL            -- File reference (no FK)
- user_id            UUID NOT NULL            -- User reference (no FK)
- operation          VARCHAR(30) NOT NULL     -- upload, download, view, update, delete, share
- timestamp          TIMESTAMP NOT NULL       -- When operation occurred
- success            BOOLEAN NOT NULL (true)  -- Operation success/failure
- error_message      TEXT                     -- Error details if failed
- ip_address         VARCHAR(45)              -- IPv4/IPv6
- user_agent         VARCHAR(1000)            -- Browser/device
- duration           INTEGER                  -- Milliseconds
- file_size          BIGINT                   -- Bytes
- file_name          VARCHAR(500)             -- Original filename
- category           VARCHAR(50)              -- File category
- metadata           JSONB                    -- Flexible context
- created_at         TIMESTAMP NOT NULL
```

#### Indexes (13 indexes)

- Single field: file_id, user_id, operation, timestamp, success, category
- Composite: file_id+timestamp, user_id+timestamp, operation+timestamp, success+timestamp
- Cleanup: timestamp

#### Strengths ✅

- ✅ Flexible operation tracking (not limited to access)
- ✅ Success/failure tracking with error messages
- ✅ File context (name, category)
- ✅ Performance tracking (duration)
- ✅ Clean, focused design
- ✅ Excellent index coverage
- ✅ Service layer exists (stub implementation)

#### Weaknesses ❌

- ❌ No foreign key constraints (can't cascade delete)
- ❌ No HTTP-level context (status codes, auth method)
- ❌ No access method tracking (web vs API vs signed URL)
- ❌ No session tracking
- ❌ No referer information
- ❌ Missing access_granted vs success distinction

---

### file_access_logs (Migration: 019)

#### Purpose

Comprehensive logging of all file access attempts for security and analytics.

#### Schema (20 fields)

```sql
- id                 UUID PRIMARY KEY
- file_id            UUID NOT NULL FK → uploaded_files (CASCADE)
- accessed_by        UUID FK → users (SET NULL)  -- Nullable for anonymous
- access_type        VARCHAR(20) NOT NULL        -- view, download, upload, delete, update
- access_method      VARCHAR(20) NOT NULL        -- web, api, direct_link, signed_url
- ip_address         VARCHAR(45)                 -- IPv4/IPv6
- user_agent         VARCHAR(1000)               -- Browser/device
- referer            VARCHAR(1000)               -- HTTP referer
- session_id         UUID                        -- Session tracking
- http_status        INTEGER NOT NULL            -- HTTP response status
- bytes_transferred  BIGINT                      -- Download size
- response_time_ms   INTEGER                     -- Response time
- access_granted     BOOLEAN NOT NULL (true)     -- Authorization result
- denial_reason      VARCHAR(100)                -- Why denied
- auth_method        VARCHAR(20)                 -- bearer, session, signed_url, anonymous
- request_headers    JSONB                       -- Selected headers
- metadata           JSONB                       -- Additional context
- accessed_at        TIMESTAMP NOT NULL          -- When accessed
- created_at         TIMESTAMP NOT NULL
```

#### Indexes (11 indexes)

- Single field: file_id, accessed_by, access_type, accessed_at, ip_address, http_status, access_granted
- Composite: file_id+accessed_at, accessed_by+accessed_at, access_type+accessed_at, access_granted+accessed_at
- Cleanup: accessed_at+created_at

#### Strengths ✅

- ✅ Foreign key constraints (data integrity)
- ✅ HTTP-level context (status, auth method, access method)
- ✅ Security focus (access_granted, denial_reason, auth_method)
- ✅ Session tracking (session_id)
- ✅ Request context (referer, request_headers)
- ✅ Anonymous access support (nullable accessed_by)

#### Weaknesses ❌

- ❌ Limited to "access" operations (not audit-focused)
- ❌ No error tracking for failed operations
- ❌ Redundant with file_audit_logs (overlapping purpose)
- ❌ No service layer implementation
- ❌ Not integrated with codebase
- ❌ Less flexible metadata structure

---

## 📈 Field Comparison Matrix

| Field                | file_audit_logs | file_access_logs       | Merge Strategy                 |
| -------------------- | --------------- | ---------------------- | ------------------------------ |
| **Primary Key**      |                 |                        |                                |
| id                   | ✅ UUID         | ✅ UUID                | Keep                           |
| **References**       |                 |                        |                                |
| file_id              | ✅ UUID (no FK) | ✅ UUID (FK)           | Add FK option                  |
| user_id              | ✅ NOT NULL     | accessed_by (nullable) | Keep user_id, support nullable |
| **Operation**        |                 |                        |                                |
| operation            | ✅ VARCHAR(30)  | -                      | Keep                           |
| access_type          | -               | ✅ VARCHAR(20)         | Merge into operation           |
| **Timing**           |                 |                        |                                |
| timestamp            | ✅              | accessed_at            | Keep timestamp                 |
| duration             | ✅ INTEGER      | response_time_ms ✅    | Keep both (rename)             |
| **Success/Security** |                 |                        |                                |
| success              | ✅ BOOLEAN      | -                      | Keep                           |
| error_message        | ✅ TEXT         | -                      | Keep                           |
| access_granted       | -               | ✅ BOOLEAN             | **ADD** (different purpose)    |
| denial_reason        | -               | ✅ VARCHAR(100)        | **ADD**                        |
| **HTTP Context**     |                 |                        |                                |
| http_status          | -               | ✅ INTEGER             | **ADD**                        |
| access_method        | -               | ✅ VARCHAR(20)         | **ADD**                        |
| auth_method          | -               | ✅ VARCHAR(20)         | **ADD**                        |
| **Request Context**  |                 |                        |                                |
| ip_address           | ✅              | ✅                     | Keep                           |
| user_agent           | ✅              | ✅                     | Keep                           |
| referer              | -               | ✅ VARCHAR(1000)       | **ADD**                        |
| session_id           | -               | ✅ UUID                | **ADD**                        |
| **File Context**     |                 |                        |                                |
| file_name            | ✅ VARCHAR(500) | -                      | Keep                           |
| category             | ✅ VARCHAR(50)  | -                      | Keep                           |
| file_size            | ✅ BIGINT       | bytes_transferred ✅   | Keep file_size                 |
| **Metadata**         |                 |                        |                                |
| metadata             | ✅ JSONB        | ✅ JSONB               | Keep                           |
| request_headers      | -               | ✅ JSONB               | Optional (use metadata)        |
| **Audit Fields**     |                 |                        |                                |
| created_at           | ✅              | ✅                     | Keep                           |

**Total Fields:** file_audit_logs (14) + file_access_logs unique (7) = **21 fields in merged table**

---

## 💡 Recommended Approach: Enhanced file_audit_logs

### Strategy

**Merge both tables into a single, comprehensive `file_audit_logs` table** that serves both purposes:

1. **Audit logging** - Track all file operations for compliance
2. **Access logging** - Track HTTP-level access patterns for security

### Enhanced Schema (21 fields)

```sql
CREATE TABLE file_audit_logs (
  -- Primary key
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References (with optional FK enforcement)
  file_id             UUID NOT NULL,
  user_id             UUID,  -- Nullable for anonymous access

  -- Operation tracking
  operation           VARCHAR(30) NOT NULL,  -- upload, download, view, update, delete, share, etc.
  access_method       VARCHAR(20),           -- web, api, direct_link, signed_url

  -- Timing
  timestamp           TIMESTAMP NOT NULL DEFAULT NOW(),
  duration_ms         INTEGER,               -- Operation duration

  -- Success tracking (operation level)
  success             BOOLEAN NOT NULL DEFAULT true,
  error_message       TEXT,

  -- Access control (HTTP level)
  access_granted      BOOLEAN,               -- Authorization result (different from success)
  denial_reason       VARCHAR(100),          -- Why access was denied
  http_status         INTEGER,               -- HTTP response status code

  -- Authentication
  auth_method         VARCHAR(20),           -- bearer, session, signed_url, anonymous

  -- Request context
  ip_address          VARCHAR(45),           -- IPv4/IPv6
  user_agent          VARCHAR(1000),         -- Browser/device info
  referer             VARCHAR(1000),         -- HTTP referer
  session_id          VARCHAR(128),          -- Session identifier

  -- File context
  file_name           VARCHAR(500),          -- Original filename
  file_size           BIGINT,                -- File size in bytes
  category            VARCHAR(50),           -- File category

  -- Metadata
  metadata            JSONB,                 -- Flexible additional context

  -- Audit
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes (comprehensive)
  INDEX idx_file_audit_logs_file (file_id),
  INDEX idx_file_audit_logs_user (user_id),
  INDEX idx_file_audit_logs_operation (operation),
  INDEX idx_file_audit_logs_timestamp (timestamp DESC),
  INDEX idx_file_audit_logs_success (success),
  INDEX idx_file_audit_logs_access_granted (access_granted),
  INDEX idx_file_audit_logs_http_status (http_status),
  INDEX idx_file_audit_logs_session (session_id),

  -- Composite indexes
  INDEX idx_file_audit_logs_file_time (file_id, timestamp DESC),
  INDEX idx_file_audit_logs_user_time (user_id, timestamp DESC),
  INDEX idx_file_audit_logs_operation_time (operation, timestamp DESC),
  INDEX idx_file_audit_logs_security (access_granted, timestamp DESC),

  -- Cleanup index
  INDEX idx_file_audit_logs_cleanup (timestamp)
);

-- Optional: Add FK constraints (can be enabled/disabled based on needs)
-- ALTER TABLE file_audit_logs
--   ADD CONSTRAINT fk_file_audit_logs_file
--   FOREIGN KEY (file_id) REFERENCES uploaded_files(id) ON DELETE CASCADE;

-- ALTER TABLE file_audit_logs
--   ADD CONSTRAINT fk_file_audit_logs_user
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON TABLE file_audit_logs IS
  'Unified file audit and access logging - tracks operations and HTTP access patterns';
```

### Key Design Decisions

#### 1. **Success vs Access Granted**

- `success` - Operation-level success (Did the operation complete?)
- `access_granted` - Authorization-level success (Was user authorized?)

**Example scenarios:**

```typescript
// Successful authorized download
{ success: true, access_granted: true, http_status: 200 }

// Failed download (file corrupted)
{ success: false, access_granted: true, http_status: 500, error_message: "File corrupted" }

// Unauthorized access attempt
{ success: false, access_granted: false, http_status: 403, denial_reason: "Insufficient permissions" }

// Anonymous view denied
{ success: false, access_granted: false, http_status: 401, denial_reason: "Authentication required" }
```

#### 2. **Nullable user_id**

- Supports anonymous access scenarios
- Matches file_access_logs pattern
- Use `user_id IS NULL` to find anonymous access

#### 3. **Optional FK Constraints**

- Table created WITHOUT FK constraints initially
- Can be added later via ALTER TABLE
- Allows flexibility for testing and migration
- Prevents cascade issues during data migration

#### 4. **Merged Operation Types**

```typescript
enum FileOperation {
  // From file_audit_logs
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  VIEW = 'view',
  UPDATE = 'update',
  DELETE = 'delete',
  SHARE = 'share',
  REVOKE_SHARE = 'revoke_share',

  // Extended operations
  PROCESS_IMAGE = 'process_image',
  GENERATE_THUMBNAIL = 'generate_thumbnail',
  GENERATE_SIGNED_URL = 'generate_signed_url',
  CLEANUP = 'cleanup',
  RESTORE = 'restore',

  // HTTP-level access tracking
  ACCESS_DENIED = 'access_denied',
  ACCESS_GRANTED = 'access_granted',
}
```

#### 5. **Duration vs Response Time**

- Renamed to `duration_ms` for clarity
- Measures total operation time (includes DB queries, file I/O, etc.)
- For HTTP requests, this is equivalent to response_time_ms

---

## 🔄 Migration Plan

### Phase 1: Create Enhanced Table ✅

1. **Create new migration** (after current migrations)
   - File: `20251102_enhance_file_audit_logs.ts`
   - Add new fields to existing `file_audit_logs`
   - Keep backward compatibility

2. **Fields to add:**

   ```sql
   ALTER TABLE file_audit_logs
     ADD COLUMN access_method VARCHAR(20),
     ADD COLUMN access_granted BOOLEAN,
     ADD COLUMN denial_reason VARCHAR(100),
     ADD COLUMN http_status INTEGER,
     ADD COLUMN auth_method VARCHAR(20),
     ADD COLUMN referer VARCHAR(1000),
     ADD COLUMN session_id VARCHAR(128),
     RENAME COLUMN duration TO duration_ms;

   -- Add new indexes
   CREATE INDEX idx_file_audit_logs_access_granted ON file_audit_logs(access_granted);
   CREATE INDEX idx_file_audit_logs_http_status ON file_audit_logs(http_status);
   CREATE INDEX idx_file_audit_logs_session ON file_audit_logs(session_id);
   ```

### Phase 2: Update Service Layer ✅

1. **Update AuditLogService**
   - Support new fields in log methods
   - Add HTTP context helpers
   - Add security context helpers

2. **Example usage:**

   ```typescript
   // Audit log with HTTP context
   await auditLog.logOperation(
     {
       fileId,
       userId,
       operation: 'download',
       success: true,
       access_granted: true,
       http_status: 200,
       access_method: 'web',
       auth_method: 'bearer',
       session_id: request.session.id,
       referer: request.headers.referer,
       duration_ms: 150,
       file_size: 2048000,
     },
     request,
   );

   // Denied access
   await auditLog.logOperation(
     {
       fileId,
       userId: null,
       operation: 'view',
       success: false,
       access_granted: false,
       http_status: 403,
       denial_reason: 'Insufficient permissions',
       auth_method: 'anonymous',
     },
     request,
   );
   ```

### Phase 3: Migrate Data (If Needed) 🔄

**If file_access_logs has existing data:**

```sql
-- Copy data from file_access_logs to file_audit_logs
INSERT INTO file_audit_logs (
  file_id, user_id, operation, timestamp,
  access_method, access_granted, denial_reason,
  http_status, auth_method, referer, session_id,
  ip_address, user_agent, file_size, metadata, created_at
)
SELECT
  file_id,
  accessed_by as user_id,
  access_type as operation,
  accessed_at as timestamp,
  access_method,
  access_granted,
  denial_reason,
  http_status,
  auth_method,
  referer,
  session_id::varchar as session_id,
  ip_address,
  user_agent,
  bytes_transferred as file_size,
  jsonb_build_object(
    'request_headers', request_headers,
    'migrated_from', 'file_access_logs'
  ) as metadata,
  created_at
FROM file_access_logs
WHERE created_at > NOW() - INTERVAL '30 days'  -- Only recent data
ORDER BY accessed_at;
```

### Phase 4: Remove file_access_logs ❌

1. **Verify migration**
   - Compare record counts
   - Spot-check data integrity
   - Test queries on new table

2. **Drop old table**

   ```sql
   DROP TABLE IF EXISTS file_access_logs CASCADE;
   ```

3. **Remove migration file**
   - Delete `019_create_file_access_logs_table.ts`
   - Update migration documentation

---

## ✅ Benefits of Merging

### 1. **Single Source of Truth**

- One table for all file-related auditing
- No confusion about which table to query
- Simplified analytics and reporting

### 2. **Comprehensive Context**

- Operation-level AND HTTP-level details
- Security AND performance tracking
- Compliance AND analytics in one place

### 3. **Reduced Complexity**

- One service to maintain
- One set of API endpoints
- One frontend interface
- Fewer database queries

### 4. **Better Performance**

- Single table = better query planning
- Shared indexes = more efficient
- No JOINs needed for file history

### 5. **Easier Compliance**

- All file events in one audit trail
- Simpler retention policies
- Single export for auditors

### 6. **Flexibility**

- Optional fields support multiple use cases
- JSONB metadata for extensibility
- Backward compatible with existing code

---

## ⚠️ Considerations

### 1. **Table Size**

- Combined table will be larger
- More indexes = more storage
- **Mitigation:** Implement data retention (90-365 days)

### 2. **Nullable Fields**

- Many fields optional (depending on operation)
- **Mitigation:** Use JSONB metadata for sparse data

### 3. **Index Overhead**

- 13 indexes = slower writes
- **Mitigation:** Async logging, batch inserts

### 4. **Migration Risk**

- Data migration from file_access_logs
- **Mitigation:** Test on staging, backup before migration

---

## 🎯 Implementation Checklist

- [x] **Analysis Complete** - This document
- [ ] **Create Migration** - `20251102_enhance_file_audit_logs.ts`
- [ ] **Update Service** - Enhanced AuditLogService
- [ ] **Update Schemas** - TypeBox validation schemas
- [ ] **Migrate Data** - If file_access_logs has data
- [ ] **Test Integration** - File upload/download operations
- [ ] **Remove Old Table** - Drop file_access_logs
- [ ] **Update Documentation** - API docs, developer guide
- [ ] **Deploy** - Run migration in production

---

## 📚 References

- Current `file_audit_logs`: `apps/api/src/database/migrations/20251028140200_create_file_audit_logs_table.ts`
- Current `file_access_logs`: `apps/api/src/database/migrations/019_create_file_access_logs_table.ts`
- Service stub: `apps/api/src/core/file-upload/services/audit-log.service.ts`
- Audit framework: `docs/development/audit-compliance-framework.md`

---

**Decision:** ✅ **Merge into enhanced file_audit_logs**

**Next Steps:** Create migration to add new fields to existing table

**Created:** 2025-11-02
**Last Updated:** 2025-11-02
**Status:** Ready for Implementation
