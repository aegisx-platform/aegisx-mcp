import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * Inventory Dashboard Page
 *
 * Simple placeholder dashboard with mat-card outlined.
 * Add your analytics, charts, and KPIs here.
 */
@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Inventory analytics and overview</p>
      </header>

      <mat-card appearance="outlined" class="placeholder-card">
        <mat-card-content>
          <mat-icon class="placeholder-icon">analytics</mat-icon>
          <h2>Dashboard Coming Soon</h2>
          <p>Add your analytics, charts, and KPIs here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-header {
        margin-bottom: 2rem;
      }

      .dashboard-header h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ax-text-default);
      }

      .dashboard-header .subtitle {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--ax-text-subtle);
      }

      .placeholder-card {
        text-align: center;
        padding: 3rem 2rem;
      }

      .placeholder-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: var(--ax-text-subtle);
        margin-bottom: 1rem;
      }

      .placeholder-card h2 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--ax-text-default);
      }

      .placeholder-card p {
        margin: 0;
        color: var(--ax-text-subtle);
      }
    `,
  ],
})
export class DashboardPage {}
