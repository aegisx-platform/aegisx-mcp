# PDF Template API - Complete Architecture Analysis

## Database Schema

### Main Table: `pdf_templates`

**Required Fields:**

- `id` (uuid, PK) - Auto-generated
- `name` (varchar100, UNIQUE) - Template identifier
- `display_name` (varchar200) - Human-readable name
- `template_data` (json) - PDFMake document definition
- `created_at`, `updated_at` (timestamp) - Auto-managed

**Optional Fields with Defaults:**

- `description` (text) - Template description
- `category` (varchar50, default: 'general') - Template category
- `type` (varchar50, default: 'document') - Template type
- `page_size` (varchar10, default: 'A4') - Page size
- `orientation` (varchar10, default: 'portrait') - Page orientation
- `styles` (json) - Custom CSS/PDFMake styles
- `fonts` (json) - Font configuration
- `version` (varchar20, default: '1.0.0') - Semantic version
- `is_active` (boolean, default: true) - Active status
- `is_default` (boolean, default: false) - Default template flag
- `usage_count` (integer, default: 0) - Usage counter
- `assets` (json) - Template assets (images, etc.)
- `permissions` (json) - Access control
- `created_by`, `updated_by` (uuid) - User tracking

**Indexes:**

- PRIMARY KEY on `id`
- UNIQUE on `name`
- Indexes on: `category`, `type`, `is_active`, `created_by`
- Composite index on `(category, type)`

### Related Table: `pdf_template_versions`

Stores historical versions of templates for audit trail.

**Fields:**

- `id` (uuid, PK)
- `template_id` (uuid, FK → pdf_templates.id, CASCADE DELETE)
- `version` (varchar20)
- `changelog` (text)
- `template_data`, `sample_data`, `schema`, `styles`, `fonts` (json)
- `created_by` (uuid)
- `created_at` (timestamp)

**Purpose:** Version control for template changes

### Related Table: `pdf_renders`

Tracks all PDF generation requests and their results.

**Fields:**

- `id` (uuid, PK)
- `template_id` (uuid, FK → pdf_templates.id)
- `template_version` (varchar20)
- `render_type` (varchar20, default: 'normal')
- `render_data` (json) - Data used for rendering
- `page_count`, `file_size`, `render_time_ms` (integer)
- `rendered_at` (timestamp)
- `rendered_by` (uuid)
- `ip_address`, `user_agent` (varchar)
- `file_path`, `file_url` (varchar)
- `expires_at` (timestamp)
- `status` (varchar20, default: 'completed')
- `error_message` (text)

**Purpose:** Render history, analytics, file management

## API Endpoints (Registered at `/api/pdf-template`)

### Template CRUD

