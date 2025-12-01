import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * Warehouse Page Component
 *
 * Placeholder for warehouse management views.
 */
@Component({
  selector: 'app-warehouse-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="warehouse-page">
      <header class="page-header">
        <h1>{{ pageTitle }}</h1>
        <p class="subtitle">{{ pageSubtitle }}</p>
      </header>

      <mat-card>
        <mat-card-content>
          <div class="placeholder">
            <mat-icon>{{ pageIcon }}</mat-icon>
            <p>{{ pageTitle }} content will be implemented here.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .warehouse-page {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 24px;

        h1 {
          font-size: 28px;
          font-weight: 500;
          margin: 0 0 8px 0;
        }

        .subtitle {
          color: var(--ax-text-muted);
          margin: 0;
        }
      }

      .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        color: var(--ax-text-muted);

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
        }
      }
    `,
  ],
})
export class WarehousePage {
  private readonly route = inject(ActivatedRoute);

  get view(): string {
    return this.route.snapshot.data['view'] || 'overview';
  }

  get pageTitle(): string {
    switch (this.view) {
      case 'locations':
        return 'Warehouse Locations';
      case 'counts':
        return 'Stock Counts';
      case 'transfers':
        return 'Stock Transfers';
      default:
        return 'Stock Overview';
    }
  }

  get pageSubtitle(): string {
    switch (this.view) {
      case 'locations':
        return 'Manage warehouse locations and zones';
      case 'counts':
        return 'Perform and track stock counts';
      case 'transfers':
        return 'Transfer stock between locations';
      default:
        return 'View and manage warehouse stock';
    }
  }

  get pageIcon(): string {
    switch (this.view) {
      case 'locations':
        return 'location_on';
      case 'counts':
        return 'calculate';
      case 'transfers':
        return 'swap_horiz';
      default:
        return 'inventory_2';
    }
  }
}
