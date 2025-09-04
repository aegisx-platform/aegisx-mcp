# Form Validation & Error Handling

## Angular Reactive Forms with Signals

### Base Form Component Pattern

```typescript
// libs/ui-kit/src/lib/base/base-form.component.ts
@Component({
  template: '',
})
export abstract class BaseFormComponent<T = any> {
  protected fb = inject(FormBuilder);
  protected router = inject(Router);
  protected notificationService = inject(NotificationService);

  // Form state signals
  protected submittingSignal = signal(false);
  protected errorsSignal = signal<Record<string, string[]>>({});
  protected touchedSignal = signal(false);

  // Public readonly signals
  readonly submitting = this.submittingSignal.asReadonly();
  readonly errors = this.errorsSignal.asReadonly();
  readonly touched = this.touchedSignal.asReadonly();

  // Form group (to be initialized in child components)
  abstract form: FormGroup;

  // Computed validation state
  readonly isValid = computed(() => this.form?.valid && !this.submitting());
  readonly canSubmit = computed(() => this.isValid() && this.touched());

  constructor() {
    // Track form touched state
    effect(() => {
      if (this.form) {
        this.form.valueChanges.subscribe(() => {
          if (!this.touched()) {
            this.touchedSignal.set(true);
          }
        });
      }
    });
  }

  // Abstract methods to be implemented
  abstract onSubmit(): Promise<void>;
  abstract resetForm(): void;

  // Common form utilities
  protected setFieldError(field: string, error: string) {
    this.errorsSignal.update((errors) => ({
      ...errors,
      [field]: [error],
    }));
  }

  protected clearFieldError(field: string) {
    this.errorsSignal.update((errors) => {
      const newErrors = { ...errors };
      delete newErrors[field];
      return newErrors;
    });
  }

  protected setServerErrors(errors: Record<string, string[]>) {
    this.errorsSignal.set(errors);
  }

  protected clearAllErrors() {
    this.errorsSignal.set({});
  }

  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    const serverErrors = this.errors()[fieldName];

    // Server errors take precedence
    if (serverErrors?.length > 0) {
      return serverErrors[0];
    }

    // Client validation errors
    if (control?.invalid && control?.touched) {
      const errors = control.errors;
      if (errors?.['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (errors?.['email']) return 'Please enter a valid email address';
      if (errors?.['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
      if (errors?.['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
      if (errors?.['pattern']) return `${this.getFieldLabel(fieldName)} format is invalid`;
      if (errors?.['min']) return `Value must be at least ${errors['min'].min}`;
      if (errors?.['max']) return `Value must not exceed ${errors['max'].max}`;
    }

    return null;
  }

  protected getFieldLabel(fieldName: string): string {
    // Convert camelCase to Title Case
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }

  protected async handleSubmit() {
    if (!this.canSubmit()) return;

    this.submittingSignal.set(true);
    this.clearAllErrors();

    try {
      await this.onSubmit();
    } catch (error: any) {
      this.handleFormError(error);
    } finally {
      this.submittingSignal.set(false);
    }
  }

  protected handleFormError(error: any) {
    if (error.status === 422 && error.error?.errors) {
      // Validation errors from server
      this.setServerErrors(error.error.errors);
    } else if (error.status === 400 && error.error?.message) {
      // Generic bad request
      this.notificationService.error('Form Error', error.error.message);
    } else {
      // Generic error
      this.notificationService.error('Error', 'An unexpected error occurred');
    }
  }
}
```

### User Form Implementation