1. **POST /** - Create template
   - Body: CreatePdfTemplateSchema
   - Response: 201 with created template
   - Creates initial version automatically

2. **GET /:id** - Get template by ID
   - Params: { id: uuid }
   - Response: 200 with template data

3. **GET /** - List templates
   - Query: Pagination, filters, search
   - Response: 200 with data array + pagination

4. **PUT /:id** - Update template
   - Params: { id: uuid }
   - Body: UpdatePdfTemplateSchema
   - Response: 200 with updated template
   - **ISSUE:** Currently returns empty `data: {}` object

5. **DELETE /:id** - Delete template
   - Params: { id: uuid }
   - Response: 200 with success message

### Template Operations

6. **POST /render** - Render PDF from template
   - Body: { templateId or templateName, data, options }
   - Response: PDF buffer or JSON with file URLs
   - Increments usage_count
   - Creates render record

7. **POST /:id/preview** - Preview template
   - Params: { id: uuid }
   - Body: { data?: object }
   - Uses sample_data if no data provided

8. **POST /validate** - Validate template structure
   - Body: { template_data: object }
   - Response: Validation result

9. **POST /:id/duplicate** - Duplicate template
   - Params: { id: uuid }
   - Body: { name: string }
   - Creates copy with new name

### Template Discovery

10. **GET /search** - Search templates
    - Query: { q: string }
    - Searches name, display_name, description, template_data

11. **GET /stats** - Get statistics
    - Response: Usage stats, popular templates, etc.

12. **GET /categories** - Get categories
    - Response: List of categories with counts

13. **GET /types** - Get types
    - Response: List of types with counts

14. **GET /:id/versions** - Get version history
    - Params: { id: uuid }
    - Response: Array of versions

15. **GET /helpers** - Get Handlebars helpers
    - Response: Available template helpers

## Service Layer (`PdfTemplateService`)

### Key Methods:

- `createTemplate(data, userId)` - Creates template + initial version
- `updateTemplate(id, data, userId)` - Updates template + creates new version if content changed
- `getTemplate(id)` - Retrieves template by ID
- `listTemplates(query)` - List with filters/pagination
- `deleteTemplate(id)` - Deletes template
- `renderPdf(request, userId, ip, userAgent)` - Renders PDF
- `previewTemplate(id, data?)` - Generates preview
- `validateTemplate(templateData)` - Validates structure
- `duplicateTemplate(id, name, userId)` - Duplicates template
- `searchTemplates(searchTerm)` - Searches templates
- `getStats()` - Returns statistics

### Dependencies:

- `PdfTemplateRepository` - Database operations
- `HandlebarsTemplateService` - Template compilation
- `PDFMakeService` - PDF generation

## Repository Layer (`PdfTemplateRepository`)

Extends `BaseRepository` with custom methods.

### Key Methods:

- `create(data, userId)` - Insert with audit fields
- **`update(id, data, userId)` - UPDATE BROKEN: Returns empty object**
- `findById(id)` - Find by ID
- `findByName(name, includeInactive)` - Find by unique name
- `findManyWithFilters(query)` - Advanced filtering
- `createVersion(...)` - Create version record
- `getVersions(templateId)` - Get version history
- `incrementUsageCount(templateId)` - Increment counter
- `duplicateTemplate(...)` - Duplicate logic

## Type Definitions

From `/apps/api/src/types/pdf-template.types.ts`:

- `PdfTemplate` - Main entity type
- `CreatePdfTemplate` - Create DTO
- `UpdatePdfTemplate` - Update DTO (all fields optional)
- `PdfTemplateVersion` - Version entity
- `PdfRender` - Render entity
- `PdfTemplateListQuery` - Query parameters
- `PdfRenderRequest` - Render request
- `PdfTemplateStats` - Statistics type

## Critical Issues Found

### 1. **UPDATE METHOD RETURNS EMPTY DATA** ✅ FIXED

**Location:** `apps/api/src/modules/pdf-export/routes/pdf-template.routes.ts:221-233`

**Problem:**

```typescript
response: {
  200: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: { type: 'object' },  // ❌ Empty object schema with no properties!
      message: { type: 'string' },
    },
  },
}
```

**Root Cause:** Fastify response schema serialization

- Response schema defined `data: { type: 'object' }` without properties
- Fastify serializer strips all fields from objects without defined properties
- Repository and service layers were working correctly
- Issue was in the response serialization layer

**Solution Applied:**

```typescript
response: {
  200: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        additionalProperties: true  // ✅ Allow all template fields
      },
      message: { type: 'string' },
    },
  },
}
```

**Result:**

- Update endpoint now returns complete template object with all 24 fields
- Frontend receives full data including template_data, sample_data, schema, etc.
- Edit functionality should work correctly now

### 2. **Dual Version Updates** ⚠️

**Location:** `apps/api/src/services/pdf-template.service.ts:135-142`

```typescript
const updated = await this.repository.update(id, data, userId);

if (hasContentChanges) {
  const newVersion = this.incrementVersion(existing.version);
  await this.repository.update(id, { version: newVersion }, userId); // ❌ Second update
  await this.repository.createVersion(...);
}
```

**Problem:** Updates template twice when content changes

- First update with user data
- Second update just for version number
- Could be optimized to single update

## Data Flow

### Create Template Flow:

1. User → Frontend Form
2. POST /api/pdf-template
3. PdfTemplateService.createTemplate()
4. Repository.create() → INSERT
5. Repository.createVersion() → INSERT version
6. Clear cache
7. Return created template

### Update Template Flow:

1. User → Frontend Edit Form
2. PUT /api/pdf-template/:id
3. PdfTemplateService.updateTemplate()
4. Repository.update() → UPDATE ❌ Returns {}
5. If content changed: Update version + create version record
6. Clear cache
7. Return updated template ❌ But it's {}

### Render PDF Flow:

1. User → Render request
2. POST /api/pdf-template/render
3. PdfTemplateService.renderPdf()
4. Get template
5. Compile Handlebars
6. Generate PDF with PDFMake
7. Save file / return buffer
8. Create render record
9. Increment usage_count

## Frontend Integration Points

### Required Frontend Components:

1. **Template List** - Browse/search templates
2. **Template Create Dialog** - Create new template
3. **Template Edit Dialog** - Edit existing template
4. **Template Preview** - Visual preview before rendering
5. **Template Duplicate** - Copy template
6. **Template Delete** - Remove template
7. **PDF Render Form** - Render with custom data
8. **Template Stats Dashboard** - Analytics view

### Form Requirements:

**Required Fields:**

- name (unique identifier)
- display_name
- template_data (JSON editor for PDFMake definition)

**Optional Fields:**

- description
- category (dropdown)
- type (dropdown)
- page_size (dropdown: A4, A5, Letter, Legal)
- orientation (dropdown: portrait, landscape)
- version (semver format)
- sample_data (JSON editor)
- schema (JSON Schema editor)
- styles (JSON editor)
- fonts (JSON editor)
- is_active (checkbox)
- is_default (checkbox)

## Next Steps

1. **Fix Repository Update Method**
   - Debug why query returns empty object
   - Check BaseRepository implementation
   - Test with direct Knex query
   - Ensure proper data transformation

2. **Optimize Service Layer**
   - Combine dual updates into single operation
   - Review version increment logic
   - Add better error handling

3. **Build Proper Frontend**
   - Align with actual API structure
   - Use correct field names and types
   - Implement proper JSON editors
   - Add template preview feature
   - Build render interface

4. **Add Integration Tests**
   - Test CRUD operations end-to-end
   - Verify version creation
   - Test render functionality
   - Validate error handling
