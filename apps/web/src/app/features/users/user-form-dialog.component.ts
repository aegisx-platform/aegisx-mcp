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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
} from './user.service';

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
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Create New User' : 'Edit User' }}
    </h2>

    <mat-dialog-content class="mat-dialog-content">
      <form [formGroup]="userForm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- First Name -->
          <mat-form-field appearance="outline" class="w-full">
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
          <mat-form-field appearance="outline" class="w-full">
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
          <mat-form-field appearance="outline" class="w-full">
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
          <mat-form-field appearance="outline" class="w-full">
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
            <mat-form-field appearance="outline" class="w-full md:col-span-2">
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

          <!-- Role -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Role</mat-label>
            <mat-select formControlName="roleId">
              @for (role of roles(); track role.id) {
                <mat-option [value]="role.id">{{ role.name }}</mat-option>
              }
            </mat-select>
            <mat-error *ngIf="userForm.get('roleId')?.hasError('required')">
              Role is required
            </mat-error>
          </mat-form-field>

          <!-- Status -->
          <div class="flex items-center h-14">
            <mat-slide-toggle formControlName="isActive" color="primary">
              Active Account
            </mat-slide-toggle>
          </div>
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
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="userForm.invalid || isSubmitting()"
      >
        @if (isSubmitting()) {
          <mat-spinner diameter="20" class="inline mr-2"></mat-spinner>
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
        padding: 24px;
        min-width: 500px;
      }

      @media (max-width: 768px) {
        .mat-dialog-content {
          min-width: auto;
        }
      }

      mat-form-field {
        margin-bottom: 8px;
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
    roleId: ['', Validators.required],
    isActive: [true],
  });

  ngOnInit() {
    // Load roles
    this.loadRoles();

    if (this.data.mode === 'edit' && this.data.user) {
      this.userForm.patchValue({
        firstName: this.data.user.firstName,
        lastName: this.data.user.lastName,
        email: this.data.user.email,
        username: this.data.user.username,
        roleId: this.data.user.roleId,
        isActive: this.data.user.isActive,
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
      !this.userForm.value.roleId &&
      roles.length > 0
    ) {
      const userRole = roles.find((r) => r.name === 'user');
      if (userRole) {
        this.userForm.patchValue({ roleId: userRole.id });
      }
    }
  }

  async onSubmit() {
    if (this.userForm.invalid) return;

    this.isSubmitting.set(true);

    try {
      const formValue = this.userForm.getRawValue();

      if (this.data.mode === 'create') {
        const createData: CreateUserRequest = {
          email: formValue.email!,
          username: formValue.username!,
          firstName: formValue.firstName!,
          lastName: formValue.lastName!,
          password: formValue.password!,
          roleId: formValue.roleId!,
          isActive: formValue.isActive!,
        };

        await this.userService.createUser(createData);
        this.snackBar.open('User created successfully', 'Close', {
          duration: 3000,
        });
      } else {
        const updateData: UpdateUserRequest = {
          firstName: formValue.firstName!,
          lastName: formValue.lastName!,
          roleId: formValue.roleId!,
          isActive: formValue.isActive!,
        };

        await this.userService.updateUser(this.data.user!.id, updateData);
        this.snackBar.open('User updated successfully', 'Close', {
          duration: 3000,
        });
      }

      this.dialogRef.close(true);
    } catch (error) {
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
