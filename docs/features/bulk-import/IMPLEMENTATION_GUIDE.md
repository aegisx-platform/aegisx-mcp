# Bulk Import Feature - Implementation Guide

> **📋 Complete implementation guide for adding Bulk Import to Authors module**
>
> **Status**: Ready for Implementation
> **Target Module**: Authors (Proof of Concept)
> **Estimated Time**: 4-6 hours
> **Difficulty**: Medium

---

## 🎯 Overview

This guide provides step-by-step instructions to implement Bulk Import functionality for the Authors module. Once proven working, these patterns will be extracted and integrated into the CRUD Generator.

### What We're Building

**3 Core Endpoints:**
1. `GET /api/authors/import/template` - Download Excel/CSV template
2. `POST /api/authors/import/validate` - Validate file (multipart upload)
3. `POST /api/authors/import/execute` - Execute import

**Key Features:**
- ✅ Excel/CSV file upload (multipart/form-data)
- ✅ Row-by-row validation with detailed errors
- ✅ Duplicate detection (email uniqueness)
- ✅ Business rule validation (email format, date not future)
- ✅ Session-based import (validate → review → execute)
- ✅ Type-safe with TypeBox schemas
- ✅ Reuses existing error codes from CRUD generator

---

## 📋 API Endpoints Specification

### Endpoint Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/authors/import/template` | Download import template (Excel/CSV) | ✅ Yes |
| `POST` | `/api/authors/import/validate` | Validate uploaded file | ✅ Yes |
| `POST` | `/api/authors/import/execute` | Execute validated import | ✅ Yes |

### Required Permissions

All endpoints require:
- **Authentication**: Valid JWT token
- **Authorization**: `authors.create` permission OR `admin` role

---

### 1️⃣ Download Import Template

**Endpoint:** `GET /api/authors/import/template`

**Description:** Download a pre-formatted Excel or CSV template with field instructions and optional example data.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `format` | string | No | `excel` | File format: `excel` or `csv` |
| `includeExample` | boolean | No | `true` | Include example rows in template |

**Request Example:**

```bash
# Download Excel template with examples
curl -X GET "http://localhost:3383/api/authors/import/template?format=excel&includeExample=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output authors-template.xlsx

# Download CSV template without examples
curl -X GET "http://localhost:3383/api/authors/import/template?format=csv&includeExample=false" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output authors-template.csv
```

**Response:**

- **Status Code:** `200 OK`
- **Content-Type:**
  - Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - CSV: `text/csv`
- **Content-Disposition:** `attachment; filename="authors-import-template.{xlsx|csv}"`
- **Body:** Binary file content

**Template Structure:**

Excel includes two sheets:
1. **Instructions Sheet** - Field descriptions and validation rules
2. **Data Sheet** - Headers and example rows (if includeExample=true)

CSV includes:
- Header row with field names
- Example data rows (if includeExample=true)

**Template Fields:**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `name` | string | ✅ Yes | Max 255 chars | `John Doe` |
| `email` | string | ✅ Yes | Valid email, unique | `john@example.com` |
| `bio` | text | No | - | `Award-winning author` |
| `birth_date` | date | No | YYYY-MM-DD, not future | `1980-05-15` |
| `country` | string | No | Max 100 chars | `USA` |
| `active` | boolean | No | true/false, default: true | `true` |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| `400` | `BAD_REQUEST` | Invalid format parameter |
| `401` | `UNAUTHORIZED` | Missing or invalid token |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `500` | `SERVER_ERROR` | Server error |

---

### 2️⃣ Validate Import File

**Endpoint:** `POST /api/authors/import/validate`

**Description:** Upload and validate Excel/CSV file. Returns validation results with row-by-row errors, warnings, and a session ID for import execution.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ Yes | Excel (.xlsx, .xls) or CSV (.csv) file |
| `options` | JSON string | No | Import options (see below) |

**Import Options Schema:**

```typescript
{
  skipDuplicates?: boolean;    // Skip rows with duplicate emails (default: true)
  continueOnError?: boolean;   // Continue processing after errors (default: true)
  updateExisting?: boolean;    // Update existing records instead of skip (default: false)
  dryRun?: boolean;           // Validate only, don't prepare for execution (default: true)
}
```

**Request Example:**

```bash
# Validate file with default options
curl -X POST "http://localhost:3383/api/authors/import/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@authors-data.xlsx"

# Validate with custom options
curl -X POST "http://localhost:3383/api/authors/import/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@authors-data.csv" \
  -F 'options={"skipDuplicates":false,"updateExisting":true}'
```

**Response Schema:**

```typescript
{
  success: true,
  data: {
    sessionId: string;           // Session ID for execute endpoint
    filename: string;            // Original filename
    totalRows: number;           // Total rows in file
    validRows: number;           // Rows with status='valid'
    invalidRows: number;         // Rows with status='error'
    summary: {
      toCreate: number;          // Rows to be created
      toUpdate: number;          // Rows to be updated
      toSkip: number;            // Rows to be skipped
      errors: number;            // Rows with errors
      warnings: number;          // Rows with warnings
    },
    preview: ImportRowPreview[]; // First 20 rows (detailed)
    expiresAt: string;           // Session expiry (ISO 8601)
  },
  message: "File validated successfully"
}
```

**ImportRowPreview Schema:**

```typescript
{
  rowNumber: number;             // Row number in file (1-indexed)
  status: 'valid' | 'warning' | 'error' | 'duplicate';
  action: 'create' | 'update' | 'skip';
  data: Record<string, any>;     // Row data
  errors: Array<{
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "authors-data.xlsx",
    "totalRows": 100,
    "validRows": 95,
    "invalidRows": 5,
    "summary": {
      "toCreate": 93,
      "toUpdate": 2,
      "toSkip": 5,
      "errors": 5,
      "warnings": 2
    },
    "preview": [
      {
        "rowNumber": 1,
        "status": "valid",
        "action": "create",
        "data": {
          "name": "John Doe",
          "email": "john@example.com",
          "bio": "Award-winning author",
          "birth_date": "1980-05-15",
          "country": "USA",
          "active": "true"
        },
        "errors": [],
        "warnings": []
      },
      {
        "rowNumber": 5,
        "status": "error",
        "action": "skip",
        "data": {
          "name": "",
          "email": "invalid-email",
          "birth_date": "2030-01-01"
        },
        "errors": [
          {
            "field": "name",
            "message": "Name is required",
            "code": "REQUIRED_FIELD_MISSING",
            "severity": "error"
          },
          {
            "field": "email",
            "message": "Email must be a valid email address",
            "code": "AUTHORS_INVALID_EMAIL_EMAIL",
            "severity": "error"
          },
          {
            "field": "birth_date",
            "message": "birth_date cannot be a future date",
            "code": "AUTHORS_INVALID_DATE_BIRTH_DATE",
            "severity": "error"
          }
        ],
        "warnings": []
      }
    ],
    "expiresAt": "2025-01-22T15:30:00.000Z"
  },
  "message": "File validated successfully"
}
```

