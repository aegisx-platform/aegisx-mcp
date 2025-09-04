# Git Hooks Configuration

## Overview

The project uses Git hooks to maintain code quality and consistency. Hooks are configured to be fast and non-intrusive while ensuring code standards.

## Pre-commit Hook

**Purpose**: Format and lint staged files before commit  
**Time**: < 10 seconds

- Runs `lint-staged` to format and lint only staged files
- Uses Prettier for formatting
- Uses ESLint for linting
- Configured in `.lintstagedrc.json`

## Commit-msg Hook

**Purpose**: Validate commit message format  
**Time**: < 1 second

- Ensures commit messages follow conventional commits format
- Examples: `feat:`, `fix:`, `chore:`, `docs:`, etc.

## Pre-push Hook

**Purpose**: Quick validation before pushing  
**Time**: < 30 seconds

Runs three checks in parallel:

1. **Type checking** - TypeScript compilation check for affected files
2. **Linting** - ESLint check for affected files
3. **Unit tests** - Jest unit tests for affected files (excludes e2e)

## Integration Tests

Integration and E2E tests are handled by GitHub Actions CI/CD pipeline to avoid blocking local development.

### Running API Tests Locally (Optional)

If you want to run full API integration tests before pushing:

```bash
# Option 1: Run tests then push manually
./scripts/test-all-routes.sh
git push

# Option 2: Use the helper script
./scripts/test-api-with-push.sh

# Option 3: Skip all hooks (emergency only)
git push --no-verify
```

## Configuration Files

- `.husky/` - Git hooks scripts
- `.lintstagedrc.json` - Lint-staged configuration
- `package.json` - Scripts and dependencies

## Troubleshooting

### Hook is too slow

- Ensure you're not running unnecessary services
- Use `--no-verify` for emergency pushes
- Check if node_modules need cleaning: `rm -rf node_modules && yarn`

### Tests failing on push

- Run `yarn nx affected:test` to see which tests are failing
- Fix the tests or use `--no-verify` if tests are unrelated

### Type errors on push

- Run `yarn nx affected --target=typecheck` to see errors
- Fix TypeScript errors before pushing
