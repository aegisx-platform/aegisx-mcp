# Frontend Integration Guide Skill - Index

Complete guide for integrating Angular frontend with generated backend APIs.

**Skill Name:** `frontend-integration-guide`
**Complexity Level:** Simple-Medium (Haiku/Sonnet)
**Location:** `.claude/skills/frontend-integration-guide/`

---

## Files Overview

### Documentation Files

#### 1. **SKILL.md** (1,125 lines)

Main skill instructions for Claude. Contains:

- When to use this skill
- Key principles and architectural decisions
- Complete service pattern with Signals
- Component patterns (list, dialogs)
- AegisX UI component integration
- Filter components
- HTTP response types
- Common patterns and best practices
- Type safety standards
- Error handling patterns
- Testing patterns
- Troubleshooting guide

**Use this when:** Claude needs detailed instructions on implementing frontend features

#### 2. **README.md** (637 lines)

User-facing documentation. Contains:

- What the skill does
- Quick start examples (4 real scenarios)
- File structure guidelines
- Service architecture overview
- Component template patterns
- Common issues and solutions
- Material + AegisX UI imports
- Testing patterns
- Real feature examples to study
- Questions to ask Claude

**Use this when:** You want to understand how the skill works

#### 3. **REFERENCE.md** (618 lines)

Quick lookup guide with code snippets. Contains:

- Signal patterns (basic, computed)
- Dependency injection (inject pattern)
- HTTP patterns (GET, POST, query params)
- Form patterns (reactive forms, validation)
- Template patterns (@if, @for, conditional rendering)
- Material components (button, input, select, table, dialog)
- AegisX UI components (card, empty state, error state, badge)
- Dialog structure (MANDATORY)
- Observable patterns (subscribe, pipe operators)
- Error handling patterns
- Utility functions
- Router patterns
- Testing patterns
- Performance tips
- Common mistakes
- File structure checklist
- Imports quick copy

**Use this when:** You need to quickly find a code pattern or example

### Template Files

Templates in `templates/` directory for generating boilerplate code:

#### 1. **service.template.ts** (462 lines)

Complete service template with Signals. Contains:

- Full JSDoc documentation
- Private dependencies setup
- Private state signals
- Public computed signals
- CRUD operations (create, read, update, delete)
- Bulk operations (bulk delete)
- State management methods
- Error handling in every method
- Type definitions
- Usage examples in comments

**Customize:** Replace [FEATURE_TITLE], [ENTITY_NAME], [feature], etc.

#### 2. **list.component.template.ts** (313 lines)

List component with table and filters. Contains:

- Dependency injection
- Template state variables
- Data loading logic
- Search and filter handlers
- Pagination handler
- Sort handler
- Dialog handlers (create, edit, delete)
- Helper methods
- Complete imports
- Standalone component setup

**Customize:** Replace placeholders with your feature names

#### 3. **form-dialog.component.template.ts** (395 lines)

Form dialog for create/edit operations. Contains:

- MANDATORY dialog structure (header/content/actions)
- Dependency injection
- Form initialization
- Form submission logic
- Error handling and display
- Real-time validation feedback
- Loading state management
- Accessibility attributes
- Complete validation display

**Customize:** Add your form fields and validators

#### 4. **list.component.template.html** (225 lines)

HTML template for list component. Contains:

- Breadcrumb navigation
- Page header with title
- Search and filter bar
- Active filters display
- Data table with sorting
- Empty state
- Error state
- Pagination controls
- Action buttons (edit, delete)

**Customize:** Update column definitions and labels

#### 5. **types.template.ts** (306 lines)

Type definitions for your feature. Contains:

- Entity interface
- Create DTO interface
- Update DTO interface
- List query parameters interface
- Pagination info interface
- Service state interface
- UI filter state interface
- API response wrapper interface
- Error response interface
- Table column configuration interface
- Dialog data interfaces
- Bulk operation options interface
- Selection state interface
- Type guard functions
- Constants for defaults

