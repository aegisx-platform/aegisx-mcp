import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AxEnterpriseLayoutComponent, AxNavigationItem } from '@aegisx/ui';
import { EnterprisePresetTheme } from '@aegisx/ui';
import { INVENTORY_APP_CONFIG } from './inventory.config';
import { SubAppConfig, HeaderAction } from '../../shared/multi-app';

/**
 * Inventory Shell Component
 *
 * Main shell component for the Inventory app.
 * Uses AxEnterpriseLayoutComponent with dynamic navigation
 * based on the current sub-app.
 *
 * Sub-apps:
 * - Dashboard: /inventory/dashboard
 * - Warehouse: /inventory/warehouse
 * - Receiving: /inventory/receiving
 * - Shipping: /inventory/shipping
 */
@Component({
  selector: 'app-inventory-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    AxEnterpriseLayoutComponent,
  ],
  template: `
    <ax-enterprise-layout
      [appName]="appName"
      [appTheme]="appTheme"
      [navigation]="currentNavigation()"
      [subNavigation]="subAppNavigation()"
      [showFooter]="config.showFooter ?? true"
      [contentBackground]="'gray'"
      (logoutClicked)="onLogout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        @for (action of appHeaderActions; track action.id) {
          <button
            mat-icon-button
            [matTooltip]="action.tooltip"
            (click)="handleAction(action)"
          >
            @if (action.badge) {
              <mat-icon [matBadge]="action.badge" matBadgeColor="warn">
                {{ action.icon }}
              </mat-icon>
            } @else {
              <mat-icon>{{ action.icon }}</mat-icon>
            }
          </button>
        }
      </ng-template>

      <!-- Router Outlet for Sub-App Pages -->
      <router-outlet></router-outlet>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>{{ config.footerContent }}</span>
        <span class="footer-version">v1.0.0</span>
      </ng-template>
    </ax-enterprise-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      .footer-version {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }
    `,
  ],
})
export class InventoryShellComponent implements OnInit {
  private readonly router = inject(Router);

  // App configuration
  readonly config = INVENTORY_APP_CONFIG;
  readonly appName = this.config.name;
  readonly appTheme: EnterprisePresetTheme = 'inventory';
  readonly appHeaderActions: HeaderAction[] = this.config.headerActions || [];

  // Current active sub-app
  private _activeSubAppId = 'dashboard';

  // Computed: Sub-app navigation tabs
  readonly subAppNavigation = computed<AxNavigationItem[]>(() => {
    return this.config.subApps.map((subApp: SubAppConfig) => ({
      id: subApp.id,
      title: subApp.name,
      icon: subApp.icon,
      link: subApp.route,
    }));
  });

  // Computed: Current navigation based on active sub-app
  readonly currentNavigation = computed<AxNavigationItem[]>(() => {
    const activeSubApp = this.getActiveSubApp();
    return activeSubApp?.navigation || [];
  });

  ngOnInit(): void {
    // Listen to route changes to update active sub-app
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateActiveSubApp((event as NavigationEnd).url);
      });

    // Set initial sub-app from current URL
    this.updateActiveSubApp(this.router.url);
  }

  /**
   * Update active sub-app based on URL
   */
  private updateActiveSubApp(url: string): void {
    const subApp = this.config.subApps.find((s: SubAppConfig) =>
      url.startsWith(s.route),
    );
    if (subApp) {
      this._activeSubAppId = subApp.id;
    }
  }

  /**
   * Get active sub-app config
   */
  private getActiveSubApp(): SubAppConfig | undefined {
    return this.config.subApps.find(
      (s: SubAppConfig) => s.id === this._activeSubAppId,
    );
  }

  /**
   * Handle header action click
   */
  handleAction(action: HeaderAction): void {
    switch (action.action) {
      case 'onScanBarcode':
        this.onScanBarcode();
        break;
      case 'onNotifications':
        this.onNotifications();
        break;
      case 'onSettings':
        this.onSettings();
        break;
    }
  }

  /**
   * Scan barcode action
   */
  onScanBarcode(): void {
    console.log('Scan barcode clicked');
    // TODO: Open barcode scanner dialog
  }

  /**
   * Notifications action
   */
  onNotifications(): void {
    console.log('Notifications clicked');
    // TODO: Open notifications panel
  }

  /**
   * Settings action
   */
  onSettings(): void {
    console.log('Settings clicked');
    this.router.navigate(['/inventory/settings']);
  }

  /**
   * Logout action
   */
  onLogout(): void {
    console.log('Logout clicked');
    this.router.navigate(['/login']);
  }
}
