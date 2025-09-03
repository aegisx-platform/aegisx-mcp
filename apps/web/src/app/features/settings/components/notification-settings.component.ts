import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

@Component({
  selector: 'ax-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
  ],
  template: `
    <form [formGroup]="notificationForm">
      <!-- Global Settings -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Notification Preferences
        </h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Enable Notifications
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Master switch for all notifications
              </p>
            </div>
            <mat-slide-toggle
              formControlName="enableNotifications"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Do Not Disturb
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Silence notifications during specific hours
              </p>
            </div>
            <mat-slide-toggle
              formControlName="doNotDisturb"
              color="primary"
            ></mat-slide-toggle>
          </div>
        </div>
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- Notification Categories -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Notification Categories
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left border-b dark:border-gray-700">
                <th
                  class="pb-3 pr-4 font-medium text-gray-900 dark:text-gray-100"
                >
                  Category
                </th>
                <th
                  class="pb-3 px-4 text-center font-medium text-gray-900 dark:text-gray-100"
                >
                  <mat-icon class="text-lg align-middle">email</mat-icon>
                  Email
                </th>
                <th
                  class="pb-3 px-4 text-center font-medium text-gray-900 dark:text-gray-100"
                >
                  <mat-icon class="text-lg align-middle"
                    >notifications</mat-icon
                  >
                  Push
                </th>
                <th
                  class="pb-3 px-4 text-center font-medium text-gray-900 dark:text-gray-100"
                >
                  <mat-icon class="text-lg align-middle">sms</mat-icon>
                  SMS
                </th>
              </tr>
            </thead>
            <tbody>
              @for (category of notificationCategories; track category.id) {
                <tr class="border-b dark:border-gray-700">
                  <td class="py-4 pr-4">
                    <p class="font-medium text-gray-900 dark:text-gray-100">
                      {{ category.name }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ category.description }}
                    </p>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <mat-slide-toggle
                      [(ngModel)]="category.email"
                      [ngModelOptions]="{ standalone: true }"
                      (change)="onCategoryChange()"
                      color="primary"
                    ></mat-slide-toggle>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <mat-slide-toggle
                      [(ngModel)]="category.push"
                      [ngModelOptions]="{ standalone: true }"
                      (change)="onCategoryChange()"
                      color="primary"
                    ></mat-slide-toggle>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <mat-slide-toggle
                      [(ngModel)]="category.sms"
                      [ngModelOptions]="{ standalone: true }"
                      (change)="onCategoryChange()"
                      color="primary"
                    ></mat-slide-toggle>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- Email Settings -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Email Settings
        </h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Daily Digest
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Receive a summary of activities once per day
              </p>
            </div>
            <mat-slide-toggle
              formControlName="dailyDigest"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Weekly Report
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Receive a weekly summary report
              </p>
            </div>
            <mat-slide-toggle
              formControlName="weeklyReport"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <div class="mt-6">
            <button
              mat-stroked-button
              type="button"
              (click)="testEmailNotification()"
            >
              <mat-icon>send</mat-icon>
              Send Test Email
            </button>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      table {
        min-width: 500px;
      }

      @media (max-width: 768px) {
        .overflow-x-auto {
          -webkit-overflow-scrolling: touch;
        }
      }
    `,
  ],
})
export class NotificationSettingsComponent {
  @Output() settingsChange = new EventEmitter<any>();

  private fb = inject(FormBuilder);

  notificationForm = this.fb.group({
    enableNotifications: [true],
    doNotDisturb: [false],
    dailyDigest: [true],
    weeklyReport: [false],
  });

  notificationCategories: NotificationCategory[] = [
    {
      id: 'security',
      name: 'Security Alerts',
      description: 'Login attempts, password changes, and security events',
      email: true,
      push: true,
      sms: true,
    },
    {
      id: 'system',
      name: 'System Updates',
      description: 'Maintenance, updates, and system status changes',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'user',
      name: 'User Activity',
      description: 'New registrations, user actions, and profile updates',
      email: true,
      push: true,
      sms: false,
    },
    {
      id: 'reports',
      name: 'Reports',
      description: 'Scheduled reports and analytics',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'billing',
      name: 'Billing',
      description: 'Invoices, payment reminders, and subscription updates',
      email: true,
      push: true,
      sms: true,
    },
  ];

  constructor() {
    this.notificationForm.valueChanges.subscribe((values) => {
      this.emitChanges();
    });
  }

  onCategoryChange(): void {
    this.emitChanges();
  }

  testEmailNotification(): void {
    console.log('Sending test email notification...');
    // Implement test email logic
  }

  private emitChanges(): void {
    this.settingsChange.emit({
      notifications: {
        ...this.notificationForm.value,
        categories: this.notificationCategories,
      },
    });
  }
}
