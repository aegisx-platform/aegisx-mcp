import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';
import { ProfileInfoComponent } from '../components/profile-info.component';
import { ProfileSecurityComponent } from '../components/profile-security.component';
import { UserPreferencesComponent } from '../components/user-preferences.component';
import { ActivityLogComponent } from '../components/activity-log';
import { UserService } from '../../users/services/user.service';
import { AuthService } from '../../../core/auth';
import {
  DeleteAccountDialogComponent,
  DeleteAccountResult,
} from '../components/delete-account-dialog.component';

@Component({
  selector: 'ax-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    AegisxCardComponent,
    AegisxAlertComponent,
    ProfileInfoComponent,
    ProfileSecurityComponent,
    UserPreferencesComponent,
    ActivityLogComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              My Profile
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex justify-center items-center min-h-[400px]">
          <div class="text-center">
            <mat-spinner diameter="48"></mat-spinner>
            <p class="text-gray-600 dark:text-gray-400 mt-4">
              Loading profile...
            </p>
          </div>
        </div>
      }

      <!-- Error State -->
      @else if (error()) {
        <ax-alert type="error" title="Error Loading Profile" class="mb-6">
          {{ error() }}
          <button
            mat-button
            color="primary"
            (click)="loadProfile()"
            class="ml-2"
          >
            Retry
          </button>
        </ax-alert>
      }

      <!-- Main Content -->
      @else {
        <!-- Profile Tabs -->
        <ax-card [appearance]="'elevated'">
          <mat-tab-group
            [(selectedIndex)]="selectedTabIndex"
            animationDuration="200ms"
            class="profile-tabs"
          >
            <!-- Profile Information Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-2">person</mat-icon>
                <span>Profile Info</span>
              </ng-template>
              <div class="tab-content">
                <ax-profile-info
                  [userProfile]="userProfile()"
                  (profileChange)="onProfileInfoChange($event)"
                ></ax-profile-info>
              </div>
            </mat-tab>

            <!-- Security Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-2">security</mat-icon>
                <span>Security</span>
              </ng-template>
              <div class="tab-content">
                <ax-profile-security></ax-profile-security>
              </div>
            </mat-tab>

            <!-- Preferences Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-2">tune</mat-icon>
                <span>Preferences</span>
              </ng-template>
              <div class="tab-content">
                <ax-user-preferences
                  [userProfile]="userProfile()"
                  (preferencesChange)="onPreferencesChange($event)"
                ></ax-user-preferences>
              </div>
            </mat-tab>

            <!-- Activity Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-2">history</mat-icon>
                <span>Activity</span>
              </ng-template>
              <div class="tab-content p-0">
                <ax-activity-log></ax-activity-log>
              </div>
            </mat-tab>

            <!-- Account Management Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-2">manage_accounts</mat-icon>
                <span>Account</span>
              </ng-template>
              <div class="tab-content">
                <div class="space-y-6">
                  <!-- Danger Zone -->
                  <div>
                    <h3
                      class="text-lg font-semibold mb-4 text-red-600 dark:text-red-400"
                    >
                      Danger Zone
                    </h3>
                    <ax-alert type="warning" class="mb-4">
                      These actions cannot be undone. Please proceed with
                      caution.
                    </ax-alert>
                    <div class="space-y-4">
                      <div
                        class="p-4 border border-red-200 dark:border-red-800 rounded-md"
                      >
                        <h4
                          class="font-medium text-red-800 dark:text-red-200 mb-2"
                        >
                          Delete Account
                        </h4>
                        <p class="text-red-600 dark:text-red-300 text-sm mb-4">
                          Permanently delete your account and all associated
                          data. This action cannot be reversed.
                        </p>
                        <button
                          mat-stroked-button
                          color="warn"
                          (click)="confirmDeleteAccount()"
                          [disabled]="isLoading()"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </ax-card>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .profile-tabs {
        min-height: 600px;
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
export class UserProfileComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  selectedTabIndex = 0;

  // State signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  userProfile = signal<any>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.userProfile.set(profile);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.error.set(error.message || 'Failed to load profile');
          this.isLoading.set(false);
        },
      });
  }

  onProfileInfoChange(updatedProfile: any): void {
    // Update the profile data directly since ProfileInfoComponent now saves directly
    this.userProfile.set(updatedProfile);
  }

  onPreferencesChange(updatedPreferences: any): void {
    // Update the profile with new preferences
    this.userProfile.update((current) => {
      if (current) {
        return { ...current, preferences: updatedPreferences };
      }
      return current;
    });
  }

  confirmDeleteAccount(): void {
    // Open confirmation dialog
    this.openDeleteAccountDialog();
  }

  private openDeleteAccountDialog(): void {
    const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        userEmail: this.userProfile()?.email,
      },
    });

    dialogRef.afterClosed().subscribe((result: DeleteAccountResult | null) => {
      if (result) {
        this.deleteAccount(result);
      }
    });
  }

  private async deleteAccount(
    dialogResult: DeleteAccountResult,
  ): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      // Call delete account API with dialog result
      const response = await this.userService.deleteAccount({
        confirmation: dialogResult.confirmation,
        password: dialogResult.password,
        reason: dialogResult.reason || 'User requested account deletion',
      });

      if (response.success) {
        // Show success message with recovery information
        this.snackBar.open(
          `Account marked for deletion. Recovery available for ${response.data?.recoveryPeriod}. Logging out...`,
          'OK',
          {
            duration: 5000,
            panelClass: ['snackbar-warning'],
          },
        );

        // Wait a moment for user to see the message, then logout
        setTimeout(() => {
          this.authService.logout().subscribe({
            next: () => {
              // Logout successful, user will be redirected by AuthService
            },
            error: () => {
              // Even if logout fails, clear local auth and redirect
              window.location.href = '/auth/login';
            },
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      this.errorMessage.set(
        error.message || 'Failed to delete account. Please try again.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
