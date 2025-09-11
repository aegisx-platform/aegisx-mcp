# Universal Full-Stack Development Standard

> **🚨 MANDATORY**: มาตรฐานสำหรับทุก feature ทุกครั้ง - ไม่มีข้อยกเว้น

## 🎯 สำหรับทุกการพัฒนา Feature

**ใช้ได้กับ:** Auth, Users, Settings, Navigation, Dashboard, Reports, Products, Orders, หรือ feature อื่นๆ ทั้งหมด

## 📋 Phase 1: Database Schema (ฐานข้อมูลก่อน)

### 1.1 Database Migration & Schema FIRST

**🚨 MANDATORY: Database schema ต้องเสร็จก่อน API spec**

```bash
# 1. สร้าง migration (ถ้าต้องการ table ใหม่)
npx knex migrate:make create_{MODULE}_table

# 2. เขียน migration
# database/migrations/xxx_create_{MODULE}_table.ts
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('{MODULE}s', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    // Indexes for performance
    table.index(['is_active']);
    table.index(['created_at']);
  });
}

# 3. รัน migration
npx knex migrate:latest

# 4. อัพเดต seeds (ถ้าจำเป็น)
npx knex seed:make {MODULE}_seed

# 5. รัน seeds
npx knex seed:run
```

### 1.2 Verify Database Schema

```bash
# เช็คว่า table ถูกสร้างแล้ว
psql $DATABASE_URL -c "\d {MODULE}s"

# เช็ค columns และ types
psql $DATABASE_URL -c "\d+ {MODULE}s"

# ทดสอบ insert/select บน table ใหม่
psql $DATABASE_URL -c "INSERT INTO {MODULE}s (name, description) VALUES ('test', 'test description')"
psql $DATABASE_URL -c "SELECT * FROM {MODULE}s LIMIT 1"
```

## 📋 Phase 2: API Specification (ออกแบบตาม Database)

### 2.1 Read Existing OpenAPI Spec

```bash
# ดู endpoints ทั้งหมด
curl -s "http://localhost:3333/api-docs/json" | jq '.paths | keys'

# ดู specific module endpoints (เปลี่ยน {MODULE} เป็น auth, users, settings, ฯลฯ)
curl -s "http://localhost:3333/api-docs/json" | jq '.paths' | grep "/api/{MODULE}"
```

### 1.2 Check API Routes File

```bash
# อ่าน routes definition (เปลี่ยน {MODULE} ตามที่ทำงาน)
cat apps/api/src/modules/{MODULE}/{MODULE}.routes.ts

# เช็ค URL pattern: /api/{MODULE}/{ENDPOINT}
grep -n "url:" apps/api/src/modules/{MODULE}/{MODULE}.routes.ts
```

### 1.3 Check Schema Definitions

```bash
# อ่าน TypeBox schemas (เปลี่ยน {MODULE})
cat apps/api/src/modules/{MODULE}/{MODULE}.schemas.ts
```

**สำคัญ:** ทุก module ต้องมี pattern เดียวกัน:

- `apps/api/src/modules/{MODULE}/{MODULE}.routes.ts`
- `apps/api/src/modules/{MODULE}/{MODULE}.schemas.ts`
- URL pattern: `/api/{MODULE}/{ACTION}`

## 📋 Phase 3: Backend Verification (ทดสอบ API)

### 3.1 Test Endpoints Work

```bash
# ทดสอบ GET endpoint
curl -X GET "http://localhost:3333/api/{MODULE}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" # ถ้าต้องการ auth

# ทดสอบ POST endpoint
curl -X POST "http://localhost:3333/api/{MODULE}" \
  -H "Content-Type: application/json" \
  -d '{"field1":"value1","field2":"value2"}'

# ควรได้ HTTP 200/201 + expected response
```

### 3.2 Test Error Cases

```bash
# ทดสอบ validation errors
curl -X POST "http://localhost:3333/api/{MODULE}" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'

# ควรได้ HTTP 400 + validation errors

# ทดสอบ unauthorized (ถ้าต้องการ auth)
curl -X GET "http://localhost:3333/api/{MODULE}/protected-endpoint"
# ควรได้ HTTP 401
```

