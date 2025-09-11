# Authentication & Guards Patterns

## Angular Authentication with Signals

### Authentication Service

```typescript
// libs/auth/src/lib/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Authentication state signals
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private refreshTokenSignal = signal<string | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed authentication state
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role.name === 'Admin');
  readonly userPermissions = computed(() => this.currentUser()?.role.permissions || []);
  readonly tokenExpiry = computed(() => {
    const token = this.token();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  });
  readonly tokenExpiresIn = computed(() => {
    const expiry = this.tokenExpiry();
    if (!expiry) return 0;
    return Math.max(0, expiry.getTime() - Date.now());
  });
  readonly tokenNeedsRefresh = computed(() => this.tokenExpiresIn() < 5 * 60 * 1000); // 5 minutes

  constructor() {
    // Load stored authentication state
    this.loadStoredAuth();

    // Setup automatic token refresh
    this.setupTokenRefresh();

    // Setup token expiry monitoring
    this.setupTokenMonitoring();
  }

  private loadStoredAuth() {
    const storedToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('current_user');

    if (storedToken && storedUser) {
      try {
        this.tokenSignal.set(storedToken);
        this.refreshTokenSignal.set(storedRefreshToken);
        this.currentUserSignal.set(JSON.parse(storedUser));
      } catch (error) {
        this.clearStoredAuth();
      }
    }
  }

  private setupTokenRefresh() {
    // Auto-refresh token when needed
    effect(async () => {
      if (this.tokenNeedsRefresh() && this.refreshTokenSignal()) {
        await this.refreshToken();
      }
    });
  }

  private setupTokenMonitoring() {
    // Check token expiry every minute
    setInterval(() => {
      if (this.tokenExpiresIn() <= 0) {
        this.logout();
      }
    }, 60000);
  }

  async login(credentials: LoginRequest): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http.post<AuthResponse>('/api/auth/login', credentials).toPromise();

      if (response?.success && response.data) {
        this.setAuthData(response.data);
        return true;
      }

      this.errorSignal.set('Login failed');
      return false;
    } catch (error: any) {
      this.handleAuthError(error);
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async register(userData: RegisterRequest): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http.post<AuthResponse>('/api/auth/register', userData).toPromise();

      if (response?.success && response.data) {
        this.setAuthData(response.data);
        this.notificationService.success('Welcome!', 'Account created successfully');
        return true;
      }

      return false;
    } catch (error: any) {
      this.handleAuthError(error);
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.refreshTokenSignal();
    if (!refreshToken) return false;

    try {
      const response = await this.http
        .post<AuthResponse>('/api/auth/refresh', {
          refreshToken,
        })
        .toPromise();

      if (response?.success && response.data) {
        this.setAuthData(response.data);
        return true;
      }

      this.logout();
      return false;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.refreshTokenSignal();

    // Call logout endpoint if we have a refresh token
    if (refreshToken) {
      try {
        await this.http.post('/api/auth/logout', { refreshToken }).toPromise();
      } catch (error) {
        // Ignore logout errors
      }
    }

    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  async changePassword(data: ChangePasswordRequest): Promise<boolean> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http.post<{ success: boolean }>('/api/auth/change-password', data).toPromise();

      if (response?.success) {
        this.notificationService.success('Success', 'Password changed successfully');
        return true;
      }

      return false;
    } catch (error: any) {
      this.handleAuthError(error);
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async hasPermission(permission: string): Promise<boolean> {
    const permissions = this.userPermissions();
    const hasDirectPermission = permissions.some((p) => p.resource + '.' + p.action === permission);

    if (hasDirectPermission) return true;

    // Check with backend for complex business rules
    try {
      const response = await this.http
        .post<{ hasPermission: boolean }>('/api/auth/check-permission', {
          permission,
          context: this.getPermissionContext(),
        })
        .toPromise();

      return response?.hasPermission || false;
    } catch {
      return false;
    }
  }

  hasPermissionSync(permission: string): boolean {
    const permissions = this.userPermissions();
    return permissions.some((p) => p.resource + '.' + p.action === permission);
  }

  private getPermissionContext(): any {
    return {
      currentTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  hasRole(roleName: string): boolean {
    return this.currentUser()?.role.name === roleName;
  }

  private setAuthData(authData: AuthData) {
    this.tokenSignal.set(authData.accessToken);
    this.refreshTokenSignal.set(authData.refreshToken);
    this.currentUserSignal.set(authData.user);

    // Store in localStorage
    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('refresh_token', authData.refreshToken);
    localStorage.setItem('current_user', JSON.stringify(authData.user));
  }

  private clearAuthData() {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.clearStoredAuth();
  }

  private clearStoredAuth() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  private handleAuthError(error: any) {
    let message = 'Authentication failed';

    if (error.status === 401) {
      message = 'Invalid credentials';
    } else if (error.status === 422 && error.error?.errors) {
      message = Object.values(error.error.errors).flat().join(', ');
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.errorSignal.set(message);
  }
}

interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface AuthResponse {
  success: boolean;
  data?: AuthData;
  message?: string;
}
```

