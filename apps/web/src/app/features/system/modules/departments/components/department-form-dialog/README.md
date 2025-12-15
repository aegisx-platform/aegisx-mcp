# Department Form Dialog Component

## Overview

A comprehensive form dialog component for creating and editing departments with advanced validation and circular reference prevention.

## Features

- ✅ Create/Edit mode support (REQ-1 AC 3-7)
- ✅ Reactive form with comprehensive validation
- ✅ Parent department selection with hierarchy display (REQ-4 AC 1-4)
- ✅ Circular reference prevention (REQ-4 AC 3-4)
- ✅ Active/Inactive toggle (REQ-1 AC 11)
- ✅ Duplicate dept_code error handling (409 Conflict)
- ✅ Real-time validation feedback
- ✅ Responsive design

## Usage

### Import the Component

```typescript
import { DepartmentFormDialogComponent } from './components/department-form-dialog/department-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
```

### Open Create Dialog

```typescript
// In your component
private dialog = inject(MatDialog);

openCreateDialog(): void {
  const dialogRef = this.dialog.open(DepartmentFormDialogComponent, {
    width: '600px',
    data: {
      mode: 'create'
    }
  });

  dialogRef.afterClosed().subscribe((result: Department | undefined) => {
    if (result) {
      console.log('Department created:', result);
      // Refresh your department list
      this.loadDepartments();
    }
  });
}
```

### Open Edit Dialog

```typescript
openEditDialog(department: Department): void {
  const dialogRef = this.dialog.open(DepartmentFormDialogComponent, {
    width: '600px',
    data: {
      mode: 'edit',
      department: department
    }
  });

  dialogRef.afterClosed().subscribe((result: Department | undefined) => {
    if (result) {
      console.log('Department updated:', result);
      // Refresh your department list
      this.loadDepartments();
    }
  });
}
```

## Form Fields

### 1. Department Code (`dept_code`)

- **Type**: Text input
- **Required**: Yes
- **Validation**:
  - Required
  - Length: 2-20 characters
  - Pattern: `^[A-Z0-9_-]+$` (uppercase alphanumeric with underscores and hyphens)
- **Edit Mode**: Read-only (cannot change dept_code)
- **Error Messages**:
  - "Department code is required"
  - "Department code must be at least 2 characters"
  - "Department code cannot exceed 20 characters"
  - "Department code must contain only uppercase letters, numbers, underscores, and hyphens"
  - "Department code already exists" (409 Conflict)

### 2. Department Name (`dept_name`)

- **Type**: Text input
- **Required**: Yes
- **Validation**:
  - Required
  - Length: 2-200 characters
- **Error Messages**:
  - "Department name is required"
  - "Department name must be at least 2 characters"
  - "Department name cannot exceed 200 characters"

### 3. Parent Department (`parent_id`)

- **Type**: Select dropdown
- **Required**: No
- **Options**:
  - "No Parent (Root Department)" (value: null)
  - List of all active departments with hierarchy indentation
- **Hierarchy Display**:
  - Root departments: "Information Technology"
  - Level 1: "-- Backend Team"
  - Level 2: "---- API Development"
- **Edit Mode Restrictions**:
  - Current department is disabled (cannot select self)
  - All descendants are disabled (prevents circular references)
- **Circular Reference Prevention**:
  - Cannot set department as its own parent
  - Cannot set any descendant as parent

### 4. Active Status (`is_active`)

- **Type**: Slide toggle
- **Default**: true (Active)
- **Options**:
  - Active: Department is visible in the system
  - Inactive: Department is hidden from most views

## Validation

### Client-Side Validation

1. **Required Fields**: dept_code, dept_name
2. **Pattern Validation**: dept_code must match `^[A-Z0-9_-]+$`
3. **Length Validation**: 2-20 chars for dept_code, 2-200 chars for dept_name
4. **Circular Reference**: Custom validator prevents setting self or descendants as parent

### Server-Side Validation

1. **409 Conflict**: Duplicate dept_code
   - Displayed as inline error on dept_code field
   - SnackBar notification: "Department code already exists. Please use a different code."

