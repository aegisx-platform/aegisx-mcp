# Layer-Based Routing Architecture

## 📖 ภาพรวม

Layer-Based Routing เป็นสถาปัตยกรรมการจัดการ routes แบบใหม่ที่ถูกพัฒนาขึ้นหลังจากการ migration ครั้งใหญ่ (September-December 2025) โดยแบ่ง API routes ออกเป็น 3 layers หลัก ตามหน้าที่และความรับผิดชอบ

### ✅ ผลลัพธ์หลังการ Migration

- **65% code reduction** (ลบโค้ด 117,035 บรรทัด)
- **Zero downtime** ตลอดการ migrate
- **5% performance improvement** (P95 latency)
- **58% faster route lookup** (จาก 12ms เหลือ 5ms)
- **23 modules migrated** สำเร็จ

---

## 🏗️ โครงสร้าง 3 Layers

### 1. **Core Layer** - Infrastructure & System

**Path:** `apps/api/src/layers/core/`

**Prefix:** ไม่มี (global services)

**หน้าที่:**

- Authentication & Authorization
- Audit logging & Monitoring
- System-level services

**Modules:**

```
core/
├── auth/           # Authentication strategies
├── audit/          # Audit logging
└── monitoring/     # System monitoring
```

**ตัวอย่าง Routes:**

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
GET    /api/auth/me
```

---

### 2. **Platform Layer** - Shared Services

**Path:** `apps/api/src/layers/platform/`

**Prefix:** `/api/v1/platform/*`

**หน้าที่:**

- Shared business services
- Cross-domain features
- Reusable components

**Modules:**

```
platform/
├── users/          # User management
├── rbac/           # Role-based access control
├── departments/    # Department management
├── settings/       # System settings
├── navigation/     # Navigation menu
├── file-upload/    # File upload service
├── attachments/    # Attachment handling
├── pdf-export/     # PDF generation
└── import/         # Import/export services
```

**ตัวอย่าง Routes:**

```
# RBAC
GET    /api/v1/platform/rbac/roles
POST   /api/v1/platform/rbac/roles
GET    /api/v1/platform/rbac/permissions
POST   /api/v1/platform/rbac/roles/:id/assign

# Users
GET    /api/v1/platform/users
POST   /api/v1/platform/users
PUT    /api/v1/platform/users/:id
DELETE /api/v1/platform/users/:id

# Navigation
GET    /api/v1/platform/navigation/navigation
POST   /api/v1/platform/navigation/navigation
GET    /api/v1/platform/navigation/items

# Settings
GET    /api/v1/platform/settings
PUT    /api/v1/platform/settings/:key

# Departments
GET    /api/v1/platform/departments
POST   /api/v1/platform/departments
```

---

### 3. **Domains Layer** - Business Domains

**Path:** `apps/api/src/layers/domains/`

**Prefix:** `/api/{domain}/*`

**หน้าที่:**

- Business-specific features
- Domain-driven design
- Isolated business logic

**Modules:**

```
domains/
├── admin/          # Admin management
│   └── system-init/
└── inventory/      # Inventory domain
    ├── master-data/
    ├── budget/
    ├── procurement/
    ├── inventory/
    ├── distribution/
    ├── return/
    ├── tmt/
    └── hpp/
```

**ตัวอย่าง Routes:**

```bash
# Admin Domain
GET    /api/admin/system-init/available-modules
POST   /api/admin/system-init/import
GET    /api/admin/system-init/status

# Inventory Domain
GET    /api/inventory/master-data/drugs
POST   /api/inventory/master-data/drugs
GET    /api/inventory/master-data/drug-types
GET    /api/inventory/master-data/units

GET    /api/inventory/budget/allocations
POST   /api/inventory/budget/allocations

GET    /api/inventory/procurement/orders
POST   /api/inventory/procurement/orders
```

---

## 🔄 เปรียบเทียบ Old Routes vs Layer-Based Routes

### Old Routes (Disabled - ENABLE_OLD_ROUTES=false)

```bash
# ทุก module ใช้ prefix เดียวกัน
GET    /api/users
GET    /api/roles
GET    /api/settings
GET    /api/drugs
GET    /api/departments

# ไม่มีการจัดกลุ่มตาม layer หรือ domain
# ยากต่อการ maintain และ scale
```

### Layer-Based Routes (Current - ENABLE_NEW_ROUTES=true)

```bash
# แยกตาม layer และ responsibility ชัดเจน
GET    /api/v1/platform/users          # Platform layer
GET    /api/v1/platform/rbac/roles     # Platform layer
GET    /api/v1/platform/settings       # Platform layer
GET    /api/inventory/master-data/drugs  # Inventory domain
GET    /api/v1/platform/departments    # Platform layer

# จัดกลุ่มตาม business domain
# ง่ายต่อการ maintain และแยก microservices ในอนาคต
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# .env.local
ENABLE_NEW_ROUTES=true   # เปิดใช้ layer-based routes (default: true)
ENABLE_OLD_ROUTES=false  # ปิดใช้ old routes (default: false)
API_PREFIX=/api          # Global API prefix
```

### Feature Flags

```typescript
// apps/api/src/config/app.config.ts
export interface AppConfig {
  features: {
    enableNewRoutes: boolean; // Layer-based routes
    enableOldRoutes: boolean; // Legacy routes (backward compatibility)
  };
}
```

---

## 🎯 Routing Principles

### 1. **Versioning**

Platform layer ใช้ versioned routes:

```
/api/v1/platform/*  # Version 1
/api/v2/platform/*  # Version 2 (future)
```

Domain layer ไม่ใช้ version prefix:

```
/api/inventory/*    # Current version
```

### 2. **Prefix Hierarchy**

```
/api                    # Global API prefix (from API_PREFIX)
├── /auth/*            # Core layer (no version)
├── /v1/platform/*     # Platform layer (versioned)
└── /{domain}/*        # Domains layer (domain-specific)
```

### 3. **Resource Naming**

- ใช้ **plural nouns** สำหรับ collections: `/users`, `/roles`, `/drugs`
- ใช้ **singular nouns** สำหรับ singletons: `/navigation`, `/settings`
- ใช้ **kebab-case**: `/master-data`, `/system-init`

---

## 📝 การสร้าง Route ใหม่

### Platform Layer Module

```typescript
// apps/api/src/layers/platform/{module}/index.ts
import fp from 'fastify-plugin';

export default fp(
  async function myModulePlugin(fastify, options) {
    await fastify.register(myModuleRoutes, {
      prefix: options.prefix || '/v1/platform',
    });
  },
  {
    name: 'my-module-plugin',
    dependencies: ['knex-plugin'],
  },
);
```

### Domain Layer Module

```typescript
// apps/api/src/layers/domains/{domain}/index.ts
import fp from 'fastify-plugin';

export default fp(
  async function myDomainPlugin(fastify, options) {
    const prefix = options.prefix || '/my-domain';

    await fastify.register(subModulePlugin, {
      prefix: `${prefix}/sub-module`,
    });
  },
  {
    name: 'my-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);
```

---

## 🔍 การทดสอบ Routes

### 1. ตรวจสอบ Layer-Based Routes

```bash
# Platform layer (ต้อง authenticate)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3383/api/v1/platform/users

# Domain layer
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3383/api/inventory/master-data/drugs
```

### 2. ดู Available Routes

```bash
# ดู Swagger documentation (ถ้ามี)
http://localhost:3383/documentation

# หรือเช็คจาก logs ตอน server start
pnpm run dev:api | grep "registered successfully"
```

### 3. ทดสอบ Authentication

```bash
# Public routes (ไม่ต้อง token)
curl http://localhost:3383/api/auth/login

# Protected routes (ต้องมี token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3383/api/v1/platform/navigation/navigation
```

---

## 📚 Related Documentation

- [Migration Complete Summary](../archive/api-migration-2025/migration-complete.md) - สรุปผลการ migration
- [Lessons Learned](../archive/api-migration-2025/LESSONS_LEARNED.md) - บทเรียนจากการ migration
- [Backend Architecture](./backend-architecture.md) - สถาปัตยกรรม backend โดยรวม
- [Plugin Pattern](../archive/api-migration-2025/08-plugin-migration-guide.md) - การเขียน Fastify plugins

---

## 🚀 Best Practices

### 1. **การใช้ fastify-plugin (fp)**

```typescript
import fp from 'fastify-plugin';

// ✅ ถูกต้อง - ใช้ fp() สำหรับ infrastructure plugins
export default fp(myPlugin, {
  name: 'my-plugin',
  dependencies: ['knex-plugin'],
});

// ❌ ผิด - ไม่ใช้ fp() สำหรับ route plugins
export default myPlugin; // จะทำให้ decorations ไม่ globally accessible
```

### 2. **การจัดการ Prefix**

```typescript
// ✅ ถูกต้อง - รับ prefix จาก options
const prefix = options.prefix || '/v1/platform';

// ❌ ผิด - hardcode prefix
const prefix = '/v1/platform'; // ไม่ flexible
```

### 3. **การเรียงลำดับ Dependencies**

```typescript
// Plugin loading order
1. Infrastructure (DB, Redis, Auth)
2. Core Layer (System services)
3. Platform Layer (Shared services)
4. Domains Layer (Business logic)
```

---

## 🔧 Troubleshooting

### ปัญหา: Route ไม่ทำงาน (404)

```bash
# เช็คว่า ENABLE_NEW_ROUTES=true
grep ENABLE_NEW_ROUTES .env.local

# เช็คว่า plugin ถูก register แล้ว
pnpm run dev:api | grep "platform-layer\|domains-layer"
```

### ปัญหา: Authentication ไม่ผ่าน (401)

```bash
# เช็คว่าใช้ token ถูกต้อง
# Layer-based routes ต้องการ JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" URL
```

### ปัญหา: Plugin Decoration ไม่พบ

```bash
# เช็คว่าใช้ fp() wrapper แล้ว
# Import discovery service ต้อง wrap ด้วย fp()
export default fp(platformImportDiscoveryPluginImpl, {
  name: 'platform-import-discovery-plugin',
  dependencies: ['knex-plugin'],
});
```

---

## 📊 Performance Metrics

### Route Lookup Time

| Metric       | Old Routes | Layer-Based | Improvement |
| ------------ | ---------- | ----------- | ----------- |
| Route lookup | 12ms       | 5ms         | **58%**     |
| Plugin init  | 890ms      | 730ms       | **18%**     |
| P95 latency  | 145ms      | 138ms       | **5%**      |
| Memory usage | 185MB      | 175MB       | **5%**      |
| Bundle size  | 180KB      | 63KB        | **65%**     |

---

## 🎓 Summary

**Layer-Based Routing** แบ่ง API ออกเป็น 3 layers:

1. **Core Layer** - Infrastructure (`/api/auth/*`)
2. **Platform Layer** - Shared Services (`/api/v1/platform/*`)
3. **Domains Layer** - Business Logic (`/api/{domain}/*`)

**ข้อดี:**

- ✅ Clear separation of concerns
- ✅ Easy to scale and convert to microservices
- ✅ Better performance (58% faster route lookup)
- ✅ Easier to maintain (65% code reduction)
- ✅ Domain-driven design

**การตั้งค่า:**

```bash
ENABLE_NEW_ROUTES=true   # เปิดใช้ layer-based routes
ENABLE_OLD_ROUTES=false  # ปิด legacy routes
```

**Server Status:**

```bash
http://localhost:3383/api/v1/platform/*  # Platform routes
http://localhost:3383/api/inventory/*    # Inventory domain
http://localhost:3383/api/admin/*        # Admin domain
```