**Customize:** Update field names and add domain-specific fields

---

## Quick Start

### Step 1: Choose Your Feature

Decide what to build (Products, Orders, Inventory Items, etc.)

### Step 2: Create Service

```bash
cp templates/service.template.ts apps/web/src/app/features/[feature]/services/[feature].service.ts
```

Then customize:

- Replace `[FEATURE_TITLE]` with PascalCase (e.g., `Products`)
- Replace `[ENTITY_NAME]` with singular PascalCase (e.g., `Product`)
- Replace `[feature]` with kebab-case (e.g., `products`)
- Update API endpoint paths
- Add custom fields to state and CRUD methods

### Step 3: Create Types

```bash
cp templates/types.template.ts apps/web/src/app/features/[feature]/types/[feature].types.ts
```

Then customize:

- Update interface field names to match your domain
- Add validation constraints in comments
- Update type guards if needed

### Step 4: Create Components

Use templates for:

- List component (list.component.template.ts + list.component.template.html)
- Dialog component (form-dialog.component.template.ts)

### Step 5: Register Routes

Add components to your routing module

### Step 6: Test

Use REFERENCE.md patterns for unit tests

---

## Key Patterns

### Service State Management (Signals)

All data services follow this pattern:

```typescript
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private _state = signal<State>(initialState);

  readonly items = computed(() => this._state().items);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  loadItems(): Observable<T[]> {
    this._state.update((s) => ({ ...s, loading: true }));
    return this.http.get(url).pipe(
      tap((response) => {
        this._state.update((s) => ({
          ...s,
          items: response.data,
          loading: false,
        }));
      }),
    );
  }
}
```

### Component Usage

Components inject service and use signals in templates:

```typescript
export class ProductsListComponent {
  protected service = inject(ProductsService);

  ngOnInit(): void {
    this.service.loadItems().subscribe();
  }
}
```

```html
@if (service.loading()) {
<mat-spinner></mat-spinner>
} @else if (service.items().length === 0) {
<ax-empty-state></ax-empty-state>
} @else {
<table>
  @for (item of service.items(); track item.id) {
  <!-- rows -->
  }
</table>
}
```

### Dialog Structure (MANDATORY)

All dialogs follow this structure:

```html
<div>
  <!-- Header: Title + Close Button -->
  <div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
    <div class="flex items-center gap-3">
      <mat-icon>icon</mat-icon>
      <h2 class="text-xl font-semibold m-0">Title</h2>
    </div>
    <button mat-icon-button mat-dialog-close>
      <mat-icon>close</mat-icon>
    </button>
  </div>

  <!-- Content: Form -->
  <mat-dialog-content class="py-6">
    <!-- Form fields -->
  </mat-dialog-content>

  <!-- Actions: Cancel + Save -->
  <mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-raised-button color="primary" (click)="save()">Save</button>
  </mat-dialog-actions>
</div>
```

### AegisX UI Integration

Use these components for UI:

- **BreadcrumbComponent** - Navigation path
- **CardComponent** - Container with title and loading
- **EmptyStateComponent** - When no data
- **ErrorStateComponent** - When error occurs
- **BadgeComponent** - Status indicators
- **SkeletonComponent** - Loading placeholders

---

## Integration Workflow

### Phase 1: Plan

- Review existing feature example: `apps/web/src/app/features/system/modules/departments/`
- Check backend API contract in `docs/features/[feature]/API_CONTRACTS.md`
- Plan component hierarchy

### Phase 2: Create

1. Create types (from types.template.ts)
2. Create service (from service.template.ts)
3. Create components (from component templates)
4. Create routes

### Phase 3: Customize

- Add business-specific logic
- Integrate AegisX UI components
- Add custom validation
- Implement filters

### Phase 4: Test

- Test service with HttpTestingController
- Test component rendering
- Test form validation
- Test error states

