import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { AegisxNavigationService } from '../../services/navigation/navigation.service';
import { AegisxMediaWatcherService } from '../../services/media-watcher/media-watcher.service';
import { AegisxLoadingBarComponent } from '../../components/loading-bar/loading-bar.component';

@Component({
  selector: 'ax-classic-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    NavbarComponent,
    ToolbarComponent,
    AegisxLoadingBarComponent
  ],
  template: `
    <!-- Loading bar -->
    <ax-loading-bar></ax-loading-bar>

    <mat-sidenav-container class="ax-classic-layout">
      <!-- Sidenav -->
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() && sidenavOpened()"
        [position]="'start'"
        [disableClose]="!isMobile()"
        class="ax-classic-sidenav"
      >
        <ax-navbar
          [navigation]="navigation()"
          [opened]="sidenavOpened()"
          (toggleEvent)="toggleSidenav()"
        >
          <!-- Footer content -->
          <div navbar-footer>
            <ng-content select="[navbar-footer]"></ng-content>
          </div>
        </ax-navbar>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="ax-classic-content">
        <!-- Toolbar -->
        <ax-toolbar
          [showMenuButton]="isMobile()"
          (toggleMenu)="toggleSidenav()"
        >
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
        <div class="ax-classic-page">
          <div class="ax-classic-page-content">
            <ng-content></ng-content>
            <router-outlet></router-outlet>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      height: 100%;
    }

    .ax-classic-layout {
      @apply flex w-full h-full;
    }

    .ax-classic-sidenav {
      width: 280px;
      box-shadow: 0 8px 10px -5px rgba(0, 0, 0, 0.2),
                  0 16px 24px 2px rgba(0, 0, 0, 0.14),
                  0 6px 30px 5px rgba(0, 0, 0, 0.12);
    }

    .ax-classic-content {
      @apply flex flex-col flex-1 min-w-0 bg-gray-50 dark:bg-gray-900;
    }

    .ax-classic-page {
      @apply flex flex-col flex-1 relative;
      overflow-y: auto;
    }

    .ax-classic-page-content {
      @apply flex flex-col flex-1 p-4 md:p-6 lg:p-8;
    }

    /* Mobile adjustments */
    @media (max-width: 1023px) {
      .ax-classic-sidenav {
        box-shadow: 0 8px 10px -5px rgba(0, 0, 0, 0.2),
                    0 16px 24px 2px rgba(0, 0, 0, 0.14),
                    0 6px 30px 5px rgba(0, 0, 0, 0.12);
      }
    }

    /* Print styles */
    @media print {
      .ax-classic-sidenav,
      ax-toolbar {
        display: none !important;
      }

      .ax-classic-page-content {
        padding: 0 !important;
      }
    }
  `]
})
export class ClassicLayoutComponent {
  private _navigationService = inject(AegisxNavigationService);
  private _mediaWatcher = inject(AegisxMediaWatcherService);
  
  sidenavOpened = signal(true);
  navigation = computed(() => this._navigationService.defaultNavigation());
  isMobile = computed(() => this._mediaWatcher.isMobile());
  
  toggleSidenav(): void {
    this.sidenavOpened.update(opened => !opened);
  }
}