**Validation Rules:**

| Field | Validation | Error Code | HTTP Status |
|-------|------------|------------|-------------|
| `name` | Required, not empty | `REQUIRED_FIELD_MISSING` | 400 |
| `email` | Required, not empty | `REQUIRED_FIELD_MISSING` | 400 |
| `email` | Valid email format | `AUTHORS_INVALID_EMAIL_EMAIL` | 422 |
| `email` | Unique in file | `DUPLICATE_IN_FILE` | 400 |
| `email` | Unique in database | `AUTHORS_DUPLICATE_EMAIL` | 409 |
| `birth_date` | Valid date format | `INVALID_DATE_FORMAT` | 400 |
| `birth_date` | Not future date | `AUTHORS_INVALID_DATE_BIRTH_DATE` | 422 |
| `active` | Boolean value | `INVALID_BOOLEAN` | 400 |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| `400` | `INVALID_FILE_FORMAT` | File format not supported (.xlsx, .xls, .csv only) |
| `400` | `BAD_REQUEST` | No file uploaded or invalid options |
| `401` | `UNAUTHORIZED` | Missing or invalid token |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `413` | `PAYLOAD_TOO_LARGE` | File size exceeds 10MB limit |
| `500` | `SERVER_ERROR` | Server error during validation |

**Session Management:**

- Session expires **30 minutes** after validation
- Session ID required for execute endpoint
- Sessions automatically cleaned up on expiry
- Production recommendation: Use Redis for session storage

---

### 3️⃣ Execute Import

**Endpoint:** `POST /api/authors/import/execute`

**Description:** Execute import using validated session. Creates/updates authors in database based on validation results.

**Content-Type:** `application/json`

**Request Body Schema:**

```typescript
{
  sessionId: string;    // Session ID from validate endpoint (required)
  options?: {
    skipDuplicates?: boolean;    // Skip duplicate emails
    continueOnError?: boolean;   // Continue after errors
    updateExisting?: boolean;    // Update existing records
  }
}
```

**Request Example:**

```bash
curl -X POST "http://localhost:3383/api/authors/import/execute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "options": {
      "skipDuplicates": true,
      "continueOnError": true,
      "updateExisting": false
    }
  }'
```

**Response Schema:**

```typescript
{
  success: true,
  data: {
    jobId: string;               // Import job ID
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial' | 'cancelled';
    progress: {
      current: number;           // Rows processed
      total: number;             // Total rows to process
      percentage: number;        // Completion percentage (0-100)
    },
    summary: {
      processed: number;         // Rows attempted
      successful: number;        // Successfully created/updated
      failed: number;            // Failed rows
      skipped: number;           // Skipped rows
      created?: number;          // Newly created records
      updated?: number;          // Updated records
    },
    errors?: Array<{
      rowNumber: number;
      data: Record<string, any>;
      error: string;
      code?: string;
    }>,
    startedAt: string;           // ISO 8601 timestamp
    completedAt?: string;        // ISO 8601 timestamp (when done)
    estimatedCompletion?: string;// Estimated completion time
    duration?: number;           // Duration in milliseconds
    errorReportUrl?: string;     // URL to download error report
  },
  message: "Import started successfully"
}
```

**Response Example (Started):**

```json
{
  "success": true,
  "data": {
    "jobId": "job_7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "status": "processing",
    "progress": {
      "current": 0,
      "total": 95,
      "percentage": 0
    },
    "summary": {
      "processed": 0,
      "successful": 0,
      "failed": 0,
      "skipped": 0,
      "created": 0,
      "updated": 0
    },
    "startedAt": "2025-01-22T14:00:00.000Z"
  },
  "message": "Import started successfully"
}
```

**Response Example (Completed):**

```json
{
  "success": true,
  "data": {
    "jobId": "job_7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "status": "completed",
    "progress": {
      "current": 95,
      "total": 95,
      "percentage": 100
    },
    "summary": {
      "processed": 95,
      "successful": 93,
      "failed": 2,
      "skipped": 0,
      "created": 91,
      "updated": 2
    },
    "errors": [
      {
        "rowNumber": 42,
        "data": { "name": "Test Author", "email": "test@example.com" },
        "error": "Database constraint violation",
        "code": "DATABASE_ERROR"
      }
    ],
    "startedAt": "2025-01-22T14:00:00.000Z",
    "completedAt": "2025-01-22T14:02:15.000Z",
    "duration": 135000
  }
}
```

**Job Status Values:**

| Status | Description |
|--------|-------------|
| `pending` | Job queued, not started |
| `processing` | Import in progress |
| `completed` | All rows processed successfully |
| `failed` | Import failed completely |
| `partial` | Completed with some errors |
| `cancelled` | Import cancelled by user |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| `400` | `SESSION_NOT_FOUND` | Invalid or expired session ID |
| `400` | `SESSION_EXPIRED` | Session expired (>30 minutes old) |
| `400` | `BAD_REQUEST` | Invalid request body |
| `401` | `UNAUTHORIZED` | Missing or invalid token |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `500` | `SERVER_ERROR` | Server error during import |

**Import Behavior:**

- **Asynchronous Processing**: Import runs in background, returns immediately with 202 Accepted
- **Error Handling**:
  - `continueOnError=true`: Continues processing after errors
  - `continueOnError=false`: Stops at first error
- **Duplicate Handling**:
  - `skipDuplicates=true`: Skip rows with duplicate emails
  - `updateExisting=true`: Update existing records instead of skip
- **Session Cleanup**: Session deleted after import starts

---

## 🔄 File Processing Flow

### High-Level Workflow

