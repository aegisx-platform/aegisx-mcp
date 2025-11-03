# [FEATURE NAME] Implementation - Technical Documentation

> **Complete implementation guide for [BRIEF DESCRIPTION OF WHAT THIS FEATURE DOES]**

<!--
INSTRUCTIONS FOR USING THIS TEMPLATE:
1. Replace all [PLACEHOLDER TEXT] with your feature-specific content
2. Remove sections that don't apply to your feature
3. Keep examples that are relevant, remove those that aren't
4. Update the metadata below with actual values
5. Add feature-specific sections as needed
6. Use existing implementation docs as reference (e.g., LOGIN_IMPLEMENTATION.md)
-->

## 📋 Metadata

| Property             | Value                                           |
| -------------------- | ----------------------------------------------- |
| **Feature Name**     | [e.g., User Profile Management]                 |
| **Status**           | [In Progress / Complete / Deprecated]           |
| **Version**          | [e.g., 1.0.0]                                   |
| **Last Updated**     | [YYYY-MM-DD]                                    |
| **Author**           | [Your Name / Team Name]                         |
| **Module**           | [e.g., Authentication / User Management / etc.] |
| **Related Features** | [List related features with links]              |

---

## 📋 Table of Contents

<!-- Auto-generated table of contents - update as sections change -->