```typescript
// features/user/components/user-form/user-form.component.ts
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="space-y-6">
      <!-- Personal Information -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium mb-4">Personal Information</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ui-form-field label="First Name" [required]="true" [error]="getFieldError('firstName')" [loading]="checkingAvailability().firstName">
            <input matInput formControlName="firstName" placeholder="Enter first name" [class.border-red-300]="getFieldError('firstName')" class="w-full" />
          </ui-form-field>

          <ui-form-field label="Last Name" [required]="true" [error]="getFieldError('lastName')">
            <input matInput formControlName="lastName" placeholder="Enter last name" class="w-full" />
          </ui-form-field>

          <ui-form-field label="Email" [required]="true" [error]="getFieldError('email')" [loading]="checkingAvailability().email" [hint]="emailHint()" class="md:col-span-2">
            <input matInput type="email" formControlName="email" placeholder="user@example.com" class="w-full" />
          </ui-form-field>

          <ui-form-field label="Username" [required]="true" [error]="getFieldError('username')" [loading]="checkingAvailability().username" [hint]="usernameHint()">
            <input matInput formControlName="username" placeholder="Choose username" class="w-full" />
          </ui-form-field>

          @if (!isEditMode()) {
            <ui-form-field label="Password" [required]="true" [error]="getFieldError('password')" [hint]="passwordHint()">
              <input matInput type="password" formControlName="password" placeholder="Create password" class="w-full" />
            </ui-form-field>
          }
        </div>
      </div>

      <!-- Role & Permissions -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium mb-4">Role & Permissions</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ui-form-field label="Role" [required]="true" [error]="getFieldError('roleId')">
            <mat-select formControlName="roleId" placeholder="Select role">
              @for (role of availableRoles(); track role.id) {
                <mat-option [value]="role.id">
                  {{ role.name }}
                  <span class="text-sm text-gray-500 ml-2">{{ role.description }}</span>
                </mat-option>
              }
            </mat-select>
          </ui-form-field>

          <ui-form-field label="Status">
            <mat-select formControlName="isActive" placeholder="Select status">
              <mat-option [value]="true">Active</mat-option>
              <mat-option [value]="false">Inactive</mat-option>
            </mat-select>
          </ui-form-field>
        </div>

        <!-- Role Permissions Preview -->
        @if (selectedRolePermissions().length > 0) {
          <div class="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Role Permissions:</h4>
            <div class="flex flex-wrap gap-2">
              @for (permission of selectedRolePermissions(); track permission.id) {
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {{ permission.name }}
                </span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3">
        <button type="button" ui-button variant="outline" (click)="onCancel()" [disabled]="submitting()">Cancel</button>

        <button type="submit" ui-button variant="primary" [disabled]="!canSubmit()" [loading]="submitting()">
          {{ isEditMode() ? 'Update User' : 'Create User' }}
        </button>
      </div>

      <!-- Form Summary (Development Mode) -->
      @if (showFormDebug()) {
        <div class="mt-6 p-4 bg-gray-100 rounded-md text-xs">
          <strong>Form Debug Info:</strong>
          <pre>{{ getFormDebugInfo() | json }}</pre>
        </div>
      }
    </form>
  `,
})
export class UserFormComponent extends BaseFormComponent<User> implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private route = inject(ActivatedRoute);

  // Form definition
  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email], [this.emailAsyncValidator.bind(this)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)], [this.usernameAsyncValidator.bind(this)]],
    password: ['', [Validators.required, this.passwordValidator]],
    roleId: ['', Validators.required],
    isActive: [true],
  });

  // Component state
  private userIdSignal = signal<string | null>(null);
  private availableRolesSignal = signal<Role[]>([]);
  private checkingAvailabilitySignal = signal({ email: false, username: false, firstName: false });

  // Public readonly signals
  readonly userId = this.userIdSignal.asReadonly();
  readonly availableRoles = this.availableRolesSignal.asReadonly();
  readonly checkingAvailability = this.checkingAvailabilitySignal.asReadonly();

  // Computed properties
  readonly isEditMode = computed(() => !!this.userId());
  readonly selectedRole = computed(() => {
    const roleId = this.form.get('roleId')?.value;
    return this.availableRoles().find((role) => role.id === roleId);
  });
  readonly selectedRolePermissions = computed(() => this.selectedRole()?.permissions || []);

  // Form hints
  readonly emailHint = computed(() => {
    const email = this.form.get('email')?.value;
    if (!email) return 'Enter a valid email address';
    if (this.checkingAvailability().email) return 'Checking availability...';
    return 'This will be used for login and notifications';
  });

  readonly usernameHint = computed(() => {
    const username = this.form.get('username')?.value;
    if (!username) return 'Choose a unique username';
    if (this.checkingAvailability().username) return 'Checking availability...';
    return 'Letters, numbers, and underscores only';
  });

  readonly passwordHint = computed(() => {
    const password = this.form.get('password')?.value;
    const requirements = this.getPasswordRequirements(password);
    return requirements.length > 0 ? requirements.join(', ') : 'Password meets all requirements';
  });

  readonly showFormDebug = computed(() => environment.production === false);

  async ngOnInit() {
    // Load available roles
    try {
      const roles = await this.roleService.loadRoles();
      this.availableRolesSignal.set(roles);
    } catch (error) {
      this.notificationService.error('Error', 'Failed to load roles');
    }

    // Check if editing existing user
    const userId = this.route.snapshot.params['id'];
    if (userId) {
      this.userIdSignal.set(userId);
      await this.loadUser(userId);
    } else {
      // Remove password requirement for edit mode
      this.form.removeControl('password');
    }

    // Setup real-time validation
    this.setupRealtimeValidation();
  }

  private async loadUser(userId: string) {
    try {
      const user = await this.userService.loadUserById(userId);
      if (user) {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          roleId: user.role.id,
          isActive: user.isActive,
        });
      }
    } catch (error) {
      this.notificationService.error('Error', 'Failed to load user');
      this.router.navigate(['/users']);
    }
  }

  private setupRealtimeValidation() {
    // Email availability check
    effect((onCleanup) => {
      const email = this.form.get('email')?.value;
      if (email && this.form.get('email')?.valid) {
        const timeoutId = setTimeout(() => {
          this.checkEmailAvailability(email);
        }, 1000); // Debounce

        onCleanup(() => clearTimeout(timeoutId));
      }
    });

    // Username availability check
    effect((onCleanup) => {
      const username = this.form.get('username')?.value;
      if (username && this.form.get('username')?.valid) {
        const timeoutId = setTimeout(() => {
          this.checkUsernameAvailability(username);
        }, 1000);

        onCleanup(() => clearTimeout(timeoutId));
      }
    });
  }

  private async checkEmailAvailability(email: string) {
    this.checkingAvailabilitySignal.update((state) => ({ ...state, email: true }));

    try {
      const available = await this.userService.checkEmailAvailability(email, this.userId());
      if (!available) {
        this.setFieldError('email', 'This email is already taken');
      } else {
        this.clearFieldError('email');
      }
    } catch (error) {
      // Ignore availability check errors
    } finally {
      this.checkingAvailabilitySignal.update((state) => ({ ...state, email: false }));
    }
  }

  private async checkUsernameAvailability(username: string) {
    this.checkingAvailabilitySignal.update((state) => ({ ...state, username: true }));

    try {
      const available = await this.userService.checkUsernameAvailability(username, this.userId());
      if (!available) {
        this.setFieldError('username', 'This username is already taken');
      } else {
        this.clearFieldError('username');
      }
    } catch (error) {
      // Ignore availability check errors
    } finally {
      this.checkingAvailabilitySignal.update((state) => ({ ...state, username: false }));
    }
  }

  // Custom validators
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};

    if (value.length < 8) errors['minLength'] = true;
    if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
    if (!/[a-z]/.test(value)) errors['lowercase'] = true;
    if (!/[0-9]/.test(value)) errors['number'] = true;
    if (!/[!@#$%^&*]/.test(value)) errors['special'] = true;

    return Object.keys(errors).length > 0 ? errors : null;
  }

  private getPasswordRequirements(password: string): string[] {
    const requirements = [];
    if (!password || password.length < 8) requirements.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) requirements.push('One uppercase letter');
    if (!/[a-z]/.test(password)) requirements.push('One lowercase letter');
    if (!/[0-9]/.test(password)) requirements.push('One number');
    if (!/[!@#$%^&*]/.test(password)) requirements.push('One special character');
    return requirements;
  }

  // Async validators
  private emailAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) return of(null);

    return timer(1000).pipe(
      switchMap(() => this.userService.checkEmailAvailability(control.value, this.userId())),
      map((available) => (available ? null : { emailTaken: true })),
      catchError(() => of(null)),
    );
  }

  private usernameAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) return of(null);

    return timer(1000).pipe(
      switchMap(() => this.userService.checkUsernameAvailability(control.value, this.userId())),
      map((available) => (available ? null : { usernameTaken: true })),
      catchError(() => of(null)),
    );
  }

  // Implementation of abstract methods
  async onSubmit(): Promise<void> {
    const formData = this.form.value;

    if (this.isEditMode()) {
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        roleId: formData.roleId,
        isActive: formData.isActive,
      };

      await this.userService.updateUser(this.userId()!, updateData);
      this.notificationService.success('Success', 'User updated successfully');
    } else {
      const createData: CreateUserRequest = {
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        email: formData.email!,
        username: formData.username!,
        password: formData.password!,
        roleId: formData.roleId!,
        isActive: formData.isActive ?? true,
      };

      await this.userService.createUser(createData);
      this.notificationService.success('Success', 'User created successfully');
    }

    this.router.navigate(['/users']);
  }

  resetForm(): void {
    this.form.reset();
    this.clearAllErrors();
    this.touchedSignal.set(false);
  }

  onCancel() {
    if (this.form.dirty) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }

    this.router.navigate(['/users']);
  }

  getFormDebugInfo() {
    return {
      formValue: this.form.value,
      formValid: this.form.valid,
      formErrors: this.getFormErrors(),
      serverErrors: this.errors(),
      canSubmit: this.canSubmit(),
      submitting: this.submitting(),
    };
  }

  private getFormErrors() {
    const formErrors: any = {};
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control && !control.valid) {
        formErrors[key] = control.errors;
      }
    });
    return formErrors;
  }
}
```

## Advanced Validation Patterns

### Cross-Field Validation

```typescript
// Custom validator for password confirmation
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

