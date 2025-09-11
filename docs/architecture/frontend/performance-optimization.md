# Frontend Performance & Bundle Optimization

## Angular 19 Performance Patterns

### Signals Performance Optimization

```typescript
// Efficient signal composition patterns
@Injectable({ providedIn: 'root' })
export class OptimizedUserService {
  // Use Map for O(1) lookups instead of arrays
  private usersMapSignal = signal(new Map<string, User>());
  private userIdsSignal = signal<string[]>([]);
  private indexSignal = signal(new Map<string, number>()); // For sorting

  // Computed arrays are memoized automatically
  readonly users = computed(() => {
    const map = this.usersMapSignal();
    const ids = this.userIdsSignal();
    return ids.map((id) => map.get(id)!).filter(Boolean);
  });

  readonly usersByRole = computed(() => {
    const users = this.users();
    const grouped = new Map<string, User[]>();

    users.forEach((user) => {
      const role = user.role.name;
      if (!grouped.has(role)) grouped.set(role, []);
      grouped.get(role)!.push(user);
    });

    return grouped;
  });

  // Efficient updates - only touch affected signals
  updateUser(userId: string, updates: Partial<User>) {
    this.usersMapSignal.update((map) => {
      const newMap = new Map(map);
      const existing = newMap.get(userId);
      if (existing) {
        newMap.set(userId, { ...existing, ...updates });
      }
      return newMap;
    });
    // userIdsSignal unchanged - no unnecessary re-computation
  }

  addUser(user: User) {
    this.usersMapSignal.update((map) => new Map(map).set(user.id, user));
    this.userIdsSignal.update((ids) => [...ids, user.id]);
  }

  removeUser(userId: string) {
    this.usersMapSignal.update((map) => {
      const newMap = new Map(map);
      newMap.delete(userId);
      return newMap;
    });
    this.userIdsSignal.update((ids) => ids.filter((id) => id !== userId));
  }

  // Batch operations for performance
  loadUsers(users: User[]) {
    const userMap = new Map(users.map((u) => [u.id, u]));
    const userIds = users.map((u) => u.id);

    // Single signal update instead of multiple
    this.usersMapSignal.set(userMap);
    this.userIdsSignal.set(userIds);
  }
}
```

### Change Detection Optimization

```typescript
// Use OnPush with signals for maximum performance
@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Angular's signal tracking automatically optimizes change detection -->
    @for (user of users(); track user.id) {
      <app-user-card [user]="user" [selected]="isSelected(user.id)" (selectionChange)="onSelectionChange(user.id)" />
    }
  `,
})
export class UserListComponent {
  userService = inject(UserService);

  // Signals automatically trigger minimal change detection
  users = this.userService.users;
  selectedIds = signal<Set<string>>(new Set());

  // Computed with memoization
  isSelected = computed(() => (userId: string) => this.selectedIds().has(userId));

