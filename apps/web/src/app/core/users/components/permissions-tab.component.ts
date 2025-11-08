import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AegisxCardComponent } from '@aegisx/ui';
import { UserService } from '../services/user.service';
import { RoleAssignmentDialogComponent } from './role-assignment-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/ui/components/confirm-dialog.component';

export interface UserRole {
  id: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy?: string;
  expiresAt?: string | null;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
}

@Component({
  selector: 'ax-permissions-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    AegisxCardComponent,
  ],
  template: `
    <div class="mt-6">
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>
      } @else if (error()) {
        <ax-card [appearance]="'elevated'">
          <div class="text-center py-8">
            <mat-icon class="text-4xl text-red-500">error_outline</mat-icon>
            <p class="mt-2 text-red-600">{{ error() }}</p>
            <button
              mat-raised-button
              color="primary"
              (click)="loadUserRoles()"
              class="mt-4"
            >
              <mat-icon>refresh</mat-icon>
              <span>Retry</span>
            </button>
          </div>
        </ax-card>
      } @else if (userRoles().length === 0) {
        <ax-card [appearance]="'elevated'">
          <div class="text-center py-8 text-gray-500">
            <mat-icon class="text-4xl">security</mat-icon>
            <p class="mt-2">No roles assigned yet</p>
            <button
              mat-raised-button
              color="primary"
              (click)="openAssignRolesDialog()"
              class="mt-4"
            >
              <mat-icon>add</mat-icon>
              <span>Assign Roles</span>
            </button>
          </div>
        </ax-card>
      } @else {
        <ax-card [appearance]="'elevated'">
          <!-- Header with Assign Roles Button -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold">User Roles</h3>
            <button
              mat-raised-button
              color="primary"
              (click)="openAssignRolesDialog()"
              [disabled]="operationLoading()"
            >
              <mat-icon>add</mat-icon>
              <span>Assign Roles</span>
            </button>
          </div>

          <!-- Roles Table -->
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="userRoles()" class="w-full">
              <!-- Role Name Column -->
              <ng-container matColumnDef="roleName">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Role Name
                </th>
                <td mat-cell *matCellDef="let element" class="font-medium">
                  {{ element.roleName }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Status
                </th>
                <td mat-cell *matCellDef="let element">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-800': element.isActive,
                      'bg-gray-100 text-gray-800': !element.isActive,
                    }"
                  >
                    {{ element.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>

              <!-- Assigned At Column -->
              <ng-container matColumnDef="assignedAt">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Assigned At
                </th>
                <td mat-cell *matCellDef="let element">
                  {{ formatDate(element.assignedAt) }}
                </td>
              </ng-container>

              <!-- Expires At Column -->
              <ng-container matColumnDef="expiresAt">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Expires At
                </th>
                <td mat-cell *matCellDef="let element">
                  @if (element.expiresAt) {
                    <span
                      [ngClass]="{
                        'text-red-600 dark:text-red-400': isExpired(
                          element.expiresAt
                        ),
                        'text-gray-600 dark:text-gray-400': !isExpired(
                          element.expiresAt
                        ),
                      }"
                    >
                      {{ formatDate(element.expiresAt) }}
                      @if (isExpired(element.expiresAt)) {
                        <span
                          class="text-xs text-red-600 dark:text-red-400 ml-2"
                          >(Expired)</span
                        >
                      }
                    </span>
                  } @else {
                    <span class="text-gray-400">No expiry</span>
                  }
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Actions
                </th>
                <td mat-cell *matCellDef="let element" class="space-x-2">
                  <button
                    mat-icon-button
                    (click)="openSetExpiryDialog(element)"
                    [disabled]="operationLoading()"
                    matTooltip="Set expiry date"
                  >
                    <mat-icon>schedule</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="removeRole(element)"
                    [disabled]="operationLoading()"
                    matTooltip="Remove role"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
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

      table {
        background: transparent;
      }

      th {
        background-color: transparent;
        color: rgb(55 65 81);
        font-weight: 600;
        border-bottom: 2px solid rgb(229 231 235);
        padding: 16px;
      }

      td {
        padding: 16px;
        border-bottom: 1px solid rgb(229 231 235);
      }

      tr:hover {
        background-color: rgb(249 250 251);
      }

      button {
        margin: 0 4px;
      }

      :host-context(.dark) {
        th {
          color: rgb(209 213 219);
          border-bottom-color: rgb(55 65 81);
        }

        td {
          border-bottom-color: rgb(55 65 81);
        }

        tr:hover {
          background-color: rgb(31 41 55);
        }
      }
    `,
  ],
})
export class PermissionsTabComponent implements OnInit {
  @Input() userId!: string;

  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  userRoles = signal<UserRole[]>([]);
  loading = signal(false);
  operationLoading = signal(false);
  error = signal<string | null>(null);

