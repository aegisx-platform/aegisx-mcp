import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  GridsterComponent,
  GridsterItemComponent,
  GridsterConfig,
  GridsterItem,
} from 'angular-gridster2';

interface GridsterItemExtended extends GridsterItem {
  id: number;
  title: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-gridster-poc',
  standalone: true,
  imports: [
    GridsterComponent,
    GridsterItemComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="poc-container">
      <div class="poc-header">
        <h1 class="poc-title">Angular Gridster2 POC</h1>
        <button
          mat-raised-button
          [color]="editMode() ? 'accent' : 'primary'"
          (click)="toggleEditMode()"
        >
          <mat-icon>{{ editMode() ? 'lock_open' : 'lock' }}</mat-icon>
          {{ editMode() ? 'Edit Mode: ON' : 'Edit Mode: OFF' }}
        </button>
      </div>

      @if (editMode()) {
        <div class="poc-instructions">
          <p>
            <mat-icon>info</mat-icon>
            Edit mode enabled - You can now drag and resize items!
          </p>
        </div>
      }

      <div class="gridster-wrapper">
        <gridster [options]="options">
          @for (item of dashboard; track item.id) {
            <gridster-item [item]="item">
              <div class="card-content" [style.background-color]="item.color">
                <div class="item-header">
                  <mat-icon class="item-icon">{{ item.icon }}</mat-icon>
                  <h3 class="item-title">{{ item.title }}</h3>
                </div>
                <div class="item-body">
                  <p>Position: {{ item.x }}, {{ item.y }}</p>
                  <p>Size: {{ item.cols }}x{{ item.rows }}</p>
                  @if (editMode()) {
                    <p class="edit-hint">
                      <mat-icon>open_with</mat-icon>
                      Drag to move
                    </p>
                    <p class="edit-hint">
                      <mat-icon>zoom_out_map</mat-icon>
                      Drag corners to resize
                    </p>
                  }
                </div>
              </div>
            </gridster-item>
          }
        </gridster>
      </div>
    </div>
  `,
  styles: [
    `
      .poc-container {
        padding: 24px;
        height: 100vh;
        background: #f5f5f5;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .poc-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding: 16px 24px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      .poc-title {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: #333;
      }

      .poc-instructions {
        margin-bottom: 24px;
        padding: 16px 24px;
        background: #fff3e0;
        border-radius: 8px;
        border-left: 4px solid #ff9800;
        flex-shrink: 0;
      }

      .poc-instructions p {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #e65100;
        font-weight: 500;
      }

      .poc-instructions mat-icon {
        color: #ff9800;
      }

      /* CRITICAL: Parent wrapper MUST have explicit size for gridster to work */
      .gridster-wrapper {
        flex: 1;
        min-height: 600px;
        position: relative;
      }

      gridster {
        background: #e0e0e0;
        border-radius: 8px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      .card-content {
        height: 100%;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        color: white;
        display: flex;
        flex-direction: column;
        gap: 16px;
        box-sizing: border-box;
      }

      .item-header {
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.3);
        padding-bottom: 12px;
      }

      .item-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .item-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .item-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .item-body p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .edit-hint {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        font-size: 13px;
      }

      .edit-hint mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      button mat-icon {
        margin-right: 8px;
      }
    `,
  ],
})
export class GridsterPocComponent {
  editMode = signal(false);

  // ใช้ object ธรรมดา ไม่ใช่ signal - และต้อง mutate object เดิม
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

  // ใช้ array ธรรมดา ไม่ใช่ signal
  dashboard: GridsterItemExtended[] = [
    {
      id: 1,
      x: 0,
      y: 0,
      rows: 2,
      cols: 3,
      title: 'Revenue',
      color: '#1976d2',
      icon: 'attach_money',
    },
    {
      id: 2,
      x: 3,
      y: 0,
      rows: 2,
      cols: 3,
      title: 'Users',
      color: '#388e3c',
      icon: 'people',
    },
    {
      id: 3,
      x: 6,
      y: 0,
      rows: 2,
      cols: 3,
      title: 'Orders',
      color: '#f57c00',
      icon: 'shopping_cart',
    },
    {
      id: 4,
      x: 9,
      y: 0,
      rows: 2,
      cols: 3,
      title: 'Traffic',
      color: '#7b1fa2',
      icon: 'trending_up',
    },
    {
      id: 5,
      x: 0,
      y: 2,
      rows: 3,
      cols: 6,
      title: 'Sales Chart',
      color: '#0288d1',
      icon: 'bar_chart',
    },
    {
      id: 6,
      x: 6,
      y: 2,
      rows: 3,
      cols: 6,
      title: 'User Analytics',
      color: '#5e35b1',
      icon: 'analytics',
    },
    {
      id: 7,
      x: 0,
      y: 5,
      rows: 2,
      cols: 4,
      title: 'Notifications',
      color: '#c62828',
      icon: 'notifications',
    },
    {
      id: 8,
      x: 4,
      y: 5,
      rows: 2,
      cols: 4,
      title: 'Tasks',
      color: '#00796b',
      icon: 'task_alt',
    },
    {
      id: 9,
      x: 8,
      y: 5,
      rows: 2,
      cols: 4,
      title: 'Calendar',
      color: '#6a1b9a',
      icon: 'calendar_today',
    },
  ];

  toggleEditMode(): void {
    const newEditMode = !this.editMode();
    this.editMode.set(newEditMode);

    // IMPORTANT: ต้อง mutate options object เดิม แล้วเรียก api.optionsChanged()
    this.options.draggable!.enabled = newEditMode;
    this.options.resizable!.enabled = newEditMode;
    this.options.displayGrid = newEditMode ? 'always' : 'onDrag&Resize';

    // เรียก optionsChanged เพื่อ notify gridster
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }
}