## 📋 Phase 4: Frontend Implementation (เขียน Frontend)

### 4.1 Check Environment Configuration

```bash
# ต้องเป็น port 3333
grep "apiUrl" apps/web/src/environments/environment.ts
# ต้องได้: 'http://localhost:3333'
```

### 4.2 Create TypeScript Interfaces (ตรงกับ API Schema)

```typescript
// ต้องตรงกับ {MODULE}.schemas.ts
interface {MODULE}Request {
  // fields ตรงกับ backend schema
  field1: string;
  field2: number;
  field3?: boolean; // optional fields
}

interface {MODULE}Response {
  success: boolean;
  data: {
    // response structure ตรงกับ backend
    id: string;
    ...otherFields;
  };
  meta: ApiMeta;
}

interface {MODULE}ListResponse {
  success: boolean;
  data: {MODULE}[];
  pagination: PaginationMeta;
  meta: ApiMeta;
}
```

### 4.3 Implement Service with Correct URLs

```typescript
// Pattern สำหรับทุก module
export class {MODULE}Service {
  private baseUrl = `${environment.apiUrl}/api/{MODULE}`;

  // GET list
  getAll(params?: QueryParams) {
    return this.http.get<{MODULE}ListResponse>(
      `${this.baseUrl}`, { params }
    );
  }

  // GET by ID
  getById(id: string) {
    return this.http.get<{MODULE}Response>(
      `${this.baseUrl}/${id}`
    );
  }

  // POST create
  create(data: {MODULE}Request) {
    return this.http.post<{MODULE}Response>(
      `${this.baseUrl}`, data
    );
  }

  // PUT update
  update(id: string, data: Partial<{MODULE}Request>) {
    return this.http.put<{MODULE}Response>(
      `${this.baseUrl}/${id}`, data
    );
  }

  // DELETE
  delete(id: string) {
    return this.http.delete<SuccessResponse>(
      `${this.baseUrl}/${id}`
    );
  }
}
```

## 📋 Phase 4: Frontend-Backend Alignment (ตรวจสอบ Sync)

### 4.1 URL Pattern Check

```bash
# เช็คว่าทุก endpoint มี /api prefix (เปลี่ยน {MODULE})
grep -n "environment.apiUrl.*{MODULE}" apps/web/src/app/services/{MODULE}.service.ts

# ทุก URL ต้องมี /api/{MODULE}/ ไม่ใช่ /{MODULE}/
grep -c "/api/{MODULE}" apps/web/src/app/services/{MODULE}.service.ts
# ต้องได้จำนวน > 0
```

### 4.2 Schema Consistency Check

```bash
# เปรียบเทียบ request/response types
# Backend: {MODULE}.schemas.ts
# Frontend: {MODULE}.types.ts หรือ {MODULE}.service.ts interfaces

# เช็คว่าฟิลด์ตรงกันไหม
diff <(grep -A 10 "interface.*Request" apps/web/src/app/types/{MODULE}.types.ts) \
     <(grep -A 10 "Type.Object" apps/api/src/modules/{MODULE}/{MODULE}.schemas.ts)
```

### 4.3 Integration Test

```bash
# รัน frontend และทดสอบจริง
npx nx serve web
# เปิด http://localhost:4200
# ทดสอบ CRUD operations สำหรับ {MODULE}
```

## 📋 Phase 5: Quality Assurance (ทดสอบคุณภาพ)

### 5.1 Build & Type Check

```bash
# ต้องผ่านทั้งหมด
nx run-many --target=build --all
nx run-many --target=typecheck --all
```

### 5.2 Linting

```bash
# ต้องไม่มี errors
nx run-many --target=lint --all
```

### 5.3 Testing

```bash
# Unit tests
nx run-many --target=test --all

# Integration tests สำหรับ module
nx test api --testNamePattern="{MODULE}"
nx test web --testNamePattern="{MODULE}"

# E2E tests (ถ้ามี)
nx e2e e2e --spec="apps/e2e/src/{MODULE}.spec.ts"
```

### 5.4 Manual Verification

