# @aegisx-ui Implementation Plan

> Modern Angular UI Framework based on Fuse Architecture analysis with Signals-first approach

## 🎯 Overview

@aegisx-ui จะเป็น Enterprise-grade UI Framework ที่รวมจุดเด่นของ Fuse มาพัฒนาต่อยอดด้วย:
- **Angular 19+** with Signals
- **Standalone Components**
- **TailwindCSS + Angular Material**
- **Type-safe & Tree-shakable**
- **i18n Ready**
- **Enterprise-grade**

## 📁 Library Structure

```bash
libs/
├── @aegisx-ui/
│   ├── core/               # Core services & utilities
│   │   ├── services/      # ConfigService, ThemeService, etc.
│   │   ├── providers/     # provideAegisX()
│   │   ├── utils/         # Helper functions
│   │   └── types/         # Core interfaces
│   │
│   ├── components/         # UI components
│   │   ├── alert/
│   │   ├── button/
│   │   ├── card/
│   │   ├── data-table/
│   │   ├── drawer/
│   │   ├── form-field/
│   │   ├── loading-bar/
│   │   └── navigation/
│   │
│   ├── layouts/           # Layout system
│   │   ├── base/
│   │   ├── admin/
│   │   ├── modern/
│   │   ├── compact/
│   │   └── empty/
│   │
│   ├── theme/             # Theming system
│   │   ├── styles/
│   │   ├── presets/
│   │   └── tailwind/
│   │
│   ├── animations/        # Animation utilities
│   │   ├── fade/
│   │   ├── slide/
│   │   ├── zoom/
│   │   └── expand/
│   │
│   └── directives/        # Custom directives
│       ├── scrollbar/
│       ├── scroll-reset/
│       └── ripple/
```

## 📋 Implementation Roadmap

### Phase 1: Core Foundation (Week 1-2)

#### 1.1 Setup Monorepo Structure
```bash
# Generate @aegisx-ui libraries
nx g @nx/angular:library core --directory=libs/@aegisx-ui --tags=scope:aegisx-ui,type:core --style=scss
nx g @nx/angular:library components --directory=libs/@aegisx-ui --tags=scope:aegisx-ui,type:ui --style=scss
nx g @nx/angular:library layouts --directory=libs/@aegisx-ui --tags=scope:aegisx-ui,type:ui --style=scss
nx g @nx/angular:library theme --directory=libs/@aegisx-ui --tags=scope:aegisx-ui,type:styles --style=scss
nx g @nx/angular:library animations --directory=libs/@aegisx-ui --tags=scope:aegisx-ui,type:utils
nx g @nx/angular:library directives --directory=libs/@aegisx-ui --tags=scope:aegisx-ui,type:utils
```

#### 1.2 Core Services (Signals-based)

**ConfigService**
```typescript
@Injectable({ providedIn: 'root' })
export class AxConfigService {
  private readonly _config = signal<AxConfig>(DEFAULT_CONFIG);
  
  // Public read-only signals
  readonly config = this._config.asReadonly();
  readonly theme = computed(() => this.config().theme);
  readonly layout = computed(() => this.config().layout);
  readonly scheme = computed(() => this.config().scheme);
  readonly isDarkMode = computed(() => this.scheme() === 'dark');
  
  constructor() {
    // Load from localStorage
    this.loadConfig();
    
    // Auto-save on changes
    effect(() => {
      const config = this.config();
      this.saveConfig(config);
    });
  }
  
  updateConfig(updates: Partial<AxConfig>): void {
    this._config.update(config => ({ ...config, ...updates }));
  }
}
```

**ThemeService**
```typescript
@Injectable({ providedIn: 'root' })
export class AxThemeService {
  private readonly _theme = signal<string>('default');
  private readonly _scheme = signal<'light' | 'dark' | 'auto'>('light');
  
  readonly theme = this._theme.asReadonly();
  readonly scheme = this._scheme.asReadonly();
  readonly isDark = computed(() => {
    const scheme = this.scheme();
    if (scheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return scheme === 'dark';
  });
  
  setTheme(theme: string): void {
    this._theme.set(theme);
    this.applyTheme(theme);
  }
  
  toggleScheme(): void {
    this._scheme.update(s => s === 'light' ? 'dark' : 'light');
  }
  
  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
```

