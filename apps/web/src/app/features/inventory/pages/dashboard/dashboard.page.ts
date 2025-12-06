import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Inventory Dashboard Page
 */
@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Inventory Dashboard</h1>
        <p class="subtitle">Welcome to the Inventory management system</p>
      </header>

      <div class="dashboard-grid">
        <!-- Quick Stats -->
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>analytics</mat-icon>
            <mat-card-title>Statistics</mat-card-title>
            <mat-card-subtitle>Overview</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Dashboard content goes here...</p>
          </mat-card-content>
        </mat-card>

        <!-- Recent Activity -->
        <mat-card class="activity-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>history</mat-icon>
            <mat-card-title>Recent Activity</mat-card-title>
            <mat-card-subtitle>Latest updates</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Activity content goes here...</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 1.5rem;
      }

      .dashboard-header {
        margin-bottom: 2rem;
      }

      .dashboard-header h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 500;
      }

      .dashboard-header .subtitle {
        margin: 0.5rem 0 0;
        color: var(--ax-text-subtle);
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .stat-card,
      .activity-card {
        height: 200px;
      }
    `,
  ],
})
export class DashboardPage {}