```
┌──────────────────┐
│  User uploads    │
│  Excel/CSV file  │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  1. UPLOAD & VALIDATE                   │
│  POST /api/authors/import/validate      │
│  ────────────────────────────────────   │
│  • Receive multipart/form-data          │
│  • Extract file stream & options        │
│  • Parse Excel/CSV to JSON rows         │
│  • Validate each row (business rules)   │
│  • Detect duplicates (file & database)  │
│  • Generate validation report           │
│  • Create session (30 min expiry)       │
│  • Return: sessionId + preview          │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  2. USER REVIEWS VALIDATION RESULTS     │
│  ────────────────────────────────────   │
│  • View summary (valid/errors/warnings) │
│  • Review row-by-row errors             │
│  • Decide to proceed or fix data        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  3. EXECUTE IMPORT                      │
│  POST /api/authors/import/execute       │
│  ────────────────────────────────────   │
│  • Verify sessionId (not expired)       │
│  • Retrieve validated rows from session │
│  • Process rows (create/update/skip)    │
│  • Track progress (percentage)          │
│  • Collect errors during execution      │
│  • Return: jobId + progress             │
│  • Cleanup: delete session after start  │
└────────┬────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Import Complete │
│  (Authors in DB) │
└──────────────────┘
```

---

### Detailed Flow: Upload & Validate

#### Step 1: File Upload (Multipart)

```typescript
// Controller receives multipart request
const data = await request.file(); // @fastify/multipart plugin

// Extract file components
const fileStream: Readable = data.file;      // File content stream
const filename: string = data.filename;       // Original filename
const optionsField = request.body?.['options']; // JSON string (optional)
const options = optionsField ? JSON.parse(optionsField) : {};
```

**File Upload Limits:**
- Maximum file size: **10 MB**
- Maximum files per request: **1**
- Supported formats: `.xlsx`, `.xls`, `.csv`

#### Step 2: File Format Validation

```typescript
// Check file extension
const ext = filename.split('.').pop()?.toLowerCase();

if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
  throw new Error('INVALID_FILE_FORMAT');
}
```

**Error Handling:**
- **Invalid format** → 400 Bad Request + `INVALID_FILE_FORMAT` code
- **File too large** → 413 Payload Too Large
- **No file uploaded** → 400 Bad Request

#### Step 3: File Parsing

**For Excel files (.xlsx, .xls):**

```typescript
// 1. Stream to Buffer
const buffer = await streamToBuffer(fileStream);

// 2. Parse with xlsx library
const workbook = XLSX.read(buffer);
const sheetName = workbook.SheetNames[0]; // First sheet
const sheet = workbook.Sheets[sheetName];

// 3. Convert to JSON
const rows = XLSX.utils.sheet_to_json(sheet);
// Result: [{ name: "John", email: "john@example.com", ... }, ...]
```

**For CSV files (.csv):**

```typescript
// 1. Stream directly to csv-parser
const rows: any[] = [];

await new Promise((resolve, reject) => {
  fileStream
    .pipe(csv())                    // Parse CSV stream
    .on('data', (row) => rows.push(row))  // Collect rows
    .on('end', () => resolve(rows))       // Complete
    .on('error', reject);                 // Error handling
});

// Result: [{ name: "John", email: "john@example.com", ... }, ...]
```

**Parsing Output:**
- **Headers**: Column names become object keys
- **Data types**: All values initially strings (need type conversion)
- **Empty cells**: Represented as empty strings or undefined

#### Step 4: Row-by-Row Validation

**Validation Loop:**

```typescript
const validatedRows: ImportRowPreview[] = [];
const seenEmails = new Set<string>(); // Track duplicates within file

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const rowNumber = i + 1; // 1-indexed for user display

  // Validate single row
  const validation = await validateRow(row, rowNumber, seenEmails, options);

  validatedRows.push(validation);

  // Track email for next iteration
  if (row.email && validation.status !== 'error') {
    seenEmails.add(row.email.toLowerCase());
  }
}
```

**Single Row Validation Logic:**

```typescript
async function validateRow(
  row: any,
  rowNumber: number,
  seenEmails: Set<string>,
  options: ImportOptions
): Promise<ImportRowPreview> {
  const errors: ErrorDetail[] = [];
  const warnings: WarningDetail[] = [];

  // ═══ 1. REQUIRED FIELD VALIDATION ═══
  if (!row.name || row.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Name is required',
      code: 'REQUIRED_FIELD_MISSING',
      severity: 'error'
    });
  }

  if (!row.email || row.email.trim() === '') {
    errors.push({
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED_FIELD_MISSING',
      severity: 'error'
    });
  }

  // ═══ 2. FORMAT VALIDATION (if provided) ═══
  if (row.email) {
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
      errors.push({
        field: 'email',
        message: AuthorsErrorMessages[AuthorsErrorCode.INVALID_EMAIL_EMAIL],
        code: AuthorsErrorCode.INVALID_EMAIL_EMAIL, // 'AUTHORS_INVALID_EMAIL_EMAIL'
        severity: 'error'
      });
    }
  }

  // ═══ 3. DUPLICATE DETECTION ═══
  if (row.email) {
    // A. Duplicate within file
    if (seenEmails.has(row.email.toLowerCase())) {
      errors.push({
        field: 'email',
        message: 'Email already exists in file',
        code: 'DUPLICATE_IN_FILE',
        severity: 'error'
      });
    }

    // B. Duplicate in database
    const existing = await repository.findByEmail(row.email);
    if (existing) {
      if (options.updateExisting) {
        // Will update → warning
        warnings.push({
          field: 'email',
          message: 'Email exists - will update existing record',
          code: 'DUPLICATE_IN_DATABASE'
        });
      } else if (options.skipDuplicates) {
        // Will skip → warning
        warnings.push({
          field: 'email',
          message: 'Email exists - will skip',
          code: 'DUPLICATE_IN_DATABASE'
        });
      } else {
        // Duplicate not allowed → error
        errors.push({
          field: 'email',
          message: AuthorsErrorMessages[AuthorsErrorCode.DUPLICATE_EMAIL],
          code: AuthorsErrorCode.DUPLICATE_EMAIL, // 'AUTHORS_DUPLICATE_EMAIL'
          severity: 'error'
        });
      }
    }
  }

  // ═══ 4. BUSINESS RULE VALIDATION ═══
  if (row.birth_date) {
    const birthDate = new Date(row.birth_date);

    // Invalid date format
    if (isNaN(birthDate.getTime())) {
      errors.push({
        field: 'birth_date',
        message: 'Invalid date format',
        code: 'INVALID_DATE_FORMAT',
        severity: 'error'
      });
    }
    // Future date not allowed
    else if (birthDate > new Date()) {
      errors.push({
        field: 'birth_date',
        message: AuthorsErrorMessages[AuthorsErrorCode.INVALID_DATE_BIRTH_DATE],
        code: AuthorsErrorCode.INVALID_DATE_BIRTH_DATE, // 'AUTHORS_INVALID_DATE_BIRTH_DATE'
        severity: 'error'
      });
    }
  }

  // Boolean validation
  if (row.active !== undefined && row.active !== null) {
    const activeStr = String(row.active).toLowerCase();
    if (!['true', 'false', '1', '0', 'yes', 'no'].includes(activeStr)) {
      errors.push({
        field: 'active',
        message: 'Invalid boolean value (use true/false)',
        code: 'INVALID_BOOLEAN',
        severity: 'error'
      });
    }
  }

  // ═══ 5. DETERMINE STATUS & ACTION ═══
  let status: 'valid' | 'warning' | 'error' | 'duplicate' = 'valid';
  let action: 'create' | 'update' | 'skip' = 'create';

  if (errors.length > 0) {
    status = 'error';
    action = 'skip';
  } else if (warnings.length > 0) {
    status = 'warning';
    const hasDuplicate = warnings.some(w => w.code === 'DUPLICATE_IN_DATABASE');
    if (hasDuplicate) {
      action = options.updateExisting ? 'update' : 'skip';
    }
  }

  return {
    rowNumber,
    status,
    action,
    data: row,
    errors,
    warnings
  };
}
```

