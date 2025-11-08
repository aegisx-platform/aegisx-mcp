import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService, Role } from '../services/user.service';

interface BulkRoleChangeDialogData {
  selectedUserCount: number;
}

@Component({
  selector: 'ax-bulk-role-change-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Change User Roles</h2>

    <mat-dialog-content class="mat-dialog-content">
      <p class="mb-4">
        You are about to change the roles of
        <strong>{{ data.selectedUserCount }} user(s)</strong>.
      </p>

      <form [formGroup]="roleForm">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Select Role</mat-label>
          <mat-select formControlName="roleId">
            <mat-option value="">-- Select a role --</mat-option>
            @for (role of roles; track role.id) {
              <mat-option [value]="role.id">
                {{ role.name }}
              </mat-option>
            }
          </mat-select>
          <mat-error *ngIf="roleForm.get('roleId')?.hasError('required')">
            Role is required
          </mat-error>
        </mat-form-field>
      </form>

      <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
        <mat-icon class="text-amber-600 align-top">info</mat-icon>
        <span class="ml-2"
          >Please note: Changing roles may require users to re-authenticate to
          apply new permissions.</span
        >
      </div>
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
        [disabled]="roleForm.invalid || isSubmitting()"
      >
        @if (isSubmitting()) {
          <mat-spinner diameter="20" class="inline mr-2"></mat-spinner>
        }
        Change Role
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .mat-dialog-content {
        max-height: 80vh;
        overflow-y: auto;
        padding: 24px;
        min-width: 400px;
      }

      @media (max-width: 768px) {
        .mat-dialog-content {
          min-width: auto;
        }
      }

      mat-form-field {
        margin-bottom: 8px;
      }

      .inline {
        display: inline-block;
        margin-right: 8px;
      }
    `,
  ],
})
export class BulkRoleChangeDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<BulkRoleChangeDialogComponent>);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  data = inject<BulkRoleChangeDialogData>(MAT_DIALOG_DATA);

  roles: Role[] = [];
  isSubmitting = () => false;

  roleForm = this.fb.group({
    roleId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  private async loadRoles(): Promise<void> {
    try {
      this.roles = await this.userService.getRoles();
    } catch (error) {
      this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
    }
  }

  onSubmit(): void {
    if (this.roleForm.invalid) return;

    const roleId = this.roleForm.value.roleId;
    if (!roleId) return;

    this.dialogRef.close(roleId);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
