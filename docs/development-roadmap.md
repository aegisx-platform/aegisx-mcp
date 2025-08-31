# Development Roadmap & Architecture Alignment

> แผนการพัฒนาเรียงลำดับความสำคัญและการปรับ Architecture ให้สอดคล้องกัน

## 🎯 Architecture Alignment Review

### ✅ จุดที่ดีและสอดคล้องกันแล้ว

1. **Modern Stack Alignment**
   - Backend: Fastify + TypeScript + PostgreSQL
   - Frontend: Angular 19 + Signals + Standalone Components
   - Both: TypeScript-first, Type-safe approach

2. **Authentication Pattern**
   - JWT-based authentication ทั้งสองฝั่ง
   - Role-based access control (RBAC)
   - Session management concepts

3. **Development Workflow**
   - Nx monorepo structure
   - Shared libraries approach
   - Testing strategy (Unit + E2E)

### ⚠️ จุดที่ต้องปรับปรุง

#### 1. **API Response Format Mismatch** 🔴 Critical
```typescript
// Backend current (inconsistent)
res.send({ users, total, page });
res.send({ data: user });
res.send({ error: 'Not found' });

// Frontend expects (standardized)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}
```

#### 2. **State Management Pattern Mismatch** 🟡 High
- **Backend**: Traditional service pattern (no reactive state)
- **Frontend**: Signals-based reactive state
- **Gap**: WebSocket events ไม่ integrate กับ Signals โดยตรง

#### 3. **Error Handling Inconsistency** 🟡 High
- **Backend**: Mix of try-catch, reply.code(), throw
- **Frontend**: Expects structured ApiError type
- **Gap**: No unified error format

#### 4. **Multi-tenancy Implementation** 🟡 High
- **Backend**: Basic tenant isolation in docs
- **Frontend**: No tenant context in components
- **Gap**: Tenant switching, data isolation not implemented

#### 5. **Type Sharing Strategy** 🟠 Medium
- **Backend**: OpenAPI generates types
- **Frontend**: Imports from @org/api-client
- **Gap**: Types not always in sync, manual updates needed

## 📋 Prioritized Development Plan

### ✅ Phase 0: Bootstrap & Setup (Completed)

#### **Bootstrap Script & NPM Package** ✅ v1.0.4
- ✅ Created bootstrap.sh script that generates complete Nx monorepo
- ✅ Published npm package @aegisx/create-app
- ✅ Creates 3 apps: api (Fastify), web (Angular), admin (Angular)
- ✅ All apps run immediately after generation
- ✅ Proper TypeScript version for Angular compatibility
- ✅ Git hooks setup with Husky
- ✅ Docker compose configuration
- ✅ Complete documentation included

**Usage:**
```bash
npx @aegisx/create-app my-project
cd my-project
nx serve api    # http://localhost:3333
nx serve web    # http://localhost:4200
nx serve admin  # http://localhost:4201
```

### 🚨 Phase 1: Critical Foundation (Week 1-2)

#### 1.1 **Standardize API Response Format** (Day 1-2)
```typescript
// Create shared response types
// libs/shared/api-types/src/lib/responses.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  pagination?: Pagination;
  meta?: Record<string, any>;
}

// Backend plugin to enforce
// apps/api/src/plugins/api-response.ts
export const apiResponsePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateReply('success', function(data: any, meta?: any) {
    return this.send({
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString()
    });
  });
  
  fastify.decorateReply('error', function(error: ApiError) {
    return this.code(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  });
};
```

#### 1.2 **Create Shared Type Library** (Day 3-4)
```bash
# Generate shared types library
nx g @nx/js:library shared-types --directory=libs/shared --tags=scope:shared,type:types

# Structure
libs/shared/types/
├── api/          # API contracts
├── models/       # Domain models  
├── dto/          # DTOs
└── enums/        # Shared enums
```