// Usage in form
this.form = this.fb.group(
  {
    password: ['', [Validators.required, this.passwordValidator]],
    confirmPassword: ['', Validators.required],
  },
  { validators: passwordMatchValidator },
);
```

### Dynamic Form Validation

```typescript
// Dynamic validation based on user role
@Component({
  template: `
    <form [formGroup]="dynamicForm" (ngSubmit)="onSubmit()">
      @for (field of formFields(); track field.name) {
        <ui-form-field [label]="field.label" [required]="field.required" [error]="getFieldError(field.name)">
          @switch (field.type) {
            @case ('text') {
              <input matInput [formControlName]="field.name" [placeholder]="field.placeholder" />
            }
            @case ('select') {
              <mat-select [formControlName]="field.name">
                @for (option of field.options; track option.value) {
                  <mat-option [value]="option.value">{{ option.label }}</mat-option>
                }
              </mat-select>
            }
            @case ('number') {
              <input matInput type="number" [formControlName]="field.name" [placeholder]="field.placeholder" />
            }
          }
        </ui-form-field>
      }
    </form>
  `,
})
export class DynamicFormComponent implements OnInit {
  private selectedRoleSignal = signal<Role | null>(null);
  private formFieldsSignal = signal<FormField[]>([]);

  readonly selectedRole = this.selectedRoleSignal.asReadonly();
  readonly formFields = this.formFieldsSignal.asReadonly();

