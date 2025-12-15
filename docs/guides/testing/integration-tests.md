# AegisX API Integration Tests - Setup Complete

## 🎉 Integration Test Suite Successfully Created

The comprehensive integration test suite for the AegisX API has been successfully set up with full application context testing capabilities.

## 📁 What Was Created

### Test Infrastructure

- **Setup utilities** (`apps/api/src/__tests__/integration/setup.ts`) - Full app context setup with database management
- **Authentication helpers** (`apps/api/src/__tests__/integration/auth-helper.ts`) - JWT token management and user creation
- **Database utilities** (`apps/api/src/__tests__/integration/db-helper.ts`) - Database setup, cleanup, and management
- **Request helpers** (`apps/api/src/__tests__/integration/request-helper.ts`) - HTTP request utilities with authentication
- **Response assertions** (`apps/api/src/__tests__/integration/assertions.ts`) - Comprehensive API response validation
- **Test data factories** (`apps/api/src/__tests__/integration/factories.ts`) - Test data generation for users, navigation, sessions, and settings

### Integration Tests

1. **Navigation API Tests** (`navigation.integration.spec.ts`)
   - GET /api/navigation with different user roles
   - GET /api/navigation/user with permissions
   - Caching behavior testing
   - Error scenarios and response validation

2. **User Profile API Tests** (`user-profile.integration.spec.ts`)
   - GET /api/users/profile
   - PUT /api/users/profile with validation
   - POST /api/users/avatar with file upload
   - DELETE /api/users/avatar
   - Preferences endpoints testing

3. **Authentication Flow Tests** (`auth-flow.integration.spec.ts`)
   - User registration and login flows
   - Token refresh mechanisms
   - Logout functionality
   - JWT expiration handling

4. **Cross-Module Tests** (`cross-module.integration.spec.ts`)
   - Navigation with different user roles
   - Profile updates affecting preferences
   - Session management across modules
   - End-to-end user workflows

### Configuration Files

- **Test environment** (`.env.test`) - Test-specific environment variables
- **Jest configuration** (`jest.integration.config.ts`) - Integration test Jest setup
- **Jest setup files** - Global setup, teardown, and custom matchers
- **Test sequencer** - Controls test execution order for database safety

## 🚀 How to Run the Tests

### Prerequisites

1. **Database Setup**: Ensure PostgreSQL is running

   ```bash
   # Start database (if using Docker)
   npm run docker:up

   # Or start PostgreSQL locally
   brew services start postgresql  # macOS
   sudo service postgresql start   # Linux
   ```

2. **Install Dependencies**: Already installed with supertest
   ```bash
   yarn install  # Already done
   ```

### Running Tests

#### All Integration Tests

```bash
npm run test:integration
```

#### Specific Test Categories

```bash
# Navigation API tests
npm run test:integration -- --testPathPattern=navigation

# User Profile API tests
npm run test:integration -- --testPathPattern=user-profile

# Authentication flow tests
npm run test:integration -- --testPathPattern=auth-flow

# Cross-module tests
npm run test:integration -- --testPathPattern=cross-module
```

#### With Coverage

```bash
npm run test:integration:coverage
```

#### Watch Mode

```bash
npm run test:integration:watch
```

#### Verbose Output

```bash
npm run test:integration:verbose
```

#### Run All Tests (Unit + Integration)

```bash
npm run test:all
```

## 🔍 Test Features

### Authentication Testing

- **User Creation**: Automated test user creation with different roles
- **Token Management**: JWT generation, validation, and expiration
- **Login/Logout Flows**: Complete authentication workflows
- **Permission Testing**: Role-based access control validation

### Database Testing

- **Real Database**: Uses actual PostgreSQL test database
- **Automatic Cleanup**: Database state reset between test suites
- **Migration Testing**: Database schema validation
- **Transaction Support**: Test isolation with transactions

### API Testing

- **Full Application Context**: Tests against complete Fastify app
- **HTTP Request Testing**: Using supertest for real HTTP calls
- **File Upload Testing**: Avatar upload with actual files
- **Error Scenario Testing**: Comprehensive error handling validation

### Performance Testing

