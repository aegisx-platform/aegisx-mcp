import { Component, OnInit, inject, signal, computed } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
} from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BudgetRequestDataService } from '../../services/budget-request-data.service';
import { StatsCardComponent } from '../../../../../../shared/components/stats-card/stats-card.component';
import { BudgetRequestStatusBadgeComponent } from '../../components/status-badge/budget-request-status-badge.component';
import { forkJoin, finalize } from 'rxjs';

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    StatsCardComponent,
    BudgetRequestStatusBadgeComponent,
  ],
  templateUrl: './overview-dashboard.component.html',
  styleUrls: ['./overview-dashboard.component.scss'],
})
export class OverviewDashboardComponent implements OnInit {
  private dataService = inject(BudgetRequestDataService);
  private router = inject(Router);

  // Signals to hold dashboard data
  loading = signal(true);
  error = signal<string | null>(null);
  stats = signal<any>(null);
  recentRequests = signal<any[]>([]);
  pendingActions = signal<any[]>([]);
  budgetSummary = signal<any>(null);

  // Computed values
  budgetUtilization = computed(() => {
    const summary = this.budgetSummary();
    if (!summary || summary.total_budget === 0) return 0;
    return (summary.total_used / summary.total_budget) * 100;
  });

  hasData = computed(() => {
    return this.stats() !== null && !this.loading();
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Use forkJoin to load data in parallel
    forkJoin({
      stats: this.dataService.getStats({ fiscal_year: 2568 }),
      recent: this.dataService.getRecent({ limit: 5 }),
      pending: this.dataService.getMyPendingActions(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.stats.set(response.stats);
          this.recentRequests.set(response.recent.requests);
          this.pendingActions.set(response.pending.pending);

          // Set mock budget summary - in production, fetch from budget allocations API
          this.budgetSummary.set({
            total_budget: 10000000,
            total_used: 6500000,
          });
        },
        error: (err) => {
          console.error('Failed to load dashboard data:', err);
          this.error.set('Failed to load dashboard data. Please try again.');
        },
      });
  }

  createNewRequest(): void {
    // Navigate to create new budget request
    this.router.navigate(['/inventory/budget-requests', 'list']);
  }

  navigateToPendingAction(item: any): void {
    if (item && item.id) {
      this.router.navigate(['/inventory/budget-requests', item.id, 'items']);
    }
  }

  navigateToRecentRequest(item: any): void {
    if (item && item.id) {
      this.router.navigate(['/inventory/budget-requests', item.id, 'items']);
    }
  }

  navigateToAllRequests(): void {
    this.router.navigate(['/inventory/budget-requests', 'list']);
  }

  retry(): void {
    this.loadDashboardData();
  }
}
