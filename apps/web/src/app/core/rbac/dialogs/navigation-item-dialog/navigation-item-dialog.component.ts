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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import {
  NavigationItem,
  CreateNavigationItemRequest,
  UpdateNavigationItemRequest,
  NavigationItemsService,
  Permission,
} from '../../services/navigation-items.service';
import { RbacService } from '../../services/rbac.service';

export interface NavigationItemDialogData {
  mode: 'create' | 'edit' | 'view';
  navigationItem?: NavigationItem;
  prefilledData?: Partial<NavigationItem>;
  availableNavigationItems?: NavigationItem[];
}

@Component({
  selector: 'app-navigation-item-dialog',
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
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  template: `
    <div class="navigation-item-dialog">
      <h2
        mat-dialog-title
        class="flex items-center gap-3 text-xl font-semibold"
      >
        <mat-icon class="text-brand">{{
          data.mode === 'create'
            ? 'add_circle'
            : data.mode === 'edit'
              ? 'edit'
              : 'visibility'
        }}</mat-icon>
        {{
          data.mode === 'create'
            ? 'Create Navigation Item'
            : data.mode === 'edit'
              ? 'Edit Navigation Item'
              : 'View Navigation Item'
        }}
      </h2>

      <mat-dialog-content class="py-6 max-h-[600px] overflow-y-auto">
        <form [formGroup]="navigationForm" class="space-y-6">
          <mat-tab-group>
            <!-- Basic Info Tab -->
            <mat-tab label="Basic Info">
              <div class="py-4 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Key -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Key *</mat-label>
                    <input
                      matInput
                      formControlName="key"
                      placeholder="e.g., dashboard, users-list"
                      [readonly]="data.mode === 'view'"
                    />
                    <mat-hint
                      >Unique identifier (kebab-case recommended)</mat-hint
                    >
                    <mat-error
                      *ngIf="navigationForm.get('key')?.hasError('required')"
                    >
                      Key is required
                    </mat-error>
                    <mat-error
                      *ngIf="navigationForm.get('key')?.hasError('maxlength')"
                    >
                      Key must not exceed 100 characters
                    </mat-error>
                  </mat-form-field>

                  <!-- Title -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Title *</mat-label>
                    <input
                      matInput
                      formControlName="title"
                      placeholder="e.g., Dashboard, User List"
                      [readonly]="data.mode === 'view'"
                    />
                    <mat-error
                      *ngIf="navigationForm.get('title')?.hasError('required')"
                    >
                      Title is required
                    </mat-error>
                    <mat-error
                      *ngIf="navigationForm.get('title')?.hasError('maxlength')"
                    >
                      Title must not exceed 200 characters
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Type -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Type *</mat-label>
                    <mat-select
                      formControlName="type"
                      [disabled]="data.mode === 'view'"
                    >
                      <mat-option value="item">Item</mat-option>
                      <mat-option value="group">Group</mat-option>
                      <mat-option value="collapsible">Collapsible</mat-option>
                      <mat-option value="divider">Divider</mat-option>
                      <mat-option value="spacer">Spacer</mat-option>
                    </mat-select>
                    <mat-error
                      *ngIf="navigationForm.get('type')?.hasError('required')"
                    >
                      Type is required
                    </mat-error>
                  </mat-form-field>

                  <!-- Icon -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Icon</mat-label>
                    <input
                      matInput
                      formControlName="icon"
                      placeholder="e.g., dashboard, people"
                      [readonly]="data.mode === 'view'"
                    />
                    <mat-icon matSuffix>{{
                      navigationForm.get('icon')?.value || 'help_outline'
                    }}</mat-icon>
                    <mat-hint>Material icon name</mat-hint>
                  </mat-form-field>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Link -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Link/Route</mat-label>
                    <input
                      matInput
                      formControlName="link"
                      placeholder="e.g., /dashboard, /users"
                      [readonly]="data.mode === 'view'"
                    />
                    <mat-hint>Navigation path</mat-hint>
                  </mat-form-field>

                  <!-- Target -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Target</mat-label>
                    <mat-select
                      formControlName="target"
                      [disabled]="data.mode === 'view'"
                    >
                      <mat-option value="_self">Same Window (_self)</mat-option>
                      <mat-option value="_blank"
                        >New Window (_blank)</mat-option
                      >
                      <mat-option value="_parent"
                        >Parent Frame (_parent)</mat-option
                      >
                      <mat-option value="_top">Top Frame (_top)</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <!-- Parent Navigation Item -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Parent Navigation Item</mat-label>
                  <mat-select
                    formControlName="parent_id"
                    [disabled]="data.mode === 'view'"
                  >
                    <mat-option [value]="null"
                      >No Parent (Top Level)</mat-option
                    >
                    <mat-option
                      *ngFor="let item of data.availableNavigationItems || []"
                      [value]="item.id"
                      [disabled]="item.id === data.navigationItem?.id"
                    >
                      {{ item.title }} ({{ item.key }})
                    </mat-option>
                  </mat-select>
                  <mat-hint>Select parent for hierarchical structure</mat-hint>
                </mat-form-field>
              </div>
            </mat-tab>

            <!-- Configuration Tab -->
            <mat-tab label="Configuration">
              <div class="py-4 space-y-4">
                <!-- Sort Order -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Sort Order</mat-label>
                  <input
                    matInput
                    type="number"
                    formControlName="sort_order"
                    placeholder="0"
                    [readonly]="data.mode === 'view'"
                  />
                  <mat-hint>Lower numbers appear first</mat-hint>
                </mat-form-field>

                <!-- State Toggles -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <mat-slide-toggle
                    formControlName="disabled"
                    [disabled]="data.mode === 'view'"
                  >
                    Disabled
                  </mat-slide-toggle>

                  <mat-slide-toggle
                    formControlName="hidden"
                    [disabled]="data.mode === 'view'"
                  >
                    Hidden
                  </mat-slide-toggle>

                  <mat-slide-toggle
                    formControlName="exact_match"
                    [disabled]="data.mode === 'view'"
                  >
                    Exact Route Match
                  </mat-slide-toggle>
                </div>

                <!-- Visibility Flags -->
                <div class="mt-4">
                  <h4 class="text-sm font-medium mb-3">
                    Visibility in Layouts
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <mat-slide-toggle
                      formControlName="show_in_default"
                      [disabled]="data.mode === 'view'"
                    >
                      Show in Default Layout
                    </mat-slide-toggle>

                    <mat-slide-toggle
                      formControlName="show_in_compact"
                      [disabled]="data.mode === 'view'"
                    >
                      Show in Compact Layout
                    </mat-slide-toggle>

                    <mat-slide-toggle
                      formControlName="show_in_horizontal"
                      [disabled]="data.mode === 'view'"
                    >
                      Show in Horizontal Layout
                    </mat-slide-toggle>

                    <mat-slide-toggle
                      formControlName="show_in_mobile"
                      [disabled]="data.mode === 'view'"
                    >
                      Show in Mobile
                    </mat-slide-toggle>
                  </div>
                </div>

                <!-- Badge -->
                <div class="mt-4">
                  <h4 class="text-sm font-medium mb-3">Badge Settings</h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Badge Title</mat-label>
                      <input
                        matInput
                        formControlName="badge_title"
                        placeholder="e.g., New, Beta"
                        [readonly]="data.mode === 'view'"
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Badge Classes</mat-label>
                      <input
                        matInput
                        formControlName="badge_classes"
                        placeholder="e.g., bg-red-500 text-white"
                        [readonly]="data.mode === 'view'"
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Badge Variant</mat-label>
                      <input
                        matInput
                        formControlName="badge_variant"
                        placeholder="e.g., primary, warn"
                        [readonly]="data.mode === 'view'"
                      />
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Permissions Tab -->
            <mat-tab label="Permissions">
              <div class="py-4">
                <!-- Selected Permissions Summary (Top) -->
                <div
                  *ngIf="permissionSelection.selected.length > 0"
                  class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800"
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
                          20
                        )
                      "
                      class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !mr-2 !mb-2"
                      [removable]="data.mode !== 'view'"
                      (removed)="togglePermission(permission, false)"
                    >
                      {{ permission.resource }}.{{ permission.action }}
                      <mat-icon matChipRemove *ngIf="data.mode !== 'view'"
                        >cancel</mat-icon
                      >
                    </mat-chip>
                    <mat-chip
                      *ngIf="permissionSelection.selected.length > 20"
                      class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200 !mr-2 !mb-2"
                    >
                      +{{ permissionSelection.selected.length - 20 }} more
                    </mat-chip>
                  </div>
                </div>

                <!-- Permission Search -->
                <mat-form-field appearance="outline" class="w-full mb-4">
                  <mat-label>Search permissions</mat-label>
                  <input
                    matInput
                    [(ngModel)]="permissionSearch"
                    [ngModelOptions]="{ standalone: true }"
                    (ngModelChange)="filterPermissions()"
                    placeholder="Search by name, resource, or action"
                    [readonly]="data.mode === 'view'"
                  />
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <!-- Permission Selection Actions -->
                <div class="flex gap-2 mb-4" *ngIf="data.mode !== 'view'">
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
                          (change)="
                            togglePermission(permission, $event.checked)
                          "
                          [disabled]="data.mode === 'view'"
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
                      [removable]="data.mode !== 'view'"
                      (removed)="togglePermission(permission, false)"
                    >
                      {{ permission.resource }}.{{ permission.action }}
                      <mat-icon matChipRemove *ngIf="data.mode !== 'view'"
                        >cancel</mat-icon
                      >
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
        </form>
      </mat-dialog-content>

      <div mat-dialog-actions align="end" class="flex gap-2">
        <button mat-button mat-dialog-close [disabled]="isLoading()">
          {{ data.mode === 'view' ? 'Close' : 'Cancel' }}
        </button>
        <button
          *ngIf="data.mode !== 'view'"
          mat-flat-button
          color="primary"
          (click)="save()"
          [disabled]="isLoading() || !navigationForm.valid"
        >
          <mat-spinner
            *ngIf="isLoading()"
            diameter="20"
            class="mr-2"
          ></mat-spinner>
          <mat-icon *ngIf="!isLoading()">save</mat-icon>
          {{ data.mode === 'create' ? 'Create Item' : 'Update Item' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .navigation-item-dialog {
        width: 100%;
        max-width: 900px;
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
        min-height: 400px;
      }
    `,
  ],
})
export class NavigationItemDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly navigationService = inject(NavigationItemsService);
  private readonly rbacService = inject(RbacService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(
    MatDialogRef<NavigationItemDialogComponent>,
  );
  readonly data = inject<NavigationItemDialogData>(MAT_DIALOG_DATA);

  // Form
  navigationForm!: FormGroup;

  // Signals
  readonly isLoading = signal(false);
  readonly isLoadingPermissions = signal(true);
  readonly availablePermissions = signal<Permission[]>([]);
  readonly groupedPermissions = signal<any[]>([]);

  // Permission management
  permissionSelection = new SelectionModel<Permission>(true, []);
  permissionSearch = '';

  ngOnInit(): void {
    this.initializeForm();
    this.loadPermissions();
  }

  private initializeForm(): void {
    // Use prefilledData for create mode (duplication), otherwise use navigationItem (edit/view)
    const item =
      this.data.mode === 'create' && this.data.prefilledData
        ? this.data.prefilledData
        : this.data.navigationItem;

    this.navigationForm = this.fb.group({
      parent_id: [item?.parent_id || null],
      key: [item?.key || '', [Validators.required, Validators.maxLength(100)]],
      title: [
        item?.title || '',
        [Validators.required, Validators.maxLength(200)],
      ],
      type: [item?.type || 'item', Validators.required],
      icon: [item?.icon || ''],
      link: [item?.link || ''],
      target: [item?.target || '_self'],
      sort_order: [item?.sort_order ?? 0],
      disabled: [item?.disabled ?? false],
      hidden: [item?.hidden ?? false],
      exact_match: [item?.exact_match ?? false],
      badge_title: [item?.badge_title || ''],
      badge_classes: [item?.badge_classes || ''],
      badge_variant: [item?.badge_variant || ''],
      show_in_default: [item?.show_in_default ?? true],
      show_in_compact: [item?.show_in_compact ?? false],
      show_in_horizontal: [item?.show_in_horizontal ?? false],
      show_in_mobile: [item?.show_in_mobile ?? true],
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

        // Pre-select permissions if editing, viewing, or duplicating
        const permissionsToSelect =
          this.data.mode === 'create' && this.data.prefilledData
            ? this.data.prefilledData.permissions
            : (this.data.mode === 'edit' || this.data.mode === 'view') &&
                this.data.navigationItem
              ? this.data.navigationItem.permissions
              : null;

        if (permissionsToSelect && permissionsToSelect.length > 0) {
          // Backend returns permissions as string[] like ['users.create', 'users.read']
          // We need to match them with Permission objects from availablePermissions
          permissionsToSelect.forEach((permissionString) => {
            const matchingPermission = response.data.find(
              (p) => `${p.resource}.${p.action}` === permissionString,
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
          (permission.description?.toLowerCase().includes(search) ?? false) ||
          permission.resource.toLowerCase().includes(search) ||
          permission.action.toLowerCase().includes(search),
      );
    }

    // Group by resource (category)
    const grouped = filtered.reduce(
      (acc, permission) => {
        const category = permission.resource;
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

  async save(): Promise<void> {
    if (this.navigationForm.invalid) {
      return;
    }

    try {
      this.isLoading.set(true);

      const formValue = this.navigationForm.value;
      const permissionIds = this.permissionSelection.selected.map((p) => p.id);

      if (this.data.mode === 'create') {
        const createRequest: CreateNavigationItemRequest = {
          parent_id: formValue.parent_id || undefined,
          key: formValue.key,
          title: formValue.title,
          type: formValue.type,
          icon: formValue.icon || undefined,
          link: formValue.link || undefined,
          target: formValue.target,
          sort_order: formValue.sort_order,
          disabled: formValue.disabled,
          hidden: formValue.hidden,
          exact_match: formValue.exact_match,
          badge_title: formValue.badge_title || undefined,
          badge_classes: formValue.badge_classes || undefined,
          badge_variant: formValue.badge_variant || undefined,
          show_in_default: formValue.show_in_default,
          show_in_compact: formValue.show_in_compact,
          show_in_horizontal: formValue.show_in_horizontal,
          show_in_mobile: formValue.show_in_mobile,
          // ✅ Always send permission_ids array (empty array = clear permissions)
          permission_ids: permissionIds,
        };

        await this.navigationService.create(createRequest).toPromise();
      } else {
        const updateRequest: UpdateNavigationItemRequest = {
          parent_id: formValue.parent_id || undefined,
          key: formValue.key,
          title: formValue.title,
          type: formValue.type,
          icon: formValue.icon || undefined,
          link: formValue.link || undefined,
          target: formValue.target,
          sort_order: formValue.sort_order,
          disabled: formValue.disabled,
          hidden: formValue.hidden,
          exact_match: formValue.exact_match,
          badge_title: formValue.badge_title || undefined,
          badge_classes: formValue.badge_classes || undefined,
          badge_variant: formValue.badge_variant || undefined,
          show_in_default: formValue.show_in_default,
          show_in_compact: formValue.show_in_compact,
          show_in_horizontal: formValue.show_in_horizontal,
          show_in_mobile: formValue.show_in_mobile,
          // ✅ Always send permission_ids array (empty array = clear permissions)
          permission_ids: permissionIds,
        };

        await this.navigationService
          .update(this.data.navigationItem!.id, updateRequest)
          .toPromise();
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to save navigation item:', error);
      this.snackBar.open(
        `Failed to ${this.data.mode === 'create' ? 'create' : 'update'} navigation item`,
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
