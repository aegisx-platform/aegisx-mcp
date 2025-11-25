import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/ui/components/confirm-dialog.component';
import { Role, UserRole } from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';

export interface UserRolesManagementDialogData {
  userId: string;
  userName: string;
  availableRoles: Role[];
}

@Component({
  selector: 'app-user-roles-management-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
  ],
  template: `
    <div class="user-roles-management-dialog">
      <h2
        mat-dialog-title
        class="flex items-center gap-3 text-xl font-semibold"
      >
        <mat-icon class="text-brand">manage_accounts</mat-icon>
        <div>
          <div>Manage User Roles</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 font-normal">
            {{ data.userName }}
          </div>
        </div>
      </h2>

      <mat-dialog-content class="max-h-[600px] overflow-y-auto">
        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex justify-center items-center py-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!isLoading()" class="space-y-6">
          <!-- Current Roles Section -->
          <div>
            <h3
              class="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2"
            >
              <mat-icon class="text-blue-600">assignment_ind</mat-icon>
              Current Roles ({{ currentRoles().length }})
            </h3>

            <mat-list *ngIf="currentRoles().length > 0" class="space-y-2">
              <mat-list-item
                *ngFor="let userRole of currentRoles()"
                class="!bg-gray-50 dark:!bg-gray-800 !rounded-lg !mb-2 !p-4"
              >
                <mat-icon matListItemIcon class="text-blue-600">{{
                  userRole.role.is_system_role ? 'shield' : 'verified_user'
                }}</mat-icon>
                <div matListItemTitle class="flex items-center gap-2">
                  <span class="font-medium">{{ userRole.role.name }}</span>
                  <mat-chip
                    *ngIf="userRole.role.is_system_role"
                    class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !text-xs !h-5"
                  >
                    System
                  </mat-chip>
                  <mat-chip
                    class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200 !text-xs !h-5"
                  >
                    {{ userRole.role.category }}
                  </mat-chip>
                </div>
                <div matListItemLine class="text-sm text-gray-600">
                  <span class="flex items-center gap-1">
                    <mat-icon class="!text-sm">schedule</mat-icon>
                    Assigned: {{ formatDate(userRole.assigned_at) }}
                  </span>
                </div>
                <div
                  *ngIf="userRole.expires_at"
                  matListItemLine
                  class="text-sm flex items-center gap-1"
                  [class.text-orange-600]="isExpiringSoon(userRole)"
                  [class.text-gray-600]="!isExpiringSoon(userRole)"
                >
                  <mat-icon class="!text-sm">access_time</mat-icon>
                  Expires: {{ formatDate(userRole.expires_at) }}
                  <mat-icon
                    *ngIf="isExpiringSoon(userRole)"
                    class="!text-sm text-orange-600"
                    matTooltip="Expiring soon!"
                  >
                    warning
                  </mat-icon>
                </div>
                <div matListItemMeta class="flex gap-1">
                  <button
                    mat-icon-button
                    (click)="updateExpiry(userRole)"
                    matTooltip="Update expiry date"
                    [disabled]="isProcessing()"
                  >
                    <mat-icon class="text-gray-600">event</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (click)="removeRole(userRole)"
                    matTooltip="Remove role"
                    [disabled]="isProcessing()"
                  >
                    <mat-icon class="text-red-600">delete</mat-icon>
                  </button>
                </div>
              </mat-list-item>
            </mat-list>

            <div
              *ngIf="currentRoles().length === 0"
              class="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <mat-icon class="!text-3xl mb-2 opacity-50"
                >assignment_ind</mat-icon
              >
              <p class="text-sm">No roles assigned</p>
            </div>
          </div>

          <!-- Add Roles Section -->
          <mat-divider class="!my-6"></mat-divider>

          <div>
            <h3
              class="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2"
            >
              <mat-icon class="text-green-600">add_circle</mat-icon>
              Add Roles
            </h3>

            <div class="form-compact">
              <form [formGroup]="addRolesForm" class="flex flex-col gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Select Roles to Add</mat-label>
                  <mat-icon matPrefix>group_add</mat-icon>
                  <mat-select formControlName="roleIds" multiple>
                    <mat-option
                      *ngFor="let role of availableRolesToAdd()"
                      [value]="role.id"
                    >
                      <div class="flex items-center gap-2">
                        <span>{{ role.name }}</span>
                        <mat-chip
                          class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200 !text-xs !h-5"
                        >
                          {{ role.category }}
                        </mat-chip>
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-hint
                    >Only roles not currently assigned are shown</mat-hint
                  >
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Expiry Date (Optional)</mat-label>
                  <mat-icon matPrefix>event</mat-icon>
                  <input
                    matInput
                    [matDatepicker]="picker"
                    formControlName="expiresAt"
                    placeholder="Select expiry date"
                  />
                  <mat-datepicker-toggle
                    matIconSuffix
                    [for]="picker"
                  ></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-hint>Leave empty for permanent assignment</mat-hint>
                </mat-form-field>

                <button
                  mat-flat-button
                  color="primary"
                  (click)="addRoles()"
                  [disabled]="!canAddRoles() || isProcessing()"
                  class="w-full"
                >
                  <mat-spinner
                    *ngIf="isProcessing()"
                    diameter="20"
                    class="mr-2"
                  ></mat-spinner>
                  <mat-icon *ngIf="!isProcessing()">add</mat-icon>
                  Add Selected Roles
                </button>
              </form>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <div mat-dialog-actions align="end" class="flex gap-2">
        <button mat-button mat-dialog-close [disabled]="isProcessing()">
          Close
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .user-roles-management-dialog {
        min-width: 600px;
        max-width: 800px;
      }

      mat-list-item {
        height: auto !important;
        min-height: 72px;
      }

      .mat-mdc-chip {
        font-size: 11px;
        min-height: 20px;
      }

      mat-icon.text-sm {
        font-size: 14px !important;
        width: 14px !important;
        height: 14px !important;
      }

      mat-dialog-content {
        padding: 0 24px;
      }

      .space-y-2 > * + * {
        margin-top: 0.5rem;
      }

      .space-y-4 > * + * {
        margin-top: 1rem;
      }

      .space-y-6 > * + * {
        margin-top: 1.5rem;
      }
    `,
  ],
})
export class UserRolesManagementDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rbacService = inject(RbacService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(
    MatDialogRef<UserRolesManagementDialogComponent>,
  );

  readonly isLoading = signal(true);
  readonly isProcessing = signal(false);
  readonly userRoles = signal<UserRole[]>([]);
  addRolesForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UserRolesManagementDialogData,
  ) {}

  // Computed properties
  readonly currentRoles = () =>
    this.userRoles().filter((ur) => ur.is_active && !this.isExpired(ur));

  readonly availableRolesToAdd = () => {
    const assignedRoleIds = new Set(
      this.currentRoles().map((ur) => ur.role_id),
    );
    return this.data.availableRoles.filter(
      (role) => !assignedRoleIds.has(role.id),
    );
  };

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserRoles();
  }

  private initializeForm(): void {
    this.addRolesForm = this.fb.group({
      roleIds: [[], Validators.required],
      expiresAt: [null],
    });
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

  canAddRoles(): boolean {
    const roleIds = this.addRolesForm.get('roleIds')?.value || [];
    return roleIds.length > 0;
  }

  async addRoles(): Promise<void> {
    if (!this.canAddRoles()) {
      return;
    }

    try {
      this.isProcessing.set(true);

      const formValue = this.addRolesForm.value;
      const assignRequest = {
        role_ids: formValue.roleIds,
        expires_at: formValue.expiresAt
          ? formValue.expiresAt.toISOString()
          : undefined,
      };

      await this.rbacService
        .bulkAssignRolesToUser(this.data.userId, assignRequest)
        .toPromise();

      this.snackBar.open('Roles added successfully', 'Close', {
        duration: 3000,
      });

      // Reset form and reload roles
      this.addRolesForm.reset({ roleIds: [], expiresAt: null });
      await this.loadUserRoles();
    } catch (error) {
      console.error('Failed to add roles:', error);
      this.snackBar.open('Failed to add roles', 'Close', { duration: 3000 });
    } finally {
      this.isProcessing.set(false);
    }
  }

  async removeRole(userRole: UserRole): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Role',
        message: `Are you sure you want to remove the "${userRole.role.name}" role from this user?`,
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      try {
        this.isProcessing.set(true);

        await this.rbacService
          .removeRoleFromUser(this.data.userId, userRole.role_id)
          .toPromise();

        this.snackBar.open('Role removed successfully', 'Close', {
          duration: 3000,
        });

        await this.loadUserRoles();
      } catch (error) {
        console.error('Failed to remove role:', error);
        this.snackBar.open('Failed to remove role', 'Close', {
          duration: 3000,
        });
      } finally {
        this.isProcessing.set(false);
      }
    }
  }

  async updateExpiry(userRole: UserRole): Promise<void> {
    // TODO: Open date picker dialog to update expiry
    // For now, just show a message
    this.snackBar.open('Update expiry feature coming soon', 'Close', {
      duration: 2000,
    });
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

  isRoleAssigned(roleId: string): boolean {
    return this.currentRoles().some((ur) => ur.role_id === roleId);
  }
}
