import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'ax-general-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <form [formGroup]="settingsForm">
      <!-- Organization Settings -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Organization Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Organization Name</mat-label>
            <input
              matInput
              formControlName="organizationName"
              placeholder="Your Company Name"
            />
            <mat-icon matSuffix>business</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Contact Email</mat-label>
            <input
              matInput
              formControlName="contactEmail"
              type="email"
              placeholder="contact@example.com"
            />
            <mat-icon matSuffix>email</mat-icon>
            <mat-error
              *ngIf="settingsForm.get('contactEmail')?.hasError('email')"
            >
              Please enter a valid email address
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Time Zone</mat-label>
            <mat-select formControlName="timeZone">
              @for (tz of timeZones; track tz.value) {
                <mat-option [value]="tz.value">{{ tz.label }}</mat-option>
              }
            </mat-select>
            <mat-icon matSuffix>schedule</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Default Language</mat-label>
            <mat-select formControlName="language">
              <mat-option value="en">English</mat-option>
              <mat-option value="es">Spanish</mat-option>
              <mat-option value="fr">French</mat-option>
              <mat-option value="de">German</mat-option>
              <mat-option value="ja">Japanese</mat-option>
              <mat-option value="zh">Chinese</mat-option>
            </mat-select>
            <mat-icon matSuffix>language</mat-icon>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Organization Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="3"
            placeholder="Brief description of your organization"
          ></textarea>
        </mat-form-field>
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- System Settings -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          System Settings
        </h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Maintenance Mode
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Enable maintenance mode to prevent users from accessing the
                system
              </p>
            </div>
            <mat-slide-toggle
              formControlName="maintenanceMode"
              color="warn"
            ></mat-slide-toggle>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Debug Mode
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Enable debug mode for detailed error messages
              </p>
            </div>
            <mat-slide-toggle
              formControlName="debugMode"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Public Registration
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Allow new users to register without invitation
              </p>
            </div>
            <mat-slide-toggle
              formControlName="publicRegistration"
              color="primary"
            ></mat-slide-toggle>
          </div>
        </div>
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- Data Settings -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Data & Storage
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Data Retention (days)</mat-label>
            <input
              matInput
              formControlName="dataRetention"
              type="number"
              min="1"
              max="365"
            />
            <mat-icon matSuffix>storage</mat-icon>
            <mat-hint>How long to keep user data (1-365 days)</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Max Upload Size (MB)</mat-label>
            <input
              matInput
              formControlName="maxUploadSize"
              type="number"
              min="1"
              max="100"
            />
            <mat-icon matSuffix>cloud_upload</mat-icon>
            <mat-hint>Maximum file upload size in MB</mat-hint>
          </mat-form-field>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div>
            <p class="font-medium text-gray-900 dark:text-gray-100">
              Automatic Backups
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Enable automatic daily backups of system data
            </p>
          </div>
          <mat-slide-toggle
            formControlName="autoBackup"
            color="primary"
          ></mat-slide-toggle>
        </div>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-form-field {
        margin-bottom: 4px;
      }
    `,
  ],
})
export class GeneralSettingsComponent {
  @Output() settingsChange = new EventEmitter<any>();

  private fb = inject(FormBuilder);

  settingsForm = this.fb.group({
    organizationName: ['AegisX Platform', Validators.required],
    contactEmail: [
      'contact@aegisx.com',
      [Validators.required, Validators.email],
    ],
    timeZone: ['America/New_York', Validators.required],
    language: ['en', Validators.required],
    description: ['Enterprise application platform for modern businesses'],
    maintenanceMode: [false],
    debugMode: [false],
    publicRegistration: [true],
    dataRetention: [
      90,
      [Validators.required, Validators.min(1), Validators.max(365)],
    ],
    maxUploadSize: [
      10,
      [Validators.required, Validators.min(1), Validators.max(100)],
    ],
    autoBackup: [true],
  });

  timeZones = [
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
  ];

  constructor() {
    this.settingsForm.valueChanges.subscribe((values) => {
      this.settingsChange.emit({ general: values });
    });
  }
}
