# Claude Detailed Development Rules

> **This file contains detailed rules and examples. See [CLAUDE.md](../../CLAUDE.md) for the concise version.**

## Universal Work Rules - Detailed Examples

### 1. Read Documentation FIRST

```bash
# 1. Check if documentation exists for this task
ls docs/
grep -r "keyword" docs/

# 2. Read ALL relevant documentation
cat docs/path/to/relevant-doc.md

# 3. Read project instructions
cat CLAUDE.md | grep -A 20 "keyword"

# 4. Only THEN start working
```

### 2. Complete Search Workflow Example

```bash
# ❌ WRONG - Partial search
grep "keyword" apps/admin/src/

# ✅ CORRECT - Complete search across entire codebase
grep -r "keyword" . --exclude-dir={node_modules,.git,dist}

# Example - Complete migration workflow:
# 1. Find ALL occurrences
grep -r "--aegisx-" . --exclude-dir={node_modules,.git,dist} | wc -l
# Output: 855 occurrences

# 2. List all affected files
grep -rl "--aegisx-" . --exclude-dir={node_modules,.git,dist}

# 3. Fix ALL files
# ... fix each file ...

# 4. Verify ZERO occurrences remain
grep -r "--aegisx-" . --exclude-dir={node_modules,.git,dist}
# Output: (empty) = Success
```

### 3. Test Workflow

```bash
# 1. Test current state
pnpm run build  # Must pass
pnpm run test   # Must pass (if applicable)

# 2. Make changes

# 3. Test again
pnpm run build  # Must still pass
pnpm run test   # Must still pass

# 4. Only if tests pass, proceed
```

### 4. Follow Existing Patterns

```bash
# 1. Find similar existing code
grep -r "similar-pattern" apps/

# 2. Read and understand existing implementation
cat apps/path/to/existing-file.ts

# 3. Copy the exact pattern
# Don't invent new patterns, follow existing ones

# 4. Verify your code matches the pattern
diff your-code.ts existing-code.ts
```

### 5. Verify and Double-Check

```bash
# 1. List what you changed
git status
git diff

# 2. Verify each file manually
cat path/to/changed-file.ts

# 3. Check for side effects
grep -r "affected-code" .

# 4. Test everything
pnpm run build
pnpm run test

# 5. Review one more time
git diff --cached
```

---

## Git Commit Workflow - Detailed

### Mandatory Pre-Commit Steps

```bash
# Step 1: Check what will be committed
git status
git diff

# Step 2: Add ONLY specific files related to current task
git add apps/admin/src/path/to/file.ts
git add libs/aegisx-ui/src/path/to/file.scss
# NEVER: git add -A
# NEVER: git add .

# Step 3: Verify what's staged
git diff --cached

# Step 4: TEST BUILD (MANDATORY - NO EXCEPTIONS)
pnpm run build

# Step 5: Only if build succeeds, commit
git commit -m "type(scope): description"
```

### Example Correct Workflow

```bash
# 1. Check status
git status

# 2. See you modified 3 files for CSS variable migration
# modified: apps/admin/src/app/app.scss
# modified: libs/aegisx-ui/src/lib/theme/light.scss
# modified: docs/README.md

# 3. Add ONLY these 3 files
git add apps/admin/src/app/app.scss
git add libs/aegisx-ui/src/lib/theme/light.scss
git add docs/README.md

# 4. Verify staged changes
git diff --cached

# 5. Test build
pnpm run build

# 6. If build passes, commit
git commit -m "refactor(styles): migrate CSS variables to --ax- prefix"
```

---

## Git Subtree - Detailed Workflow

### Libraries using Git Subtree

