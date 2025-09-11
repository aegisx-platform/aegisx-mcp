# UI/UX Design System

## Design System Architecture

### Component Hierarchy

```
Design System
├── Tokens (Design Variables)
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Breakpoints
│   └── Shadows
├── Foundations
│   ├── Layout Grid
│   ├── Iconography
│   └── Animations
├── Components
│   ├── Atoms (Button, Input, Icon)
│   ├── Molecules (Search Bar, Card Header)
│   ├── Organisms (Data Table, Navigation)
│   └── Templates (Page Layouts)
└── Patterns
    ├── Forms
    ├── Data Display
    ├── Navigation
    └── Feedback
```

## Design Tokens

### Color System

```scss
// libs/ui-kit/src/styles/tokens/_colors.scss
$colors: (
  // Brand Colors
  primary: (
      50: #f0f9ff,
      100: #e0f2fe,
      500: #0ea5e9,
      600: #0284c7,
      900: #0c4a6e,
    ),

  // Semantic Colors
  success: (
      50: #f0fdf4,
      500: #22c55e,
      600: #16a34a,
    ),
  error: (
    50: #fef2f2,
    500: #ef4444,
    600: #dc2626,
  ),
  warning: (
    50: #fffbeb,
    500: #f59e0b,
    600: #d97706,
  ),

  // Neutral Colors
  gray: (
      50: #f9fafb,
      100: #f3f4f6,
      500: #6b7280,
      900: #111827,
    )
);

// CSS Custom Properties for Angular Material
:root {
  --color-primary-50: #{map-get(map-get($colors, primary), 50)};
  --color-primary-500: #{map-get(map-get($colors, primary), 500)};
  // ... other colors
}
```

### Typography Scale

```scss
// Typography tokens
$typography: (
  font-family: (
    sans: (
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif,
    ),
    mono: (
      'JetBrains Mono',
      'Fira Code',
      monospace,
    ),
  ),

  font-size: (
    xs: 0.75rem,
    // 12px
    sm: 0.875rem,
    // 14px
    base: 1rem,
    // 16px
    lg: 1.125rem,
    // 18px
    xl: 1.25rem,
    // 20px
    2xl: 1.5rem,
    // 24px
    3xl: 1.875rem,
    // 30px
    4xl: 2.25rem,
    // 36px
  ),

  font-weight: (
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  ),

  line-height: (
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  ),
);
```

### Spacing System

```scss
// Consistent spacing scale
$spacing: (
  0: 0,
  1: 0.25rem,
  // 4px
  2: 0.5rem,
  // 8px
  3: 0.75rem,
  // 12px
  4: 1rem,
  // 16px
  5: 1.25rem,
  // 20px
  6: 1.5rem,
  // 24px
  8: 2rem,
  // 32px
  10: 2.5rem,
  // 40px
  12: 3rem,
  // 48px
  16: 4rem,
  // 64px
  20: 5rem,
  // 80px
  24: 6rem, // 96px
);
```

## Component Library Structure

### Base Components (Atoms)