**MediaWatcherService**
```typescript
@Injectable({ providedIn: 'root' })
export class AxMediaWatcherService {
  private readonly _screenSize = signal<ScreenSize>('lg');
  private readonly _orientation = signal<'portrait' | 'landscape'>('landscape');
  
  readonly screenSize = this._screenSize.asReadonly();
  readonly orientation = this._orientation.asReadonly();
  
  // Computed helpers
  readonly isMobile = computed(() => ['xs', 'sm'].includes(this.screenSize()));
  readonly isTablet = computed(() => this.screenSize() === 'md');
  readonly isDesktop = computed(() => ['lg', 'xl', '2xl'].includes(this.screenSize()));
  
  constructor() {
    this.watchMedia();
  }
}
```

#### 1.3 Provider System
```typescript
export interface AxConfig {
  theme?: string;
  scheme?: 'light' | 'dark' | 'auto';
  layout?: string;
  animations?: boolean;
  ripple?: boolean;
  locale?: string;
}

export function provideAegisX(config: AxConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AX_CONFIG, useValue: config },
    AxConfigService,
    AxThemeService,
    AxMediaWatcherService,
    AxLoadingService,
    AxPlatformService,
    // Interceptors
    provideHttpClient(
      withInterceptors([
        axLoadingInterceptor,
        axErrorInterceptor
      ])
    ),
    // Animations
    config.animations !== false ? provideAnimations() : provideNoopAnimations(),
  ]);
}
```

### Phase 2: Component Library (Week 3-4)

#### 2.1 Component Architecture

**Base Component Pattern**
```typescript
// Base component interface
export interface AxComponentBase {
  id?: string;
  class?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

// Example: Card Component
@Component({
  selector: 'ax-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ax-card',
    '[class.ax-card-expanded]': 'expanded()',
    '[class.ax-card-flippable]': 'flippable',
    '[class.ax-card-disabled]': 'disabled'
  }
})
export class AxCard implements AxComponentBase {
  private readonly _expanded = signal(false);
  private readonly _flipped = signal(false);
  
  @Input() id?: string;
  @Input() class?: string;
  @Input() disabled = false;
  @Input() expandable = false;
  @Input() flippable = false;
  @Input() elevation: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  
  @Output() expandedChange = new EventEmitter<boolean>();
  @Output() flippedChange = new EventEmitter<boolean>();
  
  readonly expanded = this._expanded.asReadonly();
  readonly flipped = this._flipped.asReadonly();
  
  toggle(): void {
    if (this.expandable && !this.disabled) {
      this._expanded.update(v => !v);
      this.expandedChange.emit(this._expanded());
    }
  }
  
  flip(): void {
    if (this.flippable && !this.disabled) {
      this._flipped.update(v => !v);
      this.flippedChange.emit(this._flipped());
    }
  }
}
```

#### 2.2 Priority Components

**1. Alert Component**
```typescript
export type AxAlertType = 'info' | 'success' | 'warning' | 'error';
export type AxAlertAppearance = 'fill' | 'outline' | 'soft';

@Component({
  selector: 'ax-alert',
  standalone: true,
  template: `
    @if (!dismissed()) {
      <div class="ax-alert" 
           [class]="alertClasses()"
           [@fadeIn]="animationState()">
        <ax-icon [icon]="icon()" />
        <div class="ax-alert-content">
          <ng-content />
        </div>
        @if (dismissible) {
          <button (click)="dismiss()" class="ax-alert-close">
            <ax-icon icon="x" />
          </button>
        }
      </div>
    }
  `
})
export class AxAlert {
  @Input() type: AxAlertType = 'info';
  @Input() appearance: AxAlertAppearance = 'fill';
  @Input() dismissible = false;
  @Input() icon?: string;
  
  dismissed = signal(false);
  
  alertClasses = computed(() => 
    `ax-alert-${this.type} ax-alert-${this.appearance}`
  );
  
  dismiss(): void {
    this.dismissed.set(true);
  }
}
```

