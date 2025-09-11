# Response Patterns Examples

## 🚀 Enhanced Response Handler Usage Examples

ตัวอย่างการใช้งาน Enhanced Response Handler ในสถานการณ์ต่างๆ

## 📋 Basic Patterns

### **1. Success Responses**

```typescript
// GET /api/users/:id
async getUser(request, reply) {
  const user = await userService.findById(request.params.id);
  return reply.success(user, 'User retrieved successfully');
}

// POST /api/users (Created)
async createUser(request, reply) {
  const user = await userService.create(request.body);
  return reply.created(user, 'User created successfully');
}

// GET /api/users (Paginated)
async getUsers(request, reply) {
  const { page = 1, limit = 10 } = request.query;
  const { users, total } = await userService.findAll(page, limit);
  return reply.paginated(users, page, limit, total, 'Users retrieved');
}
```

### **2. Error Responses**

```typescript
// Manual error responses
return reply.error('USER_NOT_FOUND', 'User not found', 404);
return reply.validationError('Invalid email format', 'email');
return reply.unauthorized('Please login first');
return reply.forbidden('Access denied');
```

## 🏗️ Service Integration Patterns

### **Pattern A: BusinessError Throwing**

```typescript
// Service Layer
class UserService {
  async findById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new BusinessError('USER_NOT_FOUND', 'User not found', 404);
    }
    return user;
  }

  async updateEmail(id: string, email: string) {
    if (!this.isValidEmail(email)) {
      throw new ValidationBusinessError('Invalid email format', { field: 'email' });
    }

    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser && existingUser.id !== id) {
      throw new BusinessError('EMAIL_ALREADY_EXISTS', 'Email already in use', 409);
    }

    return await this.userRepo.update(id, { email });
  }
}

// Controller Layer
export const userController = {
  async getUser(request, reply) {
    try {
      const user = await userService.findById(request.params.id);
      return reply.success(user, 'User retrieved');
    } catch (error) {
      return reply.handleError(error); // Auto-maps BusinessError
    }
  },

  async updateEmail(request, reply) {
    return reply.tryAsync(() => userService.updateEmail(request.params.id, request.body.email), 'Email updated successfully');
  },
};
```

### **Pattern B: ServiceResult Pattern**

```typescript
// Service Layer
class UserService {
  async findById(id: string): Promise<ServiceResult<User>> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      return {
        success: false,
        error: new BusinessError('USER_NOT_FOUND', 'User not found', 404),
      };
    }
    return { success: true, data: user };
  }
}

// Controller Layer
export const userController = {
  async getUser(request, reply) {
    const result = await userService.findById(request.params.id);
    return reply.fromService(result, 'User found', 'User not found');
  },
};
```

## 🔐 Authentication Patterns

### **Protected Route Pattern**

```typescript
async getProfile(request, reply) {
  if (!request.user) {
    return reply.unauthorized('Authentication required');
  }

  return reply.tryAsync(
    () => userService.getProfile(request.user.id),
    'Profile retrieved successfully'
  );
}
```

### **Role-based Authorization**

```typescript
async getAdminData(request, reply) {
  if (!request.user) {
    return reply.unauthorized('Authentication required');
  }

  if (request.user.role !== 'admin') {
    return reply.forbidden('Admin access required');
  }

  return reply.tryAsync(
    () => adminService.getData(),
    'Admin data retrieved'
  );
}
```

### **Complete Auth Flow**

```typescript
// Registration
async register(request, reply) {
  try {
    const result = await authService.register(request.body);

    // Set cookie
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return reply.created(result, 'User registered successfully');
  } catch (error) {
    return reply.handleError(error);
  }
}

// Login with try-catch wrapper
async login(request, reply) {
  return reply.tryAsync(async () => {
    const result = await authService.login(request.body);

    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return {
      user: result.user,
      accessToken: result.accessToken
    };
  }, 'Login successful');
}
```

## 📝 Validation Patterns

### **Manual Validation**

```typescript
async updateUser(request, reply) {
  const { email, age } = request.body;

  if (!email || !email.includes('@')) {
    return reply.validationError('Valid email is required', 'email');
  }

  if (age && (age < 13 || age > 120)) {
    return reply.validationError('Age must be between 13 and 120', 'age');
  }

  return reply.tryAsync(
    () => userService.update(request.params.id, request.body),
    'User updated successfully'
  );
}
```

### **Service-level Validation**

