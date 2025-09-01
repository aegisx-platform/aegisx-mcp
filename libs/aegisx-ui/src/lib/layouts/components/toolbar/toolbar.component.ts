import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserMenuComponent } from '../../../components/user-menu/user-menu.component';
import { AegisxConfigService } from '../../../services/config/config.service';

@Component({
  selector: 'ax-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    UserMenuComponent
  ],
  template: `
    <mat-toolbar class="ax-toolbar">
      <!-- Left side -->
      <div class="ax-toolbar-left">
        <!-- Menu toggle button -->
        @if (showMenuButton) {
          <button 
            mat-icon-button 
            (click)="toggleMenu.emit()"
            class="ax-toolbar-menu-button"
          >
            <mat-icon>menu</mat-icon>
          </button>
        }
        
        <!-- Breadcrumbs or title -->
        <div class="ax-toolbar-title">
          <ng-content select="[toolbar-title]"></ng-content>
        </div>
      </div>

      <!-- Center (optional) -->
      <div class="ax-toolbar-center">
        <ng-content select="[toolbar-center]"></ng-content>
      </div>

      <!-- Right side -->
      <div class="ax-toolbar-right">
        <!-- Search -->
        @if (showSearch) {
          <button mat-icon-button (click)="searchClick.emit()">
            <mat-icon>search</mat-icon>
          </button>
        }
        
        <!-- Notifications -->
        @if (showNotifications) {
          <button mat-icon-button (click)="notificationsClick.emit()">
            <mat-icon>notifications</mat-icon>
          </button>
        }
        
        <!-- Theme toggle -->
        @if (showThemeToggle) {
          <button mat-icon-button (click)="toggleTheme()">
            <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
        }
        
        <!-- User menu -->
        @if (showUserMenu) {
          <ax-user-menu></ax-user-menu>
        }
        
        <!-- Custom actions -->
        <ng-content select="[toolbar-actions]"></ng-content>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      z-index: 49;
    }

    .ax-toolbar {
      @apply flex items-center justify-between px-4 lg:px-6;
      height: 64px;
      background-color: rgb(var(--ax-bg-paper) / 1);
      border-bottom: 1px solid rgb(var(--ax-border-default) / 1);
    }

    .ax-toolbar-left {
      @apply flex items-center flex-1;
    }

    .ax-toolbar-center {
      @apply flex items-center px-4;
    }

    .ax-toolbar-right {
      @apply flex items-center gap-1;
    }

    .ax-toolbar-menu-button {
      @apply -ml-2 lg:hidden;
    }

    .ax-toolbar-title {
      @apply ml-4;
    }

    /* Dark mode */
    :host-context(.dark) .ax-toolbar {
      @apply border-gray-700;
    }
  `]
})
export class ToolbarComponent {
  @Input() showMenuButton = true;
  @Input() showSearch = true;
  @Input() showNotifications = true;
  @Input() showThemeToggle = true;
  @Input() showUserMenu = true;
  
  @Output() toggleMenu = new EventEmitter<void>();
  @Output() searchClick = new EventEmitter<void>();
  @Output() notificationsClick = new EventEmitter<void>();
  
  private _configService = inject(AegisxConfigService);
  
  isDarkMode = this._configService.isDarkMode;
  
  toggleTheme(): void {
    this._configService.toggleScheme();
  }
}