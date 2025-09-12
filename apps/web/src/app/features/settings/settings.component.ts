import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';
import { DynamicSettingsComponent } from './components/dynamic-settings.component';
import { SettingsService } from './settings.service';
import { GroupedSettings, SettingChangeEvent } from './settings.types';

@Component({
  selector: 'ax-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    AegisxCardComponent,
    AegisxAlertComponent,
    DynamicSettingsComponent,
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

      <!-- Loading State -->
      @if (settingsService.loading()) {
        <div class="flex justify-center items-center min-h-[400px]">
          <div class="text-center">
            <mat-spinner diameter="48"></mat-spinner>
            <p class="text-gray-600 dark:text-gray-400 mt-4">
              Loading settings...
            </p>
          </div>
        </div>
      }

      <!-- Error State -->
      @else if (settingsService.error()) {
        <ax-alert type="error" title="Error Loading Settings" class="mb-6">
          {{ settingsService.error() }}
          <button
            mat-button
            color="primary"
            (click)="loadSettings()"
            class="ml-2"
          >
            Retry
          </button>
        </ax-alert>
      }

      <!-- Main Content -->
      @else {
        @if (settingsService.hasUnsavedChanges()) {
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
            @for (
              categoryGroup of settingsService.groupedSettings();
              track categoryGroup.category
            ) {
              <mat-tab>
                <ng-template mat-tab-label>
                  <mat-icon class="mr-2">{{
                    getCategoryIcon(categoryGroup.category)
                  }}</mat-icon>
                  <span>{{
                    getCategoryDisplayName(categoryGroup.category)
                  }}</span>
                  @if (categoryHasChanges(categoryGroup.category)) {
                    <mat-icon
                      class="ml-2 text-orange-500 text-sm"
                      fontIcon="edit"
                      matTooltip="This category has unsaved changes"
                    ></mat-icon>
                  }
                </ng-template>
                <div class="tab-content">
                  <ax-dynamic-settings
                    [groupedSettings]="categoryGroup"
                    (settingsChange)="onSettingChange($event)"
                  ></ax-dynamic-settings>
                </div>
              </mat-tab>
            }
          </mat-tab-group>

          <!-- Action Buttons -->
          <div
            class="flex justify-end space-x-2 p-4 border-t dark:border-gray-700"
          >
            <button
              mat-button
              (click)="revertChanges()"
              [disabled]="!settingsService.hasUnsavedChanges()"
            >
              Reset Changes
            </button>
            <button
              mat-raised-button
              color="primary"
              (click)="saveSettings()"
              [disabled]="
                !settingsService.hasUnsavedChanges() ||
                settingsService.isSaving()
              "
            >
              @if (settingsService.isSaving()) {
                <mat-icon class="animate-spin mr-2">sync</mat-icon>
              }
              Save Settings
            </button>
          </div>
        </ax-card>
      }
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
export class SettingsComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  readonly settingsService = inject(SettingsService);
  private destroy$ = new Subject<void>();

  selectedTabIndex = 0;

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSettings(): void {
    this.settingsService
      .getGroupedSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (groupedSettings) => {
          console.log('Settings loaded:', groupedSettings);
        },
        error: (error) => {
          console.error('Failed to load settings:', error);
        },
      });
  }

  onSettingChange(event: SettingChangeEvent): void {
    // Handle individual setting changes from dynamic components
    this.settingsService.optimisticUpdate(event.settingId, event.newValue);
  }

  saveSettings(): void {
    this.settingsService
      .saveAllChanges()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const message =
            result.failed > 0
              ? `Settings saved with ${result.failed} errors`
              : 'All settings saved successfully';

          this.snackBar.open(message, 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: result.failed > 0 ? ['warn-snackbar'] : [],
          });

          // Show detailed errors if any
          if (result.errors && result.errors.length > 0) {
            result.errors.forEach((error: { key: string; error: string }) => {
              this.snackBar.open(`${error.key}: ${error.error}`, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar'],
              });
            });
          }
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to save settings',
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            },
          );
        },
      });
  }

  revertChanges(): void {
    this.settingsService.revertAllChanges();
    this.snackBar.open('Changes reverted', 'Close', {
      duration: 2000,
    });
  }

  // Helper method to get settings for a specific category
  getCategorySettings(category: string) {
    return this.settingsService.getSettingsByCategory(category);
  }

  // Helper method to check if a specific category has changes
  categoryHasChanges(category: string): boolean {
    const settings = this.settingsService.getSettingsByCategory(category);
    return settings.some((setting) =>
      this.settingsService.hasSettingChanged(setting.id),
    );
  }

  // Get display-friendly category name
  getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      general: 'General',
      security: 'Security',
      notifications: 'Notifications',
      integrations: 'Integrations',
      appearance: 'Appearance',
      system: 'System',
      data: 'Data & Storage',
      api: 'API Settings',
      email: 'Email Settings',
      authentication: 'Authentication',
      monitoring: 'Monitoring',
      backup: 'Backup & Recovery',
      // Add more as needed based on your backend categories
    };

    return (
      categoryNames[category.toLowerCase()] ||
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    );
  }

  // Get appropriate icon for category
  getCategoryIcon(category: string): string {
    const categoryIcons: Record<string, string> = {
      general: 'settings',
      security: 'security',
      notifications: 'notifications',
      integrations: 'api',
      appearance: 'palette',
      system: 'computer',
      data: 'storage',
      api: 'code',
      email: 'email',
      authentication: 'key',
      monitoring: 'analytics',
      backup: 'backup',
      // Add more as needed
    };

    return categoryIcons[category.toLowerCase()] || 'folder';
  }
}