**2. Button Component**
```typescript
export type AxButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type AxButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ax-button',
  standalone: true,
  template: `
    <button [type]="type"
            [disabled]="disabled || loading()"
            [class]="buttonClasses()"
            (click)="onClick($event)">
      @if (loading()) {
        <ax-spinner [size]="spinnerSize()" />
      }
      @if (icon && iconPosition === 'start') {
        <ax-icon [icon]="icon" />
      }
      <span class="ax-button-label">
        <ng-content />
      </span>
      @if (icon && iconPosition === 'end') {
        <ax-icon [icon]="icon" />
      }
    </button>
  `
})
export class AxButton {
  @Input() variant: AxButtonVariant = 'primary';
  @Input() size: AxButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() block = false;
  @Input() icon?: string;
  @Input() iconPosition: 'start' | 'end' = 'start';
  
  loading = signal(false);
  
  buttonClasses = computed(() => [
    'ax-button',
    `ax-button-${this.variant}`,
    `ax-button-${this.size}`,
    this.block ? 'ax-button-block' : '',
    this.loading() ? 'ax-button-loading' : ''
  ].filter(Boolean).join(' '));
}
```

**3. Data Table Component**
```typescript
@Component({
  selector: 'ax-data-table',
  standalone: true,
  template: `
    <div class="ax-data-table">
      <!-- Header with search & actions -->
      <div class="ax-data-table-header">
        <div class="ax-data-table-search">
          <ax-form-field>
            <input axInput 
                   [(ngModel)]="searchTerm"
                   placeholder="Search...">
            <ax-icon axPrefix icon="search" />
          </ax-form-field>
        </div>
        <div class="ax-data-table-actions">
          <ng-content select="[tableActions]" />
        </div>
      </div>
      
      <!-- Table -->
      <div class="ax-data-table-container">
        <table>
          <thead>
            <tr>
              @for (column of columns(); track column.key) {
                <th [class.sortable]="column.sortable"
                    (click)="sort(column)">
                  {{ column.label }}
                  @if (column.sortable) {
                    <ax-icon [icon]="getSortIcon(column)" />
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of paginatedData(); track trackBy(row)) {
              <tr [class.selected]="isSelected(row)"
                  (click)="selectRow(row)">
                @for (column of columns(); track column.key) {
                  <td>
                    @if (column.template) {
                      <ng-container *ngTemplateOutlet="column.template; context: { $implicit: row }" />
                    } @else {
                      {{ getCellValue(row, column) }}
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [colspan]="columns().length" class="empty-state">
                  <ng-content select="[emptyState]">
                    No data available
                  </ng-content>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <ax-pagination
        [total]="filteredData().length"
        [pageSize]="pageSize()"
        [currentPage]="currentPage()"
        (pageChange)="onPageChange($event)">
      </ax-pagination>
    </div>
  `
})
export class AxDataTable<T> {
  @Input() data = signal<T[]>([]);
  @Input() columns = signal<AxTableColumn<T>[]>([]);
  @Input() trackBy: (item: T) => any = (item: any) => item.id;
  @Input() selectable = false;
  @Input() multiSelect = false;
  
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  selectedRows = signal<Set<T>>(new Set());
  
  // Computed data
  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const data = this.data();
    
    if (!term) return data;
    
    return data.filter(row => 
      this.columns().some(col => {
        const value = this.getCellValue(row, col);
        return String(value).toLowerCase().includes(term);
      })
    );
  });
  
  sortedData = computed(() => {
    const data = [...this.filteredData()];
    const sortCol = this.sortColumn();
    const sortDir = this.sortDirection();
    
    if (!sortCol) return data;
    
    return data.sort((a, b) => {
      const aVal = this.getCellValue(a, { key: sortCol } as any);
      const bVal = this.getCellValue(b, { key: sortCol } as any);
      
      const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortDir === 'asc' ? result : -result;
    });
  });
  
  paginatedData = computed(() => {
    const data = this.sortedData();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    
    return data.slice(start, start + size);
  });
}
```

### Phase 3: Layout System (Week 5)

#### 3.1 Base Layout Architecture

```typescript
export abstract class AxLayoutBase implements OnInit {
  protected config = inject(AxConfigService);
  protected theme = inject(AxThemeService);
  protected media = inject(AxMediaWatcherService);
  
  navigation = signal<AxNavigationItem[]>([]);
  user = signal<User | null>(null);
  
  // Layout state
  sidenavOpened = signal(true);
  sidenavMode = computed<MatDrawerMode>(() => 
    this.media.isMobile() ? 'over' : 'side'
  );
  
  abstract ngOnInit(): void;
  
  toggleSidenav(): void {
    this.sidenavOpened.update(v => !v);
  }
}
```

#### 3.2 Admin Layout Implementation

```typescript
@Component({
  selector: 'ax-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    AxNavigation,
    AxToolbar
  ],
  template: `
    <div class="ax-layout-admin">
      <!-- Toolbar -->
      <ax-toolbar class="ax-layout-toolbar">
        <button mat-icon-button (click)="toggleSidenav()">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="ax-toolbar-title">{{ title() }}</span>
        <span class="ax-toolbar-spacer"></span>
        <ax-theme-switcher />
        <ax-user-menu [user]="user()" />
      </ax-toolbar>
      
      <!-- Sidenav Container -->
      <mat-sidenav-container class="ax-layout-container">
        <!-- Sidenav -->
        <mat-sidenav
          [mode]="sidenavMode()"
          [opened]="sidenavOpened()"
          class="ax-layout-sidenav">
          
          <ax-navigation
            [navigation]="navigation()"
            [layout]="'vertical'"
            [appearance]="'default'">
          </ax-navigation>
        </mat-sidenav>
        
        <!-- Content -->
        <mat-sidenav-content class="ax-layout-content">
          <router-outlet />
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `
})
export class AxAdminLayout extends AxLayoutBase {
  title = computed(() => this.config.config().title || 'Admin Panel');
  
  ngOnInit(): void {
    // Load navigation
    this.loadNavigation();
    
    // Load user
    this.loadUser();
  }
}
```

### Phase 4: Theming System (Week 6)

#### 4.1 CSS Custom Properties

```scss
// _themes.scss
:root {
  // Brand Colors (RGB format for opacity support)
  --ax-primary: 59 130 246;        // Blue
  --ax-primary-contrast: 255 255 255;
  --ax-secondary: 156 163 175;     // Gray
  --ax-secondary-contrast: 255 255 255;
  --ax-accent: 34 197 94;          // Green
  --ax-accent-contrast: 255 255 255;
  --ax-warn: 239 68 68;            // Red
  --ax-warn-contrast: 255 255 255;
  
  // Surface Colors
  --ax-background: 255 255 255;
  --ax-surface: 248 250 252;
  --ax-surface-variant: 241 245 249;
  
  // Text Colors
  --ax-text-primary: 17 24 39;
  --ax-text-secondary: 107 114 128;
  --ax-text-disabled: 209 213 219;
  
  // State Colors
  --ax-hover: 0 0 0;
  --ax-hover-opacity: 0.04;
  --ax-focus: 59 130 246;
  --ax-focus-opacity: 0.12;
  --ax-selected: 59 130 246;
  --ax-selected-opacity: 0.08;
  
  // Shadows
  --ax-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ax-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --ax-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --ax-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  // Dark theme overrides
  --ax-background: 17 24 39;
  --ax-surface: 31 41 55;
  --ax-surface-variant: 55 65 81;
  
  --ax-text-primary: 243 244 246;
  --ax-text-secondary: 156 163 175;
  --ax-text-disabled: 107 114 128;
  
  --ax-hover: 255 255 255;
  --ax-hover-opacity: 0.08;
}
```

#### 4.2 Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./libs/@aegisx-ui/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--ax-primary) / <alpha-value>)',
          contrast: 'rgb(var(--ax-primary-contrast) / <alpha-value>)'
        },
        secondary: {
          DEFAULT: 'rgb(var(--ax-secondary) / <alpha-value>)',
          contrast: 'rgb(var(--ax-secondary-contrast) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'rgb(var(--ax-accent) / <alpha-value>)',
          contrast: 'rgb(var(--ax-accent-contrast) / <alpha-value>)'
        },
        warn: {
          DEFAULT: 'rgb(var(--ax-warn) / <alpha-value>)',
          contrast: 'rgb(var(--ax-warn-contrast) / <alpha-value>)'
        },
        surface: {
          DEFAULT: 'rgb(var(--ax-surface) / <alpha-value>)',
          variant: 'rgb(var(--ax-surface-variant) / <alpha-value>)'
        }
      }
    }
  },
  plugins: [
    require('./libs/@aegisx-ui/theme/tailwind/plugin')
  ]
}
```

### Phase 5: Advanced Features (Week 7-8)

#### 5.1 Form System

**Dynamic Form Builder**
```typescript
export interface AxFormField {
  key: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  validators?: any[];
  options?: { label: string; value: any }[];
  config?: Record<string, any>;
}

