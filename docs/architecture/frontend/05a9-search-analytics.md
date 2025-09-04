# Frontend Search & Analytics Integration

## Search Service with Signals

```typescript
// libs/search/src/lib/services/search.service.ts
@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiService = inject(ApiService);

  // Search state signals
  private searchTermSignal = signal<string>('');
  private searchResultsSignal = signal<SearchResult[]>([]);
  private searchingSignal = signal<boolean>(false);
  private searchFiltersSignal = signal<SearchFilters>({});
  private searchHistorySignal = signal<string[]>([]);

  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly searchResults = this.searchResultsSignal.asReadonly();
  readonly searching = this.searchingSignal.asReadonly();
  readonly searchFilters = this.searchFiltersSignal.asReadonly();
  readonly searchHistory = this.searchHistorySignal.asReadonly();

  // Computed signals
  readonly hasResults = computed(() => this.searchResults().length > 0);
  readonly resultCount = computed(() => this.searchResults().length);
  readonly isSearchActive = computed(() => this.searchTerm().length >= 2);

  // Debounced search effect
  private searchEffect = effect(() => {
    const term = this.searchTerm();
    const filters = this.searchFilters();

    if (term.length >= 2) {
      const timeoutId = setTimeout(() => {
        this.performSearch(term, filters);
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      this.searchResultsSignal.set([]);
    }
  });

  async performSearch(term: string, filters: SearchFilters = {}): Promise<void> {
    this.searchingSignal.set(true);

    try {
      const params = {
        q: term,
        ...filters,
        highlight: true,
        limit: 50,
      };

      const results = await this.apiService.get<SearchResult[]>('/api/search', params);
      this.searchResultsSignal.set(results);

      // Add to search history
      this.addToHistory(term);
    } catch (error) {
      console.error('Search failed:', error);
      this.searchResultsSignal.set([]);
    } finally {
      this.searchingSignal.set(false);
    }
  }

  // Global search across multiple entities
  async globalSearch(term: string): Promise<GlobalSearchResults> {
    this.searchingSignal.set(true);

    try {
      return await this.apiService.get<GlobalSearchResults>('/api/search/global', { q: term });
    } finally {
      this.searchingSignal.set(false);
    }
  }

  // Faceted search with filters
  async facetedSearch(term: string, facets: SearchFacets): Promise<FacetedSearchResults> {
    const params = {
      q: term,
      facets: JSON.stringify(facets),
    };

    return await this.apiService.get<FacetedSearchResults>('/api/search/faceted', params);
  }

  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
  }

  setFilters(filters: SearchFilters): void {
    this.searchFiltersSignal.set(filters);
  }

  clearSearch(): void {
    this.searchTermSignal.set('');
    this.searchResultsSignal.set([]);
    this.searchFiltersSignal.set({});
  }

  private addToHistory(term: string): void {
    this.searchHistorySignal.update((history) => {
      const filtered = history.filter((h) => h !== term);
      return [term, ...filtered].slice(0, 10); // Keep last 10
    });
  }
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  url: string;
  score: number;
  highlights?: string[];
  metadata?: any;
}

interface SearchFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  author?: string;
  tags?: string[];
  status?: string;
}

interface GlobalSearchResults {
  users: SearchResult[];
  documents: SearchResult[];
  orders: SearchResult[];
  products: SearchResult[];
  total: number;
}

interface SearchFacets {
  types: string[];
  dateRange: { from: string; to: string };
  authors: string[];
  tags: string[];
}

interface FacetedSearchResults {
  results: SearchResult[];
  facets: {
    types: { value: string; count: number }[];
    authors: { value: string; count: number }[];
    tags: { value: string; count: number }[];
  };
  total: number;
}
```

## Search Component

