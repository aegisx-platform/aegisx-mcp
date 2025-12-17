# Password Routes Analysis - Domain Layers ที่ซ้ำซ้อน

Generated: 2025-12-17

## สรุปปัญหา

พบ **3 routes** ที่เกี่ยวข้องกับการเปลี่ยนรหัสผ่าน แต่มีความซ้ำซ้อนและ path ไม่เหมาะสม

## รายละเอียด Routes

### 1. ✅ `/api/v1/platform/profile/password` (POST)

**ที่มา:**

```
Module: user-profile
File: apps/api/src/layers/platform/user-profile/routes/profile.routes.ts:105
Plugin: apps/api/src/layers/platform/user-profile/user-profile.plugin.ts:79
```

**Path Construction:**

```
Prefix: /v1/platform/profile  (จาก plugin)
Route:  /password             (จาก route definition)
Full:   /api/v1/platform/profile/password
```

**จุดประสงค์:**

- User เปลี่ยนรหัสผ่านตัวเอง
- ต้องระบุ `currentPassword` และ `newPassword`
- ใช้ JWT authentication จาก `request.user.id`

**Controller:**

```typescript
// apps/api/src/layers/platform/user-profile/controllers/profile.controller.ts:130
async changePassword(
  req: FastifyRequest<{ Body: ChangePassword }>,
  reply: FastifyReply
) {
  const userId = req.user.id; // จาก JWT
  const { currentPassword, newPassword } = req.body;
  // ตรวจสอบ currentPassword ก่อนเปลี่ยน
}
```

**Schema:**

```typescript
body: {
  currentPassword: string; // ต้องใส่รหัสเดิม
  newPassword: string; // รหัสใหม่
}
```

---

### 2. ❌ `/api/v1/platform/users/profile/password` (POST) - **DUPLICATE!**

**ที่มา:**

```
Module: users
File: apps/api/src/layers/platform/users/users.routes.ts:208
Plugin: apps/api/src/layers/platform/users/users.plugin.ts:58
```

**Path Construction:**

```
Prefix: /v1/platform/users    (จาก plugin)
Route:  /profile/password     (จาก route definition)
Full:   /api/v1/platform/users/profile/password
```

**จุดประสงค์:**