- [Overview](#-overview)
- [Architecture & Flow](#-architecture--flow)
- [File Structure](#-file-structure--responsibilities)
- [Implementation Details](#-implementation-details)
- [Troubleshooting Guide](#-troubleshooting-guide)
- [Security Considerations](#-security-considerations)
- [Testing Checklist](#-testing-checklist)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables-reference)
- [Quick Fixes](#-quick-fixes)
- [Related Documentation](#-related-documentation)
- [FAQ](#-faq)

---

## 📋 Overview

<!-- Provide a clear, concise overview of the feature -->

[FEATURE NAME] is implemented across multiple services with proper [security / performance / scalability / etc.] and separation of concerns:

1. **[ServiceName]** - [Brief description of what this service does]
2. **[ServiceName]** - [Brief description of what this service does]
3. **[RepositoryName]** - [Brief description of what this repository does]
4. **[Frontend Component]** - [Brief description of frontend implementation]

### Key Capabilities

<!-- List 5-8 key capabilities this feature provides -->

- ✅ [Capability 1 - e.g., "Real-time data synchronization across devices"]
- ✅ [Capability 2 - e.g., "Role-based access control for resources"]
- ✅ [Capability 3]
- ✅ [Capability 4]
- ✅ [Capability 5]

### Integration Points

<!-- Describe how this feature integrates with other parts of the system -->

This feature integrates with:

- **[System/Feature 1]** - [How it integrates and why]
- **[System/Feature 2]** - [How it integrates and why]
- **[External Service]** - [If applicable, describe external integrations]

### Dependencies

<!-- List all dependencies required for this feature -->

**Backend Dependencies:**

- [Library/Package 1] - [Purpose]
- [Library/Package 2] - [Purpose]

**Frontend Dependencies:**

- [Library/Package 1] - [Purpose]
- [Library/Package 2] - [Purpose]

**Infrastructure:**

- [Database/Service 1] - [Purpose]
- [Cache/Queue 2] - [Purpose]

---

## 🏗️ Architecture & Flow

### [Feature Name] Flow (Complete Step-by-Step)

<!--
Create an ASCII art diagram showing the complete flow
Use boxes, arrows, and clear step numbers
Show all major decision points and data flow
-->

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. [Initial Action - e.g., User Submits Form]                   │
│    - [Detail 1 about what happens]                               │
│    - [Detail 2 about what happens]                               │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 2. [Next Step - e.g., Validation Check]                         │
│    - [Detail about validation]                                   │
│    - [What happens on validation failure]                        │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 3. [Controller/Service Action]                                   │
│    - [What the controller does]                                  │
│    - [What data is extracted]                                    │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 4. [Business Logic Step]                                         │
│    - [Processing details]                                        │
│    - [Decision points]                                           │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 5. [Database Operation]                                          │
│    - [What queries are executed]                                 │
│    - [What data is saved/retrieved]                              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 6. [Final Step - Response/Update]                                │
│    - [What is returned to the user]                              │
│    - [What state changes occur]                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Diagram

<!-- Show how different components interact -->

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Frontend   │───────▶│   Backend    │───────▶│   Database   │
│  Component   │◀───────│  Controller  │◀───────│  Repository  │
└──────────────┘        └──────────────┘        └──────────────┘
       │                       │                        │
       │                       v                        v
       │                ┌──────────────┐        ┌──────────────┐
       │                │   Service    │───────▶│    Redis     │
       │                │    Layer     │◀───────│    Cache     │
       │                └──────────────┘        └──────────────┘
       │                       │
       v                       v
┌──────────────┐        ┌──────────────┐
│  WebSocket   │◀───────│   Events     │
│   Updates    │        │   Emitter    │
└──────────────┘        └──────────────┘
```

### Error Handling Flow

<!-- Document how errors are handled throughout the flow -->

```
Error Occurs
    │
    ▼
┌─────────────────┐
│  Service Layer  │ ─▶ Log error with context
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Controller     │ ─▶ Format error response
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │ ─▶ Display user-friendly message
└─────────────────┘
```

---

## 📁 File Structure & Responsibilities

### Backend Files

<!--
List all backend files with their paths and responsibilities
Include line number references for key functions
Use tree structure for clarity
-->

```
apps/api/src/[module-name]/
├── [feature].routes.ts                       # Route definitions
│   └─ [METHOD] /[endpoint] → Lines [XX-YY]
│      - [Description of what this route does]
│      - [Rate limiting / validation details]
│      - Handler: [controllerName].[methodName]
│
├── [feature].controller.ts                   # HTTP request handler
│   └─ [methodName]() → Lines [XX-YY]
│      - [Description of what this method does]
│      - [Input validation details]
│      - [Response format]
│
├── [feature].schemas.ts                      # TypeBox validation schemas
│   ├─ [SchemaName]Request → Lines [XX-YY]
│   ├─ [SchemaName]Response → Lines [XX-YY]
│   └─ [SchemaName]Query → Lines [XX-YY]
│
├── [feature].types.ts                        # TypeScript interfaces
│   ├─ [TypeName] → Lines [XX-YY]
│   └─ [TypeName] → Lines [XX-YY]
│
├── services/
│   ├── [feature].service.ts                  # Core business logic
│   │   └─ [methodName]() → Lines [XX-YY]
│   │      - [Description of business logic]
│   │      - [Orchestration details]
│   │      - [Transaction handling]
│   │
│   └── [helper].service.ts                   # Supporting services
│       └─ [methodName]() → Lines [XX-YY]
│
└── repositories/
    └── [feature].repository.ts               # Data access layer
        ├─ [methodName]() → Lines [XX-YY]
        └─ [methodName]() → Lines [XX-YY]
```

### Frontend Files

<!-- List all frontend files and their responsibilities -->

```
apps/web/src/app/
├── pages/[feature]/
│   └── [feature].page.ts                     # Main page component
│       ├─ [methodName]() → Lines [XX-YY]
│       │  - [What this method does]
│       │
│       └─ [methodName]() → Lines [XX-YY]
│          - [What this method does]
│
├── components/[feature]/
│   ├── [component-name].component.ts         # Reusable component
│   ├── [component-name].component.html       # Template
│   └── [component-name].component.scss       # Styles
│
├── dialogs/[feature]/
│   └── [dialog-name].dialog.ts               # Dialog component
│       └─ [methodName]() → Lines [XX-YY]
│
└── core/[feature]/services/
    └── [feature].service.ts                  # Frontend service
        ├─ [methodName]() → Lines [XX-YY]
        │  - API communication
        │  - State management
        │
        └─ [methodName]() → Lines [XX-YY]
           - WebSocket subscriptions
           - Event handling
```

### Database Migration Files

<!-- List migration files if applicable -->

```
apps/api/migrations/
├── [YYYYMMDDHHMMSS]_create_[table].ts        # Initial table creation
├── [YYYYMMDDHHMMSS]_add_[column].ts          # Schema modifications
└── [YYYYMMDDHHMMSS]_create_indexes.ts        # Index creation
```

### Test Files

<!-- List test files -->

```
apps/api/src/[module-name]/
├── [feature].routes.spec.ts                  # Route tests
├── [feature].controller.spec.ts              # Controller tests
├── [feature].service.spec.ts                 # Service tests
└── [feature].repository.spec.ts              # Repository tests
```

---

## 🔍 Implementation Details

<!--
Provide detailed implementation documentation for each major component
Include code snippets with explanations
Reference actual file paths and line numbers
-->

### 1. Route Configuration

**File:** `apps/api/src/[module]/[feature].routes.ts`

**Lines [XX-YY]:**

```typescript
// [METHOD] /api/[endpoint]
typedFastify.route({
  method: '[GET/POST/PUT/DELETE]',
  url: '/[endpoint]',
  config: {
    rateLimit: {
      // [Explain rate limiting strategy]
      max: [NUMBER],
      timeWindow: '[DURATION]',
      keyGenerator: (req) => {
        // [Explain key generation logic]
        return `${req.ip}:[identifier]`;
      },
      errorResponseBuilder: () => ({
        success: false,
        error: {
          code: '[ERROR_CODE]',
          message: '[User-friendly error message]',
          statusCode: 429,
        },
      }),
    },
  },
  schema: {
    tags: ['[Tag Name]'],
    summary: '[Brief description of endpoint]',
    body: SchemaRefs.module('[module]', '[schemaName]'),
    response: {
      200: SchemaRefs.module('[module]', '[responseSchema]'),
      400: SchemaRefs.BadRequest,
      401: SchemaRefs.Unauthorized,
      500: SchemaRefs.ServerError,
    },
  },
  preValidation: [
    // [Explain middleware/guards used]
    fastify.verifyJWT,
    fastify.verifyPermission('[resource]:[action]'),
  ],
  handler: [controllerName].[methodName],
});
```

**What this route does:**

- ✅ [Explanation point 1]
- ✅ [Explanation point 2]
- ✅ [Explanation point 3]

**Rate Limiting Strategy:**

- [Explain the rate limit chosen and why]
- [Explain the key generation strategy]
- [Explain error handling]

---

### 2. Controller Implementation

**File:** `apps/api/src/[module]/[feature].controller.ts`

**Lines [XX-YY]:**

```typescript
async [methodName](request: FastifyRequest, reply: FastifyReply) {
  // [Step 1: Extract data from request]
  const [data] = request.body as [TypeName];
  const [param] = request.params as [TypeName];

  // [Step 2: Call service layer]
  const result = await request.server.[serviceName].[methodName]([params]);

  // [Step 3: Set cookies/headers if needed]
  if ([condition]) {
    reply.setCookie('[name]', [value], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: [duration],
    });
  }

  // [Step 4: Return formatted response]
  return reply.send({
    success: true,
    data: result,
    message: '[Success message]',
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
      requestId: request.id,
      environment: process.env.NODE_ENV || 'development',
    },
  });
}
```

**What it does:**

- ✅ [Explain each step clearly]
- ✅ [Highlight important decisions]
- ✅ [Document error handling]

**Error Handling:**

```typescript
try {
  // Main logic
} catch (error) {
  if (error.code === '[SPECIFIC_ERROR_CODE]') {
    return reply.status(400).send({
      success: false,
      error: {
        code: error.code,
        message: '[User-friendly message]',
        statusCode: 400,
      },
    });
  }
  throw error; // Let global error handler deal with it
}
```

---

### 3. Service Layer Implementation

**File:** `apps/api/src/[module]/services/[feature].service.ts`

**Lines [XX-YY]:**

<!-- Break down the service implementation into logical steps -->

#### Step 1: [First Major Step - e.g., Validation]

```typescript
// [Describe what this step does]
const [result] = await this.[helperMethod]([params]);
if (![condition]) {
  const error = new Error('[Error message]');
  (error as any).statusCode = [statusCode];
  (error as any).code = '[ERROR_CODE]';
  throw error;
}
```

**What happens here:**

- ✅ [Explanation]
- ✅ [Explanation]

#### Step 2: [Second Major Step - e.g., Data Processing]

```typescript
// [Describe what this step does]
const [processedData] = await this.[processingMethod]([data]);
```

**Processing Logic:**

- [Explain the processing that occurs]
- [Document any transformations]
- [Highlight business rules applied]

#### Step 3: [Database Operation]

```typescript
// [Describe database operation]
const [result] = await this.[repositoryName].[methodName]([params]);
```

**Database Interaction:**

- [Explain what data is saved/retrieved]
- [Document transaction handling if applicable]
- [Note any optimistic locking or concurrency handling]

#### Step 4: [Cache/Event Handling]

```typescript
// [Describe caching strategy]
await this.redis.setex(`[cache-key]:[id]`, 3600, JSON.stringify(result));

// [Describe event emission]
this.eventEmitter.emit('[event-name]', {
  [eventData]
});
```

**Cache Strategy:**

- Cache duration: [duration and why]
- Cache invalidation: [when and how]
- Cache key pattern: [explain pattern]

**Event Emission:**

- Event name: `[event-name]`
- Event payload: [describe structure]
- Subscribers: [list components that listen]

#### Step 5: [Return Result]

```typescript
// [Describe response preparation]
return {
  [responseStructure]
};
```

---

### 4. Repository Pattern

**File:** `apps/api/src/[module]/repositories/[feature].repository.ts`

**Lines [XX-YY]:**

```typescript
export class [FeatureName]Repository extends BaseRepository<[Type], [CreateType], [UpdateType]> {
  constructor(knex: Knex) {
    super(
      knex,
      '[table_name]',
      ['[searchField1]', '[searchField2]'], // Search fields
      ['[uuidField1]', '[uuidField2]'], // UUID fields for validation
    );
  }

  // Custom query methods
  async [customMethod]([params]): Promise<[ReturnType]> {
    return this.knex('[table_name]')
      .where('[condition]')
      .select('[columns]')
      .first();
  }
}
```

**Repository Features:**

- ✅ Inherits base CRUD operations from BaseRepository
- ✅ Automatic UUID validation for specified fields
- ✅ Search functionality across defined fields
- ✅ Soft delete support
- ✅ Pagination support

**Custom Methods:**

Document any custom repository methods:

```typescript
/**
 * [Method Name] - [Brief description]
 * @param {[Type]} [param] - [Description]
 * @returns {Promise<[Type]>} [Description]
 */
async [methodName]([params]): Promise<[ReturnType]> {
  // Implementation
}
```

---

### 5. Frontend Component Implementation

**File:** `apps/web/src/app/pages/[feature]/[feature].page.ts`

**Lines [XX-YY]:**

```typescript
export class [FeatureName]Page implements OnInit {
  // Signals for reactive state
  [data] = signal<[Type][]>([]);
  [isLoading] = signal(false);
  [error] = signal<string | null>(null);

  constructor(
    private [serviceName]: [ServiceType],
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load[Data]();
  }

  protected load[Data](): void {
    this.[isLoading].set(true);
    this.[serviceName].[methodName]().subscribe({
      next: ([response]) => {
        this.[data].set([response].data);
        this.[isLoading].set(false);
      },
      error: ([error]) => {
        this.[error].set([error].message);
        this.[isLoading].set(false);
      },
    });
  }

  protected on[Action]([params]): void {
    // [Describe what this action does]
  }
}
```

**Component Features:**

- ✅ [Feature 1]
- ✅ [Feature 2]
- ✅ [Feature 3]

**State Management:**

- Uses Angular Signals for reactive state
- Signal updates trigger automatic UI re-renders
- No manual change detection needed

---

### 6. Frontend Service Implementation

**File:** `apps/web/src/app/core/[feature]/services/[feature].service.ts`

**Lines [XX-YY]:**

```typescript
@Injectable({ providedIn: 'root' })
export class [FeatureName]Service {
  // State signals
  private _[data] = signal<[Type][]>([]);
  private _[isLoading] = signal(false);

  // Public readonly signals
  public readonly [data] = this._[data].asReadonly();
  public readonly [isLoading] = this._[isLoading].asReadonly();

  constructor(
    private http: HttpClient,
    private socket: SocketService,
  ) {
    this.setupWebSocketListeners();
  }

  // API methods
  [methodName]([params]): Observable<[ResponseType]> {
    this._[isLoading].set(true);
    return this.http.[method]<[ResponseType]>('/[endpoint]', [data]).pipe(
      tap(([response]) => {
        // Update state
        this._[data].set([response].data);
        this._[isLoading].set(false);
      }),
      catchError(([error]) => {
        this._[isLoading].set(false);
        return this.handleError([error]);
      }),
    );
  }

  // WebSocket integration
  private setupWebSocketListeners(): void {
    this.socket.on('[event-name]', ([data]) => {
      // Update state based on WebSocket event
      this.handle[Event]([data]);
    });
  }

  private handleError([error]: any): Observable<never> {
    console.error('[Error context]:', [error]);
    return throwError(() => [error]);
  }
}
```

**Service Features:**

- ✅ Centralized API communication
- ✅ Signal-based state management
- ✅ WebSocket event handling
- ✅ Error handling and logging

---

## 🛠️ Troubleshooting Guide

<!--
Provide 5-10 common problems with solutions
Use consistent format: Problem → Symptoms → Cause → Check → Solution
-->

### Problem 1: [Problem Name/Description]

**Symptoms:**

- [Symptom 1 - What the user sees]
- [Symptom 2]
- [Symptom 3]

**Possible Causes:**

1. **[Cause 1]** (most common)
2. **[Cause 2]**
3. **[Cause 3]**

**Check:**

```bash
# [Describe what to check]
[command to diagnose]

# [Another diagnostic]
[another command]
```

**Solution:**

```bash
# [Step-by-step solution]
[solution command 1]
[solution command 2]
```

**Alternative Solution:**

If the above doesn't work, try:

```bash
# [Alternative approach]
[alternative commands]
```

---

### Problem 2: [Another Common Problem]

**Symptoms:**

- [What happens]

**Cause:**

- [Root cause explanation]

**Check:**

```bash
# Diagnostic commands
[check command]
```

**Solution:**

```bash
# Fix command
[solution]
```

---

### Problem 3: [Third Problem]

<!-- Repeat pattern for 5-10 common issues -->

---

### Debugging Commands

<!-- Provide useful debugging commands -->

**Check Database State:**

```sql
-- [Description of what this query shows]
SELECT [columns]
FROM [table]
WHERE [condition]
ORDER BY [column] DESC
LIMIT 10;
```

**Check Redis Cache:**

```bash
# [Description]
redis-cli
> GET [cache-key]
> KEYS [pattern]*
```

**Check Logs:**

```bash
# API logs
tail -f logs/api.log | grep "[pattern]"

# Specific feature logs
grep -r "[error-code]" logs/
```

**API Testing:**

```bash
# [Test description]
curl -X [METHOD] http://localhost:[PORT]/api/[endpoint] \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '[json-payload]'
```

---

## 🔒 Security Considerations

<!-- Document all security aspects of the feature -->

### 1. Authentication & Authorization

**Authentication:**

- ✅ [How authentication is enforced]
- ✅ [Token validation approach]
- ✅ [Session management]

**Authorization:**

- ✅ [Permission requirements]
- ✅ [Role-based access control]
- ✅ [Resource ownership verification]

**Implementation:**

```typescript
// Route protection example
preValidation: [
  fastify.verifyJWT,  // Verify user is authenticated
  fastify.verifyPermission('[resource]:[action]'),  // Check permissions
  fastify.verifyOwnership(),  // Verify resource ownership
],
```

---

### 2. Input Validation

**Validation Strategy:**

- ✅ TypeBox schemas for request validation
- ✅ Sanitization of user input
- ✅ Type safety with TypeScript

**Example Schema:**

```typescript
export const [Feature]RequestSchema = Type.Object({
  [field1]: Type.String({ minLength: 1, maxLength: 255 }),
  [field2]: Type.String({ format: 'email' }),
  [field3]: Type.Optional(Type.Boolean()),
});
```

**Validation Points:**

1. **Route Level**: Automatic validation via Fastify schema
2. **Service Level**: Business logic validation
3. **Database Level**: Database constraints

---

### 3. Data Protection

**Sensitive Data Handling:**

- ✅ [How sensitive data is encrypted]
- ✅ [What data is logged vs hidden]
- ✅ [How data is transmitted]

**Password/Secret Protection:**

```typescript
// Never log or return sensitive data
const { password, secret, ...safeData } = user;
return safeData;
```

**SQL Injection Prevention:**

- ✅ Use Knex query builder (parameterized queries)
- ✅ Never concatenate raw SQL with user input
- ✅ Validate all input types

---

### 4. Rate Limiting

**Rate Limit Configuration:**

| Endpoint     | Limit | Window   | Key            | Purpose  |
| ------------ | ----- | -------- | -------------- | -------- |
| [Endpoint 1] | [max] | [window] | [key strategy] | [reason] |
| [Endpoint 2] | [max] | [window] | [key strategy] | [reason] |

**Why These Limits:**

- [Explain rate limiting decisions]
- [Balance between security and UX]
- [How limits prevent abuse]

---

### 5. Error Message Security

**Generic vs Specific Messages:**

**Generic (External):**

- ❌ "User not found" (reveals user existence)
- ✅ "Invalid credentials" (generic, secure)

**Specific (Internal/Logs):**

- ✅ Log detailed errors with context
- ✅ Include user IDs, timestamps, error codes
- ✅ Never expose internal details to users

---

### 6. Audit Logging

**What's Logged:**

- ✅ [Event type 1] - [What data is captured]
- ✅ [Event type 2] - [What data is captured]
- ✅ [Event type 3] - [What data is captured]

**Audit Trail:**

```typescript
// Example audit log entry
await this.auditLog.create({
  userId: user.id,
  action: '[action-type]',
  resource: '[resource-type]',
  resourceId: [id],
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  details: { [relevant details] },
  timestamp: new Date(),
});
```

**Storage:**

- [Where audit logs are stored]
- [How long they're retained]
- [Who has access to logs]

---

## 📝 Testing Checklist

<!-- Provide comprehensive testing checklist -->

### Manual Testing Steps

```bash
# 1. Setup and Prerequisites
[setup command 1]
[setup command 2]

# 2. Test Case 1: [Happy Path]
# Go to [URL]
# [Action 1]
# [Action 2]
# Verify [expected result]

# 3. Test Case 2: [Error Scenario]
# [Action that should fail]
# Verify [error message shown]
# Check [database state]

# 4. Test Case 3: [Edge Case]
# [Unusual input or scenario]
# Verify [correct handling]

# 5. Test Case 4: [Performance]
# [Load test or timing check]
# Verify [acceptable performance]

# 6. Test Case 5: [Security]
# [Unauthorized access attempt]
# Verify [proper rejection]
```

### Automated Testing

**Test Files:**

- `[feature].routes.spec.ts` - Route/integration tests
- `[feature].service.spec.ts` - Service/business logic tests
- `[feature].repository.spec.ts` - Data access tests
- `[feature].component.spec.ts` - Frontend component tests

**Example Test Cases:**

```typescript
describe('[Feature] - [Scenario]', () => {
  it('should [expected behavior] when [condition]', async () => {
    // Arrange
    const [testData] = [createTestData]();

    // Act
    const response = await app.inject({
      method: '[METHOD]',
      url: '/[endpoint]',
      payload: [testData],
      headers: {
        authorization: `Bearer ${[token]}`,
      },
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.json().success).toBe(true);
    expect(response.json().data.[field]).toBe([expectedValue]);
  });

  it('should return error when [invalid condition]', async () => {
    // Test error scenarios
  });

  it('should handle edge case: [specific scenario]', async () => {
    // Test edge cases
  });
});
```

### Edge Cases to Test

<!-- List 10-15 edge cases specific to the feature -->

1. **[Edge Case 1]** - [Description and expected behavior]
2. **[Edge Case 2]** - [Description and expected behavior]
3. **[Edge Case 3]** - [Description and expected behavior]
4. **Empty/Null Input** - Verify proper validation errors
5. **Concurrent Requests** - Verify no race conditions
6. **Invalid UUIDs** - Verify UUID validation catches errors
7. **Missing Permissions** - Verify authorization fails gracefully
8. **Rate Limit Exceeded** - Verify proper 429 responses
9. **Database Connection Lost** - Verify error handling
10. **Large Payload** - Verify size limits enforced

### Performance Testing

**Load Testing:**

```bash
# Test with [X] concurrent requests
[load testing tool command]

# Expected performance:
# - Response time: < [X]ms (p95)
# - Throughput: > [X] requests/sec
# - Error rate: < [X]%
```

**Benchmark Results:**

| Metric              | Target      | Actual    |
| ------------------- | ----------- | --------- |
| Response Time (p50) | < [X]ms     | [X]ms     |
| Response Time (p95) | < [X]ms     | [X]ms     |
| Response Time (p99) | < [X]ms     | [X]ms     |
| Throughput          | > [X] req/s | [X] req/s |
| Error Rate          | < 0.1%      | [X]%      |

---

## 📊 Database Schema

<!-- Document all database tables used by this feature -->

### [Table Name 1]

**Purpose:** [What this table stores]

```sql
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [column1] [TYPE] [CONSTRAINTS],
  [column2] [TYPE] [CONSTRAINTS],
  [column3] [TYPE] [CONSTRAINTS],

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- Soft delete support

  -- Foreign keys
  FOREIGN KEY ([fk_column]) REFERENCES [other_table](id) ON DELETE [CASCADE/SET NULL]
);

-- Indexes
CREATE INDEX idx_[table]_[column] ON [table]([column]);
CREATE INDEX idx_[table]_[column2] ON [table]([column2]);
CREATE INDEX idx_[table]_deleted_at ON [table](deleted_at);
```

**Column Descriptions:**

| Column      | Type   | Description | Constraints           |
| ----------- | ------ | ----------- | --------------------- |
| `id`        | UUID   | Primary key | NOT NULL, PRIMARY KEY |
| `[column1]` | [TYPE] | [Purpose]   | [Constraints]         |
| `[column2]` | [TYPE] | [Purpose]   | [Constraints]         |

**Indexes:**

- `idx_[table]_[column]` - [Purpose of index, query optimization]
- `idx_[table]_[column2]` - [Purpose of index]

**Relationships:**

- **One-to-Many**: [table] → [related_table] ([description])
- **Many-to-Many**: [table] ↔ [junction_table] ↔ [other_table]

---

### [Table Name 2]

<!-- Repeat for each table -->

---

### Migration Files

**Initial Schema:**

```
[YYYYMMDDHHMMSS]_create_[table].ts - Creates initial table structure
```

**Schema Updates:**

```
[YYYYMMDDHHMMSS]_add_[column]_to_[table].ts - Adds new column
[YYYYMMDDHHMMSS]_create_[indexes].ts - Adds indexes
```

**Running Migrations:**

```bash
# Run pending migrations
pnpm run db:migrate

# Rollback last migration
pnpm run db:migrate:rollback

# View migration status
pnpm run db:migrate:status
```

---

## 🎯 Environment Variables Reference

### Required Variables

| Variable       | Example           | Description        | Default          |
| -------------- | ----------------- | ------------------ | ---------------- |
| `[VAR_NAME]`   | `[example-value]` | [What it controls] | [default if any] |
| `[VAR_NAME_2]` | `[example-value]` | [What it controls] | None (required)  |

### Optional Variables

| Variable       | Example     | Default     | Description |
| -------------- | ----------- | ----------- | ----------- |
| `[VAR_NAME]`   | `[example]` | `[default]` | [Purpose]   |
| `[VAR_NAME_2]` | `[example]` | `[default]` | [Purpose]   |

### Configuration Example

**`.env.local` file:**

```bash
# [Feature Name] Configuration
[VAR_NAME]=[value]
[VAR_NAME_2]=[value]

# Optional settings
[OPTIONAL_VAR]=[value]  # [Comment explaining when to set this]
```

### Environment-Specific Values

**Development:**

```bash
[VAR_NAME]=development-value
```

**Staging:**

```bash
[VAR_NAME]=staging-value
```

**Production:**

```bash
[VAR_NAME]=production-value
```

---

## 💡 Quick Fixes

<!-- Provide 4-6 common quick fixes -->

### Fix 1: [Common Issue]

**Problem:** [Quick description]

**Solution:**

```bash
# [Step 1]
[command 1]

# [Step 2]
[command 2]
```

---

### Fix 2: [Debug/Inspection]

**Problem:** [What you want to inspect]

**Solution:**

```bash
# [Inspection command with explanation]
[command]
```

```sql
-- Database inspection
SELECT [columns]
FROM [table]
WHERE [condition];
```

---

### Fix 3: [Reset/Clear]

**Problem:** [When to use this fix]

**Solution:**

```bash
# Clear cache
[clear command]

# Reset state
[reset command]
```

---

### Fix 4: [Manual Testing]

**Problem:** Want to test API directly without frontend

**Solution:**

```bash
# [Test scenario 1]
curl -X [METHOD] http://localhost:[PORT]/api/[endpoint] \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "[field1]": "[value1]",
    "[field2]": "[value2]"
  }'

# Expected response
# [Show expected JSON response]
```

---

## 📚 Related Documentation

<!-- Link to related documentation -->

- **[[Related Feature 1]](./[FILE].md)** - [Brief description]
- **[[Related Feature 2]](./[FILE].md)** - [Brief description]
- **[[System Documentation]](../[category]/[FILE].md)** - [Brief description]
- **[[API Reference]](./API_REFERENCE.md)** - Complete API documentation
- **[[User Guide]](./USER_GUIDE.md)** - End-user guide
- **[[Developer Guide]](./DEVELOPER_GUIDE.md)** - Development guide
- **[[Architecture]](./ARCHITECTURE.md)** - System architecture

---

## ❓ FAQ

<!-- Provide 10-15 frequently asked questions -->

**Q: [Common question about usage]**
A: [Clear, concise answer]

**Q: [Technical question]**
A: [Detailed technical explanation with code example if needed]

**Q: [Security question]**
A: [Security-focused answer]

**Q: [Performance question]**
A: [Performance explanation with metrics]

**Q: [Configuration question]**
A: [Configuration guidance]

**Q: [Troubleshooting question]**
A: [Step-by-step troubleshooting]

**Q: [Integration question]**
A: [How feature integrates with other systems]

**Q: [Error handling question]**
A: [Error handling explanation]

**Q: [Data question]**
A: [Data handling/storage explanation]

**Q: [Testing question]**
A: [Testing approach and tools]

---

## 📝 Writing Guidelines

<!-- Guidelines for maintaining this document -->

### How to Use This Template

1. **Copy this template** to your feature implementation directory
2. **Replace all `[PLACEHOLDERS]`** with actual feature content
3. **Remove sections** that don't apply to your feature
4. **Add custom sections** as needed for your feature
5. **Keep code examples** up-to-date with actual implementation
6. **Update line numbers** when code changes
7. **Link to related docs** for cross-reference

### Best Practices

**Code Snippets:**

- Use actual code from implementation, not pseudo-code
- Include file paths and line numbers
- Add comments explaining key points
- Show both correct and incorrect patterns

**Diagrams:**

- Use ASCII art for consistency
- Keep diagrams simple and clear
- Show complete flows including error paths
- Update when architecture changes

**Examples:**

- Provide real-world examples
- Include both happy path and error scenarios
- Show actual API responses
- Use realistic test data

**Cross-References:**

- Link to related documentation
- Reference actual file paths
- Point to API reference for detailed specs
- Link to troubleshooting for known issues

### When to Update

Update this document when:

- ✅ Feature implementation changes
- ✅ New edge cases discovered
- ✅ API contracts modified
- ✅ Security considerations change
- ✅ New troubleshooting issues found
- ✅ Performance characteristics change
- ✅ Database schema updated

### Documentation Review Checklist

Before publishing/committing, verify:

- [ ] All `[PLACEHOLDERS]` replaced with actual content
- [ ] Code snippets tested and working
- [ ] File paths and line numbers accurate
- [ ] Diagrams match current architecture
- [ ] Links to related docs work
- [ ] Examples use realistic data
- [ ] Security considerations documented
- [ ] Testing instructions complete
- [ ] FAQ addresses common questions
- [ ] Troubleshooting covers known issues
- [ ] Environment variables documented
- [ ] Database schema accurate
- [ ] Metadata section filled out
- [ ] Table of contents updated
- [ ] Grammar and spelling checked

---

## 📋 Document Metadata

**Last Updated:** [YYYY-MM-DD]
**Maintained By:** [Your Name / Team Name]
**Version:** [1.0.0]
**Status:** [Draft / In Review / Published]
**Review Cycle:** [Quarterly / After Major Changes]

**Changelog:**

| Date         | Version | Changes                       | Author |
| ------------ | ------- | ----------------------------- | ------ |
| [YYYY-MM-DD] | 1.0.0   | Initial documentation         | [Name] |
| [YYYY-MM-DD] | 1.1.0   | Added [feature] documentation | [Name] |

---

**Reference Implementation:**
This template is based on the successful implementation documentation from:

- [LOGIN_IMPLEMENTATION.md](../authentication/implementations/LOGIN_IMPLEMENTATION.md)
- [ARCHITECTURE.md](../authentication/ARCHITECTURE.md)

For examples of how to use this template effectively, review those documents.