```bash
# เริ่มระบบ
docker-compose up -d postgres
npx nx serve api --inspect=false
npx nx serve web

# ทดสอบ CRUD flow:
# 1. เปิด http://localhost:4200
# 2. ไปหน้า {MODULE} management
# 3. ทดสอบ Create, Read, Update, Delete
# 4. เช็ค error handling
# 5. เช็ค validation messages
# 6. เช็ค loading states
```

## 🚨 Critical Checkpoints

### ❌ Stop Development If:

- API server ไม่รัน (port 3333)
- OpenAPI spec ไม่มี endpoints ที่ต้องการ
- curl test endpoints ไม่ผ่าน
- Environment apiUrl ไม่ถูก port
- Frontend service URLs ไม่มี `/api` prefix
- Build หรือ typecheck fail
- Integration test ไม่ผ่าน

### ✅ Ready to Proceed When:

- API endpoints ทำงานผ่าน curl
- Frontend environment ถูกต้อง
- URLs มี /api/{MODULE} prefix ครบ
- TypeScript interfaces ตรงกับ API schemas
- Build + lint + test ผ่านทั้งหมด
- Manual CRUD operations ทำงาน end-to-end

## 🎯 Examples for Common Modules

### Users Module:

```bash
# API endpoints
curl -s "http://localhost:3333/api-docs/json" | jq '.paths' | grep "/api/users"
# Frontend service
apps/web/src/app/services/users.service.ts
# URL pattern: /api/users, /api/users/{id}
```

### Settings Module:

```bash
# API endpoints
curl -s "http://localhost:3333/api-docs/json" | jq '.paths' | grep "/api/settings"
# Frontend service
apps/web/src/app/services/settings.service.ts
# URL pattern: /api/settings, /api/settings/{key}
```

### Products Module:

```bash
# API endpoints
curl -s "http://localhost:3333/api-docs/json" | jq '.paths' | grep "/api/products"
# Frontend service
apps/web/src/app/services/products.service.ts
# URL pattern: /api/products, /api/products/{id}
```

## 💡 Universal Patterns

### 1. **Backend Module Structure:**

#### Simple Module Structure (< 20 endpoints):

```
apps/api/src/modules/{MODULE}/
├── {MODULE}.plugin.ts       # Main plugin entry (MANDATORY)
├── {MODULE}.service.ts      # Business logic
├── {MODULE}.repository.ts   # Data access with BaseRepository
├── {MODULE}.schemas.ts      # TypeBox schemas (MANDATORY)
├── {MODULE}.types.ts        # TypeScript types
├── {MODULE}.test.ts         # Tests
└── hooks/                   # Custom hooks
    ├── validate-{MODULE}.hook.ts
    └── format-response.hook.ts
```

#### Complex Module Structure (20+ endpoints):

```
apps/api/src/modules/{MODULE}/
├── {MODULE}.plugin.ts       # Main plugin entry - registers all routes
├── controllers/             # Multiple controllers
│   ├── {MODULE}.controller.ts         # Basic CRUD operations
│   ├── {MODULE}-profile.controller.ts # Profile management
│   ├── {MODULE}-auth.controller.ts    # Authentication endpoints
│   └── {MODULE}-admin.controller.ts   # Admin-only operations
├── services/               # Business logic layer
│   ├── {MODULE}.service.ts
│   ├── {MODULE}-profile.service.ts
│   ├── {MODULE}-auth.service.ts
│   └── {MODULE}-admin.service.ts
├── repositories/           # Data access layer
│   ├── {MODULE}.repository.ts
│   └── {MODULE}-session.repository.ts
├── schemas/                # JSON schemas (MANDATORY)
│   ├── {MODULE}.schemas.ts
│   ├── profile.schemas.ts
│   ├── auth.schemas.ts
│   └── admin.schemas.ts
├── types/                  # TypeScript types
│   ├── {MODULE}.types.ts
│   ├── auth.types.ts
│   └── admin.types.ts
├── hooks/                  # Custom hooks
│   ├── validate-{MODULE}.hook.ts
│   ├── audit-log.hook.ts
│   └── format-response.hook.ts
├── tests/                  # Test files
│   ├── {MODULE}.controller.test.ts
│   ├── {MODULE}.service.test.ts
│   ├── {MODULE}.repository.test.ts
│   └── integration.test.ts
└── utils/                  # Module-specific utilities
    ├── password.utils.ts
    └── validation.utils.ts
```

