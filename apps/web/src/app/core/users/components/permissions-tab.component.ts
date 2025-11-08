import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { AegisxCardComponent } from '@aegisx/ui';
import { UserService } from '../services/user.service';

export interface UserRole {
  id: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface AvailableRole {
  id: string;
  name: string;
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
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    FormsModule,
    AegisxCardComponent,
  ],
  template: `
    <ax-card [appearance]="'elevated'" class="mt-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Assigned Roles</h3>
        <button
          mat-raised-button
          color="primary"
          (click)="openAssignRolesDialog()"
          [disabled]="loading()"
        >
          <mat-icon>add</mat-icon>
          <span>Assign New Role</span>
        </button>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>
      } @else if (roles().length === 0) {
        <div class="text-center py-8">
          <mat-icon class="text-6xl text-gray-400">security</mat-icon>
          <p class="text-gray-600 dark:text-gray-400 mt-4">No roles assigned</p>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="roles()" class="w-full">
            <!-- Role Name Column -->
            <ng-container matColumnDef="roleName">
              <th mat-header-cell>Role</th>
              <td mat-cell *matCellDef="let element">
                <span class="font-medium">{{ element.roleName }}</span>
              </td>
            </ng-container>

            <!-- Assigned Date Column -->
            <ng-container matColumnDef="assignedAt">
              <th mat-header-cell>Assigned At</th>
              <td mat-cell *matCellDef="let element">
                {{ element.assignedAt | date: 'short' }}
              </td>
            </ng-container>

            <!-- Expiry Column -->
            <ng-container matColumnDef="expiresAt">
              <th mat-header-cell>Expires At</th>
              <td mat-cell *matCellDef="let element">
                @if (element.expiresAt) {
                  {{ element.expiresAt | date: 'short' }}
                } @else {
                  <span class="text-gray-400">No expiry</span>
                }
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="isActive">
              <th mat-header-cell>Status</th>
              <td mat-cell *matCellDef="let element">
                @if (element.isActive) {
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    Active
                  </span>
                } @else {
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    Inactive
                  </span>
                }
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell>Actions</th>
              <td mat-cell *matCellDef="let element">
                <button
                  mat-icon-button
                  matTooltip="Remove role"
                  (click)="removeRole(element)"
                  color="warn"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr
              mat-header-row
              *matHeaderRowDef="[
                'roleName',
                'assignedAt',
                'expiresAt',
                'isActive',
                'actions',
              ]"
            ></tr>
            <tr
              mat-row
              *matRowDef="
                let row;
                columns: [
                  'roleName',
                  'assignedAt',
                  'expiresAt',
                  'isActive',
                  'actions',
                ]
              "
            ></tr>
          </table>
        </div>
      }
    </ax-card>
  `,
  styles: [
    `
      table {
        width: 100%;
      }

      th {
        font-weight: 600;
        color: #666;
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }

      td {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
      }

      tr:last-child td {
        border-bottom: none;
      }
    `,
  ],
})
export class PermissionsTabComponent implements OnInit {
  @Input() userId!: string;

  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  roles = signal<UserRole[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadRoles();
  }

  private loadRoles() {
    this.loading.set(true);

    this.userService.getUserRoles(this.userId).then(
      (response: any) => {
        if (Array.isArray(response)) {
          this.roles.set(response);
        } else if (response && Array.isArray(response.data)) {
          this.roles.set(response.data);
        } else {
          this.roles.set([]);
        }
        this.loading.set(false);
      },
      () => {
        this.roles.set([]);
        this.loading.set(false);
      },
    );
  }

  removeRole(role: UserRole) {
    if (confirm(`Remove role "${role.roleName}"?`)) {
      this.userService
        .removeRoleFromUser(this.userId, { roleId: role.roleId })
        .then(
          () => {
            this.snackBar.open('Role removed successfully', 'Close', {
              duration: 3000,
            });
            this.loadRoles();
          },
          () => {
            this.snackBar.open('Failed to remove role', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        );
    }
  }

  openAssignRolesDialog() {
    const dialogRef = this.dialog.open(AssignRolesDialogComponent, {
      width: '500px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((selectedRoleId: string | null) => {
      if (selectedRoleId) {
        this.assignRole(selectedRoleId);
      }
    });
  }

  private assignRole(roleId: string) {
    this.loading.set(true);
    this.userService.assignRolesToUser(this.userId, { roleIds: [roleId] }).then(
      () => {
        this.snackBar.open('Role assigned successfully', 'Close', {
          duration: 3000,
        });
        this.loadRoles();
      },
      () => {
        this.snackBar.open('Failed to assign role', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        this.loading.set(false);
      },
    );
  }
}

@Component({
  selector: 'ax-assign-roles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Assign New Roles</h2>

      @if (loadingRoles()) {
        <div class="flex justify-center py-4">
          <mat-spinner [diameter]="32"></mat-spinner>
        </div>
      } @else {
        <mat-form-field class="w-full">
          <mat-label>Select Role to Assign</mat-label>
          <mat-select [(ngModel)]="selectedRoleId">
            @for (role of availableRoles(); track role.id) {
              <mat-option [value]="role.id">{{ role.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="flex justify-end gap-2 mt-6">
          <button mat-stroked-button (click)="onCancel()">Cancel</button>
          <button
            mat-raised-button
            color="primary"
            (click)="onAssign()"
            [disabled]="!selectedRoleId || assigning()"
          >
            Assign Role
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class AssignRolesDialogComponent {
  availableRoles = signal<AvailableRole[]>([]);
  loadingRoles = signal(false);
  selectedRoleId = '';
  assigning = signal(false);

  constructor(
    public dialogRef: MatDialogRef<AssignRolesDialogComponent>,
    private userService: UserService,
  ) {
    this.loadAvailableRoles();
  }

  private loadAvailableRoles() {
    this.loadingRoles.set(true);
    this.userService.getRoles().then(
      (response: any) => {
        if (Array.isArray(response)) {
          this.availableRoles.set(
            response.map((r: any) => ({ id: r.id, name: r.name })),
          );
        } else if (response && Array.isArray(response.data)) {
          this.availableRoles.set(
            response.data.map((r: any) => ({ id: r.id, name: r.name })),
          );
        }
        this.loadingRoles.set(false);
      },
      () => {
        this.loadingRoles.set(false);
      },
    );
  }

  onAssign() {
    if (this.selectedRoleId) {
      this.dialogRef.close(this.selectedRoleId);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