  displayedColumns = [
    'roleName',
    'status',
    'assignedAt',
    'expiresAt',
    'actions',
  ];

  ngOnInit() {
    this.loadUserRoles();
  }

  async loadUserRoles() {
    if (!this.userId) {
      this.error.set('User ID is required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await this.userService.getUserRoles(this.userId);

      if (response && response.data) {
        this.userRoles.set(response.data || []);
      } else {
        this.userRoles.set([]);
      }
    } catch (err: any) {
      console.error('Failed to load user roles:', err);
      this.error.set(
        err.message || 'Failed to load user roles. Please try again.',
      );
      this.userRoles.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openAssignRolesDialog(): void {
    const dialogRef = this.dialog.open(RoleAssignmentDialogComponent, {
      width: '600px',
      data: {
        userId: this.userId,
        currentRoleIds: this.userRoles().map((r) => r.roleId),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUserRoles();
      }
    });
  }

  openSetExpiryDialog(role: UserRole): void {
    const dialogRef = this.dialog.open(RoleSetExpiryDialogComponent, {
      width: '400px',
      data: {
        role,
        userId: this.userId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUserRoles();
      }
    });
  }

  async removeRole(role: UserRole): Promise<void> {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Remove Role',
        message: `Are you sure you want to remove the "${role.roleName}" role from this user?`,
        confirmText: 'Remove',
        confirmColor: 'warn',
      },
    });

    confirmRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        this.operationLoading.set(true);

        try {
          await this.userService.removeRoleFromUser(this.userId, {
            roleId: role.roleId,
          });

          this.snackBar.open('Role removed successfully', 'Close', {
            duration: 3000,
          });

          this.loadUserRoles();
        } catch (error: any) {
          console.error('Failed to remove role:', error);
          this.snackBar.open('Failed to remove role', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        } finally {
          this.operationLoading.set(false);
        }
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  isExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }
}

// ============================================================================
// ROLE ASSIGNMENT DIALOG COMPONENT
// ============================================================================

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'ax-role-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Assign Roles to User</h2>

