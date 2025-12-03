import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DashboardConfig, DASHBOARD_DEFAULTS } from '../../core/widget.types';
import { WIDGET_STORAGE_PROVIDER } from '../../core/widget.tokens';
import { WidgetHostComponent } from '../widget-host/widget-host.component';

/**
 * Dashboard Viewer - Read-only view for end users
 */
@Component({
  selector: 'ax-dashboard-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    WidgetHostComponent,
  ],
  template: `
    <div class="ax-dashboard-viewer">
      <!-- Loading -->
      @if (loading()) {
        <div class="ax-dashboard-viewer__loading">
          <mat-spinner diameter="40"></mat-spinner>
          <span>Loading dashboard...</span>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="ax-dashboard-viewer__error">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
          <button class="ax-dashboard-viewer__retry" (click)="loadDashboard()">
            Retry
          </button>
        </div>
      }

      <!-- Empty -->
      @if (!loading() && !error() && isEmpty()) {
        <div class="ax-dashboard-viewer__empty">
          <mat-icon>dashboard</mat-icon>
          <span>No widgets configured</span>
        </div>
      }

      <!-- Dashboard Grid -->
      @if (!loading() && !error() && dashboard()) {
        <div
          class="ax-dashboard-viewer__grid"
          [style.--columns]="dashboard()!.columns"
          [style.--row-height]="dashboard()!.rowHeight + 'px'"
          [style.--gap]="dashboard()!.gap + 'px'"
        >
          @for (widget of dashboard()!.widgets; track widget.instanceId) {
            <div
              class="ax-dashboard-viewer__cell"
              [style.grid-column]="'span ' + widget.position.cols"
              [style.grid-row]="'span ' + widget.position.rows"
            >
              <ax-widget-host [widget]="widget" [isEditing]="false" />
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ax-dashboard-viewer {
        width: 100%;
        min-height: 200px;
      }

      .ax-dashboard-viewer__loading,
      .ax-dashboard-viewer__error,
      .ax-dashboard-viewer__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 48px;
        color: var(--ax-text-muted);
      }

      .ax-dashboard-viewer__loading mat-icon,
      .ax-dashboard-viewer__error mat-icon,
      .ax-dashboard-viewer__empty mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .ax-dashboard-viewer__error {
        color: var(--ax-error-default);
      }

      .ax-dashboard-viewer__retry {
        padding: 8px 16px;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-md);
        background: var(--ax-background-default);
        color: var(--ax-text-default);
        cursor: pointer;
      }

      .ax-dashboard-viewer__retry:hover {
        background: var(--ax-background-subtle);
      }

      .ax-dashboard-viewer__grid {
        display: grid;
        grid-template-columns: repeat(var(--columns, 4), 1fr);
        grid-auto-rows: var(--row-height, 160px);
        gap: var(--gap, 16px);
      }

      .ax-dashboard-viewer__cell {
        min-height: 0;
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .ax-dashboard-viewer__grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 640px) {
        .ax-dashboard-viewer__grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardViewerComponent {
  // Inputs
  dashboardId = input<string>();
  config = input<DashboardConfig>();

  // Outputs
  loaded = output<DashboardConfig>();
  loadError = output<string>();

  // Services
  private storageProvider = inject(WIDGET_STORAGE_PROVIDER, { optional: true });
  private platformId = inject(PLATFORM_ID);

  // State
  dashboard = signal<DashboardConfig | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed
  isEmpty = computed(() => {
    const d = this.dashboard();
    return !d || d.widgets.length === 0;
  });

  constructor() {
    // Load dashboard when ID changes
    effect(() => {
      const id = this.dashboardId();
      const cfg = this.config();

      if (cfg) {
        // Direct config provided
        this.dashboard.set(cfg);
      } else if (id && isPlatformBrowser(this.platformId)) {
        // Load from storage
        this.loadDashboard();
      }
    });
  }

  loadDashboard(): void {
    const id = this.dashboardId();
    if (!id || !this.storageProvider) {
      this.error.set('No dashboard ID or storage provider');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.storageProvider.load(id).subscribe({
      next: (config) => {
        if (config) {
          // Apply defaults
          const merged: DashboardConfig = {
            ...config,
            columns: config.columns || DASHBOARD_DEFAULTS.columns,
            rowHeight: config.rowHeight || DASHBOARD_DEFAULTS.rowHeight,
            gap: config.gap || DASHBOARD_DEFAULTS.gap,
          };
          this.dashboard.set(merged);
          this.loaded.emit(merged);
        } else {
          this.error.set('Dashboard not found');
          this.loadError.emit('Dashboard not found');
        }
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.message || 'Failed to load dashboard';
        this.error.set(msg);
        this.loadError.emit(msg);
        this.loading.set(false);
      },
    });
  }
}
