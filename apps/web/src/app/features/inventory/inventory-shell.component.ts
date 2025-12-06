import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import {
  AxEnterpriseLayoutComponent,
  AxNavigationItem,
  EnterprisePresetTheme,
} from '@aegisx/ui';
import { INVENTORY_APP_CONFIG } from './inventory.config';
import { AuthService } from '../../core/auth';
import { MultiAppService, HeaderAction } from '../../shared/multi-app';

/**
 * Inventory Shell Component
 *
 * Main shell component for the Inventory app.
 * Uses AxEnterpriseLayoutComponent with navigation managed by MultiAppService.
 *
 * Features:
 * - Registers app with MultiAppService on init
 * - Uses centralized context from MultiAppService
 * - Dynamic navigation based on active context
 * - App-specific header actions
 *
 * Routes:
 * - /inventory          → Dashboard
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
      [showFooter]="config.showFooter ?? true"
      [contentBackground]="'gray'"
      (logoutClicked)="onLogout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        <!-- Dynamic Header Actions from MultiAppService -->
        @for (action of appHeaderActions(); track action.id) {
          <button
            mat-icon-button
            [matTooltip]="action.tooltip"
            (click)="handleAction(action)"
          >
            @if (action.badge) {
              <mat-icon
                [matBadge]="action.badge"
                matBadgeColor="warn"
                matBadgeSize="small"
              >
                {{ action.icon }}
              </mat-icon>
            } @else {
              <mat-icon>{{ action.icon }}</mat-icon>
            }
          </button>
        }
      </ng-template>

      <!-- Router Outlet for Pages -->
      <router-outlet></router-outlet>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>{{ config.footerContent }}</span>
        <span class="footer-version">v1.0</span>
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
        margin-left: 0.5rem;
      }
    `,
  ],
})
export class InventoryShellComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly multiAppService = inject(MultiAppService);

  // App configuration
  readonly config = INVENTORY_APP_CONFIG;
  readonly appName = this.config.name;
  readonly appTheme = this.config.theme as EnterprisePresetTheme;

  // Get navigation from MultiAppService (centralized)
  readonly currentNavigation = computed<AxNavigationItem[]>(() => {
    return this.multiAppService.currentNavigation();
  });

  // Header actions from MultiAppService
  readonly appHeaderActions = computed<HeaderAction[]>(() => {
    return this.multiAppService.currentHeaderActions();
  });

  // User info
  readonly currentUser = computed(() => {
    const user = this.authService.currentUser();
    if (user) {
      return {
        name: this.authService.userDisplayName(),
        email: user.email,
        avatar: user.avatar || null,
      };
    }
    return null;
  });

  ngOnInit(): void {
    // Register this app with MultiAppService
    this.multiAppService.registerApp(this.config, 0, true);
  }

  ngOnDestroy(): void {
    // Optionally unregister when shell is destroyed
    // this.multiAppService.unregisterApp(this.config.id);
  }

  /**
   * Handle header action click
   */
  handleAction(action: HeaderAction): void {
    switch (action.action) {
      case 'onNotifications':
        this.onNotifications();
        break;
      case 'onSettings':
        this.onSettings();
        break;
    }
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
    this.router.navigate(['/inventory/settings']);
  }

  /**
   * Logout action
   */
  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        this.router.navigate(['/login']);
      },
    });
  }
}
