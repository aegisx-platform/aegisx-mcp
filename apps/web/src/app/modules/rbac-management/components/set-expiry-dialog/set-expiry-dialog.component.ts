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
import { UserRole } from '../../models/rbac.interfaces';

export interface SetExpiryDialogData {
  userRole: UserRole;
  userName: string;
}

export interface SetExpiryResult {
  expiryDate: Date | null;
  mode: 'set' | 'extend' | 'remove';
}

@Component({
  selector: 'app-set-expiry-dialog',
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
  ],
  template: `
    <div class="set-expiry-dialog">
      <div
        mat-dialog-title
        class="flex items-center justify-between pb-4 border-b"
      >
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl text-orange-600">schedule</mat-icon>
          <div>
            <h2 class="text-xl font-semibold m-0">Set Role Expiry</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 m-0">
              {{ data.userName }} - {{ data.userRole.role.name }}
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="space-y-6">
        <!-- Current Status -->
        <mat-card class="p-4">
          <div class="flex items-center gap-3 mb-3">
            <mat-icon class="text-blue-600">info</mat-icon>
            <h3 class="text-md font-medium m-0">Current Status</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">Assigned:</span>
              <span class="ml-2 font-medium">{{
                formatDate(data.userRole.assigned_at)
              }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400"
                >Current Expiry:</span
              >
              <span class="ml-2 font-medium" [class]="getCurrentExpiryClass()">
                {{
                  data.userRole.expires_at
                    ? formatDate(data.userRole.expires_at)
                    : 'No Expiry'
                }}
              </span>
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
              Action
            </label>
            <mat-radio-group formControlName="mode" class="flex flex-col gap-3">
              <mat-radio-button value="set" class="custom-radio">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-green-600">event</mat-icon>
                  <div>
                    <div class="font-medium">Set Expiry Date</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      Set a specific expiration date for this role assignment
                    </div>
                  </div>
                </div>
              </mat-radio-button>

              <mat-radio-button
                value="extend"
                class="custom-radio"
                [disabled]="!data.userRole.expires_at"
              >
                <div class="flex items-center gap-2">
                  <mat-icon class="text-blue-600">update</mat-icon>
                  <div>
                    <div class="font-medium">Extend Current Expiry</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{
                        data.userRole.expires_at
                          ? 'Add time to the existing expiration date'
                          : 'No current expiry to extend'
                      }}
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
                      Make this role assignment permanent (no expiry)
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
          </div>

          <!-- Extension Options (for extend mode) -->
          <div *ngIf="currentMode() === 'extend'">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Extend By</mat-label>
              <mat-select formControlName="extendBy">
                <mat-option value="7">7 Days</mat-option>
                <mat-option value="14">14 Days</mat-option>
                <mat-option value="30">30 Days (1 Month)</mat-option>
                <mat-option value="60">60 Days (2 Months)</mat-option>
                <mat-option value="90">90 Days (3 Months)</mat-option>
                <mat-option value="180">180 Days (6 Months)</mat-option>
                <mat-option value="365">365 Days (1 Year)</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Preview of new expiry date -->
            <div
              *ngIf="getExtendedDate()"
              class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <div
                class="flex items-center gap-2 text-blue-700 dark:text-blue-300"
              >
                <mat-icon>preview</mat-icon>
                <span class="font-medium">New Expiry Date Preview:</span>
                <span class="font-bold">{{
                  formatDate(getExtendedDate()!.toISOString())
                }}</span>
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
                  Permanent Access
                </div>
                <p class="text-sm text-purple-600 dark:text-purple-400">
                  This role assignment will become permanent with no expiration
                  date. The user will retain access until manually removed.
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Preset Buttons (for set mode) -->
          <div *ngIf="currentMode() === 'set'" class="space-y-3">
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
      .set-expiry-dialog {
        min-width: 500px;
        max-width: 600px;
      }

      .custom-radio {
        margin-bottom: 16px !important;
      }

      .custom-radio .mat-radio-label-content {
        width: 100%;
      }

      mat-dialog-content {
        padding: 0 24px;
        max-height: 70vh;
        overflow-y: auto;
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
export class SetExpiryDialogComponent {
  readonly currentMode = signal<'set' | 'extend' | 'remove'>('set');

  expiryForm = new FormGroup({
    mode: new FormControl<'set' | 'extend' | 'remove'>('set', {
      nonNullable: true,
    }),
    expiryDate: new FormControl<Date | null>(null),
    extendBy: new FormControl<number>(30, { nonNullable: true }),
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
    private dialogRef: MatDialogRef<SetExpiryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SetExpiryDialogData,
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
    const extendByControl = this.expiryForm.get('extendBy');

    // Clear all validators first
    expiryDateControl?.clearValidators();
    extendByControl?.clearValidators();

    if (this.currentMode() === 'set') {
      expiryDateControl?.setValidators([
        Validators.required,
        this.futureDateValidator,
      ]);
    } else if (this.currentMode() === 'extend') {
      extendByControl?.setValidators([Validators.required, Validators.min(1)]);
    }

    expiryDateControl?.updateValueAndValidity();
    extendByControl?.updateValueAndValidity();
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getCurrentExpiryClass(): string {
    if (!this.data.userRole.expires_at) {
      return 'text-gray-600 dark:text-gray-400';
    }

    const expiryDate = new Date(this.data.userRole.expires_at);
    const now = new Date();

    if (expiryDate < now) {
      return 'text-red-600 dark:text-red-400 font-semibold';
    }

    const diffDays = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= 7) {
      return 'text-orange-600 dark:text-orange-400 font-semibold';
    }

    return 'text-green-600 dark:text-green-400';
  }

  getExtendedDate(): Date | null {
    const extendBy = this.expiryForm.get('extendBy')?.value;
    if (!extendBy || !this.data.userRole.expires_at) return null;

    const currentExpiry = new Date(this.data.userRole.expires_at);
    const extended = new Date(currentExpiry);
    extended.setDate(extended.getDate() + extendBy);

    return extended;
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

    if (mode === 'extend') {
      const extendBy = this.expiryForm.get('extendBy');
      return (extendBy?.valid ?? false) && !!this.data.userRole.expires_at;
    }

    return false;
  }

  getActionButtonColor(): string {
    switch (this.currentMode()) {
      case 'set':
        return 'primary';
      case 'extend':
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
      case 'extend':
        return 'update';
      case 'remove':
        return 'all_inclusive';
      default:
        return 'schedule';
    }
  }

  getActionButtonText(): string {
    switch (this.currentMode()) {
      case 'set':
        return 'Set Expiry';
      case 'extend':
        return 'Extend Expiry';
      case 'remove':
        return 'Remove Expiry';
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
    } else if (mode === 'extend') {
      expiryDate = this.getExtendedDate();
    } else if (mode === 'remove') {
      expiryDate = null;
    }

    const result: SetExpiryResult = {
      expiryDate,
      mode,
    };

    this.dialogRef.close(result);
  }
}