  onSelectionChange(userId: string) {
    this.selectedIds.update((ids) => {
      const newSet = new Set(ids);
      newSet.has(userId) ? newSet.delete(userId) : newSet.add(userId);
      return newSet;
    });
  }
}
```

### Virtual Scrolling for Large Lists

```typescript
@Component({
  selector: 'app-virtual-user-list',
  standalone: true,
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="72" class="h-96 border border-gray-200 rounded-lg">
      @for (user of users(); track user.id) {
        <div class="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50">
          <img [src]="user.avatar || '/assets/default-avatar.png'" class="w-10 h-10 rounded-full mr-4" />
          <div class="flex-1">
            <p class="font-medium">{{ user.firstName }} {{ user.lastName }}</p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
          <ui-status-badge [status]="user.isActive ? 'success' : 'neutral'">
            {{ user.isActive ? 'Active' : 'Inactive' }}
          </ui-status-badge>
        </div>
      }
    </cdk-virtual-scroll-viewport>
  `,
})
export class VirtualUserListComponent {
  userService = inject(UserService);
  users = this.userService.users;
}
```

## Lazy Loading Strategies

### Feature-Based Lazy Loading

```typescript
// Lazy load entire feature modules
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./features/users/user.routes').then(m => m.userRoutes)
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/report.routes').then(m => m.reportRoutes)
  }
];

// Component-level lazy loading
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
}
```

### Deferred Loading with @defer

```html
<!-- Lazy load heavy components -->
@defer (on viewport) {
<app-heavy-chart [data]="chartData()"></app-heavy-chart>
} @placeholder {
<div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
  <p class="text-gray-500">Chart will load when visible</p>
</div>
} @loading {
<div class="h-64 flex items-center justify-center">
  <mat-spinner diameter="40"></mat-spinner>
</div>
}

<!-- Interaction-based loading -->
@defer (on interaction) {
<app-user-details-modal [userId]="selectedUserId()"></app-user-details-modal>
} @placeholder {
<button class="p-2 bg-gray-100 rounded-md">View Details</button>
}

<!-- Time-based loading for non-critical content -->
@defer (after 2000ms) {
<app-analytics-widget></app-analytics-widget>
} @placeholder {
<div class="h-32 bg-gray-50 rounded-md"></div>
}
```

### Dynamic Imports for Large Libraries

```typescript
// Lazy load heavy libraries
@Component({
  template: `
    @if (showEditor()) {
      <div #editorContainer></div>
    }
  `,
})
export class CodeEditorComponent {
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;

  showEditor = signal(false);

  async loadEditor() {
    if (this.showEditor()) return;

    // Dynamic import of Monaco Editor
    const [monaco, editorModule] = await Promise.all([import('monaco-editor'), import('./monaco-config')]);

    // Initialize editor
    const editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: '',
      language: 'typescript',
      theme: 'vs-dark',
    });

    this.showEditor.set(true);
  }
}
```

## Bundle Size Optimization

### Webpack Bundle Analyzer Setup

```bash
# Install analyzer
npm install --save-dev webpack-bundle-analyzer

# Add script to package.json
"scripts": {
  "analyze": "ng build --stats-json && npx webpack-bundle-analyzer dist/apps/user-portal/stats.json"
}

# Run analysis
npm run analyze
```

### Tree Shaking Optimization

```typescript
// Optimize Angular Material imports
// ❌ Don't import entire modules
import { MatButtonModule, MatIconModule, MatFormFieldModule } from '@angular/material';

// ✅ Import only what you need
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

// ❌ Don't import entire libraries
import * as _ from 'lodash';

// ✅ Import specific functions
import { debounce, throttle } from 'lodash-es';

// Or better - use native alternatives
const debounced = (fn: Function, delay: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};
```

### Code Splitting Strategies

```typescript
// Route-based splitting (automatic)
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./features/users/user.routes')
  }
];

// Component-based splitting
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard.component')
}

// Manual splitting for utilities
export class UtilityService {
  async loadHeavyUtility() {
    const { heavyFunction } = await import('./heavy-utility');
    return heavyFunction;
  }
}
```

## Image Optimization

### Lazy Loading Images

```typescript
@Component({
  selector: 'app-optimized-image',
  standalone: true,
  template: `
    <div class="relative">
      <!-- Placeholder while loading -->
      @if (!imageLoaded()) {
        <div [style.width.px]="width()" [style.height.px]="height()" class="bg-gray-200 rounded-md flex items-center justify-center">
          <mat-icon class="text-gray-400">image</mat-icon>
        </div>
      }

      <!-- Actual image -->
      <img [src]="optimizedSrc()" [alt]="alt()" [width]="width()" [height]="height()" [class]="imageClasses()" (load)="onImageLoad()" (error)="onImageError()" loading="lazy" [style.display]="imageLoaded() ? 'block' : 'none'" />

      <!-- Error state -->
      @if (imageError()) {
        <div [style.width.px]="width()" [style.height.px]="height()" class="bg-red-100 rounded-md flex items-center justify-center">
          <mat-icon class="text-red-400">broken_image</mat-icon>
        </div>
      }
    </div>
  `,
})
export class OptimizedImageComponent {
  src = input.required<string>();
  alt = input.required<string>();
  width = input<number>(100);
  height = input<number>(100);
  quality = input<number>(85);
  format = input<'webp' | 'jpg' | 'png'>('webp');

  private imageLoadedSignal = signal(false);
  private imageErrorSignal = signal(false);

  readonly imageLoaded = this.imageLoadedSignal.asReadonly();
  readonly imageError = this.imageErrorSignal.asReadonly();

  // Generate optimized image URL
  readonly optimizedSrc = computed(() => {
    const baseSrc = this.src();
    const w = this.width();
    const h = this.height();
    const q = this.quality();
    const f = this.format();

    // Example with image optimization service
    return `${baseSrc}?w=${w}&h=${h}&q=${q}&f=${f}`;
  });

  readonly imageClasses = computed(() => {
    const baseClasses = 'transition-opacity duration-300';
    return `${baseClasses} ${this.imageLoaded() ? 'opacity-100' : 'opacity-0'}`;
  });

  onImageLoad() {
    this.imageLoadedSignal.set(true);
    this.imageErrorSignal.set(false);
  }

  onImageError() {
    this.imageLoadedSignal.set(false);
    this.imageErrorSignal.set(true);
  }
}

// Intersection Observer for advanced lazy loading
@Directive({
  selector: '[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad!: string;
  @Output() lazyLoad = new EventEmitter<string>();

  private observer?: IntersectionObserver;

  ngOnInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.lazyLoad.emit(this.appLazyLoad);
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Load 50px before entering viewport
      },
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  constructor(private elementRef: ElementRef) {}
}
```

## Memory Management

### Subscription Management with Signals

```typescript
// ❌ Old pattern with memory leaks
@Component({})
export class BadComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // These can cause memory leaks
    this.subscriptions.push(
      this.userService.users$.subscribe((users) => {
        this.users = users;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

// ✅ Modern pattern with signals - automatic cleanup
@Component({})
export class GoodComponent {
  userService = inject(UserService);

  // Signals are automatically cleaned up
  users = this.userService.users;

  // For external observables, use toSignal with automatic cleanup
  windowSize = toSignal(
    fromEvent(window, 'resize').pipe(
      map(() => ({ width: window.innerWidth, height: window.innerHeight })),
      startWith({ width: window.innerWidth, height: window.innerHeight }),
    ),
    { initialValue: { width: 0, height: 0 } },
  );
}
```

### Component Lifecycle Optimization

```typescript
@Component({
  selector: 'app-optimized-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Use trackBy for efficient list rendering -->
    @for (item of items(); track trackByFn(item)) {
      <app-list-item [item]="item" />
    }
  `,
})
export class OptimizedListComponent {
  items = input<any[]>([]);

