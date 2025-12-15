# Requirements Document: Department Management UI

## Introduction

This feature provides comprehensive user interface components for managing organizational departments across the AegisX platform. It bridges the existing backend Department API (`/v1/platform/departments`) with frontend interfaces, enabling administrators to manage department hierarchies, assign users to departments, and display department affiliations on user profiles.

**Value Proposition:**

- **For Admins**: Centralized department management with hierarchical organization support
- **For Department Managers**: Easy assignment and tracking of team members
- **For Users**: Clear visibility of organizational structure and affiliations
- **For System**: Maintains data integrity between users and departments across all modules

## Alignment with Product Vision

This feature aligns with the platform's core architecture principles:

- **Domain Separation**: Departments are platform-level resources (not domain-specific)
- **Shared Infrastructure**: Departments are used across inventory, HR, and other domains
- **Permission-Based Access**: RBAC integration for department management operations
- **Hierarchical Organization**: Supports complex organizational structures

## Requirements

### Requirement 1: Admin Department Management Interface

**User Story:** As a **System Administrator**, I want to **manage departments through a dedicated admin interface**, so that **I can maintain accurate organizational structure and hierarchy**

#### Acceptance Criteria

1. WHEN admin navigates to Admin > Platform > Departments THEN system SHALL display department list with hierarchical view
2. WHEN admin views department list THEN system SHALL show dept_code, dept_name, parent department, active status, and action buttons
3. WHEN admin clicks "Add Department" THEN system SHALL open modal/dialog with create form
4. WHEN admin submits create form with valid data THEN system SHALL call POST /v1/platform/departments AND refresh list
5. IF admin submits create form with duplicate dept_code THEN system SHALL display conflict error (409)
6. WHEN admin clicks edit button on department THEN system SHALL open modal/dialog pre-filled with department data
7. WHEN admin updates department THEN system SHALL call PUT /v1/platform/departments/:id AND refresh list
8. WHEN admin clicks delete button THEN system SHALL show confirmation dialog
9. WHEN admin confirms deletion AND department has no users THEN system SHALL call DELETE /v1/platform/departments/:id
10. IF department has users assigned THEN system SHALL prevent deletion AND display error message
11. WHEN admin toggles active/inactive status THEN system SHALL update is_active field
12. WHEN viewing departments THEN system SHALL support filtering by active status, parent department
13. WHEN viewing departments THEN system SHALL support searching by dept_code or dept_name
14. WHEN viewing departments THEN system SHALL support pagination with 10/25/50/100 items per page

#### UI Components Required

- Department list table with hierarchy display (tree structure or nested rows)
- Create department dialog/modal
- Edit department dialog/modal
- Delete confirmation dialog
- Search and filter controls
- Pagination controls
- Active/inactive toggle switch

#### Technical Requirements

- Use existing DepartmentService from `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`
- Leverage AegisX UI components (ax-table, ax-dialog, ax-form-field)
- Use Angular Material components (mat-table, mat-dialog, mat-form-field, mat-select)
- Apply TailwindCSS for layout and spacing
- Implement reactive forms with validation

### Requirement 2: User Department Assignment

**User Story:** As a **System Administrator**, I want to **assign departments to users during user creation and editing**, so that **users are correctly affiliated with their organizational units**

#### Acceptance Criteria

1. WHEN admin creates new user THEN system SHALL display department dropdown selector
2. WHEN admin opens department dropdown THEN system SHALL call GET /v1/platform/departments/dropdown
3. WHEN admin selects department THEN system SHALL populate user.department_id field
4. WHEN admin selects parent department THEN system SHALL show child departments in hierarchical dropdown
5. IF admin leaves department field empty THEN system SHALL allow user creation without department (nullable field)
6. WHEN admin edits existing user THEN system SHALL display current department pre-selected
7. WHEN admin changes user's department THEN system SHALL call PUT /api/users/:id with new department_id
8. WHEN admin views user list THEN system SHALL display department name column
9. WHEN admin filters user list THEN system SHALL support filtering by department
10. WHEN user is assigned to department THEN system SHALL validate department exists AND is_active=true

#### UI Components Required

- Department dropdown selector (hierarchical mat-select)
- Department field in user create/edit forms
- Department column in user list table
- Department filter in user list

#### Technical Requirements

- Extend existing user forms with department field
- Use GET /v1/platform/departments/dropdown API
- Store department_id in users table
- Display department name (not just ID) in user lists
- Support hierarchical department selection (parent → child)

### Requirement 3: Profile Department Display

**User Story:** As a **User**, I want to **see my department affiliation on my profile**, so that **I can verify my organizational assignment**

#### Acceptance Criteria

1. WHEN user views their profile THEN system SHALL display department information section
2. IF user has department assigned THEN system SHALL show department name, code, and hierarchy path
3. IF user has no department assigned THEN system SHALL display "No department assigned"
4. WHEN user views department info THEN system SHALL show full hierarchy path (e.g., "Engineering > Backend Team")
5. WHEN user's department is inactive THEN system SHALL display warning indicator
6. WHEN user views profile THEN system SHALL fetch department details from GET /v1/platform/departments/:id
7. IF department fetch fails THEN system SHALL gracefully show "Department information unavailable"

#### UI Components Required

