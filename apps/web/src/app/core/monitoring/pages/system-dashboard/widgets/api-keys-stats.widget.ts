import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  DashboardService,
  ApiKeysStats,
} from '../../../services/dashboard.service';

@Component({
  selector: 'ax-api-keys-stats-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50"
          >
            <mat-icon class="text-violet-600 !text-xl">vpn_key</mat-icon>
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-900">
              API Keys Management
            </h3>
            <p class="text-xs text-slate-600">Active keys & usage</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      @if (loading()) {
        <div class="px-6 py-12 text-center">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
          ></div>
          <p class="mt-3 text-sm text-slate-500">Loading statistics...</p>
        </div>
      } @else if (error()) {
        <div class="px-6 py-8 text-center">
          <mat-icon class="text-red-500 !text-4xl mb-2">error_outline</mat-icon>
          <p class="text-sm text-slate-600">{{ error() }}</p>
          <button
            (click)="loadStats()"
            class="mt-3 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Retry
          </button>
        </div>
      } @else if (stats()) {
        <!-- Main Stats Grid -->
        <div class="p-6 grid grid-cols-2 gap-4">
          <!-- Total Keys -->
          <div
            class="p-4 rounded-lg bg-violet-50 border border-violet-100 cursor-pointer hover:bg-violet-100 transition-colors"
            (click)="navigateToApiKeys()"
          >
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="text-violet-600 !text-lg">folder</mat-icon>
              <span class="text-xs font-medium text-violet-700"
                >Total Keys</span
              >
            </div>
            <p class="text-2xl font-bold text-violet-900">
              {{ stats()!.totalKeys }}
            </p>
          </div>

          <!-- Active Keys -->
          <div
            class="p-4 rounded-lg bg-emerald-50 border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors"
            (click)="navigateToApiKeys()"
          >
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="text-emerald-600 !text-lg"
                >check_circle</mat-icon
              >
              <span class="text-xs font-medium text-emerald-700">Active</span>
            </div>
            <p class="text-2xl font-bold text-emerald-900">
              {{ stats()!.activeKeys }}
            </p>
          </div>

          <!-- Usage Today -->
          <div class="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="text-blue-600 !text-lg">today</mat-icon>
              <span class="text-xs font-medium text-blue-700">Used Today</span>
            </div>
            <p class="text-2xl font-bold text-blue-900">
              {{ stats()!.usageToday }}
            </p>
          </div>

          <!-- Recently Used (24h) -->
          <div class="p-4 rounded-lg bg-cyan-50 border border-cyan-100">
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="text-cyan-600 !text-lg">schedule</mat-icon>
              <span class="text-xs font-medium text-cyan-700">Last 24h</span>
            </div>
            <p class="text-2xl font-bold text-cyan-900">
              {{ stats()!.recentlyUsedKeys }}
            </p>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="px-6 pb-4">
          <div class="flex items-center gap-2 text-xs text-slate-600 mb-2">
            <span>Active vs Inactive</span>
            <span class="font-medium"
              >{{ stats()!.activeKeys }}/{{ stats()!.totalKeys }}</span
            >
          </div>
          <div class="flex h-2 rounded-full overflow-hidden bg-slate-100">
            <div
              class="bg-emerald-500"
              [style.width.%]="activePercentage()"
            ></div>
            <div
              class="bg-slate-300"
              [style.width.%]="inactivePercentage()"
            ></div>
          </div>
          <div class="flex items-center justify-between mt-2 text-xs">
            <span class="text-emerald-600"
              >{{ activePercentage() }}% Active</span
            >
            @if (stats()!.expiredKeys > 0) {
              <span class="text-amber-600"
                >{{ stats()!.expiredKeys }} Expired</span
              >
            }
          </div>
        </div>

        <!-- Footer Action -->
        <div
          class="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50"
        >
          <button
            (click)="navigateToApiKeys()"
            class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            <span>Manage API Keys</span>
            <mat-icon class="!text-base">arrow_forward</mat-icon>
          </button>
          <button
            (click)="loadStats()"
            class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <mat-icon class="!text-base">refresh</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ApiKeysStatsWidget implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  stats = signal<ApiKeysStats | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getApiKeysStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load API keys stats:', err);
        this.error.set('Failed to load API keys statistics');
        this.loading.set(false);
      },
    });
  }

  activePercentage(): number {
    const s = this.stats();
    if (!s || s.totalKeys === 0) return 0;
    return Math.round((s.activeKeys / s.totalKeys) * 100);
  }

  inactivePercentage(): number {
    const s = this.stats();
    if (!s || s.totalKeys === 0) return 0;
    return Math.round((s.inactiveKeys / s.totalKeys) * 100);
  }

  navigateToApiKeys() {
    // Navigate to API keys management page
    // Uncomment when route exists:
    // this.router.navigate(['/settings/api-keys']);
    console.log('Navigate to API Keys management');
  }
}