    <mat-dialog-content>
      @if (loadingRoles()) {
        <div class="flex items-center justify-center h-40">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>
      } @else if (errorLoading()) {
        <div class="text-center py-8">
          <p class="text-red-600 mb-4">{{ errorLoading() }}</p>
          <button mat-raised-button (click)="loadAvailableRoles()">
            <mat-icon>refresh</mat-icon>
            <span>Retry</span>
          </button>
        </div>
      } @else {
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Select roles to assign to this user
          </p>

          @if (availableRoles().length === 0) {
            <p class="text-center text-gray-500">No roles available</p>
          } @else {
            <div class="space-y-3 max-h-80 overflow-y-auto">
              @for (role of availableRoles(); track role.id) {
                <div
                  class="flex items-center border rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <mat-checkbox
                    [checked]="isRoleSelected(role.id)"
                    (change)="toggleRole(role.id)"
                    class="mr-3"
                  ></mat-checkbox>
                  <div class="flex-1">
                    <p class="font-medium">{{ role.name }}</p>
                    @if (role.description) {
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ role.description }}
                      </p>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onAssign()"
        [disabled]="
          assignLoading() || selectedRoles().length === 0 || loadingRoles()
        "
      >
        @if (assignLoading()) {
          <mat-spinner [diameter]="20" class="mr-2"></mat-spinner>
        } @else {
          <mat-icon>add</mat-icon>
        }
        <span>Assign</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        min-width: 400px;
      }

      mat-dialog-actions {
        padding: 16px 0 0 0;
      }

      mat-spinner {
        display: inline-block;
      }
    `,
  ],
})
export class RoleAssignmentDialogComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<RoleAssignmentDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);

  availableRoles = signal<Role[]>([]);
  selectedRoles = signal<string[]>([]);
  loadingRoles = signal(false);
  errorLoading = signal<string | null>(null);
  assignLoading = signal(false);

  ngOnInit() {
    this.loadAvailableRoles();
  }

  async loadAvailableRoles() {
    this.loadingRoles.set(true);
    this.errorLoading.set(null);

    try {
      const response = await this.userService.getAllRoles();
      if (response && response.data) {
        this.availableRoles.set(response.data);
      } else {
        this.availableRoles.set([]);
      }
    } catch (err: any) {
      console.error('Failed to load roles:', err);
      this.errorLoading.set(err.message || 'Failed to load available roles');
    } finally {
      this.loadingRoles.set(false);
    }
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoles().includes(roleId);
  }

  toggleRole(roleId: string) {
    const selected = this.selectedRoles();
    const index = selected.indexOf(roleId);

    if (index > -1) {
      this.selectedRoles.set(selected.filter((id) => id !== roleId));
    } else {
      this.selectedRoles.set([...selected, roleId]);
    }
  }

  async onAssign() {
    if (this.selectedRoles().length === 0) return;

    this.assignLoading.set(true);

    try {
      await this.userService.assignRolesToUser(this.data.userId, {
        roleIds: this.selectedRoles(),
      });

      this.snackBar.open('Roles assigned successfully', 'Close', {
        duration: 3000,
      });

      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('Failed to assign roles:', error);
      this.snackBar.open('Failed to assign roles', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.assignLoading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}

// ============================================================================
// ROLE SET EXPIRY DIALOG COMPONENT
// ============================================================================

import { MatDatepickerIntl } from '@angular/material/datepicker';

@Component({
  selector: 'ax-role-set-expiry-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Set Role Expiry Date</h2>

    <mat-dialog-content>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Set an expiry date for the
          <strong>{{ data.role.roleName }}</strong> role
        </p>

        <mat-form-field class="w-full">
          <mat-label>Expiry Date</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            [(ngModel)]="selectedDate"
            [min]="today"
            placeholder="Choose a date"
          />
          <mat-datepicker-toggle
            matIconSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        @if (selectedDate) {
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Role will expire on
            <strong>{{ selectedDate | date: 'MMM d, y' }}</strong>
          </p>
        }
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSetExpiry()"
        [disabled]="!selectedDate || loading()"
      >
        @if (loading()) {
          <mat-spinner [diameter]="20" class="mr-2"></mat-spinner>
        } @else {
          <mat-icon>schedule</mat-icon>
        }
        <span>Set Expiry</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        min-width: 400px;
      }

      mat-dialog-actions {
        padding: 16px 0 0 0;
      }

      mat-form-field {
        margin-top: 16px;
      }
    `,
  ],
})
export class RoleSetExpiryDialogComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<RoleSetExpiryDialogComponent>);

  data = inject(MAT_DIALOG_DATA);

  selectedDate: Date | null = null;
  loading = signal(false);
  today = new Date();

  ngOnInit() {
    // Initialize with current expiry date if set
    if (this.data.role.expiresAt) {
      this.selectedDate = new Date(this.data.role.expiresAt);
    }
  }

  async onSetExpiry() {
    if (!this.selectedDate) return;

    this.loading.set(true);

    try {
      await this.userService.updateRoleExpiry(this.data.userId, {
        roleId: this.data.role.roleId,
        expiresAt: this.selectedDate.toISOString(),
      });

      this.snackBar.open('Role expiry date updated successfully', 'Close', {
        duration: 3000,
      });

      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('Failed to update role expiry:', error);
      this.snackBar.open('Failed to update role expiry date', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