```typescript
// libs/ui-kit/src/lib/components/button/button.component.ts
@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button [type]="type" [disabled]="disabled()" [class]="buttonClasses()" (click)="onClick()">
      @if (loading()) {
        <mat-spinner diameter="16" class="mr-2"></mat-spinner>
      }

      @if (icon() && !loading()) {
        <mat-icon class="mr-2">{{ icon() }}</mat-icon>
      }

      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  disabled = input(false);
  loading = input(false);
  icon = input<string>();

  @Output() clickEvent = new EventEmitter<Event>();

  buttonClasses = computed(() => {
    const baseClasses = 'inline-flex items-center font-medium rounded-md transition-all duration-200';

    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const disabledClasses = this.disabled() ? 'opacity-50 cursor-not-allowed' : '';

    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]} ${disabledClasses}`.trim();
  });

  onClick() {
    if (!this.disabled() && !this.loading()) {
      this.clickEvent.emit();
    }
  }
}
```

### Form Components

```typescript
// libs/ui-kit/src/lib/components/form-field/form-field.component.ts
@Component({
  selector: 'ui-form-field',
  standalone: true,
  template: `
    <div class="mb-4">
      @if (label()) {
        <label [for]="inputId" class="block text-sm font-medium text-gray-700 mb-1">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500 ml-1">*</span>
          }
        </label>
      }

      <div class="relative">
        <ng-content></ng-content>

        @if (loading()) {
          <div class="absolute right-2 top-2">
            <mat-spinner diameter="16"></mat-spinner>
          </div>
        }
      </div>

      @if (error()) {
        <p class="mt-1 text-sm text-red-600">{{ error() }}</p>
      }

      @if (hint() && !error()) {
        <p class="mt-1 text-sm text-gray-500">{{ hint() }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  label = input<string>();
  error = input<string>();
  hint = input<string>();
  required = input(false);
  loading = input(false);

  inputId = `field-${Math.random().toString(36).substr(2, 9)}`;
}
```

### Data Display Components

```typescript
// libs/ui-kit/src/lib/components/data-table/data-table.component.ts
@Component({
  selector: 'ui-data-table',
  standalone: true,
  template: `
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">{{ title() }}</h3>

          <div class="flex items-center space-x-2">
            @if (searchable()) {
              <ui-search-input [placeholder]="searchPlaceholder()" (searchChange)="onSearchChange($event)" />
            }

            @if (filterable()) {
              <ui-filter-dropdown [filters]="filters()" (filterChange)="onFilterChange($event)" />
            }

            <ng-content select="[slot=actions]"></ng-content>
          </div>
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        @if (loading()) {
          <div class="flex justify-center p-8">
            <mat-spinner></mat-spinner>
          </div>
        } @else if (error()) {
          <div class="p-8 text-center">
            <mat-icon class="text-red-500 text-4xl mb-2">error</mat-icon>
            <p class="text-gray-600">{{ error() }}</p>
            <button ui-button variant="outline" (clickEvent)="onRetry()">Retry</button>
          </div>
        } @else {
          <table class="min-w-full divide-y divide-gray-200">
            <ng-content select="[slot=table]"></ng-content>
          </table>
        }
      </div>

      <!-- Pagination -->
      @if (paginated() && !loading() && !error()) {
        <div class="px-6 py-4 border-t border-gray-200">
          <ui-pagination [currentPage]="currentPage()" [totalPages]="totalPages()" [pageSize]="pageSize()" [total]="total()" (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)" />
        </div>
      }
    </div>
  `,
})
export class DataTableComponent {
  // Configuration
  title = input<string>();
  searchable = input(true);
  filterable = input(false);
  paginated = input(true);
  searchPlaceholder = input('Search...');

  // State
  loading = input(false);
  error = input<string>();
  filters = input<any[]>([]);

  // Pagination
  currentPage = input(1);
  totalPages = input(1);
  pageSize = input(10);
  total = input(0);

  // Events
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() retry = new EventEmitter<void>();

  onSearchChange(term: string) {
    this.searchChange.emit(term);
  }

  onFilterChange(filter: any) {
    this.filterChange.emit(filter);
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }

  onRetry() {
    this.retry.emit();
  }
}
```

## Theme System Integration

### Angular Material Theme Customization

```scss
// libs/ui-kit/src/styles/theme.scss
@use '@angular/material' as mat;

// Define custom palettes
$custom-primary: mat.define-palette(
  (
    50: #f0f9ff,
    100: #e0f2fe,
    200: #bae6fd,
    300: #7dd3fc,
    400: #38bdf8,
    500: #0ea5e9,
    600: #0284c7,
    700: #0369a1,
    800: #075985,
    900: #0c4a6e,
    A100: #7dd3fc,
    A200: #38bdf8,
    A400: #0ea5e9,
    A700: #0369a1,
    contrast: (
      50: rgba(black, 0.87),
      100: rgba(black, 0.87),
      200: rgba(black, 0.87),
      300: rgba(black, 0.87),
      400: white,
      500: white,
      600: white,
      700: white,
      800: white,
      900: white,
      A100: rgba(black, 0.87),
      A200: rgba(black, 0.87),
      A400: white,
      A700: white,
    ),
  )
);

// Light theme
$light-theme: mat.define-light-theme(
  (
    color: (
      primary: $custom-primary,
      accent: mat.define-palette(mat.$green-palette, 500),
      warn: mat.define-palette(mat.$red-palette, 500),
    ),
    typography: mat.define-typography-config(
        $font-family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        $headline-1: mat.define-typography-level(2.25rem, 2.75rem, 700),
        $headline-2: mat.define-typography-level(1.875rem, 2.25rem, 600),
        $body-1: mat.define-typography-level(1rem, 1.5rem, 400),
      ),
    density: -1,
  )
);

// Dark theme
$dark-theme: mat.define-dark-theme(
  (
    color: (
      primary: $custom-primary,
      accent: mat.define-palette(mat.$green-palette, 400),
      warn: mat.define-palette(mat.$red-palette, 400),
    ),
  )
);

// Apply themes
@include mat.all-component-themes($light-theme);

.dark-theme {
  @include mat.all-component-colors($dark-theme);
}
```

### TailwindCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./apps/*/src/**/*.{html,ts}', './libs/*/src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          // ... other shades
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          // ... custom gray scale
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

## Layout System

### Grid Layout Component

```typescript
// libs/ui-kit/src/lib/layout/grid/grid.component.ts
@Component({
  selector: 'ui-grid',
  standalone: true,
  template: `
    <div [class]="gridClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class GridComponent {
  cols = input<1 | 2 | 3 | 4 | 6 | 12>(12);
  gap = input<'sm' | 'md' | 'lg'>('md');
  responsive = input(true);

  gridClasses = computed(() => {
    const baseClasses = 'grid';

    const colClasses = this.responsive() ? `grid-cols-1 md:grid-cols-${this.cols()}` : `grid-cols-${this.cols()}`;

    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return `${baseClasses} ${colClasses} ${gapClasses[this.gap()]}`;
  });
}

// Grid item component
@Component({
  selector: 'ui-grid-item',
  standalone: true,
  template: `
    <div [class]="itemClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class GridItemComponent {
  span = input<1 | 2 | 3 | 4 | 6 | 12>(1);

  itemClasses = computed(() => `col-span-${this.span()}`);
}
```

### Page Layout Templates

```typescript
// libs/ui-kit/src/lib/layout/page-layout/page-layout.component.ts
@Component({
  selector: 'ui-page-layout',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Page Header -->
      @if (showHeader()) {
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <div class="flex items-center">
                @if (backButton()) {
                  <button mat-icon-button (click)="goBack()" class="mr-2">
                    <mat-icon>arrow_back</mat-icon>
                  </button>
                }
                <h1 class="text-xl font-semibold text-gray-900">{{ title() }}</h1>
              </div>

              <div class="flex items-center space-x-2">
                <ng-content select="[slot=header-actions]"></ng-content>
              </div>
            </div>
          </div>
        </header>
      }

      <!-- Page Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        @if (loading()) {
          <div class="flex justify-center items-center h-64">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <ng-content></ng-content>
        }
      </main>

      <!-- Page Footer -->
      @if (showFooter()) {
        <footer class="bg-white border-t border-gray-200 mt-auto">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ng-content select="[slot=footer]"></ng-content>
          </div>
        </footer>
      }
    </div>
  `,
})
export class PageLayoutComponent {
  title = input<string>();
  showHeader = input(true);
  showFooter = input(false);
  backButton = input(false);
  loading = input(false);

  private router = inject(Router);
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
```

## Card & Content Components

### Enhanced Card Component

```typescript
// libs/ui-kit/src/lib/components/card/card.component.ts
@Component({
  selector: 'ui-card',
  standalone: true,
  template: `
    <div [class]="cardClasses()">
      @if (title() || subtitle() || hasHeaderActions) {
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              @if (title()) {
                <h3 class="text-lg font-medium text-gray-900">{{ title() }}</h3>
              }
              @if (subtitle()) {
                <p class="mt-1 text-sm text-gray-600">{{ subtitle() }}</p>
              }
            </div>
            @if (hasHeaderActions) {
              <div class="flex items-center space-x-2">
                <ng-content select="[slot=header-actions]"></ng-content>
              </div>
            }
          </div>
        </div>
      }

      <div [class]="contentClasses()">
        <ng-content></ng-content>
      </div>

      @if (hasFooter) {
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `,
})
export class CardComponent implements AfterContentInit {
  title = input<string>();
  subtitle = input<string>();
  variant = input<'default' | 'elevated' | 'outlined'>('default');
  padding = input<'none' | 'sm' | 'md' | 'lg'>('md');

  @ContentChildren('headerActions') headerActions!: QueryList<any>;
  @ContentChildren('footer') footer!: QueryList<any>;

  hasHeaderActions = false;
  hasFooter = false;

  ngAfterContentInit() {
    this.hasHeaderActions = this.headerActions.length > 0;
    this.hasFooter = this.footer.length > 0;
  }

  cardClasses = computed(() => {
    const baseClasses = 'bg-white rounded-lg';

    const variantClasses = {
      default: 'border border-gray-200',
      elevated: 'shadow-card hover:shadow-card-hover transition-shadow',
      outlined: 'border-2 border-gray-300',
    };

    return `${baseClasses} ${variantClasses[this.variant()]}`;
  });

  contentClasses = computed(() => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    };

    return paddingClasses[this.padding()];
  });
}
```

## Interactive Components

### Enhanced Dialog Component

```typescript
// libs/ui-kit/src/lib/components/dialog/dialog.component.ts
@Component({
  selector: 'ui-dialog',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" [class.hidden]="!open()">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" (click)="onBackdropClick()"></div>

      <!-- Dialog -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div [class]="dialogClasses()" @slideInUp>
          <!-- Header -->
          @if (title() || closable()) {
            <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              @if (title()) {
                <h2 class="text-xl font-semibold text-gray-900">{{ title() }}</h2>
              }
              @if (closable()) {
                <button mat-icon-button (click)="close()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </div>
          }

          <!-- Content -->
          <div [class]="contentClasses()">
            @if (loading()) {
              <div class="flex justify-center p-8">
                <mat-spinner></mat-spinner>
              </div>
            } @else {
              <ng-content></ng-content>
            }
          </div>

          <!-- Footer Actions -->
          @if (hasFooterActions) {
            <div class="flex justify-end space-x-2 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <ng-content select="[slot=footer-actions]"></ng-content>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  animations: [trigger('slideInUp', [transition(':enter', [style({ transform: 'translateY(100%)', opacity: 0 }), animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))]), transition(':leave', [animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))])])],
})
export class DialogComponent implements AfterContentInit {
  open = input(false);
  title = input<string>();
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  closable = input(true);
  closeOnBackdrop = input(true);
  loading = input(false);

  @Output() openChange = new EventEmitter<boolean>();
  @ContentChildren('footerActions') footerActions!: QueryList<any>;

  hasFooterActions = false;

  ngAfterContentInit() {
    this.hasFooterActions = this.footerActions.length > 0;
  }

  dialogClasses = computed(() => {
    const baseClasses = 'bg-white rounded-lg shadow-xl';

    const sizeClasses = {
      sm: 'max-w-md w-full',
      md: 'max-w-lg w-full',
      lg: 'max-w-2xl w-full',
      xl: 'max-w-4xl w-full',
    };

    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });

  contentClasses = computed(() => {
    return this.loading() ? 'p-0' : 'p-6';
  });

  onBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }

  close() {
    this.openChange.emit(false);
  }
}
```

## Status & Feedback Components

### Status Badge Component

```typescript
// libs/ui-kit/src/lib/components/status-badge/status-badge.component.ts
@Component({
  selector: 'ui-status-badge',
  standalone: true,
  template: `
    <span [class]="badgeClasses()">
      @if (icon()) {
        <mat-icon class="w-3 h-3 mr-1">{{ icon() }}</mat-icon>
      }
      @if (dot()) {
        <span [class]="dotClasses()"></span>
      }
      <ng-content></ng-content>
    </span>
  `,
})
export class StatusBadgeComponent {
  status = input<'success' | 'warning' | 'error' | 'info' | 'neutral'>('neutral');
  size = input<'sm' | 'md' | 'lg'>('md');
  variant = input<'filled' | 'outlined' | 'soft'>('soft');
  icon = input<string>();
  dot = input(false);

  badgeClasses = computed(() => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    const statusClasses = {
      success: {
        filled: 'bg-green-600 text-white',
        outlined: 'border border-green-600 text-green-600',
        soft: 'bg-green-100 text-green-800',
      },
      warning: {
        filled: 'bg-yellow-600 text-white',
        outlined: 'border border-yellow-600 text-yellow-600',
        soft: 'bg-yellow-100 text-yellow-800',
      },
      error: {
        filled: 'bg-red-600 text-white',
        outlined: 'border border-red-600 text-red-600',
        soft: 'bg-red-100 text-red-800',
      },
      info: {
        filled: 'bg-blue-600 text-white',
        outlined: 'border border-blue-600 text-blue-600',
        soft: 'bg-blue-100 text-blue-800',
      },
      neutral: {
        filled: 'bg-gray-600 text-white',
        outlined: 'border border-gray-600 text-gray-600',
        soft: 'bg-gray-100 text-gray-800',
      },
    };

    return `${baseClasses} ${sizeClasses[this.size()]} ${statusClasses[this.status()][this.variant()]}`;
  });

  dotClasses = computed(() => {
    const baseClasses = 'w-2 h-2 rounded-full mr-2';

    const statusColors = {
      success: 'bg-green-400',
      warning: 'bg-yellow-400',
      error: 'bg-red-400',
      info: 'bg-blue-400',
      neutral: 'bg-gray-400',
    };

    return `${baseClasses} ${statusColors[this.status()]}`;
  });
}
```

### Notification Service with UI Component

```typescript
// libs/ui-kit/src/lib/services/notification.service.ts
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{ label: string; action: () => void }>;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);

  readonly notifications = this.notificationsSignal.asReadonly();

  show(notification: Omit<Notification, 'id'>) {
    const id = crypto.randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    this.notificationsSignal.update((notifications) => [...notifications, newNotification]);

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => this.remove(id), newNotification.duration);
    }
  }

  remove(id: string) {
    this.notificationsSignal.update((notifications) => notifications.filter((n) => n.id !== id));
  }

  success(title: string, message?: string) {
    this.show({ type: 'success', title, message });
  }

  error(title: string, message?: string) {
    this.show({ type: 'error', title, message, duration: 0 }); // Don't auto-hide errors
  }

  warning(title: string, message?: string) {
    this.show({ type: 'warning', title, message });
  }

  info(title: string, message?: string) {
    this.show({ type: 'info', title, message });
  }
}