- **Response Time Validation**: Built-in performance assertions
- **Concurrent Request Testing**: Load testing capabilities
- **Database Connection Pooling**: Optimized for test performance

## 📊 Test Coverage

The integration tests provide comprehensive coverage for:

- ✅ **Authentication flows** (registration, login, logout, token refresh)
- ✅ **Navigation API** (role-based filtering, caching, permissions)
- ✅ **User Profile API** (CRUD operations, file uploads, preferences)
- ✅ **Cross-module interactions** (authentication → profile → navigation)
- ✅ **Error handling** (validation, authorization, server errors)
- ✅ **Database operations** (real CRUD, transactions, cleanup)

## 🛠️ Example Test Usage

### Quick Test Creation

```typescript
import { quickSetup, createAuthenticatedUser, expectResponse } from './integration';

describe('My New API Test', () => {
  let context;

  beforeAll(async () => {
    context = await quickSetup();
  });

  afterAll(async () => {
    await context.cleanup();
  });

  it('should test my endpoint', async () => {
    const { token } = await createAuthenticatedUser(context.auth);

    const response = await context.request.getAuth('/api/my-endpoint', { token });

    expectResponse(response)
      .hasStatus(200)
      .isSuccess()
      .hasData((data) => {
        expect(data.result).toBe('expected');
      });
  });
});
```

### Full Test Setup

```typescript
import { setupTestContext, AuthHelper, RequestHelper, expectResponse } from './integration';

describe('Detailed Integration Test', () => {
  let testContext;
  let authHelper;
  let requestHelper;

  beforeAll(async () => {
    testContext = await setupTestContext();
    authHelper = new AuthHelper(testContext.app, testContext.db.connection);
    requestHelper = new RequestHelper(testContext.app);
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  it('should perform complex test scenario', async () => {
    // Create test user with specific role
    const user = await authHelper.createUserWithRole('manager', ['users.read', 'reports.read']);

    // Login and get tokens
    const tokens = await authHelper.loginUser(user.email, user.password);

    // Test API endpoints
    const profileResponse = await requestHelper.getAuth('/api/users/profile', {
      token: tokens.accessToken,
    });

    expectResponse(profileResponse)
      .hasStatus(200)
      .isSuccess()
      .hasData((data) => {
        expect(data.role.name).toBe('manager');
        expect(data.role.permissions).toContain('users.read');
      });
  });
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**

   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432

   # Create test database manually if needed
   createdb aegisx_test
   ```

2. **Test Timeouts**
   - Tests have 30-second timeout by default
   - Increase timeout in `jest.integration.config.ts` if needed
   - Check for hanging database connections

3. **Permission Errors**
   - Verify test user roles are created correctly
   - Check seed data in `apps/api/src/database/seeds/`
   - Review permission mappings in test factories

4. **File Upload Tests**
   ```bash
   # Ensure test assets directory exists
   mkdir -p apps/api/src/__tests__/integration/test-assets
   ```

### Debug Mode

```bash
# Enable detailed logging
DISABLE_LOGGING=false npm run test:integration:verbose

# Run single test file
npm run test:integration -- --testPathPattern=navigation --verbose
```

## 📝 Next Steps

The integration test suite is now ready for use! You can:

1. **Run the tests** to verify everything works
2. **Add new test cases** for additional endpoints
3. **Integrate with CI/CD** pipelines for automated testing
4. **Extend test utilities** for specific project needs

## 🎯 Test Architecture Summary

```
Integration Test Suite
├── 🏗️ Infrastructure
│   ├── Full Fastify app context
│   ├── Real PostgreSQL database
│   ├── JWT authentication system
│   └── File upload capabilities
├── 🧪 Test Utilities
│   ├── Authentication helpers
│   ├── Database management
│   ├── Request/response helpers
│   └── Data factories
├── 📋 Test Suites
│   ├── Navigation API (permissions, caching)
│   ├── User Profile API (CRUD, uploads)
│   ├── Authentication flows (login/logout)
│   └── Cross-module integration
└── ⚙️ Configuration
    ├── Jest setup with custom sequencer
    ├── Test environment variables
    ├── Coverage thresholds
    └── Performance monitoring
```

Your AegisX API now has comprehensive integration testing capabilities! 🚀
