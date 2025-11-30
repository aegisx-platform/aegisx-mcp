import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import {
  GridsterComponent,
  GridsterItemComponent,
  GridsterConfig,
  GridType,
  DisplayGrid,
} from 'angular-gridster2';
import {
  AxEnterpriseLayoutComponent,
  AxNavigationItem,
  AxBreadcrumbComponent,
  BreadcrumbItem,
  AxDrawerComponent,
} from '@aegisx/ui';

interface DashboardItem {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  cols: number;
  rows: number;
}

@Component({
  selector: 'app-gridster-demo',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    GridsterComponent,
    GridsterItemComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatDividerModule,
    AxEnterpriseLayoutComponent,
    AxBreadcrumbComponent,
    AxDrawerComponent,
  ],
  template: `
    <ax-enterprise-layout
      [appName]="'Gridster Demo'"
      [navigation]="navigation"
      [showFooter]="true"
      [headerTheme]="'dark'"
      [contentBackground]="'gray'"
      (logoutClicked)="onLogout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        <button mat-flat-button (click)="addItem()">
          <mat-icon>add</mat-icon>
          Add Item
        </button>
        <button
          mat-flat-button
          [color]="editMode() ? 'accent' : 'primary'"
          (click)="toggleEditMode()"
        >
          <mat-icon>{{ editMode() ? 'lock_open' : 'lock' }}</mat-icon>
          {{ editMode() ? 'Edit Mode: ON' : 'Edit Mode: OFF' }}
        </button>
        <button
          mat-icon-button
          matTooltip="Grid Options"
          (click)="openOptionsDrawer()"
        >
          <mat-icon>settings</mat-icon>
        </button>
      </ng-template>

      <!-- Main Content -->
      <div class="demo-content">
        <!-- Breadcrumb -->
        <ax-breadcrumb
          [items]="breadcrumbItems"
          separatorIcon="chevron_right"
          size="sm"
        ></ax-breadcrumb>

        <!-- Instructions -->
        @if (editMode()) {
          <div class="demo-instructions">
            <mat-icon>info</mat-icon>
            <span>Edit mode enabled - You can now drag and resize items!</span>
          </div>
        }

        <!-- Gridster Content -->
        <div class="gridster-wrapper">
          <gridster [options]="options">
            @for (item of dashboard; track item.id) {
              <gridster-item [item]="item">
                <div class="item-content" [style.background]="item.color">
                  <span class="item-label">{{ item.label }}</span>
                  <span class="item-size">{{ item.cols }}x{{ item.rows }}</span>
                  @if (editMode()) {
                    <button class="remove-btn" (click)="removeItem(item)">
                      <mat-icon>close</mat-icon>
                    </button>
                  }
                </div>
              </gridster-item>
            }
          </gridster>
        </div>

        <!-- Info Box -->
        <div class="info-card">
          <mat-icon class="info-icon">info</mat-icon>
          <div class="info-text">
            <strong>Gridster Demo Features</strong>
            <ul>
              <li>
                <strong>Add Item:</strong> Click "Add Item" button to add new
                items
              </li>
              <li>
                <strong>Edit Mode:</strong> Toggle edit mode to enable drag &
                resize
              </li>
              <li>
                <strong>Drag:</strong> When edit mode is ON, drag items to
                reposition them
              </li>
              <li>
                <strong>Resize:</strong> Drag the corners/edges of items to
                resize them
              </li>
              <li>
                <strong>Remove:</strong> Click X button on items in edit mode to
                remove them
              </li>
              <li>
                <strong>Options:</strong> Click settings icon to customize grid
                options
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>Gridster Demo - AegisX Design System</span>
        <a mat-button routerLink="/gridster-poc"> View Advanced POC </a>
      </ng-template>
    </ax-enterprise-layout>

    <!-- Options Drawer -->
    <ax-drawer
      [(open)]="optionsDrawerOpen"
      position="right"
      size="sm"
      title="Grid Options"
      subtitle="Customize the grid layout"
      icon="tune"
    >
      <div class="options-panel">
        <!-- Grid Type -->
        <div class="option-section">
          <h4>Grid Type</h4>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Grid Type</mat-label>
            <mat-select
              [(ngModel)]="gridSettings.gridType"
              (ngModelChange)="applyOptions()"
            >
              <mat-option value="fit">Fit (fill container)</mat-option>
              <mat-option value="scrollVertical">Scroll Vertical</mat-option>
              <mat-option value="scrollHorizontal"
                >Scroll Horizontal</mat-option
              >
              <mat-option value="fixed">Fixed Size</mat-option>
              <mat-option value="verticalFixed">Vertical Fixed</mat-option>
              <mat-option value="horizontalFixed">Horizontal Fixed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-divider></mat-divider>

        <!-- Grid Size -->
        <div class="option-section">
          <h4>Grid Size</h4>

          <label class="slider-label">
            Columns: {{ gridSettings.minCols }}
          </label>
          <mat-slider min="4" max="24" step="1" class="full-width">
            <input
              matSliderThumb
              [(ngModel)]="gridSettings.minCols"
              (ngModelChange)="onColsChange($event)"
            />
          </mat-slider>

          <label class="slider-label">
            Margin: {{ gridSettings.margin }}px
          </label>
          <mat-slider min="0" max="32" step="2" class="full-width">
            <input
              matSliderThumb
              [(ngModel)]="gridSettings.margin"
              (ngModelChange)="applyOptions()"
            />
          </mat-slider>

          <label class="slider-label">
            Min Rows: {{ gridSettings.minRows }}
          </label>
          <mat-slider min="1" max="20" step="1" class="full-width">
            <input
              matSliderThumb
              [(ngModel)]="gridSettings.minRows"
              (ngModelChange)="applyOptions()"
            />
          </mat-slider>
        </div>

        <mat-divider></mat-divider>

        <!-- Display Options -->
        <div class="option-section">
          <h4>Display Options</h4>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Show Grid Lines</mat-label>
            <mat-select
              [(ngModel)]="gridSettings.displayGrid"
              (ngModelChange)="applyOptions()"
            >
              <mat-option value="always">Always</mat-option>
              <mat-option value="onDrag&Resize">On Drag & Resize</mat-option>
              <mat-option value="none">Never</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-slide-toggle
            [(ngModel)]="gridSettings.pushItems"
            (ngModelChange)="applyOptions()"
          >
            Push Items on Move
          </mat-slide-toggle>

          <mat-slide-toggle
            [(ngModel)]="gridSettings.swap"
            (ngModelChange)="applyOptions()"
          >
            Swap Items on Overlap
          </mat-slide-toggle>

          <mat-slide-toggle
            [(ngModel)]="gridSettings.compactType"
            (ngModelChange)="applyOptions()"
          >
            Compact Items
          </mat-slide-toggle>
        </div>

        <mat-divider></mat-divider>

        <!-- Fixed Size Options -->
        @if (
          gridSettings.gridType === 'fixed' ||
          gridSettings.gridType === 'verticalFixed' ||
          gridSettings.gridType === 'horizontalFixed'
        ) {
          <div class="option-section">
            <h4>Fixed Size</h4>

            <label class="slider-label">
              Row Height: {{ gridSettings.fixedRowHeight }}px
            </label>
            <mat-slider min="50" max="300" step="10" class="full-width">
              <input
                matSliderThumb
                [(ngModel)]="gridSettings.fixedRowHeight"
                (ngModelChange)="applyOptions()"
              />
            </mat-slider>

            <label class="slider-label">
              Column Width: {{ gridSettings.fixedColWidth }}px
            </label>
            <mat-slider min="50" max="300" step="10" class="full-width">
              <input
                matSliderThumb
                [(ngModel)]="gridSettings.fixedColWidth"
                (ngModelChange)="applyOptions()"
              />
            </mat-slider>
          </div>

          <mat-divider></mat-divider>
        }

        <!-- Actions -->
        <div class="option-section">
          <button
            mat-stroked-button
            color="primary"
            class="full-width"
            (click)="resetOptions()"
          >
            <mat-icon>refresh</mat-icon>
            Reset to Defaults
          </button>
        </div>
      </div>

      <!-- Footer -->
      <ng-template #footer>
        <button mat-button (click)="optionsDrawerOpen = false">Close</button>
        <button mat-flat-button color="primary" (click)="applyOptions()">
          Apply
        </button>
      </ng-template>
    </ax-drawer>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }

    .demo-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
    }

    .demo-instructions {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: #fff3e0;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
      flex-shrink: 0;
      color: #e65100;
      font-weight: 500;

      mat-icon {
        color: #ff9800;
      }
    }

    /* CRITICAL: Parent wrapper MUST have explicit size for gridster to work */
    .gridster-wrapper {
      flex: 1;
      min-height: 500px;
      position: relative;
    }

    gridster {
      background: var(--ax-background-subtle, #e5e7eb);
      border-radius: 12px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    /* Gridster item styles */
    ::ng-deep gridster-item {
      background: transparent !important;
      overflow: visible !important;
      border-radius: 8px;
    }

    .item-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      position: relative;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .item-label {
      font-size: 24px;
      font-weight: bold;
    }

    .item-size {
      font-size: 14px;
      opacity: 0.8;
      margin-top: 4px;
    }

    .remove-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.5);
      }
    }

    /* Info Card */
    .info-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--ax-info-faint);
      border: 1px solid var(--ax-info-200);
      border-radius: var(--ax-radius-lg);
      flex-shrink: 0;
    }

    .info-icon {
      color: var(--ax-info-default);
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .info-text {
      strong {
        color: var(--ax-info-700);
        font-size: 1rem;
      }

      ul {
        margin: 0.75rem 0 0;
        padding-left: 1.25rem;

        li {
          font-size: 0.9375rem;
          color: var(--ax-info-700);
          line-height: 1.6;
          margin-bottom: 0.25rem;

          strong {
            font-size: 0.9375rem;
          }
        }
      }
    }

    button mat-icon {
      margin-right: 8px;
    }

    /* Options Panel Styles */
    .options-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .option-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      h4 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ax-text-heading, #111827);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .slider-label {
      font-size: 0.875rem;
      color: var(--ax-text-secondary, #6b7280);
      margin-top: 0.5rem;
    }

    .full-width {
      width: 100%;
    }

    mat-slide-toggle {
      margin: 0.25rem 0;
    }

    mat-divider {
      margin: 0.5rem 0;
    }
  `,
})
export class GridsterDemoComponent {
  editMode = signal(false);
  optionsDrawerOpen = false;
  private itemCounter = 10;