// Notification container component
@Component({
  selector: 'ui-notifications',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (notification of notifications(); track notification.id) {
        <div [class]="notificationClasses(notification)" @slideInRight>
          <div class="flex">
            <div class="flex-shrink-0">
              <mat-icon [class]="iconClasses(notification)">
                {{ getIcon(notification.type) }}
              </mat-icon>
            </div>

            <div class="ml-3 flex-1">
              <p class="text-sm font-medium">{{ notification.title }}</p>
              @if (notification.message) {
                <p class="mt-1 text-sm opacity-90">{{ notification.message }}</p>
              }

              @if (notification.actions) {
                <div class="mt-2 flex space-x-2">
                  @for (action of notification.actions; track action.label) {
                    <button class="text-xs underline opacity-90 hover:opacity-100" (click)="action.action()">
                      {{ action.label }}
                    </button>
                  }
                </div>
              }
            </div>

            <button mat-icon-button (click)="notificationService.remove(notification.id)" class="ml-2 -mr-1">
              <mat-icon class="w-4 h-4">close</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  animations: [trigger('slideInRight', [transition(':enter', [style({ transform: 'translateX(100%)', opacity: 0 }), animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))]), transition(':leave', [animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))])])],
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;

  notificationClasses(notification: Notification) {
    const baseClasses = 'max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 p-4';

    const typeClasses = {
      success: 'border-green-500',
      error: 'border-red-500',
      warning: 'border-yellow-500',
      info: 'border-blue-500',
    };

    return `${baseClasses} ${typeClasses[notification.type]}`;
  }

  iconClasses(notification: Notification) {
    const colors = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
    };

    return `w-5 h-5 ${colors[notification.type]}`;
  }

  getIcon(type: string): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };

    return icons[type] || 'info';
  }
}
```

## Design System Service

### Theme Management

```typescript
// libs/ui-kit/src/lib/services/theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentThemeSignal = signal<'light' | 'dark'>('light');
  private systemThemeSignal = signal<'light' | 'dark'>('light');

  readonly currentTheme = this.currentThemeSignal.asReadonly();
  readonly systemTheme = this.systemThemeSignal.asReadonly();

  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // Detect system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeSignal.set(mediaQuery.matches ? 'dark' : 'light');

    mediaQuery.addEventListener('change', (e) => {
      this.systemThemeSignal.set(e.matches ? 'dark' : 'light');
    });

    // Load saved theme or use system
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    this.currentThemeSignal.set(savedTheme || this.systemTheme());

    // Apply theme
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  toggleTheme() {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentThemeSignal.set(theme);
    localStorage.setItem('theme', theme);
  }

  useSystemTheme() {
    this.setTheme(this.systemTheme());
  }

  private applyTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }
}
```

## Usage Examples

### Complete Feature Implementation

```html
<!-- user-management.component.html -->
<ui-page-layout [title]="'User Management'" [loading]="userService.loading()">
  <!-- Header Actions -->
  <div slot="header-actions">
    <ui-button variant="primary" [icon]="'add'" (clickEvent)="openCreateDialog()"> Add User </ui-button>
  </div>

  <!-- Main Content -->
  <ui-grid [cols]="12" gap="lg">
    <!-- Filters -->
    <ui-grid-item [span]="12">
      <ui-card title="Filters" variant="outlined">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ui-form-field label="Search" [hint]="'Search by name or email'">
            <input class="w-full rounded-md border-gray-300" [value]="searchTerm()" (input)="onSearch($event.target.value)" />
          </ui-form-field>

          <ui-form-field label="Role">
            <select class="w-full rounded-md border-gray-300" [value]="selectedRole()" (change)="onRoleChange($event.target.value)">
              <option value="">All Roles</option>
              @for (role of roles(); track role.id) {
              <option [value]="role.id">{{ role.name }}</option>
              }
            </select>
          </ui-form-field>

          <ui-form-field label="Status">
            <select class="w-full rounded-md border-gray-300">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </ui-form-field>
        </div>
      </ui-card>
    </ui-grid-item>

    <!-- Users Table -->
    <ui-grid-item [span]="12">
      <ui-data-table title="Users" [loading]="userService.loading()" [error]="userService.error()" [currentPage]="userService.currentPage()" [totalPages]="userService.totalPages()" (pageChange)="onPageChange($event)" (retry)="onRetry()">
        <!-- Table Actions -->
        <div slot="actions">
          @if (hasSelected()) {
          <ui-button variant="outline" [icon]="'delete'" (clickEvent)="deleteSelected()"> Delete Selected </ui-button>
          }
        </div>

        <!-- Table Content -->
        <div slot="table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <input type="checkbox" [checked]="allSelected()" (change)="toggleAllSelection()" />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (user of userService.paginatedUsers(); track user.id) {
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input type="checkbox" [checked]="isSelected(user.id)" (change)="toggleSelection(user.id)" />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <img [src]="user.avatar || '/assets/default-avatar.png'" class="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <ui-status-badge [status]="getRoleStatus(user.role)"> {{ user.role.name }} </ui-status-badge>
              </td>
              <td class="px-6 py-4">
                <ui-status-badge [status]="user.isActive ? 'success' : 'neutral'"> {{ user.isActive ? 'Active' : 'Inactive' }} </ui-status-badge>
              </td>
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  <ui-button size="sm" variant="ghost" [icon]="'edit'" (clickEvent)="editUser(user)"> </ui-button>
                  <ui-button size="sm" variant="ghost" [icon]="'delete'" (clickEvent)="deleteUser(user)"> </ui-button>
                </div>
              </td>
            </tr>
            } @empty {
            <tr>
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                <mat-icon class="text-4xl mb-2">people</mat-icon>
                <p>No users found</p>
              </td>
            </tr>
            }
          </tbody>
        </div>
      </ui-data-table>
    </ui-grid-item>
  </ui-grid>
