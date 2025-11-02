# Audit System Developer Guide

**Technical integration guide for developers**

Version: 1.0.0
Last Updated: 2025-11-02

## Table of Contents

- [Quick Start](#quick-start)
- [Backend Integration](#backend-integration)
- [Frontend Integration](#frontend-integration)
- [API Examples](#api-examples)
- [Database Schema](#database-schema)
- [Type Definitions](#type-definitions)
- [Testing](#testing)
- [Performance](#performance)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Angular 19+
- Fastify 4+

### Installation

```bash
# Clone repository
git clone https://github.com/aegisx-platform/aegisx-starter-2.git
cd aegisx-starter-2

# Install dependencies
pnpm install

# Run migrations (audit tables already included)
pnpm run db:migrate

# Seed test data
pnpm run db:seed

# Start development servers
pnpm run dev:api  # Backend on port 3333
pnpm run dev:web  # Frontend on port 4200
```

### Verify Installation

```bash
# Test login attempts endpoint
curl http://localhost:3333/api/login-attempts

# Test file audit endpoint
curl http://localhost:3333/api/file-audit
```

## Backend Integration

### Project Structure

```
apps/api/src/
└── core/
    └── audit/
        ├── plugins/
        │   ├── file-audit.plugin.ts       # File activity tracking
        │   └── login-attempts.plugin.ts   # Login tracking
        ├── controllers/
        │   ├── file-audit.controller.ts
        │   └── login-attempts.controller.ts
        ├── services/
        │   ├── file-audit.service.ts
        │   └── login-attempts.service.ts
        ├── repositories/
        │   ├── file-audit.repository.ts
        │   └── login-attempts.repository.ts
        ├── routes/
        │   ├── file-audit.routes.ts
        │   └── login-attempts.routes.ts
        └── schemas/
            ├── file-audit.schemas.ts
            └── login-attempts.schemas.ts
```

### Registering Plugins

The audit plugins are automatically registered in `apps/api/src/app.ts`:

```typescript
// apps/api/src/app.ts
import loginAttemptsPlugin from './core/audit/plugins/login-attempts.plugin';
import fileAuditPlugin from './core/audit/plugins/file-audit.plugin';

export async function buildApp(options = {}) {
  const app = fastify(options);

  // ... other plugins ...

  // Audit plugins (Priority: After auth, before routes)
  await app.register(loginAttemptsPlugin);
  await app.register(fileAuditPlugin);

  return app;
}
```

### Tracking Login Attempts

#### Automatic Tracking

Login attempts are automatically tracked in the auth system:

```typescript
// apps/api/src/core/auth/controllers/auth.controller.ts
export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = request.body;

    // Authenticate user
    const result = await authService.login(email, password);

    // Log successful login
    await request.server.loginAttempts.create({
      userId: result.user.id,
      email: result.user.email,
      username: result.user.username,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      success: true,
    });

    return reply.send(result);
  } catch (error) {
    // Log failed login
    await request.server.loginAttempts.create({
      email: request.body.email,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      success: false,
      failureReason: error.message,
    });

    throw error;
  }
}
```

#### Manual Tracking

You can manually track login attempts:

```typescript
// Record successful login
await request.server.loginAttempts.create({
  userId: user.id,
  email: user.email,
  username: user.username,
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  success: true,
});

// Record failed login
await request.server.loginAttempts.create({
  email: 'attacker@example.com',
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  success: false,
  failureReason: 'INVALID_PASSWORD',
});
```

### Tracking File Operations

#### Using the Service

```typescript
// apps/api/src/core/files/controllers/files.controller.ts
import { FileAuditService } from '../../audit/services/file-audit.service';

export class FilesController {
  constructor(
    private fileService: FileService,
    private fileAuditService: FileAuditService,
  ) {}

  async uploadFile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const file = await request.file();
      const result = await this.fileService.upload(file);

      // Log successful upload
      await this.fileAuditService.create({
        fileId: result.id,
        userId: request.user.id,
        operation: 'upload',
        success: true,
        fileName: result.name,
        fileSize: result.size,
        filePath: result.path,
        mimeType: result.mimeType,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.send(result);
    } catch (error) {
      // Log failed upload
      await this.fileAuditService.create({
        userId: request.user?.id,
        operation: 'upload',
        success: false,
        fileName: file?.filename,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        errorMessage: error.message,
      });

      throw error;
    }
  }
}
```

#### Operation Types

```typescript
type FileOperation =
  | 'upload' // File uploaded
  | 'download' // File downloaded
  | 'delete' // File deleted
  | 'view' // File viewed/accessed
  | 'update'; // File modified
```

### Database Access

#### Using Repository Pattern

```typescript
import { LoginAttemptsRepository } from '../repositories/login-attempts.repository';
import { FileAuditRepository } from '../repositories/file-audit.repository';

// In your service
export class MyService {
  constructor(
    private loginAttemptsRepo: LoginAttemptsRepository,
    private fileAuditRepo: FileAuditRepository,
  ) {}

  async getRecentLogins(userId: string) {
    return this.loginAttemptsRepo.findAll({
      userId,
      limit: 10,
      orderBy: 'created_at',
      orderDir: 'desc',
    });
  }

  async getFileActivity(fileId: string) {
    return this.fileAuditRepo.findAll({
      fileId,
      limit: 50,
    });
  }
}
```

## Frontend Integration

### Project Structure

```
apps/web/src/app/core/audit/
├── models/
│   └── audit.types.ts                    # TypeScript interfaces
├── services/
│   ├── login-attempts.service.ts         # Login attempts HTTP service
│   └── file-audit.service.ts             # File audit HTTP service
├── pages/
│   ├── login-attempts/
│   │   └── login-attempts.component.ts   # Login attempts page
│   └── file-audit/
│       └── file-audit.component.ts       # File activity page
└── audit.routes.ts                       # Lazy-loaded routes
```

### Using Services

#### Login Attempts Service

```typescript
import { Component, inject } from '@angular/core';
import { LoginAttemptsService } from '../../services/login-attempts.service';

@Component({
  selector: 'app-security-dashboard',
  template: `
    <div *ngIf="loading()">Loading...</div>
    <div *ngIf="error()">{{ error() }}</div>

    <div *ngFor="let attempt of loginAttempts()">{{ attempt.email }} - {{ attempt.success ? 'Success' : 'Failed' }}</div>
  `,
})
export class SecurityDashboardComponent {
  private loginAttemptsService = inject(LoginAttemptsService);

  // Signal-based state
  loginAttempts = this.loginAttemptsService.loginAttempts;
  loading = this.loginAttemptsService.loading;
  error = this.loginAttemptsService.error;

  ngOnInit() {
    // Load login attempts
    this.loginAttemptsService
      .getLoginAttempts({
        page: 1,
        limit: 25,
        success: false, // Only failed attempts
      })
      .subscribe();

    // Load statistics
    this.loginAttemptsService.getStats().subscribe((stats) => {
      console.log('Total attempts:', stats.totalAttempts);
      console.log('Success rate:', stats.successRate);
    });
  }

  exportData() {
    this.loginAttemptsService
      .exportAttempts({
        success: false,
      })
      .subscribe();
  }

  cleanup() {
    this.loginAttemptsService
      .cleanupAttempts({
        days: 30,
      })
      .subscribe((result) => {
        console.log('Deleted:', result.deletedCount);
      });
  }
}
```

#### File Audit Service

```typescript
import { Component, inject } from '@angular/core';
import { FileAuditService } from '../../services/file-audit.service';

@Component({
  selector: 'app-file-dashboard',
  template: ` <div *ngFor="let log of fileAuditLogs()">{{ log.fileName }} - {{ log.operation }} - {{ log.success ? 'Success' : 'Failed' }}</div> `,
})
export class FileDashboardComponent {
  private fileAuditService = inject(FileAuditService);

  fileAuditLogs = this.fileAuditService.fileAuditLogs;
  loading = this.fileAuditService.loading;

  ngOnInit() {
    // Load file activity
    this.fileAuditService
      .getFileAuditLogs({
        page: 1,
        limit: 25,
        operation: 'upload',
      })
      .subscribe();
  }

  loadFileHistory(fileId: string) {
    this.fileAuditService
      .getFileAuditLogs({
        fileId,
      })
      .subscribe();
  }
}
```

### State Management with Signals

All audit services use Angular Signals for reactive state:

```typescript
@Injectable({ providedIn: 'root' })
export class LoginAttemptsService {
  private _state = signal<LoginAttemptsState>({
    loginAttempts: [],
    stats: null,
    loading: false,
    error: null,
    pagination: null,
  });

  // Read-only signals
  readonly state = this._state.asReadonly();
  readonly loginAttempts = () => this._state().loginAttempts;
  readonly stats = () => this._state().stats;
  readonly loading = () => this._state().loading;
  readonly error = () => this._state().error;
  readonly pagination = () => this._state().pagination;

  // Methods update state automatically
  getLoginAttempts(query?: LoginAttemptsQuery): Observable<...> {
    this.setLoading(true);
    return this.http.get(...).pipe(
      tap(({ data, pagination }) => {
        this.updateState({
          loginAttempts: data,
          pagination,
          loading: false,
        });
      })
    );
  }
}
```

## API Examples

### List Login Attempts

```bash
# Get all login attempts
curl http://localhost:3333/api/login-attempts

# With pagination
curl "http://localhost:3333/api/login-attempts?page=1&limit=25"

# Filter by success
curl "http://localhost:3333/api/login-attempts?success=false"

# Search by email
curl "http://localhost:3333/api/login-attempts?search=admin@example.com"

# Filter by user
curl "http://localhost:3333/api/login-attempts?userId=uuid-here"

# Filter by date range
curl "http://localhost:3333/api/login-attempts?startDate=2025-11-01&endDate=2025-11-02"
```

### Get Login Attempt Statistics

```bash
curl http://localhost:3333/api/login-attempts/stats

# Response:
{
  "success": true,
  "data": {
    "totalAttempts": 1234,
    "successfulAttempts": 1150,
    "failedAttempts": 84,
    "successRate": 93.2,
    "uniqueUsers": 45,
    "uniqueIPs": 32,
    "topFailureReasons": [
      { "reason": "INVALID_PASSWORD", "count": 50 },
      { "reason": "USER_NOT_FOUND", "count": 20 }
    ]
  }
}
```

### Export Login Attempts

```bash
# Export as CSV
curl -o login-attempts.csv \
  "http://localhost:3333/api/login-attempts/export?success=false"
```

### Delete Login Attempt

```bash
curl -X DELETE http://localhost:3333/api/login-attempts/uuid-here
```

### Cleanup Old Login Attempts

```bash
# Delete attempts older than 30 days
curl -X DELETE "http://localhost:3333/api/login-attempts/cleanup?days=30"

# Response:
{
  "success": true,
  "data": {
    "deletedCount": 2345
  }
}
```

### File Audit Endpoints

```bash
# List file audit logs
curl "http://localhost:3333/api/file-audit?operation=upload"

# Get file activity for specific file
curl "http://localhost:3333/api/file-audit?fileId=uuid-here"

# Get statistics
curl http://localhost:3333/api/file-audit/stats

# Export CSV
curl -o file-activity.csv http://localhost:3333/api/file-audit/export

# Cleanup old logs
curl -X DELETE "http://localhost:3333/api/file-audit/cleanup?days=30"
```

## Database Schema

### Login Attempts Table

```sql
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  username VARCHAR(255),
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at DESC);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
```

### File Audit Logs Table

```sql
CREATE TABLE file_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  operation VARCHAR(20) NOT NULL CHECK (operation IN ('upload', 'download', 'delete', 'view', 'update')),
  success BOOLEAN NOT NULL DEFAULT true,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_path TEXT,
  mime_type VARCHAR(255),
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_file_audit_file_id ON file_audit_logs(file_id);
CREATE INDEX idx_file_audit_user_id ON file_audit_logs(user_id);
CREATE INDEX idx_file_audit_operation ON file_audit_logs(operation);
CREATE INDEX idx_file_audit_success ON file_audit_logs(success);
CREATE INDEX idx_file_audit_created_at ON file_audit_logs(created_at DESC);
CREATE INDEX idx_file_audit_file_name ON file_audit_logs(file_name);
```

## Type Definitions

### Backend Types (TypeBox)

```typescript
import { Type, Static } from '@sinclair/typebox';

// Login Attempt Schema
export const LoginAttemptSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  email: Type.Optional(Type.String({ format: 'email' })),
  username: Type.Optional(Type.String()),
  ipAddress: Type.String(),
  userAgent: Type.Optional(Type.String()),
  success: Type.Boolean(),
  failureReason: Type.Optional(LoginFailureReasonSchema),
  createdAt: Type.String({ format: 'date-time' }),
});

export type LoginAttempt = Static<typeof LoginAttemptSchema>;

// File Audit Log Schema
export const FileAuditLogSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  fileId: Type.String({ format: 'uuid' }),
  userId: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  operation: FileOperationSchema,
  success: Type.Boolean(),
  fileName: Type.String(),
  fileSize: Type.Optional(Type.Integer({ minimum: 0 })),
  filePath: Type.Optional(Type.String()),
  mimeType: Type.Optional(Type.String()),
  ipAddress: Type.String(),
  userAgent: Type.Optional(Type.String()),
  errorMessage: Type.Optional(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
});

export type FileAuditLog = Static<typeof FileAuditLogSchema>;
```

### Frontend Types (TypeScript)

```typescript
// apps/web/src/app/core/audit/models/audit.types.ts

export interface LoginAttempt {
  id: string;
  userId?: string | null;
  email?: string;
  username?: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  failureReason?: LoginFailureReason;
  createdAt: string;
}

export interface FileAuditLog {
  id: string;
  fileId: string;
  userId?: string | null;
  operation: FileOperation;
  success: boolean;
  fileName: string;
  fileSize?: number;
  filePath?: string;
  mimeType?: string;
  ipAddress: string;
  userAgent?: string;
  errorMessage?: string;
  createdAt: string;
}

export type FileOperation = 'upload' | 'download' | 'delete' | 'view' | 'update';

export type LoginFailureReason = 'INVALID_PASSWORD' | 'USER_NOT_FOUND' | 'ACCOUNT_DISABLED' | 'ACCOUNT_LOCKED' | 'EMAIL_NOT_VERIFIED';
```

## Testing

### Backend Unit Tests

```typescript
// login-attempts.service.spec.ts
import { LoginAttemptsService } from './login-attempts.service';

describe('LoginAttemptsService', () => {
  let service: LoginAttemptsService;

  beforeEach(() => {
    service = new LoginAttemptsService(mockRepository);
  });

  it('should create login attempt', async () => {
    const attempt = await service.create({
      email: 'test@example.com',
      ipAddress: '127.0.0.1',
      success: true,
    });

    expect(attempt.id).toBeDefined();
    expect(attempt.success).toBe(true);
  });

  it('should get statistics', async () => {
    const stats = await service.getStats();

    expect(stats.totalAttempts).toBeGreaterThan(0);
    expect(stats.successRate).toBeGreaterThanOrEqual(0);
    expect(stats.successRate).toBeLessThanOrEqual(100);
  });
});
```

### Backend Integration Tests

```typescript
// login-attempts.routes.spec.ts
import { buildApp } from '../../../app';

describe('Login Attempts Routes', () => {
  let app;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/login-attempts', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/login-attempts',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().success).toBe(true);
  });

  it('GET /api/login-attempts/stats', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/login-attempts/stats',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveProperty('totalAttempts');
  });
});
```

### Frontend Unit Tests

```typescript
// login-attempts.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoginAttemptsService } from './login-attempts.service';

describe('LoginAttemptsService', () => {
  let service: LoginAttemptsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoginAttemptsService],
    });

    service = TestBed.inject(LoginAttemptsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get login attempts', (done) => {
    const mockResponse = {
      success: true,
      data: [{ id: '1', email: 'test@example.com', success: true, createdAt: '2025-11-02' }],
      pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
    };

    service.getLoginAttempts({ page: 1, limit: 25 }).subscribe(() => {
      expect(service.loginAttempts()).toEqual(mockResponse.data);
      done();
    });

    const req = httpMock.expectOne('/login-attempts?page=1&limit=25');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
```

## Performance

### Database Optimization

#### Indexes

All audit tables have optimized indexes for common query patterns:

```sql
-- Login attempts indexes
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at DESC);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);

-- File audit logs indexes
CREATE INDEX idx_file_audit_created_at ON file_audit_logs(created_at DESC);
CREATE INDEX idx_file_audit_operation ON file_audit_logs(operation);
CREATE INDEX idx_file_audit_file_id ON file_audit_logs(file_id);
```

#### Query Performance

- **Pagination**: Always use `limit` and `offset` for large datasets
- **Date Range**: Use `startDate` and `endDate` filters
- **Indexes**: Ensure queries use indexed columns
- **Aggregation**: Statistics endpoints use database aggregation functions

### Frontend Optimization

#### Signal-Based State

- **Reactive Updates**: UI updates automatically when state changes
- **Minimal Re-renders**: Only affected components update
- **Computed Values**: Derived state computed efficiently

```typescript
// Computed pagination values
totalItems = computed(() => this.pagination()?.total || 0);
currentPage = computed(() => this.pagination()?.page || 1);
hasNext = computed(() => this.pagination()?.hasNext || false);
```

#### Lazy Loading

Routes are lazy-loaded for optimal bundle size:

```typescript
{
  path: 'audit',
  loadChildren: () => import('./core/audit/audit.routes').then(m => m.auditRoutes),
}
```

### Monitoring

#### Performance Metrics

Track these metrics for audit system performance:

- **API Response Time**: Target < 200ms for list endpoints
- **Database Query Time**: Target < 50ms per query
- **Frontend Load Time**: Target < 1s for initial load
- **Memory Usage**: Monitor state size for large datasets

#### Logging

```typescript
// Enable query logging in development
if (process.env.NODE_ENV === 'development') {
  // Log slow queries (>100ms)
  knex.on('query', (query) => {
    console.log('Query:', query.sql, 'Time:', query.duration);
  });
}
```

## Best Practices

### Backend

1. **Always track operations** - Log both success and failure
2. **Include context** - IP address, user agent, timestamps
3. **Use transactions** - For operations that create audit logs
4. **Validate input** - Use TypeBox schemas
5. **Handle errors** - Log failures with error messages

### Frontend

1. **Use services** - Don't call HTTP directly from components
2. **Leverage signals** - Use reactive state management
3. **Implement pagination** - Don't load all data at once
4. **Handle errors** - Show user-friendly error messages
5. **Test thoroughly** - Unit + integration tests

### Security

1. **Access control** - Require authentication for all endpoints
2. **Rate limiting** - Prevent abuse of audit endpoints
3. **Data privacy** - Never log sensitive data (passwords, tokens)
4. **Audit the auditors** - Track who accesses audit logs
5. **Encryption** - Encrypt audit data at rest and in transit

---

**Next Steps:**

- 📖 See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation
- 🏗️ See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
- 🐛 See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
