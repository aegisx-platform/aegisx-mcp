import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import {
  AxGridsterComponent,
  AxGridsterItemBase,
  AxGridsterPreset,
  GRIDSTER_PRESETS,
} from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  ComponentTokensComponent,
} from '../../../../components/docs';
import { ComponentToken, CodeTab } from '../../../../types/docs.types';

interface DemoItem extends AxGridsterItemBase {
  title: string;
  color: string;
}

@Component({
  selector: 'ax-gridster-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    AxGridsterComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="gridster-doc">
      <ax-doc-header
        title="Gridster"
        icon="grid_view"
        description="Drag-and-drop grid layout component for building dashboards, launchers, and kanban boards. Built on angular-gridster2 with AegisX theming."
        [breadcrumbs]="[
          { label: 'Integrations', link: '/docs/integrations/overview' },
          { label: 'Gridster' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxGridsterComponent, AxGridsterItemBase, GRIDSTER_PRESETS } from '&#64;aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="gridster-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="gridster-doc__tab-content">
            <section class="gridster-doc__section">
              <h2>Basic Usage</h2>
              <p>
                The <code>AxGridsterComponent</code> is a reusable wrapper
                around angular-gridster2. It provides a generic interface that
                works with any content type using ng-template projection.
              </p>

              <div class="demo-controls">
                <mat-slide-toggle [(ngModel)]="editMode">
                  Edit Mode
                </mat-slide-toggle>
              </div>

              <div class="demo-preview-container">
                <ax-gridster
                  [items]="demoItems()"
                  [editMode]="editMode"
                  preset="dashboard"
                  (itemChange)="onItemChange($event)"
                  (layoutChange)="onLayoutChange($event)"
                >
                  <ng-template #itemTemplate let-item let-editMode="editMode">
                    <div
                      class="demo-item"
                      [style.background]="item.color"
                      [class.editing]="editMode"
                    >
                      <span>{{ item.title }}</span>
                      @if (editMode) {
                        <mat-icon class="drag-handle">drag_indicator</mat-icon>
                      }
                    </div>
                  </ng-template>
                </ax-gridster>
              </div>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="gridster-doc__section">
              <h2>Presets</h2>
              <p>
                Choose from built-in presets for common use cases. Each preset
                configures grid columns, margins, compact behavior, and more.
              </p>

              <div class="presets-grid">
                @for (preset of presets; track preset.name) {
                  <div
                    class="preset-card"
                    [class.active]="currentPreset === preset.name"
                    (click)="selectPreset(preset.name)"
                  >
                    <mat-icon>{{ preset.icon }}</mat-icon>
                    <h4>{{ preset.label }}</h4>
                    <p>{{ preset.description }}</p>
                    <div class="preset-meta">
                      <span>{{ preset.columns }} cols</span>
                      <span>{{ preset.margin }}px margin</span>
                    </div>
                  </div>
                }
              </div>

              <ax-code-tabs [tabs]="presetsCode"></ax-code-tabs>
            </section>

            <section class="gridster-doc__section">
              <h2>Custom Template</h2>
              <p>
                Use ng-template with <code>#itemTemplate</code> to render any
                content. The template context provides the item data, edit mode
                status, and index.
              </p>

              <ax-code-tabs [tabs]="templateCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="gridster-doc__tab-content">
            <section class="gridster-doc__section">
              <h2>Inputs</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>items</code></td>
                      <td>T[] (extends AxGridsterItemBase)</td>
                      <td>[]</td>
                      <td>Array of items to display in the grid</td>
                    </tr>
                    <tr>
                      <td><code>editMode</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Enable drag & resize interactions</td>
                    </tr>
                    <tr>
                      <td><code>preset</code></td>
                      <td>AxGridsterPreset</td>
                      <td>'dashboard'</td>
                      <td>Preset configuration name</td>
                    </tr>
                    <tr>
                      <td><code>settings</code></td>
                      <td>Partial&lt;AxGridsterSettings&gt;</td>
                      <td>undefined</td>
                      <td>Custom settings (overrides preset)</td>
                    </tr>
                    <tr>
                      <td><code>trackByFn</code></td>
                      <td>(item: T) =&gt; string | number</td>
                      <td>item.id</td>
                      <td>Track function for ngFor</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="gridster-doc__section">
              <h2>Outputs</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>editModeChange</code></td>
                      <td>boolean</td>
                      <td>Emitted when edit mode changes</td>
                    </tr>
                    <tr>
                      <td><code>itemChange</code></td>
                      <td>AxGridsterItemChange&lt;T&gt;</td>
                      <td>Emitted when an item's position or size changes</td>
                    </tr>
                    <tr>
                      <td><code>layoutChange</code></td>
                      <td>AxGridsterLayoutChange&lt;T&gt;</td>
                      <td>Emitted when layout changes (any item moves)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="gridster-doc__section">
              <h2>Public Methods</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Parameters</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>toggleEditMode()</code></td>
                      <td>-</td>
                      <td>Toggle edit mode on/off</td>
                    </tr>
                    <tr>
                      <td><code>enableEditMode()</code></td>
                      <td>-</td>
                      <td>Enable edit mode</td>
                    </tr>
                    <tr>
                      <td><code>disableEditMode()</code></td>
                      <td>-</td>
                      <td>Disable edit mode</td>
                    </tr>
                    <tr>
                      <td><code>applySettings()</code></td>
                      <td>Partial&lt;AxGridsterSettings&gt;</td>
                      <td>Apply new settings</td>
                    </tr>
                    <tr>
                      <td><code>resetSettings()</code></td>
                      <td>-</td>
                      <td>Reset to preset defaults</td>
                    </tr>
                    <tr>
                      <td><code>getLayoutData()</code></td>
                      <td>-</td>
                      <td>Get current layout data (for saving)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="gridster-doc__section">
              <h2>AxGridsterItemBase Interface</h2>
              <ax-code-tabs [tabs]="itemInterfaceCode"></ax-code-tabs>
            </section>

            <section class="gridster-doc__section">
              <h2>AxGridsterSettings Interface</h2>
              <ax-code-tabs [tabs]="settingsInterfaceCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="gridster-doc__tab-content">
            <section class="gridster-doc__section">
              <h2>Dashboard Example</h2>
              <p>Create a responsive dashboard with drag-and-drop widgets.</p>
              <ax-code-tabs [tabs]="dashboardExampleCode"></ax-code-tabs>
            </section>

            <section class="gridster-doc__section">
              <h2>App Launcher Example</h2>
              <p>Build an iOS-style app launcher with compact grid layout.</p>
              <ax-code-tabs [tabs]="launcherExampleCode"></ax-code-tabs>
            </section>

            <section class="gridster-doc__section">
              <h2>Saving Layout</h2>
              <p>Persist layout changes to localStorage or API.</p>
              <ax-code-tabs [tabs]="savingLayoutCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Design Tokens Tab -->
        <mat-tab label="Design Tokens">
          <div class="gridster-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .gridster-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .gridster-doc__tabs {
        margin-top: 2rem;
      }

      .gridster-doc__tab-content {
        padding: 1.5rem 0;
      }

      .gridster-doc__section {
        margin-bottom: 3rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        code {
          background: var(--ax-background-subtle);
          padding: 0.125rem 0.375rem;
          border-radius: var(--ax-radius-sm);
          font-size: 0.875rem;
        }
      }

      .demo-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .demo-preview-container {
        height: 350px;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;
        background: var(--ax-background-subtle);
        margin-bottom: 1.5rem;

        ax-gridster {
          width: 100%;
          height: 100%;
        }
      }

      .demo-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        border-radius: var(--ax-radius-lg);
        color: white;
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 0.2s ease;
        position: relative;

        &.editing {
          cursor: move;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .drag-handle {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          font-size: 16px;
          width: 16px;
          height: 16px;
          opacity: 0.7;
        }
      }

      .presets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .preset-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.25rem;
        background: var(--ax-background-default);
        border: 2px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--ax-primary-default);
          background: var(--ax-primary-faint);
        }

        &.active {
          border-color: var(--ax-primary-default);
          background: var(--ax-primary-faint);

          mat-icon {
            color: var(--ax-primary-default);
          }
        }

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: var(--ax-text-secondary);
        }

        h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--ax-text-secondary);
          line-height: 1.4;
        }

        .preset-meta {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;

          span {
            font-size: 0.625rem;
            padding: 0.125rem 0.5rem;
            background: var(--ax-background-subtle);
            border-radius: var(--ax-radius-full);
            color: var(--ax-text-muted);
          }
        }
      }

      .api-table {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;

          th,
          td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--ax-border-default);
          }

          th {
            font-weight: 600;
            color: var(--ax-text-heading);
            background: var(--ax-background-subtle);
          }

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: var(--ax-radius-sm);
            font-size: 0.8125rem;
          }
        }
      }
    `,
  ],
})
export class GridsterDocComponent {
  editMode = false;
  currentPreset: AxGridsterPreset = 'dashboard';

  demoItems = signal<DemoItem[]>([
    {
      id: 1,
      title: 'Sales Overview',
      x: 0,
      y: 0,
      cols: 4,
      rows: 2,
      color: '#6366f1',
    },
    {
      id: 2,
      title: 'Revenue',
      x: 4,
      y: 0,
      cols: 4,
      rows: 2,
      color: '#22c55e',
    },
    {
      id: 3,
      title: 'Users',
      x: 8,
      y: 0,
      cols: 4,
      rows: 2,
      color: '#f59e0b',
    },
    {
      id: 4,
      title: 'Activity',
      x: 0,
      y: 2,
      cols: 6,
      rows: 2,
      color: '#ec4899',
    },
    {
      id: 5,
      title: 'Tasks',
      x: 6,
      y: 2,
      cols: 6,
      rows: 2,
      color: '#06b6d4',
    },
  ]);

  presets = [
    {
      name: 'dashboard' as const,
      label: 'Dashboard',
      icon: 'dashboard',
      description: 'Standard dashboard layout with 12 columns',
      columns: GRIDSTER_PRESETS.dashboard.columns,
      margin: GRIDSTER_PRESETS.dashboard.margin,
    },
    {
      name: 'launcher' as const,
      label: 'Launcher',
      icon: 'apps',
      description: 'App launcher with compact grid',
      columns: GRIDSTER_PRESETS.launcher.columns,
      margin: GRIDSTER_PRESETS.launcher.margin,
    },
    {
      name: 'widget' as const,
      label: 'Widget',
      icon: 'widgets',
      description: 'Scrollable widget layout',
      columns: GRIDSTER_PRESETS.widget.columns,
      margin: GRIDSTER_PRESETS.widget.margin,
    },
    {
      name: 'kanban' as const,
      label: 'Kanban',
      icon: 'view_kanban',
      description: 'Horizontal scrolling kanban board',
      columns: GRIDSTER_PRESETS.kanban.columns,
      margin: GRIDSTER_PRESETS.kanban.margin,
    },
  ];

  selectPreset(preset: AxGridsterPreset): void {
    this.currentPreset = preset;
  }

  onItemChange(event: unknown): void {
    console.log('Item changed:', event);
  }

  onLayoutChange(event: unknown): void {
    console.log('Layout changed:', event);
  }

  // Code examples
  readonly basicUsageCode: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<ax-gridster
  [items]="items()"
  [editMode]="isEditing"
  preset="dashboard"
  (itemChange)="onItemChange($event)"
  (layoutChange)="onLayoutChange($event)"
>
  <ng-template #itemTemplate let-item let-editMode="editMode">
    <my-widget-card [data]="item" [isEditing]="editMode"></my-widget-card>
  </ng-template>
</ax-gridster>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component, signal } from '@angular/core';
import {
  AxGridsterComponent,
  AxGridsterItemBase,
  AxGridsterItemChange,
  AxGridsterLayoutChange,
} from '@aegisx/ui';

interface MyWidget extends AxGridsterItemBase {
  title: string;
  type: 'chart' | 'table' | 'stat';
}

@Component({
  selector: 'my-dashboard',
  imports: [AxGridsterComponent],
  // ...
})
export class MyDashboard {
  isEditing = false;

  items = signal<MyWidget[]>([
    { id: 1, title: 'Sales', type: 'chart', x: 0, y: 0, cols: 4, rows: 2 },
    { id: 2, title: 'Users', type: 'stat', x: 4, y: 0, cols: 4, rows: 2 },
  ]);

  onItemChange(event: AxGridsterItemChange<MyWidget>) {
    console.log('Item changed:', event.item, event.type);
  }

  onLayoutChange(event: AxGridsterLayoutChange<MyWidget>) {
    // Save layout to API
    this.saveLayout(event.items);
  }
}`,
    },
  ];

  readonly presetsCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { GRIDSTER_PRESETS, AxGridsterPreset } from '@aegisx/ui';