</ui-page-layout>

<!-- User Form Dialog -->
<ui-dialog [open]="showDialog()" [title]="isEditMode() ? 'Edit User' : 'Create User'" size="lg" (openChange)="closeDialog()">
  <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
    <ui-grid [cols]="2" gap="md">
      <ui-grid-item>
        <ui-form-field label="First Name" [required]="true" [error]="getFieldError('firstName')">
          <input class="w-full" formControlName="firstName" />
        </ui-form-field>
      </ui-grid-item>

      <ui-grid-item>
        <ui-form-field label="Last Name" [required]="true" [error]="getFieldError('lastName')">
          <input class="w-full" formControlName="lastName" />
        </ui-form-field>
      </ui-grid-item>

      <ui-grid-item [span]="2">
        <ui-form-field label="Email" [required]="true" [error]="getFieldError('email')">
          <input type="email" class="w-full" formControlName="email" />
        </ui-form-field>
      </ui-grid-item>
    </ui-grid>
  </form>

  <!-- Dialog Actions -->
  <div slot="footer-actions">
    <ui-button variant="outline" (clickEvent)="closeDialog()"> Cancel </ui-button>
    <ui-button variant="primary" [loading]="submitting()" [disabled]="!userForm.valid" (clickEvent)="onSubmit()"> {{ isEditMode() ? 'Update' : 'Create' }} </ui-button>
  </div>
