# Enhanced Response Handler Design

## 🎯 Overview

การออกแบบ **Enhanced Response Handler** เพื่อให้การจัดการ response ในแอปพลิเคชันมีความสอดคล้องกัน ลด boilerplate code และเพิ่ม type safety

## 🔍 ปัญหาของ Response Handler ปัจจุบัน

### ❌ **ปัญหาที่พบ:**

1. **การใช้งานไม่สอดคล้องกัน** - Auth controller สร้าง response ด้วยตนเอง ขณะที่ controller อื่นใช้ decorators
2. **Error handling ที่ซับซ้อน** - ผสมผสานการ throw error และการสร้าง response เอง
3. **ขาด TypeScript support** - ไม่มี type safety ที่เพียงพอ
4. **Boilerplate code สูง** - ต้องเขียนโค้ดซ้ำๆ สำหรับ response format
5. **Generic error handler override** - ปัญหา EMAIL_ALREADY_EXISTS ถูกเปลี่ยนเป็น CONFLICT

## ✨ การออกแบบใหม่

### **Core Principles:**

- **อิงจาก @fastify/sensible** ที่มีอยู่แล้วในโปรเจกต์
- **Backward compatible** - ไม่ทำลายโค้ดเดิม
- **Type-safe** - TypeScript support เต็มรูปแบบ
- **Developer-friendly** - ใช้งานง่าย patterns ชัดเจน

## 🚀 Enhanced Features

### **1. Core Response Methods**

```typescript
// ✅ Basic responses
return reply.success(data, 'Success message');
return reply.created(data, 'Created successfully');
return reply.paginated(items, page, limit, total);
return reply.error('USER_NOT_FOUND', 'User not found', 404);
```

### **2. Business Logic Integration**

```typescript
// Service Layer
throw new BusinessError('EMAIL_ALREADY_EXISTS', 'Email already in use', 409);

// Controller Layer
return reply.handleError(error); // Automatic mapping
```

### **3. Convenience Methods**

```typescript
// ✅ Try-catch wrapper
return reply.tryAsync(() => service.performOperation(), 'Success message');

// ✅ Quick error responses
return reply.notFound('User not found');
return reply.unauthorized('Login required');
return reply.validationError('Invalid email', 'email');
```

## 📋 Usage Patterns

### **Pattern 1: Simple Operations**

```typescript
// Before: 15+ lines
return reply.code(201).send({
  success: true,
  data: result,
  message: 'User created',
  meta: { timestamp: new Date().toISOString(), ... }
});

// After: 1 line
return reply.created(result, 'User created');
```

### **Pattern 2: Error Handling**

```typescript
// Before: Complex try-catch with manual error mapping
try {
  const result = await service.operation();
  return reply.code(200).send({ success: true, data: result });
} catch (error) {
  if (error.code === 'EMAIL_EXISTS') {
    return reply.code(409).send({ success: false, error: { ... } });
  }
  // ... more manual mapping
}

// After: Automatic error handling
return reply.tryAsync(
  () => service.operation(),
  'Operation successful'
);
```

### **Pattern 3: Validation**

```typescript
// Before: Manual validation and response
if (!email || !email.includes('@')) {
  return reply.code(400).send({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'Invalid email' },
  });
}

// After: Built-in validation helper
if (!email || !email.includes('@')) {
  return reply.validationError('Valid email is required', 'email');
}
```

## 🎯 Implementation Plan

### **Phase 1: Setup Enhanced Handler**

1. สร้าง `enhanced-response-handler.plugin.ts`
2. รวม @fastify/sensible + extensions
3. เพิ่ม BusinessError classes
4. Test กับ controller ใหม่

### **Phase 2: Gradual Migration**

1. ใช้กับ controller ใหม่ทั้งหมด
2. Migrate controller เดิมทีละตัว
3. Update service layer ให้ใช้ BusinessError
4. Test coverage สำหรับ response formats

### **Phase 3: Cleanup**

1. Remove old response-handler.plugin.ts
2. Update error-handler.plugin.ts ให้ support BusinessError
3. Documentation และ training

## ⚡ Benefits

### **Developer Experience**

- **70% ลดโค้ด** - จาก 50+ บรรทัดเหลือ 10-15 บรรทัด
- **Type Safety** - TypeScript support เต็มรูปแบบ
- **Consistent Patterns** - เดียวกันทั้งโปรเจกต์
- **Error Mapping** - อัตโนมัติสำหรับทุก error type

### **Maintenance**

- **Single Source of Truth** - response format เดียว
- **Easy Testing** - response structure คาดเดาได้
- **Performance Monitoring** - built-in timing
- **Better Documentation** - OpenAPI schema generation

## 🧪 Testing Strategy

```typescript
// Consistent testing across all endpoints
expect(response.body).toMatchObject({
  success: true,
  data: expect.any(Object),
  message: expect.any(String),
  meta: {
    timestamp: expect.any(String),
    version: 'v1',
    requestId: expect.stringMatching(/^req-/),
  },
});
```

## 📁 File Structure

```
docs/
├── 08-enhanced-response-handler.md        # This file
└── 08a-response-patterns-examples.md      # Usage examples

apps/api/src/plugins/
├── enhanced-response-handler.plugin.ts    # Main implementation
├── response-handler.plugin.ts             # Legacy (to be removed)
└── error-handler.plugin.ts                # Updated to support BusinessError

apps/api/src/examples/
└── improved-auth.controller.ts             # Reference implementation
```

## 🔄 Migration Example

### **Current Auth Controller (Before)**

```typescript
// ❌ 50+ lines, manual response, inconsistent
return reply.code(201).send({
  success: true,
  data: result,
  message: 'User registered successfully',
  meta: {
    timestamp: new Date().toISOString(),
    version: 'v1',
    requestId: 'req-' + Math.random().toString(36).substr(2, 9),
    environment: process.env.NODE_ENV || 'development',
  },
});
```

### **Enhanced Auth Controller (After)**

```typescript
// ✅ 1 line, automatic formatting, type-safe
return reply.created(result, 'User registered successfully');
```

## 🎉 Next Steps

1. **Review this design** กับทีม
2. **Approve approach** และ timeline
3. **Implement enhanced-response-handler.plugin.ts**
4. **Test กับ auth controller** ก่อน
5. **Rollout to other controllers** ทีละตัว

การออกแบบนี้จะช่วยแก้ปัญหาทั้งหมดที่เจอ รวมถึงปัญหา EMAIL_ALREADY_EXISTS ที่ถูก override เป็น CONFLICT และทำให้ codebase สะอาดและ maintainable มากขึ้น
