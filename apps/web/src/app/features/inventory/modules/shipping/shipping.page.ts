import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * Shipping Page Component
 *
 * Placeholder for outbound shipping views.
 */
@Component({
  selector: 'app-shipping-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="shipping-page">
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
      .shipping-page {
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
export class ShippingPage {
  private readonly route = inject(ActivatedRoute);

  get view(): string {
    return this.route.snapshot.data['view'] || 'orders';
  }

  get pageTitle(): string {
    switch (this.view) {
      case 'picking':
        return 'Order Picking';
      case 'packing':
        return 'Packing Station';
      case 'dispatch':
        return 'Dispatch';
      default:
        return 'Orders';
    }
  }

  get pageSubtitle(): string {
    switch (this.view) {
      case 'picking':
        return 'Pick items for orders';
      case 'packing':
        return 'Pack orders for shipment';
      case 'dispatch':
        return 'Ready for dispatch';
      default:
        return 'Manage outbound orders';
    }
  }

  get pageIcon(): string {
    switch (this.view) {
      case 'picking':
        return 'checklist';
      case 'packing':
        return 'package_2';
      case 'dispatch':
        return 'local_shipping';
      default:
        return 'shopping_cart';
    }
  }
}