</ui-dialog>

<!-- Global Notifications -->
<ui-notifications></ui-notifications>
```

## Responsive Design Patterns

### Breakpoint Service

```typescript
// libs/ui-kit/src/lib/services/breakpoint.service.ts
@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private breakpointObserver = inject(BreakpointObserver);

  // Signals for different breakpoints
  readonly isMobile = toSignal(this.breakpointObserver.observe('(max-width: 767px)').pipe(map((result) => result.matches)), { initialValue: false });

  readonly isTablet = toSignal(this.breakpointObserver.observe('(min-width: 768px) and (max-width: 1023px)').pipe(map((result) => result.matches)), { initialValue: false });

  readonly isDesktop = toSignal(this.breakpointObserver.observe('(min-width: 1024px)').pipe(map((result) => result.matches)), { initialValue: false });

  // Computed responsive properties
  readonly showSidebar = computed(() => !this.isMobile());
  readonly columnsCount = computed(() => {
    if (this.isMobile()) return 1;
    if (this.isTablet()) return 2;
    return 3;
  });
}
```

## Best Practices

### Design System Guidelines

1. **Consistency**: Use design tokens for all spacing, colors, typography
2. **Accessibility**: WCAG 2.1 AA compliance for all components
3. **Performance**: Lazy load components, optimize bundle size
4. **Maintainability**: Clear component API with TypeScript
5. **Testing**: Visual regression tests for design system components
6. **Documentation**: Storybook for component documentation

### Component Design Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition over Inheritance**: Use slots and content projection
3. **Predictable API**: Consistent input/output patterns
4. **Signals First**: Use signals for reactive state management
5. **Standalone**: All components are standalone for better tree-shaking
