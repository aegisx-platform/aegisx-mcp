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
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AssignRoleRequest,
  Role,
  User,
  UserRoleDialogData,
} from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-user-role-assign-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-3 text-xl font-semibold">
      <mat-icon class="text-brand">person_add</mat-icon>
      Assign Role to User
    </h2>

    <mat-dialog-content>
      <div class="form-compact">
        <form [formGroup]="assignForm" class="flex flex-col gap-4">
          <!-- User Search -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Search User <span class="text-error">*</span></mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input
              matInput
              formControlName="userSearch"
              [matAutocomplete]="userAutocomplete"
              placeholder="Type user name or email"
              (input)="onUserSearchChange($event)"
            />
            <mat-autocomplete
              #userAutocomplete="matAutocomplete"
              [displayWith]="displayUserFn"
              (optionSelected)="onUserSelected($event)"
            >
              <mat-option *ngIf="isSearchingUsers()" disabled>
                <mat-spinner diameter="20"></mat-spinner>
                <span class="ml-2">Searching users...</span>
              </mat-option>
              <mat-option *ngFor="let user of searchResults()" [value]="user">
                <div class="flex items-center gap-3 py-2">
                  <div
                    class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
                  >
                    <mat-icon class="text-blue-600 text-base">person</mat-icon>
                  </div>
                  <div>
                    <div class="font-medium">
                      {{ getUserDisplayName(user) }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </mat-option>
              <mat-option
                *ngIf="
                  searchResults().length === 0 &&
                  !isSearchingUsers() &&
                  userSearchQuery()
                "
                disabled
              >
                No users found
              </mat-option>
            </mat-autocomplete>
            <mat-error
              *ngIf="assignForm.get('selectedUser')?.hasError('required')"
            >
              Please select a user
            </mat-error>
          </mat-form-field>

          <!-- Selected User Display -->
          <div
            *ngIf="selectedUser()"
            class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
          >
            <h4 class="font-medium mb-2 flex items-center gap-2">
              <mat-icon class="text-blue-600">person</mat-icon>
              Selected User
            </h4>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
              >
                <mat-icon class="text-blue-600">person</mat-icon>
              </div>
              <div>
                <div class="font-medium">
                  {{ getUserDisplayName(selectedUser()!) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ selectedUser()!.email }}
                </div>
                <div class="text-xs text-gray-500">
                  Username: {{ selectedUser()!.username }}
                </div>
              </div>
              <button
                mat-icon-button
                (click)="clearSelectedUser()"
                matTooltip="Clear selection"
              >
                <mat-icon class="text-gray-500">close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Role Selection -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label
              >Select Roles <span class="text-error">*</span></mat-label
            >
            <mat-icon matPrefix>verified_user</mat-icon>
            <mat-select formControlName="roleIds" multiple>
              <mat-option
                *ngFor="let role of data.availableRoles"
                [value]="role.id"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium">{{ role.name }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ role.category }}
                    </div>
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
            <mat-hint>You can select multiple roles</mat-hint>
            <mat-error *ngIf="assignForm.get('roleIds')?.hasError('required')">
              Please select at least one role
            </mat-error>
          </mat-form-field>

          <!-- Selected Roles Display -->
          <div
            *ngIf="selectedRoles().length > 0"
            class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg"
          >
            <h4 class="font-medium mb-2 flex items-center gap-2">
              <mat-icon class="text-green-600">verified_user</mat-icon>
              Selected Roles ({{ selectedRoles().length }})
            </h4>
            <div class="space-y-3">
              <div
                *ngFor="let role of selectedRoles()"
                class="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0 last:pb-0"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium">{{ role.name }}</span>
                  <mat-chip
                    class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200 !text-xs"
                  >
                    {{ role.category }}
                  </mat-chip>
                  <mat-chip
                    *ngIf="role.is_system_role"
                    class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !text-xs"
                  >
                    System
                  </mat-chip>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ role.description || 'No description available' }}
                </p>
                <div
                  class="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400"
                >
                  <div class="flex items-center gap-1">
                    <mat-icon class="text-xs">security</mat-icon>
                    <span>{{ role.permissions.length || 0 }} permissions</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <mat-icon class="text-xs">people</mat-icon>
                    <span>{{ role.user_count || 0 }} users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Expiry Date (Optional) -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Expiry Date (Optional)</mat-label>
            <mat-icon matPrefix>event</mat-icon>
            <input
              matInput
              [matDatepicker]="expiryPicker"
              formControlName="expiresAt"
              placeholder="Select expiry date"
            />
            <mat-datepicker-toggle
              matIconSuffix
              [for]="expiryPicker"
            ></mat-datepicker-toggle>
            <mat-datepicker #expiryPicker></mat-datepicker>
            <mat-hint>Leave empty for permanent assignment</mat-hint>
            <mat-error
              *ngIf="assignForm.get('expiresAt')?.hasError('futureDate')"
            >
              Expiry date must be in the future
            </mat-error>
          </mat-form-field>

          <!-- Assignment Preview -->
          <div
            *ngIf="selectedUser() && selectedRoles().length > 0"
            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
          >
            <h4 class="font-medium mb-3 flex items-center gap-2">
              <mat-icon class="text-purple-600">preview</mat-icon>
              Assignment Preview
            </h4>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="font-medium">User:</span>
                <span>{{ getUserDisplayName(selectedUser()!) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Roles:</span>
                <span>{{ selectedRoles().length }} role(s)</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Total Permissions:</span>
                <span>{{ getTotalPermissionsCount() }} permissions</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Expires:</span>
                <span>{{
                  assignForm.get('expiresAt')?.value
                    ? formatDate(assignForm.get('expiresAt')?.value)
                    : 'Never'
                }}</span>
              </div>
            </div>
          </div>

          <!-- Existing Assignments Warning -->
          <div
            *ngIf="hasExistingAssignment()"
            class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div class="flex items-start gap-2">
              <mat-icon class="text-yellow-600 mt-0.5">warning</mat-icon>
              <div>
                <h4 class="font-medium text-yellow-800 dark:text-yellow-200">
                  Existing Assignment(s)
                </h4>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Some of the selected roles are already assigned to this user.
                  Proceeding will update the expiry date for existing
                  assignments and add new ones.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </mat-dialog-content>

    <div mat-dialog-actions align="end" class="flex gap-2">
      <button mat-button mat-dialog-close [disabled]="isLoading()">
        Cancel
      </button>
      <button
        mat-flat-button
        color="primary"
        (click)="assignRole()"
        [disabled]="
          isLoading() ||
          !assignForm.valid ||
          !selectedUser() ||
          selectedRoles().length === 0
        "
      >
        <mat-spinner
          *ngIf="isLoading()"
          diameter="20"
          class="mr-2"
        ></mat-spinner>
        <mat-icon *ngIf="!isLoading()">person_add</mat-icon>
        {{ hasExistingAssignment() ? 'Update Assignments' : 'Assign Roles' }}
      </button>
    </div>
  `,
  styles: [
    `
      .mat-mdc-chip {
        min-height: 24px;
        font-size: 12px;
      }

      .mat-mdc-option {
        min-height: 60px;
      }

      ::ng-deep .mat-mdc-select-panel {
        max-height: 300px;
      }
    `,
  ],
})
export class UserRoleAssignDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rbacService = inject(RbacService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(
    MatDialogRef<UserRoleAssignDialogComponent>,
  );
  readonly data = inject<UserRoleDialogData>(MAT_DIALOG_DATA);

  // Form
  assignForm!: FormGroup;

  // Signals
  readonly isLoading = signal(false);
  readonly isSearchingUsers = signal(false);
  readonly selectedUser = signal<User | null>(null);
  readonly selectedRoles = signal<Role[]>([]);
  readonly searchResults = signal<User[]>([]);
  readonly userSearchQuery = signal('');
  readonly existingAssignments = signal<string[]>([]);

  ngOnInit(): void {
    this.initializeForm();
    this.setupUserSearch();
  }

  private initializeForm(): void {
    this.assignForm = this.fb.group({
      userSearch: ['', Validators.required],
      selectedUser: [null, Validators.required],
      roleIds: [[], Validators.required],
      expiresAt: [null, this.futureDateValidator],
    });

    // Watch for role selection changes
    this.assignForm
      .get('roleIds')
      ?.valueChanges.subscribe((roleIds: string[]) => {
        if (roleIds && roleIds.length > 0) {
          const roles = this.data.availableRoles.filter((r) =>
            roleIds.includes(r.id),
          );
          this.selectedRoles.set(roles);
        } else {
          this.selectedRoles.set([]);
        }
      });
  }

  private setupUserSearch(): void {
    // Initial empty results
    this.searchResults.set([]);
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

  onUserSearchChange(event: any): void {
    const query = event.target.value;
    this.userSearchQuery.set(query);

    if (query.length >= 2) {
      this.searchUsers(query);
    } else {
      this.searchResults.set([]);
    }
  }

  private async searchUsers(query: string): Promise<void> {
    try {
      this.isSearchingUsers.set(true);

      const response = await this.rbacService
        .searchUsers(query, 20)
        .toPromise();

      console.log('🔍 Search Users Response:', response);
      console.log('🔍 Response Type:', typeof response);
      console.log('🔍 Response Data:', response?.data);
      console.log(
        '🔍 Response Keys:',
        response ? Object.keys(response) : 'null',
      );

      if (response) {
        // Handle both possible response formats
        // Format 1: { data: User[], pagination: {...} }
        // Format 2: Direct array of users
        const users = response.data || response;

        console.log('🔍 Users extracted:', users);
        console.log('🔍 Users is array?', Array.isArray(users));
        console.log(
          '🔍 Users length:',
          Array.isArray(users) ? users.length : 'not array',
        );

        if (Array.isArray(users)) {
          this.searchResults.set(users);
        } else {
          console.warn('⚠️ Unexpected response format - users is not an array');
          this.searchResults.set([]);
        }
      } else {
        console.warn('⚠️ Response is null or undefined');
        this.searchResults.set([]);
      }
    } catch (error) {
      console.error('❌ Failed to search users:', error);
      this.searchResults.set([]);
    } finally {
      this.isSearchingUsers.set(false);
    }
  }

  onUserSelected(event: any): void {
    const user = event.option.value as User;
    this.selectedUser.set(user);

    // For the input field, prioritize showing a meaningful name
    let displayName = '';
    const firstName =
      (user?.first_name || (user as any)?.firstName)?.trim() || '';
    const lastName = (user?.last_name || (user as any)?.lastName)?.trim() || '';
    const username = user?.username?.trim() || '';
    const email = user?.email?.trim() || '';

    if (firstName && lastName) {
      displayName = `${firstName} ${lastName}`;
    } else if (firstName) {
      displayName = firstName;
    } else if (lastName) {
      displayName = lastName;
    } else if (username) {
      displayName = username;
    } else if (email) {
      displayName = email.split('@')[0];
    } else if (user?.id) {
      displayName = `User ${user.id.substring(0, 8)}`;
    } else {
      displayName = 'Selected User'; // Final fallback
    }

    this.assignForm.patchValue({
      selectedUser: user,
      userSearch: displayName,
    });

    // Load existing assignments for this user
    this.loadUserAssignments(user.id);
  }

  private async loadUserAssignments(userId: string): Promise<void> {
    try {
      const response = await this.rbacService
        .getUserRoles({
          user_id: userId,
          is_active: true,
        })
        .toPromise();

      if (response) {
        const roleIds = response.data.map((ur) => ur.role_id);
        this.existingAssignments.set(roleIds);
      }
    } catch (error) {
      console.error('Failed to load user assignments:', error);
    }
  }

  clearSelectedUser(): void {
    this.selectedUser.set(null);
    this.existingAssignments.set([]);
    this.assignForm.patchValue({
      selectedUser: null,
      userSearch: '',
    });
  }

  displayUserFn = (user: User | string): string => {
    if (!user) return '';

    // Handle if user is already a string (from form value)
    if (typeof user === 'string') {
      return user;
    }

    // Handle User object - support both API formats
    const firstName =
      (user?.first_name || (user as any)?.firstName)?.trim() || '';
    const lastName = (user?.last_name || (user as any)?.lastName)?.trim() || '';
    const username = user?.username?.trim() || '';
    const email = user?.email?.trim() || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (username) {
      return username;
    } else if (email) {
      return email.split('@')[0];
    } else if (user?.id) {
      return `User ${user.id.substring(0, 8)}`;
    } else {
      return 'User';
    }
  };

  getUserDisplayName(user: User): string {
    if (!user) return 'Unknown User';

    const firstName =
      (user.first_name || (user as any).firstName)?.trim() || '';
    const lastName = (user.last_name || (user as any).lastName)?.trim() || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (user.username?.trim()) {
      return user.username.trim();
    } else if (user.email?.trim()) {
      return user.email.split('@')[0];
    } else if (user.id?.substring) {
      return `User ${user.id.substring(0, 8)}`;
    } else {
      return 'Unknown User';
    }
  }

  getTotalPermissionsCount(): number {
    const uniquePermissions = new Set<string>();
    this.selectedRoles().forEach((role) => {
      role.permissions.forEach((permission) => {
        uniquePermissions.add(permission.id);
      });
    });
    return uniquePermissions.size;
  }

  hasExistingAssignment(): boolean {
    const roleIds = this.assignForm.get('roleIds')?.value || [];
    return roleIds.some((roleId: string) =>
      this.existingAssignments().includes(roleId),
    );
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async assignRole(): Promise<void> {
    if (
      this.assignForm.invalid ||
      !this.selectedUser() ||
      this.selectedRoles().length === 0
    ) {
      this.markFormGroupTouched();
      return;
    }

    try {
      this.isLoading.set(true);

      const formValue = this.assignForm.value;
      const assignRequest = {
        role_ids: formValue.roleIds,
        expires_at: formValue.expiresAt
          ? formValue.expiresAt.toISOString()
          : undefined,
      };

      await this.rbacService
        .bulkAssignRolesToUser(this.selectedUser()!.id, assignRequest)
        .toPromise();

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to assign roles:', error);
      this.snackBar.open('Failed to assign roles', 'Close', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.assignForm.controls).forEach((key) => {
      const control = this.assignForm.get(key);
      control?.markAsTouched();
    });
  }
}
