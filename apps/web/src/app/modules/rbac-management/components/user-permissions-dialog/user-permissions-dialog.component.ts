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
import { Permission, Role, UserRole } from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';

export interface UserPermissionsDialogData {
  userId: string;
  userName: string;
  userRole?: UserRole; // If viewing permissions for specific role assignment
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
  selector: 'app-user-permissions-dialog',
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
  ],
  template: `
    <div class="user-permissions-dialog">
      <div
        mat-dialog-title
        class="flex items-center justify-between pb-4 border-b"
      >
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl text-purple-600">security</mat-icon>
          <div>
            <h2 class="text-xl font-semibold m-0">
              {{ data.userRole ? 'Role' : 'User' }} Permissions
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 m-0">
              {{ data.userName }}
              <span *ngIf="data.userRole" class="ml-1">
                ({{ data.userRole.role.name }})
              </span>
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="max-h-96 overflow-y-auto">
        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex justify-center items-center py-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!isLoading()">
          <mat-tab-group>
            <!-- By Resource Tab -->
            <mat-tab label="By Resource">
              <div class="py-4">
                <div *ngIf="permissionGroups().length > 0" class="space-y-4">
                  <mat-card
                    *ngFor="let group of permissionGroups()"
                    class="p-4"
                  >
                    <div class="flex items-center gap-2 mb-3">
                      <mat-icon class="text-blue-600">folder</mat-icon>
                      <h3 class="text-lg font-medium m-0">
                        {{ group.resource }}
                      </h3>
                      <mat-chip
                        class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !text-xs"
                      >
                        {{ group.permissions.length }} permissions
                      </mat-chip>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div
                        *ngFor="let permission of group.permissions"
                        class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div class="flex items-center gap-2">
                          <mat-icon class="text-green-600 text-sm"
                            >check_circle</mat-icon
                          >
                          <span class="font-medium">{{
                            permission.action
                          }}</span>
                        </div>
                        <mat-chip
                          class="!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200 !text-xs"
                        >
                          {{ permission.roleName }}
                        </mat-chip>
                      </div>
                    </div>
                  </mat-card>
                </div>

                <!-- No Permissions Message -->
                <div
                  *ngIf="permissionGroups().length === 0"
                  class="text-center py-8 text-gray-500"
                >
                  <mat-icon class="text-4xl mb-2 opacity-50">security</mat-icon>
                  <p class="text-lg">No permissions found</p>
                  <p class="text-sm">
                    {{
                      data.userRole
                        ? 'This role has no permissions assigned'
                        : 'This user has no active roles with permissions'
                    }}
                  </p>
                </div>
              </div>
            </mat-tab>

            <!-- By Role Tab -->
            <mat-tab label="By Role" *ngIf="!data.userRole">
              <div class="py-4">
                <div *ngIf="rolePermissions().length > 0" class="space-y-4">
                  <mat-card *ngFor="let role of rolePermissions()" class="p-4">
                    <div class="flex items-center gap-2 mb-3">
                      <mat-icon class="text-purple-600"
                        >account_circle</mat-icon
                      >
                      <h3 class="text-lg font-medium m-0">{{ role.name }}</h3>
                      <mat-chip
                        *ngIf="role.is_system_role"
                        class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !text-xs"
                      >
                        System
                      </mat-chip>
                      <mat-chip
                        class="!bg-purple-100 !text-purple-800 dark:!bg-purple-900 dark:!text-purple-200 !text-xs"
                      >
                        {{ role.permissions?.length || 0 }} permissions
                      </mat-chip>
                    </div>

                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {{ role.description || role.category }}
                    </p>

                    <div
                      *ngIf="role.permissions && role.permissions.length > 0"
                      class="space-y-2"
                    >
                      <div
                        *ngFor="let permission of role.permissions"
                        class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <mat-icon class="text-green-600 text-sm"
                          >check_circle</mat-icon
                        >
                        <span class="font-medium">{{
                          permission.resource
                        }}</span>
                        <span class="text-gray-600">•</span>
                        <span>{{ permission.action }}</span>
                      </div>
                    </div>

                    <div
                      *ngIf="!role.permissions || role.permissions.length === 0"
                      class="text-center py-4 text-gray-500"
                    >
                      <mat-icon class="text-2xl mb-1 opacity-50">info</mat-icon>
                      <p class="text-sm">
                        No permissions assigned to this role
                      </p>
                    </div>
                  </mat-card>
                </div>
              </div>
            </mat-tab>

            <!-- Summary Tab -->
            <mat-tab label="Summary">
              <div class="py-4 space-y-4">
                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <mat-card class="p-4 text-center">
                    <div class="text-2xl font-bold text-blue-600 mb-1">
                      {{ totalPermissions() }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      Total Permissions
                    </div>
                  </mat-card>

                  <mat-card class="p-4 text-center">
                    <div class="text-2xl font-bold text-green-600 mb-1">
                      {{ uniqueResources() }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      Resources
                    </div>
                  </mat-card>

                  <mat-card class="p-4 text-center">
                    <div class="text-2xl font-bold text-purple-600 mb-1">
                      {{ data.userRole ? 1 : activeRolesCount() }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ data.userRole ? 'Role' : 'Active Roles' }}
                    </div>
                  </mat-card>
                </div>

                <!-- Resource Breakdown -->
                <mat-card class="p-4">
                  <h3 class="text-lg font-medium mb-3">Resource Access</h3>
                  <div class="space-y-2">
                    <div
                      *ngFor="let group of permissionGroups()"
                      class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-blue-600 text-sm"
                          >folder</mat-icon
                        >
                        <span class="font-medium">{{ group.resource }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <mat-chip
                          class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !text-xs"
                        >
                          {{ group.permissions.length }} actions
                        </mat-chip>
                        <div class="flex -space-x-1">
                          <mat-chip
                            *ngFor="
                              let action of getUniqueActions(group.permissions)
                            "
                            class="!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200 !text-xs ml-1"
                          >
                            {{ action }}
                          </mat-chip>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">Close</button>
        <button
          mat-raised-button
          color="primary"
          (click)="onExportPermissions()"
          [disabled]="isLoading() || totalPermissions() === 0"
        >
          <mat-icon>download</mat-icon>
          Export
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .user-permissions-dialog {
        min-width: 600px;
        max-width: 900px;
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

      mat-dialog-content {
        padding: 0 24px;
      }

      ::ng-deep .mat-mdc-tab-body-wrapper {
        padding: 0;
      }
    `,
  ],
})
export class UserPermissionsDialogComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly userRoles = signal<UserRole[]>([]);
  readonly effectivePermissions = signal<EffectivePermission[]>([]);

  constructor(
    private dialogRef: MatDialogRef<UserPermissionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserPermissionsDialogData,
    private rbacService: RbacService,
    private snackBar: MatSnackBar,
  ) {}

  // Computed properties
  readonly permissionGroups = computed<PermissionGroup[]>(() => {
    const permissions = this.effectivePermissions();
    const groups: Record<string, EffectivePermission[]> = {};

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
        ),
      }));
  });

  readonly rolePermissions = computed<Role[]>(() => {
    return this.userRoles()
      .filter((ur) => ur.is_active)
      .map((ur) => ur.role)
      .filter(
        (role, index, arr) => arr.findIndex((r) => r.id === role.id) === index,
      );
  });

  readonly totalPermissions = computed(
    () => this.effectivePermissions().length,
  );
  readonly uniqueResources = computed(() => this.permissionGroups().length);
  readonly activeRolesCount = computed(() => this.rolePermissions().length);

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      this.isLoading.set(true);

      if (this.data.userRole) {
        // Load permissions for specific role
        await this.loadRolePermissions(this.data.userRole.role);
      } else {
        // Load all user roles and their permissions
        await this.loadUserRolesAndPermissions();
      }
    } catch (error) {
      this.snackBar.open('Failed to load permissions', 'Close', {
        duration: 3000,
      });
      console.error('Failed to load permissions:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadRolePermissions(role: Role): Promise<void> {
    const response = await this.rbacService
      .getRolePermissions(role.id)
      .toPromise();

    if (response) {
      const effectivePermissions: EffectivePermission[] = response.data.map(
        (permission) => ({
          ...permission,
          source: 'role' as const,
          roleName: role.name,
          roleId: role.id,
        }),
      );
      this.effectivePermissions.set(effectivePermissions);
    }
  }

  private async loadUserRolesAndPermissions(): Promise<void> {
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
        .filter((ur) => ur.is_active)
        .map((ur) => ur.role);

      const allPermissions: EffectivePermission[] = [];

      for (const role of activeRoles) {
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

          // Also update the role with its permissions for the "By Role" tab
          role.permissions = permissionsResponse.data;
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
  }

  getUniqueActions(permissions: EffectivePermission[]): string[] {
    return [...new Set(permissions.map((p) => p.action))].sort();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onExportPermissions(): void {
    const data = {
      user: this.data.userName,
      role: this.data.userRole?.role.name,
      permissions: this.effectivePermissions().map((p) => ({
        resource: p.resource,
        action: p.action,
        source: p.roleName,
      })),
      summary: {
        totalPermissions: this.totalPermissions(),
        uniqueResources: this.uniqueResources(),
        activeRoles: this.activeRolesCount(),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-${this.data.userName.replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Permissions exported successfully', 'Close', {
      duration: 3000,
    });
  }
}
