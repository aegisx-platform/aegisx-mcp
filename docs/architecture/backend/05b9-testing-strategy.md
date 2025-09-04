# Testing Strategy

## Testing Pyramid

```
    🔺 E2E Tests (10%)
      - Critical user journeys
      - Cross-browser testing
      - Visual regression

  🔶 Integration Tests (30%)
    - API endpoint testing
    - Database operations
    - Service interactions

🔷 Unit Tests (60%)
  - Business logic
  - Utilities & helpers
  - Component logic
```

## Backend Testing Setup

### Jest Configuration

```typescript
// apps/api/jest.config.ts
export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.{spec,test}.{ts,js}', '!src/main.ts', '!src/**/*.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{ts,js}'],
};
```

### Test Database Setup

```typescript
// apps/api/src/test-setup.ts
import { knex } from 'knex';
import knexConfig from '../../../database/knexfile';

// Test database instance
export const testDb = knex({
  ...knexConfig.test,
  connection: {
    ...knexConfig.test.connection,
    database: 'myapp_test',
  },
});

// Setup and teardown
beforeAll(async () => {
  await testDb.migrate.latest();
});

afterAll(async () => {
  await testDb.destroy();
});

beforeEach(async () => {
  // Clean tables before each test
  await testDb.raw('TRUNCATE TABLE users, roles, permissions RESTART IDENTITY CASCADE');
});
```

## Unit Testing Patterns

### Service Testing

```typescript
// apps/api/src/modules/user/user.service.test.ts
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
      list: jest.fn(),
    } as any;

    userService = new UserService(mockRepository);
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        roleId: 'role-uuid',
      };

      const createdUser = { id: 'user-uuid', ...userData };
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdUser);

      const result = await userService.create(userData);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(createdUser);
    });

    it('should throw error if email exists', async () => {
      const userData = { email: 'existing@example.com' };
      mockRepository.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      await expect(userService.create(userData as any)).rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });
  });
});
```

### Repository Testing

```typescript
// apps/api/src/modules/user/user.repository.test.ts
describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository(testDb);
  });

  it('should create user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashed-password',
      roleId: 'role-uuid',
    };

    const user = await userRepository.create(userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.username).toBe(userData.username);
  });

  it('should list users with pagination', async () => {
    // Create test data
    await testDb('users').insert([
      { email: 'user1@test.com', username: 'user1' },
      { email: 'user2@test.com', username: 'user2' },
    ]);

    const result = await userRepository.list({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
  });
});
```

## Integration Testing

### API Testing with Supertest

```typescript
// apps/api/src/modules/user/user.routes.test.ts
import { build } from '../../app';
import { FastifyInstance } from 'fastify';

describe('User Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users', () => {
    it('should return paginated users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users?page=1&limit=10',
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.pagination).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
        password: 'Password123!',
        roleId: 'role-uuid',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: {
          authorization: 'Bearer admin-token',
        },
        payload: userData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.email).toBe(userData.email);
    });
  });
});
```

## Frontend Testing

### Angular Component Testing

```typescript
// apps/user-portal/src/app/features/users/components/user-list/user-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../services/user.service';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getList'], {
      users: signal([]),
      loading: signal(false),
      error: signal(null),
    });

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [{ provide: UserService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should display users list', () => {
    mockUserService.users = signal([
      { id: '1', email: 'user1@test.com', firstName: 'User', lastName: 'One' },
      { id: '2', email: 'user2@test.com', firstName: 'User', lastName: 'Two' },
    ]);

    fixture.detectChanges();

    const userRows = fixture.debugElement.queryAll(By.css('[data-testid="user-row"]'));
    expect(userRows).toHaveLength(2);
  });

  it('should show loading state', () => {
    mockUserService.loading = signal(true);
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner).toBeTruthy();
  });
});
```

### Service Testing with Signals

```typescript
// apps/user-portal/src/app/features/users/services/user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let httpMock: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [UserService, { provide: HttpClient, useValue: spy }],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should load users and update signal', async () => {
    const mockUsers = [{ id: '1', email: 'test@example.com' }];
    httpMock.get.mockReturnValue(of({ data: mockUsers, total: 1 }));

    await service.loadUsers();

    expect(service.users()).toEqual(mockUsers);
    expect(service.loading()).toBe(false);
  });

  it('should handle errors properly', async () => {
    httpMock.get.mockReturnValue(throwError(() => new Error('API Error')));

    await service.loadUsers();

    expect(service.error()).toBe('API Error');
    expect(service.loading()).toBe(false);
  });
});
```

## E2E Testing Essentials

### Basic E2E Test

```typescript
// e2e/user-portal-e2e/src/specs/user-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test('complete user workflow', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Navigate to users
    await page.goto('/users');

    // Create user
    await page.click('[data-testid="add-user-button"]');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@test.com');
    await page.click('[data-testid="submit-button"]');

    // Verify creation
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('text=john@test.com')).toBeVisible();
  });
});
```

## Performance Testing

### Basic Load Testing

```typescript
// apps/api/src/tests/load.test.ts
import autocannon from 'autocannon';
import { build } from '../app';

describe('Load Testing', () => {
  let app;

  beforeAll(async () => {
    app = await build();
    await app.listen({ port: 0 });
  });

  afterAll(async () => {
    await app.close();
  });

  test('should handle concurrent requests', async () => {
    const result = await autocannon({
      url: `http://localhost:${app.server.address().port}/health`,
      connections: 10,
      duration: 10,
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.latency.average).toBeLessThan(100);
  });
});
```

## Test Commands

```json
{
  "scripts": {
    "test": "nx run-many --target=test --all",
    "test:unit": "jest",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:load": "jest --testPathPattern=load",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Testing Best Practices

1. **Test Structure**: Arrange-Act-Assert pattern
2. **Isolation**: Each test independent
3. **Data**: Use factories for test data
4. **Mocking**: Mock external dependencies
5. **Coverage**: Aim for 80%+ on business logic
6. **Speed**: Unit tests < 10ms, Integration < 100ms
7. **Reliability**: No flaky tests
8. **Environment**: Separate test database
