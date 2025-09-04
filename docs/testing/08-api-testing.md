# API Testing Guide

This guide covers all aspects of testing the AegisX API, including unit tests, integration tests, and end-to-end API route testing.

## Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Running Tests](#running-tests)
- [API Route Testing](#api-route-testing)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The API testing suite consists of three levels:

1. **Unit Tests** - Test individual functions and services
2. **Integration Tests** - Test modules with database connections
3. **Route Tests** - Test actual HTTP endpoints

## Testing Strategy

### Test Pyramid

```
         /\
        /E2E\       <- Full API route tests
       /------\
      /Integration\ <- Module integration tests
     /------------\
    /  Unit Tests  \ <- Service/utility tests
   /________________\
```

### Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: All database operations
- Route Tests: 100% of public endpoints

## Running Tests

### Prerequisites

```bash
# Start test databases
docker-compose up -d postgres redis

# Install dependencies
yarn install

# Set up test environment
cp .env.example .env.test
```

### Unit Tests

```bash
# Run all unit tests
yarn nx test api

# Run with coverage
yarn nx test api --coverage

# Run in watch mode
yarn nx test api --watch

# Run specific test file
yarn nx test api --testFile=settings.service.spec.ts
```

### Integration Tests

```bash
# Run integration tests
yarn nx run api:test:integration

# Run specific integration test
yarn nx run api:test:integration --testFile=settings.integration.spec.ts
```

### API Route Tests

```bash
# Start API server
yarn nx serve api

# Run all route tests
cd apps/api && ./scripts/test-all-routes.sh

# Test specific environment
./scripts/test-all-routes.sh http://staging-api.example.com

# Test with verbose output
./scripts/test-all-routes.sh http://localhost:3333 --verbose
```

## API Route Testing

### Test Script Features

The `test-all-routes.sh` script provides comprehensive API testing:

- **Authentication Testing** - Login, register, refresh tokens
- **CRUD Operations** - Create, read, update, delete for all resources
- **Error Handling** - 4xx and 5xx error responses
- **Pagination** - List endpoints with page/limit
- **Filtering** - Query parameter testing
- **Authorization** - Role-based access testing

### Test Sections

1. **Default/System Endpoints**
   - `/api/info` - API information
   - `/api/status` - System status
   - `/api/health` - Health check

2. **Authentication**
   - `/api/auth/register` - User registration
   - `/api/auth/login` - User login
   - `/api/auth/refresh` - Token refresh
   - `/api/auth/logout` - User logout
   - `/api/auth/profile` - Current user profile

3. **User Management**
   - `/api/users` - List users (paginated)
   - `/api/users/:id` - Get/update user

4. **User Profile**
   - `/api/profile` - Get/update current user profile

5. **Settings**
   - `/api/settings` - List settings (filtered, paginated)
   - `/api/settings/:key` - Get/update/delete setting
   - `/api/settings/bulk` - Bulk operations

6. **Navigation**
   - `/api/navigation` - Get navigation items

### Adding New Route Tests

To add tests for a new endpoint:

1. Open `apps/api/scripts/test-all-routes.sh`
2. Add a new section:

```bash
# Test New Feature Endpoints
print_section "Testing New Feature Endpoints"
test_endpoint "GET" "/new-feature" 200 "" "GET /api/new-feature - List items"
test_endpoint "POST" "/new-feature" 201 '{"name":"test"}' "POST /api/new-feature - Create item"
```

## Writing Tests

### Unit Test Example

```typescript
// settings.service.spec.ts
import { Test } from '@nestjs/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SettingsService],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  it('should transform setting correctly', () => {
    const result = service.transformSetting({
      id: 1,
      key: 'test',
      value: { data: 'test' },
      // ...
    });

    expect(result.key).toBe('test');
    expect(result.value).toEqual({ data: 'test' });
  });
});
```

### Integration Test Example

```typescript
// settings.integration.spec.ts
describe('Settings Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and retrieve setting', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/settings',
      payload: {
        key: 'test.setting',
        value: 'test_value',
        // ...
      },
      headers: {
        authorization: `Bearer ${getTestToken()}`,
      },
    });

    expect(response.statusCode).toBe(201);
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/api-test.yml` workflow runs on:

- Push to main/develop branches
- Pull requests
- Manual dispatch

### Workflow Steps

1. Set up test environment (PostgreSQL, Redis)
2. Install dependencies
3. Run database migrations
4. Execute unit tests
5. Build API
6. Start API server
7. Run route tests
8. Upload test results on failure

### Local Pre-push Hook

The `.husky/pre-push` hook:

- Checks if API server is running
- Runs route tests if server is available
- Runs affected unit tests
- Prevents push on test failure

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### 2. Authentication Failures

```bash
# Check JWT secret is set
echo $JWT_SECRET

# Verify admin credentials in seed
yarn nx run api:seed:run
```

#### 3. Route Test Failures

```bash
# Check API is running
curl http://localhost:3333/api/health

# Run specific test with debug
bash -x ./scripts/test-all-routes.sh

# Check API logs
yarn nx serve api --loglevel=debug
```

#### 4. CI/CD Failures

- Check GitHub Actions logs
- Verify environment variables in workflow
- Ensure database services are healthy
- Check for port conflicts

### Debug Mode

Enable debug logging:

```bash
# In .env.test
LOG_LEVEL=debug
DEBUG=*

# Run tests with debug
DEBUG=* yarn nx test api
```

## Best Practices

1. **Always run tests before committing**

   ```bash
   yarn test:all
   ```

2. **Keep tests focused and isolated**
   - One concept per test
   - Mock external dependencies
   - Clean up test data

3. **Use descriptive test names**

   ```typescript
   it('should return 404 when setting key does not exist', ...)
   ```

4. **Test edge cases**
   - Empty inputs
   - Invalid data
   - Boundary values
   - Error conditions

5. **Maintain test data**
   - Use factories for test objects
   - Reset database between tests
   - Avoid hardcoded IDs

## Next Steps

1. Add performance tests
2. Implement load testing
3. Add security testing (OWASP)
4. Set up test reporting dashboard
5. Implement contract testing
