import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { AegisxAlertComponent } from '@aegisx/ui';

export interface DeleteAccountDialogData {
  userEmail?: string;
}

export interface DeleteAccountResult {
  confirmation: string;
  password: string;
  reason?: string;
}

@Component({
  selector: 'ax-delete-account-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    AegisxAlertComponent,
  ],
  template: `
    <div class="delete-account-dialog">
      <h2 mat-dialog-title class="text-red-600 dark:text-red-400">
        <mat-icon class="mr-2">warning</mat-icon>
        Delete Account
      </h2>

      <mat-dialog-content class="py-6">
        <!-- Warning Alert -->
        <ax-alert type="error" class="mb-6">
          <strong>This action cannot be undone!</strong>
          <br />
          All your data will be permanently removed after the recovery period.
        </ax-alert>

        <div class="space-y-6">
          <!-- Step 1: Confirmation Text -->
          <div>
            <h3 class="text-lg font-medium mb-3">Step 1: Type DELETE to confirm</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              To confirm account deletion, please type
              <strong class="text-red-600 dark:text-red-400">DELETE</strong> in
              the field below:
            </p>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Type "DELETE" to confirm</mat-label>
              <input
                matInput
                [(ngModel)]="confirmationText"
                placeholder="DELETE"
                (input)="validateConfirmation()"
              />
              @if (confirmationText && confirmationText !== 'DELETE') {
                <mat-error>Must type exactly "DELETE"</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Step 2: Password Verification -->
          @if (confirmationValid()) {
            <div>
              <h3 class="text-lg font-medium mb-3">
                Step 2: Enter your password
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Please enter your current password for additional security:
              </p>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Current Password</mat-label>
                <input
                  matInput
                  type="password"
                  [(ngModel)]="password"
                  placeholder="Enter your current password"
                  (input)="validatePassword()"
                />
                @if (password && password.length < 8) {
                  <mat-error>Password must be at least 8 characters</mat-error>
                }
              </mat-form-field>
            </div>
          }

          <!-- Step 3: Optional Reason -->
          @if (confirmationValid() && passwordValid()) {
            <div>
              <h3 class="text-lg font-medium mb-3">
                Step 3: Reason (Optional)
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Please tell us why you're leaving (optional):
              </p>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Reason for deletion (optional)</mat-label>
                <textarea
                  matInput
                  [(ngModel)]="reason"
                  placeholder="e.g., No longer needed, Privacy concerns, etc."
                  rows="3"
                  maxlength="500"
                ></textarea>
                <mat-hint align="end">{{ reason.length || 0 }}/500</mat-hint>
              </mat-form-field>
            </div>
          }

          <!-- Recovery Information -->
          @if (confirmationValid() && passwordValid()) {
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div class="flex">
                <mat-icon class="text-yellow-600 dark:text-yellow-400 mr-2">info</mat-icon>
                <div>
                  <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Recovery Period
                  </h4>
                  <p class="text-yellow-700 dark:text-yellow-300 text-sm">
                    You'll have <strong>30 days</strong> to recover your account before it's permanently deleted.
                    During this time, you can contact support to restore your account.
                  </p>
                </div>
              </div>
            </div>
          }
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="px-6 pb-4">
        <button mat-button (click)="onCancel()" class="mr-2">
          Cancel
        </button>
        <button
          mat-raised-button
          color="warn"
          (click)="onConfirm()"
          [disabled]="!canConfirm()"
        >
          <mat-icon class="mr-1">delete_forever</mat-icon>
          Delete My Account
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .delete-account-dialog {
        min-width: 500px;
        max-width: 600px;
      }

      mat-dialog-content {
        max-height: 70vh;
        overflow-y: auto;
      }

      .space-y-6 > * + * {
        margin-top: 1.5rem;
      }

      mat-form-field {
        width: 100%;
      }

      h2[mat-dialog-title] {
        display: flex;
        align-items: center;
        color: rgb(220, 38, 38);
        margin-bottom: 0;
      }

      .dark h2[mat-dialog-title] {
        color: rgb(248, 113, 113);
      }
    `,
  ],
})
export class DeleteAccountDialogComponent {
  data = inject<DeleteAccountDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DeleteAccountDialogComponent>);

  // Form fields
  confirmationText = '';
  password = '';
  reason = '';

  // Validation signals
  confirmationValid = signal(false);
  passwordValid = signal(false);

  validateConfirmation(): void {
    this.confirmationValid.set(this.confirmationText === 'DELETE');
  }

  validatePassword(): void {
    this.passwordValid.set(this.password.length >= 8);
  }

  canConfirm(): boolean {
    return this.confirmationValid() && this.passwordValid();
  }

  onConfirm(): void {
    if (this.canConfirm()) {
      const result: DeleteAccountResult = {
        confirmation: this.confirmationText,
        password: this.password,
        reason: this.reason || undefined,
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}