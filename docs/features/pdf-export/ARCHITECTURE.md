# PDF Export - Architecture

> **System design, technical decisions, and architectural patterns**

**Last Updated:** 2025-10-31
**Version:** 1.0.0
**Architects:** Development Team

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Design Decisions](#design-decisions)
- [Trade-offs](#trade-offs)
- [Security Considerations](#security-considerations)
- [Performance Considerations](#performance-considerations)
- [Future Improvements](#future-improvements)

---

## 🏗️ System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Components │  │  Services  │  │   Dialogs  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└────────────────────────┬────────────────────────────────────┘
                        │ HTTP/WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                       Backend Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Controller │─▶│  Service   │─▶│ Repository │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└────────────────────────┬────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼─────┐ ┌──────▼──────┐
│  PostgreSQL  │ │   Redis    │ │  WebSocket  │
│   Database   │ │   Cache    │ │   Events    │
└──────────────┘ └────────────┘ └─────────────┘
```

### Technology Stack

**Frontend:**
- Angular 19+ with Signals (reactive state)
- Angular Material + TailwindCSS (UI)
- RxJS (async operations)
- TypeScript (type safety)

**Backend:**
- Fastify 4+ (web framework)
- TypeBox (schema validation)
- Knex.js (query builder)
- Socket.io (WebSocket)

**Infrastructure:**
- PostgreSQL 15+ (primary database)
- Redis (caching & sessions)
- Docker (containerization)

---

## 🧩 Component Architecture

### Backend Components

#### 1. Controller Layer

**Responsibility:** Request handling and validation

```typescript
class FeatureController {
  // Handles HTTP requests
  // Delegates to service layer
  // Returns formatted responses
}
```

**Principles:**
- Thin controllers (no business logic)
- Input validation via schemas
- Output formatting
- Error handling delegation

#### 2. Service Layer

**Responsibility:** Business logic and orchestration

```typescript
class FeatureService {
  // Business logic
  // Multi-repository coordination
  // Cache management
  // Event emission
}
```

**Principles:**
- Single responsibility
- Dependency injection
- Transaction management
- Side effect handling

#### 3. Repository Layer

**Responsibility:** Data access and persistence

```typescript
class FeatureRepository extends BaseRepository {
  // CRUD operations
  // Query building
  // Data mapping
}
```

**Principles:**
- Abstraction over database
- Reusable query patterns
- Type safety
- UUID validation

### Frontend Components

#### 1. Smart Components (Containers)

```typescript
// Feature list component
- Manages state
- Handles user interactions
- Coordinates child components
```

#### 2. Presentation Components

```typescript
// Form components, dialogs
- Receives data via @Input
- Emits events via @Output
- No direct API calls
```

#### 3. Services

```typescript
// Feature service
- API communication
- State management (Signals)
- WebSocket subscriptions
```

---

## 🔄 Data Flow

### Create Operation Flow

```
User Action (Frontend)
  │
  ▼
Component calls service.create()
  │
  ▼
HTTP POST to backend API
  │
  ▼
Controller validates request
  │
  ▼
Service processes business logic
  │
  ▼
Repository saves to database
  │
  ▼
[Optional] Event emitted via Socket.io
  │
  ▼
Response sent to frontend
  │
  ▼
Frontend updates state (Signal)
  │
  ▼
UI automatically re-renders
```

### Read Operation Flow (with Cache)

```
Frontend requests data
  │
  ▼
Backend checks Redis cache
  │
  ├─ Cache HIT ─▶ Return cached data
  │
  └─ Cache MISS
      │
      ▼
  Query PostgreSQL
      │
      ▼
  Store in Redis cache
      │
      ▼
  Return data to frontend
```

---

## 🎯 Design Decisions

### 1. Repository Pattern

**Decision:** Use repository pattern for data access

**Rationale:**
- ✅ Abstracts database implementation
- ✅ Enables easy testing (mock repositories)
- ✅ Centralizes data access logic
- ✅ Supports multiple data sources

**Trade-offs:**
- ❌ Extra layer of abstraction
- ❌ Slightly more boilerplate code

### 2. Signal-Based State Management

**Decision:** Use Angular Signals for state

**Rationale:**
- ✅ Better performance (fine-grained reactivity)
- ✅ Simpler API than RxJS
- ✅ Built-in to Angular 19+
- ✅ Automatic change detection

**Trade-offs:**
- ❌ Learning curve for team
- ❌ Less ecosystem maturity vs RxJS

### 3. TypeBox for Validation

**Decision:** Use TypeBox instead of Zod or Joi

**Rationale:**
- ✅ Single source of truth (schema → types)
- ✅ Better performance than Joi
- ✅ Native TypeScript integration
- ✅ OpenAPI schema generation

**Trade-offs:**
- ❌ Smaller community than Zod
- ❌ Less validation helpers

### 4. Permission-Based Authorization

**Decision:** Use `verifyPermission` instead of role-based

**Rationale:**
- ✅ Fine-grained access control
- ✅ Database-backed permissions
- ✅ Redis caching for performance
- ✅ Wildcard support (`*:*`)

**Trade-offs:**
- ❌ Slightly more complex setup
- ❌ Requires permission seeding

---

## ⚖️ Trade-offs

### Monorepo vs Multi-Repo

**Chose:** Nx Monorepo

**Advantages:**
- ✅ Code sharing easy
- ✅ Atomic commits across features
- ✅ Consistent tooling

**Disadvantages:**
- ❌ Larger repository size
- ❌ Complex build configuration
- ❌ Coordination overhead

### REST vs GraphQL

**Chose:** REST API

**Advantages:**
- ✅ Simpler implementation
- ✅ Better caching
- ✅ Easier debugging

**Disadvantages:**
- ❌ Over-fetching data
- ❌ Multiple requests needed
- ❌ No schema stitching

---

## 🔒 Security Considerations

### Authentication

- JWT tokens with expiry
- Refresh token rotation
- Secure cookie storage

### Authorization

- Permission-based access control
- Resource-level permissions
- Admin wildcard support (`*:*`)

### Data Protection

- Input validation (TypeBox)
- Output sanitization
- SQL injection prevention (Knex)
- XSS prevention (Angular)

### API Security

- Rate limiting (per IP/user)
- CORS configuration
- CSRF protection
- Security headers

---

## ⚡ Performance Considerations

### Backend Optimization

**1. Caching Strategy**
```typescript
// Cache frequently accessed data
const cacheKey = `features:${id}`;
let data = await redis.get(cacheKey);

if (!data) {
  data = await db.query(...);
  await redis.setex(cacheKey, 3600, data);
}
```

**2. Database Indexes**
```sql
-- Add indexes for common queries
CREATE INDEX idx_features_user_id ON features(user_id);
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_features_created_at ON features(created_at);
```

**3. Query Optimization**
- Use pagination for large datasets
- Minimize N+1 queries
- Use database joins strategically

### Frontend Optimization

**1. Lazy Loading**
```typescript
// Load feature module only when needed
const routes = [
  {
    path: 'features',
    loadChildren: () => import('./features/feature.module')
  }
];
```

**2. Change Detection**
```typescript
// Use OnPush for better performance
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

**3. Signal Benefits**
- Fine-grained reactivity
- Automatic dependency tracking
- Minimal re-renders

---

## 🚀 Future Improvements

### Short Term (v1.1)

- [ ] Add GraphQL gateway
- [ ] Implement request batching
- [ ] Enhanced caching strategy
- [ ] Performance monitoring

### Medium Term (v1.2)

- [ ] Microservices split
- [ ] Event-driven architecture
- [ ] CQRS pattern for complex queries
- [ ] Real-time collaboration

### Long Term (v2.0)

- [ ] Multi-tenancy support
- [ ] Horizontal scaling
- [ ] CDN integration
- [ ] Advanced analytics

---

## 📊 Metrics & Monitoring

### Performance Metrics

- API response time: < 100ms (p95)
- Database query time: < 50ms (p95)
- Cache hit rate: > 80%
- WebSocket latency: < 50ms

### Availability Metrics

- Uptime SLA: 99.9%
- Error rate: < 0.1%
- Success rate: > 99.9%

---

## 📚 Related Documentation

- [Developer Guide](./DEVELOPER_GUIDE.md) - Implementation details
- [API Reference](./API_REFERENCE.md) - API documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production setup

---

**Architect:** Development Team
**Last Review:** 2025-10-31
**Next Review:** 2025-10-31 + 3 months
