# Department Selector Component

A reusable Angular component implementing `ControlValueAccessor` for selecting departments with hierarchical display.

## Features

- **ControlValueAccessor Integration**: Works seamlessly with Angular reactive forms
- **Hierarchical Display**: Shows parent-child relationships with visual indentation
- **Nullable Selection**: Supports empty/null values (optional field)
- **Signal-based State**: Modern Angular signals for reactive state management
- **Loading States**: Built-in loading spinner during data fetch
- **Active/Inactive Filtering**: Option to show only active departments
- **Full Department Object Emission**: Emits complete department data on selection

## Requirements Mapping

- **REQ-2 AC 1**: Department dropdown selector
- **REQ-2 AC 2**: Hierarchical display with indentation
- **REQ-2 AC 3**: Populates user.department_id
- **REQ-2 AC 4**: Shows child departments under parents
- **REQ-2 AC 5**: Allows empty selection (nullable)

## Usage Examples

### Basic Usage

```html
<app-department-selector
  formControlName="department_id"
/>
```

### With Custom Label and Placeholder

```html
<app-department-selector
  formControlName="department_id"
  label="Assigned Department"
  placeholder="Choose a department"
/>
```

### Required Field

```html
<app-department-selector
  formControlName="department_id"
  label="Department"
  [required]="true"
/>
```

### Include Inactive Departments

```html
<app-department-selector
  formControlName="department_id"
  [showInactive]="true"
/>
```

### Custom Appearance

```html
<app-department-selector
  formControlName="department_id"
  appearance="fill"
/>
```

### Listen to Selection Events

```html
<app-department-selector
  formControlName="department_id"
  (departmentSelected)="onDepartmentSelected($event)"
/>
```

```typescript
onDepartmentSelected(dept: Department | null): void {
  if (dept) {
    console.log('Selected department:', dept.dept_name);
    console.log('Department code:', dept.dept_code);
    console.log('Parent ID:', dept.parent_id);
  } else {
    console.log('Department cleared');
  }
}
```

## Complete Form Example

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DepartmentSelectorComponent } from '../departments/components/department-selector/department-selector.component';
import type { Department } from '../departments/types/departments-ui.types';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DepartmentSelectorComponent,
  ],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <div class="space-y-4">
        <!-- Name field -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <!-- Email field -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>

        <!-- Department selector (nullable) -->
        <app-department-selector
          formControlName="department_id"
          label="Department"
          placeholder="Select department (optional)"
          [required]="false"
          (departmentSelected)="onDepartmentSelected($event)"
        />

        <!-- Submit button -->
        <button
          type="submit"
          mat-raised-button
          color="primary"
          [disabled]="userForm.invalid">
          Save User
        </button>
      </div>
    </form>
  `,
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  userForm!: FormGroup;
  selectedDepartment: Department | null = null;

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department_id: [null], // Nullable - no department required
    });
  }

  onDepartmentSelected(dept: Department | null): void {
    this.selectedDepartment = dept;
    console.log('Department selected:', dept?.dept_name || 'None');
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      console.log('Form submitted:', formValue);
      console.log('Department ID:', formValue.department_id); // null or number
      console.log('Full department object:', this.selectedDepartment);
    }
  }
}
```

## Component API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | `'Department'` | Form field label |
| `placeholder` | `string` | `'Select department'` | Placeholder text |
| `required` | `boolean` | `false` | Whether field is required |
| `showInactive` | `boolean` | `false` | Include inactive departments |
| `appearance` | `MatFormFieldAppearance` | `'outline'` | Material form field appearance |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `departmentSelected` | `EventEmitter<Department \| null>` | Emits full department object when selection changes |

### ControlValueAccessor Methods

The component implements the following standard methods:

- `writeValue(value: number | null)`: Sets the selected department ID
- `registerOnChange(fn)`: Registers callback for value changes
- `registerOnTouched(fn)`: Registers callback for touched state
- `setDisabledState(isDisabled: boolean)`: Handles disabled state

## Hierarchical Display Example

When departments are loaded, they display with visual hierarchy:

```
HR Department
-- Recruitment
-- Training
-- -- Onboarding
-- -- Professional Development
Engineering
-- Backend Team
-- Frontend Team
-- -- UI/UX
Operations
```

This helps users understand the organizational structure at a glance.

## Validation

The component integrates seamlessly with Angular's reactive forms validation:

```typescript
// Required validation
this.form = this.fb.group({
  department_id: [null, Validators.required],
});

// Custom validation
this.form = this.fb.group({
  department_id: [null, this.departmentValidator],
});

departmentValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && value < 1) {
    return { invalidDepartment: true };
  }
  return null;
}
```

## Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DepartmentSelectorComponent } from './department-selector.component';
import { DepartmentService } from '../../services/departments.service';
import { of } from 'rxjs';

describe('DepartmentSelectorComponent', () => {
  let component: DepartmentSelectorComponent;
  let fixture: ComponentFixture<DepartmentSelectorComponent>;
  let mockDepartmentService: jasmine.SpyObj<DepartmentService>;

  beforeEach(async () => {
    mockDepartmentService = jasmine.createSpyObj('DepartmentService', ['loadDepartmentList']);

    await TestBed.configureTestingModule({
      imports: [DepartmentSelectorComponent, ReactiveFormsModule],
      providers: [
        { provide: DepartmentService, useValue: mockDepartmentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load departments on init', async () => {
    const mockDepartments = [
      { id: 1, dept_code: 'HR', dept_name: 'HR Department', parent_id: null, is_active: true },
      { id: 2, dept_code: 'IT', dept_name: 'IT Department', parent_id: null, is_active: true },
    ];

    mockDepartmentService.loadDepartmentList.and.returnValue(
      Promise.resolve({
        success: true,
        data: mockDepartments,
        pagination: { page: 1, limit: 1000, total: 2, totalPages: 1 },
      })
    );

    component.ngOnInit();
    await fixture.whenStable();

    expect(component.departments().length).toBe(2);
  });

  it('should propagate value changes to parent form', () => {
    const formControl = new FormControl(null);
    component.registerOnChange((value) => formControl.setValue(value));

    component.selectControl.setValue(5);

    expect(formControl.value).toBe(5);
  });
});
```

## Styling

The component uses Material Design with TailwindCSS utility classes. You can customize appearance through:

1. **Mat-form-field appearance**: `outline`, `fill`, `standard`
2. **Custom CSS**: Override component styles in your global styles
3. **TailwindCSS**: Uses `w-full` for full-width display

## Dependencies

- `@angular/core`
- `@angular/common`
- `@angular/forms`
- `@angular/material/form-field`
- `@angular/material/select`
- `@angular/material/progress-spinner`
- `@angular/material/snack-bar`
- `rxjs`

## Notes

- The component automatically loads departments on initialization
- Only active departments are loaded by default (use `showInactive` to change)
- The component handles null values correctly for optional fields
- Loading state is shown with a spinner in the mat-form-field suffix
- Errors during department loading are shown via MatSnackBar
- The component properly cleans up subscriptions on destroy