#### 1.3 **Implement Error Handling System** (Day 5-6)
```typescript
// Unified error handler
// libs/shared/errors/src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Backend global error handler
fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof ApiError) {
    return reply.error(error);
  }
  // Handle other errors
});
```

#### 1.4 **Setup API Client Configuration** (Day 7-8)
```typescript
// Frontend HTTP interceptor
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError: ApiError = {
        statusCode: error.status,
        code: error.error?.error?.code || 'UNKNOWN',
        message: error.error?.error?.message || error.message
      };
      return throwError(() => apiError);
    })
  );
};
```

### 🔧 Phase 2: Core Services Alignment (Week 3-4)

#### 2.1 **Auth Service Synchronization**
- [ ] Align token refresh mechanism
- [ ] Implement session timeout handling
- [ ] Add WebSocket authentication
- [ ] Create auth state signals

```typescript
// Backend WebSocket auth
fastify.io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const payload = fastify.jwt.verify(token);
    socket.data.user = payload;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

// Frontend WebSocket with auth
const socket = io({
  auth: {
    token: this.authService.accessToken()
  },
  autoConnect: false
});
```

#### 2.2 **Implement Tenant Context**
```typescript
// Backend tenant middleware
export const tenantMiddleware: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'] || 
                     request.user?.tenantId;
    request.tenantId = tenantId;
  });
};

// Frontend tenant service
@Injectable({ providedIn: 'root' })
export class TenantService {
  private _currentTenant = signal<Tenant | null>(null);
  readonly currentTenant = this._currentTenant.asReadonly();
  
  setTenant(tenant: Tenant): void {
    this._currentTenant.set(tenant);
    // Update HTTP headers
    this.updateHttpHeaders(tenant.id);
  }
}
```

### 🚀 Phase 3: Feature Implementation (Week 5-8)

#### 3.1 **CRUD Generator Enhancement** (Week 5)
- [ ] Generate both backend + frontend code
- [ ] Include Signals-based services
- [ ] Add form generation
- [ ] Create test templates

```bash
# Enhanced CRUD command
npm run generate:crud -- --name=Product --fields="name:string,price:number,categoryId:uuid" --frontend --backend --tests
```

#### 3.2 **Real-time Data Sync** (Week 6)
```typescript
// Backend real-time events
export class RealtimeService {
  emitToTenant(tenantId: string, event: string, data: any) {
    this.io.to(`tenant:${tenantId}`).emit(event, {
      type: event,
      data,
      timestamp: new Date().toISOString()
    });
  }
}

// Frontend real-time integration
export class RealtimeDataService {
  private socket = inject(SocketService);
  
  syncCollection<T>(resource: string) {
    const items = signal<T[]>([]);
    
    // Listen to CRUD events
    this.socket.on(`${resource}:created`, (item: T) => {
      items.update(current => [...current, item]);
    });
    
    this.socket.on(`${resource}:updated`, (item: T) => {
      items.update(current => 
        current.map(i => i.id === item.id ? item : i)
      );
    });
    
    return items.asReadonly();
  }
}
```

#### 3.3 **File Upload Integration** (Week 7)
- [ ] Backend: S3/local storage strategy
- [ ] Frontend: Drag & drop component
- [ ] Progress tracking with Signals
- [ ] Image preview/cropping

#### 3.4 **Advanced Search** (Week 8)
- [ ] Backend: Elasticsearch integration
- [ ] Frontend: Search UI components
- [ ] Faceted search
- [ ] Search analytics

### 🎨 Phase 4: UI/UX Implementation (Week 9-10)

#### 4.1 **@aegisx-ui Core Components**
Priority order:
1. **DataTable** - Most complex, most used
2. **Form Components** - Critical for CRUD
3. **Navigation** - App structure
4. **Card/Button** - Basic building blocks
5. **Alert/Toast** - User feedback

#### 4.2 **Layout System**
1. **Admin Layout** - Primary use case
2. **Empty Layout** - Auth pages
3. **Modern Layout** - Dashboard style

