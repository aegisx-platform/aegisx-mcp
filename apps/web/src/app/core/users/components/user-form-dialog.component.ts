import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  UserService,
  User,
  Role,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
  AssignRolesToUserRequest,
  RemoveRoleFromUserRequest,
} from '../services/user.service';
import { DepartmentSelectorComponent } from '../../../features/system/modules/departments/components/department-selector/department-selector.component';

interface DialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'ax-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DepartmentSelectorComponent,
  ],
  template: `
    <h2 mat-dialog-title class="ax-header ax-header-info">
      <div class="ax-icon-info">
        <mat-icon>{{
          data.mode === 'create' ? 'person_add' : 'edit'
        }}</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">
          {{ data.mode === 'create' ? 'Create New User' : 'Edit User' }}
        </div>
        <div class="ax-subtitle">
          {{
            data.mode === 'create'
              ? 'Add a new user to the system'
              : 'Update user information'
          }}
        </div>
      </div>
      <button
        type="button"
        mat-icon-button
        [mat-dialog-close]="false"
        [disabled]="isSubmitting()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </h2>

    <mat-dialog-content class="mat-dialog-content">
      <form [formGroup]="userForm">
        <div class="form-grid">
          <!-- First Name -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>First Name</mat-label>
            <input
              matInput
              formControlName="firstName"
              placeholder="Enter first name"
            />
            <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
              First name is required
            </mat-error>
          </mat-form-field>

          <!-- Last Name -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Last Name</mat-label>
            <input
              matInput
              formControlName="lastName"
              placeholder="Enter last name"
            />
            <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
              Last name is required
            </mat-error>
          </mat-form-field>

          <!-- Email -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Email</mat-label>
            <input
              matInput
              formControlName="email"
              type="email"
              placeholder="user@example.com"
            />
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>

          <!-- Username -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Username</mat-label>
            <input
              matInput
              formControlName="username"
              placeholder="Enter username"
            />
            <mat-error *ngIf="userForm.get('username')?.hasError('required')">
              Username is required
            </mat-error>
            <mat-error *ngIf="userForm.get('username')?.hasError('minlength')">
              Username must be at least 3 characters
            </mat-error>
          </mat-form-field>

          <!-- Password (only for create mode) -->
          @if (data.mode === 'create') {
            <mat-form-field appearance="outline" class="form-field full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                placeholder="Enter password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="showPassword.set(!showPassword())"
              >
                <mat-icon>{{
                  showPassword() ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error
                *ngIf="userForm.get('password')?.hasError('minlength')"
              >
                Password must be at least 8 characters
              </mat-error>
              <mat-hint>Minimum 8 characters</mat-hint>
            </mat-form-field>
          }

          <!-- Status -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
              <mat-option value="pending">Pending</mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('status')?.hasError('required')">
              Status is required
            </mat-error>
          </mat-form-field>

          <!-- Department (Optional) -->
          <app-department-selector
            formControlName="department_id"
            label="Department (Optional)"
            [required]="false"
          />

          <!-- Roles (Multi-select) -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Roles</mat-label>
            <mat-select formControlName="roleIds" multiple>
              @for (role of roles(); track role.id) {
                <mat-option [value]="role.id">{{ role.name }}</mat-option>
              }
            </mat-select>
            <mat-error *ngIf="userForm.get('roleIds')?.hasError('required')">
              At least one role is required
            </mat-error>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button
        mat-button
        type="button"
        (click)="onCancel()"
        [disabled]="isSubmitting()"
      >
        Cancel
      </button>
      <button
        mat-flat-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="userForm.invalid || isSubmitting()"
      >
        @if (isSubmitting()) {
          <mat-spinner diameter="20" class="spinner-inline"></mat-spinner>
        }
        {{ data.mode === 'create' ? 'Create User' : 'Update User' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .mat-dialog-content {
        max-height: 80vh;
        overflow-y: auto;
        padding: var(--ax-spacing-xl);
        min-width: 500px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--ax-spacing-md);
      }

      @media (min-width: 768px) {
        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .form-field {
        width: 100%;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      .spinner-inline {
        display: inline-block;
        margin-right: var(--ax-spacing-sm);
      }

      @media (max-width: 768px) {
        .mat-dialog-content {
          min-width: auto;
        }
      }
    `,
  ],
})
export class UserFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  data = inject<DialogData>(MAT_DIALOG_DATA);

  isSubmitting = signal(false);
  showPassword = signal(false);
  roles = signal<Role[]>([]);
  userRoles = signal<UserRole[]>([]);

  userForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: [
      '',
      this.data.mode === 'create'
        ? [Validators.required, Validators.minLength(8)]
        : [],
    ],
    department_id: [null as number | null, []],
    roleIds: [{ value: [] as string[], disabled: false }, Validators.required],
    status: ['active', Validators.required],
  });

  async ngOnInit() {
    // Load roles
    await this.loadRoles();

    if (this.data.mode === 'edit' && this.data.user) {
      // Load user roles first before patching form
      await this.loadUserRoles();

      this.userForm.patchValue({
        firstName: this.data.user.firstName,
        lastName: this.data.user.lastName,
        email: this.data.user.email,
        username: this.data.user.username,
        status: this.data.user.status,
        department_id: this.data.user.department_id || null,
      });

      // Disable fields that shouldn't be edited
      this.userForm.get('email')?.disable();
      this.userForm.get('username')?.disable();
    }
  }

  async loadRoles() {
    const roles = await this.userService.getRoles();
    this.roles.set(roles);

    // Set default role for new user if roles are loaded and no role selected
    if (
      this.data.mode === 'create' &&
      (!this.userForm.value.roleIds ||
        this.userForm.value.roleIds.length === 0) &&
      roles.length > 0
    ) {
      const userRole = roles.find((r) => r.name === 'user');
      if (userRole) {
        this.userForm.patchValue({ roleIds: [userRole.id] });
      }
    }
  }

  async loadUserRoles() {
    try {
      if (this.data.mode === 'edit' && this.data.user) {
        const userRoles = await this.userService.getUserRoles(
          this.data.user.id,
        );
        this.userRoles.set(userRoles);

        // Extract role IDs from user roles
        const roleIds = userRoles.map((role) => role.roleId);

        console.log('📊 User Roles from API:', userRoles);
        console.log('🎯 Extracted Role IDs:', roleIds);

        // Defer form patching to next event loop to ensure mat-select is fully initialized
        setTimeout(() => {
          this.userForm.patchValue({ roleIds });
          console.log('✅ Form Value After Patch:', this.userForm.value);
        }, 0);
      }
    } catch (error) {
      console.error('Failed to load user roles:', error);
      // Fall back to primary role if available
      if (this.data.user?.roleId) {
        setTimeout(() => {
          this.userForm.patchValue({ roleIds: [this.data.user!.roleId] });
        }, 0);
      }
    }
  }

  async onSubmit() {
    if (this.userForm.invalid) return;

    this.isSubmitting.set(true);

    try {
      const formValue = this.userForm.getRawValue();
      const roleIds = formValue.roleIds || [];

      console.log('🔍 DEBUG: Form Value:', formValue);
      console.log('🔍 DEBUG: Extracted roleIds:', roleIds);
      console.log('🔍 DEBUG: roleIds type:', typeof roleIds);
      console.log('🔍 DEBUG: roleIds is array:', Array.isArray(roleIds));
      console.log('🔍 DEBUG: roleIds length:', roleIds?.length);

      // Ensure roleIds is an array
      const normalizedRoleIds = Array.isArray(roleIds)
        ? roleIds
        : roleIds
          ? [roleIds]
          : [];
      console.log('🔍 DEBUG: Normalized roleIds:', normalizedRoleIds);

      if (this.data.mode === 'create') {
        // For create mode, use the first role as primary and assign all selected roles
        const createData: CreateUserRequest = {
          email: formValue.email!,
          username: formValue.username!,
          firstName: formValue.firstName!,
          lastName: formValue.lastName!,
          password: formValue.password!,
          roleId: normalizedRoleIds[0]!, // First role as primary
          status: formValue.status! as any,
          department_id: formValue.department_id || null,
        };

        const newUser = await this.userService.createUser(createData);

        // If multiple roles selected, assign additional roles
        if (newUser && normalizedRoleIds.length > 1) {
          const additionalRoleIds = normalizedRoleIds.slice(1);
          console.log(
            '📝 CREATE: Assigning additional roles:',
            additionalRoleIds,
          );
          await this.userService.assignRolesToUser(newUser.id, {
            roleIds: additionalRoleIds,
          });
        }

        this.snackBar.open('User created successfully', 'Close', {
          duration: 3000,
        });
      } else {
        // For edit mode, first update basic user info
        const updateData: UpdateUserRequest = {
          firstName: formValue.firstName!,
          lastName: formValue.lastName!,
          roleId: normalizedRoleIds[0]!, // First role as primary
          status: formValue.status! as any,
          department_id: formValue.department_id || null,
        };

        await this.userService.updateUser(this.data.user!.id, updateData);

        // Then sync all roles
        const currentRoleIds = this.userRoles().map((r) => r.roleId);

        console.log('📝 EDIT: Current roles from user:', currentRoleIds);
        console.log('📝 EDIT: Selected roles:', normalizedRoleIds);

        // Remove roles that are no longer selected
        const rolesToRemove = currentRoleIds.filter(
          (id) => !normalizedRoleIds.includes(id),
        );

        console.log('📝 EDIT: Roles to remove:', rolesToRemove);
        console.log('📝 EDIT: Total roles to remove:', rolesToRemove.length);

        // Remove all deselected roles
        for (let i = 0; i < rolesToRemove.length; i++) {
          const roleId = rolesToRemove[i];
          console.log(
            `📝 EDIT: Removing role ${i + 1}/${rolesToRemove.length}: ${roleId}`,
          );
          await this.userService.removeRoleFromUser(this.data.user!.id, {
            roleId,
          });
          console.log(`📝 EDIT: Successfully removed role: ${roleId}`);
        }

        console.log('📝 EDIT: All role removals completed');

        // Assign ALL selected roles - backend deduplication will handle existing roles
        console.log(
          '📝 EDIT: Calling assignRolesToUser with ALL selected roles:',
          {
            userId: this.data.user!.id,
            roleIds: normalizedRoleIds,
          },
        );

        await this.userService.assignRolesToUser(this.data.user!.id, {
          roleIds: normalizedRoleIds,
        });

        this.snackBar.open('User updated successfully', 'Close', {
          duration: 3000,
        });
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error during user operation:', error);
      this.snackBar.open(
        this.data.mode === 'create'
          ? 'Failed to create user'
          : 'Failed to update user',
        'Close',
        { duration: 3000, panelClass: ['error-snackbar'] },
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