  dynamicForm!: FormGroup;

  ngOnInit() {
    // Watch for role changes and rebuild form
    effect(() => {
      const role = this.selectedRole();
      if (role) {
        this.buildDynamicForm(role);
      }
    });
  }

  private buildDynamicForm(role: Role) {
    const fields = this.getFieldsForRole(role);
    this.formFieldsSignal.set(fields);

    const formControls: { [key: string]: FormControl } = {};

    fields.forEach((field) => {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.minLength) validators.push(Validators.minLength(field.minLength));
      if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
      if (field.pattern) validators.push(Validators.pattern(field.pattern));

      formControls[field.name] = new FormControl(field.defaultValue || '', validators);
    });

    this.dynamicForm = this.fb.group(formControls);
  }

  private getFieldsForRole(role: Role): FormField[] {
    // Define different fields based on role
    const baseFields: FormField[] = [
      { name: 'firstName', label: 'First Name', type: 'text', required: true },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true },
    ];

    if (role.name === 'Manager') {
      baseFields.push({ name: 'department', label: 'Department', type: 'select', required: true, options: this.getDepartmentOptions() }, { name: 'teamSize', label: 'Team Size', type: 'number', required: false });
    }

    if (role.name === 'Admin') {
      baseFields.push({ name: 'accessLevel', label: 'Access Level', type: 'select', required: true, options: this.getAccessLevelOptions() });
    }

    return baseFields;
  }
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'email' | 'password';
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: Array<{ value: any; label: string }>;
}
```

### File Upload with Validation

```typescript
@Component({
  selector: 'app-file-upload',
  template: `
    <ui-form-field [label]="label()" [error]="uploadError()" [hint]="uploadHint()">
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        @if (uploading()) {
          <div class="py-4">
            <mat-spinner diameter="40"></mat-spinner>
            <p class="mt-2 text-sm text-gray-600">Uploading... {{ uploadProgress() }}%</p>
          </div>
        } @else if (uploadedFile()) {
          <div class="py-4">
            <mat-icon class="text-green-500 text-4xl mb-2">check_circle</mat-icon>
            <p class="text-sm font-medium text-gray-900">{{ uploadedFile()!.name }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(uploadedFile()!.size) }}</p>
            <button type="button" ui-button variant="outline" size="sm" (clickEvent)="removeFile()" class="mt-2">Remove</button>
          </div>
        } @else {
          <div class="py-4">
            <mat-icon class="text-gray-400 text-4xl mb-2">cloud_upload</mat-icon>
            <p class="text-sm font-medium text-gray-900">{{ dropzoneText() }}</p>
            <p class="text-xs text-gray-500">or click to browse</p>
            <input type="file" [accept]="acceptedTypes().join(',')" [multiple]="allowMultiple()" (change)="onFileSelect($event)" class="hidden" #fileInput />
            <button type="button" ui-button variant="outline" (clickEvent)="fileInput.click()" class="mt-2">Choose File{{ allowMultiple() ? 's' : '' }}</button>
          </div>
        }
      </div>
    </ui-form-field>
  `,
  hostDirectives: [
    {
      directive: CdkDropList,
      inputs: ['cdkDropListDisabled: disabled'],
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor {
  // Configuration inputs
  label = input('File Upload');
  maxSize = input(10 * 1024 * 1024); // 10MB default
  acceptedTypes = input<string[]>(['.jpg', '.jpeg', '.png', '.pdf']);
  allowMultiple = input(false);
  dropzoneText = input('Drag and drop files here');

  // State signals
  private uploadingSignal = signal(false);
  private uploadProgressSignal = signal(0);
  private uploadErrorSignal = signal<string | null>(null);
  private uploadedFileSignal = signal<File | null>(null);

  readonly uploading = this.uploadingSignal.asReadonly();
  readonly uploadProgress = this.uploadProgressSignal.asReadonly();
  readonly uploadError = this.uploadErrorSignal.asReadonly();
  readonly uploadedFile = this.uploadedFileSignal.asReadonly();

  // Computed hints
  readonly uploadHint = computed(() => {
    const types = this.acceptedTypes().join(', ');
    const size = this.formatFileSize(this.maxSize());
    return `Accepted: ${types}. Max size: ${size}`;
  });

  // ControlValueAccessor implementation
  private onChange = (value: File | File[] | null) => {};
  private onTouched = () => {};

  writeValue(value: File | File[] | null): void {
    if (value instanceof File) {
      this.uploadedFileSignal.set(value);
    }
  }

  registerOnChange(fn: (value: File | File[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      this.handleFileSelection(Array.from(files));
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(Array.from(files));
    }
  }

  private handleFileSelection(files: File[]) {
    this.uploadErrorSignal.set(null);

    // Validate files
    const validationResult = this.validateFiles(files);
    if (!validationResult.valid) {
      this.uploadErrorSignal.set(validationResult.error!);
      return;
    }

    const fileToProcess = this.allowMultiple() ? files : files[0];

    // Simulate upload progress
    this.simulateUpload(fileToProcess);
  }

  private validateFiles(files: File[]): { valid: boolean; error?: string } {
    // Check file count
    if (!this.allowMultiple() && files.length > 1) {
      return { valid: false, error: 'Only one file is allowed' };
    }

    // Check each file
    for (const file of files) {
      // Check file size
      if (file.size > this.maxSize()) {
        return {
          valid: false,
          error: `File "${file.name}" is too large. Max size: ${this.formatFileSize(this.maxSize())}`,
        };
      }

      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.acceptedTypes().includes(fileExtension)) {
        return {
          valid: false,
          error: `File type "${fileExtension}" is not allowed. Accepted: ${this.acceptedTypes().join(', ')}`,
        };
      }
    }

    return { valid: true };
  }

  private simulateUpload(file: File | File[]) {
    this.uploadingSignal.set(true);
    this.uploadProgressSignal.set(0);

    const interval = setInterval(() => {
      const progress = this.uploadProgress() + Math.random() * 15;
      this.uploadProgressSignal.set(Math.min(progress, 100));

      if (progress >= 100) {
        clearInterval(interval);
        this.uploadingSignal.set(false);

        if (!this.allowMultiple() && file instanceof File) {
          this.uploadedFileSignal.set(file);
          this.onChange(file);
        } else if (Array.isArray(file)) {
          this.onChange(file);
        }

        this.onTouched();
      }
    }, 100);
  }

  removeFile() {
    this.uploadedFileSignal.set(null);
    this.uploadProgressSignal.set(0);
    this.uploadErrorSignal.set(null);
    this.onChange(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
```

## Error Handling Patterns

### Global Error Handler

```typescript
// libs/ui-kit/src/lib/services/global-error-handler.service.ts
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private notificationService = inject(NotificationService);

  handleError(error: any): void {
    console.error('Global error caught:', error);

    let userMessage = 'An unexpected error occurred';

    if (error instanceof HttpErrorResponse) {
      userMessage = this.getHttpErrorMessage(error);
    } else if (error instanceof Error) {
      userMessage = error.message;
    }

    this.notificationService.error('Error', userMessage);
  }

  private getHttpErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Unable to connect to server. Please check your internet connection.';
      case 400:
        return error.error?.message || 'Bad request';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'Please check your input and try again.';
      case 500:
        return 'Server error occurred. Please try again later.';
      default:
        return `HTTP Error ${error.status}: ${error.message}`;
    }
  }
}

// Register in main.ts
bootstrapApplication(AppComponent, {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // ... other providers
  ],
});
```

### HTTP Error Interceptor

```typescript
// libs/ui-kit/src/lib/interceptors/error-interceptor.ts
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private notificationService = inject(NotificationService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle specific error cases
        if (error.status === 401) {
          // Redirect to login or refresh token
          this.handleUnauthorized();
        } else if (error.status === 403) {
          // Show permission error
          this.notificationService.error('Access Denied', 'You do not have permission to perform this action.');
        }

        // Re-throw error for component handling
        return throwError(() => error);
      }),
    );
  }

  private handleUnauthorized() {
    // Clear user session and redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
```

### Form Error Display Component

```typescript
@Component({
  selector: 'ui-form-errors',
  standalone: true,
  template: `
    @if (errors().length > 0) {
      <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div class="flex">
          <mat-icon class="text-red-400 mr-2">error</mat-icon>
          <div class="flex-1">
            <h3 class="text-sm font-medium text-red-800">Please fix the following {{ errors().length === 1 ? 'error' : 'errors' }}:</h3>
            <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
              @for (error of errors(); track $index) {
                <li>{{ error }}</li>
              }
            </ul>
          </div>
        </div>
      </div>
    }
  `,
})
export class FormErrorsComponent {
  errors = input<string[]>([]);
}
```

## Real-time Validation Service

### Validation Service with Debouncing

```typescript
@Injectable({ providedIn: 'root' })
export class ValidationService {
  private http = inject(HttpClient);

  // Cache for validation results
  private validationCache = new Map<string, { result: boolean; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  validateEmailAvailability(email: string, excludeUserId?: string): Observable<boolean> {
    const cacheKey = `email:${email}:${excludeUserId || 'new'}`;

    // Check cache first
    const cached = this.validationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return of(cached.result);
    }

    return this.http
      .post<{ available: boolean }>('/api/validate/email', {
        email,
        excludeUserId,
      })
      .pipe(
        map((response) => response.available),
        tap((result) => {
          this.validationCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
          });
        }),
        catchError(() => of(true)), // Assume available on error
      );
  }

  validateUsernameAvailability(username: string, excludeUserId?: string): Observable<boolean> {
    const cacheKey = `username:${username}:${excludeUserId || 'new'}`;

    const cached = this.validationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return of(cached.result);
    }

    return this.http
      .post<{ available: boolean }>('/api/validate/username', {
        username,
        excludeUserId,
      })
      .pipe(
        map((response) => response.available),
        tap((result) => {
          this.validationCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
          });
        }),
        catchError(() => of(true)),
      );
  }

  // Clear cache when needed
  clearValidationCache() {
    this.validationCache.clear();
  }
}
```

## Form State Persistence

### Auto-save Form Service

```typescript
@Injectable()
export class AutoSaveFormService {
  private readonly STORAGE_PREFIX = 'form_autosave_';
  private readonly SAVE_DELAY = 2000; // 2 seconds

