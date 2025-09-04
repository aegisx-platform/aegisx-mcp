# Frontend Multi-tenancy Support

## Tenant Service with Signals

```typescript
// libs/tenant/src/lib/services/tenant.service.ts
@Injectable({ providedIn: 'root' })
export class TenantService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  // Tenant state signals
  private currentTenantSignal = signal<Tenant | null>(null);
  private tenantsSignal = signal<Tenant[]>([]);
  private tenantPermissionsSignal = signal<TenantPermission[]>([]);
  private tenantSettingsSignal = signal<TenantSettings | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly currentTenant = this.currentTenantSignal.asReadonly();
  readonly tenants = this.tenantsSignal.asReadonly();
  readonly tenantPermissions = this.tenantPermissionsSignal.asReadonly();
  readonly tenantSettings = this.tenantSettingsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  // Computed signals
  readonly tenantId = computed(() => this.currentTenant()?.id || null);
  readonly tenantName = computed(() => this.currentTenant()?.name || 'No Tenant');
  readonly tenantLogo = computed(() => this.currentTenant()?.logoUrl || '/assets/default-logo.png');
  readonly isMultiTenant = computed(() => this.tenants().length > 1);
  readonly canSwitchTenant = computed(() => this.tenants().length > 1);

  readonly tenantTheme = computed(() => ({
    primaryColor: this.currentTenant()?.primaryColor || '#1976d2',
    secondaryColor: this.currentTenant()?.secondaryColor || '#dc004e',
    logoUrl: this.tenantLogo(),
    customCss: this.currentTenant()?.customCss || '',
  }));

  constructor() {
    // Load tenant when user authenticates
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadUserTenants();
      } else {
        this.clearTenantData();
      }
    });
  }

  async loadUserTenants(): Promise<void> {
    this.loadingSignal.set(true);

    try {
      // Get user's tenants
      const tenants = await this.apiService.get<Tenant[]>('/api/tenants/user');
      this.tenantsSignal.set(tenants);

      // Set current tenant (from localStorage or first available)
      const savedTenantId = localStorage.getItem('currentTenantId');
      const currentTenant = savedTenantId ? tenants.find((t) => t.id === savedTenantId) : tenants[0];

      if (currentTenant) {
        await this.setCurrentTenant(currentTenant.id);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async setCurrentTenant(tenantId: string): Promise<void> {
    const tenant = this.tenants().find((t) => t.id === tenantId);
    if (!tenant) return;

    this.currentTenantSignal.set(tenant);
    localStorage.setItem('currentTenantId', tenantId);

    // Load tenant-specific data
    await Promise.all([this.loadTenantPermissions(tenantId), this.loadTenantSettings(tenantId)]);

    // Apply tenant theme
    this.applyTenantTheme(tenant);

    // Notify other services of tenant switch
    window.dispatchEvent(
      new CustomEvent('tenantChanged', {
        detail: { tenant, tenantId },
      }),
    );
  }

  async loadTenantPermissions(tenantId: string): Promise<void> {
    try {
      const permissions = await this.apiService.get<TenantPermission[]>(`/api/tenants/${tenantId}/permissions`);
      this.tenantPermissionsSignal.set(permissions);
    } catch (error) {
      console.error('Failed to load tenant permissions:', error);
    }
  }

  async loadTenantSettings(tenantId: string): Promise<void> {
    try {
      const settings = await this.apiService.get<TenantSettings>(`/api/tenants/${tenantId}/settings`);
      this.tenantSettingsSignal.set(settings);
    } catch (error) {
      console.error('Failed to load tenant settings:', error);
    }
  }

  private applyTenantTheme(tenant: Tenant): void {
    // Apply CSS custom properties for theming
    const root = document.documentElement;
    root.style.setProperty('--tenant-primary', tenant.primaryColor || '#1976d2');
    root.style.setProperty('--tenant-secondary', tenant.secondaryColor || '#dc004e');

    // Apply custom CSS if provided
    if (tenant.customCss) {
      let styleElement = document.getElementById('tenant-styles') as HTMLStyleElement;
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'tenant-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = tenant.customCss;
    }
  }

  private clearTenantData(): void {
    this.currentTenantSignal.set(null);
    this.tenantsSignal.set([]);
    this.tenantPermissionsSignal.set([]);
    this.tenantSettingsSignal.set(null);
    localStorage.removeItem('currentTenantId');
  }

  // Permission checking with tenant context
  hasPermission(permission: string): boolean {
    const permissions = this.tenantPermissions();
    return permissions.some((p) => p.resource + '.' + p.action === permission && p.granted);
  }

  // Get tenant-specific setting
  getSetting<T>(key: string, defaultValue: T): T {
    const settings = this.tenantSettings();
    return settings?.settings?.[key] ?? defaultValue;
  }
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customCss?: string;
  isActive: boolean;
  subscription: {
    plan: string;
    status: string;
    expiresAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TenantPermission {
  id: string;
  resource: string;
  action: string;
  granted: boolean;
  conditions?: any;
}

interface TenantSettings {
  tenantId: string;
  settings: Record<string, any>;
  updatedAt: string;
}
```

