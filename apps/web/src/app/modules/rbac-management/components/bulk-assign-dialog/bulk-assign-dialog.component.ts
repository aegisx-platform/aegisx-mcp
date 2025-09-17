import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import {
  BulkAssignDialogData,
  BulkAssignRolesRequest,
  Role,
  User,
} from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-bulk-assign-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTabsModule,
  ],
  template: `
    <div class="bulk-assign-dialog">
      <div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl">group_add</mat-icon>
          <h2 class="text-xl font-semibold m-0">Bulk Assign Role to Users</h2>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="py-6 max-h-[600px] overflow-y-auto">

        <form [formGroup]="bulkAssignForm" class="space-y-6">
          <mat-tab-group>
            <!-- User Selection Tab -->
            <mat-tab label="Select Users">
              <div class="py-4 space-y-4">
                <!-- User Search -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Search Users</mat-label>
                  <input
                    matInput
                    [(ngModel)]="userSearchQuery"
                    (ngModelChange)="onUserSearchChange()"
                    placeholder="Search by name, email, or username"
                  >
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <!-- User Selection Actions -->
                <div class="flex gap-2">
                  <button
                    type="button"
                    mat-stroked-button
                    (click)="selectAllUsers()"
                    [disabled]="isLoadingUsers()"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    mat-stroked-button
                    (click)="deselectAllUsers()"
                    [disabled]="isLoadingUsers()"
                  >
                    Deselect All
                  </button>
                  <button
                    type="button"
                    mat-stroked-button
                    (click)="loadMoreUsers()"
                    [disabled]="isLoadingUsers() || !hasMoreUsers()"
                  >
                    <mat-spinner *ngIf="isLoadingUsers()" diameter="16" class="mr-2"></mat-spinner>
                    Load More
                  </button>
                </div>

                <!-- Loading State -->
                <div *ngIf="isLoadingUsers() && availableUsers().length === 0" class="flex justify-center items-center py-8">
                  <mat-spinner diameter="32"></mat-spinner>
                  <span class="ml-3">Loading users...</span>
                </div>

                <!-- User List -->
                <div *ngIf="!isLoadingUsers() || availableUsers().length > 0" class="border rounded-lg max-h-96 overflow-y-auto">
                  <div
                    *ngFor="let user of filteredUsers(); trackBy: trackByUserId"
                    class="flex items-start gap-3 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <mat-checkbox
                      [checked]="userSelection.isSelected(user)"
                      (change)="toggleUser(user, $event.checked)"
                      class="mt-1"
                    >
                    </mat-checkbox>

                    <div class="flex items-center gap-3 flex-1">
                      <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <mat-icon class="text-blue-600">person</mat-icon>
                      </div>
                      <div class="flex-1">
                        <div class="font-medium">{{ user.first_name }} {{ user.last_name }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</div>
                        <div class="text-xs text-gray-500">@{{ user.username }}</div>
                      </div>
                      <div class="text-right">
                        <mat-chip [class]="user.is_active ?
                          '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200' :
                          '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200'
                        ">
                          {{ user.is_active ? 'Active' : 'Inactive' }}
                        </mat-chip>
                      </div>
                    </div>
                  </div>

                  <!-- No Users Found -->
                  <div *ngIf="filteredUsers().length === 0 && !isLoadingUsers()" class="text-center py-8 text-gray-500">
                    <mat-icon class="text-4xl mb-2 opacity-50">person_off</mat-icon>
                    <p>No users found</p>
                  </div>
                </div>

                <!-- Selected Users Summary -->
                <div *ngIf="userSelection.selected.length > 0" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 class="font-medium mb-2 flex items-center gap-2">
                    <mat-icon class="text-blue-600">people</mat-icon>
                    Selected Users ({{ userSelection.selected.length }})
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <mat-chip
                      *ngFor="let user of userSelection.selected.slice(0, 10)"
                      class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200"
                      removable
                      (removed)="toggleUser(user, false)"
                    >
                      {{ user.first_name }} {{ user.last_name }}
                      <mat-icon matChipRemove>cancel</mat-icon>
                    </mat-chip>
                    <mat-chip
                      *ngIf="userSelection.selected.length > 10"
                      class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200"
                    >
                      +{{ userSelection.selected.length - 10 }} more
                    </mat-chip>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Role Selection Tab -->
            <mat-tab label="Select Role">
              <div class="py-4 space-y-4">
                <!-- Role Selection -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Select Role *</mat-label>
                  <mat-select formControlName="roleId">
                    <mat-option *ngFor="let role of data.availableRoles" [value]="role.id">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="font-medium">{{ role.name }}</div>
                          <div class="text-sm text-gray-600 dark:text-gray-400">{{ role.category }}</div>
                        </div>
                        <mat-chip
                          *ngIf="role.is_system_role"
                          class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !ml-2"
                        >
                          System
                        </mat-chip>
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="bulkAssignForm.get('roleId')?.hasError('required')">
                    Please select a role
                  </mat-error>
                </mat-form-field>

                <!-- Selected Role Display -->
                <div *ngIf="selectedRole()" class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 class="font-medium mb-2 flex items-center gap-2">
                    <mat-icon class="text-green-600">verified_user</mat-icon>
                    Selected Role
                  </h4>
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-medium">{{ selectedRole()!.name }}</span>
                    <mat-chip class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200">
                      {{ selectedRole()!.category }}
                    </mat-chip>
                    <mat-chip
                      *ngIf="selectedRole()!.is_system_role"
                      class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200"
                    >
                      System
                    </mat-chip>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {{ selectedRole()!.description || 'No description available' }}
                  </p>
                  <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div class="flex items-center gap-1">
                      <mat-icon class="text-base">security</mat-icon>
                      <span>{{ selectedRole()!.permissions?.length || 0 }} permissions</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <mat-icon class="text-base">people</mat-icon>
                      <span>{{ selectedRole()!.user_count || 0 }} current users</span>
                    </div>
                  </div>
                </div>

                <!-- Expiry Date (Optional) -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Expiry Date (Optional)</mat-label>
                  <input
                    matInput
                    [matDatepicker]="expiryPicker"
                    formControlName="expiresAt"
                    placeholder="Select expiry date for all assignments"
                  >
                  <mat-datepicker-toggle matIconSuffix [for]="expiryPicker"></mat-datepicker-toggle>
                  <mat-datepicker #expiryPicker></mat-datepicker>
                  <mat-hint>Leave empty for permanent assignments</mat-hint>
                  <mat-error *ngIf="bulkAssignForm.get('expiresAt')?.hasError('futureDate')">
                    Expiry date must be in the future
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-tab>

            <!-- Review Tab -->
            <mat-tab label="Review & Confirm">
              <div class="py-4 space-y-6">
                <!-- Summary -->
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 class="font-medium mb-3 flex items-center gap-2">
                    <mat-icon class="text-purple-600">preview</mat-icon>
                    Bulk Assignment Summary
                  </h4>

                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between items-center">
                      <span class="font-medium">Selected Users:</span>
                      <mat-chip class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200">
                        {{ userSelection.selected.length }} users
                      </mat-chip>
                    </div>

                    <div class="flex justify-between items-center">
                      <span class="font-medium">Role to Assign:</span>
                      <span>{{ selectedRole()?.name || 'No role selected' }}</span>
                    </div>

                    <div class="flex justify-between items-center">
                      <span class="font-medium">Role Category:</span>
                      <span>{{ selectedRole()?.category || 'N/A' }}</span>
                    </div>

                    <div class="flex justify-between items-center">
                      <span class="font-medium">Permissions Granted:</span>
                      <span>{{ selectedRole()?.permissions?.length || 0 }} permissions</span>
                    </div>

                    <div class="flex justify-between items-center">
                      <span class="font-medium">Expiry Date:</span>
                      <span>{{ bulkAssignForm.get('expiresAt')?.value ? formatDate(bulkAssignForm.get('expiresAt')?.value) : 'Never' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Users Preview -->
                <div *ngIf="userSelection.selected.length > 0">
                  <h4 class="font-medium mb-3 flex items-center gap-2">
                    <mat-icon class="text-blue-600">people</mat-icon>
                    Users to be assigned ({{ userSelection.selected.length }})
                  </h4>
                  <div class="border rounded-lg max-h-64 overflow-y-auto">
                    <mat-list>
                      <mat-list-item
                        *ngFor="let user of userSelection.selected; trackBy: trackByUserId"
                        class="!h-auto !min-h-[48px]"
                      >
                        <div class="flex items-center gap-3 w-full">
                          <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <mat-icon class="text-blue-600 text-base">person</mat-icon>
                          </div>
                          <div class="flex-1">
                            <div class="font-medium text-sm">{{ user.first_name }} {{ user.last_name }}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">{{ user.email }}</div>
                          </div>
                        </div>
                      </mat-list-item>
                    </mat-list>
                  </div>
                </div>

                <!-- Warnings -->
                <div *ngIf="hasValidationErrors()" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div class="flex items-start gap-2">
                    <mat-icon class="text-red-600 mt-0.5">error</mat-icon>
                    <div>
                      <h4 class="font-medium text-red-800 dark:text-red-200">
                        Cannot Proceed
                      </h4>
                      <ul class="text-sm text-red-700 dark:text-red-300 mt-1 list-disc list-inside">
                        <li *ngIf="userSelection.selected.length === 0">No users selected</li>
                        <li *ngIf="!selectedRole()">No role selected</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-between items-center pt-4 border-t">
        <div class="text-sm text-gray-600">
          {{ userSelection.selected.length }} users selected
        </div>

        <div class="flex gap-2">
          <button mat-button mat-dialog-close [disabled]="isLoading()">
            Cancel
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="bulkAssignRoles()"
            [disabled]="isLoading() || hasValidationErrors()"
          >
            <mat-spinner *ngIf="isLoading()" diameter="20" class="mr-2"></mat-spinner>
            <mat-icon *ngIf="!isLoading()">group_add</mat-icon>
            Assign Role to {{ userSelection.selected.length }} Users
          </button>
        </div>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .bulk-assign-dialog {
        width: 100%;
        max-width: 700px;
      }

      .mat-mdc-dialog-content {
        max-height: 600px;
      }

      .mat-mdc-chip {
        min-height: 24px;
        font-size: 12px;
      }

      .mat-mdc-form-field {
        width: 100%;
      }

      .mat-mdc-list-item {
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      }

      .mat-mdc-list-item:last-child {
        border-bottom: none;
      }

      :host-context(.dark) .mat-mdc-list-item {
        border-bottom-color: rgba(255, 255, 255, 0.12);
      }

      .mat-mdc-tab-body-wrapper {
        flex-grow: 1;
        overflow: auto;
      }
    `,
  ],
})
export class BulkAssignDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rbacService = inject(RbacService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<BulkAssignDialogComponent>);
  readonly data = inject<BulkAssignDialogData>(MAT_DIALOG_DATA);

  // Form
  bulkAssignForm!: FormGroup;

  // Signals
  readonly isLoading = signal(false);
  readonly isLoadingUsers = signal(false);
  readonly selectedRole = signal<Role | null>(null);
  readonly availableUsers = signal<User[]>([]);
  readonly hasMoreUsers = signal(true);

  // User selection
  userSelection = new SelectionModel<User>(true, []);
  userSearchQuery = '';
  currentPage = 1;
  pageSize = 50;

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
  }

  private initializeForm(): void {
    this.bulkAssignForm = this.fb.group({
      roleId: ['', Validators.required],
      expiresAt: [null, this.futureDateValidator],
    });

    // Watch for role selection changes
    this.bulkAssignForm.get('roleId')?.valueChanges.subscribe((roleId) => {
      if (roleId) {
        const role = this.data.availableRoles.find((r) => r.id === roleId);
        this.selectedRole.set(role || null);
      } else {
        this.selectedRole.set(null);
      }
    });
  }

  // Custom validator for future dates
  private futureDateValidator(control: any) {
    if (!control.value) {
      return null; // Empty is valid (optional field)
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return { futureDate: true };
    }

    return null;
  }

  private async loadUsers(): Promise<void> {
    try {
      this.isLoadingUsers.set(true);

      const response = await this.rbacService
        .searchUsers('', this.pageSize)
        .toPromise();
      if (response) {
        this.availableUsers.set(response.data);
        this.hasMoreUsers.set(response.pagination.has_next);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  async loadMoreUsers(): Promise<void> {
    if (!this.hasMoreUsers() || this.isLoadingUsers()) {
      return;
    }

    try {
      this.isLoadingUsers.set(true);
      this.currentPage++;

      const response = await this.rbacService
        .searchUsers(this.userSearchQuery, this.pageSize)
        .toPromise();

      if (response) {
        this.availableUsers.update((users) => [...users, ...response.data]);
        this.hasMoreUsers.set(response.pagination.has_next);
      }
    } catch (error) {
      console.error('Failed to load more users:', error);
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  onUserSearchChange(): void {
    // Reset pagination
    this.currentPage = 1;
    this.hasMoreUsers.set(true);

    // Clear current users and reload
    this.availableUsers.set([]);
    this.loadUsersWithSearch();
  }

  private async loadUsersWithSearch(): Promise<void> {
    try {
      this.isLoadingUsers.set(true);

      const response = await this.rbacService
        .searchUsers(this.userSearchQuery, this.pageSize)
        .toPromise();

      if (response) {
        this.availableUsers.set(response.data);
        this.hasMoreUsers.set(response.pagination.has_next);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  filteredUsers(): User[] {
    return this.availableUsers();
  }

  toggleUser(user: User, selected: boolean): void {
    if (selected) {
      this.userSelection.select(user);
    } else {
      this.userSelection.deselect(user);
    }
  }

  selectAllUsers(): void {
    this.userSelection.select(...this.filteredUsers());
  }

  deselectAllUsers(): void {
    this.userSelection.clear();
  }

  hasValidationErrors(): boolean {
    return (
      this.userSelection.selected.length === 0 ||
      !this.selectedRole() ||
      this.bulkAssignForm.invalid
    );
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async bulkAssignRoles(): Promise<void> {
    if (this.hasValidationErrors()) {
      return;
    }

    try {
      this.isLoading.set(true);

      const formValue = this.bulkAssignForm.value;
      const bulkRequest: BulkAssignRolesRequest = {
        user_ids: this.userSelection.selected.map((user) => user.id),
        role_id: formValue.roleId,
        expires_at: formValue.expiresAt
          ? formValue.expiresAt.toISOString()
          : undefined,
      };

      const response = await this.rbacService
        .bulkAssignRoles(bulkRequest)
        .toPromise();

      if (response) {
        const result = response.data;
        const successMessage = `Successfully assigned role to ${result.success_count} users`;

        if (result.error_count > 0) {
          this.snackBar.open(
            `${successMessage}. ${result.error_count} assignments failed.`,
            'Close',
            { duration: 5000 },
          );
        } else {
          this.snackBar.open(successMessage, 'Close', { duration: 3000 });
        }
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to bulk assign roles:', error);
      this.snackBar.open('Failed to assign roles', 'Close', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}