**Validation Outcome by Status:**

| Status | Meaning | Action | Description |
|--------|---------|--------|-------------|
| `valid` | No errors or warnings | `create` | Row will be inserted |
| `warning` | Has warnings but no errors | `create` or `update` | Proceeds with caution |
| `error` | Has validation errors | `skip` | Row will be skipped |
| `duplicate` | Duplicate detected | `skip` or `update` | Based on options |

#### Step 5: Summary Calculation

```typescript
function calculateSummary(rows: ImportRowPreview[]) {
  return {
    toCreate: rows.filter(r => r.action === 'create').length,
    toUpdate: rows.filter(r => r.action === 'update').length,
    toSkip: rows.filter(r => r.action === 'skip').length,
    errors: rows.filter(r => r.status === 'error').length,
    warnings: rows.filter(r => r.status === 'warning').length
  };
}

// Example output:
// {
//   toCreate: 93,
//   toUpdate: 2,
//   toSkip: 5,
//   errors: 5,
//   warnings: 2
// }
```

#### Step 6: Session Creation

```typescript
// Generate unique session ID
const sessionId = uuidv4(); // e.g., '550e8400-e29b-41d4-a716-446655440000'

// Create session object
const session: ImportSession = {
  sessionId,
  filename,
  validatedData: validatedRows, // Full validation results
  summary,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
};

// Store in memory (or Redis in production)
sessionStore.set(sessionId, session);

// Cleanup expired sessions
cleanupExpiredSessions();
```

**Session Storage:**
- **Development**: In-memory Map (lost on server restart)
- **Production**: Redis with TTL (recommended)
- **Expiry**: 30 minutes from validation
- **Cleanup**: Automatic removal of expired sessions

#### Step 7: Response Generation

```typescript
return {
  sessionId,
  filename,
  totalRows: rows.length,
  validRows: validatedRows.filter(r => r.status === 'valid').length,
  invalidRows: validatedRows.filter(r => r.status === 'error').length,
  summary,
  preview: validatedRows.slice(0, 20), // First 20 rows only
  expiresAt: session.expiresAt.toISOString()
};
```

**Preview Limitation:**
- Only **first 20 rows** returned in preview
- Full validation stored in session
- Reduces response payload size

---

### Detailed Flow: Execute Import

#### Step 1: Session Retrieval & Validation

```typescript
// Retrieve session
const session = sessionStore.get(sessionId);

if (!session) {
  throw new Error('SESSION_NOT_FOUND');
}

if (session.expiresAt < new Date()) {
  sessionStore.delete(sessionId);
  throw new Error('SESSION_EXPIRED');
}
```

**Session Validation:**
- **Not found** → 400 Bad Request + `SESSION_NOT_FOUND` code
- **Expired** → 400 Bad Request + `SESSION_EXPIRED` code (session deleted)
- **Valid** → Proceed with import

#### Step 2: Job Initialization

```typescript
const jobId = uuidv4();

const job: ImportJob = {
  jobId,
  status: 'processing',
  progress: {
    current: 0,
    total: session.validatedData.length,
    percentage: 0
  },
  summary: {
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    created: 0,
    updated: 0
  },
  startedAt: new Date().toISOString()
};
```

**Job Object:**
- **jobId**: Unique identifier for tracking
- **status**: Current state (`processing`, `completed`, `failed`, `partial`)
- **progress**: Real-time progress tracking
- **summary**: Cumulative statistics

#### Step 3: Asynchronous Processing

```typescript
// Start async processing (non-blocking)
processImport(job, session, options).catch(error => {
  console.error('Import failed:', error);
});

// Return immediately with 202 Accepted
return job; // { jobId, status: 'processing', ... }
```

**Async Benefits:**
- **Non-blocking**: User gets immediate response
- **Background processing**: Import runs independently
- **Scalability**: Server can handle multiple imports

#### Step 4: Row Processing Loop

```typescript
async function processImport(
  job: ImportJob,
  session: ImportSession,
  options: ImportOptions
) {
  const errors: any[] = [];

  for (const row of session.validatedData) {
    // Skip rows marked for skipping
    if (row.action === 'skip') {
      job.summary.skipped++;
      continue;
    }

    try {
      if (row.action === 'create') {
        // Insert new record
        await service.create(transformRowToDto(row.data));
        job.summary.created!++;
        job.summary.successful++;
      }
      else if (row.action === 'update') {
        // Update existing record
        const existing = await repository.findByEmail(row.data.email);
        if (existing) {
          await service.update(existing.id, transformRowToDto(row.data));
          job.summary.updated!++;
          job.summary.successful++;
        }
      }
    } catch (error: any) {
      // Record error
      job.summary.failed++;
      errors.push({
        rowNumber: row.rowNumber,
        data: row.data,
        error: error.message,
        code: error.code
      });

      // Stop on first error if continueOnError=false
      if (!options.continueOnError) {
        break;
      }
    }

    // Update progress
    job.summary.processed++;
    job.progress.current++;
    job.progress.percentage = Math.round(
      (job.progress.current / job.progress.total) * 100
    );
  }

  // Finalize job
  job.status = errors.length === 0 ? 'completed' : 'partial';
  job.completedAt = new Date().toISOString();
  job.errors = errors;

  // Cleanup session
  sessionStore.delete(session.sessionId);
}
```

