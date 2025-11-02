# API Calling Standard

> **MANDATORY: How to call APIs correctly in AegisX Platform**

## 📋 Overview

AegisX uses a **standardized API calling pattern** with automatic `/api` prefix handling. All developers MUST follow this standard to ensure consistency across the codebase.

---

## 🎯 The Standard Pattern

### ✅ CORRECT: Call APIs WITHOUT `/api` prefix in services

```typescript
// ✅ CORRECT - Let interceptor handle /api prefix
this.http.post('/auth/login', credentials);
this.http.get('/users');
this.http.put('/users/{id}', data);
this.http.delete('/users/{id}');
```

### ❌ WRONG: Including `/api` prefix in services

```typescript
// ❌ WRONG - Will result in /api/api/auth/login
this.http.post('/api/auth/login', credentials);
this.http.get('/api/users');
```

---

## 🏗️ How It Works

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Angular Service                                               │
│    this.http.post('/auth/login', ...)                           │
│    URL: /auth/login                                              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 2. BaseUrlInterceptor (Automatic)                                │
│    Adds /api prefix for relative URLs                            │
│    URL: /auth/login → /api/auth/login                            │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 3. Development Proxy (proxy.conf.js)                             │
│    Routes /api/* to backend                                       │
│    URL: /api/auth/login → http://localhost:3333/api/auth/login  │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend API (Fastify)                                         │
│    Receives: POST http://localhost:3333/api/auth/login          │
│    Routes: /api/auth/login                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### 1. BaseUrlInterceptor

**File:** `apps/web/src/app/core/http/interceptors/base-url.interceptor.ts`

**What it does:**

- Automatically adds `/api` prefix to relative URLs
- Skips absolute URLs (http://, https://)
- Skips excluded patterns (assets, static files, etc.)

```typescript
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip absolute URLs
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }

  // Skip excluded patterns (assets, static, etc.)
  if (shouldSkipApiPrefix(req.url)) {
    return next(req);
  }

  // Add /api prefix
  const apiReq = req.clone({
    url: `/api${req.url}`,
  });

  return next(apiReq);
};
```

### 2. Development Proxy

**File:** `apps/web/proxy.conf.js`

**What it does:**

- Routes `/api/*` requests to backend API
- Routes `/ws/*` requests to WebSocket server
- Automatically uses port from `.env.local`

```javascript
module.exports = {
  '/api': {
    target: `http://localhost:${API_PORT}`, // From .env.local
    secure: false,
    changeOrigin: true,
  },
  '/ws': {
    target: `http://localhost:${API_PORT}`,
    ws: true,
  },
};
```

### 3. Environment Configuration

**File:** `apps/web/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: '', // Empty in development - use proxy
};
```

**File:** `apps/web/src/environments/environment.production.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: '', // Empty in production - same domain /api
};
```

---

## 📖 Service Implementation Examples

### Authentication Service

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // ✅ CORRECT: Use relative URLs without /api prefix
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/login', credentials);
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/register', userData);
  }

  logout(): Observable<any> {
    return this.http.post('/auth/logout', {});
  }

  getProfile(): Observable<User> {
    return this.http.get<User>('/profile');
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/refresh', { refreshToken });
  }
}
```

### User Service

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  // ✅ CORRECT: All CRUD operations without /api prefix
  getUsers(params?: any): Observable<PagedResponse<User>> {
    return this.http.get<PagedResponse<User>>('/users', { params });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/users/${id}`);
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.http.post<User>('/users', data);
  }

  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`/users/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`/users/${id}`);
  }
}
```

### CRUD Generator Pattern

```typescript
// Generated by aegisx-crud
@Injectable({ providedIn: 'root' })
export class BooksService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/books'; // ✅ CORRECT: No /api prefix

  findAll(params?: any): Observable<PagedResponse<Book>> {
    return this.http.get<PagedResponse<Book>>(this.apiUrl, { params });
  }

  findOne(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateBookDto): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, data);
  }

  update(id: string, data: UpdateBookDto): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

## 🚨 Common Mistakes to AVOID

### ❌ Mistake 1: Including `/api` prefix

```typescript
// ❌ WRONG
this.http.post('/api/auth/login', ...)
// Result: /api/api/auth/login (double prefix!)
```

**Why it's wrong:** BaseUrlInterceptor will add `/api` automatically, resulting in `/api/api/auth/login`

### ❌ Mistake 2: Using hardcoded full URLs

```typescript
// ❌ WRONG
this.http.post('http://localhost:3333/api/auth/login', ...)
```

**Why it's wrong:**

- Breaks in production (different domain)
- Bypasses proxy in development
- Not flexible for different environments

### ❌ Mistake 3: Inconsistent URL patterns

```typescript
// ❌ WRONG - Inconsistent patterns
this.http.get('/api/users'); // Has /api prefix
this.http.get('/roles'); // No /api prefix
this.http.get('http://...'); // Absolute URL
```

**Why it's wrong:** Causes confusion and makes code hard to maintain

### ❌ Mistake 4: Missing leading slash

```typescript
// ❌ WRONG
this.http.get('users');
// Result: Might be treated as relative to current route
```

**Why it's wrong:** Should use `/users` (with leading slash) for consistent behavior

---

## 📚 Reference: Swagger/OpenAPI Documentation

**Development:** `http://127.0.0.1:3333/documentation`
**JSON Spec:** `http://127.0.0.1:3333/documentation/json`

### How to Use Swagger Docs

**1. Find Available Endpoints:**

```bash
# List all endpoints
curl -s http://127.0.0.1:3333/documentation/json | jq -r '.paths | keys[]'

# Example output:
# /api/auth/login
# /api/auth/register
# /api/users
# /api/users/{id}
```

**2. Check Endpoint Details:**

```bash
# Get specific endpoint info
curl -s http://127.0.0.1:3333/documentation/json | \
  jq '.paths["/api/auth/login"]'
```

**3. Service Implementation from Swagger:**

**Step 1:** Find endpoint in Swagger (e.g., `/api/auth/login`)
**Step 2:** Remove `/api` prefix: `/api/auth/login` → `/auth/login`
**Step 3:** Use in service:

```typescript
// From Swagger: POST /api/auth/login
// In service: POST /auth/login
this.http.post('/auth/login', credentials);
```

---

## 🎯 Best Practices

### 1. Always Check Swagger Documentation First

**Before implementing a service:**

```bash
# 1. Open Swagger UI
open http://127.0.0.1:3333/documentation

# 2. Find the endpoint you need
# Example: /api/users/{id}

# 3. Check request/response schemas
# - Request body format
# - Response format
# - Required fields
# - Optional fields
```

### 2. Follow URL Naming Conventions

```typescript
// ✅ CORRECT - RESTful resource paths
'/users'; // Collection
'/users/{id}'; // Single resource
'/users/{id}/roles'; // Sub-resource

// ✅ CORRECT - Auth endpoints
'/auth/login';
'/auth/register';
'/auth/verify-email';

// ❌ WRONG - Non-standard patterns
'/getUsers'; // Use GET /users instead
'/user_by_id/{id}'; // Use /users/{id} instead
'/Auth/Login'; // Use lowercase
```

### 3. Use TypeScript Interfaces from Swagger

**Generate types from Swagger spec:**

```typescript
// schemas/auth.schemas.ts (from OpenAPI)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

// Use in service
login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>('/auth/login', credentials);
}
```

### 4. Handle Errors Consistently

```typescript
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

someApiCall(): Observable<T> {
  return this.http.get<T>('/endpoint')
    .pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle error
        console.error('API Error:', error);
        return throwError(() => error);
      })
    );
}
```

### 5. Use Query Parameters Correctly

```typescript
// ✅ CORRECT - Use HttpParams
import { HttpParams } from '@angular/common/http';

getUsers(page: number, limit: number): Observable<PagedResponse<User>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  return this.http.get<PagedResponse<User>>('/users', { params });
}

// ❌ WRONG - String concatenation
getUsers(page: number, limit: number): Observable<PagedResponse<User>> {
  return this.http.get<PagedResponse<User>>(
    `/users?page=${page}&limit=${limit}`
  );
}
```

---

## 🔍 Debugging API Calls

### Enable Debug Logging

**Temporary debugging:**

```typescript
// In base-url.interceptor.ts
if (!environment.production) {
  console.log(`[BaseUrlInterceptor] ${req.method} ${req.url} → ${apiReq.url}`);
}
```

**Network tab inspection:**

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter: `XHR` or `Fetch`
4. Check request URL, headers, body

**Expected URLs:**

```
Development:
  Request:  POST http://localhost:4200/api/auth/login
  Proxied:  POST http://localhost:3333/api/auth/login

Production:
  Request:  POST https://yourdomain.com/api/auth/login
  Backend:  Same domain
```

### Common Debug Scenarios

**Problem:** API call returns 404

```bash
# Check 1: Verify endpoint exists in Swagger
curl -s http://127.0.0.1:3333/documentation/json | \
  jq -r '.paths | keys[]' | grep "users"

# Check 2: Verify URL format
# Service: /users
# Interceptor: /api/users
# Proxy: http://localhost:3333/api/users
```

**Problem:** CORS errors

```bash
# Check 1: Verify proxy is running
# Development: proxy.conf.js should handle CORS

# Check 2: Check proxy logs
# Should see: [HPM] Proxy created: /api -> http://localhost:3333
```

**Problem:** Double `/api/api/` prefix

```bash
# Root cause: Service has /api prefix already
# Fix: Remove /api from service URL
# Before: this.http.get('/api/users')
# After:  this.http.get('/users')
```

---

## 📋 Checklist for New Services

When creating a new service, verify:

- [ ] Check Swagger docs for endpoint: `http://127.0.0.1:3333/documentation`
- [ ] Remove `/api` prefix from URL
- [ ] Use relative URLs (start with `/`)
- [ ] Use TypeScript interfaces from schemas
- [ ] Test in development (proxy should work)
- [ ] Test in production build (same-domain API)
- [ ] Handle errors consistently
- [ ] Use HttpParams for query strings
- [ ] Follow RESTful conventions

---

## 🚀 Production Deployment

### URL Resolution in Production

**Development:**

```
Frontend:  http://localhost:4200
API:       http://localhost:3333
Proxy:     Routes /api -> http://localhost:3333/api
```

**Production:**

```
Frontend:  https://yourdomain.com
API:       https://yourdomain.com/api (same domain)
No proxy:  Browser directly calls /api endpoints
```

**Environment-specific behavior:**

```typescript
// Service code (same in dev and prod)
this.http.post('/auth/login', credentials);

// Development:
// 1. Interceptor: /auth/login → /api/auth/login
// 2. Proxy:       /api/auth/login → http://localhost:3333/api/auth/login

// Production:
// 1. Interceptor: /auth/login → /api/auth/login
// 2. Browser:     /api/auth/login → https://yourdomain.com/api/auth/login
```

---

## 🎓 Training Examples

### Example 1: Creating Books Service

**Step 1:** Check Swagger docs

```bash
curl -s http://127.0.0.1:3333/documentation/json | \
  jq '.paths | keys[]' | grep books

# Output:
# /api/books
# /api/books/{id}
```

**Step 2:** Create service

```typescript
@Injectable({ providedIn: 'root' })
export class BooksService {
  private http = inject(HttpClient);

  // Remove /api from Swagger paths
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>('/books'); // ✅ No /api
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`/books/${id}`); // ✅ No /api
  }
}
```

**Step 3:** Test

```typescript
// In component
this.booksService.getBooks().subscribe((books) => {
  console.log('Books:', books);
});
```

**Expected network request:**

```
URL: http://localhost:4200/api/books
     ↓ (proxy)
     http://localhost:3333/api/books
```

---

## 📖 Related Documentation

- **[BaseUrlInterceptor Source](../../apps/web/src/app/core/http/interceptors/base-url.interceptor.ts)** - Implementation
- **[Proxy Configuration](../../apps/web/proxy.conf.js)** - Development proxy setup
- **[Swagger Documentation](http://127.0.0.1:3333/documentation)** - API reference
- **[CRUD Generator Quick Reference](../crud-generator/QUICK_REFERENCE.md)** - Auto-generated services

---

## ❓ FAQ

**Q: Why not include `/api` in service URLs?**
A: BaseUrlInterceptor adds it automatically. This provides flexibility and centralized management.

**Q: What if I need to call an external API?**
A: Use absolute URLs (http:// or https://). These bypass the interceptor.

**Q: How do I call endpoints without `/api` prefix?**
A: Add patterns to `SKIP_API_PREFIX_PATTERNS` in base-url.interceptor.ts

**Q: Where do I find the exact API endpoint paths?**
A: Check Swagger docs at http://127.0.0.1:3333/documentation (remove `/api` prefix when using in services)

**Q: What if the API endpoint has `/api` twice in URL?**
A: You included `/api` in your service URL. Remove it and let the interceptor add it.

**Q: How do I test API calls in production?**
A: Build production (`pnpm run build:web`), deploy to server, and verify `/api` calls work on same domain.

**Q: Can I disable BaseUrlInterceptor?**
A: Not recommended. If needed, use absolute URLs or add exclusion patterns.

---

**Last Updated:** 2025-11-02
**Maintained By:** AegisX Platform Team
**Version:** 1.0.0