#### Plugin-First Architecture (MANDATORY):

```typescript
// apps/api/src/modules/{MODULE}/{MODULE}.plugin.ts
export default fp(
  async function {MODULE}Plugin(fastify: FastifyInstance) {
    // 1. Register schemas FIRST (MANDATORY)
    Object.values({MODULE}Schemas).forEach((schema) => {
      fastify.addSchema(schema);
    });

    // 2. Initialize repository
    const {MODULE}Repository = new {MODULE}Repository(fastify.knex);

    // 3. Initialize service
    const {MODULE}Service = new {MODULE}Service({MODULE}Repository);

    // 4. Decorate fastify instance
    fastify.decorate('{MODULE}Service', {MODULE}Service);

    // 5. Register routes with REQUIRED schemas
    await fastify.register({MODULE}Routes, { prefix: '/api/{MODULE}' });
  },
  {
    name: '{MODULE}-plugin',
    dependencies: ['knex-plugin', 'schema-plugin'], // MANDATORY
  },
);
```

#### MANDATORY Schema System:

```typescript
// Every route MUST have complete schema definition
fastify.route({
  method: 'POST',
  url: '/',
  schema: {
    description: 'Create new {MODULE}',
    tags: ['{MODULE}'],
    body: { $ref: 'create{MODULE}Request#' },
    response: {
      201: { $ref: '{MODULE}Response#' },
      400: { $ref: 'validationErrorResponse#' },
      401: { $ref: 'unauthorizedResponse#' },
      409: { $ref: 'conflictResponse#' },
    },
  },
  preHandler: [fastify.auth([fastify.verifyJWT])],
  handler: async (request, reply) => {
    const {MODULE} = await fastify.{MODULE}Service.create(request.body);
    return reply.created({MODULE}, '{MODULE} created successfully');
  },
});
```

### 2. **Frontend Module Structure:**

```
apps/web/src/app/features/{MODULE}/
├── services/{MODULE}.service.ts    # API calls
├── types/{MODULE}.types.ts         # TypeScript interfaces
├── components/                     # UI components
└── pages/                         # Route components
```

### 3. **RBAC Authentication Patterns (MANDATORY):**

#### Complex Authentication with @fastify/auth:

```typescript
// Simple JWT auth
fastify.route({
  method: 'GET',
  url: '/',
  preHandler: fastify.auth([fastify.verifyJWT]),
  handler: async () => {
    /* list items */
  },
});

// JWT + Role authorization
fastify.route({
  method: 'POST',
  url: '/',
  preHandler: fastify.auth([fastify.verifyJWT, fastify.verifyRole(['admin', 'manager'])]),
  handler: async () => {
    /* create item */
  },
});

// JWT + (Admin OR Owner) - OR relationship
fastify.route({
  method: 'GET',
  url: '/:id/profile',
  preHandler: fastify.auth([fastify.verifyJWT, [fastify.verifyRole(['admin']), fastify.verifyOwnership('id')]], { relation: 'or' }),
  handler: async () => {
    /* get profile */
  },
});

// Multiple conditions with AND (default)
fastify.route({
  method: 'DELETE',
  url: '/:id',
  preHandler: fastify.auth([
    fastify.verifyJWT, // Must be authenticated
    fastify.verifyRole(['admin']), // Must be admin
    fastify.verifyBusinessHours, // Must be business hours
    fastify.verifyUserRateLimit(5), // Max 5 deletes per minute
  ]),
  handler: async () => {
    /* delete item */
  },
});
```

#### Repository Pattern with BaseRepository:

