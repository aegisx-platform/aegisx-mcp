import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AegisxNavigationService } from '../../services/navigation/navigation.service';
import { AegisxMediaWatcherService } from '../../services/media-watcher/media-watcher.service';
import { AegisxLoadingBarComponent } from '../../components/loading-bar/loading-bar.component';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';

@Component({
  selector: 'ax-enterprise-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    AegisxLoadingBarComponent,
    UserMenuComponent
  ],
  template: `
    <!-- Loading bar -->
    <ax-loading-bar></ax-loading-bar>

    <div class="ax-enterprise-layout">
      <!-- Header -->
      <header class="ax-enterprise-header">
        <mat-toolbar class="ax-enterprise-toolbar">
          <div class="ax-enterprise-toolbar-container">
            <!-- Logo and brand -->
            <div class="ax-enterprise-brand">
              <img src="assets/logo/logo.svg" alt="Logo" class="ax-enterprise-logo" />
              <span class="ax-enterprise-brand-text">AegisX Enterprise</span>
            </div>

            <!-- Primary navigation -->
            <nav class="ax-enterprise-nav">
              @for (item of horizontalNavigation(); track item.id) {
                @if (item.type === 'basic' && item.link) {
                  <a
                    [routerLink]="item.link"
                    routerLinkActive="active"
                    [routerLinkActiveOptions]="{exact: item.exactMatch || false}"
                    class="ax-enterprise-nav-item"
                  >
                    {{ item.title }}
                  </a>
                } @else if (item.type === 'group' && item.children) {
                  <button
                    mat-button
                    [matMenuTriggerFor]="menu"
                    class="ax-enterprise-nav-item ax-enterprise-nav-dropdown"
                  >
                    {{ item.title }}
                    <mat-icon>arrow_drop_down</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    @for (child of item.children; track child.id) {
                      @if (child.type === 'basic' && child.link) {
                        <a
                          mat-menu-item
                          [routerLink]="child.link"
                          routerLinkActive="active"
                        >
                          @if (child.icon) {
                            <mat-icon>{{ child.icon }}</mat-icon>
                          }
                          <span>{{ child.title }}</span>
                        </a>
                      }
                    }
                  </mat-menu>
                }
              }
            </nav>

            <!-- Actions -->
            <div class="ax-enterprise-actions">
              <!-- Search -->
              <button mat-icon-button>
                <mat-icon>search</mat-icon>
              </button>
              
              <!-- Notifications -->
              <button mat-icon-button>
                <mat-icon>notifications</mat-icon>
              </button>
              
              <!-- User menu -->
              <ax-user-menu></ax-user-menu>
            </div>
          </div>
        </mat-toolbar>
      </header>

      <!-- Main content -->
      <main class="ax-enterprise-main">
        <div class="ax-enterprise-content">
          <ng-content></ng-content>
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Footer (optional) -->
      @if (showFooter()) {
        <footer class="ax-enterprise-footer">
          <div class="ax-enterprise-footer-content">
            <ng-content select="[footer-content]"></ng-content>
            <div class="ax-enterprise-footer-text">
              © 2024 AegisX Enterprise. All rights reserved.
            </div>
          </div>
        </footer>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      height: 100%;
    }

    .ax-enterprise-layout {
      @apply flex flex-col w-full h-full;
    }

    .ax-enterprise-header {
      @apply sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-md;
    }

    .ax-enterprise-toolbar {
      @apply h-16;
      background-color: transparent !important;
    }

    .ax-enterprise-toolbar-container {
      @apply flex items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
    }

    .ax-enterprise-brand {
      @apply flex items-center gap-3;
    }

    .ax-enterprise-logo {
      @apply w-8 h-8;
    }

    .ax-enterprise-brand-text {
      @apply text-xl font-semibold text-gray-900 dark:text-white hidden sm:block;
    }

    .ax-enterprise-nav {
      @apply hidden lg:flex items-center gap-1;
    }

    .ax-enterprise-nav-item {
      @apply px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white;
      @apply hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors;
      @apply no-underline font-medium;
      
      &.active {
        @apply bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
      }
    }

    .ax-enterprise-nav-dropdown {
      @apply flex items-center gap-1;
    }

    .ax-enterprise-actions {
      @apply flex items-center gap-1;
    }

    .ax-enterprise-main {
      @apply flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900;
    }

    .ax-enterprise-content {
      @apply w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8;
    }

    .ax-enterprise-footer {
      @apply bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700;
    }

    .ax-enterprise-footer-content {
      @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4;
      @apply flex items-center justify-between;
    }

    .ax-enterprise-footer-text {
      @apply text-sm text-gray-500 dark:text-gray-400;
    }

    /* Mobile menu button */
    @media (max-width: 1023px) {
      .ax-enterprise-toolbar-container::before {
        content: '';
        @apply flex items-center;
        
        button {
          @apply -ml-2;
        }
      }
    }
  `]
})
export class EnterpriseLayoutComponent {
  private _navigationService = inject(AegisxNavigationService);
  private _mediaWatcher = inject(AegisxMediaWatcherService);
  
  horizontalNavigation = computed(() => 
    this._navigationService.horizontalNavigation().length > 0 
      ? this._navigationService.horizontalNavigation()
      : this._navigationService.defaultNavigation()
  );
  
  isMobile = computed(() => this._mediaWatcher.isMobile());
  showFooter = signal(true);
}