  // Efficient tracking function
  trackByFn = (item: any) => item.id || item;

  // Use OnInit only when necessary
  ngOnInit() {
    // Heavy initialization only if needed
    if (this.items().length > 1000) {
      this.setupVirtualization();
    }
  }

  private setupVirtualization() {
    // Setup virtual scrolling for large lists
  }
}
```

## Performance Monitoring

### Core Web Vitals Tracking

```typescript
// libs/ui-kit/src/lib/services/performance.service.ts
@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private metricsSignal = signal<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0,
  });

  readonly metrics = this.metricsSignal.asReadonly();

  constructor() {
    this.initPerformanceTracking();
  }

  private initPerformanceTracking() {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.updateMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.updateMetric('fid', (entry as any).processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      this.updateMetric('cls', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private updateMetric(key: keyof PerformanceMetrics, value: number) {
    this.metricsSignal.update((metrics) => ({
      ...metrics,
      [key]: value,
    }));
  }

  // Report metrics to analytics
  reportMetrics() {
    const metrics = this.metrics();

    // Send to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
      });
    }
  }

  // Performance budget alerts
  checkPerformanceBudget() {
    const metrics = this.metrics();
    const budgets = {
      lcp: 2500, // 2.5s
      fid: 100, // 100ms
      cls: 0.1, // 0.1
    };

    const violations = [];
    if (metrics.lcp > budgets.lcp) violations.push(`LCP: ${metrics.lcp}ms > ${budgets.lcp}ms`);
    if (metrics.fid > budgets.fid) violations.push(`FID: ${metrics.fid}ms > ${budgets.fid}ms`);
    if (metrics.cls > budgets.cls) violations.push(`CLS: ${metrics.cls} > ${budgets.cls}`);

    return violations;
  }
}

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}
```

### Component Performance Monitoring

```typescript
@Injectable()
export class ComponentPerformanceTracker {
  private renderTimes = signal<Map<string, number>>(new Map());

