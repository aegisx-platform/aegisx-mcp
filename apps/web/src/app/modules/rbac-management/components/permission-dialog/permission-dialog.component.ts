import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CreatePermissionRequest,
  PermissionDialogData,
  UpdatePermissionRequest,
  getPermissionName,
} from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-permission-dialog',
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
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="permission-dialog">
      <div
        mat-dialog-title
        class="flex items-center justify-between pb-4 border-b"
      >
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl">{{
            data.mode === 'create' ? 'verified_user' : 'edit'
          }}</mat-icon>
          <h2 class="text-xl font-semibold m-0">
            {{
              data.mode === 'create'
                ? 'Create New Permission'
                : 'Edit Permission'
            }}
          </h2>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="py-6">
        <form [formGroup]="permissionForm" class="space-y-6">
          <!-- Permission Name -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Permission Name *</mat-label>
            <input
              matInput
              formControlName="name"
              placeholder="e.g. manage-users, view-reports"
              (blur)="generatePermissionName()"
            />
            <mat-hint
              >Use kebab-case for consistency (e.g. manage-users)</mat-hint
            >
            <mat-error *ngIf="permissionForm.get('name')?.hasError('required')">
              Permission name is required
            </mat-error>
            <mat-error
              *ngIf="permissionForm.get('name')?.hasError('maxlength')"
            >
              Permission name must not exceed 100 characters
            </mat-error>
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Description *</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="3"
              placeholder="Describe what this permission allows users to do"
            ></textarea>
            <mat-hint
              >{{
                permissionForm.get('description')?.value?.length || 0
              }}/500</mat-hint
            >
            <mat-error
              *ngIf="permissionForm.get('description')?.hasError('required')"
            >
              Description is required
            </mat-error>
            <mat-error
              *ngIf="permissionForm.get('description')?.hasError('maxlength')"
            >
              Description must not exceed 500 characters
            </mat-error>
          </mat-form-field>

          <!-- Resource and Action -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Resource -->
            <mat-form-field appearance="outline">
              <mat-label>Resource *</mat-label>
              <mat-select
                formControlName="resource"
                (selectionChange)="onResourceChange()"
              >
                <mat-option
                  *ngFor="let resource of data.availableResources"
                  [value]="resource"
                >
                  {{ resource }}
                </mat-option>
              </mat-select>
              <input
                matInput
                #resourceInput
                placeholder="Or enter new resource"
                (keyup.enter)="
                  addNewResource(resourceInput.value); resourceInput.value = ''
                "
                style="margin-top: 8px;"
              />
              <mat-hint>The system entity this permission applies to</mat-hint>
              <mat-error
                *ngIf="permissionForm.get('resource')?.hasError('required')"
              >
                Resource is required
              </mat-error>
            </mat-form-field>

            <!-- Action -->
            <mat-form-field appearance="outline">
              <mat-label>Action *</mat-label>
              <mat-select
                formControlName="action"
                (selectionChange)="onActionChange()"
              >
                <mat-option
                  *ngFor="let action of data.availableActions"
                  [value]="action"
                >
                  {{ action }}
                </mat-option>
              </mat-select>
              <input
                matInput
                #actionInput
                placeholder="Or enter new action"
                (keyup.enter)="
                  addNewAction(actionInput.value); actionInput.value = ''
                "
                style="margin-top: 8px;"
              />
              <mat-hint>What operation can be performed</mat-hint>
              <mat-error
                *ngIf="permissionForm.get('action')?.hasError('required')"
              >
                Action is required
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Category -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Category *</mat-label>
            <mat-select formControlName="category">
              <mat-option
                *ngFor="let category of data.availableCategories"
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
            <mat-hint>Used for organizing permissions</mat-hint>
            <mat-error
              *ngIf="permissionForm.get('category')?.hasError('required')"
            >
              Category is required
            </mat-error>
          </mat-form-field>

          <!-- Conditions (Optional) -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Conditions (Optional)</mat-label>
            <textarea
              matInput
              formControlName="conditions"
              rows="3"
              placeholder="JSON conditions for advanced permission rules (optional)"
            ></textarea>
            <mat-hint>
              Advanced: JSON format conditions for fine-grained access control
              <button
                mat-icon-button
                type="button"
                (click)="showConditionsHelp()"
                matTooltip="View examples"
              >
                <mat-icon class="text-base">help</mat-icon>
              </button>
            </mat-hint>
            <mat-error
              *ngIf="permissionForm.get('conditions')?.hasError('json')"
            >
              Must be valid JSON format
            </mat-error>
          </mat-form-field>

          <mat-divider></mat-divider>

          <!-- Permission Preview -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium mb-3 flex items-center gap-2">
              <mat-icon class="text-blue-600">preview</mat-icon>
              Permission Preview
            </h4>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="font-medium">Full Name:</span>
                <mat-chip
                  class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200"
                >
                  {{ getPreviewName() }}
                </mat-chip>
              </div>

              <div class="flex items-center gap-2">
                <span class="font-medium">Resource:</span>
                <mat-chip
                  class="!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200"
                >
                  {{ permissionForm.get('resource')?.value || 'Not set' }}
                </mat-chip>
              </div>

              <div class="flex items-center gap-2">
                <span class="font-medium">Action:</span>
                <mat-chip
                  class="!bg-purple-100 !text-purple-800 dark:!bg-purple-900 dark:!text-purple-200"
                >
                  {{ permissionForm.get('action')?.value || 'Not set' }}
                </mat-chip>
              </div>

              <div class="flex items-center gap-2">
                <span class="font-medium">Category:</span>
                <mat-chip
                  class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200"
                >
                  {{ permissionForm.get('category')?.value || 'Not set' }}
                </mat-chip>
              </div>

              <div
                *ngIf="permissionForm.get('description')?.value"
                class="mt-3"
              >
                <span class="font-medium">Description:</span>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ permissionForm.get('description')?.value }}
                </p>
              </div>
            </div>
          </div>

          <!-- Common Permission Templates (for create mode) -->
          <div *ngIf="data.mode === 'create'" class="space-y-4">
            <h4 class="font-medium flex items-center gap-2">
              <mat-icon class="text-green-600">auto_awesome</mat-icon>
              Quick Templates
            </h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                mat-stroked-button
                *ngFor="let template of permissionTemplates"
                (click)="applyTemplate(template)"
                class="text-left justify-start !p-4 !h-auto"
              >
                <div class="space-y-1">
                  <div class="font-medium">{{ template.name }}</div>
                  <div class="text-sm text-gray-600">
                    {{ template.resource }}.{{ template.action }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
        <button mat-button mat-dialog-close [disabled]="isLoading()">
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="save()"
          [disabled]="isLoading() || !permissionForm.valid"
        >
          <mat-spinner
            *ngIf="isLoading()"
            diameter="20"
            class="mr-2"
          ></mat-spinner>
          <mat-icon *ngIf="!isLoading()">save</mat-icon>
          {{
            data.mode === 'create' ? 'Create Permission' : 'Update Permission'
          }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .permission-dialog {
        width: 100%;
        max-width: 700px;
      }

      .mat-mdc-dialog-content {
        max-height: 600px;
        overflow-y: auto;
      }

      .mat-mdc-chip {
        min-height: 24px;
        font-size: 12px;
      }

      .mat-mdc-form-field {
        width: 100%;
      }

      .mat-mdc-stroked-button {
        height: auto;
        min-height: 60px;
        padding: 16px;
        text-align: left;
        justify-content: flex-start;
      }

      .mat-mdc-stroked-button:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      :host-context(.dark) .mat-mdc-stroked-button:hover {
        background-color: rgba(255, 255, 255, 0.04);
      }
    `,
  ],
})
export class PermissionDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rbacService = inject(RbacService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<PermissionDialogComponent>);
  readonly data = inject<PermissionDialogData>(MAT_DIALOG_DATA);

  // Form
  permissionForm!: FormGroup;

  // Signals
  readonly isLoading = signal(false);

  // Permission templates for quick creation
  permissionTemplates = [
    {
      name: 'View Users',
      resource: 'user',
      action: 'read',
      category: 'User Management',
      description: 'View user list and profiles',
    },
    {
      name: 'Create Users',
      resource: 'user',
      action: 'create',
      category: 'User Management',
      description: 'Create new user accounts',
    },
    {
      name: 'Edit Users',
      resource: 'user',
      action: 'update',
      category: 'User Management',
      description: 'Modify user information',
    },
    {
      name: 'Delete Users',
      resource: 'user',
      action: 'delete',
      category: 'User Management',
      description: 'Remove user accounts',
    },
    {
      name: 'View Reports',
      resource: 'report',
      action: 'read',
      category: 'Reporting',
      description: 'Access system reports',
    },
    {
      name: 'Export Data',
      resource: 'data',
      action: 'export',
      category: 'Data Management',
      description: 'Export system data',
    },
    {
      name: 'Manage Settings',
      resource: 'setting',
      action: 'manage',
      category: 'System',
      description: 'Configure system settings',
    },
    {
      name: 'View Audit Log',
      resource: 'audit',
      action: 'read',
      category: 'Security',
      description: 'Access audit trail',
    },
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.permissionForm = this.fb.group({
      name: [
        this.data.permission ? getPermissionName(this.data.permission) : '',
        [Validators.required, Validators.maxLength(100)],
      ],
      description: [
        this.data.permission?.description || '',
        [Validators.required, Validators.maxLength(500)],
      ],
      resource: [
        this.data.permission?.resource || '',
        [Validators.required, Validators.maxLength(50)],
      ],
      action: [
        this.data.permission?.action || '',
        [Validators.required, Validators.maxLength(50)],
      ],
      category: [
        this.data.permission?.category || '',
        [Validators.required, Validators.maxLength(50)],
      ],
      conditions: [
        this.data.permission?.conditions || '',
        [this.jsonValidator],
      ],
    });

    // Auto-generate permission name when resource or action changes
    this.permissionForm.get('resource')?.valueChanges.subscribe(() => {
      if (this.data.mode === 'create') {
        this.generatePermissionName();
      }
    });

    this.permissionForm.get('action')?.valueChanges.subscribe(() => {
      if (this.data.mode === 'create') {
        this.generatePermissionName();
      }
    });
  }

  // Custom validator for JSON format
  private jsonValidator(control: any) {
    if (!control.value) {
      return null; // Empty is valid (optional field)
    }

    try {
      JSON.parse(control.value);
      return null; // Valid JSON
    } catch (e) {
      return { json: true }; // Invalid JSON
    }
  }

  generatePermissionName(): void {
    const resource = this.permissionForm.get('resource')?.value;
    const action = this.permissionForm.get('action')?.value;

    if (resource && action) {
      const generatedName = `${resource}.${action}`;
      if (this.data.mode === 'create' || !this.data.permission) {
        this.permissionForm.patchValue({ name: generatedName });
      }
    }
  }

  getPreviewName(): string {
    const name = this.permissionForm.get('name')?.value;
    const resource = this.permissionForm.get('resource')?.value;
    const action = this.permissionForm.get('action')?.value;

    if (name) {
      return name;
    } else if (resource && action) {
      return `${resource}.${action}`;
    } else {
      return 'permission-name';
    }
  }

  onResourceChange(): void {
    this.generatePermissionName();
  }

  onActionChange(): void {
    this.generatePermissionName();
  }

  addNewResource(resource: string): void {
    if (resource && !this.data.availableResources.includes(resource)) {
      this.data.availableResources.push(resource);
      this.permissionForm.patchValue({ resource });
    }
  }

  addNewAction(action: string): void {
    if (action && !this.data.availableActions.includes(action)) {
      this.data.availableActions.push(action);
      this.permissionForm.patchValue({ action });
    }
  }

  addNewCategory(category: string): void {
    if (category && !this.data.availableCategories.includes(category)) {
      this.data.availableCategories.push(category);
      this.permissionForm.patchValue({ category });
    }
  }

  applyTemplate(template: any): void {
    this.permissionForm.patchValue({
      name: `${template.resource}.${template.action}`,
      description: template.description,
      resource: template.resource,
      action: template.action,
      category: template.category,
    });
  }

  showConditionsHelp(): void {
    const examples = [
      '{"owner_only": true}',
      '{"department": ["HR", "Finance"]}',
      '{"time_limit": {"start": "09:00", "end": "17:00"}}',
      '{"ip_whitelist": ["192.168.1.0/24"]}',
    ];

    this.snackBar.open(
      `Conditions examples: ${examples.join(' | ')}`,
      'Close',
      { duration: 8000 },
    );
  }

  async save(): Promise<void> {
    if (this.permissionForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    try {
      this.isLoading.set(true);

      const formValue = this.permissionForm.value;

      if (this.data.mode === 'create') {
        const createRequest: CreatePermissionRequest = {
          name: formValue.name,
          description: formValue.description,
          resource: formValue.resource,
          action: formValue.action,
          category: formValue.category,
          conditions: formValue.conditions || undefined,
        };

        await this.rbacService.createPermission(createRequest).toPromise();
      } else {
        const updateRequest: UpdatePermissionRequest = {
          name:
            formValue.name !==
            (this.data.permission
              ? getPermissionName(this.data.permission)
              : '')
              ? formValue.name
              : undefined,
          description:
            formValue.description !== this.data.permission?.description
              ? formValue.description
              : undefined,
          resource:
            formValue.resource !== this.data.permission?.resource
              ? formValue.resource
              : undefined,
          action:
            formValue.action !== this.data.permission?.action
              ? formValue.action
              : undefined,
          category:
            formValue.category !== this.data.permission?.category
              ? formValue.category
              : undefined,
          conditions:
            formValue.conditions !== this.data.permission?.conditions
              ? formValue.conditions
              : undefined,
        };

        await this.rbacService
          .updatePermission(this.data.permission!.id, updateRequest)
          .toPromise();
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to save permission:', error);
      this.snackBar.open(
        `Failed to ${this.data.mode === 'create' ? 'create' : 'update'} permission`,
        'Close',
        { duration: 3000 },
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.permissionForm.controls).forEach((key) => {
      const control = this.permissionForm.get(key);
      control?.markAsTouched();
    });
  }
}