**Processing Modes:**
- **`continueOnError: true`**: Process all rows, collect errors
- **`continueOnError: false`**: Stop at first error
- **Progress tracking**: Updated after each row

#### Step 5: Data Transformation

```typescript
function transformRowToDto(row: any): CreateAuthors {
  return {
    name: row.name,
    email: row.email,
    bio: row.bio || undefined,
    birth_date: row.birth_date || undefined,
    country: row.country || undefined,
    active: row.active !== undefined
      ? ['true', '1', 'yes'].includes(String(row.active).toLowerCase())
      : undefined
  };
}
```

**Type Conversions:**
- **Strings** → Trim whitespace
- **Booleans** → Parse from string values (`true`, `1`, `yes` → true)
- **Dates** → Convert string to Date object
- **Undefined values** → Keep as undefined (use defaults)

#### Step 6: Job Completion & Cleanup

```typescript
// Set final status
job.status = errors.length === 0 ? 'completed' : 'partial';
job.completedAt = new Date().toISOString();
job.duration = Date.now() - new Date(job.startedAt).getTime();
job.errors = errors;

// Delete session (no longer needed)
sessionStore.delete(session.sessionId);
```

**Final Job Status:**
| Status | Condition |
|--------|-----------|
| `completed` | All rows processed successfully (errors.length === 0) |
| `partial` | Some rows failed (errors.length > 0) |
| `failed` | Import completely failed (thrown exception) |

---

## 📊 Authors Table Structure

```typescript
// From migration: 20251004130000_create_authors_table.ts
{
  id: uuid (PK, auto-generated)
  name: string(255) - required
  email: string(255) - required, unique ← DUPLICATE CHECK
  bio: text - optional
  birth_date: date - optional ← BUSINESS RULE: not future
  country: string(100) - optional
  active: boolean - optional (default: true)
  created_at: timestamp - auto
  updated_at: timestamp - auto
}
```

**Import Fields (exclude auto-generated):**
- name, email, bio, birth_date, country, active

---

## 📦 Step 1: Install Dependencies

```bash
# Excel/CSV parsing
pnpm add xlsx csv-parser

# File upload handling
pnpm add @fastify/multipart

# Types
pnpm add -D @types/xlsx
```

**Register multipart plugin:**

```typescript
// apps/api/src/app.ts
import multipart from '@fastify/multipart';

// Register before routes
await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});
```

---

## 📄 Step 2: Import Schemas (✅ Already Done)

Location: `apps/api/src/modules/authors/schemas/authors.schemas.ts`

**Added Schemas:**
- `ImportOptionsSchema` - Import configuration
- `ImportRowPreviewSchema` - Single row validation result
- `ImportSummarySchema` - Overall statistics
- `ValidateImportResponseSchema` - Validation response
- `ExecuteImportRequestSchema` - Execute request
- `ImportJobSchema` - Import job status
- Response wrappers with API success format

**Types Exported:**
```typescript
export type ImportOptions = Static<typeof ImportOptionsSchema>;
export type ImportRowPreview = Static<typeof ImportRowPreviewSchema>;
export type ValidateImportResponse = Static<typeof ValidateImportResponseSchema>;
export type ExecuteImportRequest = Static<typeof ExecuteImportRequestSchema>;
export type ImportJob = Static<typeof ImportJobSchema>;
```

---

## 🛣️ Step 3: Add Import Routes

**File:** `apps/api/src/modules/authors/routes/import.routes.ts` (NEW FILE)

```typescript
import { FastifyInstance } from 'fastify';
import { AuthorsController } from '../controllers/authors.controller';
import {
  ValidateImportApiResponseSchema,
  ExecuteImportApiResponseSchema,
  ExecuteImportRequestSchema,
} from '../schemas/authors.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export async function authorsImportRoutes(
  fastify: FastifyInstance,
  options: { controller: AuthorsController }
) {
  const { controller } = options;

  // Download import template
  fastify.get('/import/template', {
    schema: {
      tags: ['Authors', 'Import'],
      summary: 'Download import template',
      description: 'Download Excel/CSV template for authors import',
      querystring: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['csv', 'excel'],
            default: 'excel',
          },
          includeExample: {
            type: 'boolean',
            default: true,
          },
        },
      },
      response: {
        200: {
          description: 'Template file download',
          type: 'string',
          format: 'binary',
        },
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.create', 'admin']),
    ],
    handler: controller.downloadImportTemplate.bind(controller),
  });

  // Validate import file
  fastify.post('/import/validate', {
    schema: {
      tags: ['Authors', 'Import'],
      summary: 'Validate import file',
      description: 'Upload and validate Excel/CSV file before import',
      consumes: ['multipart/form-data'],
      response: {
        200: ValidateImportApiResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        413: SchemaRefs.PayloadTooLarge,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.create', 'admin']),
    ],
    handler: controller.validateImport.bind(controller),
  });

  // Execute import
  fastify.post('/import/execute', {
    schema: {
      tags: ['Authors', 'Import'],
      summary: 'Execute import',
      description: 'Execute validated import',
      body: ExecuteImportRequestSchema,
      response: {
        202: ExecuteImportApiResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.create', 'admin']),
    ],
    handler: controller.executeImport.bind(controller),
  });
}
```

**Register in main routes:**

```typescript
// apps/api/src/modules/authors/routes/index.ts
import { authorsImportRoutes } from './import.routes';

export async function authorsRoutes(fastify: FastifyInstance) {
  const controller = new AuthorsController(fastify);

  // ... existing routes ...

  // Register import routes
  await fastify.register(authorsImportRoutes, {
    controller,
  });
}
```

---

## 🎮 Step 4: Add Controller Methods

**File:** `apps/api/src/modules/authors/controllers/authors.controller.ts`

Add these methods to the existing controller:

