import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { UserRole } from '../../models/rbac.interfaces';

export interface BulkSetExpiryDialogData {
  selectedAssignments: UserRole[];
}

export interface BulkSetExpiryResult {
  expiryDate: Date | null;
  mode: 'set' | 'remove';
  assignments: UserRole[];
}

@Component({
  selector: 'app-bulk-set-expiry-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <div class="bulk-set-expiry-dialog">
      <div
        mat-dialog-title
        class="flex items-center justify-between pb-4 border-b"
      >
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl text-orange-600">event_available</mat-icon>
          <div>
            <h2 class="text-xl font-semibold m-0">Bulk Set Role Expiry</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 m-0">
              Update expiry dates for {{ data.selectedAssignments.length }} role
              assignments
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="space-y-6 max-h-[70vh] overflow-y-auto">
        <!-- Selected Assignments Summary -->
        <mat-card class="p-4">
          <div class="flex items-center gap-3 mb-4">
            <mat-icon class="text-blue-600">group</mat-icon>
            <h3 class="text-md font-medium m-0">
              Selected Assignments ({{ data.selectedAssignments.length }})
            </h3>
          </div>

          <div class="space-y-2 max-h-32 overflow-y-auto">
            <div
              *ngFor="let assignment of data.selectedAssignments"
              class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
            >
              <div class="flex-1">
                <div class="font-medium text-sm">
                  {{ getUserDisplayName(assignment) }}
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">
                  {{ assignment.role.name }}
                </div>
              </div>
              <mat-chip
                [class]="getExpiryChipClass(assignment)"
                class="!text-xs"
              >
                {{ getExpiryStatusText(assignment) }}
              </mat-chip>
            </div>
          </div>
        </mat-card>

        <!-- Form -->
        <form [formGroup]="expiryForm" class="space-y-6">
          <!-- Action Mode -->
          <div>
            <label
              class="block text-sm font-medium text-gray-900 dark:text-white mb-3"
            >
              Bulk Action
            </label>
            <mat-radio-group formControlName="mode" class="flex flex-col gap-3">
              <mat-radio-button value="set" class="custom-radio">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-green-600">event</mat-icon>
                  <div>
                    <div class="font-medium">Set Expiry Date</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      Set the same expiration date for all selected assignments
                    </div>
                  </div>
                </div>
              </mat-radio-button>

              <mat-radio-button value="remove" class="custom-radio">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-purple-600">all_inclusive</mat-icon>
                  <div>
                    <div class="font-medium">Remove Expiry</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      Make all selected assignments permanent (no expiry)
                    </div>
                  </div>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </div>

          <!-- Date Selection (for set mode) -->
          <div *ngIf="currentMode() === 'set'">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Expiry Date</mat-label>
              <input
                matInput
                [matDatepicker]="picker"
                formControlName="expiryDate"
                placeholder="Select expiry date"
                readonly
              />
              <mat-datepicker-toggle
                matIconSuffix
                [for]="picker"
              ></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error
                *ngIf="expiryForm.get('expiryDate')?.hasError('required')"
              >
                Please select an expiry date
              </mat-error>
              <mat-error
                *ngIf="expiryForm.get('expiryDate')?.hasError('dateInPast')"
              >
                Expiry date must be in the future
              </mat-error>
            </mat-form-field>

            <!-- Quick Preset Buttons -->
            <div class="space-y-3">
              <label
                class="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Quick Presets
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  mat-stroked-button
                  *ngFor="let preset of quickPresets"
                  (click)="applyPreset(preset.days)"
                  class="text-xs"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Remove Confirmation -->
          <div
            *ngIf="currentMode() === 'remove'"
            class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
          >
            <div class="flex items-start gap-3">
              <mat-icon class="text-purple-600 mt-0.5">info</mat-icon>
              <div>
                <div
                  class="font-medium text-purple-700 dark:text-purple-300 mb-1"
                >
                  Permanent Access for
                  {{ data.selectedAssignments.length }} Assignments
                </div>
                <p class="text-sm text-purple-600 dark:text-purple-400">
                  All selected role assignments will become permanent with no
                  expiration dates. Users will retain access until roles are
                  manually removed.
                </p>
              </div>
            </div>
          </div>

          <!-- Impact Preview -->
          <mat-card class="p-4 bg-blue-50 dark:bg-blue-900/20">
            <div class="flex items-center gap-3 mb-3">
              <mat-icon class="text-blue-600">preview</mat-icon>
              <h4
                class="text-md font-medium text-blue-700 dark:text-blue-300 m-0"
              >
                Impact Preview
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div class="text-center">
                <div class="text-lg font-bold text-blue-600">
                  {{ data.selectedAssignments.length }}
                </div>
                <div class="text-blue-600">Assignments</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">
                  {{ getUniqueUsersCount() }}
                </div>
                <div class="text-green-600">Users</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-purple-600">
                  {{ getUniqueRolesCount() }}
                </div>
                <div class="text-purple-600">Roles</div>
              </div>
            </div>
          </mat-card>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions
        align="end"
        class="border-t border-gray-200 dark:border-gray-700 pt-4"
      >
        <button mat-button (click)="onCancel()">Cancel</button>
        <button
          mat-raised-button
          [color]="getActionButtonColor()"
          (click)="onConfirm()"
          [disabled]="!isFormValid()"
        >
          <mat-icon>{{ getActionButtonIcon() }}</mat-icon>
          {{ getActionButtonText() }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .bulk-set-expiry-dialog {
        min-width: 600px;
        max-width: 800px;
      }

      .custom-radio {
        margin-bottom: 16px !important;
      }

      .custom-radio .mat-radio-label-content {
        width: 100%;
      }

      mat-dialog-content {
        padding: 0 24px;
      }

      mat-card {
        border-radius: 8px;
      }

      .mat-mdc-form-field {
        width: 100%;
      }

      /* Custom scrollbar */
      mat-dialog-content::-webkit-scrollbar {
        width: 6px;
      }

      mat-dialog-content::-webkit-scrollbar-track {
        background: var(--mat-sys-surface-variant);
      }

      mat-dialog-content::-webkit-scrollbar-thumb {
        background: var(--mat-sys-outline);
        border-radius: 3px;
      }
    `,
  ],
})
export class BulkSetExpiryDialogComponent {
  readonly currentMode = signal<'set' | 'remove'>('set');

  expiryForm = new FormGroup({
    mode: new FormControl<'set' | 'remove'>('set', { nonNullable: true }),
    expiryDate: new FormControl<Date | null>(null),
  });

  quickPresets = [
    { label: '1 Week', days: 7 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
    { label: '2 Years', days: 730 },
  ];

  constructor(
    private dialogRef: MatDialogRef<BulkSetExpiryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BulkSetExpiryDialogData,
  ) {
    // Watch mode changes
    this.expiryForm.get('mode')?.valueChanges.subscribe((mode) => {
      if (mode) {
        this.currentMode.set(mode);
        this.updateValidators();
      }
    });

    // Set initial validators
    this.updateValidators();
  }

  private updateValidators(): void {
    const expiryDateControl = this.expiryForm.get('expiryDate');

    // Clear all validators first
    expiryDateControl?.clearValidators();

    if (this.currentMode() === 'set') {
      expiryDateControl?.setValidators([
        Validators.required,
        this.futureDateValidator,
      ]);
    }

    expiryDateControl?.updateValueAndValidity();
  }

  private futureDateValidator(
    control: FormControl,
  ): { [key: string]: any } | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    if (selectedDate <= now) {
      return { dateInPast: true };
    }

    return null;
  }

  getUserDisplayName(assignment: UserRole): string {
    if (!assignment || !assignment.user_id) return 'Unknown User';
    return `User ${assignment.user_id.substring(0, 8)}`;
  }

  getExpiryStatusText(assignment: UserRole): string {
    if (!assignment.expires_at) return 'No Expiry';

    const expiryDate = new Date(assignment.expires_at);
    const now = new Date();

    if (expiryDate < now) return 'Expired';

    const diffDays = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= 7) return 'Expiring Soon';

    return 'Active';
  }

  getExpiryChipClass(assignment: UserRole): string {
    const status = this.getExpiryStatusText(assignment);
    switch (status) {
      case 'Expired':
        return '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200';
      case 'Expiring Soon':
        return '!bg-orange-100 !text-orange-800 dark:!bg-orange-900 dark:!text-orange-200';
      case 'Active':
        return '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200';
      default:
        return '!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200';
    }
  }

  getUniqueUsersCount(): number {
    const userIds = new Set(
      this.data.selectedAssignments.map((a) => a.user_id),
    );
    return userIds.size;
  }

  getUniqueRolesCount(): number {
    const roleIds = new Set(
      this.data.selectedAssignments.map((a) => a.role_id),
    );
    return roleIds.size;
  }

  applyPreset(days: number): void {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    this.expiryForm.patchValue({ expiryDate: futureDate });
  }

  isFormValid(): boolean {
    const mode = this.currentMode();

    if (mode === 'remove') return true;

    if (mode === 'set') {
      const expiryDate = this.expiryForm.get('expiryDate');
      return expiryDate?.valid ?? false;
    }

    return false;
  }

  getActionButtonColor(): string {
    switch (this.currentMode()) {
      case 'set':
        return 'primary';
      case 'remove':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getActionButtonIcon(): string {
    switch (this.currentMode()) {
      case 'set':
        return 'event';
      case 'remove':
        return 'all_inclusive';
      default:
        return 'schedule';
    }
  }

  getActionButtonText(): string {
    switch (this.currentMode()) {
      case 'set':
        return `Set Expiry for ${this.data.selectedAssignments.length} Assignments`;
      case 'remove':
        return `Remove Expiry for ${this.data.selectedAssignments.length} Assignments`;
      default:
        return 'Update';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (!this.isFormValid()) return;

    const mode = this.currentMode();
    let expiryDate: Date | null = null;

    if (mode === 'set') {
      expiryDate = this.expiryForm.get('expiryDate')?.value || null;
    } else if (mode === 'remove') {
      expiryDate = null;
    }

    const result: BulkSetExpiryResult = {
      expiryDate,
      mode,
      assignments: this.data.selectedAssignments,
    };

    this.dialogRef.close(result);
  }
}