// Available presets
type AxGridsterPreset = 'dashboard' | 'launcher' | 'widget' | 'kanban' | 'custom';

// Preset configurations
const dashboardPreset = GRIDSTER_PRESETS.dashboard;
// { gridType: 'fit', columns: 12, margin: 16, ... }

const launcherPreset = GRIDSTER_PRESETS.launcher;
// { gridType: 'fit', columns: 6, margin: 12, swap: true, compactType: 'compactUp&Left', ... }

// Use preset in template
<ax-gridster [items]="items" preset="launcher">
  ...
</ax-gridster>

// Override preset with custom settings
<ax-gridster
  [items]="items"
  preset="dashboard"
  [settings]="{ columns: 8, margin: 24 }"
>
  ...
</ax-gridster>`,
    },
  ];

  readonly templateCode: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<!-- Template context provides: $implicit (item), editMode, index -->
<ax-gridster [items]="items" [editMode]="isEditing">
  <ng-template #itemTemplate let-item let-editMode="editMode" let-index="index">
    <!-- Your custom content -->
    <div class="widget" [class.editing]="editMode">
      <h3>{{ item.title }}</h3>
      <p>Widget #{{ index + 1 }}</p>

      @if (editMode) {
        <button (click)="removeWidget(item.id)">Remove</button>
      }
    </div>
  </ng-template>
</ax-gridster>`,
    },
  ];

  readonly itemInterfaceCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `interface AxGridsterItemBase {
  /** Unique identifier for the item */
  id: string | number;
  /** Grid column position (0-based) */
  x: number;
  /** Grid row position (0-based) */
  y: number;
  /** Number of columns the item spans */
  cols: number;
  /** Number of rows the item spans */
  rows: number;
  /** Minimum columns allowed when resizing */
  minItemCols?: number;
  /** Minimum rows allowed when resizing */
  minItemRows?: number;
  /** Maximum columns allowed when resizing */
  maxItemCols?: number;
  /** Maximum rows allowed when resizing */
  maxItemRows?: number;
  /** Whether this specific item can be dragged */
  dragEnabled?: boolean;
  /** Whether this specific item can be resized */
  resizeEnabled?: boolean;
}

// Extend for your custom item type
interface MyDashboardWidget extends AxGridsterItemBase {
  title: string;
  type: 'chart' | 'table' | 'kpi';
  config: WidgetConfig;
}`,
    },
  ];

  readonly settingsInterfaceCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `interface AxGridsterSettings {
  /** Grid type determines how items are sized */
  gridType: 'fit' | 'scrollVertical' | 'scrollHorizontal' | 'fixed' | 'verticalFixed' | 'horizontalFixed';
  /** Number of columns in the grid */
  columns: number;
  /** Margin between grid items in pixels */
  margin: number;
  /** Minimum number of rows */
  minRows: number;
  /** Maximum number of rows */
  maxRows: number;
  /** When to display grid lines */
  displayGrid: 'always' | 'onDrag&Resize' | 'none';
  /** Whether items push others when moved */
  pushItems: boolean;
  /** Whether items can swap positions */
  swap: boolean;
  /** Compact type for auto-arranging items */
  compactType: 'none' | 'compactUp' | 'compactLeft' | 'compactUp&Left' | ...;
  /** Fixed row height (for fixed grid types) */
  fixedRowHeight?: number;
  /** Fixed column width (for fixed grid types) */
  fixedColWidth?: number;
}`,
    },
  ];

  readonly dashboardExampleCode: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<div class="dashboard-container">
  <header>
    <h1>My Dashboard</h1>
    <button mat-icon-button (click)="gridster.toggleEditMode()">
      <mat-icon>{{ isEditing ? 'done' : 'edit' }}</mat-icon>
    </button>
  </header>

  <ax-gridster
    #gridster
    [items]="widgets()"
    [editMode]="isEditing"
    preset="dashboard"
    (editModeChange)="isEditing = $event"
    (layoutChange)="saveLayout($event.items)"
  >
    <ng-template #itemTemplate let-widget let-editMode="editMode">
      <ax-card [elevation]="editMode ? 'lg' : 'md'">
        <ax-card-header>
          {{ widget.title }}
        </ax-card-header>
        <ax-card-content>
          @switch (widget.type) {
            @case ('chart') { <my-chart [config]="widget.config"></my-chart> }
            @case ('table') { <my-table [data]="widget.data"></my-table> }
            @case ('kpi') { <ax-kpi-card [value]="widget.value"></ax-kpi-card> }
          }
        </ax-card-content>
      </ax-card>
    </ng-template>
  </ax-gridster>
