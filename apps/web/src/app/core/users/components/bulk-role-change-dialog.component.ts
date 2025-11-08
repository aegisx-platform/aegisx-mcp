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
          <mat-label>Select Roles</mat-label>
          <mat-select formControlName="roleIds" multiple>
            @for (role of roles; track role.id) {
              <mat-option [value]="role.id">
                {{ role.name }}
              </mat-option>
            }
          </mat-select>
          <mat-error *ngIf="roleForm.get('roleIds')?.hasError('required')">
            At least one role is required
          </mat-error>
        </mat-form-field>
      </form>

      <div class="mt-4 p-3 bg-red-50 border border-red-300 rounded text-sm">
        <mat-icon class="text-red-600 align-top font-bold">warning</mat-icon>
        <span class="ml-2 font-medium text-red-800"
          ><strong>⚠️ CRITICAL:</strong> All existing roles will be
          <strong>PERMANENTLY REPLACED</strong> with the selected roles only.
          Users will lose all current permissions and must re-authenticate. This
          action cannot be undone.</span
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
        Change Roles
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
    roleIds: [[], Validators.required],
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

    const roleIds = (this.roleForm.value?.roleIds ?? []) as string[];
    if (!roleIds || roleIds.length === 0) return;

    this.dialogRef.close(roleIds);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