  autoSave<T>(formId: string, form: FormGroup): Observable<T> {
    return form.valueChanges.pipe(
      debounceTime(this.SAVE_DELAY),
      distinctUntilChanged(),
      tap((value) => {
        localStorage.setItem(`${this.STORAGE_PREFIX}${formId}`, JSON.stringify(value));
      }),
    );
  }

  loadSavedForm(formId: string): any | null {
    const saved = localStorage.getItem(`${this.STORAGE_PREFIX}${formId}`);
    return saved ? JSON.parse(saved) : null;
  }

  clearSavedForm(formId: string): void {
    localStorage.removeItem(`${this.STORAGE_PREFIX}${formId}`);
  }

  hasSavedForm(formId: string): boolean {
    return localStorage.getItem(`${this.STORAGE_PREFIX}${formId}`) !== null;
  }
}

// Usage in component
export class UserFormComponent extends BaseFormComponent<User> implements OnInit {
  private autoSaveService = inject(AutoSaveFormService);
  private readonly FORM_ID = 'user-form';

  ngOnInit() {
    // Load saved form data
    if (this.autoSaveService.hasSavedForm(this.FORM_ID)) {
      const saved = this.autoSaveService.loadSavedForm(this.FORM_ID);
      if (saved && confirm('Found saved form data. Would you like to restore it?')) {
        this.form.patchValue(saved);
      } else {
        this.autoSaveService.clearSavedForm(this.FORM_ID);
      }
    }

    // Setup auto-save
    this.autoSaveService.autoSave(this.FORM_ID, this.form).subscribe();
  }

