# MCP (Model Context Protocol) Integration Guide

## Overview

This guide explains how to integrate and use MCP tools with the AegisX platform for enhanced AI-assisted development.

## 🛠️ MCP Tools Setup

### 1. Nx MCP Integration

The Nx MCP tool enables AI-powered workspace management and code generation.

#### Installation & Setup

```bash
# MCP tools are typically installed in your AI assistant (Claude, Cursor, etc.)
# No additional installation needed in the project
```

#### Key Capabilities

- **Workspace Analysis**: Understand project structure and dependencies
- **Code Generation**: Generate components, services, and modules
- **Task Execution**: Run build, test, and serve commands
- **Dependency Management**: Analyze and manage project dependencies

#### Usage Examples

**Generate a new feature module:**

```bash
# Using Nx MCP through Claude
"Use Nx MCP to generate a new feature module for user-management"

# This will:
1. Analyze current workspace structure
2. Generate appropriate files in the correct location
3. Update module dependencies
4. Configure routing if needed
```

**Analyze project dependencies:**

```bash
# Using Nx MCP
"Use Nx MCP to show project dependency graph"
"Use Nx MCP to find circular dependencies"
```

**Run tasks efficiently:**

```bash
# Using Nx MCP
"Use Nx MCP to run affected tests"
"Use Nx MCP to build only changed projects"
```

### 2. Playwright MCP Integration

The Playwright MCP tool provides visual E2E testing capabilities.

#### Key Features

- **Visual Testing**: See actual browser interactions
- **Screenshot Capture**: Automatic screenshots during tests
- **Debugging**: Step-by-step test execution
- **Cross-browser Testing**: Test on Chrome, Firefox, Safari

#### Setup E2E Tests

```typescript
// apps/e2e/src/e2e/app.cy.ts
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should login successfully', async ({ page }) => {
    // Playwright MCP will show visual execution
    await page.goto('http://localhost:4200');
    await page.fill('[data-testid="email"]', 'admin@aegisx.local');
    await page.fill('[data-testid="password"]', 'Admin123!');
    await page.click('[data-testid="login-button"]');

    // Visual assertion
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });
});
```

#### Usage with Claude

```bash
# Run E2E tests with visual feedback
"Use Playwright MCP to run login tests and show me the results"

# Debug a failing test
"Use Playwright MCP to debug the user registration test"

# Create new E2E test
"Use Playwright MCP to create an E2E test for the product listing page"
```

## 📋 Recommended MCP Workflow

### 1. Feature Development with MCP

```bash
# Step 1: Use Nx MCP to analyze current state
"Use Nx MCP to show current workspace structure"

# Step 2: Generate feature with AI assistance
/start invoice-management
"Use Nx MCP to generate the backend module structure"
"Use Nx MCP to generate the frontend components"

# Step 3: Run development servers
"Use Nx MCP to serve api and web projects"

# Step 4: Create E2E tests
"Use Playwright MCP to create E2E tests for invoice CRUD operations"

# Step 5: Run tests with visual feedback
"Use Playwright MCP to run the invoice management tests"
```

### 2. Debugging with MCP

```bash
# Analyze build errors
"Use Nx MCP to analyze why the build is failing"

# Debug E2E test failures
"Use Playwright MCP to debug the failing checkout test with screenshots"

# Check project dependencies
"Use Nx MCP to find why api project is not building"
```

### 3. Code Quality with MCP

```bash
# Run linting
"Use Nx MCP to run linting on affected projects"

# Run tests
"Use Nx MCP to run unit tests for changed files"

# Check bundle size
"Use Nx MCP to analyze bundle size for web app"
```

## 🎯 Best Practices

### 1. Nx MCP Best Practices

- Always check affected projects before building
- Use computation caching for faster builds
- Generate code using Nx generators for consistency
- Keep project boundaries clean

### 2. Playwright MCP Best Practices

- Use data-testid attributes for reliable selectors
- Write tests that are visual and easy to debug
- Capture screenshots at key points
- Test across different viewports

### 3. Integration Best Practices

- Use Nx MCP for structural changes
- Use Playwright MCP for user flow validation
- Combine both for full-stack feature development
- Let AI assist with repetitive tasks

## 🔧 Configuration

### Nx Configuration for MCP

```json
// nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"],
        "parallel": true,
        "maxParallel": 3
      }
    }
  }
}
```

### Playwright Configuration for MCP

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4200',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
```

## 📚 Common MCP Commands

### Nx MCP Commands

```bash
# Workspace management
"Use Nx MCP to show project graph"
"Use Nx MCP to list all projects"
"Use Nx MCP to show affected projects"

# Code generation
"Use Nx MCP to generate a library"
"Use Nx MCP to generate a component"
"Use Nx MCP to generate a service"

# Task execution
"Use Nx MCP to build all projects"
"Use Nx MCP to test affected projects"
"Use Nx MCP to serve multiple projects"
```

### Playwright MCP Commands

```bash
# Test execution
"Use Playwright MCP to run all E2E tests"
"Use Playwright MCP to run tests in headed mode"
"Use Playwright MCP to run a specific test file"

# Debugging
"Use Playwright MCP to debug test with browser open"
"Use Playwright MCP to capture screenshots during test"
"Use Playwright MCP to record video of test execution"

# Test creation
"Use Playwright MCP to record a new test"
"Use Playwright MCP to generate test from user actions"
```

## 🚀 Quick Start with MCP

1. **Setup Project**

   ```bash
   yarn install
   cp .env.example .env
   docker-compose up -d
   ```

2. **Start Development with MCP**

   ```bash
   "Use Nx MCP to serve all applications"
   ```

3. **Create Feature with MCP**

   ```bash
   /start user-profile
   "Use Nx MCP to scaffold the feature structure"
   ```

4. **Test with MCP**
   ```bash
   "Use Playwright MCP to create and run E2E tests"
   ```

## 🎓 Learning Resources

- [Nx Documentation](https://nx.dev)
- [Playwright Documentation](https://playwright.dev)
- [MCP Specification](https://modelcontextprotocol.io)
- [Claude MCP Integration](https://docs.anthropic.com/mcp)

## 💡 Tips for Effective MCP Usage

1. **Let AI handle repetitive tasks** - Use MCP for boilerplate generation
2. **Visual debugging** - Use Playwright MCP for hard-to-debug UI issues
3. **Incremental development** - Use Nx MCP's affected commands
4. **Consistent patterns** - Use Nx generators through MCP for consistency
5. **Collaborative development** - Share MCP commands with team

Remember: MCP tools are designed to augment your development workflow, not replace understanding of the underlying tools!