### Phase 5: Deploy

- Build and verify: `pnpm run build`
- Commit changes with proper commit message

---

## Common Use Cases

### List with Filters

Start with: `list.component.template.ts` + `list.component.template.html`

### Create/Edit Dialog

Start with: `form-dialog.component.template.ts`

### Data Service

Start with: `service.template.ts`

### Type Safety

Start with: `types.template.ts`

---

## Important Notes

### Signals Always Called as Functions

```typescript
// ✅ Correct
{
  {
    items().length;
  }
}

// ❌ Wrong
{
  {
    items.length;
  }
}
```

### Always Expose Read-Only Signals

```typescript
// ✅ Correct
readonly items = computed(() => this._state().items);

// ❌ Wrong
readonly items = this._state;
```

### Dialog MANDATORY Structure

All dialogs must follow header/content/actions structure. See REFERENCE.md for example.

### Use AegisX UI Components

Combine Material + AegisX UI for consistent look and feel

### Track Function in @for

```typescript
// ✅ Correct (with track)
@for (item of items(); track item.id) { }

// ❌ Wrong (no track - performance issue)
@for (item of items()) { }
```

---

## File Locations

### In Your Feature

```
apps/web/src/app/features/[feature]/
├── components/
│   ├── [feature]-form-dialog.component.ts
│   ├── [feature]-form-dialog.component.html
│   ├── [feature]-list.component.ts
│   ├── [feature]-list.component.html
│   └── [feature]-list-filters.component.ts
├── services/
│   └── [feature].service.ts
├── types/
│   └── [feature].types.ts
└── [feature].routes.ts
```

### Study Existing Feature

```
apps/web/src/app/features/system/modules/departments/
├── components/
│   ├── departments-list.component.ts
│   ├── departments-list.component.html
│   ├── department-form-dialog/
│   └── departments-list-filters.component.ts
├── services/
│   ├── departments.service.ts
│   └── departments-ui.service.ts
├── types/
│   └── departments-ui.types.ts
└── departments.routes.ts
```

---

## Related Documentation

- [Universal Full-Stack Standard](../../../docs/guides/development/universal-fullstack-standard.md)
- [API Calling Standard](../../../docs/guides/development/api-calling-standard.md)
- [Feature Development Standard](../../../docs/guides/development/feature-development-standard.md)
- [API Contracts](../../../docs/reference/api/api-response-standard.md)

---

## When to Use This Skill

Use `frontend-integration-guide` when you need to:

1. **Customize frontend after generation** - Add business logic to generated components
2. **Implement signals-based services** - Create reactive data layer
3. **Create list components** - Display data in table with filters/sorting
4. **Build dialogs** - Create/edit forms with validation
5. **Integrate AegisX UI** - Use design system components
6. **Handle complex state** - Manage UI and data state
7. **Fix frontend issues** - Debug component or service problems
8. **Implement filters** - Search and filter UI components
9. **Add error handling** - Display and manage error states
10. **Type-safe frontend** - Ensure proper TypeScript types

---

## Statistics

- **Total Lines:** 4,081
- **Files:** 8 (3 docs + 5 templates)
- **Skill.md:** 1,125 lines of detailed instructions
- **README.md:** 637 lines of user documentation
- **Reference.md:** 618 lines of quick lookup snippets
- **Templates:** 1,701 lines of ready-to-use code

---

## How Claude Uses This Skill

Claude will automatically suggest or implement patterns from this skill when you:

- Ask to "customize frontend components"
- Request help with "Angular services" or "signals"
- Need "create/edit dialog" implementation
- Ask about "AegisX UI integration"
- Want examples of "Material + Angular" patterns
- Need "reactive forms" or "validation" help
- Ask for "list component with filters"
- Want to understand "service state management"

---

**Last Updated:** 2025-12-17
**Supervisor:** Opus 4.5
**Status:** Ready for Use
