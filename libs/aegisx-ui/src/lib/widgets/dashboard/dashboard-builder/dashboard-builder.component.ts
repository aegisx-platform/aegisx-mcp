/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// TODO: Fix TypeScript errors in widget system
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
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  GridsterModule,
  GridsterConfig,
  GridsterItem,
  GridType,
  CompactType,
  DisplayGrid,
} from 'angular-gridster2';

import {
  DashboardConfig,
  WidgetInstance,
  WidgetDefinition,
  DASHBOARD_DEFAULTS,
} from '../../core/widget.types';
import {
  WIDGET_STORAGE_PROVIDER,
  WIDGET_REGISTRY,
} from '../../core/widget.tokens';
import { WidgetHostComponent } from '../widget-host/widget-host.component';

interface GridsterWidgetItem extends GridsterItem {
  widget: WidgetInstance;
}

/**
 * Dashboard Builder - Admin interface for creating/editing dashboards
 */
@Component({
  selector: 'ax-dashboard-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    GridsterModule,
    WidgetHostComponent,
  ],
  template: `
    <div class="ax-dashboard-builder">
      <!-- Toolbar -->
      <div class="ax-dashboard-builder__toolbar">
        <div class="ax-dashboard-builder__toolbar-left">
          <input
            class="ax-dashboard-builder__name-input"
            [(ngModel)]="dashboardName"
            placeholder="Dashboard name"
          />
        </div>
        <div class="ax-dashboard-builder__toolbar-right">
          <button
            mat-button
            [matMenuTriggerFor]="addMenu"
            class="ax-dashboard-builder__add-btn"
          >
            <mat-icon>add</mat-icon>
            Add Widget
          </button>
          <mat-menu
            #addMenu="matMenu"
            class="ax-dashboard-builder__widget-menu"
          >
            @for (category of widgetCategories(); track category.name) {
              <div class="ax-dashboard-builder__category">
                <span class="ax-dashboard-builder__category-name">{{
                  category.name
                }}</span>
                @for (widget of category.widgets; track widget.id) {
                  <button mat-menu-item (click)="addWidget(widget)">
                    <mat-icon>{{ widget.icon }}</mat-icon>
                    <span>{{ widget.name }}</span>
                  </button>
                }
              </div>
            }
          </mat-menu>

          <button mat-button (click)="save()" [disabled]="saving()">
            <mat-icon>save</mat-icon>
            {{ saving() ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="ax-dashboard-builder__loading">
          <mat-spinner diameter="40"></mat-spinner>
          <span>Loading...</span>
        </div>
      }

      <!-- Grid -->
      @if (!loading()) {
        <div class="ax-dashboard-builder__canvas">
          <gridster [options]="gridsterOptions()">
            @for (item of gridsterItems(); track item.widget.instanceId) {
              <gridster-item [item]="item">
                <ax-widget-host
                  [widget]="item.widget"
                  [isEditing]="true"
                  (configure)="onConfigure($event)"
                  (duplicate)="onDuplicate($event)"
                  (remove)="onRemove($event)"
                />
              </gridster-item>
            }
          </gridster>
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && gridsterItems().length === 0) {
        <div class="ax-dashboard-builder__empty">
          <mat-icon>widgets</mat-icon>
          <span>Click "Add Widget" to get started</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ax-dashboard-builder {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--ax-background-subtle);

        &__toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--ax-background-default);
          border-bottom: 1px solid var(--ax-border-default);
        }

        &__toolbar-left,
        &__toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        &__name-input {
          font-size: 16px;
          font-weight: 500;
          border: none;
          background: transparent;
          color: var(--ax-text-heading);
          padding: 8px;
          border-radius: var(--ax-radius-sm);

          &:hover,
          &:focus {
            background: var(--ax-background-subtle);
            outline: none;
          }
        }

        &__add-btn {
          mat-icon {
            margin-right: 4px;
          }
        }

        &__widget-menu {
          max-height: 400px;
        }

        &__category {
          padding: 8px 0;

          &:not(:last-child) {
            border-bottom: 1px solid var(--ax-border-faint);
          }
        }

        &__category-name {
          display: block;
          padding: 4px 16px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--ax-text-muted);
        }

        &__loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 16px;
          color: var(--ax-text-muted);
        }

        &__canvas {
          flex: 1;
          overflow: auto;
          padding: 16px;
        }

        &__empty {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: var(--ax-text-muted);
          pointer-events: none;

          mat-icon {
            font-size: 64px;
            width: 64px;
            height: 64px;
            opacity: 0.5;
          }
        }

        gridster {
          background: transparent;
        }

        ::ng-deep {
          gridster-item {
            background: transparent;
          }

          .gridster-item-resizable-handler {
            display: block;
          }
        }
      }
    `,
  ],
})
export class DashboardBuilderComponent {
  // Inputs
  dashboardId = input<string>();
  initialConfig = input<DashboardConfig>();

  // Outputs
  saved = output<DashboardConfig>();
  saveError = output<string>();

  // Services
  private storageProvider = inject(WIDGET_STORAGE_PROVIDER, { optional: true });
  private registry = inject(WIDGET_REGISTRY);
  private platformId = inject(PLATFORM_ID);

  // State
  dashboard = signal<DashboardConfig | null>(null);
  loading = signal(false);
  saving = signal(false);
  dashboardName = '';

  // Gridster items
  gridsterItems = signal<GridsterWidgetItem[]>([]);