## Tenant Selector Component

```typescript
// libs/tenant/src/lib/components/tenant-selector.component.ts
@Component({
  selector: 'app-tenant-selector',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="tenant-selector">
      @if (canSwitchTenant()) {
        <button mat-button [matMenuTriggerFor]="tenantMenu" class="tenant-button flex items-center space-x-2">
          <img [src]="tenantLogo()" [alt]="tenantName()" class="w-6 h-6 rounded" />
          <span class="font-medium">{{ tenantName() }}</span>
          <mat-icon>expand_more</mat-icon>
        </button>

        <mat-menu #tenantMenu="matMenu" class="tenant-menu">
          <div class="px-4 py-2 border-b">
            <p class="text-sm font-medium text-gray-900">Switch Organization</p>
            <p class="text-xs text-gray-500">Current: {{ tenantName() }}</p>
          </div>

          @for (tenant of tenants(); track tenant.id) {
            <button mat-menu-item (click)="switchTenant(tenant.id)" [class.bg-blue-50]="tenant.id === tenantId()">
              <div class="flex items-center space-x-3 w-full">
                <img [src]="tenant.logoUrl || '/assets/default-logo.png'" [alt]="tenant.name" class="w-8 h-8 rounded" />
                <div class="flex-1 text-left">
                  <p class="font-medium">{{ tenant.name }}</p>
                  <p class="text-xs text-gray-500">{{ tenant.subscription.plan }}</p>
                </div>
                @if (tenant.id === tenantId()) {
                  <mat-icon class="text-blue-600">check</mat-icon>
                }
              </div>
            </button>
          }

          <mat-divider></mat-divider>

          <button mat-menu-item (click)="manageTenants()">
            <mat-icon>settings</mat-icon>
            <span>Manage Organizations</span>
          </button>
        </mat-menu>
      } @else {
        <!-- Single tenant display -->
        <div class="flex items-center space-x-2">
          <img [src]="tenantLogo()" [alt]="tenantName()" class="w-6 h-6 rounded" />
          <span class="font-medium">{{ tenantName() }}</span>
        </div>
      }
    </div>
  `,
})
export class TenantSelectorComponent {
  private tenantService = inject(TenantService);
  private router = inject(Router);

  // Service signals
  currentTenant = this.tenantService.currentTenant;
  tenants = this.tenantService.tenants;
  tenantId = this.tenantService.tenantId;
  tenantName = this.tenantService.tenantName;
  tenantLogo = this.tenantService.tenantLogo;
  canSwitchTenant = this.tenantService.canSwitchTenant;

  async switchTenant(tenantId: string): Promise<void> {
    await this.tenantService.setCurrentTenant(tenantId);

    // Refresh current route to reload tenant-specific data
    const currentUrl = this.router.url;
    await this.router.navigateByUrl('/', { skipLocationChange: true });
    await this.router.navigate([currentUrl]);
  }

