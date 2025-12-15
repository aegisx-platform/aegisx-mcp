# Department Selector Integration Guide

This guide shows how to integrate the `DepartmentSelectorComponent` into user forms and other components.

## Quick Start

### 1. Import the Component

```typescript
import { DepartmentSelectorComponent } from '@app/pages/platform/departments/components';
// Or direct import:
// import { DepartmentSelectorComponent } from '@app/pages/platform/departments/components/department-selector/department-selector.component';
```

### 2. Add to Component Imports

```typescript
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DepartmentSelectorComponent, // Add here
    // ... other imports
  ],
  // ...
})
export class UserFormComponent {
  // ...
}
```

### 3. Use in Template

```html
<app-department-selector
  formControlName="department_id"
  label="Department"
  [required]="false"
  (departmentSelected)="onDepartmentSelected($event)"
/>
```

## Real-World Example: User Form Integration

### User Form Component (TypeScript)

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DepartmentSelectorComponent } from '@app/pages/platform/departments/components';
import type { Department } from '@app/pages/platform/departments/types/departments-ui.types';

interface UserFormData {
  name: string;
  email: string;
  department_id: number | null;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    DepartmentSelectorComponent, // Import the selector
  ],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Form state
  userForm!: FormGroup;
  isSubmitting = signal(false);

  // Store full department object for reference
  selectedDepartment = signal<Department | null>(null);

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      department_id: [null], // Nullable - department is optional
    });
  }

  /**
   * Called when user selects a department
   * Receives full Department object, not just ID
   */
  onDepartmentSelected(dept: Department | null): void {
    this.selectedDepartment.set(dept);

    if (dept) {
      console.log('Selected:', dept.dept_name);
      console.log('Code:', dept.dept_code);
      console.log('Parent ID:', dept.parent_id);
    } else {
      console.log('Department cleared');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    try {
      this.isSubmitting.set(true);

      const formValue: UserFormData = this.userForm.value;

      console.log('Submitting user:', {
        ...formValue,
        departmentName: this.selectedDepartment()?.dept_name || 'None',
      });

      // TODO: Call your API service here
      // await this.userService.createUser(formValue);

      this.snackBar.open('User created successfully', 'Close', {
        duration: 3000,
      });

      this.userForm.reset();
      this.selectedDepartment.set(null);
    } catch (error) {
      console.error('Failed to create user:', error);
      this.snackBar.open('Failed to create user', 'Close', {
        duration: 3000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

### User Form Template (HTML)

```html
<div class="user-form-container p-6 max-w-2xl mx-auto">
  <h2 class="text-2xl font-bold mb-6">Create User</h2>

  <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-4">
    <!-- Name Field -->
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Full Name</mat-label>
      <input matInput formControlName="name" placeholder="John Doe" />
      <mat-error *ngIf="userForm.get('name')?.hasError('required')">
        Name is required
      </mat-error>
      <mat-error *ngIf="userForm.get('name')?.hasError('minlength')">
        Name must be at least 2 characters
      </mat-error>
    </mat-form-field>

    <!-- Email Field -->
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Email</mat-label>
      <input
        matInput
        type="email"
        formControlName="email"
        placeholder="john.doe@example.com"
      />
      <mat-error *ngIf="userForm.get('email')?.hasError('required')">
        Email is required
      </mat-error>
      <mat-error *ngIf="userForm.get('email')?.hasError('email')">
        Invalid email format
      </mat-error>
    </mat-form-field>

    <!-- Department Selector -->
    <app-department-selector
      formControlName="department_id"
      label="Department"
      placeholder="Select department (optional)"
      [required]="false"
      (departmentSelected)="onDepartmentSelected($event)"
    />

    <!-- Display Selected Department Info -->
    <div *ngIf="selectedDepartment()" class="bg-blue-50 p-3 rounded border border-blue-200">
      <p class="text-sm text-gray-700">
        <strong>Selected Department:</strong> {{ selectedDepartment()?.dept_name }}
      </p>
      <p class="text-sm text-gray-600">
        Code: {{ selectedDepartment()?.dept_code }}
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 pt-4">
      <button
        type="submit"
        mat-raised-button
        color="primary"
        [disabled]="userForm.invalid || isSubmitting()"
      >
        {{ isSubmitting() ? 'Creating...' : 'Create User' }}
      </button>

      <button
        type="button"
        mat-stroked-button
        (click)="userForm.reset()"
        [disabled]="isSubmitting()"
      >
        Reset
      </button>
    </div>
  </form>
</div>
```

## Edit Mode Example

For editing existing users with pre-populated department:

```typescript
export class UserEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  userForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.loadUser();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department_id: [null],
    });
  }

  private async loadUser(): Promise<void> {
    const userId = this.route.snapshot.params['id'];

    // Load user from API
    const user = await this.userService.getUserById(userId);

    // Populate form with existing data
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      department_id: user.department_id, // DepartmentSelector will load this
    });
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid) return;

    const userId = this.route.snapshot.params['id'];
    await this.userService.updateUser(userId, this.userForm.value);
  }
}
```

## Required Department Example

If department is mandatory:

```typescript
this.userForm = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  department_id: [null, Validators.required], // Required!
});
```

```html
<app-department-selector
  formControlName="department_id"
  label="Department"
  placeholder="Select department"
  [required]="true"
/>
```

## Advanced: Conditional Logic Based on Department

```typescript
onDepartmentSelected(dept: Department | null): void {
  this.selectedDepartment.set(dept);

  // Apply conditional logic based on department
  if (dept?.dept_code === 'IT') {
    // Add IT-specific fields
    this.userForm.addControl('technical_role', this.fb.control(''));
  } else {
    // Remove IT-specific fields
    this.userForm.removeControl('technical_role');
  }

  // Or enable/disable fields
  const accessLevelControl = this.userForm.get('access_level');
  if (dept?.dept_code === 'ADMIN') {
    accessLevelControl?.enable();
  } else {
    accessLevelControl?.disable();
  }
}
```

## Include Inactive Departments

For administrative views where you need to see all departments:

```html
<app-department-selector
  formControlName="department_id"
  label="Department (including inactive)"
  [showInactive]="true"
/>
```

## Custom Styling

Override default styles in your component's SCSS:

```scss
app-department-selector {
  ::ng-deep mat-form-field {
    width: 100%;

    .mat-form-field-wrapper {
      padding-bottom: 0;
    }
  }
}
```

## Testing

Test your form with the department selector:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { UserFormComponent } from './user-form.component';
import { DepartmentSelectorComponent } from '@app/pages/platform/departments/components';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserFormComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with department_id control', () => {
    expect(component.userForm.get('department_id')).toBeTruthy();
  });

  it('should update selectedDepartment when department selected', () => {
    const mockDept: Department = {
      id: 1,
      dept_code: 'IT',
      dept_name: 'IT Department',
      parent_id: null,
      is_active: true,
    };

    component.onDepartmentSelected(mockDept);

    expect(component.selectedDepartment()).toEqual(mockDept);
  });

  it('should clear selectedDepartment when null selected', () => {
    component.onDepartmentSelected(null);

    expect(component.selectedDepartment()).toBeNull();
  });
});
```

## Common Issues & Solutions

### Issue: Component not found

**Solution**: Ensure you've imported from the correct path:

```typescript
// Correct - using barrel export
import { DepartmentSelectorComponent } from '@app/pages/platform/departments/components';

// Also correct - direct import
import { DepartmentSelectorComponent } from '@app/pages/platform/departments/components/department-selector/department-selector.component';
```

### Issue: Departments not loading

**Solution**: Check that:
1. DepartmentService is provided (it's providedIn: 'root')
2. API endpoint is accessible
3. Network tab shows successful API call

### Issue: Form value is undefined

**Solution**: The component stores the department ID (number), not the object. Use:

```typescript
const departmentId = this.userForm.value.department_id; // number | null
const departmentObject = this.selectedDepartment(); // Department | null
```

## Summary

The `DepartmentSelectorComponent` provides:

- Seamless reactive forms integration via ControlValueAccessor
- Hierarchical department display with visual indentation
- Nullable/optional field support
- Active/inactive filtering
- Full department object emission
- Loading states and error handling
- TypeScript type safety

This makes it perfect for user forms, filter panels, search forms, and any other UI requiring department selection.
