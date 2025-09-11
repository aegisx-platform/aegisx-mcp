import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';
import { GeneralSettingsComponent } from './components/general-settings.component';
import { SecuritySettingsComponent } from './components/security-settings.component';
import { NotificationSettingsComponent } from './components/notification-settings.component';
import { IntegrationSettingsComponent } from './components/integration-settings.component';
import { AppearanceSettingsComponent } from './components/appearance-settings.component';

@Component({
  selector: 'ax-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    AegisxCardComponent,
    AegisxAlertComponent,
    GeneralSettingsComponent,
    SecuritySettingsComponent,
    NotificationSettingsComponent,
    IntegrationSettingsComponent,
    AppearanceSettingsComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Manage your application preferences and configurations
        </p>
      </div>

      @if (hasUnsavedChanges()) {
        <ax-alert type="warning" title="Unsaved Changes" class="mb-6">
          You have unsaved changes. Don't forget to save before leaving this
          page.
        </ax-alert>
      }

      <!-- Settings Tabs -->
      <ax-card [appearance]="'elevated'">
        <mat-tab-group
          [(selectedIndex)]="selectedTabIndex"
          animationDuration="200ms"
          class="settings-tabs"
        >
          <!-- General Settings -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2">settings</mat-icon>
              <span>General</span>
            </ng-template>
            <div class="tab-content">
              <ax-general-settings
                (settingsChange)="onSettingsChange($event)"
              ></ax-general-settings>
            </div>
          </mat-tab>

          <!-- Security Settings -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2">security</mat-icon>
              <span>Security</span>
            </ng-template>
            <div class="tab-content">
              <ax-security-settings
                (settingsChange)="onSettingsChange($event)"
              ></ax-security-settings>
            </div>
          </mat-tab>

          <!-- Notification Settings -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2">notifications</mat-icon>
              <span>Notifications</span>
            </ng-template>
            <div class="tab-content">
              <ax-notification-settings
                (settingsChange)="onSettingsChange($event)"
              ></ax-notification-settings>
            </div>
          </mat-tab>

          <!-- Integration Settings -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2">api</mat-icon>
              <span>Integrations</span>
            </ng-template>
            <div class="tab-content">
              <ax-integration-settings
                (settingsChange)="onSettingsChange($event)"
              ></ax-integration-settings>
            </div>
          </mat-tab>

          <!-- Appearance Settings -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2">palette</mat-icon>
              <span>Appearance</span>
            </ng-template>
            <div class="tab-content">
              <ax-appearance-settings
                (settingsChange)="onSettingsChange($event)"
              ></ax-appearance-settings>
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Action Buttons -->
        <div
          class="flex justify-end space-x-2 p-4 border-t dark:border-gray-700"
        >
          <button
            mat-button
            (click)="resetSettings()"
            [disabled]="!hasUnsavedChanges()"
          >
            Reset Changes
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="saveSettings()"
            [disabled]="!hasUnsavedChanges() || isSaving()"
          >
            @if (isSaving()) {
              <mat-icon class="animate-spin mr-2">sync</mat-icon>
            }
            Save Settings
          </button>
        </div>
      </ax-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .settings-tabs {
        min-height: 500px;
      }

      .tab-content {
        padding: 24px;
      }

      ::ng-deep .mat-mdc-tab-body-wrapper {
        flex: 1;
      }

      ::ng-deep .mat-mdc-tab-labels {
        @apply border-b dark:border-gray-700;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `,
  ],
})
export class SettingsComponent {
  private snackBar = inject(MatSnackBar);

  selectedTabIndex = 0;
  hasUnsavedChanges = signal(false);
  isSaving = signal(false);

  private pendingChanges: Record<string, any> = {};

  onSettingsChange(changes: any): void {
    Object.assign(this.pendingChanges, changes);
    this.hasUnsavedChanges.set(true);
  }

  async saveSettings(): Promise<void> {
    if (!this.hasUnsavedChanges()) return;

    this.isSaving.set(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Saving settings:', this.pendingChanges);

      this.snackBar.open('Settings saved successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });

      this.pendingChanges = {};
      this.hasUnsavedChanges.set(false);
    } catch (error) {
      this.snackBar.open('Failed to save settings', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isSaving.set(false);
    }
  }

  resetSettings(): void {
    this.pendingChanges = {};
    this.hasUnsavedChanges.set(false);
    this.snackBar.open('Changes discarded', 'Close', {
      duration: 2000,
    });
  }
}