  startTimer(componentName: string): string {
    const timerId = `${componentName}-${Date.now()}`;
    performance.mark(`${timerId}-start`);
    return timerId;
  }

  endTimer(timerId: string, componentName: string) {
    performance.mark(`${timerId}-end`);
    performance.measure(timerId, `${timerId}-start`, `${timerId}-end`);

    const measure = performance.getEntriesByName(timerId)[0];
    this.renderTimes.update((times) => new Map(times).set(componentName, measure.duration));

    // Alert if component is slow
    if (measure.duration > 16) {
      // 60fps = 16ms per frame
      console.warn(`Slow component: ${componentName} took ${measure.duration.toFixed(2)}ms`);
    }
  }

  getRenderTime(componentName: string): number {
    return this.renderTimes().get(componentName) || 0;
  }
}

// Usage in components
@Component({
  template: `...`,
})
export class MonitoredComponent implements OnInit, AfterViewInit {
  private perfTracker = inject(ComponentPerformanceTracker);
  private timerId?: string;

  ngOnInit() {
    this.timerId = this.perfTracker.startTimer('MonitoredComponent');
  }

  ngAfterViewInit() {
    if (this.timerId) {
      this.perfTracker.endTimer(this.timerId, 'MonitoredComponent');
    }
  }
}
```

## HTTP Performance

### HTTP Caching Strategy

```typescript
// HTTP cache interceptor
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, { response: HttpResponse<any>; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const cacheKey = this.getCacheKey(req);
    const cached = this.cache.get(cacheKey);

    // Return cached response if valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return of(cached.response);
    }

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cache.set(cacheKey, {
            response: event,
            timestamp: Date.now(),
          });
        }
      }),
    );
  }

  private getCacheKey(req: HttpRequest<any>): string {
    return `${req.method}:${req.url}:${JSON.stringify(req.params)}`;
  }
}
```

### Request Debouncing

```typescript
@Injectable()
export class DebouncedSearchService {
  private searchSubject = new Subject<string>();
  private searchResults = signal<any[]>([]);

  readonly results = this.searchResults.asReadonly();

  constructor() {
    // Debounce search requests
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.performSearch(term)),
      )
      .subscribe((results) => {
        this.searchResults.set(results);
      });
  }

  search(term: string) {
    this.searchSubject.next(term);
  }

  private performSearch(term: string): Observable<any[]> {
    if (!term.trim()) return of([]);

    return this.http.get<any[]>(`/api/search?q=${encodeURIComponent(term)}`);
  }
}
```

## Build Optimization

### Angular Build Configuration

```json
// angular.json - Production optimizations
{
  "projects": {
    "user-portal": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### Preloading Strategies

```typescript
// Custom preloading strategy
@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload high-priority routes
    if (route.data?.['preload'] === true) {
      return load();
    }

    // Preload after initial load with delay
    if (route.data?.['preload'] === 'delayed') {
      return timer(2000).pipe(
        switchMap(() => load())
      );
    }

    return of(null);
  }
}

// Router configuration
RouterModule.forRoot(routes, {
  preloadingStrategy: CustomPreloadingStrategy
})

// Route configuration
{
  path: 'users',
  loadChildren: () => import('./users/user.routes'),
  data: { preload: true } // High priority
},
{
  path: 'reports',
  loadChildren: () => import('./reports/report.routes'),
  data: { preload: 'delayed' } // Low priority
}
```

### Service Worker for Caching

```typescript
// Service worker registration
import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [
    // ... other providers
    importProvidersFrom(
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
      })
    )
  ]
});

// Service worker configuration (ngsw-config.json)
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-cache",
      "urls": ["/api/**"],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "10s"
      }
    }
  ]
}
```

## Performance Testing

### Bundle Size Testing

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should meet bundle size budget', async ({ page }) => {
    await page.goto('/');

    // Measure bundle sizes
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0];
    });

    // Check resource sizes
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry) => ({
        name: entry.name,
        size: entry.transferSize,
        type: entry.initiatorType,
      }));
    });

    const totalJSSize = resources.filter((r) => r.name.endsWith('.js')).reduce((total, r) => total + r.size, 0);

    // Assert bundle size is under budget
    expect(totalJSSize).toBeLessThan(1024 * 1024); // 1MB
  });

  test('should load in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries.find((entry) => entry.entryType === 'largest-contentful-paint');
          if (lcpEntry) {
            resolve({ lcp: lcpEntry.startTime });
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Timeout after 10 seconds
        setTimeout(() => resolve({ lcp: 0 }), 10000);
      });
    });

    expect((metrics as any).lcp).toBeLessThan(2500); // 2.5s LCP budget
  });
});
```

### Runtime Performance Monitoring

```typescript
@Component({
  template: `
    <!-- Performance monitoring overlay (dev mode only) -->
    @if (showPerfMonitor()) {
      <div class="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs">
        <div>FPS: {{ currentFPS() }}</div>
        <div>Memory: {{ memoryUsage() }}</div>
        <div>Components: {{ componentCount() }}</div>
        <div>Change Detections: {{ changeDetectionCount() }}</div>
      </div>
    }
  `,
})
export class PerformanceMonitorComponent {
  private fpsSignal = signal(0);
  private memorySignal = signal(0);
  private componentCountSignal = signal(0);
  private changeDetectionCountSignal = signal(0);