| Library        | Monorepo Path     | Separate Repo                                                                       | NPM Package              |
| -------------- | ----------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| CRUD Generator | `libs/aegisx-cli` | [aegisx-platform/crud-generator](https://github.com/aegisx-platform/crud-generator) | `@aegisx/crud-generator` |
| UI Components  | `libs/aegisx-ui`  | [aegisx-platform/aegisx-ui](https://github.com/aegisx-platform/aegisx-ui)           | `@aegisx/ui`             |
| MCP Server     | `libs/aegisx-mcp` | [aegisx-platform/aegisx-mcp](https://github.com/aegisx-platform/aegisx-mcp)         | `@aegisx/mcp`            |

### How Git Subtree Works

```
┌─────────────────────────────────────┐
│     Monorepo (aegisx-starter)       │
│  ┌─────────────────────────────┐    │
│  │  libs/aegisx-cli │◄───┼──► GitHub: aegisx-platform/crud-generator
│  └─────────────────────────────┘    │         ↓ npm: @aegisx/crud-generator
│  ┌─────────────────────────────┐    │
│  │  libs/aegisx-ui             │◄───┼──► GitHub: aegisx-platform/aegisx-ui
│  └─────────────────────────────┘    │         ↓ npm: @aegisx/ui
│  ┌─────────────────────────────┐    │
│  │  libs/aegisx-mcp            │◄───┼──► GitHub: aegisx-platform/aegisx-mcp
│  └─────────────────────────────┘    │         ↓ npm: @aegisx/mcp
└─────────────────────────────────────┘
```

### Workflow for Making Changes

```bash
# 1. Make changes in monorepo
cd libs/aegisx-mcp
# ... edit files ...

# 2. Commit to monorepo
cd /path/to/aegisx-starter
git add libs/aegisx-mcp/
git commit -m "feat(aegisx-mcp): add new feature"

# 3. Sync to separate repository
cd libs/aegisx-mcp
./sync-to-repo.sh

# 4. Publish to npm (from separate repo or after sync)
npm publish
```

### Adding a New Subtree Library

```bash
# Add existing repo as subtree
git subtree add --prefix=libs/NEW_LIB https://github.com/aegisx-platform/NEW_LIB.git main --squash

# Create sync script
cat > libs/NEW_LIB/sync-to-repo.sh << 'EOF'
#!/bin/bash
BRANCH=${1:-main}
REMOTE_REPO="git@github.com:aegisx-platform/NEW_LIB.git"
cd "$(git rev-parse --show-toplevel)"
git subtree push --prefix=libs/NEW_LIB "$REMOTE_REPO" "$BRANCH"
EOF
chmod +x libs/NEW_LIB/sync-to-repo.sh
```

---

## Type Safety - Detailed Example

### Full Type Flow

```typescript
// 1. Schema definition
export const DeleteQuerySchema = Type.Object({
  force: Type.Optional(Type.Boolean())
});

// 2. Type export
export type DeleteQuery = Static<typeof DeleteQuerySchema>;

// 3. Route registration
querystring: DeleteQuerySchema,

// 4. Controller typing
request: FastifyRequest<{
  Params: FileIdParam;
  Querystring: DeleteQuery;
}>

// 5. Type-safe access
const force = request.query.force || false;
```

---

## UUID Validation - Detailed Configuration

### CRUD Generator Integration

```typescript
// Generated repositories automatically include UUID validation
export class ArticlesRepository extends BaseRepository<Articles, CreateArticles, UpdateArticles> {
  constructor(knex: Knex) {
    super(
      knex,
      'articles',
      [...searchFields],
      ['id', 'author_id'], // Explicit UUID fields for validation
    );
  }
}
```

### Manual Configuration

```typescript
// For custom repositories, declare UUID fields explicitly
repository.setUUIDFields(['user_id', 'category_id']);

// Configure validation strategy
repository.setUUIDValidationConfig({
  strategy: UUIDValidationStrategy.STRICT, // Throw 400 errors
  allowAnyVersion: true,
  logInvalidAttempts: true,
});
```

---

## Fastify preValidation Hook - Detailed Pattern

### Wrong vs Correct Pattern

```typescript
// ❌ WRONG: Throwing errors causes timeouts
fastify.decorate('verifyRole', function (allowedRoles: string[]) {
  return async function (request: FastifyRequest, _reply: FastifyReply) {
    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      throw new Error('INSUFFICIENT_PERMISSIONS'); // Request hangs!
    }
  };
});

// ✅ CORRECT: Return response directly
fastify.decorate('verifyRole', function (allowedRoles: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      return reply.forbidden('Insufficient permissions'); // Immediate 403!
    }
  };
});
```

### Reference Implementation

See `apps/api/src/core/auth/strategies/auth.strategies.ts`:

- `verifyJWT` (lines 8-40) - Returns `reply.unauthorized()`
- `verifyRole` (lines 44-51) - Returns `reply.forbidden()`
- `verifyOwnership` (lines 54-66) - Returns `reply.forbidden()`
- `verifyPermission` (lines 69-132) - Returns `reply.forbidden()`

---

## PROJECT_STATUS.md Update Policy - Detailed

### File Structure

```
PROJECT_STATUS.md              # Main status file (~500 lines)
├─ Summary & Recommendations   # Always at the top
├─ Recent Sessions (2-3)       # Latest sessions for quick recovery
└─ Reference to archives       # Link to docs/sessions/

docs/sessions/
├─ ARCHIVE_2024_Q4.md         # Sessions 38-46
├─ ARCHIVE_2024_Q3.md         # Older sessions
└─ SESSION_TEMPLATE.md        # Template for new sessions
```

### How to Update

```bash
# 1. Open PROJECT_STATUS.md
# 2. Scroll to "Summary & Recommendations" section (near top)
# 3. Update relevant subsections
# 4. Update "Last Updated" date at bottom of section
# 5. Add new session using SESSION_TEMPLATE.md as reference
# 6. Archive old sessions if needed
# 7. Commit changes with descriptive message
```

### How to Archive Sessions

```bash
# 1. Identify sessions to archive (keep only 2-3 latest)
# 2. Create/update docs/sessions/ARCHIVE_YYYY_QX.md
# 3. Move old session content to archive file
# 4. Update PROJECT_STATUS.md to reference archive
# 5. Commit with message: "docs: archive sessions X-Y to ARCHIVE_YYYY_QX.md"
```

---

## Testing Workflow - Detailed

### Test Data Example

```typescript
// 1. Check schema first
import { RegisterRequestSchema } from '../auth.schemas';

// 2. Create API-compatible test data
function createRegisterRequestData() {
  return {
    email: 'test@example.com',
    username: 'testuser',
    password: 'testpass123',
    firstName: 'Test',
    lastName: 'User',
    // ❌ Don't include: role, status, emailVerified (not in schema)
  };
}

// 3. Verify test app helper includes ALL required plugins
```

---

## API-First Workflow - Detailed

### Example Workflow

```bash
# 1. Check feature API contracts
cat docs/features/user-profile/API_CONTRACTS.md

# 2. Verify backend routes exist
grep -r "GET /api/profile/preferences" apps/api/src/

# 3. Test API endpoint
curl -X GET http://localhost:3333/api/profile/preferences

# 4. Only then implement frontend service
```