- User เปลี่ยนรหัสผ่านตัวเอง (เหมือนกับ #1)
- ต้องระบุ `currentPassword` และ `newPassword`

**Controller:**

```typescript
// apps/api/src/layers/platform/users/users.controller.ts
async changeSelfPassword(
  req: FastifyRequest<{ Body: SelfPasswordChange }>,
  reply: FastifyReply
) {
  const userId = req.user.id; // จาก JWT
  // ทำงานเหมือนกับ #1
}
```

**⚠️ ปัญหา:**

- **ทำงานซ้ำกับ route #1**
- มี 2 routes ทำหน้าที่เดียวกัน → สับสน
- Frontend ต้องเลือกว่าจะเรียกอันไหน

---

### 3. ⚠️ `/api/v1/platform/users/users/{id}/password` (PUT) - **PATH ผิด!**

**ที่มา:**

```
Module: users
File: apps/api/src/layers/platform/users/users.routes.ts:128
Plugin: apps/api/src/layers/platform/users/users.plugin.ts:58
```

**Path Construction:**

```
Prefix:        /v1/platform/users       (จาก plugin)
Route:         /users/:id/password      (จาก route definition)
Full (ผิด):   /api/v1/platform/users/users/{id}/password  ← มี /users ซ้ำ!
Full (ควร):   /api/v1/platform/users/{id}/password
```

**จุดประสงค์:**

- Admin reset รหัสผ่านผู้ใช้คนอื่น
- ไม่ต้องใส่ `currentPassword` (admin มีสิทธิ์เต็ม)

**Controller:**

```typescript
// apps/api/src/layers/platform/users/users.controller.ts
async changeUserPassword(
  req: FastifyRequest<{
    Params: { id: string };
    Body: { newPassword: string };
  }>,
  reply: FastifyReply
) {
  const { id } = req.params;
  const { newPassword } = req.body;
  // Admin เปลี่ยนรหัสให้ user คนอื่น (ไม่ต้อง currentPassword)
}
```

**Permission:**

```typescript
preValidation: [fastify.authenticate, fastify.verifyPermission('users', 'update-password')];
```

**⚠️ ปัญหา:**

- Route definition: `/users/:id/password`
- Plugin prefix: `/v1/platform/users`
- **ผลลัพธ์: `/users/users/{id}/password` ← ซ้ำซ้อน!**

---

## การออกแบบ Domain Layers ที่ถูกต้อง

### ความหมายของ Domain Separation

```
user-profile module  → Self-service operations (ผู้ใช้จัดการตัวเอง)
├── GET    /profile
├── PUT    /profile
├── POST   /profile/password      ← User เปลี่ยนรหัสตัวเอง
├── POST   /profile/avatar
└── PUT    /profile/preferences

users module         → Admin operations (Admin จัดการ users)
├── GET    /users
├── POST   /users
├── PUT    /users/{id}
├── PUT    /users/{id}/password   ← Admin reset รหัสผู้อื่น
└── DELETE /users/{id}
```

**Domain layers ถูกต้อง แต่มีปัญหา:**

1. มี 2 routes สำหรับ user เปลี่ยนรหัสตัวเอง (ซ้ำซ้อน)
2. Route path ใน users module ผิด (มี /users ซ้ำ)

---

## สาเหตุของปัญหา

### ปัญหา #1: Duplicate Routes (2 routes ทำงานเดียวกัน)

**สาเหตุ:**

- เดิมมีแค่ `users` module ที่มี `/profile/password` route
- ต่อมาสร้าง `user-profile` module แยกออกมา
- แต่ยังไม่ได้ลบ route เดิมใน `users` module

**ประวัติ:**

```typescript
// users.routes.ts:230
// ===== PROFILE ROUTES =====
// NOTE: Profile routes moved to user-profile module

// แต่ยังมี route /profile/password อยู่ที่ line 208!
```

### ปัญหา #2: Path ซ้ำซ้อน `/users/users/{id}/password`

**สาเหตุ:**

```typescript
// users.routes.ts:19 (ถูกต้อง)
typedFastify.get(
  '/users',  // ← ไม่มี prefix ซ้ำ เพราะ plugin มี /users อยู่แล้ว
  {...}
);

// users.routes.ts:128 (ผิด!)
typedFastify.put(
  '/users/:id/password',  // ← มี /users ซ้ำ! ควรเป็น '/:id/password'
  {...}
);
```

**Correct pattern:**

- Plugin prefix: `/v1/platform/users`
- Route paths: `/`, `/:id`, `/:id/password` (ไม่ต้องมี `/users` ซ้ำ)

---

## แนวทางแก้ไข

### Priority 1: ลบ Duplicate Route

**ลบ route นี้ออก:**

```typescript
// ❌ DELETE: apps/api/src/layers/platform/users/users.routes.ts:207-227
typedFastify.post(
  '/profile/password',  // ← ลบทิ้ง ใช้ user-profile module แทน
  {...}
);
```

**เหตุผล:**

- ใช้ `/api/v1/platform/profile/password` จาก user-profile module เท่านั้น
- Domain separation ชัดเจน: user-profile = self-service

### Priority 2: แก้ไข Path ซ้ำซ้อน

**แก้ไข route นี้:**

```typescript
// Before (ผิด)
typedFastify.put(
  '/users/:id/password',  // ← จะกลายเป็น /users/users/{id}/password
  {...}
);

// After (ถูกต้อง)
typedFastify.put(
  '/:id/password',  // ← จะกลายเป็น /users/{id}/password
  {...}
);
```

**ใช้กับ routes อื่นๆ ด้วย:**

```typescript
// เช็ค pattern เดียวกัน
'/:id'              ✅ (ถูกต้อง)
'/:id/roles'        ✅ (ถูกต้อง)
'/users/:id'        ❌ (ผิด - ซ้ำ prefix)
'/users/:id/password' ❌ (ผิด - ซ้ำ prefix)
```

---

## การตรวจสอบ Routes อื่นๆ

### Routes ใน users.routes.ts ที่ถูกต้อง

```typescript
✅ '/users'                     → /api/v1/platform/users/users
✅ '/users/:id'                 → /api/v1/platform/users/users/{id}
✅ '/roles'                     → /api/v1/platform/users/roles
✅ '/users/:id/roles'           → /api/v1/platform/users/users/{id}/roles
✅ '/users/:id/roles/assign'    → /api/v1/platform/users/users/{id}/roles/assign
✅ '/users/bulk/activate'       → /api/v1/platform/users/users/bulk/activate
✅ '/users/dropdown'            → /api/v1/platform/users/users/dropdown
```

**หมายเหตุ:** Routes เหล่านี้มี `/users` ซ้ำ แต่เป็น **intentional design**

**เหตุผล:**

- Plugin prefix: `/v1/platform/users` (namespace)
- Route collection: `/users` (resource name)
- Full path: `/api/v1/platform/users/users`

**ทำไมไม่ผิด:**

1. เป็น RESTful pattern: `/{namespace}/{resource}`
2. สอดคล้องกับ modules อื่น:
   - `/api/v1/platform/rbac/roles`
   - `/api/v1/platform/rbac/permissions`
3. ชัดเจนว่าเป็น users resource ภายใต้ users namespace

### Routes ที่ไม่ควรมี `/users` ซ้ำ

```typescript
❌ '/users/:id/password'  → /users/users/{id}/password (ผิด!)
✅ '/:id/password'        → /users/{id}/password (ถูก!)

❌ '/users/profile/password'  → /users/users/profile/password (ผิด!)
✅ '/profile/password'        → /users/profile/password (แต่ควรลบ - ใช้ user-profile module)
```

---

## สรุปและข้อเสนอแนะ

### ปัญหาที่พบ

| Route                                        | ปัญหา                             | ความรุนแรง |
| -------------------------------------------- | --------------------------------- | ---------- |
| `/api/v1/platform/users/profile/password`    | Duplicate กับ user-profile module | 🔴 High    |
| `/api/v1/platform/users/users/{id}/password` | Path มี `/users` ซ้ำ              | 🟡 Medium  |

### Action Items

1. **ลบ duplicate route** (Priority 1)

   ```bash
   File: apps/api/src/layers/platform/users/users.routes.ts
   Lines: 207-227
   Action: DELETE entire route definition
   ```

2. **แก้ไข path ซ้ำซ้อน** (Priority 2)

   ```bash
   File: apps/api/src/layers/platform/users/users.routes.ts
   Line: 128
   Before: '/users/:id/password'
   After: '/:id/password'
   ```

3. **อัพเดท Frontend** (Priority 3)
   - เปลี่ยนจาก `/api/v1/platform/users/profile/password`
   - เป็น `/api/v1/platform/profile/password`

4. **อัพเดท Tests** (Priority 3)
   - Test cases ที่ใช้ route เก่า
   - Integration tests

### Final Routes Structure (After Fix)

```
User Self-Service (user-profile module):
✅ POST /api/v1/platform/profile/password
   - User เปลี่ยนรหัสตัวเอง
   - ต้องมี currentPassword

Admin Operations (users module):
✅ PUT /api/v1/platform/users/{id}/password
   - Admin reset รหัสผู้อื่น
   - ไม่ต้องมี currentPassword
   - ต้องมี permission 'users:update-password'
```

### Domain Layers Summary

นี่คือตัวอย่าง **Domain-Driven Design (DDD)** ที่ดี:

- **user-profile domain** → Self-service bounded context
  - User จัดการข้อมูลตัวเอง
  - ไม่ต้องการ admin permission

- **users domain** → Administration bounded context
  - Admin จัดการ users ทั้งหมด
  - ต้องการ admin permission

**แต่มี implementation bugs:**

1. Duplicate routes (ลืมลบ route เดิม)
2. Incorrect path (เพิ่ม `/users` ซ้ำ)

---

## ตัวอย่าง Code Changes

### Change 1: ลบ Duplicate Route

```diff
# apps/api/src/layers/platform/users/users.routes.ts

- // Change current user password (self)
- typedFastify.post(
-   '/profile/password',
-   {
-     preValidation: [fastify.authenticate],
-     schema: {
-       description: 'Change current user password',
-       tags: ['User Profile', 'Users'],
-       summary: 'Change user password with current password verification',
-       security: [{ bearerAuth: [] }],
-       body: SchemaRefs.module('users', 'self-password-change-request'),
-       response: {
-         200: SchemaRefs.module('users', 'success-message-response'),
-         400: SchemaRefs.ValidationError,
-         401: SchemaRefs.Unauthorized,
-         422: SchemaRefs.ValidationError,
-         500: SchemaRefs.ServerError,
-       },
-     },
-   },
-   controller.changeSelfPassword.bind(controller),
- );

  // ===== PROFILE ROUTES =====
- // NOTE: Profile routes moved to user-profile module
+ // NOTE: All profile routes (including password change) moved to user-profile module
+ // Use /api/v1/platform/profile/password instead
```

### Change 2: แก้ไข Path ซ้ำซ้อน

```diff
# apps/api/src/layers/platform/users/users.routes.ts

  // Change user password (admin only)
  typedFastify.put(
-   '/users/:id/password',
+   '/:id/password',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'update-password'),
      ],
      schema: {
        description: 'Change a user password',
        tags: ['Users'],
        summary: 'Reset user password',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: SchemaRefs.module('users', 'change-user-password-request'),
        response: {
          200: SchemaRefs.module('users', 'success-message-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.changeUserPassword.bind(controller),
  );
```

---

## ตรวจสอบ Routes อื่นๆ ที่อาจมีปัญหาเดียวกัน

```bash
# ค้นหา routes ที่อาจมี duplicate prefix
grep -n "'/users/" apps/api/src/layers/platform/users/users.routes.ts

# ผลลัพธ์ที่ควรตรวจสอบ:
19:    '/users',              # ✅ OK - collection route
44:    '/users/:id',          # ✅ OK - item route
70:    '/users',              # ✅ OK - create route
98:    '/users/:id',          # ✅ OK - update route
128:   '/users/:id/password', # ❌ FIX - ควรเป็น '/:id/password'
157:   '/users/:id',          # ✅ OK - delete route
236:   '/users/:id/roles',    # ✅ OK - sub-resource
...
```

**สรุป:**

- Route `/users/:id/password` เป็นตัวเดียวที่ผิด
- Routes อื่นๆ ถูกต้องตาม RESTful pattern
