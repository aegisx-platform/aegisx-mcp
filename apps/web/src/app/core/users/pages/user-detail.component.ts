import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AegisxCardComponent } from '@aegisx/ui';
import { UserService, User, UserRole } from '../services/user.service';
import { UserFormDialogComponent } from '../components/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/ui/components/confirm-dialog.component';
import { ActivityTabComponent } from '../components/activity-tab.component';
import { PermissionsTabComponent } from '../components/permissions-tab.component';
import { SessionsTabComponent } from '../components/sessions-tab.component';

@Component({
  selector: 'ax-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    AegisxCardComponent,
    ActivityTabComponent,
    PermissionsTabComponent,
    SessionsTabComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>
      } @else if (error()) {
        <ax-card [appearance]="'elevated'" class="max-w-2xl mx-auto">
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-red-500">error_outline</mat-icon>
            <p
              class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4"
            >
              Error loading user
            </p>
            <p class="text-gray-600 dark:text-gray-400">{{ error() }}</p>
            <button
              mat-raised-button
              color="primary"
              (click)="loadUser()"
              class="mt-4"
            >
              <mat-icon>refresh</mat-icon>
              <span>Retry</span>
            </button>
          </div>
        </ax-card>
      } @else if (user()) {
        <!-- User Header -->
        <div class="flex justify-between items-start mb-8">
          <div class="flex items-center space-x-4">
            <button mat-icon-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div
              class="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
            >
              <span
                class="text-2xl font-semibold text-primary-600 dark:text-primary-400"
              >
                {{ getInitials(user()!) }}
              </span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ user()!.firstName }} {{ user()!.lastName }}
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                {{ user()!.email }}
              </p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button mat-stroked-button (click)="editUser()">
              <mat-icon>edit</mat-icon>
              <span>Edit</span>
            </button>
            <button mat-stroked-button color="warn" (click)="deleteUser()">
              <mat-icon>delete</mat-icon>
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- User Details Tabs -->
        <mat-tab-group>
          <!-- Profile Tab -->
          <mat-tab label="Profile">
            <!-- Basic Information Card -->
            <ax-card [appearance]="'elevated'" class="mt-6">
              <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
              <mat-list>
                <mat-list-item>
                  <span matListItemTitle>Username</span>
                  <span matListItemMeta>{{ user()!.username }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>

                <mat-list-item>
                  <span matListItemTitle>Email</span>
                  <span matListItemMeta>{{ user()!.email }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>

                <mat-list-item>
                  <span matListItemTitle>Full Name</span>
                  <span matListItemMeta>
                    {{ user()!.firstName }} {{ user()!.lastName }}
                  </span>
                </mat-list-item>
              </mat-list>
            </ax-card>

            <!-- Roles and Status Card -->
            <ax-card [appearance]="'elevated'" class="mt-6">
              <h3 class="text-lg font-semibold mb-4">Access Control</h3>
              <mat-list>
                <mat-list-item>
                  <span matListItemTitle>Assigned Roles</span>
                  <span matListItemMeta>
                    @if (user()!.roles && user()!.roles.length > 0) {
                      <div class="flex flex-wrap gap-2">
                        @for (role of user()!.roles; track role.id) {
                          <mat-chip
                            [matTooltip]="formatRoleTooltip(role)"
                            (click)="viewRoleDetails(role)"
                            [class]="getRoleChipClass(role)"
                            class="cursor-pointer"
                          >
                            {{ role.roleName }}
                            @if (isPrimaryRole(role)) {
                              <mat-icon class="ml-1 text-sm">star</mat-icon>
                            }
                            @if (isExpired(role.expiresAt)) {
                              <mat-icon
                                class="ml-1 text-sm"
                                matTooltip="Role has expired"
                                >error</mat-icon
                              >
                            } @else if (isExpiringWithin7Days(role.expiresAt)) {
                              <mat-icon
                                class="ml-1 text-sm"
                                matTooltip="Role expires soon"
                                >warning</mat-icon
                              >
                            }
                          </mat-chip>
                        }
                      </div>
                    } @else {
                      <span class="text-gray-400">No roles assigned</span>
                    }
                  </span>
                </mat-list-item>
                <mat-divider></mat-divider>

                <mat-list-item>
                  <span matListItemTitle>Status</span>
                  <span matListItemMeta>
                    <span
                      class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800':
                          user()!.status === 'active',
                        'bg-gray-100 text-gray-800':
                          user()!.status === 'inactive',
                        'bg-red-100 text-red-800':
                          user()!.status === 'suspended',
                        'bg-yellow-100 text-yellow-800':
                          user()!.status === 'pending',
                      }"
                    >
                      <mat-icon
                        class="mr-1 text-sm"
                        [ngSwitch]="user()!.status"
                      >
                        @switch (user()!.status) {
                          @case ('active') {
                            check_circle
                          }
                          @case ('inactive') {
                            cancel
                          }
                          @case ('suspended') {
                            block
                          }
                          @case ('pending') {
                            schedule
                          }
                        }
                      </mat-icon>
                      {{ user()!.status | titlecase }}
                    </span>
                  </span>
                </mat-list-item>
              </mat-list>
            </ax-card>

            <!-- Audit Information Card -->
            <ax-card [appearance]="'elevated'" class="mt-6">
              <h3 class="text-lg font-semibold mb-4">Account Activity</h3>
              <mat-list>
                <mat-list-item>
                  <span matListItemTitle>Created At</span>
                  <span matListItemMeta>
                    <span class="text-sm">{{
                      formatDate(user()!.createdAt)
                    }}</span>
                  </span>
                </mat-list-item>
                <mat-divider></mat-divider>

                <mat-list-item>
                  <span matListItemTitle>Last Updated</span>
                  <span matListItemMeta>
                    <span class="text-sm">{{
                      formatDate(user()!.updatedAt)
                    }}</span>
                  </span>
                </mat-list-item>

                @if (user()!.lastLoginAt) {
                  <mat-divider></mat-divider>
                  <mat-list-item>
                    <span matListItemTitle>Last Login</span>
                    <span matListItemMeta>
                      <span class="text-sm">{{
                        formatDate(user()!.lastLoginAt!)
                      }}</span>
                    </span>
                  </mat-list-item>
                } @else {
                  <mat-divider></mat-divider>
                  <mat-list-item>
                    <span matListItemTitle>Last Login</span>
                    <span matListItemMeta>
                      <span class="text-gray-400 text-sm">Never logged in</span>
                    </span>
                  </mat-list-item>
                }
              </mat-list>
            </ax-card>
          </mat-tab>

          <!-- Activity Tab -->
          <mat-tab label="Activity">
            <ax-activity-tab [userId]="user()!.id"></ax-activity-tab>
          </mat-tab>

          <!-- Permissions Tab -->
          <mat-tab label="Permissions">
            <ax-permissions-tab [userId]="user()!.id"></ax-permissions-tab>
          </mat-tab>

          <!-- Sessions Tab -->
          <mat-tab label="Sessions">
            <ax-sessions-tab [userId]="user()!.id"></ax-sessions-tab>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-list-item {
        height: 56px !important;
      }

      ::ng-deep .mat-mdc-list-item-meta {
        @apply text-gray-600 dark:text-gray-400;
      }

      /* Card Styling Enhancements */
      ax-card {
        @apply transition-all duration-200 ease-in-out;

        &:hover {
          @apply shadow-lg;
        }
      }

      /* Role Chips Styling */
      mat-chip {
        @apply font-medium transition-all duration-200 ease-in-out;

        &.expired-role {
          @apply bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200;
        }

        &.expiring-soon-role {
          @apply bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200;
        }
      }

      /* Material Icons - Consolidated Styling */
      mat-icon {
        font-size: inherit;
        width: auto;
        height: auto;

        &.text-sm {
          font-size: 18px;
        }

        &.ml-1 {
          margin-left: 0.25rem;
        }

        &.mr-1 {
          margin-right: 0.25rem;
        }
      }

      /* Status Badge Styling */
      .status-badge {
        @apply inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200;
      }

      /* Improved Spacing for Card Titles */
      h3 {
        @apply text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4;
      }

      /* User Header Styling */
      .user-header {
        @apply bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg p-6 mb-8;
      }

      .avatar-circle {
        @apply w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md;
      }

      .avatar-initials {
        @apply text-2xl font-bold text-white;
      }

      /* Tab Content Spacing */
      mat-tab-group {
        ::ng-deep .mat-mdc-tab-body-wrapper {
          @apply pt-4;
        }
      }

      /* Role Chip Container */
      .roles-container {
        @apply flex flex-wrap gap-2.5;
      }

      /* Empty State Styling */
      .empty-state {
        @apply text-center py-8;

        mat-icon {
          height: 64px;
          width: 64px;
          font-size: 64px;
          @apply text-gray-300 dark:text-gray-600 mb-4;
        }

        p {
          @apply text-gray-500 dark:text-gray-400 text-sm;
        }
      }

      /* List Item Hover Effect */
      mat-list-item {
        @apply transition-colors duration-150;

        &:hover {
          @apply bg-gray-50 dark:bg-gray-800;
        }
      }

      /* Better List Divider */
      mat-divider {
        @apply my-0;
      }

      /* Action Buttons */
      button[mat-stroked-button],
      button[mat-raised-button] {
        @apply transition-all duration-200;

        &:hover:not(:disabled) {
          @apply shadow-md;
        }

        &:disabled {
          @apply opacity-50 cursor-not-allowed;
        }
      }

      /* Header Buttons Container */
      .header-actions {
        @apply flex gap-2;
      }

      /* Font Sizes and Line Heights */
      ::ng-deep .mat-mdc-list-item-title {
        @apply font-medium text-gray-700 dark:text-gray-300;
      }
    `,
  ],
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  user = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadUser();
  }

  async loadUser() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.router.navigate(['/users']);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const user = await this.userService.loadUserById(userId);
      if (user) {
        this.user.set(user);
      } else {
        this.error.set('User not found');
      }
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load user');
    } finally {
      this.loading.set(false);
    }
  }

  editUser(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user: this.user() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUser();
      }
    });
  }

  deleteUser(): void {
    const user = this.user();
    if (!user) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed && user) {
        try {
          await this.userService.deleteUser(user.id);
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/users']);
        } catch (error) {
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  getInitials(user: User): string {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatRoleTooltip(role: UserRole): string {
    const lines: string[] = [role.roleName];

    if (role.assignedAt) {
      lines.push(`Assigned: ${this.formatDate(role.assignedAt)}`);
    }

    if (role.assignedBy) {
      lines.push(`Assigned by: ${role.assignedBy}`);
    }

    if (role.expiresAt) {
      lines.push(`Expires: ${this.formatDate(role.expiresAt)}`);
      if (this.isExpired(role.expiresAt)) {
        lines.push('⚠️ Expired');
      }
    } else {
      lines.push('No expiration');
    }

    lines.push(`Status: ${role.isActive ? 'Active' : 'Inactive'}`);

    return lines.join('\n');
  }

  isPrimaryRole(role: UserRole): boolean {
    const user = this.user();
    if (!user) return false;
    return user.roleId === role.roleId;
  }

  isExpired(expiryDate: string | null | undefined): boolean {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  }

  isExpiringWithin7Days(expiryDate: string | null | undefined): boolean {
    if (!expiryDate) return false;
    const expiryTime = new Date(expiryDate).getTime();
    const nowTime = new Date().getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const diffTime = expiryTime - nowTime;
    return diffTime > 0 && diffTime <= sevenDaysInMs;
  }

  getRoleChipClass(role: UserRole): string {
    if (this.isExpired(role.expiresAt)) {
      return 'expired-role';
    }
    if (this.isExpiringWithin7Days(role.expiresAt)) {
      return 'expiring-soon-role';
    }
    return '';
  }

  viewRoleDetails(role: UserRole): void {
    // This can be extended to open a modal with full role details
    // For now, show tooltip on click is sufficient
  }
}
