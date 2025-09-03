import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ClassicLayoutComponent,
  AegisxNavigationService,
  AegisxConfigService,
  AegisxNavigationItem,
} from '@aegisx/ui';

interface Notification {
  id: number;
  title: string;
  time: string;
  icon: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    ClassicLayoutComponent,
  ],
  selector: 'ax-root',
  template: `
    <ax-classic-layout>
      <!-- Toolbar Title -->
      <div toolbar-title class="flex items-center">
        <span class="text-xl font-bold">AegisX Platform</span>
        <span class="ml-2 text-xs px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded">
          v2.0
        </span>
      </div>
      
      <!-- Toolbar Actions -->
      <div toolbar-actions class="flex items-center space-x-2">
        <!-- Search Button -->
        <button mat-icon-button matTooltip="Search" class="hidden sm:inline-flex">
          <mat-icon>search</mat-icon>
        </button>
        
        <!-- Notifications -->
        <button 
          mat-icon-button 
          matTooltip="Notifications"
          [matBadge]="notificationCount()" 
          matBadgeColor="warn"
          [matBadgeHidden]="notificationCount() === 0"
          [matMenuTriggerFor]="notificationMenu"
        >
          <mat-icon>notifications</mat-icon>
        </button>
        
        <!-- User Menu -->
        <button 
          mat-icon-button 
          [matMenuTriggerFor]="userMenu"
          class="ml-2"
        >
          <mat-icon>account_circle</mat-icon>
        </button>
        
        <!-- Settings -->
        <button 
          mat-icon-button 
          matTooltip="Settings"
          routerLink="/settings"
        >
          <mat-icon>settings</mat-icon>
        </button>
      </div>
      
      <!-- Main Content -->
      <router-outlet></router-outlet>
    </ax-classic-layout>
    
    <!-- Notification Menu -->
    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="px-4 py-2 border-b dark:border-gray-700">
        <p class="font-semibold">Notifications</p>
      </div>
      <div class="max-h-80 overflow-y-auto">
        @if (notifications().length === 0) {
          <div class="px-4 py-8 text-center text-gray-500">
            <mat-icon class="text-4xl">inbox</mat-icon>
            <p class="mt-2">No new notifications</p>
          </div>
        } @else {
          @for (notification of notifications(); track notification.id) {
            <button mat-menu-item class="notification-item">
              <mat-icon [ngClass]="getNotificationClass(notification.type)">{{ notification.icon }}</mat-icon>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium">{{ notification.title }}</p>
                <p class="text-xs text-gray-500">{{ notification.time }}</p>
              </div>
            </button>
          }
        }
      </div>
      <mat-divider></mat-divider>
      <button mat-menu-item routerLink="/notifications" class="text-center">
        <span class="text-primary">View All Notifications</span>
      </button>
    </mat-menu>
    
    <!-- User Menu -->
    <mat-menu #userMenu="matMenu">
      <div class="px-4 py-3 border-b dark:border-gray-700">
        <p class="text-sm font-medium">John Doe</p>
        <p class="text-xs text-gray-500">john.doe@example.com</p>
      </div>
      <button mat-menu-item routerLink="/profile">
        <mat-icon>person</mat-icon>
        <span>My Profile</span>
      </button>
      <button mat-menu-item routerLink="/account">
        <mat-icon>manage_accounts</mat-icon>
        <span>Account Settings</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="toggleTheme()">
        <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        <span>{{ isDarkMode() ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
      <button mat-menu-item routerLink="/help">
        <mat-icon>help</mat-icon>
        <span>Help & Support</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()" class="text-red-600">
        <mat-icon class="text-red-600">logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      .notification-menu {
        width: 320px;
      }

      .notification-item {
        min-height: 64px;
        padding: 12px 16px;
      }

      ::ng-deep .mat-mdc-menu-panel {
        max-width: 320px;
      }

      .text-warn {
        @apply text-orange-600 dark:text-orange-400;
      }
      .text-error {
        @apply text-red-600 dark:text-red-400;
      }
      .text-success {
        @apply text-green-600 dark:text-green-400;
      }
      .text-info {
        @apply text-blue-600 dark:text-blue-400;
      }
    `,
  ],
})
export class App implements OnInit {
  private navigationService = inject(AegisxNavigationService);
  private configService = inject(AegisxConfigService);

  protected title = 'AegisX Platform';

  // Signals
  notifications = signal<Notification[]>([
    {
      id: 1,
      title: 'New user registered',
      time: '5 minutes ago',
      icon: 'person_add',
      type: 'info',
    },
    {
      id: 2,
      title: 'System backup completed',
      time: '1 hour ago',
      icon: 'backup',
      type: 'success',
    },
    {
      id: 3,
      title: 'API rate limit warning',
      time: '2 hours ago',
      icon: 'warning',
      type: 'warning',
    },
  ]);

  notificationCount = signal(3);
  isDarkMode = signal(false);