```typescript
// apps/user-portal/src/app/features/search/components/search.component.ts
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule, MatMenuModule, MatButtonModule],
  template: `
    <div class="search-container p-4">
      <!-- Search Input -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Search everything...</mat-label>
        <input matInput [formControl]="searchControl" (focus)="onSearchFocus()" placeholder="Type to search users, orders, products..." />
        <mat-icon matPrefix>search</mat-icon>

        @if (searching()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        }

        @if (searchTerm() && !searching()) {
          <button matSuffix mat-icon-button (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <!-- Search Suggestions -->
      @if (showSuggestions() && searchHistory().length > 0) {
        <mat-card class="mt-2 search-suggestions">
          <mat-card-content class="py-2">
            <h4 class="text-sm font-medium text-gray-600 mb-2">Recent Searches</h4>
            <div class="flex flex-wrap gap-1">
              @for (term of searchHistory(); track term) {
                <mat-chip (click)="setSearchTerm(term)" class="cursor-pointer">
                  {{ term }}
                </mat-chip>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Search Results -->
      @if (hasResults()) {
        <mat-card class="mt-4">
          <mat-card-header>
            <mat-card-title> Search Results ({{ resultCount() }}) </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <!-- Global Search Results by Category -->
            <div class="space-y-4">
              @for (category of resultCategories(); track category.type) {
                @if (category.results.length > 0) {
                  <div class="result-category">
                    <h3 class="text-lg font-medium text-gray-800 mb-2">{{ category.label }} ({{ category.results.length }})</h3>

                    <div class="space-y-2">
                      @for (result of category.results; track result.id) {
                        <div class="result-item p-3 border rounded hover:bg-gray-50 cursor-pointer" (click)="navigateToResult(result)">
                          <div class="flex items-start justify-between">
                            <div class="flex-1">
                              <h4 class="font-medium text-gray-900">
                                {{ result.title }}
                              </h4>
                              <p class="text-sm text-gray-600 mt-1" [innerHTML]="result.content"></p>

                              @if (result.highlights && result.highlights.length > 0) {
                                <div class="mt-2">
                                  @for (highlight of result.highlights; track highlight) {
                                    <span class="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded mr-1" [innerHTML]="highlight"></span>
                                  }
                                </div>
                              }
                            </div>

                            <div class="flex items-center space-x-2 text-xs text-gray-500">
                              <span>Score: {{ result.score | number: '1.1-1' }}</span>
                              <mat-icon class="text-sm">{{ getResultIcon(result.type) }}</mat-icon>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Empty State -->
      @if (isSearchActive() && !searching() && !hasResults()) {
        <div class="text-center py-8 text-gray-500">
          <mat-icon class="text-4xl mb-2">search_off</mat-icon>
          <p>No results found for "{{ searchTerm() }}"</p>
          <p class="text-sm">Try different keywords or check spelling</p>
        </div>
      }
    </div>
  `,
})
export class SearchComponent {
  private searchService = inject(SearchService);
  private router = inject(Router);

  searchControl = new FormControl('');

  // Service signals
  searchTerm = this.searchService.searchTerm;
  searchResults = this.searchService.searchResults;
  searching = this.searchService.searching;
  searchHistory = this.searchService.searchHistory;
  hasResults = this.searchService.hasResults;
  resultCount = this.searchService.resultCount;
  isSearchActive = this.searchService.isSearchActive;

  // Local component signals
  showSuggestions = signal(false);

  // Computed
  resultCategories = computed(() => {
    const results = this.searchResults();
    const grouped = this.groupResultsByType(results);

    return [
      { type: 'users', label: 'Users', results: grouped.users || [] },
      { type: 'orders', label: 'Orders', results: grouped.orders || [] },
      { type: 'products', label: 'Products', results: grouped.products || [] },
      { type: 'documents', label: 'Documents', results: grouped.documents || [] },
    ];
  });

  constructor() {
    // Connect form control to service
    effect(() => {
      const term = this.searchControl.value || '';
      this.searchService.setSearchTerm(term);
    });
  }

  ngOnInit() {
    // Listen to form control changes
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
      this.searchService.setSearchTerm(value || '');
    });
  }

  onSearchFocus(): void {
    this.showSuggestions.set(true);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSuggestions.set(false);
    }
  }

  setSearchTerm(term: string): void {
    this.searchControl.setValue(term);
    this.showSuggestions.set(false);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchService.clearSearch();
  }

  navigateToResult(result: SearchResult): void {
    this.router.navigateByUrl(result.url);
  }

  getResultIcon(type: string): string {
    const icons: Record<string, string> = {
      users: 'person',
      orders: 'shopping_cart',
      products: 'inventory',
      documents: 'description',
      default: 'article',
    };

    return icons[type] || icons.default;
  }

  private groupResultsByType(results: SearchResult[]): Record<string, SearchResult[]> {
    return results.reduce(
      (acc, result) => {
        const type = result.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(result);
        return acc;
      },
      {} as Record<string, SearchResult[]>,
    );
  }
}
```

## Analytics Service

```typescript
// libs/analytics/src/lib/services/analytics.service.ts
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiService = inject(ApiService);

  // Analytics data signals
  private dashboardDataSignal = signal<DashboardAnalytics | null>(null);
  private userMetricsSignal = signal<UserMetrics | null>(null);
  private systemMetricsSignal = signal<SystemMetrics | null>(null);
  private loadingSignal = signal<boolean>(false);
  private selectedPeriodSignal = signal<TimePeriod>('7d');

  readonly dashboardData = this.dashboardDataSignal.asReadonly();
  readonly userMetrics = this.userMetricsSignal.asReadonly();
  readonly systemMetrics = this.systemMetricsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly selectedPeriod = this.selectedPeriodSignal.asReadonly();

  // Computed analytics
  readonly totalUsers = computed(() => this.dashboardData()?.totalUsers || 0);
  readonly activeUsers = computed(() => this.dashboardData()?.activeUsers || 0);
  readonly totalOrders = computed(() => this.dashboardData()?.totalOrders || 0);
  readonly revenue = computed(() => this.dashboardData()?.revenue || 0);

  readonly userGrowthRate = computed(() => {
    const data = this.userMetrics();
    if (!data?.growth) return 0;
    return ((data.current - data.previous) / data.previous) * 100;
  });

  async loadDashboardAnalytics(period: TimePeriod = '7d'): Promise<void> {
    this.loadingSignal.set(true);
    this.selectedPeriodSignal.set(period);

    try {
      const data = await this.apiService.get<DashboardAnalytics>('/api/analytics/dashboard', {
        period,
      });

      this.dashboardDataSignal.set(data);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadUserMetrics(period: TimePeriod = '7d'): Promise<void> {
    try {
      const metrics = await this.apiService.get<UserMetrics>('/api/analytics/users', {
        period,
      });

      this.userMetricsSignal.set(metrics);
    } catch (error) {
      console.error('Failed to load user metrics:', error);
    }
  }

  async loadSystemMetrics(): Promise<void> {
    try {
      const metrics = await this.apiService.get<SystemMetrics>('/api/analytics/system');
      this.systemMetricsSignal.set(metrics);
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    }
  }

  // Real-time metrics via WebSocket
  async subscribeToRealTimeMetrics(): Promise<void> {
    const websocketService = inject(WebSocketService);

    websocketService.subscribe('analytics:dashboard', (data) => {
      this.dashboardDataSignal.update((current) => ({ ...current, ...data }));
    });

    websocketService.subscribe('analytics:users', (data) => {
      this.userMetricsSignal.update((current) => ({ ...current, ...data }));
    });

    websocketService.subscribe('analytics:system', (data) => {
      this.systemMetricsSignal.set(data);
    });
  }

  // Export analytics data
  async exportAnalytics(format: 'csv' | 'xlsx' | 'pdf', period: TimePeriod): Promise<Blob> {
    const response = await this.apiService.get<Blob>(`/api/analytics/export`, {
      format,
      period,
    });

    return response;
  }

  setPeriod(period: TimePeriod): void {
    this.selectedPeriodSignal.set(period);
    this.loadDashboardAnalytics(period);
  }
}

type TimePeriod = '1d' | '7d' | '30d' | '90d' | '1y';

interface DashboardAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  revenue: number;
  orderTrends: ChartData[];
  userGrowth: ChartData[];
  topProducts: ProductMetric[];
  recentActivity: ActivityItem[];
}

interface UserMetrics {
  current: number;
  previous: number;
  growth: number;
  active: number;
  inactive: number;
  newSignups: ChartData[];
  userActivity: ActivityData[];
}

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ChartData {
  date: string;
  value: number;
  label?: string;
}
```

## Advanced Search Component

```typescript
// apps/admin-portal/src/app/features/search/components/advanced-search.component.ts
@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatChipsModule, MatAutocompleteModule, MatExpansionModule, MatButtonModule],
  template: `
    <div class="advanced-search-container">
      <mat-expansion-panel [expanded]="showAdvanced()">
        <mat-expansion-panel-header>
          <mat-panel-title> Advanced Search </mat-panel-title>
          <mat-panel-description> Filter and refine your search </mat-panel-description>
        </mat-expansion-panel-header>

        <form [formGroup]="advancedForm" class="space-y-4">
          <!-- Content Type Filter -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Content Type</mat-label>
            <mat-select formControlName="type" multiple>
              <mat-option value="users">Users</mat-option>
              <mat-option value="orders">Orders</mat-option>
              <mat-option value="products">Products</mat-option>
              <mat-option value="documents">Documents</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Date Range -->
          <div class="grid grid-cols-2 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>From Date</mat-label>
              <input matInput [matDatepicker]="fromPicker" formControlName="dateFrom" />
              <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>To Date</mat-label>
              <input matInput [matDatepicker]="toPicker" formControlName="dateTo" />
              <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <!-- Tags -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Tags</mat-label>
            <mat-chip-grid #chipGrid>
              @for (tag of selectedTags(); track tag) {
                <mat-chip (removed)="removeTag(tag)">
                  {{ tag }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
            </mat-chip-grid>
            <input matInput [matChipInputFor]="chipGrid" [matAutocomplete]="tagAuto" (matChipInputTokenEnd)="addTag($event)" />
            <mat-autocomplete #tagAuto="matAutocomplete" (optionSelected)="addTagFromOption($event)">
              @for (tag of filteredTags(); track tag) {
                <mat-option [value]="tag">{{ tag }}</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>

          <!-- Search Actions -->
          <div class="flex gap-2">
            <button mat-raised-button color="primary" (click)="applyFilters()">Apply Filters</button>
            <button mat-button (click)="clearFilters()">Clear All</button>
          </div>
        </form>
      </mat-expansion-panel>
    </div>
  `,
})
export class AdvancedSearchComponent {
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);

  showAdvanced = signal(false);
  selectedTags = signal<string[]>([]);
  availableTags = signal<string[]>(['important', 'urgent', 'draft', 'approved', 'archived']);

  filteredTags = computed(() => {
    const selected = this.selectedTags();
    return this.availableTags().filter((tag) => !selected.includes(tag));
  });

  advancedForm = this.fb.group({
    type: [[]],
    dateFrom: [''],
    dateTo: [''],
    author: [''],
    status: [''],
  });

  constructor() {
    // Watch form changes and update search filters
    effect(() => {
      const formValue = this.advancedForm.value;
      const filters: SearchFilters = {
        type: formValue.type?.[0],
        dateFrom: formValue.dateFrom,
        dateTo: formValue.dateTo,
        author: formValue.author,
        tags: this.selectedTags(),
      };

      this.searchService.setFilters(filters);
    });
  }

  applyFilters(): void {
    const formValue = this.advancedForm.value;
    const filters: SearchFilters = {
      type: formValue.type?.[0],
      dateFrom: formValue.dateFrom,
      dateTo: formValue.dateTo,
      author: formValue.author,
      tags: this.selectedTags(),
    };

    this.searchService.setFilters(filters);
  }

  clearFilters(): void {
    this.advancedForm.reset();
    this.selectedTags.set([]);
    this.searchService.setFilters({});
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.selectedTags.update((tags) => [...tags, value]);
      event.chipInput!.clear();
    }
  }

  addTagFromOption(event: MatAutocompleteSelectedEvent): void {
    this.selectedTags.update((tags) => [...tags, event.option.viewValue]);
  }

  removeTag(tag: string): void {
    this.selectedTags.update((tags) => tags.filter((t) => t !== tag));
  }
}
```

## Analytics Dashboard Component

```typescript
// apps/admin-portal/src/app/features/analytics/components/analytics-dashboard.component.ts
@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatSelectModule, MatIconModule, MatButtonModule, NgxChartsModule],
  template: `
    <div class="analytics-dashboard p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>

        <div class="flex gap-2">
          <mat-form-field appearance="outline" class="period-selector">
            <mat-label>Time Period</mat-label>
            <mat-select [value]="selectedPeriod()" (selectionChange)="setPeriod($event.value)">
              <mat-option value="1d">Last 24 Hours</mat-option>
              <mat-option value="7d">Last 7 Days</mat-option>
              <mat-option value="30d">Last 30 Days</mat-option>
              <mat-option value="90d">Last 90 Days</mat-option>
              <mat-option value="1y">Last Year</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="exportData()">
            <mat-icon>download</mat-icon>
            Export
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <mat-card class="kpi-card">
            <mat-card-content class="flex items-center p-6">
              <div class="flex-1">
                <p class="text-sm text-gray-600">Total Users</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalUsers() | number }}</p>
                <p class="text-xs text-green-600">{{ userGrowthRate() | number: '1.1-1' }}% growth</p>
              </div>
              <mat-icon class="text-blue-500 text-3xl">people</mat-icon>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content class="flex items-center p-6">
              <div class="flex-1">
                <p class="text-sm text-gray-600">Active Users</p>
                <p class="text-2xl font-bold text-gray-900">{{ activeUsers() | number }}</p>
                <p class="text-xs text-blue-600">{{ (activeUsers() / totalUsers()) * 100 | number: '1.0-0' }}% active</p>
              </div>
              <mat-icon class="text-green-500 text-3xl">trending_up</mat-icon>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content class="flex items-center p-6">
              <div class="flex-1">
                <p class="text-sm text-gray-600">Total Orders</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalOrders() | number }}</p>
                <p class="text-xs text-purple-600">This {{ selectedPeriod() }}</p>
              </div>
              <mat-icon class="text-purple-500 text-3xl">shopping_cart</mat-icon>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content class="flex items-center p-6">
              <div class="flex-1">
                <p class="text-sm text-gray-600">Revenue</p>
                <p class="text-2xl font-bold text-gray-900">{{ revenue() | currency }}</p>
                <p class="text-xs text-orange-600">Gross revenue</p>
              </div>
              <mat-icon class="text-orange-500 text-3xl">attach_money</mat-icon>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- User Growth Chart -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>User Growth</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (userMetrics()?.newSignups) {
                <ngx-charts-line-chart [results]="userGrowthChartData()" [xAxis]="true" [yAxis]="true" [showXAxisLabel]="true" [showYAxisLabel]="true" xAxisLabel="Date" yAxisLabel="New Users" [curve]="'linear'" [timeline]="true"> </ngx-charts-line-chart>
              }
            </mat-card-content>
          </mat-card>

          <!-- Order Trends Chart -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Order Trends</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (dashboardData()?.orderTrends) {
                <ngx-charts-bar-chart [results]="orderTrendsChartData()" [xAxis]="true" [yAxis]="true" [showXAxisLabel]="true" [showYAxisLabel]="true" xAxisLabel="Date" yAxisLabel="Orders"> </ngx-charts-bar-chart>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- System Health -->
        <div class="mt-6">
          <mat-card>
            <mat-card-header>
              <mat-card-title>System Health</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (systemMetrics()) {
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="metric-item">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Response Time</span>
                      <span class="font-medium">{{ systemMetrics()!.responseTime }}ms</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div class="bg-green-500 h-2 rounded-full" [style.width.%]="getHealthPercentage('responseTime')"></div>
                    </div>
                  </div>

                  <div class="metric-item">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Error Rate</span>
                      <span class="font-medium">{{ systemMetrics()!.errorRate }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div class="bg-red-500 h-2 rounded-full" [style.width.%]="systemMetrics()!.errorRate"></div>
                    </div>
                  </div>

                  <div class="metric-item">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">CPU Usage</span>
                      <span class="font-medium">{{ systemMetrics()!.cpuUsage }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div class="bg-blue-500 h-2 rounded-full" [style.width.%]="systemMetrics()!.cpuUsage"></div>
                    </div>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
})
export class AnalyticsDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private fb = inject(FormBuilder);

  // Service signals
  loading = this.analyticsService.loading;
  dashboardData = this.analyticsService.dashboardData;
  userMetrics = this.analyticsService.userMetrics;
  systemMetrics = this.analyticsService.systemMetrics;
  selectedPeriod = this.analyticsService.selectedPeriod;
  totalUsers = this.analyticsService.totalUsers;
  activeUsers = this.analyticsService.activeUsers;
  totalOrders = this.analyticsService.totalOrders;
  revenue = this.analyticsService.revenue;
  userGrowthRate = this.analyticsService.userGrowthRate;

  // Local signals
  showAdvanced = signal(false);

  // Form
  advancedForm = this.fb.group({
    type: [[]],
    dateFrom: [''],
    dateTo: [''],
    author: [''],
    status: [''],
  });

  // Chart data computed signals
  userGrowthChartData = computed(() => {
    const data = this.userMetrics()?.newSignups || [];
    return [
      {
        name: 'New Users',
        series: data.map((item) => ({
          name: new Date(item.date),
          value: item.value,
        })),
      },
    ];
  });

  orderTrendsChartData = computed(() => {
    const data = this.dashboardData()?.orderTrends || [];
    return [
      {
        name: 'Orders',
        series: data.map((item) => ({
          name: new Date(item.date),
          value: item.value,
        })),
      },
    ];
  });

  async ngOnInit() {
    await this.loadAllMetrics();
    await this.analyticsService.subscribeToRealTimeMetrics();

    // Auto-refresh every 5 minutes
    setInterval(
      () => {
        this.loadAllMetrics();
      },
      5 * 60 * 1000,
    );
  }

  private async loadAllMetrics(): Promise<void> {
    const period = this.selectedPeriod();

    await Promise.all([this.analyticsService.loadDashboardAnalytics(period), this.analyticsService.loadUserMetrics(period), this.analyticsService.loadSystemMetrics()]);
  }

  setPeriod(period: TimePeriod): void {
    this.analyticsService.setPeriod(period);
  }

  async exportData(): Promise<void> {
    try {
      const blob = await this.analyticsService.exportAnalytics('xlsx', this.selectedPeriod());

      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${this.selectedPeriod()}-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  getHealthPercentage(metric: string): number {
    const metrics = this.systemMetrics();
    if (!metrics) return 0;

    switch (metric) {
      case 'responseTime':
        return Math.max(0, 100 - (metrics.responseTime / 1000) * 100);
      case 'errorRate':
        return Math.max(0, 100 - metrics.errorRate);
      case 'cpuUsage':
        return metrics.cpuUsage;
      default:
        return 0;
    }
  }
}
```