```typescript
// Every module MUST extend BaseRepository
class {MODULE}Repository extends BaseRepository<{MODULE}, Create{MODULE}Request, Update{MODULE}Request> {
  constructor(knex: Knex) {
    super(
      knex,
      '{MODULE}s',
      ['{MODULE}s.name', '{MODULE}s.description'], // searchFields
    );
  }

  // REQUIRED: Transform database row to entity
  transformToEntity(dbRow: any): {MODULE} {
    return {
      id: dbRow.id,
      name: dbRow.name,
      description: dbRow.description,
      isActive: dbRow.is_active,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  }

  // REQUIRED: Transform DTO to database format
  transformToDb(dto: Create{MODULE}Request | Update{MODULE}Request): any {
    const transformed: any = {};
    if ('name' in dto) transformed.name = dto.name;
    if ('description' in dto) transformed.description = dto.description;
    if ('isActive' in dto) transformed.is_active = dto.isActive;
    return transformed;
  }

  // Override for custom filtering
  protected applyCustomFilters(query: Knex.QueryBuilder, filters: any) {
    const { status, category } = filters;
    if (status) query.where('{MODULE}s.is_active', status === 'active');
    if (category) query.where('{MODULE}s.category', category);
  }
}
```

### 4. **URL Consistency:**

- Backend: `/api/{MODULE}/{action}`
- Frontend: `${environment.apiUrl}/api/{MODULE}/{action}`

### 5. **Complete Schema System (MANDATORY):**

```typescript
// apps/api/src/modules/{MODULE}/{MODULE}.schemas.ts
export const {MODULE}Schemas = {
  // Base entity schema
  {MODULE}: {
    $id: '{MODULE}',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier' },
      name: { type: 'string', minLength: 1, maxLength: 100, description: 'Name' },
      description: { type: 'string', minLength: 1, maxLength: 500, description: 'Description' },
      isActive: { type: 'boolean', description: 'Active status' },
      createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
      updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
    },
    required: ['id', 'name', 'description', 'isActive', 'createdAt', 'updatedAt'],
    additionalProperties: false,
  },

  // Request schemas
  create{MODULE}Request: {
    $id: 'create{MODULE}Request',
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100, description: 'Name' },
      description: { type: 'string', minLength: 1, maxLength: 500, description: 'Description' },
      isActive: { type: 'boolean', default: true, description: 'Initial active status' },
    },
    required: ['name', 'description'],
    additionalProperties: false,
  },

  update{MODULE}Request: {
    $id: 'update{MODULE}Request',
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      description: { type: 'string', minLength: 1, maxLength: 500 },
      isActive: { type: 'boolean' },
    },
    additionalProperties: false,
    minProperties: 1,
  },

  // Response schemas - ALL REQUIRED
  {MODULE}Response: {
    $id: '{MODULE}Response',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: { $ref: '{MODULE}#' },
      message: { type: 'string' },
    },
    required: ['success', 'data'],
    additionalProperties: false,
  },

  paginated{MODULE}Response: {
    $id: 'paginated{MODULE}Response',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: { type: 'array', items: { $ref: '{MODULE}#' } },
      message: { type: 'string' },
      pagination: { $ref: 'pagination#' },
    },
    required: ['success', 'data', 'pagination'],
    additionalProperties: false,
  },
};
```

### 6. **Response Format:**

```typescript
// Success response
{
  success: true,
  data: T | T[],
  pagination?: PaginationMeta,
  meta: ApiMeta
}

// Error response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  meta: ApiMeta
}
```

## 🚀 Quick Verification Commands

```bash
# All-in-one check for any module
curl -s http://localhost:3333/api/health && \
grep -q "3333" apps/web/src/environments/environment.ts && \
grep -q "/api/{MODULE}" apps/web/src/app/services/{MODULE}.service.ts && \
nx run-many --target=build --all && \
echo "✅ Ready for {MODULE} development!"

# Test specific module endpoint
curl -X GET "http://localhost:3333/api/{MODULE}" \
  -H "Content-Type: application/json" \
  | jq '.success'
# Should return: true
```

---

## 🎯 Key Success Patterns

1. **API-First**: ดู OpenAPI spec ก่อนเขียน frontend เสมอ
2. **Test Endpoints**: ทดสอบ curl ก่อนเขียน service
3. **Match Schemas**: TypeScript interfaces ต้องตรงกับ API schemas
4. **Correct URLs**: ต้องมี `/api/{MODULE}` prefix และ port ถูกต้อง
5. **CRUD Consistency**: ทุก module ใช้ pattern เดียวกัน
6. **End-to-End**: ทดสอบ user flow จริงก่อน commit

**🎯 เป้าหมาย: Zero integration bugs ด้วยการใช้มาตรฐานเดียวกันทุก feature**

---