  // Grid settings state for drawer controls
  gridSettings = {
    gridType: 'fit' as GridType,
    minCols: 12,
    maxCols: 12,
    minRows: 6,
    maxRows: 100,
    margin: 16,
    displayGrid: 'onDrag&Resize' as DisplayGrid,
    pushItems: true,
    swap: false,
    compactType: false,
    fixedRowHeight: 100,
    fixedColWidth: 100,
  };

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Demos', url: '/enterprise-demo' },
    { label: 'Gridster Demo' },
  ];

  navigation: AxNavigationItem[] = [
    {
      id: 'launcher',
      title: 'App Launcher Demo',
      link: '/app-launcher-demo',
      icon: 'apps',
    },
    {
      id: 'gridster-demo',
      title: 'Gridster Demo',
      link: '/gridster-demo',
      icon: 'grid_view',
    },
    {
      id: 'dashboard-builder',
      title: 'Dashboard Builder',
      link: '/gridster-poc',
      icon: 'dashboard_customize',
    },
    {
      id: 'enterprise',
      title: 'Enterprise Demo',
      link: '/enterprise-demo',
      icon: 'business',
    },
  ];

  // Gridster options
  options: GridsterConfig = {
    draggable: {
      enabled: false,
    },
    resizable: {
      enabled: false,
    },
    pushItems: true,
    displayGrid: 'onDrag&Resize',
    gridType: 'fit',
    minCols: 12,
    maxCols: 12,
    minRows: 6,
    maxRows: 100,
    margin: 16,
  };

  // Dashboard items
  dashboard: DashboardItem[] = [
    { id: 'A', label: 'A', color: '#3b82f6', x: 0, y: 0, cols: 3, rows: 2 },
    { id: 'B', label: 'B', color: '#eab308', x: 3, y: 0, cols: 3, rows: 2 },
    { id: 'C', label: 'C', color: '#6b7280', x: 6, y: 0, cols: 3, rows: 2 },
    { id: 'D', label: 'D', color: '#a855f7', x: 9, y: 0, cols: 3, rows: 2 },
    { id: 'E', label: 'E', color: '#10b981', x: 0, y: 2, cols: 6, rows: 3 },
    { id: 'F', label: 'F', color: '#f43f5e', x: 6, y: 2, cols: 6, rows: 3 },
    { id: 'G', label: 'G', color: '#06b6d4', x: 0, y: 5, cols: 4, rows: 2 },
    { id: 'H', label: 'H', color: '#f97316', x: 4, y: 5, cols: 4, rows: 2 },
    { id: 'I', label: 'I', color: '#8b5cf6', x: 8, y: 5, cols: 4, rows: 2 },
  ];

  openOptionsDrawer(): void {
    this.optionsDrawerOpen = true;
  }

  toggleEditMode(): void {
    const newEditMode = !this.editMode();
    this.editMode.set(newEditMode);

    this.options.draggable!.enabled = newEditMode;
    this.options.resizable!.enabled = newEditMode;
    this.options.displayGrid = newEditMode
      ? 'always'
      : this.gridSettings.displayGrid;

    this.notifyGridster();
  }

  addItem(): void {
    const colors = [
      '#3b82f6',
      '#eab308',
      '#10b981',
      '#f43f5e',
      '#a855f7',
      '#06b6d4',
      '#f97316',
      '#8b5cf6',
    ];
    const label = String.fromCharCode(65 + this.itemCounter);
    this.itemCounter++;

    this.dashboard.push({
      id: label,
      label: label,
      color: colors[this.dashboard.length % colors.length],
      x: 0,
      y: 0,
      cols: 3,
      rows: 2,
    });
  }

  removeItem(item: DashboardItem): void {
    this.dashboard = this.dashboard.filter((i) => i.id !== item.id);
  }

  onColsChange(value: number): void {
    this.gridSettings.minCols = value;
    this.gridSettings.maxCols = value;
    this.applyOptions();
  }

  applyOptions(): void {
    this.options.gridType = this.gridSettings.gridType;
    this.options.minCols = this.gridSettings.minCols;
    this.options.maxCols = this.gridSettings.maxCols;
    this.options.minRows = this.gridSettings.minRows;
    this.options.maxRows = this.gridSettings.maxRows;
    this.options.margin = this.gridSettings.margin;
    this.options.pushItems = this.gridSettings.pushItems;
    this.options.swap = this.gridSettings.swap;

    if (this.editMode()) {
      this.options.displayGrid = 'always';
    } else {
      this.options.displayGrid = this.gridSettings.displayGrid;
    }

    if (this.gridSettings.compactType) {
      this.options.compactType = 'compactUp&Left';
    } else {
      this.options.compactType = 'none';
    }

    if (
      this.gridSettings.gridType === 'fixed' ||
      this.gridSettings.gridType === 'verticalFixed' ||
      this.gridSettings.gridType === 'horizontalFixed'
    ) {
      this.options.fixedRowHeight = this.gridSettings.fixedRowHeight;
      this.options.fixedColWidth = this.gridSettings.fixedColWidth;
    }

    this.notifyGridster();
  }

  resetOptions(): void {
    this.gridSettings = {
      gridType: 'fit' as GridType,
      minCols: 12,
      maxCols: 12,
      minRows: 6,
      maxRows: 100,
      margin: 16,
      displayGrid: 'onDrag&Resize' as DisplayGrid,
      pushItems: true,
      swap: false,
      compactType: false,
      fixedRowHeight: 100,
      fixedColWidth: 100,
    };
    this.applyOptions();
  }

  private notifyGridster(): void {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }

  onLogout(): void {
    console.log('Logout clicked');
  }
}
