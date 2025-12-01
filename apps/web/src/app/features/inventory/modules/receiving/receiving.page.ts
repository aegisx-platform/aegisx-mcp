import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * Receiving Page Component
 *
 * Placeholder for goods receiving views.
 */
@Component({
  selector: 'app-receiving-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="receiving-page">
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
      .receiving-page {
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
export class ReceivingPage {
  private readonly route = inject(ActivatedRoute);

  get view(): string {
    return this.route.snapshot.data['view'] || 'pending';
  }

  get pageTitle(): string {
    switch (this.view) {
      case 'received':
        return 'Received Goods';
      case 'inspection':
        return 'Quality Check';
      default:
        return 'Pending Receipts';
    }
  }

  get pageSubtitle(): string {
    switch (this.view) {
      case 'received':
        return 'View completed goods receipts';
      case 'inspection':
        return 'Quality inspection queue';
      default:
        return 'Goods awaiting receipt';
    }
  }

  get pageIcon(): string {
    switch (this.view) {
      case 'received':
        return 'check_circle';
      case 'inspection':
        return 'fact_check';
      default:
        return 'pending_actions';
    }
  }
}
