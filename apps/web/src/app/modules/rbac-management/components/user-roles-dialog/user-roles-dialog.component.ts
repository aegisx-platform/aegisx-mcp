import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
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
import { UserRole } from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';

export interface UserRolesDialogData {
  userId: string;
  userName: string;
}

@Component({
  selector: 'app-user-roles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="user-roles-dialog">
      <div
        mat-dialog-title
        class="flex items-center justify-between pb-4 border-b"
      >
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl text-blue-600">person</mat-icon>
          <div>
            <h2 class="text-xl font-semibold m-0">User Roles</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 m-0">
              {{ data.userName }}
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

        <!-- User Roles List -->
        <div *ngIf="!isLoading()" class="space-y-4">
          <!-- Active Roles -->
          <div *ngIf="activeRoles().length > 0">
            <h3
              class="text-lg font-medium mb-3 text-green-700 dark:text-green-400"
            >
              Active Roles ({{ activeRoles().length }})
            </h3>
            <div class="space-y-2">
              <mat-card
                *ngFor="let userRole of activeRoles()"
                class="p-4 border-l-4 border-green-500"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="font-medium text-lg">
                        {{ userRole.role.name }}
                      </h4>
                      <mat-chip
                        *ngIf="userRole.role.is_system_role"
                        class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !text-xs"
                      >
                        System
                      </mat-chip>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {{ userRole.role.description || userRole.role.category }}
                    </p>
                    <div class="flex flex-wrap gap-2 text-sm">
                      <span class="text-gray-500">
                        <mat-icon class="text-sm mr-1">schedule</mat-icon>
                        Assigned: {{ formatDate(userRole.assigned_at) }}
                      </span>
                      <span
                        *ngIf="userRole.expires_at"
                        class="text-orange-600 dark:text-orange-400"
                      >
                        <mat-icon class="text-sm mr-1">access_time</mat-icon>
                        Expires: {{ formatDate(userRole.expires_at) }}
                      </span>
                      <span
                        *ngIf="!userRole.expires_at"
                        class="text-green-600 dark:text-green-400"
                      >
                        <mat-icon class="text-sm mr-1">check_circle</mat-icon>
                        No Expiry
                      </span>
                    </div>
                  </div>
                  <mat-chip
                    class="!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200"
                  >
                    Active
                  </mat-chip>
                </div>
              </mat-card>
            </div>
          </div>

          <!-- Inactive Roles -->
          <div *ngIf="inactiveRoles().length > 0" class="mt-6">
            <h3 class="text-lg font-medium mb-3 text-red-700 dark:text-red-400">
              Inactive Roles ({{ inactiveRoles().length }})
            </h3>
            <div class="space-y-2">
              <mat-card
                *ngFor="let userRole of inactiveRoles()"
                class="p-4 border-l-4 border-red-500 opacity-75"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="font-medium text-lg">
                        {{ userRole.role.name }}
                      </h4>
                      <mat-chip
                        *ngIf="userRole.role.is_system_role"
                        class="!bg-gray-100 !text-gray-600 dark:!bg-gray-800 dark:!text-gray-400 !text-xs"
                      >
                        System
                      </mat-chip>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {{ userRole.role.description || userRole.role.category }}
                    </p>
                    <div class="flex flex-wrap gap-2 text-sm">
                      <span class="text-gray-500">
                        <mat-icon class="text-sm mr-1">schedule</mat-icon>
                        Assigned: {{ formatDate(userRole.assigned_at) }}
                      </span>
                      <span
                        *ngIf="userRole.expires_at"
                        class="text-red-600 dark:text-red-400"
                      >
                        <mat-icon class="text-sm mr-1">access_time</mat-icon>
                        Expired: {{ formatDate(userRole.expires_at) }}
                      </span>
                    </div>
                  </div>
                  <mat-chip
                    class="!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200"
                  >
                    Inactive
                  </mat-chip>
                </div>
              </mat-card>
            </div>
          </div>

          <!-- No Roles Message -->
          <div
            *ngIf="userRoles().length === 0"
            class="text-center py-8 text-gray-500"
          >
            <mat-icon class="text-4xl mb-2 opacity-50">assignment_ind</mat-icon>
            <p class="text-lg">No roles assigned to this user</p>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">Close</button>
        <button
          mat-raised-button
          color="primary"
          (click)="onManageRoles()"
          [disabled]="isLoading()"
        >
          <mat-icon>settings</mat-icon>
          Manage Roles
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .user-roles-dialog {
        min-width: 500px;
        max-width: 700px;
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
      }

      mat-icon.text-sm {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      mat-dialog-content {
        padding: 0 24px;
      }
    `,
  ],
})
export class UserRolesDialogComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly userRoles = signal<UserRole[]>([]);

  constructor(
    private dialogRef: MatDialogRef<UserRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserRolesDialogData,
    private rbacService: RbacService,
    private snackBar: MatSnackBar,
  ) {}

  // Computed properties
  readonly activeRoles = () =>
    this.userRoles().filter((ur) => ur.is_active && !this.isExpired(ur));

  readonly inactiveRoles = () =>
    this.userRoles().filter((ur) => !ur.is_active || this.isExpired(ur));

  ngOnInit(): void {
    this.loadUserRoles();
  }

  private async loadUserRoles(): Promise<void> {
    try {
      this.isLoading.set(true);

      const response = await this.rbacService
        .getUserRoles({
          user_id: this.data.userId,
          include_role: true,
          limit: 1000,
        })
        .toPromise();

      if (response) {
        this.userRoles.set(response.data);
      }
    } catch (error) {
      this.snackBar.open('Failed to load user roles', 'Close', {
        duration: 3000,
      });
      console.error('Failed to load user roles:', error);
    } finally {
      this.isLoading.set(false);
    }
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

  onClose(): void {
    this.dialogRef.close();
  }

  onManageRoles(): void {
    // Close dialog and emit userId for parent to handle role management
    this.dialogRef.close({ action: 'manage', userId: this.data.userId });
  }
}