  async onSubmit(): Promise<void> {
    try {
      // ... submit logic
      // Clear saved data on successful submit
      this.autoSaveService.clearSavedForm(this.FORM_ID);
    } catch (error) {
      // Keep saved data on error
      throw error;
    }
  }
}
```

## Testing Form Validation

### Form Testing Utilities

```typescript
// test-utils/form-testing.utils.ts
export class FormTestingUtils {
  static setFormValue(fixture: ComponentFixture<any>, formControlName: string, value: any) {
    const input = fixture.debugElement.query(By.css(`[formControlName="${formControlName}"]`));
    if (input) {
      input.nativeElement.value = value;
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }
  }

  static triggerValidation(fixture: ComponentFixture<any>, formControlName: string) {
    const input = fixture.debugElement.query(By.css(`[formControlName="${formControlName}"]`));
    if (input) {
      input.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
    }
  }

  static getErrorMessage(fixture: ComponentFixture<any>, formControlName: string): string | null {
    const errorElement = fixture.debugElement.query(By.css(`[data-testid="${formControlName}-error"]`));
    return errorElement?.nativeElement?.textContent?.trim() || null;
  }

  static isFieldInvalid(fixture: ComponentFixture<any>, formControlName: string): boolean {
    const input = fixture.debugElement.query(By.css(`[formControlName="${formControlName}"]`));
    return input?.nativeElement?.classList?.contains('ng-invalid') || false;
  }

