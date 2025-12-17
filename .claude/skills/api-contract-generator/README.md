# API Contract Generator Skill

Automatically generates `API_CONTRACTS.md` documentation from existing Fastify route implementations.

## What This Skill Does

Claude will **automatically use this skill** when you:

- Ask to "generate API contract" or "create API docs"
- Say "I have routes but no documentation"
- Request "document the [feature] API"
- Want to update existing API contracts

## How It Works

1. **Locates Route Files** - Finds `.routes.ts` files for your feature
2. **Analyzes Implementation**:
   - HTTP methods and paths
   - Request/response schemas
   - Authentication requirements
   - Field validations and constraints
3. **Generates Documentation** - Creates standardized `API_CONTRACTS.md`
4. **Saves to Correct Location** - `docs/features/[feature]/API_CONTRACTS.md`

## Quick Start

### Example 1: Generate New Contract

```
You: "Generate API contract for departments"
```

Claude will:

- Find `departments.routes.ts`
- Analyze all endpoints
- Create `docs/features/departments/API_CONTRACTS.md`
- Document all 6 endpoints with full details

### Example 2: Update Existing Contract

```
You: "Update the users API contract, I added a new endpoint"
```

Claude will:

- Read existing contract
- Compare with current routes
- Add new endpoint documentation
- Preserve existing content

### Example 3: Document Multiple Features

```
You: "Generate contracts for all inventory features"
```

Claude will create contracts for all features in the inventory domain.

## Generated Contract Includes

### For Each Endpoint:

- ✅ Full path with HTTP method
- ✅ Description of what it does
- ✅ Authentication requirements
- ✅ Request parameters (path, query, body)
- ✅ Field validations and constraints
- ✅ Success response format (200, 201)
- ✅ Error response formats (400, 401, 404, etc.)
- ✅ Example JSON requests/responses

### Additional Sections:

- 📋 Base URL and prefixes
- 🔐 Authentication overview
- 📝 Common error formats
- ⚠️ Important notes and business rules
- 🔗 Related documentation links

## Example Output

```markdown
# Departments API Contracts

## Base URL

/api/v1/departments

## Endpoints

### 1. List Departments

**Endpoint:** `GET /api/v1/departments`
**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10) |
| search | string | No | Search by dept_code or dept_name |

**Response (200 OK):**
{
"success": true,
"data": {
"items": [...],
"pagination": {...}
}
}
```

## What Gets Documented

### ✅ Standard CRUD Endpoints

- GET /resource - List with pagination
- GET /resource/:id - Get by ID
- POST /resource - Create new
- PUT /resource/:id - Update existing
- DELETE /resource/:id - Delete

### ✅ Custom Endpoints

- GET /resource/dropdown - Dropdown lists
- POST /resource/bulk - Bulk operations
- POST /resource/import - CSV/Excel imports
- GET /resource/export - Data exports
- GET /resource/stats - Statistics

### ✅ Schema Details

- Field names and types
- Required vs optional
- Validation constraints (maxLength, pattern, etc.)
- Default values
- Enum values

### ✅ Response Formats

- Success responses (200, 201)
- Error responses (400, 401, 404, 409, 500)
- Pagination structure
- Standard response wrapper

## Benefits

### For Developers

- 📖 No manual documentation writing
- 🎯 Always matches actual implementation
- ⚡ Instant documentation updates
- 📋 Standardized format across all features

### For Frontend Team

- 🔍 Clear API specifications
- 📊 Complete request/response examples
- ✅ Know all validations upfront
- 🚀 Start frontend work immediately

### For API-First Development

- 📝 Documentation stays in sync with code
- 🔄 Easy to update after changes
- 📚 Single source of truth
- 🎨 Consistent documentation style

## Integration with Workflow

### Workflow: Routes → Contract → Validate

```bash
# Step 1: Generate contract from routes
You: "Generate API contract for products"

# Step 2: Review generated docs
# Check docs/features/products/API_CONTRACTS.md

# Step 3: Validate implementation matches
You: "Validate the products API"
# Uses api-contract-validator skill

# Step 4: Commit documentation
git add docs/features/products/API_CONTRACTS.md
git commit -m "docs(products): add API contract documentation"
```