## ⚡ **Quick Checklist (ป้องกันตกหล่น)**

### 🔥 **Pre-Development (ก่อนเริ่มเขียนโค้ด)**

```bash
# ✅ 1. Database Schema
./scripts/check-database.sh {MODULE}  # เช็ค table exists
psql $DATABASE_URL -c "\d+ {MODULE}s"  # ดู columns

# ✅ 2. API Running
curl -s http://localhost:3333/api/health  # API must respond 200

# ✅ 3. OpenAPI Spec
curl -s "http://localhost:3333/api-docs/json" | jq '.paths' | grep "/api/{MODULE}"

# ✅ 4. Environment Check
grep "3333" apps/web/src/environments/environment.ts  # Must be port 3333
```

### 🚀 **During Development (ระหว่างเขียนโค้ด)**

```bash
# ✅ 5. Backend Structure
ls apps/api/src/modules/{MODULE}/{MODULE}.plugin.ts    # Plugin exists?
ls apps/api/src/modules/{MODULE}/{MODULE}.schemas.ts   # Schemas exists?

# ✅ 6. Test API Endpoints
curl -X GET "http://localhost:3333/api/{MODULE}"  # GET works?
curl -X POST "http://localhost:3333/api/{MODULE}" -H "Content-Type: application/json" -d '{}'  # POST fails correctly?

# ✅ 7. Frontend Service URLs
grep -n "/api/{MODULE}" apps/web/src/app/services/{MODULE}.service.ts  # Has /api prefix?
```

### ✨ **Pre-Commit (ก่อน commit)**

```bash
# ✅ 8. Build & Types
nx run-many --target=build --all           # Must pass
nx run-many --target=typecheck --all       # Must pass

# ✅ 9. Alignment Check
./scripts/api-alignment-check.sh           # Run comprehensive check

# ✅ 10. Manual Test
# Open http://localhost:4200 → Test CRUD → All operations work?
```

### 🔥 **Additional Critical Checks (เพิ่มเติม)**

```bash
# ✅ 11. Dependencies & Versions
yarn install --check-files                 # All packages installed?
grep -r "localhost:3335" .                 # No hardcoded wrong ports?

# ✅ 12. Authentication & CORS
curl -H "Authorization: Bearer invalid-token" http://localhost:3333/api/{MODULE}  # Returns 401?
curl -X OPTIONS -H "Origin: http://localhost:4200" http://localhost:3333/api/{MODULE}  # CORS OK?

# ✅ 13. Database Constraints
psql $DATABASE_URL -c "SELECT * FROM information_schema.table_constraints WHERE table_name = '{MODULE}s';"

# ✅ 14. Error Handling
curl -X POST "http://localhost:3333/api/{MODULE}" -d '{"invalid":"data"}'  # Returns 400?
curl -X GET "http://localhost:3333/api/{MODULE}/999999"                   # Returns 404?

# ✅ 15. Browser Console
# Open DevTools → Console → No red errors?
# Network tab → All API calls return expected status codes?

# ✅ 16. Performance Check
# Page loads < 3 seconds?
# API responses < 500ms?
```

## 🚨 **STOP Development If Any Fails**

### ❌ **Critical Failures:**

- Database table doesn't exist → **Fix migration first**
- API server not running → **Start API server**
- Port mismatch (3335 ≠ 3333) → **Fix environment.ts**
- Missing `/api` prefix → **Fix service URLs**
- Build/typecheck fails → **Fix TypeScript errors**
- Manual CRUD doesn't work → **Debug integration**
- **Dependencies missing** → **Run yarn install**
- **Hardcoded wrong ports** → **Fix all localhost:3335 references**
- **Auth returns 200 for invalid token** → **Fix authentication middleware**
- **CORS errors in browser** → **Fix CORS configuration**
- **DB constraints missing** → **Add foreign keys, unique constraints**
- **No error handling** → **Add proper 400/404/500 responses**
- **Console errors in browser** → **Fix JavaScript/TypeScript errors**
- **Slow performance (>3s page load)** → **Optimize queries, add indexes**

### ✅ **Ready to Commit When:**

- All 16 checklist items ✅
- Manual testing works end-to-end
- No console errors in browser
- No TypeScript compilation errors