  // Gridster options
  gridsterOptions = computed(
    (): GridsterConfig => ({
      gridType: GridType.VerticalFixed,
      compactType: CompactType.CompactUpAndLeft,
      displayGrid: DisplayGrid.Always,
      pushItems: true,
      swap: true,
      draggable: {
        enabled: true,
        ignoreContent: true,
        dragHandleClass: 'ax-widget-host__header',
      },
      resizable: {
        enabled: true,
      },
      minCols: this.dashboard()?.columns || DASHBOARD_DEFAULTS.columns,
      maxCols: this.dashboard()?.columns || DASHBOARD_DEFAULTS.columns,
      minRows: 4,
      fixedRowHeight:
        this.dashboard()?.rowHeight || DASHBOARD_DEFAULTS.rowHeight,
      margin: this.dashboard()?.gap || DASHBOARD_DEFAULTS.gap,
      outerMargin: true,
      itemChangeCallback: (item: GridsterWidgetItem) => this.onItemChange(item),
    }),
  );

  // Widget categories for menu
  widgetCategories = computed(() => {
    const widgets = this.registry.getAll();
    const categories = new Map<string, WidgetDefinition[]>();

    widgets.forEach((w) => {
      const cat = w.category || 'other';
      if (!categories.has(cat)) {
        categories.set(cat, []);
      }
      categories.get(cat)!.push(w);
    });

    return Array.from(categories.entries()).map(([name, widgets]) => ({
      name: this.formatCategory(name),
      widgets,
    }));
  });

  constructor() {
    // Load dashboard on init
    effect(() => {
      const id = this.dashboardId();
      const initial = this.initialConfig();

      if (initial) {
        this.setDashboard(initial);
      } else if (id && isPlatformBrowser(this.platformId)) {
        this.loadDashboard();
      } else {
        // New dashboard
        this.setDashboard(this.createEmptyDashboard());
      }
    });
  }

  private setDashboard(config: DashboardConfig): void {
    this.dashboard.set(config);
    this.dashboardName = config.name;
    this.gridsterItems.set(
      config.widgets.map((w) => this.widgetToGridsterItem(w)),
    );
  }

  private loadDashboard(): void {
    const id = this.dashboardId();
    if (!id || !this.storageProvider) return;

    this.loading.set(true);
    this.storageProvider.load(id).subscribe({
      next: (config) => {
        if (config) {
          this.setDashboard(config);
        } else {
          this.setDashboard(this.createEmptyDashboard());
        }
        this.loading.set(false);
      },
      error: () => {
        this.setDashboard(this.createEmptyDashboard());
        this.loading.set(false);
      },
    });
  }

  private createEmptyDashboard(): DashboardConfig {
    return {
      id: this.dashboardId() || this.generateId(),
      name: 'New Dashboard',
      columns: DASHBOARD_DEFAULTS.columns,
      rowHeight: DASHBOARD_DEFAULTS.rowHeight,
      gap: DASHBOARD_DEFAULTS.gap,
      widgets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  addWidget(def: WidgetDefinition): void {
    const widget: WidgetInstance = {
      instanceId: this.generateId(),
      widgetId: def.id,
      position: {
        x: 0,
        y: 0,
        cols: def.sizes.defaultSize.cols,
        rows: def.sizes.defaultSize.rows,
      },
      config: { ...def.defaultConfig },
    };

    this.gridsterItems.update((items) => [
      ...items,
      this.widgetToGridsterItem(widget),
    ]);
  }

  save(): void {
    if (!this.storageProvider) {
      this.saveError.emit('No storage provider configured');
      return;
    }

    const config = this.buildDashboardConfig();
    this.saving.set(true);

    this.storageProvider.save(config).subscribe({
      next: () => {
        this.dashboard.set(config);
        this.saved.emit(config);
        this.saving.set(false);
      },
      error: (err) => {
        this.saveError.emit(err?.message || 'Failed to save');
        this.saving.set(false);
      },
    });
  }

  onConfigure(widget: WidgetInstance): void {
    // TODO: Open config dialog
    console.log('Configure widget:', widget);
  }

  onDuplicate(widget: WidgetInstance): void {
    const def = this.registry.get(widget.widgetId);
    if (!def) return;

    const newWidget: WidgetInstance = {
      ...widget,
      instanceId: this.generateId(),
      position: {
        ...widget.position,
        x: 0,
        y: 0,
      },
    };

    this.gridsterItems.update((items) => [
      ...items,
      this.widgetToGridsterItem(newWidget),
    ]);
  }

  onRemove(widget: WidgetInstance): void {
    this.gridsterItems.update((items) =>
      items.filter((i) => i.widget.instanceId !== widget.instanceId),
    );
  }

  private onItemChange(item: GridsterWidgetItem): void {
    // Update widget position
    item.widget.position = {
      x: item.x ?? 0,
      y: item.y ?? 0,
      cols: item.cols ?? 1,
      rows: item.rows ?? 1,
    };
  }

  private widgetToGridsterItem(widget: WidgetInstance): GridsterWidgetItem {
    return {
      x: widget.position.x,
      y: widget.position.y,
      cols: widget.position.cols,
      rows: widget.position.rows,
      widget,
    };
  }

  private buildDashboardConfig(): DashboardConfig {
    const current = this.dashboard()!;
    return {
      ...current,
      name: this.dashboardName || 'Untitled',
      widgets: this.gridsterItems().map((item) => item.widget),
      updatedAt: new Date().toISOString(),
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatCategory(cat: string): string {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
}