### Permission Service

```typescript
// libs/auth/src/lib/services/permission.service.ts
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private authService = inject(AuthService);

  // Permission cache for performance
  private permissionCacheSignal = signal(new Map<string, boolean>());

  readonly permissionCache = this.permissionCacheSignal.asReadonly();
  readonly userPermissions = this.authService.userPermissions;

  // Role hierarchy for easy checks
  private readonly roleHierarchy = {
    'Super Admin': ['Admin', 'Manager', 'User', 'Guest'],
    Admin: ['Manager', 'User', 'Guest'],
    Manager: ['User', 'Guest'],
    User: ['Guest'],
    Guest: [],
  };

  checkPermission(permission: string): boolean {
    // Check cache first
    const cached = this.permissionCache().get(permission);
    if (cached !== undefined) return cached;

    const hasPermission = this.hasDirectPermission(permission) || this.hasRoleBasedPermission(permission);

    // Cache result
    this.permissionCacheSignal.update((cache) => new Map(cache).set(permission, hasPermission));

    return hasPermission;
  }

  private hasDirectPermission(permission: string): boolean {
    const [resource, action] = permission.split('.');
    const permissions = this.userPermissions();

    return permissions.some((p) => p.resource === resource && p.action === action);
  }

  private hasRoleBasedPermission(permission: string): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    const userRole = currentUser.role.name;
    const [resource] = permission.split('.');

    // Check if user role can access resource based on hierarchy
    if (resource === 'admin' && this.isAdminOrHigher(userRole)) return true;
    if (resource === 'manager' && this.isManagerOrHigher(userRole)) return true;

    return false;
  }

  hasRole(roleName: string): boolean {
    return this.authService.currentUser()?.role.name === roleName;
  }

  hasAnyRole(roleNames: string[]): boolean {
    const userRole = this.authService.currentUser()?.role.name;
    return userRole ? roleNames.includes(userRole) : false;
  }

  isRoleOrHigher(targetRole: string): boolean {
    const userRole = this.authService.currentUser()?.role.name;
    if (!userRole) return false;

    const userLevel = this.getRoleLevel(userRole);
    const targetLevel = this.getRoleLevel(targetRole);

    return userLevel >= targetLevel;
  }

  private isAdminOrHigher(role: string): boolean {
    return ['Super Admin', 'Admin'].includes(role);
  }

  private isManagerOrHigher(role: string): boolean {
    return ['Super Admin', 'Admin', 'Manager'].includes(role);
  }

  private getRoleLevel(role: string): number {
    const levels = {
      'Super Admin': 4,
      Admin: 3,
      Manager: 2,
      User: 1,
      Guest: 0,
    };
    return levels[role] || 0;
  }

  // Clear cache when user changes
  clearCache() {
    this.permissionCacheSignal.set(new Map());
  }
}
```

## Route Guards

### Authentication Guard

```typescript
// libs/auth/src/lib/guards/auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  private authService = inject(AuthService);
  private router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.checkAuth(state.url);
  }

  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.checkAuth(state.url);
  }

  private async checkAuth(url: string): Promise<boolean> {
    const isAuthenticated = this.authService.isAuthenticated();

    if (!isAuthenticated) {
      // Store intended URL for redirect after login
      localStorage.setItem('intended_url', url);
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if token needs refresh
    if (this.authService.tokenNeedsRefresh()) {
      const refreshed = await this.authService.refreshToken();
      if (!refreshed) {
        this.router.navigate(['/auth/login']);
        return false;
      }
    }

    return true;
  }
}
```

