import {
  Directive,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, EMPTY, Subject, timer } from 'rxjs';
import { switchMap, catchError, tap, retry } from 'rxjs/operators';

import { WidgetDataSource, WidgetConfigChangeEvent } from './widget.types';
import {
  WIDGET_DATA_PROVIDER,
  WIDGET_REALTIME_PROVIDER,
} from './widget.tokens';

/**
 * Base class for all widget components.
 * Provides common functionality for data loading, error handling, and configuration.
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'ax-kpi-widget',
 *   template: `...`,
 * })
 * export class KpiWidgetComponent extends BaseWidgetComponent<KpiConfig, KpiData> {
 *   getDefaultConfig(): KpiConfig {
 *     return { title: 'KPI', format: 'number' };
 *   }
 * }
 * ```
 */
@Directive()
export abstract class BaseWidgetComponent<TConfig = unknown, TData = unknown> {
  // ============================================================================
  // Inputs
  // ============================================================================

  /** Unique instance ID */
  instanceId = input.required<string>();

  /** Widget configuration */
  config = input.required<TConfig>();

  /** Data source configuration */
  dataSource = input<WidgetDataSource>();

  /** Whether dashboard is in edit mode */
  isEditing = input<boolean>(false);

  /** Pre-loaded data (optional, skips fetch) */
  initialData = input<TData>();

  // ============================================================================
  // Outputs
  // ============================================================================

  /** Emits when config changes (from widget UI) */
  configChange = output<WidgetConfigChangeEvent<TConfig>>();

  // ============================================================================
  // State
  // ============================================================================

  /** Current data */
  data = signal<TData | null>(null);

  /** Loading state */
  loading = signal<boolean>(false);

  /** Error message */
  error = signal<string | null>(null);

  /** Last update timestamp */
  lastUpdated = signal<number | null>(null);

  // ============================================================================
  // Injected Services
  // ============================================================================

  protected dataProvider = inject(WIDGET_DATA_PROVIDER, { optional: true });
  protected realtimeProvider = inject(WIDGET_REALTIME_PROVIDER, {
    optional: true,
  });
  protected destroyRef = inject(DestroyRef);

  // ============================================================================
  // Internal
  // ============================================================================

  private refresh$ = new Subject<void>();

  constructor() {
    // Initialize data loading when dataSource changes
    effect(() => {
      const ds = this.dataSource();
      const initial = this.initialData();

      if (initial) {
        this.data.set(initial);
        this.lastUpdated.set(Date.now());
        return;
      }

      if (ds?.endpoint) {
        this.loadData(ds);
      }
    });
  }

  // ============================================================================
  // Abstract Methods
  // ============================================================================

  /**
   * Get default configuration for this widget.
   * Called when no config is provided.
   */
  abstract getDefaultConfig(): TConfig;

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Manually refresh data
   */
  refresh(): void {
    this.refresh$.next();
  }

  /**
   * Update configuration
   * @param changes - Partial config changes
   */
  updateConfig(changes: Partial<TConfig>): void {
    this.configChange.emit({
      instanceId: this.instanceId(),
      changes,
    });
  }

  // ============================================================================
  // Protected Methods
  // ============================================================================

  /**
   * Transform raw data before setting.
   * Override in subclass for custom transformation.
   */
  protected transformData(raw: unknown): TData {
    return raw as TData;
  }

  /**
   * Handle data load error.
   * Override for custom error handling.
   */
  protected handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Failed to load data';
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private loadData(ds: WidgetDataSource): void {
    if (!this.dataProvider) {
      console.warn(
        'No data provider configured. Provide WIDGET_DATA_PROVIDER.',
      );
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Create fetch observable
    const fetch$ = this.dataProvider.fetch<TData>(ds.endpoint!, ds.params);

    // Create realtime observable
    const realtime$ =
      ds.wsChannel && this.realtimeProvider?.subscribe
        ? this.realtimeProvider.subscribe<TData>(ds.wsChannel)
        : EMPTY;

    // Create refresh observable with interval
    const refresh$ =
      ds.refreshInterval && ds.refreshInterval > 0
        ? merge(
            this.refresh$,
            timer(ds.refreshInterval, ds.refreshInterval),
          ).pipe(
            switchMap(() =>
              this.dataProvider!.fetch<TData>(ds.endpoint!, ds.params),
            ),
          )
        : this.refresh$.pipe(
            switchMap(() =>
              this.dataProvider!.fetch<TData>(ds.endpoint!, ds.params),
            ),
          );

    // Combine all data sources
    merge(fetch$, realtime$, refresh$)
      .pipe(
        tap((rawData) => {
          const transformed = this.transformData(rawData);
          this.data.set(transformed);
          this.lastUpdated.set(Date.now());
          this.loading.set(false);
        }),
        retry({ count: 2, delay: 1000 }),
        catchError((err) => {
          this.error.set(this.handleError(err));
          this.loading.set(false);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