```typescript
// Service
class UserService {
  async updateProfile(id: string, data: UpdateUserRequest) {
    // Validation
    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationBusinessError('Invalid email format', { field: 'email' });
    }

    if (data.username && await this.isUsernameTaken(data.username, id)) {
      throw new BusinessError('USERNAME_TAKEN', 'Username already taken', 409);
    }

    return await this.userRepo.update(id, data);
  }
}

// Controller
async updateProfile(request, reply) {
  return reply.tryAsync(
    () => userService.updateProfile(request.params.id, request.body),
    'Profile updated successfully'
  );
}
```

## 🔄 CRUD Patterns

### **Complete CRUD Controller**

```typescript
export const userController = {
  // GET /api/users
  async list(request, reply) {
    const { page = 1, limit = 10, search } = request.query;
    const result = await userService.findAll({ page, limit, search });
    return reply.paginated(result.users, page, limit, result.total, 'Users retrieved');
  },

  // GET /api/users/:id
  async get(request, reply) {
    return reply.tryAsync(() => userService.findById(request.params.id), 'User retrieved successfully');
  },

  // POST /api/users
  async create(request, reply) {
    return reply.tryAsync(() => userService.create(request.body), 'User created successfully');
  },

  // PUT /api/users/:id
  async update(request, reply) {
    return reply.tryAsync(() => userService.update(request.params.id, request.body), 'User updated successfully');
  },

  // DELETE /api/users/:id
  async delete(request, reply) {
    return reply.tryAsync(() => userService.delete(request.params.id), 'User deleted successfully');
  },
};
```

## 📊 Complex Data Patterns

### **Dashboard with Multiple Data Sources**

```typescript
async getDashboard(request, reply) {
  return reply.tryAsync(async () => {
    const [userStats, orderStats, revenueStats] = await Promise.all([
      userService.getStats(),
      orderService.getStats(),
      revenueService.getStats()
    ]);

    return {
      users: userStats,
      orders: orderStats,
      revenue: revenueStats,
      generatedAt: new Date().toISOString(),
      period: request.query.period || 'last_30_days'
    };
  }, 'Dashboard data retrieved successfully');
}
```

### **Search with Filters**

```typescript
async search(request, reply) {
  const { q, category, priceMin, priceMax, page = 1, limit = 20 } = request.query;

  if (!q || q.length < 2) {
    return reply.validationError('Search query must be at least 2 characters', 'q');
  }

  return reply.tryAsync(async () => {
    const filters = { category, priceMin, priceMax };
    const result = await productService.search(q, filters, { page, limit });

    return reply.paginated(
      result.products,
      page,
      limit,
      result.total,
      `Found ${result.total} products matching "${q}"`
    );
  });
}
```

## 🧪 Testing Examples

### **Response Structure Tests**

```typescript
describe('User API', () => {
  it('should return user successfully', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/users/123',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: expect.objectContaining({
        id: '123',
        email: expect.any(String),
      }),
      message: 'User retrieved successfully',
      meta: {
        timestamp: expect.any(String),
        version: 'v1',
        requestId: expect.stringMatching(/^req-/),
        environment: 'test',
      },
    });
  });

  it('should handle user not found', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/users/999',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
      meta: expect.objectContaining({
        timestamp: expect.any(String),
      }),
    });
  });

  it('should handle validation errors', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { email: 'invalid-email' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining('email'),
        details: expect.objectContaining({
          field: 'email',
        }),
      },
    });
  });
});
```

## ⚡ Performance Patterns

### **Caching Integration**

```typescript
async getExpensiveData(request, reply) {
  const cacheKey = `expensive-data:${request.params.id}`;

  return reply.tryAsync(async () => {
    // Try cache first
    let data = await redis.get(cacheKey);
    if (data) {
      return JSON.parse(data);
    }

    // Calculate expensive data
    data = await expensiveService.calculate(request.params.id);

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(data));

    return data;
  }, 'Data retrieved successfully');
}
```

### **Streaming Responses**

```typescript
async exportUsers(request, reply) {
  try {
    const stream = await userService.createExportStream(request.query);

    reply.type('text/csv');
    reply.header('Content-Disposition', 'attachment; filename="users.csv"');

    return reply.send(stream);
  } catch (error) {
    return reply.handleError(error);
  }
}
```

## 🎯 Best Practices Summary

1. **Always use reply decorators** แทนการสร้าง response เอง
2. **ใช้ BusinessError ใน service layer** เพื่อให้ controller จัดการได้อัตโนมัติ
3. **ใช้ tryAsync() สำหรับ simple operations** ที่ต้องการ error handling
4. **ใช้ fromService() กับ ServiceResult pattern** สำหรับ complex business logic
5. **เพิ่ม meaningful messages** เพื่อช่วยให้ API consumer เข้าใจง่าย
6. **Validate input ใน controller หรือ service** แล้วใช้ validationError()
7. **Test response structure consistently** ด้วย toMatchObject()