- Department information card on profile page
- Department hierarchy breadcrumb display
- Warning indicator for inactive departments
- Placeholder for users without departments

#### Technical Requirements

- Add department section to user profile component
- Fetch department details using DepartmentService
- Display hierarchical path (parent → child)
- Handle null/missing department gracefully
- Show visual indicators for active/inactive status

### Requirement 4: Department Hierarchy Management

**User Story:** As a **System Administrator**, I want to **manage department hierarchies with parent-child relationships**, so that **organizational structure is accurately represented**

#### Acceptance Criteria

1. WHEN admin creates department THEN system SHALL allow selecting parent department (nullable)
2. WHEN admin selects parent department THEN system SHALL prevent circular references
3. IF admin tries to set department as its own parent THEN system SHALL show validation error
4. IF admin tries to set child department as parent THEN system SHALL show validation error
5. WHEN admin views department list THEN system SHALL display hierarchy levels with indentation
6. WHEN admin clicks "View Hierarchy" THEN system SHALL call GET /v1/platform/departments/hierarchy
7. WHEN viewing hierarchy THEN system SHALL display tree structure with expand/collapse controls
8. WHEN admin moves department to different parent THEN system SHALL update parent_id
9. WHEN admin deletes parent department THEN system SHALL handle orphaned child departments
10. WHEN department has children THEN system SHALL prevent deletion OR offer cascading options

#### UI Components Required

- Parent department selector (excludes self and descendants)
- Hierarchy tree view with expand/collapse
- Drag-and-drop support for moving departments (optional)
- Circular reference validation

#### Technical Requirements

- Implement circular reference detection
- Use GET /v1/platform/departments/hierarchy for tree view
- Support nested department display (indentation or tree component)
- Validate parent_id changes prevent cycles

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Separate components for list, create, edit, hierarchy views
- **Modular Design**: Reusable department selector component across user management and profile
- **Dependency Management**: Use existing DepartmentService - no new HTTP calls in components
- **Clear Interfaces**: Type-safe interfaces for Department, DepartmentHierarchy, DepartmentDropdown

### Performance

- **Dropdown Loading**: Department dropdown should load in <500ms
- **List Rendering**: Department list should render 100 items in <200ms
- **Hierarchy Loading**: Hierarchy tree should load in <1s
- **Caching**: Cache dropdown data for 5 minutes to reduce API calls
- **Lazy Loading**: Load hierarchy children on-demand when node expands

### Security

- **Permission-Based Access**:
  - `departments:read` - View department list
  - `departments:create` - Create new departments
  - `departments:update` - Edit departments
  - `departments:delete` - Delete departments
- **Input Validation**: Sanitize all text inputs (dept_code, dept_name)
- **Authorization Checks**: Verify permissions before showing create/edit/delete buttons
- **CSRF Protection**: Use Angular's built-in CSRF token handling

### Reliability

- **Error Handling**: Display user-friendly messages for API errors
- **Graceful Degradation**: Show placeholder if department data unavailable
- **Network Resilience**: Retry failed requests with exponential backoff
- **Orphaned Department Handling**: Prevent orphaned departments on parent deletion

### Usability

- **Responsive Design**: Works on desktop (primary), tablet, mobile
- **Keyboard Navigation**: Full keyboard support for forms and dialogs
- **Screen Reader Support**: ARIA labels for all interactive elements
- **Loading States**: Show spinners during API calls
- **Success/Error Feedback**: Toast notifications for create/update/delete operations
- **Search**: Real-time search with debouncing (300ms)
- **Accessibility**: WCAG 2.1 AA compliance

### UI/UX Standards

- **Component Library**: Use AegisX UI components as primary, Angular Material as secondary
- **Styling**: TailwindCSS utility classes for layout and spacing
- **Design Consistency**: Follow existing admin panel patterns
- **Form Validation**: Real-time validation with error messages
- **Modal Dialogs**: Use ax-dialog or mat-dialog for create/edit forms
- **Data Tables**: Use ax-table or mat-table with sorting, filtering, pagination
- **Icons**: Use Material Icons for actions (edit, delete, expand, collapse)

## API Integration

### Existing Backend APIs (All Ready)

1. **GET /v1/platform/departments** - List departments with pagination
2. **GET /v1/platform/departments/dropdown** - Dropdown options
3. **GET /v1/platform/departments/hierarchy** - Hierarchical tree
4. **GET /v1/platform/departments/:id** - Get single department
5. **POST /v1/platform/departments** - Create department
6. **PUT /v1/platform/departments/:id** - Update department
7. **DELETE /v1/platform/departments/:id** - Delete department

### Frontend Service

- Reuse existing `DepartmentService` from `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`
- Extend with hierarchy and dropdown methods if missing

## Out of Scope

- Department-specific permissions (use existing RBAC for departments resource)
- Department budgets or financial management
- Department-specific workflows or approval chains
- Multi-tenancy or hospital-specific departments (use existing hospital_id field)
- Import/export departments from CSV/Excel
- Department analytics or reporting
- Email notifications for department changes

## Success Metrics

- Admins can create, edit, delete departments in <3 clicks
- User assignment to department adds <5 seconds to user creation time
- Profile page loads department info without noticeable delay (<500ms)
- 100% of department operations respect RBAC permissions
- Zero circular references in department hierarchy
- 95% user satisfaction rating for department management interface
