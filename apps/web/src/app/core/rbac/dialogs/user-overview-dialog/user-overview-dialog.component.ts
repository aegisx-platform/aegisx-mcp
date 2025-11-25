import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import {
  Permission,
  Role,
  UserRole,
  getPermissionName,
} from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';

export interface UserOverviewDialogData {
  userId: string;
  userName: string;
}

interface EffectivePermission extends Permission {
  source: 'role';
  roleName: string;
  roleId: string;
}

interface PermissionGroup {
  resource: string;
  permissions: EffectivePermission[];
}

@Component({
  selector: 'app-user-overview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
  ],
  template: `
    <div class="user-overview-dialog">
      <h2
        mat-dialog-title
        class="flex items-center gap-3 text-xl font-semibold"
      >
        <mat-icon class="text-brand">account_circle</mat-icon>
        <div>
          <div>User Access Overview</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 font-normal">
            {{ data.userName }}
          </div>
        </div>
      </h2>

      <mat-dialog-content class="max-h-[80vh] overflow-y-auto">
        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex justify-center items-center py-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <!-- Content -->
        <div *ngIf="!isLoading()">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div
              class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center"
            >
              <div class="text-2xl font-bold text-blue-600 mb-1">
                {{ activeRoles().length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Active Roles
              </div>
            </div>

            <div
              class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center"
            >
              <div class="text-2xl font-bold text-green-600 mb-1">
                {{ totalPermissions() }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Permissions
              </div>
            </div>

            <div
              class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center"
            >
              <div class="text-2xl font-bold text-purple-600 mb-1">
                {{ uniqueResources() }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Resources
              </div>
            </div>

            <div
              class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center"
            >
              <div class="text-2xl font-bold text-orange-600 mb-1">
                {{ expiringRoles() }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Expiring Soon
              </div>
            </div>
          </div>

          <!-- Combined View -->
          <div class="space-y-6">
            <div
              *ngFor="let role of activeRoles()"
              class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <!-- Role Header -->
              <div
                class="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <div
                        class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"
                      >
                        <mat-icon class="text-blue-600 text-xl"
                          >shield</mat-icon
                        >
                      </div>
                      <div>
                        <h3
                          class="text-lg font-semibold text-gray-900 dark:text-white"
                        >
                          {{ role.role.name }}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          {{ role.role.description || role.role.category }}
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <mat-chip
                          *ngIf="role.role.is_system_role"
                          class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !text-xs"
                        >
                          System Role
                        </mat-chip>
                        <mat-chip
                          [class]="getRoleStatusClass(role)"
                          class="!text-xs"
                        >
                          {{ getRoleStatusText(role) }}
                        </mat-chip>
                      </div>
                    </div>

                    <!-- Role Details -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-gray-500 text-base"
                          >schedule</mat-icon
                        >
                        <span class="text-gray-600 dark:text-gray-400">
                          Assigned: {{ formatDate(role.assigned_at) }}
                        </span>
                      </div>

                      <div class="flex items-center gap-2">
                        <mat-icon class="text-gray-500 text-base">
                          {{
                            role.expires_at ? 'access_time' : 'all_inclusive'
                          }}
                        </mat-icon>
                        <span class="text-gray-600 dark:text-gray-400">
                          {{
                            role.expires_at
                              ? 'Expires: ' + formatDate(role.expires_at)
                              : 'No Expiry'
                          }}
                        </span>
                      </div>

                      <div class="flex items-center gap-2">
                        <mat-icon class="text-gray-500 text-base"
                          >admin_panel_settings</mat-icon
                        >
                        <span class="text-gray-600 dark:text-gray-400">
                          {{ role.assigned_by || 'System' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Role Permissions -->
              <div class="p-6">
                <div class="flex items-center gap-2 mb-4">
                  <mat-icon class="text-purple-600 text-base"
                    >security</mat-icon
                  >
                  <h4 class="text-md font-medium text-gray-900 dark:text-white">
                    Permissions ({{ getRolePermissions(role.role).length }})
                  </h4>
                </div>

                <div
                  *ngIf="getRolePermissions(role.role).length > 0"
                  class="space-y-3"
                >
                  <!-- Group by Resource -->
                  <div
                    *ngFor="let group of getPermissionGroups(role.role)"
                    class="border border-gray-100 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div class="flex items-center gap-2 mb-3">
                      <mat-icon class="text-indigo-600 text-base"
                        >folder</mat-icon
                      >
                      <h5 class="font-medium text-gray-900 dark:text-white">
                        {{ group.resource }}
                      </h5>
                      <mat-chip
                        class="!bg-indigo-100 !text-indigo-800 dark:!bg-indigo-900 dark:!text-indigo-200 !text-xs"
                      >
                        {{ group.permissions.length }} actions
                      </mat-chip>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div
                        *ngFor="let permission of group.permissions"
                        class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                      >
                        <mat-icon class="text-green-600 text-sm"
                          >check_circle</mat-icon
                        >
                        <span class="text-sm font-medium">{{
                          permission.action
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  *ngIf="getRolePermissions(role.role).length === 0"
                  class="text-center py-8 text-gray-500"
                >
                  <mat-icon class="text-4xl mb-2 opacity-50">info</mat-icon>
                  <p class="text-sm">This role has no permissions assigned</p>
                </div>
              </div>
            </div>

            <!-- No Active Roles -->
            <div
              *ngIf="activeRoles().length === 0"
              class="text-center py-12 text-gray-500"
            >
              <mat-icon class="text-6xl mb-4 opacity-50">person_off</mat-icon>
              <h3 class="text-lg font-medium mb-2">No Active Roles</h3>
              <p class="text-center mb-4">
                This user has no active role assignments
              </p>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <div mat-dialog-actions align="end" class="flex gap-2">
        <button mat-button (click)="onClose()">Close</button>
        <button
          mat-flat-button
          color="primary"
          (click)="onManageRoles()"
          [disabled]="isLoading()"
        >
          <mat-icon>settings</mat-icon>
          Manage Access
        </button>
        <button
          mat-flat-button
          color="accent"
          (click)="onExportOverview()"
          [disabled]="isLoading()"
        >
          <mat-icon>download</mat-icon>
          Export
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .user-overview-dialog {
        min-width: 800px;
        max-width: 1200px;
      }

      mat-card {
        border-radius: 8px;
        transition: box-shadow 0.2s ease-in-out;
      }

      mat-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .mat-mdc-chip {
        font-size: 11px;
        min-height: 20px;
        margin: 2px;
      }

      mat-icon.text-sm {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      mat-icon.text-base {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      mat-dialog-content {
        padding: 0 24px;
      }

      .role-card {
        transition: transform 0.2s ease-in-out;
      }

      .role-card:hover {
        transform: translateY(-2px);
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
export class UserOverviewDialogComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly userRoles = signal<UserRole[]>([]);
  readonly effectivePermissions = signal<EffectivePermission[]>([]);

  constructor(
    private dialogRef: MatDialogRef<UserOverviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserOverviewDialogData,
    private rbacService: RbacService,
    private snackBar: MatSnackBar,
  ) {}

  // Computed properties
  readonly activeRoles = computed<UserRole[]>(() =>
    this.userRoles().filter((ur) => ur.is_active && !this.isExpired(ur)),
  );

  readonly totalPermissions = computed(
    () => this.effectivePermissions().length,
  );

  readonly uniqueResources = computed(() => {
    const resources = new Set(
      this.effectivePermissions().map((p) => p.resource),
    );
    return resources.size;
  });

  readonly expiringRoles = computed(
    () => this.userRoles().filter((ur) => this.isExpiringSoon(ur)).length,
  );

  ngOnInit(): void {
    this.loadUserData();
  }

  private async loadUserData(): Promise<void> {
    try {
      this.isLoading.set(true);

      // Load user roles
      const rolesResponse = await this.rbacService
        .getUserRoles({
          user_id: this.data.userId,
          include_role: true,
          limit: 1000,
        })
        .toPromise();

      if (rolesResponse) {
        this.userRoles.set(rolesResponse.data);

        // Load permissions for each active role
        const activeRoles = rolesResponse.data
          .filter((ur) => ur.is_active && !this.isExpired(ur))
          .map((ur) => ur.role);

        const allPermissions: EffectivePermission[] = [];

        for (const role of activeRoles) {
          try {
            const permissionsResponse = await this.rbacService
              .getRolePermissions(role.id)
              .toPromise();

            if (permissionsResponse) {
              const rolePermissions: EffectivePermission[] =
                permissionsResponse.data.map((permission) => ({
                  ...permission,
                  source: 'role' as const,
                  roleName: role.name,
                  roleId: role.id,
                }));
              allPermissions.push(...rolePermissions);

              // Also update the role with its permissions for display
              role.permissions = permissionsResponse.data;
            }
          } catch (error) {
            console.warn(
              `Failed to load permissions for role ${role.name}:`,
              error,
            );
            role.permissions = [];
          }
        }

        // Remove duplicates based on resource + action combination
        const uniquePermissions = allPermissions.filter(
          (permission, index, arr) =>
            arr.findIndex(
              (p) =>
                p.resource === permission.resource &&
                p.action === permission.action,
            ) === index,
        );

        this.effectivePermissions.set(uniquePermissions);
      }
    } catch (error) {
      this.snackBar.open('Failed to load user data', 'Close', {
        duration: 3000,
      });
      console.error('Failed to load user data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getRolePermissions(role: Role): Permission[] {
    return role.permissions || [];
  }

  getPermissionGroups(role: Role): PermissionGroup[] {
    const permissions = this.getRolePermissions(role);
    const groups: Record<string, Permission[]> = {};

    permissions.forEach((permission) => {
      if (!groups[permission.resource]) {
        groups[permission.resource] = [];
      }
      groups[permission.resource].push(permission);
    });

    return Object.keys(groups)
      .sort()
      .map((resource) => ({
        resource,
        permissions: groups[resource].sort((a, b) =>
          a.action.localeCompare(b.action),
        ) as EffectivePermission[],
      }));
  }

  getRoleStatusText(userRole: UserRole): string {
    if (!userRole.is_active) return 'Inactive';
    if (this.isExpired(userRole)) return 'Expired';
    if (this.isExpiringSoon(userRole)) return 'Expiring Soon';
    return 'Active';
  }

  getRoleStatusClass(userRole: UserRole): string {
    if (!userRole.is_active || this.isExpired(userRole)) {
      return '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200';
    }
    if (this.isExpiringSoon(userRole)) {
      return '!bg-orange-100 !text-orange-800 dark:!bg-orange-900 dark:!text-orange-200';
    }
    return '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  isExpired(userRole: UserRole): boolean {
    if (!userRole.expires_at) return false;
    return new Date(userRole.expires_at) < new Date();
  }

  isExpiringSoon(userRole: UserRole): boolean {
    if (!userRole.expires_at) return false;
    const expiryDate = new Date(userRole.expires_at);
    const now = new Date();
    const diffDays = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 7 && diffDays > 0;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onManageRoles(): void {
    // Close dialog and emit userId for parent to handle
    this.dialogRef.close({ action: 'manage', userId: this.data.userId });
  }

  onExportOverview(): void {
    const overview = {
      user: this.data.userName,
      summary: {
        activeRoles: this.activeRoles().length,
        totalPermissions: this.totalPermissions(),
        uniqueResources: this.uniqueResources(),
        expiringRoles: this.expiringRoles(),
      },
      roles: this.activeRoles().map((userRole) => ({
        name: userRole.role.name,
        description: userRole.role.description,
        category: userRole.role.category,
        isSystemRole: userRole.role.is_system_role,
        assignedAt: userRole.assigned_at,
        expiresAt: userRole.expires_at,
        assignedBy: userRole.assigned_by,
        status: this.getRoleStatusText(userRole),
        permissions: this.getRolePermissions(userRole.role).map((p) => ({
          name: getPermissionName(p),
          resource: p.resource,
          action: p.action,
          description: p.description,
        })),
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(overview, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-overview-${this.data.userName.replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.snackBar.open('User overview exported successfully', 'Close', {
      duration: 3000,
    });
  }
}