  readonly currentFPS = this.fpsSignal.asReadonly();
  readonly memoryUsage = this.memorySignal.asReadonly();
  readonly componentCount = this.componentCountSignal.asReadonly();
  readonly changeDetectionCount = this.changeDetectionCountSignal.asReadonly();

  readonly showPerfMonitor = computed(() => !environment.production);

  constructor() {
    if (!environment.production) {
      this.startMonitoring();
    }
  }

  private startMonitoring() {
    // FPS monitoring
    let lastTime = performance.now();
    let frameCount = 0;

    const trackFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        this.fpsSignal.set(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(trackFPS);
    };
    requestAnimationFrame(trackFPS);

    // Memory monitoring
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.memorySignal.set(Math.round(memory.usedJSHeapSize / 1024 / 1024));
      }
    }, 1000);
  }
}
```

## Build Performance

### Nx Build Optimization

```json
// nx.json - Build optimization
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nx/workspace/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"],
        "parallel": 3
      }
    }
  },
  "targetDefaults": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    }
  }
}
```

### Webpack Optimization

```typescript
// webpack.config.js (if needed for custom optimization)
const webpack = require('webpack');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all',
        },
        material: {
          test: /[\\/]node_modules[\\/]@angular[\\/]material[\\/]/,
          name: 'material',
          priority: 20,
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    // Analyze bundle size
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
```

## Performance Checklist

### Development

- [ ] Use OnPush change detection with signals
- [ ] Implement trackBy functions for lists
- [ ] Use virtual scrolling for large datasets
- [ ] Optimize image loading with lazy loading
- [ ] Use @defer for non-critical components
- [ ] Monitor Core Web Vitals during development

### Build Optimization

- [ ] Enable production optimizations
- [ ] Set appropriate bundle budgets
- [ ] Use custom preloading strategies
- [ ] Implement service worker caching
- [ ] Optimize third-party library imports
- [ ] Use tree-shaking friendly imports

### Runtime Performance

- [ ] Monitor memory usage
- [ ] Track component render times
- [ ] Implement HTTP caching
- [ ] Use debouncing for user inputs
- [ ] Optimize signal computations
- [ ] Profile with Angular DevTools

### Testing

- [ ] E2E performance tests
- [ ] Bundle size regression tests
- [ ] Core Web Vitals monitoring
- [ ] Lighthouse CI integration
- [ ] Performance budget enforcement

## Best Practices

1. **Signals First**: Use signals for optimal change detection
2. **Lazy Everything**: Defer loading until needed
3. **Track Performance**: Monitor Core Web Vitals continuously
4. **Bundle Budgets**: Set and enforce size limits
5. **Cache Strategically**: Cache API responses and static assets
6. **Optimize Images**: Use modern formats and lazy loading
7. **Profile Regularly**: Use browser DevTools and Angular DevTools
8. **Test Performance**: Include performance in CI/CD pipeline
