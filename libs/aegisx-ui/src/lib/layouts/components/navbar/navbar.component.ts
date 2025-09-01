import { Component, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AegisxNavigationComponent } from '../../../components/navigation/navigation.component';
import { AegisxConfigService } from '../../../services/config/config.service';
import { AegisxMediaWatcherService } from '../../../services/media-watcher/media-watcher.service';
import { AegisxNavigationItem } from '../../../types/navigation.types';

@Component({
  selector: 'ax-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    AegisxNavigationComponent
  ],
  template: `
    <div class="ax-navbar" [class.ax-navbar-opened]="opened">
      <!-- Header -->
      <div class="ax-navbar-header">
        <!-- Logo -->
        <div class="ax-navbar-logo">
          <img src="assets/logo/logo.svg" alt="Logo" class="w-8 h-8" />
          <span class="ax-navbar-logo-text ml-2">{{ logoText }}</span>
        </div>
        
        <!-- Toggle button (mobile) -->
        @if (isMobile()) {
          <button 
            mat-icon-button 
            (click)="toggleNavbar()"
            class="ax-navbar-toggle"
          >
            <mat-icon>menu</mat-icon>
          </button>
        }
      </div>

      <!-- Navigation -->
      <div class="ax-navbar-content">
        <ax-navigation
          [navigation]="navigation"
          [layout]="'vertical'"
          [appearance]="appearance"
        ></ax-navigation>
      </div>

      <!-- Footer (optional) -->
      @if (showFooter) {
        <div class="ax-navbar-footer">
          <ng-content select="[navbar-footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      height: 100%;
    }

    .ax-navbar {
      @apply flex flex-col h-full bg-gray-900 text-white;
      width: 280px;
      transition: width 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .ax-navbar-header {
      @apply flex items-center justify-between p-6 border-b border-gray-800;
      min-height: 80px;
    }

    .ax-navbar-logo {
      @apply flex items-center;
    }

    .ax-navbar-logo-text {
      @apply text-xl font-bold;
    }

    .ax-navbar-toggle {
      @apply lg:hidden;
    }

    .ax-navbar-content {
      @apply flex-1 overflow-y-auto overflow-x-hidden;
    }

    .ax-navbar-footer {
      @apply p-4 border-t border-gray-800;
    }

    /* Compact mode */
    :host-context(.ax-navbar-compact) .ax-navbar {
      width: 80px;
    }

    :host-context(.ax-navbar-compact) .ax-navbar-logo-text {
      @apply hidden;
    }

    /* Mobile */
    @media (max-width: 1023px) {
      .ax-navbar {
        @apply fixed top-0 left-0 z-50 transform -translate-x-full;
      }

      .ax-navbar.ax-navbar-opened {
        @apply translate-x-0;
      }
    }
  `]
})
export class NavbarComponent {
  @Input() navigation: AegisxNavigationItem[] = [];
  @Input() appearance: 'default' | 'compact' | 'dense' = 'default';
  @Input() opened = false;
  @Input() showFooter = false;
  @Input() logoText = 'AegisX';
  @Output() toggleEvent = new EventEmitter<void>();
  
  private _configService = inject(AegisxConfigService);
  private _mediaWatcher = inject(AegisxMediaWatcherService);
  
  isMobile = computed(() => this._mediaWatcher.isMobile());
  
  toggleNavbar(): void {
    this.toggleEvent.emit();
  }
}