### Permission Guard

```typescript
// libs/auth/src/lib/guards/permission.guard.ts
@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermission = route.data['requiredPermission'] as string;
    const requiredRole = route.data['requiredRole'] as string;
    const allowedRoles = route.data['allowedRoles'] as string[];

    // Check permission if specified
    if (requiredPermission && !this.permissionService.checkPermission(requiredPermission)) {
      this.handleAccessDenied('You do not have permission to access this page');
      return false;
    }

    // Check specific role if specified
    if (requiredRole && !this.permissionService.hasRole(requiredRole)) {
      this.handleAccessDenied(`This page requires ${requiredRole} role`);
      return false;
    }

    // Check if user has any of the allowed roles
    if (allowedRoles && !this.permissionService.hasAnyRole(allowedRoles)) {
      this.handleAccessDenied(`Access restricted to: ${allowedRoles.join(', ')}`);
      return false;
    }

    return true;
  }

  private handleAccessDenied(message: string) {
    this.notificationService.error('Access Denied', message);
    this.router.navigate(['/403']);
  }
}
```

### Form Guard (CanDeactivate)

```typescript
// Prevent navigation away from unsaved forms
@Injectable()
export class FormGuard implements CanDeactivate<unknown> {
  canDeactivate(component: any): boolean | Observable<boolean> {
    // Check if component has unsaved changes
    if (component.form?.dirty && !component.submitting?.()) {
      return this.showUnsavedChangesDialog();
    }

    return true;
  }

  private showUnsavedChangesDialog(): Observable<boolean> {
    return new Observable((observer) => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Unsaved Changes',
          message: 'You have unsaved changes. Are you sure you want to leave?',
          confirmText: 'Leave',
          cancelText: 'Stay',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        observer.next(!!result);
        observer.complete();
      });
    });
  }

  constructor(private dialog: MatDialog) {}
}
```

### Role-Based Guard

```typescript
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private permissionService = inject(PermissionService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles = route.data['roles'] as string[];
    const minimumRole = route.data['minimumRole'] as string;

    if (allowedRoles && !this.permissionService.hasAnyRole(allowedRoles)) {
      this.router.navigate(['/403']);
      return false;
    }

    if (minimumRole && !this.permissionService.isRoleOrHigher(minimumRole)) {
      this.router.navigate(['/403']);
      return false;
    }

    return true;
  }
}
```

## HTTP Interceptors

### Authentication Interceptor

```typescript
// libs/auth/src/lib/interceptors/auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth for public endpoints
    if (this.isPublicEndpoint(req.url)) {
      return next.handle(req);
    }

    const token = this.authService.token();

    if (token) {
      // Add Authorization header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Token expired or invalid
            this.handleUnauthorized();
          }
          return throwError(() => error);
        }),
      );
    }

    return next.handle(req);
  }

  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/health'];

    return publicEndpoints.some((endpoint) => url.includes(endpoint));
  }

  private handleUnauthorized() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
```

### Retry Interceptor with Exponential Backoff

```typescript
@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only retry GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      retryWhen((errors) =>
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3 || error.status < 500) {
              throw error;
            }
            return retryCount + 1;
          }, 0),
          delay(1000), // Exponential backoff: 1s, 2s, 4s
        ),
      ),
    );
  }
}
```

## Authentication Components