### When to Regenerate

Regenerate contracts when:

- ✨ Adding new endpoints
- 🔧 Modifying request/response schemas
- 🔐 Changing authentication requirements
- 📊 Adding new query parameters or filters
- 🐛 Fixing validation rules

## Advanced Features

### Custom Endpoint Documentation

The generator recognizes and documents:

**Dropdown Endpoints:**

```typescript
fastify.get('/dropdown', ...)
→ Documents simplified response format for select dropdowns
```

**Bulk Operations:**

```typescript
fastify.post('/bulk', ...)
→ Documents array input and bulk response format
```

**Import/Export:**

```typescript
fastify.post('/import', ...)
→ Documents file upload and processing
```

### TypeBox Schema Analysis

Automatically extracts:

```typescript
Type.String({ maxLength: 50, pattern: '^[A-Z]+$' })
→ "Type: string, Max: 50 chars, Pattern: uppercase letters only"

Type.Optional(Type.String())
→ "Required: No"

Type.Enum(['active', 'inactive'])
→ "Type: enum, Values: active, inactive"
```

## Troubleshooting

### Skill Not Triggering?

Make sure your prompt mentions:

- "generate" or "create" + "API contract" or "API docs"
- A feature name

**Good prompts:**

- "Generate API contract for departments"
- "Create API documentation for users"
- "Document the products API"

**Less clear:**

- "Make docs" (too vague)
- "Write something for the API" (unclear intent)

### Route File Not Found?

Claude will search these locations automatically:

- `apps/api/src/layers/platform/[feature]/`
- `apps/api/src/layers/domains/[domain]/[feature]/`
- `apps/api/src/modules/[feature]/`
- `apps/api/src/core/[feature]/`

You can help by specifying the path:

```
You: "Generate contract for products, routes are in layers/domains/inventory/products/"
```

### Schemas in Separate Files?

No problem! Claude will search for schema definitions across the codebase:

```bash
grep -r "[FeatureName]Schema" apps/api/src
```

## Helper Script

Quick generation from command line:

```bash
# Generate contract for specific feature
./.claude/skills/api-contract-generator/scripts/generate.sh departments

# Dry run (preview without creating file)
./.claude/skills/api-contract-generator/scripts/generate.sh departments --dry-run
```

**Note:** The script is a basic helper. For complete generation, ask Claude.

## Related Skills

Use these skills together:

1. **api-contract-generator** ← Generate contracts from routes
2. **api-contract-validator** ← Verify routes match contracts
3. **api-endpoint-tester** ← Test documented endpoints

Perfect workflow:

```
Generate → Validate → Test
```

## Project Standards

This skill follows:

- [API Calling Standard](../../../docs/guides/development/api-calling-standard.md)
- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [TypeBox Schema Standard](../../../docs/reference/api/typebox-schema-standard.md)

## Examples from Real Features

### Example: Departments

**Input:**

- Routes: `apps/api/src/layers/platform/departments/departments.routes.ts`
- 6 endpoints (5 CRUD + 1 dropdown)

**Output:**

- Contract: `docs/features/departments/API_CONTRACTS.md`
- 15 pages of detailed documentation
- All schemas fully documented
- Ready for frontend development

### Example: User Profile

**Input:**

- Routes: `apps/api/src/layers/platform/user-profile/profile.routes.ts`
- Complex nested schemas

**Output:**

- Complete contract with all endpoints
- Password change endpoint documented
- Profile picture upload specs
- Permission requirements detailed

## Share with Team

This skill is committed to git:

```bash
# Team members get it automatically
git pull

# Everyone can now generate contracts
"Claude, generate API contract for [feature]"
```

## Questions?

Ask Claude:

- "How do I generate an API contract?"
- "Can you update the departments contract?"
- "Show me the generated contract format"
- "What endpoints will be documented?"

---

**Ready to use!** Just ask Claude to generate contracts for your features.