```typescript
import { AuthorsImportService } from '../services/authors-import.service';

export class AuthorsController {
  private authorsRepository: AuthorsRepository;
  private authorsService: AuthorsService;
  private importService: AuthorsImportService; // NEW

  constructor(fastify: FastifyInstance) {
    this.authorsRepository = new AuthorsRepository(fastify.knex);
    this.authorsService = new AuthorsService(this.authorsRepository);
    this.importService = new AuthorsImportService(
      this.authorsRepository,
      this.authorsService
    ); // NEW
  }

  // ===== IMPORT METHODS =====

  /**
   * Download import template
   * GET /api/authors/import/template
   */
  async downloadImportTemplate(
    request: FastifyRequest<{
      Querystring: { format?: string; includeExample?: boolean };
    }>,
    reply: FastifyReply
  ) {
    const { format = 'excel', includeExample = true } = request.query;

    const file = await this.importService.generateTemplate(
      format as 'excel' | 'csv',
      includeExample
    );

    const filename =
      format === 'excel'
        ? 'authors-import-template.xlsx'
        : 'authors-import-template.csv';

    const contentType =
      format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';

    return reply
      .header('Content-Type', contentType)
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(file);
  }

  /**
   * Validate import file
   * POST /api/authors/import/validate
   */
  async validateImport(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      // Get uploaded file
      const data = await request.file();

      if (!data) {
        return reply.badRequest('No file uploaded');
      }

      // Get options from form field (if provided)
      const optionsField = request.body?.['options'];
      const options = optionsField ? JSON.parse(optionsField) : {};

      // Validate file
      const result = await this.importService.validateFile(
        data.file,
        data.filename,
        options
      );

      return reply.success(result, 'File validated successfully');
    } catch (error: any) {
      request.log.error(error);

      if (error.code === 'INVALID_FILE_FORMAT') {
        return reply.badRequest(error.message);
      }

      if (error.code === 'FILE_TOO_LARGE') {
        return reply.payloadTooLarge(error.message);
      }

      throw error;
    }
  }

  /**
   * Execute import
   * POST /api/authors/import/execute
   */
  async executeImport(
    request: FastifyRequest<{
      Body: ExecuteImportRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { sessionId, options = {} } = request.body;

      // Execute import
      const job = await this.importService.executeImport(sessionId, options);

      return reply.code(202).send({
        success: true,
        data: job,
        message: 'Import started successfully',
      });
    } catch (error: any) {
      request.log.error(error);

      if (error.code === 'SESSION_EXPIRED' || error.code === 'SESSION_NOT_FOUND') {
        return reply.badRequest(error.message);
      }

      throw error;
    }
  }
}
```

---

## 🔧 Step 5: Create Import Service

**File:** `apps/api/src/modules/authors/services/authors-import.service.ts` (NEW FILE)

