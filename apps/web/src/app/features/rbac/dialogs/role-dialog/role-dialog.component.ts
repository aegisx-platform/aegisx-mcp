import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { RbacService } from '../../services/rbac.service';
import {
  RoleDialogData,
  Permission,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../../models/rbac.interfaces';

@Component({
  selector: 'app-role-dialog',
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
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="role-dialog">
      <div
        mat-dialog-title
        class="flex items-center justify-between pb-4 border-b"
      >
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl">{{
            data.mode === 'create' ? 'add_circle' : 'edit'
          }}</mat-icon>
          <h2 class="text-xl font-semibold m-0">
            {{ data.mode === 'create' ? 'Create New Role' : 'Edit Role' }}
          </h2>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="py-6 max-h-[600px] overflow-y-auto">
        <form [formGroup]="roleForm" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Role Name -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Role Name *</mat-label>
              <input
                matInput
                formControlName="name"
                placeholder="Enter role name"
              />
              <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
                Role name is required
              </mat-error>
              <mat-error *ngIf="roleForm.get('name')?.hasError('maxlength')">
                Role name must not exceed 100 characters
              </mat-error>
            </mat-form-field>

            <!-- Category -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Category *</mat-label>
              <mat-select formControlName="category">
                <mat-option
                  *ngFor="let category of availableCategories()"
                  [value]="category"
                >
                  {{ category }}
                </mat-option>
              </mat-select>
              <input
                matInput
                #categoryInput
                placeholder="Or enter new category"
                (keyup.enter)="
                  addNewCategory(categoryInput.value); categoryInput.value = ''
                "
                style="margin-top: 8px;"
              />
              <mat-error *ngIf="roleForm.get('category')?.hasError('required')">
                Category is required
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Description -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Description</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="3"
              placeholder="Enter role description (optional)"
            ></textarea>
            <mat-hint
              >{{
                roleForm.get('description')?.value?.length || 0
              }}/500</mat-hint
            >
            <mat-error
              *ngIf="roleForm.get('description')?.hasError('maxlength')"
            >
              Description must not exceed 500 characters
            </mat-error>
          </mat-form-field>

          <!-- Parent Role -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Parent Role (Optional)</mat-label>
            <mat-select formControlName="parent_role_id">
              <mat-option [value]="null">No Parent Role</mat-option>
              <mat-option
                *ngFor="let role of data.availableRoles"
                [value]="role.id"
                [disabled]="role.id === data.role?.id"
              >
                {{ role.name }} ({{ role.category }})
              </mat-option>
            </mat-select>
            <mat-hint>Select a parent role to create a hierarchy</mat-hint>
          </mat-form-field>
        </form>

        <!-- Permissions Tab -->
        <mat-tab-group class="mt-6">
          <mat-tab label="Permissions">
            <div class="py-4">
              <!-- Permission Search -->
              <mat-form-field appearance="outline" class="w-full mb-4">
                <mat-label>Search permissions</mat-label>
                <input
                  matInput
                  [(ngModel)]="permissionSearch"
                  (ngModelChange)="filterPermissions()"
                  placeholder="Search by name, resource, or action"
                />
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <!-- Permission Selection Actions -->
              <div class="flex gap-2 mb-4">
                <button
                  mat-stroked-button
                  (click)="selectAllPermissions()"
                  [disabled]="isLoading()"
                >
                  Select All
                </button>
                <button
                  mat-stroked-button
                  (click)="deselectAllPermissions()"
                  [disabled]="isLoading()"
                >
                  Deselect All
                </button>
                <button
                  mat-stroked-button
                  (click)="selectByCategory()"
                  [disabled]="isLoading()"
                >
                  Select by Category
                </button>
              </div>

              <!-- Loading Permissions -->
              <div
                *ngIf="isLoadingPermissions()"
                class="flex justify-center items-center py-8"
              >
                <mat-spinner diameter="32"></mat-spinner>
                <span class="ml-3">Loading permissions...</span>
              </div>

              <!-- Permissions List -->
              <div
                *ngIf="!isLoadingPermissions()"
                class="space-y-4 max-h-96 overflow-y-auto"
              >
                <div
                  *ngFor="
                    let category of groupedPermissions();
                    trackBy: trackByCategory
                  "
                  class="border rounded-lg"
                >
                  <!-- Category Header -->
                  <div
                    class="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex items-center justify-between"
                  >
                    <div class="flex items-center gap-2">
                      <h4 class="font-medium">{{ category.name }}</h4>
                      <mat-chip
                        class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200"
                      >
                        {{ category.permissions.length }}
                      </mat-chip>
                    </div>
                    <button
                      mat-icon-button
                      (click)="category.isExpanded = !category.isExpanded"
                    >
                      <mat-icon>{{
                        category.isExpanded ? 'expand_less' : 'expand_more'
                      }}</mat-icon>
                    </button>
                  </div>

                  <!-- Category Permissions -->
                  <div *ngIf="category.isExpanded">
                    <div
                      *ngFor="
                        let permission of category.permissions;
                        trackBy: trackByPermission
                      "
                      class="flex items-start gap-3 p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <mat-checkbox
                        [checked]="permissionSelection.isSelected(permission)"
                        (change)="togglePermission(permission, $event.checked)"
                        class="mt-1"
                      >
                      </mat-checkbox>

                      <div class="flex-1">
                        <div class="font-medium">
                          {{ permission.resource }}.{{ permission.action }}
                        </div>
                        <div
                          class="text-sm text-gray-600 dark:text-gray-400 mt-1"
                        >
                          {{ permission.description }}
                        </div>
                        <div class="flex gap-2 mt-2">
                          <mat-chip
                            class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200 !text-xs !mr-1 !mb-1"
                          >
                            {{ permission.resource }}
                          </mat-chip>
                          <mat-chip
                            class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200 !text-xs !mr-1 !mb-1"
                          >
                            {{ permission.action }}
                          </mat-chip>
                        </div>
                      </div>

                      <div *ngIf="permission.is_system_permission" class="mt-1">
                        <mat-chip
                          class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200"
                        >
                          System
                        </mat-chip>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Permissions Found -->
                <div
                  *ngIf="groupedPermissions().length === 0"
                  class="text-center py-8 text-gray-500"
                >
                  <mat-icon class="text-4xl mb-2 opacity-50"
                    >search_off</mat-icon
                  >
                  <p>No permissions found matching your search</p>
                </div>
              </div>

              <!-- Selected Permissions Summary -->
              <div
                *ngIf="permissionSelection.selected.length > 0"
                class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <h4 class="font-medium mb-2 flex items-center gap-2">
                  <mat-icon class="text-blue-600">verified_user</mat-icon>
                  Selected Permissions ({{
                    permissionSelection.selected.length
                  }})
                </h4>
                <div class="flex flex-wrap gap-2">
                  <mat-chip
                    *ngFor="
                      let permission of permissionSelection.selected.slice(
                        0,
                        10
                      )
                    "
                    class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !mr-2 !mb-2"
                    removable
                    (removed)="togglePermission(permission, false)"
                  >
                    {{ permission.resource }}.{{ permission.action }}
                    <mat-icon matChipRemove>cancel</mat-icon>
                  </mat-chip>
                  <mat-chip
                    *ngIf="permissionSelection.selected.length > 10"
                    class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200 !mr-2 !mb-2"
                  >
                    +{{ permissionSelection.selected.length - 10 }} more
                  </mat-chip>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
        <button mat-button mat-dialog-close [disabled]="isLoading()">
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="save()"
          [disabled]="isLoading() || !roleForm.valid"
        >
          <mat-spinner
            *ngIf="isLoading()"
            diameter="20"
            class="mr-2"
          ></mat-spinner>
          <mat-icon *ngIf="!isLoading()">save</mat-icon>
          {{ data.mode === 'create' ? 'Create Role' : 'Update Role' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .role-dialog {
        width: 100%;
        max-width: 800px;
      }

      .mat-mdc-dialog-content {
        max-height: 600px;
        overflow-y: auto;
      }

      .mat-mdc-chip {
        min-height: 24px;
        font-size: 12px;
      }

      .mat-mdc-tab-body-wrapper {
        min-height: 300px;
      }
    `,
  ],
})
export class RoleDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rbacService = inject(RbacService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<RoleDialogComponent>);
  readonly data = inject<RoleDialogData>(MAT_DIALOG_DATA);

  // Form
  roleForm!: FormGroup;

  // Signals
  readonly isLoading = signal(false);
  readonly isLoadingPermissions = signal(true);
  readonly availablePermissions = signal<Permission[]>([]);
  readonly availableCategories = signal<string[]>([
    'Admin',
    'User',
    'Manager',
    'Developer',
    'Support',
  ]);
  readonly groupedPermissions = signal<any[]>([]);

  // Permission management
  permissionSelection = new SelectionModel<Permission>(true, []);
  permissionSearch = '';

  ngOnInit(): void {
    this.initializeForm();
    this.loadPermissions();
  }

  private initializeForm(): void {
    this.roleForm = this.fb.group({
      name: [
        this.data.role?.name || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      description: [
        this.data.role?.description || '',
        [Validators.maxLength(500)],
      ],
      category: [this.data.role?.category || '', Validators.required],
      parent_role_id: [this.data.role?.parent_role_id || null],
    });
  }

  private async loadPermissions(): Promise<void> {
    try {
      this.isLoadingPermissions.set(true);

      const response = await this.rbacService
        .getPermissions({
          page: 1,
          limit: 1000,
          is_active: true,
        })
        .toPromise();

      if (response) {
        this.availablePermissions.set(response.data);

        // Pre-select permissions if editing (after permissions are loaded)
        if (this.data.mode === 'edit' && this.data.role?.permissions) {
          this.data.role.permissions.forEach((rolePermission) => {
            // Find the matching permission from available permissions by ID
            const matchingPermission = response.data.find(
              (p) => p.id === rolePermission.id,
            );
            if (matchingPermission) {
              this.permissionSelection.select(matchingPermission);
            }
          });
        }

        this.filterPermissions();
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
      this.snackBar.open('Failed to load permissions', 'Close', {
        duration: 3000,
      });
    } finally {
      this.isLoadingPermissions.set(false);
    }
  }

  filterPermissions(): void {
    let filtered = this.availablePermissions();

    if (this.permissionSearch) {
      const search = this.permissionSearch.toLowerCase();
      filtered = filtered.filter(
        (permission) =>
          `${permission.resource}.${permission.action}`
            .toLowerCase()
            .includes(search) ||
          permission.description.toLowerCase().includes(search) ||
          permission.resource.toLowerCase().includes(search) ||
          permission.action.toLowerCase().includes(search),
      );
    }

    // Group by category
    const grouped = filtered.reduce(
      (acc, permission) => {
        const category = permission.category;
        if (!acc[category]) {
          acc[category] = {
            name: category,
            permissions: [],
            count: 0,
            isExpanded: true,
          };
        }
        acc[category].permissions.push(permission);
        acc[category].count++;
        return acc;
      },
      {} as Record<string, any>,
    );

    this.groupedPermissions.set(Object.values(grouped));
  }

  addNewCategory(category: string): void {
    if (category && !this.availableCategories().includes(category)) {
      this.availableCategories.update((categories) => [
        ...categories,
        category,
      ]);
      this.roleForm.patchValue({ category });
    }
  }

  // Permission selection methods
  togglePermission(permission: Permission, selected: boolean): void {
    if (selected) {
      this.permissionSelection.select(permission);
    } else {
      this.permissionSelection.deselect(permission);
    }
  }

  selectAllPermissions(): void {
    this.availablePermissions().forEach((permission) => {
      this.permissionSelection.select(permission);
    });
  }

  deselectAllPermissions(): void {
    this.permissionSelection.clear();
  }

  selectByCategory(): void {
    // TODO: Implement category-based selection dialog
    console.log('Select by category functionality to be implemented');
  }

  async save(): Promise<void> {
    if (this.roleForm.invalid) {
      return;
    }

    try {
      this.isLoading.set(true);

      const formValue = this.roleForm.value;
      const permissionIds = this.permissionSelection.selected.map((p) => p.id);

      if (this.data.mode === 'create') {
        const createRequest: CreateRoleRequest = {
          name: formValue.name,
          description: formValue.description || undefined,
          category: formValue.category,
          parent_role_id: formValue.parent_role_id || undefined,
          permission_ids: permissionIds.length > 0 ? permissionIds : undefined,
        };

        await this.rbacService.createRole(createRequest).toPromise();
      } else {
        const updateRequest: UpdateRoleRequest = {
          name:
            formValue.name !== this.data.role?.name
              ? formValue.name
              : undefined,
          description:
            formValue.description !== this.data.role?.description
              ? formValue.description
              : undefined,
          category:
            formValue.category !== this.data.role?.category
              ? formValue.category
              : undefined,
          parent_role_id:
            formValue.parent_role_id !== this.data.role?.parent_role_id
              ? formValue.parent_role_id
              : undefined,
          permission_ids: permissionIds,
        };

        await this.rbacService
          .updateRole(this.data.role!.id, updateRequest)
          .toPromise();
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to save role:', error);
      this.snackBar.open(
        `Failed to ${this.data.mode === 'create' ? 'create' : 'update'} role`,
        'Close',
        { duration: 3000 },
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  // Track by functions for performance
  trackByCategory(index: number, item: any): string {
    return item.name;
  }

  trackByPermission(index: number, item: Permission): string {
    return item.id;
  }
}