### Login Component with Signals

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <img src="/assets/logo.svg" alt="Logo" class="mx-auto h-12 w-auto" />
          <h2 class="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          @if (authService.error()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {{ authService.error() }}
            </div>
          }

          <div class="space-y-4">
            <ui-form-field label="Email" [required]="true" [error]="getFieldError('email')">
              <input matInput type="email" formControlName="email" placeholder="Enter your email" autocomplete="email" class="w-full" />
            </ui-form-field>

            <ui-form-field label="Password" [required]="true" [error]="getFieldError('password')">
              <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Enter your password" autocomplete="current-password" class="w-full" />
              <button type="button" mat-icon-button matSuffix (click)="togglePasswordVisibility()">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </ui-form-field>
          </div>

          <div class="flex items-center justify-between">
            <mat-checkbox formControlName="rememberMe"> Remember me </mat-checkbox>

            <a routerLink="/auth/forgot-password" class="text-sm text-primary-600 hover:text-primary-500"> Forgot your password? </a>
          </div>

          <ui-button type="submit" variant="primary" size="lg" [disabled]="!loginForm.valid" [loading]="authService.loading()" class="w-full"> Sign In </ui-button>

          <div class="text-center">
            <span class="text-sm text-gray-600">Don't have an account? </span>
            <a routerLink="/auth/register" class="text-sm text-primary-600 hover:text-primary-500 font-medium"> Sign up </a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent extends BaseFormComponent<LoginRequest> {
  authService = inject(AuthService);

  // Component state
  private showPasswordSignal = signal(false);
  readonly showPassword = this.showPasswordSignal.asReadonly();

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  constructor() {
    super();

    // Auto-focus first field
    setTimeout(() => {
      document.querySelector('input[formControlName="email"]')?.focus();
    }, 100);
  }

  async onSubmit(): Promise<void> {
    const credentials = this.form.value as LoginRequest;
    const success = await this.authService.login(credentials);

    if (success) {
      // Redirect to intended URL or dashboard
      const intendedUrl = localStorage.getItem('intended_url') || '/dashboard';
      localStorage.removeItem('intended_url');
      this.router.navigate([intendedUrl]);
    }
  }

  resetForm(): void {
    this.form.reset();
    this.clearAllErrors();
  }

  togglePasswordVisibility() {
    this.showPasswordSignal.update((show) => !show);
  }
}
```

### Registration Component

```typescript
@Component({
  selector: 'app-register',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p class="mt-2 text-sm text-gray-600">Join us today and get started</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="mt-8 space-y-6">
          @if (authService.error()) {
            <ui-form-errors [errors]="[authService.error()!]"></ui-form-errors>
          }

          <div class="grid grid-cols-2 gap-4">
            <ui-form-field label="First Name" [required]="true" [error]="getFieldError('firstName')">
              <input matInput formControlName="firstName" placeholder="John" class="w-full" />
            </ui-form-field>

            <ui-form-field label="Last Name" [required]="true" [error]="getFieldError('lastName')">
              <input matInput formControlName="lastName" placeholder="Doe" class="w-full" />
            </ui-form-field>
          </div>

          <ui-form-field label="Email" [required]="true" [error]="getFieldError('email')">
            <input matInput type="email" formControlName="email" placeholder="john@example.com" class="w-full" />
          </ui-form-field>

          <ui-form-field label="Username" [required]="true" [error]="getFieldError('username')" [hint]="usernameHint()">
            <input matInput formControlName="username" placeholder="johndoe" class="w-full" />
          </ui-form-field>

          <ui-form-field label="Password" [required]="true" [error]="getFieldError('password')" [hint]="passwordHint()">
            <input matInput type="password" formControlName="password" placeholder="Create password" class="w-full" />
          </ui-form-field>

          <ui-form-field label="Confirm Password" [required]="true" [error]="getFieldError('confirmPassword')">
            <input matInput type="password" formControlName="confirmPassword" placeholder="Confirm password" class="w-full" />
          </ui-form-field>

          <div>
            <mat-checkbox formControlName="agreeToTerms" [required]="true">
              I agree to the
              <a href="/terms" target="_blank" class="text-primary-600 hover:text-primary-500">Terms of Service</a>
              and
              <a href="/privacy" target="_blank" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
            </mat-checkbox>
          </div>

          <ui-button type="submit" variant="primary" size="lg" [disabled]="!canSubmit()" [loading]="submitting()" class="w-full"> Create Account </ui-button>

          <div class="text-center">
            <span class="text-sm text-gray-600">Already have an account? </span>
            <a routerLink="/auth/login" class="text-sm text-primary-600 hover:text-primary-500 font-medium"> Sign in </a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent extends BaseFormComponent<RegisterRequest> {
  authService = inject(AuthService);

  form = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  readonly usernameHint = computed(() => {
    const username = this.form.get('username')?.value;
    if (!username) return 'Choose a unique username';
    return 'Letters, numbers, and underscores only';
  });

  readonly passwordHint = computed(() => {
    const password = this.form.get('password')?.value;
    const requirements = this.getPasswordRequirements(password);
    return requirements.length > 0 ? requirements.join(', ') : 'Password meets all requirements';
  });

  async onSubmit(): Promise<void> {
    const userData = this.form.value as RegisterRequest;
    const success = await this.authService.register(userData);

    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }

  resetForm(): void {
    this.form.reset();
    this.clearAllErrors();
  }

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

  private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private getPasswordRequirements(password: string): string[] {
    const requirements = [];
    if (!password || password.length < 8) requirements.push('8+ characters');
    if (!/[A-Z]/.test(password)) requirements.push('uppercase letter');
    if (!/[a-z]/.test(password)) requirements.push('lowercase letter');
    if (!/[0-9]/.test(password)) requirements.push('number');
    if (!/[!@#$%^&*]/.test(password)) requirements.push('special character');
    return requirements;
  }
}
```

## Authorization Directives

### Permission Directive

```typescript
// libs/auth/src/lib/directives/has-permission.directive.ts
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() appHasPermission!: string;
  @Input() appHasPermissionOr?: string[]; // Alternative permissions
  @Input() appHasPermissionRole?: string; // Required role

  private permissionService = inject(PermissionService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private hasView = false;

  ngOnInit() {
    this.updateView();

    // Re-check permissions when user changes
    effect(() => {
      this.permissionService.userPermissions();
      this.updateView();
    });
  }

  ngOnDestroy() {
    this.viewContainer.clear();
  }

  private updateView() {
    const hasPermission = this.checkPermissions();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermissions(): boolean {
    // Check main permission
    if (this.appHasPermission && this.permissionService.checkPermission(this.appHasPermission)) {
      return true;
    }

    // Check alternative permissions (OR logic)
    if (this.appHasPermissionOr?.some((permission) => this.permissionService.checkPermission(permission))) {
      return true;
    }

    // Check role requirement
    if (this.appHasPermissionRole && this.permissionService.hasRole(this.appHasPermissionRole)) {
      return true;
    }

    return false;
  }
}

// Usage in templates
@Component({
  template: `
    <!-- Show only if user has permission -->
    <ui-button *appHasPermission="'users.create'" (clickEvent)="createUser()"> Add User </ui-button>

    <!-- Show if user has any of these permissions -->
    <div *appHasPermission="'admin.access'; or: ['manager.access', 'reports.access']">Admin Panel</div>

    <!-- Show only for specific role -->
    <div *appHasPermission="''; role: 'Super Admin'">Super Admin Tools</div>
  `,
})
export class ExampleComponent {}
```

### Role Directive

```typescript
@Directive({
  selector: '[appForRole]',
  standalone: true,
})
export class ForRoleDirective implements OnInit {
  @Input() appForRole!: string | string[];
  @Input() appForRoleMode: 'any' | 'all' = 'any';

  private permissionService = inject(PermissionService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    const hasRole = this.checkRole();

    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkRole(): boolean {
    const roles = Array.isArray(this.appForRole) ? this.appForRole : [this.appForRole];

    if (this.appForRoleMode === 'all') {
      return roles.every((role) => this.permissionService.hasRole(role));
    }

    return roles.some((role) => this.permissionService.hasRole(role));
  }
}
```

## Session Management

### Session Timeout Service

```typescript
@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  private lastActivitySignal = signal(Date.now());
  private sessionWarningShownSignal = signal(false);

  readonly lastActivity = this.lastActivitySignal.asReadonly();
  readonly sessionWarningShown = this.sessionWarningShownSignal.asReadonly();

  // Session configuration
  private readonly TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly WARNING_DURATION = 5 * 60 * 1000; // 5 minutes before timeout

  readonly timeUntilTimeout = computed(() => {
    const lastActivity = this.lastActivity();
    const elapsed = Date.now() - lastActivity;
    return Math.max(0, this.TIMEOUT_DURATION - elapsed);
  });

  readonly showWarning = computed(() => {
    const timeLeft = this.timeUntilTimeout();
    return timeLeft > 0 && timeLeft <= this.WARNING_DURATION;
  });

  constructor() {
    this.setupActivityTracking();
    this.setupTimeoutMonitoring();
  }

  private setupActivityTracking() {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          this.updateActivity();
        },
        { passive: true },
      );
    });
  }

  private setupTimeoutMonitoring() {
    // Check session timeout every minute
    setInterval(() => {
      if (!this.authService.isAuthenticated()) return;

      const timeLeft = this.timeUntilTimeout();

      if (timeLeft <= 0) {
        this.handleSessionTimeout();
      } else if (this.showWarning() && !this.sessionWarningShown()) {
        this.showSessionWarning();
      }
    }, 60000);
  }

  private updateActivity() {
    this.lastActivitySignal.set(Date.now());
    this.sessionWarningShownSignal.set(false);
  }

  private showSessionWarning() {
    this.sessionWarningShownSignal.set(true);

    const dialogRef = this.dialog.open(SessionWarningDialogComponent, {
      data: { timeLeft: Math.floor(this.timeUntilTimeout() / 1000) },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'extend') {
        this.extendSession();
      } else {
        this.authService.logout();
      }
    });
  }

  private handleSessionTimeout() {
    this.authService.logout();
    this.dialog.open(SessionExpiredDialogComponent, {
      disableClose: true,
    });
  }

  private async extendSession() {
    await this.authService.refreshToken();
    this.updateActivity();
  }
}
```

### Session Warning Dialog

```typescript
@Component({
  selector: 'app-session-warning-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title>Session Expiring</h2>

    <mat-dialog-content>
      <div class="text-center py-4">
        <mat-icon class="text-orange-500 text-6xl mb-4">schedule</mat-icon>
        <p class="text-lg mb-2">Your session will expire in</p>
        <p class="text-3xl font-bold text-orange-600">{{ timeLeft() }} seconds</p>
        <p class="text-sm text-gray-600 mt-2">Click "Stay Logged In" to extend your session</p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="logout()" color="warn">Logout Now</button>
      <button mat-raised-button (click)="extendSession()" color="primary">Stay Logged In</button>
    </mat-dialog-actions>
  `,
})
export class SessionWarningDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<SessionWarningDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  private timeLeftSignal = signal(this.data.timeLeft);
  readonly timeLeft = this.timeLeftSignal.asReadonly();

  ngOnInit() {
    // Countdown timer
    const interval = setInterval(() => {
      const current = this.timeLeft();
      if (current <= 1) {
        clearInterval(interval);
        this.logout();
      } else {
        this.timeLeftSignal.set(current - 1);
      }
    }, 1000);
  }

  extendSession() {
    this.dialogRef.close('extend');
  }

  logout() {
    this.dialogRef.close('logout');
  }
}
```

## Route Configuration Examples

### Protected Routes with Multiple Guards

```typescript
// Complete route configuration with guards
export const routes: Routes = [
  // Public routes
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
    ],
  },

  // Protected application routes
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Dashboard',
      },

      // User management - requires users.read permission
      {
        path: 'users',
        canActivate: [PermissionGuard],
        canActivateChild: [PermissionGuard],
        data: { requiredPermission: 'users.read' },
        children: [
          {
            path: '',
            loadComponent: () => import('./users/user-list.component').then((m) => m.UserListComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./users/user-form.component').then((m) => m.UserFormComponent),
            canActivate: [PermissionGuard],
            canDeactivate: [FormGuard],
            data: { requiredPermission: 'users.create' },
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./users/user-form.component').then((m) => m.UserFormComponent),
            canActivate: [PermissionGuard],
            canDeactivate: [FormGuard],
            data: { requiredPermission: 'users.update' },
          },
        ],
      },

      // Admin panel - requires Admin role
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { minimumRole: 'Admin' },
        loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
      },

      // Settings - accessible to all authenticated users
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.routes').then((m) => m.settingsRoutes),
      },
    ],
  },

  // Error pages
  { path: '403', component: ForbiddenComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];
```

## Testing Authentication

### Auth Service Testing

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        user: { id: '1', email: 'test@example.com' },
      },
    };

    const loginPromise = service.login({ email: 'test@example.com', password: 'password' });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const result = await loginPromise;
    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('test@example.com');
  });

  it('should handle login errors', async () => {
    const loginPromise = service.login({ email: 'test@example.com', password: 'wrong' });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    const result = await loginPromise;
    expect(result).toBe(false);
    expect(service.error()).toBe('Invalid credentials');
  });
});
```

### Guard Testing

```typescript
describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let permissionService: jasmine.SpyObj<PermissionService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('PermissionService', ['checkPermission']);

    TestBed.configureTestingModule({
      providers: [PermissionGuard, { provide: PermissionService, useValue: spy }],
    });

    guard = TestBed.inject(PermissionGuard);
    permissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
  });

  it('should allow access with correct permission', () => {
    permissionService.checkPermission.and.returnValue(true);

    const route = { data: { requiredPermission: 'users.read' } } as ActivatedRouteSnapshot;
    expect(guard.canActivate(route)).toBe(true);
  });

  it('should deny access without permission', () => {
    permissionService.checkPermission.and.returnValue(false);

    const route = { data: { requiredPermission: 'admin.access' } } as ActivatedRouteSnapshot;
    expect(guard.canActivate(route)).toBe(false);
  });
});
```

### E2E Authentication Testing

```typescript
// e2e/auth.spec.ts
test.describe('Authentication Flow', () => {
  test('should login and access protected pages', async ({ page }) => {
    // Go to protected page (should redirect to login)
    await page.goto('/users');
    await expect(page).toHaveURL('/auth/login');

    // Login
    await page.fill('[formControlName="email"]', 'admin@test.com');
    await page.fill('[formControlName="password"]', 'password');
    await page.click('button[type="submit"]');

    // Should redirect to intended page
    await expect(page).toHaveURL('/users');

    // Verify user is logged in
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('should show permission-based UI elements', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/users');

    // Admin should see admin-only buttons
    await expect(page.getByTestId('bulk-actions')).toBeVisible();
    await expect(page.getByTestId('admin-settings')).toBeVisible();
  });

  test('should handle session timeout', async ({ page }) => {
    await loginAsUser(page);

    // Simulate token expiry
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'expired-token');
    });

    // Try to access protected resource
    await page.goto('/users');

    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByText('Session expired')).toBeVisible();
  });
});
```

## Security Best Practices

### Token Security

```typescript
// Secure token storage (consider using httpOnly cookies in production)
@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly TOKEN_KEY = 'app_token';
  private readonly REFRESH_KEY = 'app_refresh';

  // Encrypt tokens before storing (in production)
  setToken(token: string) {
    if (environment.production) {
      // Use secure storage or httpOnly cookies
      this.setSecureCookie('token', token);
    } else {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (environment.production) {
      return this.getSecureCookie('token');
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSecureCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; Secure; HttpOnly; SameSite=Strict`;
  }

  private getSecureCookie(name: string): string | null {
    // Implementation for reading secure cookies
    return null;
  }
}
```

### XSS Protection

```typescript
// XSS protection service
@Injectable({ providedIn: 'root' })
export class XSSProtectionService {
  sanitizeInput(input: string): string {
    return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
  }

  sanitizeHTML(html: string): SafeHtml {
    const sanitizer = inject(DomSanitizer);
    return sanitizer.sanitize(SecurityContext.HTML, html) || '';
  }
}
```

## Best Practices

### Authentication Security

1. **JWT Storage**: Use httpOnly cookies in production
2. **Token Refresh**: Implement automatic token refresh
3. **Session Timeout**: Monitor user activity and timeout inactive sessions
4. **CSRF Protection**: Use CSRF tokens for state-changing operations
5. **Permission Caching**: Cache permission checks for performance
6. **Route Protection**: Protect all sensitive routes with guards
7. **Error Handling**: Don't expose sensitive information in error messages
8. **Audit Logging**: Log authentication events for security monitoring

### UX Best Practices

1. **Loading States**: Show loading indicators during auth operations
2. **Error Messages**: Provide clear, actionable error messages
3. **Session Warnings**: Warn users before session expires
4. **Remember Me**: Implement secure "remember me" functionality
5. **Password Strength**: Show real-time password strength feedback
6. **Progressive Disclosure**: Show advanced options only when needed
7. **Accessibility**: Ensure auth forms are accessible to all users
8. **Mobile Optimization**: Optimize auth flows for mobile devices