@Component({
  selector: 'ax-dynamic-form',
  standalone: true,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      @for (field of fields; track field.key) {
        <ax-form-field>
          @switch (field.type) {
            @case ('select') {
              <mat-select [formControlName]="field.key"
                         [placeholder]="field.placeholder">
                @for (option of field.options; track option.value) {
                  <mat-option [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                }
              </mat-select>
            }
            @case ('textarea') {
              <textarea axInput
                       [formControlName]="field.key"
                       [placeholder]="field.placeholder"
                       rows="4">
              </textarea>
            }
            @case ('checkbox') {
              <mat-checkbox [formControlName]="field.key">
                {{ field.label }}
              </mat-checkbox>
            }
            @default {
              <input axInput
                    [type]="field.type"
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder">
            }
          }
          <mat-label>{{ field.label }}</mat-label>
          @if (hasError(field.key)) {
            <mat-error>{{ getError(field.key) }}</mat-error>
          }
        </ax-form-field>
      }
      
      <div class="form-actions">
        <ax-button type="submit" 
                  [disabled]="!form.valid || submitting()">
          Submit
        </ax-button>
      </div>
    </form>
  `
})
export class AxDynamicForm {
  @Input() fields: AxFormField[] = [];
  @Output() formSubmit = new EventEmitter<any>();
  
  form: FormGroup;
  submitting = signal(false);
  
  ngOnInit() {
    this.buildForm();
  }
  
  buildForm() {
    const controls = this.fields.reduce((acc, field) => {
      acc[field.key] = new FormControl(
        field.config?.defaultValue || '',
        field.validators || []
      );
      return acc;
    }, {});
    
    this.form = new FormGroup(controls);
  }
}
```

#### 5.2 Navigation System

```typescript
export interface AxNavigationItem {
  id: string;
  title: string;
  type: 'item' | 'group' | 'collapsable' | 'divider';
  icon?: string;
  link?: string;
  exactMatch?: boolean;
  badge?: {
    title: string;
    classes?: string;
  };
  children?: AxNavigationItem[];
  meta?: Record<string, any>;
}

@Component({
  selector: 'ax-navigation',
  standalone: true,
  template: `
    <nav class="ax-navigation" [class.ax-navigation-vertical]="layout === 'vertical'">
      @for (item of navigation(); track item.id) {
        @switch (item.type) {
          @case ('group') {
            <ax-nav-group [item]="item" />
          }
          @case ('collapsable') {
            <ax-nav-collapsable [item]="item" />
          }
          @case ('divider') {
            <ax-nav-divider />
          }
          @default {
            <ax-nav-item [item]="item" />
          }
        }
      }
    </nav>
  `
})
export class AxNavigation {
  @Input() navigation = signal<AxNavigationItem[]>([]);
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() appearance: 'default' | 'compact' | 'dense' = 'default';
}
```

### Phase 6: Integration & Documentation (Week 9-10)

#### 6.1 Authentication Integration

```typescript
export const axAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AxAuthService);
  const router = inject(Router);
  
  return auth.check().pipe(
    map(authenticated => {
      if (!authenticated) {
        router.navigate(['/auth/sign-in'], {
          queryParams: { redirectURL: state.url }
        });
        return false;
      }
      return true;
    })
  );
};

// Permission directive
@Directive({
  selector: '[axHasPermission]',
  standalone: true
})
export class AxHasPermissionDirective {
  private auth = inject(AxAuthService);
  private viewContainer = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef<any>);
  
  @Input() set axHasPermission(permission: string) {
    const hasPermission = this.auth.hasPermission(permission);
    
    if (hasPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
```

#### 6.2 Storybook Setup

```typescript
// Card.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { AxCard } from '@aegisx-ui/components';

const meta: Meta<AxCard> = {
  title: 'Components/Card',
  component: AxCard,
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl']
    }
  }
};

export default meta;
type Story = StoryObj<AxCard>;

export const Default: Story = {
  args: {
    expandable: false,
    flippable: false,
    elevation: 'md'
  }
};

export const Expandable: Story = {
  args: {
    expandable: true,
    elevation: 'lg'
  }
};

export const Flippable: Story = {
  args: {
    flippable: true,
    elevation: 'xl'
  }
};
```

## 🚀 Usage Guide

### Installation

```bash
npm install @aegisx-ui/core @aegisx-ui/components @aegisx-ui/layouts @aegisx-ui/theme
```

### Basic Setup

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAegisX } from '@aegisx-ui/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAegisX({
      theme: 'modern',
      scheme: 'auto',
      layout: 'admin',
      animations: true,
      ripple: true
    }),
    // Other providers...
  ]
});
```

### Using Components

```typescript
import { Component } from '@angular/core';
import { AxCard, AxButton, AxAlert } from '@aegisx-ui/components';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [AxCard, AxButton, AxAlert],
  template: `
    <ax-alert type="info" [dismissible]="true">
      Welcome to AegisX UI!
    </ax-alert>
    
    <ax-card [expandable]="true" class="mt-4">
      <ax-card-header>
        <h2>My Card</h2>
      </ax-card-header>
      <ax-card-content>
        <p>Card content goes here</p>
      </ax-card-content>
      <ax-card-actions>
        <ax-button variant="primary">Save</ax-button>
        <ax-button variant="secondary">Cancel</ax-button>
      </ax-card-actions>
    </ax-card>
  `
})
export class ExampleComponent {}
```

### Using Layouts

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: AxAdminLayout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component')
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.routes')
      }
    ]
  },
  {
    path: 'auth',
    component: AxEmptyLayout,
    children: [
      {
        path: 'sign-in',
        loadComponent: () => import('./auth/sign-in.component')
      }
    ]
  }
];
```