```typescript
import { Readable } from 'stream';
import XLSX from 'xlsx';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { AuthorsRepository } from '../repositories/authors.repository';
import { AuthorsService } from './authors.service';
import {
  ImportOptions,
  ImportRowPreview,
  ValidateImportResponse,
  ImportJob,
  CreateAuthors,
  AuthorsErrorCode,
  AuthorsErrorMessages,
} from '../schemas/authors.schemas';

interface ImportSession {
  sessionId: string;
  filename: string;
  validatedData: ImportRowPreview[];
  summary: {
    toCreate: number;
    toUpdate: number;
    toSkip: number;
    errors: number;
    warnings: number;
  };
  createdAt: Date;
  expiresAt: Date;
}

// In-memory session storage (use Redis in production)
const sessionStore = new Map<string, ImportSession>();

export class AuthorsImportService {
  constructor(
    private repository: AuthorsRepository,
    private service: AuthorsService
  ) {}

  /**
   * Generate import template
   */
  async generateTemplate(
    format: 'excel' | 'csv',
    includeExample: boolean
  ): Promise<Buffer> {
    const headers = [
      'name',
      'email',
      'bio',
      'birth_date',
      'country',
      'active',
    ];

    const exampleRows = includeExample
      ? [
          {
            name: 'John Doe',
            email: 'john.doe@example.com',
            bio: 'Award-winning author',
            birth_date: '1980-05-15',
            country: 'USA',
            active: 'true',
          },
          {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            bio: 'Bestselling novelist',
            birth_date: '1975-08-22',
            country: 'UK',
            active: 'true',
          },
        ]
      : [];

    if (format === 'excel') {
      return this.generateExcelTemplate(headers, exampleRows);
    } else {
      return this.generateCsvTemplate(headers, exampleRows);
    }
  }

  private generateExcelTemplate(
    headers: string[],
    examples: any[]
  ): Buffer {
    const workbook = XLSX.utils.book_new();

    // Instructions sheet
    const instructions = [
      ['Authors Import Template'],
      [],
      ['Required Fields:'],
      ['- name: Author full name (required)'],
      ['- email: Email address (required, unique)'],
      [],
      ['Optional Fields:'],
      ['- bio: Biography text'],
      ['- birth_date: Date of birth (YYYY-MM-DD, must not be future)'],
      ['- country: Country name'],
      ['- active: Active status (true/false, default: true)'],
      [],
      ['Notes:'],
      ['- Maximum 1000 rows per import'],
      ['- File size limit: 10MB'],
      ['- Duplicate emails will be skipped or updated (based on options)'],
      ['- Date format: YYYY-MM-DD'],
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Data sheet
    const dataSheet = XLSX.utils.json_to_sheet(examples, {
      header: headers,
    });
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');

    // Convert to buffer
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  private generateCsvTemplate(headers: string[], examples: any[]): Buffer {
    const rows = [headers];

    examples.forEach((example) => {
      rows.push(headers.map((header) => example[header] || ''));
    });

    const csv = rows.map((row) => row.join(',')).join('\n');
    return Buffer.from(csv, 'utf-8');
  }

  /**
   * Validate uploaded file
   */
  async validateFile(
    fileStream: Readable,
    filename: string,
    options: ImportOptions = {}
  ): Promise<ValidateImportResponse> {
    // Check file format
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      const error: any = new Error(
        'Invalid file format. Please upload .csv or .xlsx file'
      );
      error.code = 'INVALID_FILE_FORMAT';
      throw error;
    }

    // Parse file
    const rows = await this.parseFile(fileStream, ext || 'csv');

    // Validate rows
    const validatedRows = await this.validateRows(rows, options);

    // Calculate summary
    const summary = this.calculateSummary(validatedRows);

    // Create session
    const sessionId = uuidv4();
    const session: ImportSession = {
      sessionId,
      filename,
      validatedData: validatedRows,
      summary,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };

    sessionStore.set(sessionId, session);

    // Clean up expired sessions
    this.cleanupExpiredSessions();

    return {
      sessionId,
      filename,
      totalRows: rows.length,
      validRows: validatedRows.filter((r) => r.status === 'valid').length,
      invalidRows: validatedRows.filter((r) => r.status === 'error').length,
      summary,
      preview: validatedRows.slice(0, 20), // First 20 rows for preview
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  private async parseFile(
    stream: Readable,
    format: string
  ): Promise<any[]> {
    if (format === 'csv') {
      return this.parseCsv(stream);
    } else {
      return this.parseExcel(stream);
    }
  }

  private async parseCsv(stream: Readable): Promise<any[]> {
    const rows: any[] = [];

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }

  private async parseExcel(stream: Readable): Promise<any[]> {
    const buffer = await this.streamToBuffer(stream);
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Validate each row
   */
  private async validateRows(
    rows: any[],
    options: ImportOptions
  ): Promise<ImportRowPreview[]> {
    const results: ImportRowPreview[] = [];
    const seenEmails = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;

      const validation = await this.validateRow(
        row,
        rowNumber,
        seenEmails,
        options
      );

      results.push(validation);

      // Track emails for duplicate detection within file
      if (row.email && validation.status !== 'error') {
        seenEmails.add(row.email.toLowerCase());
      }
    }

    return results;
  }

  private async validateRow(
    row: any,
    rowNumber: number,
    seenEmails: Set<string>,
    options: ImportOptions
  ): Promise<ImportRowPreview> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Validate required: name
    if (!row.name || row.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Name is required',
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error',
      });
    }

    // Validate required: email
    if (!row.email || row.email.trim() === '') {
      errors.push({
        field: 'email',
        message: 'Email is required',
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error',
      });
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push({
          field: 'email',
          message: AuthorsErrorMessages[AuthorsErrorCode.INVALID_EMAIL_EMAIL],
          code: AuthorsErrorCode.INVALID_EMAIL_EMAIL,
          severity: 'error',
        });
      }

      // Check duplicate in file
      if (seenEmails.has(row.email.toLowerCase())) {
        errors.push({
          field: 'email',
          message: `Email already exists in file`,
          code: 'DUPLICATE_IN_FILE',
          severity: 'error',
        });
      }

      // Check duplicate in database
      const existing = await this.repository.findByEmail(row.email);
      if (existing) {
        if (options.updateExisting) {
          warnings.push({
            field: 'email',
            message: 'Email exists - will update existing record',
            code: 'DUPLICATE_IN_DATABASE',
          });
        } else if (options.skipDuplicates) {
          warnings.push({
            field: 'email',
            message: 'Email exists - will skip',
            code: 'DUPLICATE_IN_DATABASE',
          });
        } else {
          errors.push({
            field: 'email',
            message: AuthorsErrorMessages[AuthorsErrorCode.DUPLICATE_EMAIL],
            code: AuthorsErrorCode.DUPLICATE_EMAIL,
            severity: 'error',
          });
        }
      }
    }

    // Validate birth_date (business rule: not future)
    if (row.birth_date) {
      const birthDate = new Date(row.birth_date);
      if (isNaN(birthDate.getTime())) {
        errors.push({
          field: 'birth_date',
          message: 'Invalid date format',
          code: 'INVALID_DATE_FORMAT',
          severity: 'error',
        });
      } else if (birthDate > new Date()) {
        errors.push({
          field: 'birth_date',
          message:
            AuthorsErrorMessages[AuthorsErrorCode.INVALID_DATE_BIRTH_DATE],
          code: AuthorsErrorCode.INVALID_DATE_BIRTH_DATE,
          severity: 'error',
        });
      }
    }

    // Validate active (boolean)
    if (row.active !== undefined && row.active !== null) {
      const activeStr = String(row.active).toLowerCase();
      if (!['true', 'false', '1', '0', 'yes', 'no'].includes(activeStr)) {
        errors.push({
          field: 'active',
          message: 'Invalid boolean value (use true/false)',
          code: 'INVALID_BOOLEAN',
          severity: 'error',
        });
      }
    }

    // Determine status and action
    let status: 'valid' | 'warning' | 'error' | 'duplicate' = 'valid';
    let action: 'create' | 'update' | 'skip' = 'create';

    if (errors.length > 0) {
      status = 'error';
      action = 'skip';
    } else if (warnings.length > 0) {
      status = 'warning';
      const hasDuplicate = warnings.some((w) => w.code === 'DUPLICATE_IN_DATABASE');
      if (hasDuplicate) {
        action = options.updateExisting ? 'update' : 'skip';
      }
    }

    return {
      rowNumber,
      status,
      action,
      data: row,
      errors,
      warnings,
    };
  }

  private calculateSummary(rows: ImportRowPreview[]) {
    return {
      toCreate: rows.filter((r) => r.action === 'create').length,
      toUpdate: rows.filter((r) => r.action === 'update').length,
      toSkip: rows.filter((r) => r.action === 'skip').length,
      errors: rows.filter((r) => r.status === 'error').length,
      warnings: rows.filter((r) => r.status === 'warning').length,
    };
  }

  /**
   * Execute import
   */
  async executeImport(
    sessionId: string,
    options: Omit<ImportOptions, 'dryRun'>
  ): Promise<ImportJob> {
    // Get session
    const session = sessionStore.get(sessionId);
    if (!session) {
      const error: any = new Error('Import session not found or expired');
      error.code = 'SESSION_NOT_FOUND';
      throw error;
    }

    if (session.expiresAt < new Date()) {
      sessionStore.delete(sessionId);
      const error: any = new Error('Import session expired');
      error.code = 'SESSION_EXPIRED';
      throw error;
    }

    // Create job
    const jobId = uuidv4();
    const job: ImportJob = {
      jobId,
      status: 'processing',
      progress: {
        current: 0,
        total: session.validatedData.length,
        percentage: 0,
      },
      summary: {
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        created: 0,
        updated: 0,
      },
      startedAt: new Date().toISOString(),
    };

    // Execute import (async - in background)
    this.processImport(job, session, options).catch((error) => {
      console.error('Import failed:', error);
    });

    return job;
  }

  private async processImport(
    job: ImportJob,
    session: ImportSession,
    options: Omit<ImportOptions, 'dryRun'>
  ) {
    const errors: any[] = [];

    for (const row of session.validatedData) {
      if (row.action === 'skip') {
        job.summary.skipped++;
        continue;
      }

      try {
        if (row.action === 'create') {
          await this.service.create(this.transformRowToDto(row.data));
          job.summary.created!++;
          job.summary.successful++;
        } else if (row.action === 'update') {
          const existing = await this.repository.findByEmail(row.data.email);
          if (existing) {
            await this.service.update(existing.id, this.transformRowToDto(row.data));
            job.summary.updated!++;
            job.summary.successful++;
          }
        }
      } catch (error: any) {
        job.summary.failed++;
        errors.push({
          rowNumber: row.rowNumber,
          data: row.data,
          error: error.message,
          code: error.code,
        });

        if (!options.continueOnError) {
          break;
        }
      }

      job.summary.processed++;
      job.progress.current++;
      job.progress.percentage = Math.round(
        (job.progress.current / job.progress.total) * 100
      );
    }

    // Complete job
    job.status = errors.length === 0 ? 'completed' : 'partial';
    job.completedAt = new Date().toISOString();
    job.errors = errors;

    // Cleanup session
    sessionStore.delete(session.sessionId);
  }

  private transformRowToDto(row: any): CreateAuthors {
    return {
      name: row.name,
      email: row.email,
      bio: row.bio || undefined,
      birth_date: row.birth_date || undefined,
      country: row.country || undefined,
      active:
        row.active !== undefined
          ? ['true', '1', 'yes'].includes(String(row.active).toLowerCase())
          : undefined,
    };
  }

  private cleanupExpiredSessions() {
    const now = new Date();
    for (const [sessionId, session] of sessionStore.entries()) {
      if (session.expiresAt < now) {
        sessionStore.delete(sessionId);
      }
    }
  }
}
```

