import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { NavigationService } from '../../core/navigation/services/navigation.service';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  selector: 'ax-debug-navigation',
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">🔍 Navigation Service Debug</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Status Card -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>📊 Service Status</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span>Data Source:</span>
                <mat-chip-set>
                  <mat-chip
                    [style.background-color]="
                      navigationInfo().dataSource === 'api' ? 'green' : 'orange'
                    "
                  >
                    {{ navigationInfo().dataSource.toUpperCase() }}
                  </mat-chip>
                </mat-chip-set>
              </div>

              <div class="flex items-center justify-between">
                <span>Loading:</span>
                <mat-icon
                  [color]="navigationInfo().loading ? 'accent' : 'primary'"
                >
                  {{ navigationInfo().loading ? 'refresh' : 'check_circle' }}
                </mat-icon>
              </div>

              <div class="flex items-center justify-between">
                <span>Error:</span>
                <mat-icon [color]="navigationInfo().error ? 'warn' : 'primary'">
                  {{ navigationInfo().error ? 'error' : 'check_circle' }}
                </mat-icon>
              </div>

              @if (navigationInfo().error) {
                <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
                  <p class="text-red-700 text-sm">
                    {{ navigationInfo().error }}
                  </p>
                </div>
              }

              <div class="flex items-center justify-between">
                <span>Using Fallback:</span>
                <mat-icon
                  [color]="
                    navigationInfo().isUsingFallback ? 'warn' : 'primary'
                  "
                >
                  {{
                    navigationInfo().isUsingFallback
                      ? 'warning'
                      : 'check_circle'
                  }}
                </mat-icon>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button
              mat-raised-button
              color="primary"
              (click)="refreshNavigation()"
            >
              <mat-icon>refresh</mat-icon>
              Refresh Default
            </button>
            <button
              mat-raised-button
              color="accent"
              (click)="loadUserNavigation()"
            >
              <mat-icon>person</mat-icon>
              Load User Nav
            </button>
            <button mat-raised-button color="warn" (click)="useFallback()">
              <mat-icon>cached</mat-icon>
              Use Fallback
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Statistics Card -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>📈 Navigation Statistics</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span>Total Items:</span>
                <span class="font-bold">{{ stats.totalItems }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Groups:</span>
                <span class="font-bold">{{ stats.groups }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Collapsibles:</span>
                <span class="font-bold">{{ stats.collapsibles }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Regular Items:</span>
                <span class="font-bold">{{ stats.regularItems }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Navigation Structure Card -->
      <mat-card class="mt-6">
        <mat-card-header>
          <mat-card-title>🗂️ Navigation Structure</mat-card-title>
          <mat-card-subtitle
            >Current navigation items loaded in the
            application</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content class="pt-4">
          <div class="bg-gray-50 p-4 rounded border overflow-auto">
            <pre class="text-xs">{{ navigationItems() | json }}</pre>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Back to App -->
      <div class="mt-6 text-center">
        <button mat-raised-button color="primary" routerLink="/dashboard">
          <mat-icon>home</mat-icon>
          Back to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #f5f5f5;
      }

      .container {
        max-width: 1200px;
      }

      mat-card {
        margin-bottom: 1rem;
      }

      pre {
        max-height: 400px;
        overflow-y: auto;
      }
    `,
  ],
})
export class DebugNavigationComponent implements OnInit {
  private navigationService = inject(NavigationService);

  // Expose navigation service signals
  navigationInfo = this.navigationService.navigationInfo;
  navigationItems = this.navigationService.navigationItems;

  stats = { totalItems: 0, groups: 0, collapsibles: 0, regularItems: 0 };

  ngOnInit() {
    // Update stats when navigation changes
    this.updateStats();

    // Log current state
    console.log('🔍 Navigation Debug Component initialized');
    console.log('📊 Navigation Info:', this.navigationInfo());
    console.log('🗂️ Navigation Items:', this.navigationItems());
  }

  refreshNavigation() {
    console.log('🔄 Manually refreshing default navigation from API...');
    this.navigationService.refresh('default').subscribe({
      next: (items) => {
        console.log('✅ Navigation refreshed successfully', items);
        this.updateStats();
      },
      error: (error) => {
        console.error('❌ Failed to refresh navigation', error);
      },
    });
  }

  loadUserNavigation() {
    console.log('🔄 Loading user-specific navigation from API...');
    this.navigationService.loadUserNavigation('default').subscribe({
      next: (items) => {
        console.log('✅ User navigation loaded successfully', items);
        this.updateStats();
      },
      error: (error) => {
        console.error('❌ Failed to load user navigation', error);
      },
    });
  }

  useFallback() {
    console.log('🔄 Switching to fallback navigation...');
    this.navigationService.useFallback();
    this.updateStats();
  }

  private updateStats() {
    this.stats = this.navigationService.getNavigationStats();
    console.log('📊 Navigation Stats:', this.stats);
  }
}
