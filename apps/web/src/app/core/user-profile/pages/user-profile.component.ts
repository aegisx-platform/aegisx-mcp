import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AxAlertComponent } from '@aegisx/ui';
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
import { DepartmentService } from '../../../features/system/modules/departments/services/departments.service';
import { buildDepartmentPath } from '../../../features/system/modules/departments/utils/department-hierarchy.utils';
import { Department } from '../../../features/system/modules/departments/types/departments.types';
import { MatChipsModule } from '@angular/material/chips';

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
    MatCardModule,
    MatChipsModule,
    AxAlertComponent,
    ProfileInfoComponent,
    ProfileSecurityComponent,
    UserPreferencesComponent,
    ActivityLogComponent,
  ],
  template: `
    <div class="profile-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">My Profile</h1>
          <p class="page-subtitle">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-container">
          <div class="loading-content">
            <mat-spinner diameter="48"></mat-spinner>
            <p class="loading-text">Loading profile...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @else if (error()) {
        <ax-alert
          type="error"
          title="Error Loading Profile"
          class="error-alert"
        >
          {{ error() }}
          <button
            mat-button
            color="primary"
            (click)="loadProfile()"
            class="retry-button"
          >
            Retry
          </button>
        </ax-alert>
      }

      <!-- Main Content -->
      @else {
        <!-- Department Section -->
        @if (userProfile()?.department_id) {
          @if (isLoadingDepartment()) {
            <mat-card appearance="outlined" class="department-card">
              <mat-card-content>
                <div class="department-loading">
                  <mat-spinner diameter="24"></mat-spinner>
                  <span class="loading-text">Loading department...</span>
                </div>
              </mat-card-content>
            </mat-card>
          } @else if (userDepartment()) {
            <mat-card appearance="outlined" class="department-card">
              <mat-card-header>
                <mat-icon class="department-icon">account_tree</mat-icon>
                <mat-card-title>Department</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="department-details">
                  <div class="department-name">{{ userDepartment()?.dept_name }}</div>
                  <div class="department-code">{{ userDepartment()?.dept_code }}</div>
                  @if (departmentPath()) {
                    <div class="department-path">{{ departmentPath() }}</div>
                  }
                  @if (userDepartment()?.is_active === false) {
                    <mat-chip-set>
                      <mat-chip class="inactive-chip">Inactive Department</mat-chip>
                    </mat-chip-set>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        } @else {
          <mat-card appearance="outlined" class="department-card">
            <mat-card-content>
              <div class="no-department">
                <mat-icon class="no-department-icon">info_outline</mat-icon>
                <span>No department assigned</span>
              </div>
            </mat-card-content>
          </mat-card>
        }

        <!-- Profile Tabs -->
        <mat-card appearance="outlined" class="tabs-card">
          <mat-tab-group
            [(selectedIndex)]="selectedTabIndex"
            animationDuration="200ms"
            class="profile-tabs"
          >
            <!-- Profile Information Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">person</mat-icon>
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
                <mat-icon class="tab-icon">security</mat-icon>
                <span>Security</span>
              </ng-template>
              <div class="tab-content">
                <ax-profile-security></ax-profile-security>
              </div>
            </mat-tab>

            <!-- Preferences Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">tune</mat-icon>
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
                <mat-icon class="tab-icon">history</mat-icon>
                <span>Activity</span>
              </ng-template>
              <div class="tab-content-no-padding">
                <ax-activity-log></ax-activity-log>
              </div>
            </mat-tab>

            <!-- Account Management Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">manage_accounts</mat-icon>
                <span>Account</span>
              </ng-template>
              <div class="tab-content">
                <div class="danger-zone-container">
                  <!-- Danger Zone -->
                  <div>
                    <h3 class="danger-zone-title">Danger Zone</h3>
                    <ax-alert type="warning" class="danger-zone-alert">
                      These actions cannot be undone. Please proceed with
                      caution.
                    </ax-alert>
                    <div class="danger-zone-actions">
                      <div class="delete-account-box">
                        <h4 class="delete-account-title">Delete Account</h4>
                        <p class="delete-account-description">
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
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* ===== CONTAINER ===== */
      .profile-container {
        padding: var(--ax-spacing-2xl) var(--ax-spacing-lg);
        max-width: 1400px;
        margin: 0 auto;
      }

      /* ===== PAGE HEADER ===== */
      .page-header {
        margin-bottom: var(--ax-spacing-2xl);
      }

      .header-content {
        flex: 1;
      }

      .page-title {
        margin: 0 0 var(--ax-spacing-xs) 0;
        font-size: var(--ax-text-3xl);
        font-weight: var(--ax-font-bold);
        color: var(--mat-sys-on-surface);
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        margin: 0;
        font-size: var(--ax-text-sm);
        color: var(--mat-sys-on-surface-variant);
      }

      /* ===== LOADING STATE ===== */
      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
      }

      .loading-content {
        text-align: center;
      }

      .loading-text {
        margin-top: var(--ax-spacing-md);
        color: var(--mat-sys-on-surface-variant);
      }

      /* ===== ERROR STATE ===== */
      .error-alert {
        margin-bottom: var(--ax-spacing-lg);
      }

      .retry-button {
        margin-left: var(--ax-spacing-sm);
      }

      /* ===== DEPARTMENT SECTION ===== */
      .department-card {
        margin-bottom: var(--ax-spacing-lg);
      }

      .department-icon {
        margin-right: var(--ax-spacing-sm);
        color: var(--mat-sys-primary);
      }

      .department-loading {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md);
        padding: var(--ax-spacing-md) 0;
      }

      .department-details {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-xs);
      }

      .department-name {
        font-size: var(--ax-text-lg);
        font-weight: var(--ax-font-semibold);
        color: var(--mat-sys-on-surface);
      }

      .department-code {
        font-size: var(--ax-text-sm);
        color: var(--mat-sys-on-surface-variant);
        font-family: monospace;
      }

      .department-path {
        font-size: var(--ax-text-xs);
        color: var(--mat-sys-on-surface-variant);
        opacity: 0.8;
        margin-top: var(--ax-spacing-sm);
      }

      .inactive-chip {
        margin-top: var(--ax-spacing-sm);
        background-color: var(--ax-error-subtle) !important;
        color: var(--ax-error-emphasis) !important;
      }

      .no-department {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm);
        color: var(--mat-sys-on-surface-variant);
        padding: var(--ax-spacing-md) 0;
      }

      .no-department-icon {
        color: var(--mat-sys-on-surface-variant);
      }

      /* ===== TABS ===== */
      .tabs-card {
        min-height: 600px;
      }

      .profile-tabs {
        min-height: 600px;
      }

      .tab-icon {
        margin-right: var(--ax-spacing-sm);
      }

      .tab-content {
        padding: var(--ax-spacing-2xl);
      }

      .tab-content-no-padding {
        padding: 0;
      }

      ::ng-deep .mat-mdc-tab-body-wrapper {
        flex: 1;
      }

      ::ng-deep .mat-mdc-tab-labels {
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      /* ===== DANGER ZONE ===== */
      .danger-zone-container {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-lg);
      }

      .danger-zone-title {
        margin: 0 0 var(--ax-spacing-md) 0;
        font-size: var(--ax-text-lg);
        font-weight: var(--ax-font-semibold);
        color: var(--ax-error-emphasis);
      }

      .danger-zone-alert {
        margin-bottom: var(--ax-spacing-md);
      }

      .danger-zone-actions {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-md);
      }

      .delete-account-box {
        padding: var(--ax-spacing-lg);
        border: 1px solid var(--ax-error-muted);
        border-radius: var(--ax-radius-md);
        background-color: var(--ax-error-subtle);
      }

      .delete-account-title {
        margin: 0 0 var(--ax-spacing-sm) 0;
        font-weight: var(--ax-font-medium);
        color: var(--ax-error-emphasis);
      }

      .delete-account-description {
        margin: 0 0 var(--ax-spacing-md) 0;
        font-size: var(--ax-text-sm);
        color: var(--ax-error-default);
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 768px) {
        .profile-container {
          padding: var(--ax-spacing-lg) var(--ax-spacing-md);
        }

        .page-title {
          font-size: var(--ax-text-2xl);
        }

        .tab-content {
          padding: var(--ax-spacing-lg);
        }
      }
    `,
  ],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private departmentService = inject(DepartmentService);
  private destroy$ = new Subject<void>();

  selectedTabIndex = 0;

  // State signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  userProfile = signal<any>(null);

  // Department signals
  userDepartment = signal<Department | null>(null);
  departmentPath = signal<string>('');
  isLoadingDepartment = signal(false);

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

          // Load department if user has department_id
          if (profile?.department_id) {
            this.loadDepartment(profile.department_id);
          }
        },
        error: (error) => {
          this.error.set(error.message || 'Failed to load profile');
          this.isLoading.set(false);
        },
      });
  }

  private async loadDepartment(departmentId: number): Promise<void> {
    this.isLoadingDepartment.set(true);

    try {
      // Fetch department details
      const department = await this.departmentService.loadDepartmentById(
        departmentId,
      );

      if (department) {
        this.userDepartment.set(department);

        // Build hierarchy path
        const path = await buildDepartmentPath(
          departmentId,
          this.departmentService,
        );
        this.departmentPath.set(path);
      }
    } catch (error) {
      console.error('Failed to load department:', error);
      // Don't show error to user - department is non-critical info
    } finally {
      this.isLoadingDepartment.set(false);
    }
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
