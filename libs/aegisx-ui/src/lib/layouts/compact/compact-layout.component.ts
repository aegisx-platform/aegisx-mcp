import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { AegisxNavigationService } from '../../services/navigation/navigation.service';
import { AegisxMediaWatcherService } from '../../services/media-watcher/media-watcher.service';
import { AegisxLoadingBarComponent } from '../../components/loading-bar/loading-bar.component';
import { AegisxNavigationItem } from '../../types/navigation.types';

@Component({
  selector: 'ax-compact-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NavbarComponent,
    ToolbarComponent,
    AegisxLoadingBarComponent
  ],
  template: `
    <!-- Loading bar -->
    <ax-loading-bar></ax-loading-bar>

    <div class="ax-compact-layout">
      <!-- Compact sidebar -->
      <aside class="ax-compact-sidebar" [class.ax-compact-sidebar-expanded]="sidebarExpanded()">
        <!-- Logo -->
        <div class="ax-compact-logo">
          <img src="assets/logo/logo.svg" alt="Logo" class="w-8 h-8" />
        </div>

        <!-- Navigation -->
        <nav class="ax-compact-nav">
          @for (item of compactNavigation(); track item.id) {
            @if (item.type === 'basic' && item.link) {
              <a
                [routerLink]="item.link"
                routerLinkActive="active"
                class="ax-compact-nav-item"
                [matTooltip]="item.title"
                matTooltipPosition="right"
                [matTooltipDisabled]="sidebarExpanded()"
              >
                @if (item.icon) {
                  <mat-icon>{{ item.icon }}</mat-icon>
                }
                @if (sidebarExpanded()) {
                  <span class="ax-compact-nav-title">{{ item.title }}</span>
                }
              </a>
            }
          }
        </nav>

        <!-- Expand/Collapse button -->
        <button
          mat-icon-button
          (click)="toggleSidebar()"
          class="ax-compact-toggle"
        >
          <mat-icon>{{ sidebarExpanded() ? 'chevron_left' : 'chevron_right' }}</mat-icon>
        </button>
      </aside>

      <!-- Main content -->
      <div class="ax-compact-main">
        <!-- Toolbar -->
        <ax-toolbar [showMenuButton]="false">
          <!-- Toolbar title -->
          <div toolbar-title>
            <ng-content select="[toolbar-title]"></ng-content>
          </div>
          
          <!-- Toolbar actions -->
          <div toolbar-actions>
            <ng-content select="[toolbar-actions]"></ng-content>
          </div>
        </ax-toolbar>

        <!-- Page content -->
        <main class="ax-compact-content">
          <div class="ax-compact-content-inner">
            <ng-content></ng-content>
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      height: 100%;
    }

    .ax-compact-layout {
      @apply flex w-full h-full;
    }

    .ax-compact-sidebar {
      @apply flex flex-col bg-gray-900 text-white;
      width: 80px;
      transition: width 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
      
      &.ax-compact-sidebar-expanded {
        width: 280px;
      }
    }

    .ax-compact-logo {
      @apply flex items-center justify-center h-16 border-b border-gray-800;
    }

    .ax-compact-nav {
      @apply flex-1 py-4 overflow-y-auto;
    }

    .ax-compact-nav-item {
      @apply flex items-center h-12 px-3 mx-2 mb-1 rounded-md transition-colors;
      @apply text-gray-400 hover:text-white hover:bg-gray-800;
      
      &.active {
        @apply bg-primary-600 text-white;
      }
      
      mat-icon {
        @apply mx-auto;
        width: 24px;
        height: 24px;
        font-size: 24px;
      }
    }

    .ax-compact-nav-title {
      @apply ml-3 whitespace-nowrap;
    }

    .ax-compact-toggle {
      @apply m-2;
    }

    .ax-compact-main {
      @apply flex flex-col flex-1 min-w-0 bg-gray-50 dark:bg-gray-900;
    }

    .ax-compact-content {
      @apply flex-1 overflow-y-auto;
    }

    .ax-compact-content-inner {
      @apply p-4 md:p-6 lg:p-8;
    }

    /* Mobile adjustments */
    @media (max-width: 1023px) {
      .ax-compact-sidebar {
        @apply fixed top-0 left-0 h-full z-50 shadow-xl;
        transform: translateX(-100%);
        
        &.ax-compact-sidebar-expanded {
          transform: translateX(0);
        }
      }
      
      .ax-compact-main {
        @apply ml-0;
      }
    }
  `]
})
export class CompactLayoutComponent {
  private _navigationService = inject(AegisxNavigationService);
  private _mediaWatcher = inject(AegisxMediaWatcherService);
  
  sidebarExpanded = signal(false);
  compactNavigation = computed(() => this._navigationService.compactNavigation());
  isMobile = computed(() => this._mediaWatcher.isMobile());
  
  toggleSidebar(): void {
    this.sidebarExpanded.update(expanded => !expanded);
  }
}