## 📊 Performance Targets

- **Bundle Size**: < 50KB for core + 150KB for all components
- **Tree Shaking**: Full support
- **Load Time**: < 100ms for component initialization
- **Runtime Performance**: 60fps animations
- **Memory**: < 10MB heap allocation

## 🧪 Testing Strategy

```bash
# Unit tests
nx test @aegisx-ui/core
nx test @aegisx-ui/components

# E2E tests
nx e2e @aegisx-ui/components-e2e

# Visual regression
npm run chromatic

# Coverage report
nx test @aegisx-ui/core --coverage
```

## 📈 Success Metrics

1. **Adoption**
   - 100+ projects using within 6 months
   - 90% developer satisfaction
   - Active community contributions

2. **Quality**
   - 95%+ test coverage
   - Zero critical bugs
   - AA accessibility compliance

3. **Performance**
   - Lighthouse score > 95
   - Core Web Vitals: all green

## 🎯 Next Steps

1. **Week 1**: Setup monorepo and core services
2. **Week 2**: Implement base components
3. **Week 3**: Build layout system
4. **Week 4**: Create theming system
5. **Week 5**: Add advanced features
6. **Week 6**: Documentation and examples
7. **Week 7**: Testing and optimization
8. **Week 8**: Beta release
9. **Week 9**: Community feedback
10. **Week 10**: Production release v1.0

---

> 💡 @aegisx-ui will be a production-ready, enterprise-grade UI framework that combines the best of Fuse with modern Angular patterns and exceptional developer experience.