---

## ✅ Implementation Checklist

### Phase 1: Setup (30 min)

- [ ] Install dependencies: `pnpm add xlsx csv-parser @fastify/multipart`
- [ ] Install types: `pnpm add -D @types/xlsx`
- [ ] Register multipart plugin in `apps/api/src/app.ts`
- [ ] Verify schemas added to `authors.schemas.ts` (already done ✅)

### Phase 2: Routes (30 min)

- [ ] Create `apps/api/src/modules/authors/routes/import.routes.ts`
- [ ] Add 3 route handlers (template, validate, execute)
- [ ] Register import routes in `apps/api/src/modules/authors/routes/index.ts`
- [ ] Test route registration: `nx build api` (should compile)

### Phase 3: Controller (45 min)

- [ ] Add import service to controller constructor
- [ ] Implement `downloadImportTemplate()` method
- [ ] Implement `validateImport()` method with file upload handling
- [ ] Implement `executeImport()` method
- [ ] Test compilation: `nx build api`

### Phase 4: Service (2 hours)

- [ ] Create `apps/api/src/modules/authors/services/authors-import.service.ts`
- [ ] Implement template generation (Excel + CSV)
- [ ] Implement file parsing (Excel + CSV)
- [ ] Implement row validation with error codes reuse
- [ ] Implement session management
- [ ] Implement import execution
- [ ] Test compilation: `nx build api`

### Phase 5: Testing (1.5 hours)

- [ ] Create test Excel file with sample data
- [ ] Test download template: `GET /api/authors/import/template`
- [ ] Test validate with valid data
- [ ] Test validate with duplicate email
- [ ] Test validate with invalid email format
- [ ] Test validate with future birth_date
- [ ] Test execute import
- [ ] Verify data imported correctly in database

### Phase 6: Documentation (30 min)

- [ ] Document API endpoints in OpenAPI/Swagger
- [ ] Create test cases documentation
- [ ] Extract patterns for CRUD generator
- [ ] Update feature tracking

---

## 🧪 Testing Guide

### Test 1: Download Template

```bash
curl -X GET "http://localhost:3383/api/authors/import/template?format=excel&includeExample=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output authors-template.xlsx
```

**Expected:** Download `authors-template.xlsx` with instructions and example data.

### Test 2: Validate Valid File

Create `authors-test.csv`:
```csv
name,email,bio,birth_date,country,active
John Doe,john@example.com,Award-winning author,1980-05-15,USA,true
Jane Smith,jane@example.com,Bestselling novelist,1975-08-22,UK,true
```

```bash
curl -X POST "http://localhost:3383/api/authors/import/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@authors-test.csv" \
  -F 'options={"skipDuplicates":true,"continueOnError":true}'
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123...",
    "filename": "authors-test.csv",
    "totalRows": 2,
    "validRows": 2,
    "invalidRows": 0,
    "summary": {
      "toCreate": 2,
      "toUpdate": 0,
      "toSkip": 0,
      "errors": 0,
      "warnings": 0
    },
    "preview": [...]
  }
}
```

### Test 3: Validate with Errors

Create `authors-errors.csv`:
```csv
name,email,bio,birth_date,country,active
,invalid-email,Bio text,2030-01-01,USA,true
John Doe,john@example.com,Bio,1980-01-01,USA,invalid
```

**Expected:** Validation errors for:
- Row 1: Missing name, invalid email, future date
- Row 2: Invalid boolean

### Test 4: Execute Import

```bash
curl -X POST "http://localhost:3383/api/authors/import/execute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID_FROM_VALIDATE",
    "options": {
      "skipDuplicates": true,
      "continueOnError": true
    }
  }'
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "jobId": "job_xyz789",
    "status": "processing",
    "progress": { "current": 0, "total": 2, "percentage": 0 }
  }
}
```

### Test 5: Verify in Database

```bash
curl -X GET "http://localhost:3383/api/authors" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Imported authors appear in the list.

---

## 🎯 Success Criteria

✅ **All 3 endpoints working:**
- Template download (Excel + CSV)
- File validation with detailed errors
- Import execution

✅ **Error handling:**
- Duplicate email detection (409)
- Email format validation (422)
- Birth date validation (422)
- File format validation (400)
- Session expiry handling (400)

✅ **Business logic:**
- Reuses existing validation from AuthorsService
- Reuses error codes from CRUD generator
- Type-safe with TypeBox
- Session-based workflow

✅ **Testing:**
- All test cases pass
- Data imported correctly
- Errors handled gracefully

---

## 📝 Next Steps After Implementation

1. **Extract Patterns:**
   - Identify reusable code patterns
   - Document template structure for CRUD generator
   - Create abstract base classes if needed

2. **Integrate into CRUD Generator:**
   - Add import routes template
   - Add import service template
   - Add import schemas template
   - Update package logic (Enterprise + Full)

3. **Documentation:**
   - Update CRUD generator docs
   - Add import feature to README
   - Create user guide

---

**Ready to implement!** 🚀

Start with Phase 1 (Setup) and work through each phase sequentially.
