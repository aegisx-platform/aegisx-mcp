# Fuse Angular Template Architecture Analysis

> เอกสารวิเคราะห์สถาปัตยกรรม Fuse Angular Template เพื่อนำมาพัฒนาเป็นเวอร์ชั่นของเรา

## 📋 สารบัญ

1. [ภาพรวมสถาปัตยกรรม](#1-ภาพรวมสถาปัตยกรรม)
2. [โครงสร้างโปรเจค](#2-โครงสร้างโปรเจค)
3. [ระบบ Component](#3-ระบบ-component)
4. [ระบบ Service](#4-ระบบ-service)
5. [ระบบ Theme และ Styling](#5-ระบบ-theme-และ-styling)
6. [ระบบ Layout](#6-ระบบ-layout)
7. [ระบบ Authentication](#7-ระบบ-authentication)
8. [ระบบ Navigation และ Routing](#8-ระบบ-navigation-และ-routing)
9. [Utilities และ Helpers](#9-utilities-และ-helpers)
10. [แนวทางการพัฒนา](#10-แนวทางการพัฒนา)
11. [Migration จาก RxJS เป็น Signals](#11-migration-จาก-rxjs-เป็น-signals)

---

## 1. ภาพรวมสถาปัตยกรรม

### 🎯 Design Principles

1. **Modern Angular (v19+)**
   - Standalone Components
   - Functional Guards & Interceptors
   - Signal-ready architecture
   - `inject()` pattern for DI

2. **Modular Architecture**
   - @fuse core library
   - Feature modules แยกตามหน้าที่
   - Shared components & services
   - Plugin-based architecture

3. **Reactive Programming**
   - RxJS for state management
   - BehaviorSubject pattern
   - Observable streams
   - Reactive forms

4. **Performance First**
   - OnPush change detection
   - Lazy loading
   - Tree shaking
   - Code splitting

### 🏗️ Tech Stack

```typescript
// Core Dependencies
{
  "@angular/core": "19.0.5",
  "@angular/material": "19.0.4",
  "@angular/cdk": "19.0.4",
  "tailwindcss": "^3.4.0",
  "@jsverse/transloco": "^7.5.0",
  "luxon": "^3.5.0",
  "lodash-es": "^4.17.21",
  "highlight.js": "^11.11.0"
}
```

---

## 2. โครงสร้างโปรเจค

### 📁 Directory Structure

```
src/
├── @fuse/                      # Core Framework
│   ├── animations/            # Reusable animations
│   ├── components/            # UI components library
│   ├── directives/           # Custom directives
│   ├── lib/                  # Utilities & mock-api
│   ├── pipes/                # Custom pipes
│   ├── services/             # Core services
│   ├── styles/               # SCSS theming system
│   ├── tailwind/             # Tailwind plugins
│   ├── validators/           # Form validators
│   └── version/              # Version management
│
├── app/
│   ├── core/                 # App core functionality
│   │   ├── auth/            # Authentication
│   │   ├── config/          # App config
│   │   ├── icons/           # Icon registry
│   │   ├── navigation/      # Navigation config
│   │   ├── transloco/       # i18n loader
│   │   └── user/            # User management
│   │
│   ├── layout/              # Layout system
│   │   ├── common/          # Shared layout components
│   │   └── layouts/         # Layout variations
│   │
│   ├── modules/             # Feature modules
│   │   ├── admin/          # Admin features
│   │   ├── apps/           # Application modules
│   │   ├── auth/           # Auth pages
│   │   ├── pages/          # Static pages
│   │   └── ui/             # UI examples
│   │
│   └── mock-api/           # Mock API handlers
│
├── public/                  # Static assets
│   ├── fonts/              # Font files
│   ├── i18n/               # Translation files
│   ├── icons/              # Icon sprites
│   └── images/             # Images
│
└── styles/                 # Global styles
```

### 🔧 Configuration Files

```typescript
// app.config.ts - Main configuration
export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideRouter(appRoutes, withInMemoryScrolling()),
        provideTransloco({...}),
        provideFuse({
            mockApi: { delay: 0, service: MockApiService },
            fuse: {
                layout: 'classy',
                scheme: 'light',
                themes: [...]
            }
        })
    ]
};
```

---

## 3. ระบบ Component

### 🎨 Component Architecture

#### Standalone Component Pattern

```typescript
@Component({
  selector: 'fuse-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'fuseCard',
  imports: [CommonModule, MatIconModule],
  standalone: true,
})
export class FuseCardComponent {
  @Input() flippable: boolean = false;
  @Input() expanded: boolean = false;
  @Output() expandedChanged = new EventEmitter<boolean>();
}
```

### 📦 Component Categories

#### 1. **UI Components** (@fuse/components)

- **Alert**: Toast notifications with types (primary, accent, warn, basic, info, success, warning, error)
- **Card**: Expandable/flippable cards with animations
- **Drawer**: Side drawer with backdrop and positioning
- **Loading Bar**: Global loading indicator
- **Navigation**: Vertical/Horizontal navigation systems
- **Highlight**: Code syntax highlighting
- **Fullscreen**: Fullscreen toggle
- **Masonry**: Masonry grid layout

#### 2. **Layout Components**

- **Common Components**:
  - Languages selector
  - Messages panel
  - Notifications panel
  - Quick chat
  - Search overlay
  - Shortcuts panel
  - User menu
  - Settings panel

#### 3. **Navigation Components**

```typescript
// Navigation item types
type FuseNavigationItem =
  | FuseNavigationLink // Basic link
  | FuseNavigationGroup // Group of items
  | FuseNavigationCollapsable // Collapsable section
  | FuseNavigationDivider // Visual divider
  | FuseNavigationSpacer // Spacing element
  | FuseNavigationAside; // Aside content
```

### 🎯 Component Best Practices

1. **Change Detection**: Always use `OnPush`
2. **Encapsulation**: Use `None` for global styling needs
3. **Imports**: Import only what's needed
4. **Outputs**: Use `EventEmitter` for events
5. **ExportAs**: For template references

---

## 4. ระบบ Service

### 🔌 Service Architecture

#### Core Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class FuseConfigService {
  private _config = new BehaviorSubject(inject(FUSE_CONFIG));

  constructor() {
    // Auto-save config to localStorage
  }

  // Reactive config getter
  get config$(): Observable<FuseConfig> {
    return this._config.asObservable();
  }

  // Config setter with merge
  set config(value: any) {
    const config = merge({}, this._config.getValue(), value);
    this._config.next(config);
  }
}
```

### 📋 Service Categories

#### 1. **Core Services** (@fuse/services)

**ConfigService**

- Theme management
- Layout configuration
- Scheme switching (light/dark/auto)
- LocalStorage persistence

**MediaWatcherService**

```typescript
// Responsive breakpoints
onMediaQueryChange$(queries: string[]): Observable<MediaQueryChange>
onMediaChange$: Observable<{ alias: string; matchingAliases: string[] }>
```

**NavigationService**

- Component registry
- Navigation state management
- Dynamic navigation updates

**PlatformService**

- OS detection (iOS, Android, Windows, Linux, Mac)
- Platform-specific features

**UtilsService**

- ID generation
- Route matching utilities
- Color manipulation

#### 2. **App Services** (app/core)

**AuthService**

```typescript
interface AuthService {
  signIn(credentials: { email: string; password: string }): Observable<any>;
  signUp(user: { name: string; email: string; password: string }): Observable<any>;
  signOut(): Observable<any>;
  check(): Observable<boolean>;
  unlockSession(credentials: { password: string }): Observable<any>;
  forgotPassword(email: string): Observable<any>;
}
```

**UserService**

- User state management
- Profile updates
- Session handling

### 🔄 State Management Pattern

```typescript
// Service-based state management
export class DataService {
  // Private state
  private _data = new BehaviorSubject<Data[]>([]);

  // Public observable
  get data$(): Observable<Data[]> {
    return this._data.asObservable();
  }

  // State updates
  updateData(data: Data[]): void {
    this._data.next(data);
  }
}
```

---

## 5. ระบบ Theme และ Styling

### 🎨 Theming Architecture

#### 1. **Theme Structure**

```scss
// Theme definition
$theme: (
  primary: (
    50: #e3f2fd,
    100: #bbdefb,
    // ... 900
    DEFAULT: #2196f3,
    contrast: white,
  ),
  accent: (
    ...,
  ),
  warn: (
    ...,
  ),
);
```

#### 2. **CSS Custom Properties**

```css
:root {
  --fuse-primary: 33 150 243;
  --fuse-primary-50: 227 242 253;
  /* RGB values for opacity support */
}

.dark {
  --fuse-primary: 66 165 245;
  /* Dark mode overrides */
}
```

#### 3. **Tailwind Integration**

```javascript
// Custom Tailwind plugin
const theming = plugin.withOptions((options) => ({ addComponents, theme }) => {
  // Generate theme utilities
  // Create component styles
  // Add custom variants
});
```

### 🎯 Theme Features

1. **Multiple Themes**
   - Default
   - Brand
   - Teal
   - Rose
   - Purple
   - Amber

2. **Dark/Light Mode**
   - Manual switching
   - Auto detection (prefers-color-scheme)
   - System preference sync

3. **Dynamic Theme Switching**

```typescript
this._fuseConfigService.config = {
  theme: 'brand',
  scheme: 'dark',
};
```

### 📐 Styling System

#### SCSS Organization

```
styles/
├── main.scss          # Main styles entry
├── tailwind.scss      # Tailwind imports
├── themes.scss        # Theme definitions
├── user-themes.scss   # User custom themes
└── vendors.scss       # Third-party overrides
```

#### Component Styling Pattern

```scss
// Component-specific styles
fuse-card {
  @apply relative flex flex-col;

  .fuse-card-header {
    @apply flex items-center px-6 py-4;
  }

  &.fuse-card-flippable {
    @apply preserve-3d cursor-pointer;

    &.fuse-card-face-back {
      @apply rotate-y-180;
    }
  }
}
```

---

## 6. ระบบ Layout

### 🏗️ Layout System Architecture

#### Layout Manager

```typescript
@Component({
  selector: 'layout',
  template: `
    @switch (layout) {
      @case ('empty') {
        <empty-layout />
      }
      @case ('classic') {
        <classic-layout />
      }
      @case ('classy') {
        <classy-layout />
      }
      // ... other layouts
    }
  `,
})
export class LayoutComponent {
  layout: string;
  scheme: 'dark' | 'light';
  theme: string;
}
```

### 📋 Layout Types

#### 1. **Vertical Layouts**

- **Classic**: Traditional admin layout
- **Classy**: Modern with floating navigation
- **Compact**: Condensed navigation
- **Dense**: Maximum content area
- **Futuristic**: Unique modern design
- **Thin**: Minimal navigation

#### 2. **Horizontal Layouts**

- **Centered**: Centered content area
- **Enterprise**: Corporate style
- **Material**: Material Design inspired
- **Modern**: Contemporary design

#### 3. **Empty Layout**

- Used for auth pages
- Minimal wrapper
- No navigation

### 🔧 Layout Configuration

```typescript
// Route-based layout
{
    path: 'dashboards',
    data: { layout: 'classy' },
    children: [...]
}

// Query parameter
?layout=compact

// Programmatic
this._fuseConfigService.config = { layout: 'modern' };
```

### 📐 Layout Components Structure

```typescript
interface LayoutComponent {
  // Navigation state
  navigation: Navigation;
  isScreenSmall: boolean;

  // User info
  user: User;

  // Common methods
  toggleNavigation(name: string): void;

  // Lifecycle
  ngOnInit(): void;
  ngOnDestroy(): void;
}
```

---

## 7. ระบบ Authentication

### 🔐 Authentication Architecture

#### Auth Service Implementation

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authenticated: boolean = false;

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  signIn(credentials: SignInCredentials): Observable<any> {
    return this._httpClient.post('api/auth/sign-in', credentials).pipe(
      switchMap((response) => {
        this.accessToken = response.accessToken;
        this._authenticated = true;
        this._userService.user = response.user;
        return of(response);
      }),
    );
  }
}
```

### 🛡️ Route Guards

#### Functional Guards Pattern

```typescript
export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.check().pipe(
    switchMap((authenticated) => {
      if (!authenticated) {
        router.navigate(['sign-in'], {
          queryParams: { redirectURL: state.url },
        });
        return of(false);
      }
      return of(true);
    }),
  );
};
```

### 📋 Auth Features

1. **Token Management**
   - JWT storage in localStorage
   - Token refresh mechanism
   - Auto logout on expiry

2. **Auth Pages**
   - Sign in (classic, modern, split-screen, fullscreen)
   - Sign up
   - Sign out
   - Forgot password
   - Reset password
   - Unlock session
   - Confirmation required

3. **Session Management**

```typescript
// Lock screen functionality
lockSession(): void {
    return this._httpClient.post('api/auth/lock-session', {
        sessionTimeout: 30 // minutes
    });
}
```

---

## 8. ระบบ Navigation และ Routing

### 🧭 Navigation System

#### Navigation Data Structure

```typescript
interface FuseNavigationItem {
  id: string;
  title: string;
  type: 'basic' | 'collapsable' | 'group' | 'divider';
  icon?: string;
  link?: string;
  badge?: {
    title: string;
    classes: string;
  };
  children?: FuseNavigationItem[];
  meta?: any;
}
```

#### Navigation Service

```typescript
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private _navigation = new ReplaySubject<Navigation>(1);

  get navigation$(): Observable<Navigation> {
    return this._navigation.asObservable();
  }

  get(key: 'compact' | 'default' | 'futuristic' | 'horizontal'): Observable<FuseNavigationItem[]> {
    return this._httpClient.get<Navigation>('api/common/navigation').pipe(map((navigation) => navigation[key]));
  }
}
```

### 🛣️ Routing Architecture

#### Route Configuration

```typescript
export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboards/project' },
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboards/project' },

  // Guest routes
  {
    path: '',
    canActivate: [NoAuthGuard],
    component: LayoutComponent,
    data: { layout: 'empty' },
    children: [{ path: 'sign-in', loadChildren: () => import('./modules/auth/sign-in/sign-in.routes') }],
  },

  // Auth routes
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    resolve: { initialData: initialDataResolver },
    children: [
      // Lazy loaded features
      { path: 'apps', loadChildren: () => import('./modules/apps/apps.routes') },
    ],
  },
];
```

#### Lazy Loading Pattern

```typescript
// Feature routes file
export default [
  {
    path: 'calendar',
    component: CalendarComponent,
    resolve: {
      calendars: () => inject(CalendarService).getCalendars(),
    },
  },
] as Route[];
```

---

## 9. Utilities และ Helpers

### 🛠️ Utility Functions

#### Animation Utilities

```typescript
export const fuseAnimations = [expandCollapse, fadeIn, fadeInTop, fadeInBottom, fadeInLeft, fadeInRight, fadeOut, fadeOutTop, fadeOutBottom, fadeOutLeft, fadeOutRight, shake, slideInTop, slideInBottom, slideInLeft, slideInRight, slideOutTop, slideOutBottom, slideOutLeft, slideOutRight, zoomIn, zoomOut];
```

#### Color Utilities

```typescript
// Generate color palette
generatePalette(color: string): { [key: string]: string } {
    const baseLight = tinycolor('#ffffff');
    const baseDark = multiply(tinycolor(color).toRgb(), tinycolor('#ffffff').toRgb());

    return {
        50: tinycolor.mix(baseLight, color, 12).toHexString(),
        100: tinycolor.mix(baseLight, color, 30).toHexString(),
        // ... 900
    };
}
```

### 📦 Helper Services

#### Mock API System

```typescript
@Injectable({ providedIn: 'root' })
export class MockApiService {
  private _handlers: Map<string, MockApiHandler> = new Map();

  register(handler: MockApiHandler): void {
    this._handlers.set(handler.id, handler);
    handler.registerHandlers();
  }
}
```

#### Platform Detection

```typescript
interface Platform {
  ANDROID: boolean;
  IOS: boolean;
  FIREFOX: boolean;
  CHROME: boolean;
  SAFARI: boolean;
}
```

### 🎯 Custom Directives

#### Scrollbar Directive

```typescript
@Directive({
  selector: '[fuseScrollbar]',
  standalone: true,
})
export class FuseScrollbarDirective {
  @Input() scrollbar: boolean = true;

  // Custom scrollbar implementation
}
```

#### Scroll Reset Directive

```typescript
@Directive({
  selector: '[fuseScrollReset]',
  standalone: true,
})
export class FuseScrollResetDirective {
  // Resets scroll position on route change
}
```

---

## 10. แนวทางการพัฒนา

### 🚀 Best Practices สำหรับการนำไปใช้

#### 1. **โครงสร้าง Monorepo**

```
libs/
├── @fuse/                  # Core UI framework
│   ├── animations/
│   ├── components/
│   ├── directives/
│   ├── services/
│   └── styles/
│
├── ui-layout/             # Layout library
│   ├── layouts/
│   └── common/
│
├── ui-theme/              # Theming system
│   ├── themes/
│   └── tailwind/
│
└── shared/                # Shared utilities
    ├── utils/
    └── models/
```

#### 2. **การ Customize Theme**

```typescript
// สร้าง custom theme
export const customTheme = {
  id: 'custom-brand',
  name: 'Custom Brand',
  properties: {
    primary: generatePalette('#FF6B6B'),
    accent: generatePalette('#4ECDC4'),
    warn: generatePalette('#F38181'),
  },
};
```

#### 3. **การสร้าง Layout ใหม่**

```typescript
@Component({
  selector: 'custom-layout',
  templateUrl: './custom.component.html',
  imports: [
    /* required imports */
  ],
  standalone: true,
})
export class CustomLayoutComponent extends BaseLayout {
  // Extend base functionality
}
```

#### 4. **การ Integrate กับ Backend**

```typescript
// แทนที่ Mock API ด้วย real API
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({
    url: `${environment.apiUrl}/${req.url}`,
  });
  return next(apiReq);
};
```

### 📌 Key Takeaways

1. **Modular Architecture**: แยก concerns อย่างชัดเจน
2. **Reactive Patterns**: ใช้ RxJS อย่างมีประสิทธิภาพ
3. **Performance**: OnPush + Lazy Loading
4. **Theming**: Dynamic theme switching
5. **Type Safety**: Strict TypeScript
6. **Testing Ready**: Testable architecture
7. **i18n Ready**: Built-in internationalization
8. **Responsive**: Mobile-first approach
9. **Accessibility**: WCAG compliance
10. **Developer Experience**: Great tooling

### 🎯 Recommended Adaptations

1. **State Management**: เพิ่ม NgRx/Akita สำหรับ complex state
2. **API Layer**: สร้าง API service layer ที่ robust
3. **Error Handling**: Global error handling strategy
4. **Logging**: Centralized logging system
5. **Security**: Enhanced auth with refresh tokens
6. **Testing**: Comprehensive test coverage
7. **Documentation**: Storybook for components
8. **CI/CD**: Automated deployment pipeline
9. **Monitoring**: Application monitoring
10. **Analytics**: User behavior tracking

---

## 📚 Resources

- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.io)
- [TailwindCSS](https://tailwindcss.com)
- [RxJS](https://rxjs.dev)
- [Transloco](https://jsverse.github.io/transloco/)

---

> 💡 **Note**: เอกสารนี้เป็นการวิเคราะห์เชิงลึกของ Fuse Angular Template เพื่อนำไปพัฒนาต่อยอดให้เหมาะกับ Enterprise Application ของเรา

---

## 11. Migration จาก RxJS เป็น Signals

### 🎯 ทำไมต้อง Migrate เป็น Signals?

#### ✅ **ข้อดีของ Signals**

1. **Simpler Mental Model** - ง่ายต่อการเข้าใจ ไม่ต้องจัดการ subscriptions
2. **Better Performance** - Fine-grained reactivity, re-render เฉพาะส่วนที่เปลี่ยน
3. **No Memory Leaks** - ไม่ต้อง unsubscribe
4. **Synchronous by Default** - ไม่มี async complexity
5. **Future of Angular** - Angular team กำลังผลักดัน Signals เป็นหลัก
6. **Type Safety** - Better TypeScript inference
7. **Easier Testing** - ไม่ต้อง mock observables

#### ❌ **ข้อเสียที่ต้องพิจารณา**

1. **Limited Operators** - ยังไม่มี operators มากเท่า RxJS
2. **New Pattern** - ต้องเรียนรู้ pattern ใหม่
3. **Migration Effort** - ต้องแปลง codebase ที่มีอยู่

### 💡 Migration Patterns

#### 1. **Service State Management Migration**

```typescript
// 🔴 RxJS Pattern (Fuse Original)
@Injectable({ providedIn: 'root' })
export class UserService {
  private _user = new BehaviorSubject<User>(null);
  private _unsubscribeAll = new Subject<void>();

  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  set user(value: User) {
    this._user.next(value);
  }

  updateUser(user: User): Observable<User> {
    return this._httpClient.put<User>('api/user', user).pipe(
      tap((updatedUser) => {
        this._user.next(updatedUser);
      }),
    );
  }
}

// 🟢 Signals Pattern (Recommended)
@Injectable({ providedIn: 'root' })
export class UserService {
  private _user = signal<User | null>(null);

  // Read-only signal for components
  readonly user = this._user.asReadonly();

  // Computed signals
  readonly userName = computed(() => this.user()?.name || 'Guest');
  readonly isAuthenticated = computed(() => !!this.user());
  readonly userRole = computed(() => this.user()?.role || 'guest');

  setUser(user: User): void {
    this._user.set(user);
  }

  updateUser(updates: Partial<User>): void {
    this._user.update((current) => (current ? { ...current, ...updates } : null));
  }

  // Async operations still use RxJS
  saveUser(user: User): Observable<User> {
    return this._httpClient.put<User>('api/user', user).pipe(tap((updatedUser) => this.setUser(updatedUser)));
  }
}
```

#### 2. **Component Usage Migration**

```typescript
// 🔴 RxJS Pattern (Fuse Original)
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User;
  private _unsubscribeAll = new Subject<void>();

  constructor(
    private _userService: UserService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user) => {
      this.user = user;
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}

// 🟢 Signals Pattern (Recommended)
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProfileComponent {
  // Direct signal access - no lifecycle hooks needed!
  user = this._userService.user;
  userName = this._userService.userName;

  // Local computed signals
  profileComplete = computed(() => {
    const user = this.user();
    return !!(user?.email && user?.name && user?.avatar);
  });

  constructor(private _userService: UserService) {}

  // No ngOnDestroy needed!
}
```

#### 3. **Config Service Migration**

```typescript
// 🔴 RxJS Pattern (Fuse Original)
export class FuseConfigService {
  private _config = new BehaviorSubject(this._defaultConfig);

  get config$(): Observable<FuseConfig> {
    return this._config.asObservable();
  }

  set config(value: any) {
    const config = merge({}, this._config.getValue(), value);
    this._config.next(config);
    this._saveConfigToLocalStorage(config);
  }
}

// 🟢 Signals Pattern (Recommended)
export class FuseConfigService {
  private _config = signal<FuseConfig>(this._defaultConfig);

  // Public read-only signal
  readonly config = this._config.asReadonly();

  // Computed signals for specific config values
  readonly theme = computed(() => this.config().theme);
  readonly layout = computed(() => this.config().layout);
  readonly scheme = computed(() => this.config().scheme);
  readonly isDarkMode = computed(() => this.scheme() === 'dark');
  readonly isRTL = computed(() => this.config().direction === 'rtl');

  updateConfig(updates: Partial<FuseConfig>): void {
    this._config.update((config) => {
      const newConfig = { ...config, ...updates };
      this._saveConfigToLocalStorage(newConfig);
      return newConfig;
    });
  }

  setTheme(theme: string): void {
    this.updateConfig({ theme });
  }

  toggleScheme(): void {
    this.updateConfig({
      scheme: this.scheme() === 'light' ? 'dark' : 'light',
    });
  }
}
```

#### 4. **Navigation Service Migration**

```typescript
// 🟢 Signals Pattern
export class NavigationService {
  private _navigation = signal<Navigation>({
    default: [],
    compact: [],
    futuristic: [],
    horizontal: [],
  });

  private _currentNavigationItem = signal<FuseNavigationItem | null>(null);

  // Public signals
  readonly navigation = this._navigation.asReadonly();
  readonly currentItem = this._currentNavigationItem.asReadonly();

  // Computed signals
  readonly flatNavigation = computed(() => {
    const nav = this.navigation();
    return this._flattenNavigation(nav.default);
  });

  readonly breadcrumbs = computed(() => {
    const item = this.currentItem();
    return item ? this._generateBreadcrumbs(item) : [];
  });

  setNavigation(navigation: Navigation): void {
    this._navigation.set(navigation);
  }

  setCurrentItem(item: FuseNavigationItem | null): void {
    this._currentNavigationItem.set(item);
  }

  // Async operations
  loadNavigation(): Observable<Navigation> {
    return this._httpClient.get<Navigation>('api/navigation').pipe(tap((navigation) => this.setNavigation(navigation)));
  }
}
```

#### 5. **Loading State Management**

```typescript
// 🟢 Signals-based Loading Service
export class LoadingService {
  private _isLoading = signal(false);
  private _progress = signal(0);
  private _message = signal<string>('');

  // Public read-only signals
  readonly isLoading = this._isLoading.asReadonly();
  readonly progress = this._progress.asReadonly();
  readonly message = this._message.asReadonly();

  // Computed signals
  readonly showProgressBar = computed(() => this.isLoading() && this.progress() > 0);

  show(message?: string): void {
    this._isLoading.set(true);
    if (message) {
      this._message.set(message);
    }
  }

  hide(): void {
    this._isLoading.set(false);
    this._progress.set(0);
    this._message.set('');
  }

  setProgress(value: number): void {
    this._progress.set(Math.min(100, Math.max(0, value)));
  }
}
```

### 🔄 Hybrid Approach (Recommended)

สำหรับ features ที่ซับซ้อน ใช้ทั้ง Signals และ RxJS ร่วมกัน:

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  // Signals for state management
  private _items = signal<Item[]>([]);
  private _loading = signal(false);
  private _error = signal<Error | null>(null);
  private _searchTerm = signal('');
  private _filters = signal<Filters>({});

  // Public read-only signals
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly filters = this._filters.asReadonly();

  // Computed signals
  readonly filteredItems = computed(() => {
    const items = this.items();
    const search = this.searchTerm().toLowerCase();
    const filters = this.filters();

    return items.filter((item) => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search);
      const matchesFilters = this._applyFilters(item, filters);
      return matchesSearch && matchesFilters;
    });
  });

  readonly hasData = computed(() => this.items().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.items().length === 0);

  // RxJS for async operations
  private searchSubject = new Subject<string>();

  constructor(private _httpClient: HttpClient) {
    // Setup search with debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((term) => this._searchTerm.set(term)),
        switchMap((term) => this.search(term)),
      )
      .subscribe();
  }

  loadItems(): void {
    this._loading.set(true);
    this._error.set(null);

    this._httpClient
      .get<Item[]>('/api/items')
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (items) => this._items.set(items),
        error: (error) => this._error.set(error),
      });
  }

  updateSearchTerm(term: string): void {
    this.searchSubject.next(term);
  }

  updateFilters(filters: Partial<Filters>): void {
    this._filters.update((current) => ({ ...current, ...filters }));
  }
}
```

### 📋 Migration Checklist

#### Phase 1: Core Services (High Priority)

- [ ] ConfigService → Signals ✅
- [ ] ThemeService → Signals ✅
- [ ] LoadingService → Signals ✅
- [ ] UserService → Signals ✅
- [ ] NavigationService → Signals ✅

#### Phase 2: UI State Services

- [ ] MediaWatcherService → Hybrid (Signals + RxJS)
- [ ] SplashScreenService → Signals
- [ ] LayoutService → Signals
- [ ] DrawerService → Signals
- [ ] AlertService → Signals

#### Phase 3: Feature Services

- [ ] Keep HTTP calls with RxJS
- [ ] Convert state management to Signals
- [ ] Use computed() for derived state
- [ ] Implement effect() for side effects

### 🎯 Best Practices for Signals

1. **Naming Convention**

   ```typescript
   // Private writable signals start with _
   private _count = signal(0);

   // Public readonly signals
   readonly count = this._count.asReadonly();
   ```

2. **Computed Signals**

   ```typescript
   // Use for derived state
   readonly displayName = computed(() =>
     `${this.firstName()} ${this.lastName()}`
   );

   // Chain computations
   readonly isValid = computed(() =>
     this.hasName() && this.hasEmail() && this.isVerified()
   );
   ```

3. **Effects for Side Effects**

   ```typescript
   constructor() {
     // Auto-save to localStorage
     effect(() => {
       const config = this.config();
       localStorage.setItem('config', JSON.stringify(config));
     });
   }
   ```

4. **Async Operations Pattern**
   ```typescript
   loadData(): void {
     this._loading.set(true);

     this._http.get<Data>('/api/data').pipe(
       finalize(() => this._loading.set(false))
     ).subscribe({
       next: data => this._data.set(data),
       error: error => this._error.set(error)
     });
   }
   ```

### 🚀 Migration Strategy Summary

1. **Start Small**: Begin with simple services (Config, Theme, Loading)
2. **Hybrid Approach**: Keep RxJS for HTTP and complex async
3. **Incremental Migration**: Convert one service at a time
4. **Test Thoroughly**: Ensure behavior remains consistent
5. **Document Changes**: Update docs as you migrate

### 📊 When to Use What?

| Use Case             | Signals | RxJS |
| -------------------- | ------- | ---- |
| Component State      | ✅      | ❌   |
| Service State        | ✅      | ❌   |
| Computed Values      | ✅      | ❌   |
| HTTP Requests        | ❌      | ✅   |
| WebSockets           | ❌      | ✅   |
| Event Streams        | ❌      | ✅   |
| Debounce/Throttle    | ❌      | ✅   |
| Complex Operators    | ❌      | ✅   |
| Simple State Updates | ✅      | ❌   |
| Form State           | ✅      | ⚠️   |

### 🎯 Expected Benefits After Migration

1. **Simpler Code**: 40-60% reduction in boilerplate
2. **Better Performance**: Fine-grained updates
3. **No Memory Leaks**: Automatic cleanup
4. **Easier Testing**: Synchronous by default
5. **Better DX**: Clearer mental model
6. **Future-Proof**: Aligned with Angular's direction