  ngOnInit(): void {
    // Set up navigation
    const navigationItems = this.getNavigationItems();
    this.navigationService.setNavigation({
      default: navigationItems,
      compact: navigationItems,
      horizontal: navigationItems,
      mobile: navigationItems,
    });

    // Configure theme
    this.configService.updateConfig({
      theme: 'default',
      scheme: 'auto',
      layout: 'classic',
    });

    // Check current theme
    const currentScheme = this.configService.config().scheme;
    this.isDarkMode.set(currentScheme === 'dark');
  }

  getNotificationClass(type: string): string {
    const classes: Record<string, string> = {
      info: 'text-info',
      warning: 'text-warn',
      error: 'text-error',
      success: 'text-success',
    };
    return classes[type] || '';
  }

  toggleTheme(): void {
    const newScheme = this.isDarkMode() ? 'light' : 'dark';
    this.isDarkMode.set(!this.isDarkMode());
    this.configService.updateConfig({ scheme: newScheme });
  }

  logout(): void {
    console.log('Logging out...');
    // Implement logout logic
  }

  private getNavigationItems(): AegisxNavigationItem[] {
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/dashboard',
        badge: {
          title: 'New',
          classes: 'px-2 bg-primary-600 text-white rounded-full',
        },
      },
      {
        id: 'management',
        title: 'Management',
        type: 'group',
        children: [
          {
            id: 'users',
            title: 'Users',
            type: 'basic',
            icon: 'heroicons_outline:users',
            link: '/users',
          },
          {
            id: 'roles',
            title: 'Roles & Permissions',
            type: 'basic',
            icon: 'heroicons_outline:shield-check',
            link: '/roles',
          },
          {
            id: 'teams',
            title: 'Teams',
            type: 'basic',
            icon: 'heroicons_outline:user-group',
            link: '/teams',
          },
        ],
      },
      {
        id: 'analytics',
        title: 'Analytics',
        type: 'collapsable',
        icon: 'heroicons_outline:chart-bar',
        children: [
          {
            id: 'analytics.overview',
            title: 'Overview',
            type: 'basic',
            link: '/analytics/overview',
          },
          {
            id: 'analytics.reports',
            title: 'Reports',
            type: 'basic',
            link: '/analytics/reports',
            badge: {
              title: '3',
              classes: 'px-2 bg-warn-600 text-white rounded-full',
            },
          },
          {
            id: 'analytics.realtime',
            title: 'Real-time',
            type: 'basic',
            link: '/analytics/realtime',
          },
        ],
      },
      {
        id: 'communication',
        title: 'Communication',
        type: 'collapsable',
        icon: 'heroicons_outline:chat-alt-2',
        children: [
          {
            id: 'messages',
            title: 'Messages',
            type: 'basic',
            link: '/messages',
            badge: {
              title: '12',
              classes: 'px-2 bg-accent-600 text-white rounded-full',
            },
          },
          {
            id: 'notifications',
            title: 'Notifications',
            type: 'basic',
            link: '/notifications',
          },
          {
            id: 'announcements',
            title: 'Announcements',
            type: 'basic',
            link: '/announcements',
          },
        ],
      },
      {
        id: 'content',
        title: 'Content',
        type: 'collapsable',
        icon: 'heroicons_outline:document-text',
        children: [
          {
            id: 'pages',
            title: 'Pages',
            type: 'basic',
            link: '/pages',
          },
          {
            id: 'media',
            title: 'Media Library',
            type: 'basic',
            link: '/media',
          },
          {
            id: 'files',
            title: 'File Manager',
            type: 'basic',
            link: '/files',
          },
        ],
      },
      {
        id: 'divider-1',
        title: '',
        type: 'divider',
      },
      {
        id: 'system',
        title: 'System',
        type: 'group',
        children: [
          {
            id: 'settings',
            title: 'Settings',
            type: 'basic',
            icon: 'heroicons_outline:cog',
            link: '/settings',
          },
          {
            id: 'audit',
            title: 'Audit Logs',
            type: 'basic',
            icon: 'heroicons_outline:clipboard-list',
            link: '/audit',
          },
          {
            id: 'api',
            title: 'API Management',
            type: 'basic',
            icon: 'heroicons_outline:code',
            link: '/api',
          },
        ],
      },
      {
        id: 'help',
        title: 'Help & Support',
        type: 'group',
        children: [
          {
            id: 'help.documentation',
            title: 'Documentation',
            type: 'basic',
            icon: 'heroicons_outline:book-open',
            link: '/docs',
            externalLink: true,
            target: '_blank',
          },
          {
            id: 'help.api',
            title: 'API Reference',
            type: 'basic',
            icon: 'heroicons_outline:code',
            link: 'http://localhost:3335/api-docs',
            externalLink: true,
            target: '_blank',
          },
          {
            id: 'help.support',
            title: 'Support Center',
            type: 'basic',
            icon: 'heroicons_outline:support',
            link: '/support',
          },
        ],
      },
    ];
  }
}