  static submitForm(fixture: ComponentFixture<any>) {
    const form = fixture.debugElement.query(By.css('form'));
    form.nativeElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }
}

// Form component test
describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show required error for empty first name', async () => {
    FormTestingUtils.setFormValue(fixture, 'firstName', '');
    FormTestingUtils.triggerValidation(fixture, 'firstName');

    await fixture.whenStable();

    expect(FormTestingUtils.isFieldInvalid(fixture, 'firstName')).toBe(true);
    expect(FormTestingUtils.getErrorMessage(fixture, 'firstName')).toBe('First Name is required');
  });

  it('should validate email format', async () => {
    FormTestingUtils.setFormValue(fixture, 'email', 'invalid-email');
    FormTestingUtils.triggerValidation(fixture, 'email');

    await fixture.whenStable();

    expect(FormTestingUtils.getErrorMessage(fixture, 'email')).toBe('Please enter a valid email address');
  });

  it('should prevent submission with invalid form', () => {
    spyOn(component, 'onSubmit');

    FormTestingUtils.submitForm(fixture);

    expect(component.onSubmit).not.toHaveBeenCalled();
    expect(component.canSubmit()).toBe(false);
  });
});
```

## Best Practices

### Form Validation Best Practices

1. **Client-side validation** for immediate feedback
2. **Server-side validation** for security
3. **Debounced async validation** for performance
4. **Clear error messages** with actionable guidance
5. **Progressive validation** (validate on blur, then on change)
6. **Accessibility** with proper ARIA labels and error announcements
7. **Auto-save** for long forms to prevent data loss
8. **Form state persistence** across navigation
9. **Loading states** during validation and submission
10. **Error recovery** with retry mechanisms