### 📊 Phase 5: Optimization & Polish (Week 11-12)

#### 5.1 **Performance Optimization**
- [ ] Backend: Query optimization, caching
- [ ] Frontend: Lazy loading, virtual scrolling
- [ ] API: Response compression, CDN
- [ ] Database: Indexing, connection pooling

#### 5.2 **Monitoring & Analytics**
- [ ] OpenTelemetry integration
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] User analytics

## 🎯 Critical Success Factors

### 1. **API Contract First** 🔴
Must be done before any feature development:
```typescript
// Every endpoint must return
ApiResponse<T> format

// Every error must be
ApiError format

// Every paginated response must include
Pagination metadata
```

### 2. **Type Safety Throughout** 🔴
```typescript
// No 'any' types in API boundaries
// All models from shared library
// OpenAPI spec always in sync
```

### 3. **Consistent State Management** 🟡
```typescript
// Frontend: Signals for all state
// Backend: Stateless services
// WebSocket: Event-driven updates
```

## 📈 Metrics for Success

1. **Week 2**: All API responses standardized
2. **Week 4**: Auth fully integrated with WebSocket
3. **Week 6**: CRUD generator producing full-stack code
4. **Week 8**: Real-time sync working
5. **Week 10**: Core UI components complete
6. **Week 12**: Production-ready with monitoring

## 🚦 Go/No-Go Checkpoints

### Checkpoint 0 (Bootstrap - Completed) ✅
- [x] Bootstrap script created ✅
- [x] NPM package published ✅
- [x] All apps run successfully ✅
- **Decision**: Foundation ready, proceed to Phase 1 ✅

### Checkpoint 1 (End of Week 2)
- [ ] API responses standardized
- [ ] Error handling consistent
- [ ] Type library created
- **Decision**: Proceed to Phase 2

### Checkpoint 2 (End of Week 4)
- [ ] Auth synchronized ✅
- [ ] Tenant context working ✅
- [ ] WebSocket authenticated ✅
- **Decision**: Proceed to Phase 3 ✅

### Checkpoint 3 (End of Week 8)
- [ ] CRUD generator complete ✅
- [ ] Real-time sync working ✅
- [ ] Core features implemented ✅
- **Decision**: Proceed to Phase 4 ✅

## 🎯 Immediate Actions (Next)

1. **Create API Response Plugin** (2 hours)
   ```bash
   # After bootstrapping a new project:
   cd apps/api/src
   mkdir plugins
   touch plugins/api-response.ts
   ```

2. **Generate Shared Types Library** (1 hour)
   ```bash
   nx g @nx/js:library shared-types --directory=libs/shared
   ```

3. **Update First Endpoint** (1 hour)
   - Choose `/api/users` as pilot
   - Implement new response format
   - Test with frontend

4. **Document API Standards** (1 hour)
   - Create `API-STANDARDS.md`
   - Define response formats
   - Create examples

## 💡 Architecture Adjustments Summary

### Backend Adjustments Needed:
1. 🟡 Standardize all API responses
2. 🟡 Implement structured error handling  
3. 🟡 Add WebSocket authentication
4. 🟡 Enhance multi-tenancy support
5. 🟡 Create event emission standards

### Frontend Adjustments Needed:
1. 🟡 Create shared type imports
2. 🟡 Add tenant context to services
3. 🟡 Implement WebSocket integration
4. 🟡 Standardize error handling
5. 🟡 Add real-time state sync

### Shared/Infrastructure:
1. ✅ Bootstrap script & NPM package
2. 🟡 Create shared types library
3. 🟡 Implement OpenAPI automation
4. 🟡 Setup E2E testing pipeline
5. 🟡 Add performance monitoring
6. 🟡 Create deployment scripts

---

> 🚀 **Completed**: Bootstrap Script & NPM Package v1.0.4 - Foundation is ready!
> 
> 🎯 **Next Step**: Start with API Response Standardization - it's the foundation everything else builds on!