2. **422 Unprocessable Entity**: Other validation errors
   - Server errors mapped to form controls
   - SnackBar notification: "Please fix validation errors"

## Error Handling

### Error Display Locations

1. **Inline Field Errors**: Below each form field with mat-error
2. **SnackBar Notifications**: For general success/error messages
3. **Loading States**: Spinner overlay during save operation

### Error Types

- **Validation Errors**: Inline below fields
- **Duplicate Code (409)**: Inline + SnackBar
- **Server Validation (422)**: Inline + SnackBar
- **Network Errors**: SnackBar only
- **Generic Errors**: SnackBar with default message

## Success Flow

1. User fills form with valid data
2. Clicks "Create" or "Update" button
3. Loading spinner appears
4. API call succeeds
5. Success SnackBar notification
6. Dialog closes with result
7. Parent component receives result and refreshes list

## API Integration

### Create Department

```typescript
POST /v1/platform/departments
Body: {
  dept_code: string,
  dept_name: string,
  parent_id: number | null,
  is_active: boolean
}
Response: {
  success: true,
  data: Department
}
```

### Update Department

```typescript
PUT /v1/platform/departments/:id
Body: {
  dept_code?: string,
  dept_name?: string,
  parent_id?: number | null,
  is_active?: boolean
}
Response: {
  success: true,
  data: Department
}
```

### Load Parent Departments

```typescript
GET /v1/platform/departments?is_active=true&limit=1000
Response: {
  success: true,
  data: Department[],
  pagination: {...}
}
```

## Circular Reference Prevention Algorithm

### Step 1: Collect Excluded IDs
In edit mode, build a set of department IDs to exclude:
1. Current department ID
2. All descendant IDs (recursive)

### Step 2: Build Hierarchy Options
Recursively build dropdown options:
1. Start from root departments (parent_id = null)
2. Add indentation based on level (-- for each level)
3. Mark excluded departments as disabled
4. Recursively add children

### Step 3: Validate Selection
Custom validator checks:
1. Selected parent !== current department
2. Selected parent not in descendants set

### Example Hierarchy

```
IT Department (id: 1)
-- Backend Team (id: 2)
---- API Development (id: 3)
-- Frontend Team (id: 4)
HR Department (id: 5)
```

When editing "Backend Team" (id: 2):
- Disabled: Backend Team, API Development
- Available: IT Department, Frontend Team, HR Department

## Accessibility

- Proper ARIA labels on all form fields
- Keyboard navigation support
- Screen reader compatible
- Focus management
- Error announcements

## Responsive Design

- Desktop: 600px wide dialog
- Tablet: Adapts to screen width
- Mobile: Full-width dialog with adjusted padding

## Dependencies

- `@angular/forms`: Reactive forms
- `@angular/material/dialog`: Dialog component
- `@angular/material/form-field`: Form fields
- `@angular/material/input`: Text inputs
- `@angular/material/select`: Dropdown
- `@angular/material/slide-toggle`: Toggle switch
- `@angular/material/snack-bar`: Notifications
- `DepartmentService`: API communication
- `DepartmentFormDialogData`: Type definitions

## Testing Checklist

- [ ] Open create dialog
- [ ] Fill valid data and create
- [ ] Try to create with duplicate dept_code (should show 409 error)
- [ ] Try to submit with invalid data (validation errors)
- [ ] Open edit dialog with existing department
- [ ] Verify form pre-fills correctly
- [ ] Verify dept_code is read-only in edit mode
- [ ] Verify parent dropdown excludes current dept and descendants
- [ ] Update department successfully
- [ ] Toggle active/inactive status
- [ ] Cancel dialog (no changes saved)
- [ ] Verify success/error notifications
- [ ] Test responsive design on mobile
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

## Related Files

- **Component**: `department-form-dialog.component.ts`
- **Template**: `department-form-dialog.component.html`
- **Styles**: `department-form-dialog.component.scss`
- **Service**: `../../services/departments.service.ts`
- **Types**: `../../types/departments-ui.types.ts`