  manageTenants(): void {
    this.router.navigate(['/settings/organizations']);
  }
}
```

## Tenant Guard

```typescript
// libs/tenant/src/lib/guards/tenant.guard.ts
@Injectable({
  providedIn: 'root',
})
export class TenantGuard implements CanActivate {
  private tenantService = inject(TenantService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredTenantPermission = route.data['tenantPermission'];
    const requiredSubscriptionPlan = route.data['subscriptionPlan'];

    // Check if user has access to current tenant
    const currentTenant = this.tenantService.currentTenant();
    if (!currentTenant) {
      this.router.navigate(['/no-tenant']);
      return false;
    }

    // Check tenant-specific permission
    if (requiredTenantPermission && !this.tenantService.hasPermission(requiredTenantPermission)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // Check subscription plan requirement
    if (requiredSubscriptionPlan) {
      const currentPlan = currentTenant.subscription.plan;
      const planHierarchy = ['free', 'basic', 'premium', 'enterprise'];
      const requiredLevel = planHierarchy.indexOf(requiredSubscriptionPlan);
      const currentLevel = planHierarchy.indexOf(currentPlan);

      if (currentLevel < requiredLevel) {
        this.router.navigate(['/upgrade-plan']);
        return false;
      }
    }

    return true;
  }
}
```

## Tenant-aware HTTP Interceptor

```typescript
// libs/tenant/src/lib/interceptors/tenant.interceptor.ts
@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  private tenantService = inject(TenantService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tenantId = this.tenantService.tenantId();

    if (tenantId && req.url.startsWith('/api/')) {
      // Add tenant ID to all API requests
      const tenantReq = req.clone({
        setHeaders: {
          'X-Tenant-ID': tenantId,
        },
      });

      return next.handle(tenantReq);
    }

    return next.handle(req);
  }
}
```

## Tenant Context Directive

```typescript
// libs/tenant/src/lib/directives/tenant-context.directive.ts
@Directive({
  selector: '[appTenantContext]',
  standalone: true,
})
export class TenantContextDirective implements OnInit, OnDestroy {
  private tenantService = inject(TenantService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() appTenantContext: string = ''; // Permission or setting key
  @Input() tenantHideWhenNo = false;
  @Input() tenantShowWhenPlan: string = '';

  private subscription?: () => void;

  ngOnInit() {
    // React to tenant changes
    this.subscription = effect(() => {
      this.updateVisibility();
    });
  }

  ngOnDestroy() {
    this.subscription?.();
  }

  private updateVisibility(): void {
    let shouldShow = true;

    // Check permission
    if (this.appTenantContext && this.appTenantContext.includes('.')) {
      shouldShow = this.tenantService.hasPermission(this.appTenantContext);
    }

    // Check subscription plan
    if (this.tenantShowWhenPlan) {
      const currentTenant = this.tenantService.currentTenant();
      const currentPlan = currentTenant?.subscription.plan || 'free';
      const planHierarchy = ['free', 'basic', 'premium', 'enterprise'];
      const requiredLevel = planHierarchy.indexOf(this.tenantShowWhenPlan);
      const currentLevel = planHierarchy.indexOf(currentPlan);

      shouldShow = shouldShow && currentLevel >= requiredLevel;
    }

    // Hide when no tenant and directive specifies
    if (this.tenantHideWhenNo && !this.tenantService.currentTenant()) {
      shouldShow = false;
    }

    // Apply visibility
    this.renderer.setStyle(this.el.nativeElement, 'display', shouldShow ? null : 'none');
  }
}
```

## Tenant Settings Component

```typescript
// apps/admin-portal/src/app/features/tenant/components/tenant-settings.component.ts
@Component({
  selector: 'app-tenant-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule],
  template: `
    <div class="tenant-settings p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Organization Settings</h1>
        <div class="flex gap-2">
          <button mat-button (click)="resetForm()">Reset</button>
          <button mat-raised-button color="primary" (click)="saveSettings()" [disabled]="settingsForm.invalid || saving()">
            @if (saving()) {
              <mat-spinner diameter="20" class="mr-2"></mat-spinner>
            }
            Save Changes
          </button>
        </div>
      </div>

      <mat-tab-group>
        <!-- General Settings -->
        <mat-tab label="General">
          <div class="pt-4">
            <form [formGroup]="settingsForm" class="space-y-4">
              <!-- Organization Info -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Organization Information</mat-card-title>
                </mat-card-header>
                <mat-card-content class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <mat-form-field appearance="outline">
                      <mat-label>Organization Name</mat-label>
                      <input matInput formControlName="name" required />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Slug</mat-label>
                      <input matInput formControlName="slug" required />
                      <mat-hint>URL-friendly identifier</mat-hint>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="3"></textarea>
                  </mat-form-field>
                </mat-card-content>
              </mat-card>

              <!-- Branding -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Branding</mat-card-title>
                </mat-card-header>
                <mat-card-content class="space-y-4">
                  <!-- Logo Upload -->
                  <div class="logo-upload">
                    <label class="block text-sm font-medium text-gray-700 mb-2"> Organization Logo </label>
                    <div class="flex items-center space-x-4">
                      <img [src]="logoPreview()" class="w-16 h-16 rounded-lg border object-cover" />
                      <div>
                        <input type="file" #fileInput (change)="onLogoSelect($event)" accept="image/*" class="hidden" />
                        <button mat-raised-button (click)="fileInput.click()">Upload Logo</button>
                        <p class="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                      </div>
                    </div>
                  </div>

                  <!-- Theme Colors -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <mat-form-field appearance="outline">
                      <mat-label>Primary Color</mat-label>
                      <input matInput formControlName="primaryColor" type="color" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Secondary Color</mat-label>
                      <input matInput formControlName="secondaryColor" type="color" />
                    </mat-form-field>
                  </div>

                  <!-- Custom CSS -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Custom CSS</mat-label>
                    <textarea matInput formControlName="customCss" rows="6" placeholder=".custom-header { background: #ff0000; }"></textarea>
                    <mat-hint>Advanced styling customization</mat-hint>
                  </mat-form-field>
                </mat-card-content>
              </mat-card>
            </form>
          </div>
        </mat-tab>

        <!-- Features & Permissions -->
        <mat-tab label="Features">
          <div class="pt-4">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Feature Access</mat-card-title>
                <mat-card-subtitle> Manage which features are available for this organization </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="space-y-4">
                  @for (feature of availableFeatures; track feature.key) {
                    <div class="flex items-center justify-between py-2">
                      <div class="flex-1">
                        <h4 class="font-medium">{{ feature.name }}</h4>
                        <p class="text-sm text-gray-600">{{ feature.description }}</p>
                        @if (feature.planRequired) {
                          <mat-chip class="mt-1" color="accent"> {{ feature.planRequired }}+ plan required </mat-chip>
                        }
                      </div>

                      <mat-slide-toggle [checked]="isFeatureEnabled(feature.key)" [disabled]="!canEnableFeature(feature)" (change)="toggleFeature(feature.key, $event.checked)"> </mat-slide-toggle>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Subscription -->
        <mat-tab label="Subscription">
          <div class="pt-4">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Subscription Details</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @if (currentTenant()) {
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="subscription-info">
                        <label class="block text-sm font-medium text-gray-700">Current Plan</label>
                        <p class="text-lg font-semibold text-gray-900 capitalize">
                          {{ currentTenant()!.subscription.plan }}
                        </p>
                      </div>

                      <div class="subscription-info">
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <span
                          class="inline-block px-2 py-1 text-sm rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-800': currentTenant()!.subscription.status === 'active',
                            'bg-red-100 text-red-800': currentTenant()!.subscription.status === 'expired',
                            'bg-yellow-100 text-yellow-800': currentTenant()!.subscription.status === 'trial',
                          }"
                        >
                          {{ currentTenant()!.subscription.status | titlecase }}
                        </span>
                      </div>

                      @if (currentTenant()!.subscription.expiresAt) {
                        <div class="subscription-info">
                          <label class="block text-sm font-medium text-gray-700">Expires</label>
                          <p class="text-lg font-semibold text-gray-900">
                            {{ currentTenant()!.subscription.expiresAt | date: 'mediumDate' }}
                          </p>
                        </div>
                      }
                    </div>

                    <div class="flex gap-2">
                      <button mat-raised-button color="primary" (click)="upgradePlan()">Upgrade Plan</button>
                      <button mat-button (click)="viewBilling()">View Billing</button>
                    </div>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class TenantSettingsComponent implements OnInit {
  private tenantService = inject(TenantService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Service signals
  currentTenant = this.tenantService.currentTenant;
  tenantSettings = this.tenantService.tenantSettings;
  loading = this.tenantService.loading;

  // Local signals
  saving = signal(false);
  logoPreview = signal('/assets/default-logo.png');

  // Available features configuration
  availableFeatures = [
    {
      key: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Detailed reports and insights',
      planRequired: 'premium',
    },
    {
      key: 'custom-branding',
      name: 'Custom Branding',
      description: 'Custom logos and colors',
      planRequired: 'basic',
    },
    {
      key: 'api-access',
      name: 'API Access',
      description: 'REST API for integrations',
      planRequired: 'premium',
    },
    {
      key: 'sso-integration',
      name: 'SSO Integration',
      description: 'Single Sign-On support',
      planRequired: 'enterprise',
    },
  ];

  settingsForm = this.fb.group({
    name: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    description: [''],
    primaryColor: ['#1976d2'],
    secondaryColor: ['#dc004e'],
    customCss: [''],
  });

  ngOnInit() {
    // Load current tenant data into form
    effect(() => {
      const tenant = this.currentTenant();
      if (tenant) {
        this.settingsForm.patchValue({
          name: tenant.name,
          slug: tenant.slug,
          description: tenant.description || '',
          primaryColor: tenant.primaryColor || '#1976d2',
          secondaryColor: tenant.secondaryColor || '#dc004e',
          customCss: tenant.customCss || '',
        });

        this.logoPreview.set(tenant.logoUrl || '/assets/default-logo.png');
      }
    });
  }

  async saveSettings(): Promise<void> {
    if (this.settingsForm.invalid) return;

    this.saving.set(true);

    try {
      const tenantId = this.tenantService.tenantId();
      const formData = this.settingsForm.value;

      await this.tenantService.updateTenantSettings(tenantId!, formData);

      // Show success message
      this.showNotification('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showNotification('Failed to save settings', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  async onLogoSelect(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.logoPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      const uploadService = inject(FileUploadService);
      const uploadedFile = await uploadService.uploadFile(file);

      // Update tenant logo
      const tenantId = this.tenantService.tenantId();
      await this.tenantService.updateTenantLogo(tenantId!, uploadedFile.url);
    } catch (error) {
      console.error('Logo upload failed:', error);
    }
  }

  isFeatureEnabled(featureKey: string): boolean {
    const settings = this.tenantSettings();
    return settings?.settings?.[featureKey] === true;
  }

  canEnableFeature(feature: any): boolean {
    if (!feature.planRequired) return true;

    const currentPlan = this.currentTenant()?.subscription.plan || 'free';
    const planHierarchy = ['free', 'basic', 'premium', 'enterprise'];
    const requiredLevel = planHierarchy.indexOf(feature.planRequired);
    const currentLevel = planHierarchy.indexOf(currentPlan);

    return currentLevel >= requiredLevel;
  }

  async toggleFeature(featureKey: string, enabled: boolean): Promise<void> {
    try {
      const tenantId = this.tenantService.tenantId();
      await this.tenantService.updateFeatureSetting(tenantId!, featureKey, enabled);
    } catch (error) {
      console.error('Failed to toggle feature:', error);
    }
  }

  resetForm(): void {
    const tenant = this.currentTenant();
    if (tenant) {
      this.settingsForm.patchValue({
        name: tenant.name,
        slug: tenant.slug,
        description: tenant.description || '',
        primaryColor: tenant.primaryColor || '#1976d2',
        secondaryColor: tenant.secondaryColor || '#dc004e',
        customCss: tenant.customCss || '',
      });
    }
  }

  upgradePlan(): void {
    this.router.navigate(['/billing/upgrade']);
  }

  viewBilling(): void {
    this.router.navigate(['/billing']);
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    // Implementation depends on notification service
  }
}
```

## Multi-tenant Routing

```typescript
// apps/user-portal/src/app/app.routes.ts
export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, TenantGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        data: {
          tenantPermission: 'dashboard.view',
          subscriptionPlan: 'basic',
        },
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics-dashboard.component').then((m) => m.AnalyticsDashboardComponent),
        data: {
          tenantPermission: 'analytics.view',
          subscriptionPlan: 'premium',
        },
      },
      {
        path: 'settings/organization',
        loadComponent: () => import('./features/tenant/tenant-settings.component').then((m) => m.TenantSettingsComponent),
        data: {
          tenantPermission: 'tenant.manage',
          subscriptionPlan: 'basic',
        },
      },
    ],
  },
  {
    path: 'no-tenant',
    loadComponent: () => import('./shared/components/no-tenant.component').then((m) => m.NoTenantComponent),
  },
  {
    path: 'upgrade-plan',
    loadComponent: () => import('./shared/components/upgrade-plan.component').then((m) => m.UpgradePlanComponent),
  },
];
```

## Tenant Context Provider

```typescript
// libs/tenant/src/lib/providers/tenant-context.provider.ts
export function provideTenantContext(): EnvironmentProviders {
  return makeEnvironmentProviders([
    TenantService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TenantInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (tenantService: TenantService) => {
        return () => {
          // Initialize tenant context on app start
          return tenantService.loadUserTenants();
        };
      },
      deps: [TenantService],
      multi: true,
    },
  ]);
}

// Usage in main.ts
// import { provideTenantContext } from '@org/tenant';
// bootstrapApplication(AppComponent, {
//   providers: [
//     // ... other providers
//     provideTenantContext()
//   ]
// });
```

## Tenant-aware Storage Service

```typescript
// libs/storage/src/lib/services/tenant-storage.service.ts
@Injectable({ providedIn: 'root' })
export class TenantStorageService {
  private tenantService = inject(TenantService);

  // Tenant-scoped storage keys
  private getKey(key: string): string {
    const tenantId = this.tenantService.tenantId();
    return tenantId ? `tenant:${tenantId}:${key}` : key;
  }

  setItem(key: string, value: any): void {
    const scopedKey = this.getKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(value));
  }

  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    const scopedKey = this.getKey(key);
    const stored = localStorage.getItem(scopedKey);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultValue;
      }
    }

    return defaultValue;
  }

  removeItem(key: string): void {
    const scopedKey = this.getKey(key);
    localStorage.removeItem(scopedKey);
  }

  clear(): void {
    const tenantId = this.tenantService.tenantId();
    if (!tenantId) return;

    const prefix = `tenant:${tenantId}:`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  // Session storage variants
  setSessionItem(key: string, value: any): void {
    const scopedKey = this.getKey(key);
    sessionStorage.setItem(scopedKey, JSON.stringify(value));
  }

  getSessionItem<T>(key: string, defaultValue: T | null = null): T | null {
    const scopedKey = this.getKey(key);
    const stored = sessionStorage.getItem(scopedKey);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultValue;
      }
    }

    return defaultValue;
  }

  removeSessionItem(key: string): void {
    const scopedKey = this.getKey(key);
    sessionStorage.removeItem(scopedKey);
  }
}
```