</div>`,
    },
  ];

  readonly launcherExampleCode: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<ax-gridster
  [items]="apps()"
  [editMode]="isEditing"
  preset="launcher"
  (layoutChange)="saveAppOrder($event.items)"
>
  <ng-template #itemTemplate let-app let-editMode="editMode">
    <ax-launcher-card
      [app]="app"
      [isEditing]="editMode"
      (click)="!editMode && openApp(app)"
    ></ax-launcher-card>
  </ng-template>
</ax-gridster>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `interface LauncherApp extends AxGridsterItemBase {
  name: string;
  icon: string;
  url: string;
  color: string;
}

apps = signal<LauncherApp[]>([
  { id: 1, name: 'Dashboard', icon: 'dashboard', url: '/dashboard', color: '#6366f1', x: 0, y: 0, cols: 1, rows: 1 },
  { id: 2, name: 'Reports', icon: 'assessment', url: '/reports', color: '#22c55e', x: 1, y: 0, cols: 1, rows: 1 },
  { id: 3, name: 'Settings', icon: 'settings', url: '/settings', color: '#f59e0b', x: 2, y: 0, cols: 1, rows: 1 },
]);`,
    },
  ];

  readonly savingLayoutCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `@Component({ ... })
export class DashboardPage {
  @ViewChild('gridster') gridster!: AxGridsterComponent<MyWidget>;

  // Save to localStorage
  saveToLocalStorage() {
    const layout = this.gridster.getLayoutData();
    localStorage.setItem('dashboard-layout', JSON.stringify(layout));
  }

  // Load from localStorage
  loadFromLocalStorage() {
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      const layout = JSON.parse(saved);
      this.widgets.update(widgets =>
        widgets.map(w => {
          const saved = layout.find(l => l.id === w.id);
          return saved ? { ...w, ...saved } : w;
        })
      );
    }
  }

  // Save to API
  async saveToApi(items: MyWidget[]) {
    const layout = items.map(({ id, x, y, cols, rows }) => ({ id, x, y, cols, rows }));
    await this.http.put('/api/dashboard/layout', { layout }).toPromise();
  }

  // Auto-save on change
  onLayoutChange(event: AxGridsterLayoutChange<MyWidget>) {
    // Debounce API calls
    this.saveToApi(event.items);
  }
}`,
    },
  ];

  readonly designTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'Grid background color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Default item background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-default',
      usage: 'Grid item borders',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-radius-lg',
      usage: 'Grid container border radius',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-radius-md',
      usage: 'Grid item border radius',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-secondary',
      usage: 'Default item text color',
    },
  ];
}
