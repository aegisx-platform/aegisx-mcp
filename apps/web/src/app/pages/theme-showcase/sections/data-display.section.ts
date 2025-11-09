import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-data-display-section',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
  ],
  template: `
    <div class="section-container">
      <h2 class="section-title">Data Display</h2>
      <p class="section-description">Tables, pagination, and data visualization components</p>

      <!-- Data Table -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Data Table</mat-card-title>
          <mat-card-subtitle>Sortable and paginated data display</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="tableData" class="demo-table">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let element">{{ element.id }}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let element">{{ element.name }}</td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let element">{{ element.email }}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let element">
                  <span class="status-badge" [class]="'status-' + element.status.toLowerCase()">
                    {{ element.status }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Simple Data Grid -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Data Grid</mat-card-title>
          <mat-card-subtitle>Grid layout for data display</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="data-grid">
            @for (item of gridData; track item.id) {
              <div class="grid-item">
                <div class="grid-header">
                  <mat-icon>{{ item.icon }}</mat-icon>
                  <span>{{ item.title }}</span>
                </div>
                <div class="grid-value">{{ item.value }}</div>
                <div class="grid-subtitle">{{ item.subtitle }}</div>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .section-container {
        display: flex;
        flex-direction: column;
        gap: var(--preset-spacing-lg, 36px);
      }

      .section-title {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--theme-text-primary);
        letter-spacing: -0.5px;
      }

      .section-description {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: var(--theme-text-secondary);
      }

      .component-card {
        border-radius: var(--preset-border-radius, 12px);
        box-shadow: var(--preset-shadow, 0 10px 15px rgba(0, 0, 0, 0.1));
        transition: var(--preset-transition, all 300ms ease-in-out);
      }

      .component-card mat-card-header {
        padding: var(--preset-spacing-base, 24px) var(--preset-spacing-base, 24px)
          var(--preset-spacing-md, 18px) var(--preset-spacing-base, 24px);
        border-bottom: 1px solid var(--theme-surface-border);
      }

      .component-card mat-card-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .component-card mat-card-subtitle {
        margin-top: 4px;
        font-size: 13px;
        color: var(--theme-text-secondary);
      }

      .component-card mat-card-content {
        padding: var(--preset-spacing-base, 24px);
      }

      .table-container {
        overflow-x: auto;
      }

      .demo-table {
        width: 100%;
        border-collapse: collapse;
      }

      .demo-table th {
        background-color: var(--theme-surface-hover);
        color: var(--theme-text-primary);
        font-weight: 600;
        padding: var(--preset-spacing-md, 18px);
        text-align: left;
        border-bottom: 1px solid var(--theme-surface-border);
      }

      .demo-table td {
        padding: var(--preset-spacing-md, 18px);
        border-bottom: 1px solid var(--theme-surface-border);
        color: var(--theme-text-primary);
      }

      .demo-table tr:hover {
        background-color: var(--theme-surface-hover);
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: var(--preset-border-radius, 12px);
        font-size: 12px;
        font-weight: 600;

        &.status-active {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        &.status-inactive {
          background-color: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }

        &.status-pending {
          background-color: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
      }

      .data-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--preset-spacing-lg, 36px);
      }

      .grid-item {
        padding: var(--preset-spacing-base, 24px);
        background-color: var(--theme-surface-hover);
        border-radius: var(--preset-border-radius, 12px);
        border: 1px solid var(--theme-surface-border);
      }

      .grid-header {
        display: flex;
        align-items: center;
        gap: var(--preset-spacing-md, 18px);
        margin-bottom: var(--preset-spacing-md, 18px);
        color: var(--theme-text-secondary);
        font-size: 14px;

        mat-icon {
          color: var(--md-sys-color-primary, #2196f3);
        }
      }

      .grid-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--theme-text-primary);
        margin-bottom: 8px;
      }

      .grid-subtitle {
        font-size: 12px;
        color: var(--theme-text-tertiary);
      }
    `,
  ],
})
export class DataDisplaySection {
  displayedColumns: string[] = ['id', 'name', 'email', 'status'];

  tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Pending' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', status: 'Active' },
  ];

  gridData = [
    { id: 1, icon: 'people', title: 'Users', value: '1,234', subtitle: 'Active users' },
    { id: 2, icon: 'trending_up', title: 'Revenue', value: '$45.2K', subtitle: 'This month' },
    { id: 3, icon: 'shopping_cart', title: 'Orders', value: '567', subtitle: 'Completed' },
    { id: 4, icon: 'star', title: 'Rating', value: '4.8/5', subtitle: 'Customer rating' },
  ];
}
