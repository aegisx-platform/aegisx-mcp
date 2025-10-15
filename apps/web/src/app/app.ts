import { AxCompactLayoutComponent } from '@aegisx/ui';
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth';
import { NavigationService } from './core/navigation';
import { WebSocketService } from './shared/business/services/websocket.service';

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
    AxCompactLayoutComponent,
  ],
  selector: 'ax-root',
  template: `
    @if (shouldShowLayout()) {
      <ax-compact-layout
        [navigation]="navigation()"
        [appName]="'AegisX Platform'"
        [appVersion]="'v2.0'"
        [isDarkMode]="isDarkMode()"
      >
        <!-- Navigation Header -->
        <ng-template #navigationHeader>
          <div class="flex   items-center   pb-0">
            <span
              style="letter-spacing: 3px;"
              class="text-2xl font-bold  text-white"
              >AEGIS<span class="text-green-500">X</span></span
            >
            <span
              class="ml-2 text-xs px-2 py-1 bg-primary-600 text-white rounded"
            >
              v2.0
            </span>
          </div>
        </ng-template>

        <!-- Toolbar Title -->
        <ng-template #toolbarTitle>
          <span class="text-xl font-bold">AegisX Platform</span>
        </ng-template>

        <!-- Toolbar Actions -->
        <ng-template #toolbarActions>
          <!-- Theme Toggle -->
          <button
            mat-icon-button
            matTooltip="Toggle theme"
            (click)="toggleTheme()"
            class="mr-1"
          >
            <mat-icon>
              {{ isDarkMode() ? 'light_mode' : 'dark_mode' }}
            </mat-icon>
          </button>

          <!-- Notifications -->
          <button
            mat-icon-button
            [matBadge]="notifications().length"
            matBadgeColor="warn"
            matBadgeSize="small"
            [matMenuTriggerFor]="notificationMenu"
            class="mr-1"
          >
            <mat-icon>notifications</mat-icon>
          </button>

          <mat-menu #notificationMenu="matMenu" class="w-80">
            <div class="p-4 border-b">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Notifications</h3>
                <button mat-button color="primary" class="min-w-0">
                  Mark all as read
                </button>
              </div>
            </div>

            @for (notification of notifications(); track notification.id) {
              <button
                mat-menu-item
                class="h-auto py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div class="flex items-start w-full">
                  <mat-icon [class]="getNotificationClass(notification.type)">
                    {{ notification.icon }}
                  </mat-icon>
                  <div class="ml-3 flex-1">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {{ notification.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ notification.time }}
                    </p>
                  </div>
                </div>
              </button>
            } @empty {
              <div class="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            }

            <div class="p-2 border-t">
              <button mat-button color="primary" class="w-full">
                View all notifications
              </button>
            </div>
          </mat-menu>

          <!-- User Menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="ml-2">
            <img
              [src]="
                currentUser()?.avatar || '/assets/images/avatars/default.png'
              "
              [alt]="currentUser()?.name || 'User'"
              class="border-2 border-white shadow-sm"
            />
          </button>

          <mat-menu #userMenu="matMenu" class="w-64">
            <div class="p-4 border-b">
              <div class="flex items-center">
                <img
                  [src]="
                    currentUser()?.avatar ||
                    '/assets/images/avatars/default.png'
                  "
                  [alt]="currentUser()?.name || 'User'"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div class="ml-3">
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {{ currentUser()?.name || 'Guest User' }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ currentUser()?.email || 'guest@example.com' }}
                  </p>
                </div>
              </div>
            </div>

            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sign out</span>
            </button>
          </mat-menu>
        </ng-template>

        <!-- Footer Content -->
        <ng-template #footerContent>
          <span class="text-secondary font-medium">
            AegisX Platform &copy; {{ currentYear }} - Enterprise Ready Solution
          </span>
        </ng-template>
      </ax-compact-layout>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  styles: [
    `
      /* Force navigation bar avatar image to be perfectly round */
      button[mat-icon-button] img {
        width: 32px !important;
        height: 32px !important;
        min-width: 32px !important;
        min-height: 32px !important;
        max-width: 32px !important;
        max-height: 32px !important;
        border-radius: 50% !important;
        clip-path: circle(50%) !important;
        object-fit: cover !important;
        display: block !important;
        flex-shrink: 0 !important;
        overflow: hidden !important;
      }

      /* Additional fallback */
      .mat-mdc-icon-button img {
        border-radius: 50% !important;
        clip-path: circle(50%) !important;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private navigationService = inject(NavigationService);
  private websocketService = inject(WebSocketService);

  isDarkMode = signal(false);
  shouldShowLayout = signal(true);
  currentUser = computed(() => {
    const user = this.authService.currentUser();
    console.log('Current User:', user);
    if (user) {
      return {
        name: this.authService.userDisplayName(),
        email: user.email,
        avatar: (user as any).avatar || null, // Get avatar from user data
      };
    }
    return null;
  });
  notifications = signal<Notification[]>([]);
  currentYear = new Date().getFullYear();

  // Navigation Items (loaded only when layout is shown)
  navigation = computed(() => {
    if (this.shouldShowLayout()) {
      // Load navigation only when layout should be shown
      return this.navigationService.navigationItems();
    }
    return [];
  });

  ngOnInit() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode.set(savedTheme === 'dark');
    this.applyTheme();

    // Check routes to determine if layout should be shown
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Hide layout for auth routes
        const authRoutes = [
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
        ];
        const shouldHideLayout = authRoutes.some((route) =>
          event.url.startsWith(route),
        );
        this.shouldShowLayout.set(!shouldHideLayout);

        // Load navigation only when entering protected routes
        if (!shouldHideLayout && this.authService.isAuthenticated()) {
          this.navigationService.loadNavigation().subscribe();
        }
      });

    // Check initial route
    const currentUrl = this.router.url;
    const authRoutes = [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
    ];
    const shouldHideLayout = authRoutes.some((route) =>
      currentUrl.startsWith(route),
    );
    this.shouldShowLayout.set(!shouldHideLayout);

    // Load navigation for initial protected route
    if (!shouldHideLayout && this.authService.isAuthenticated()) {
      this.navigationService.loadNavigation().subscribe();
    }

    // Initialize WebSocket connection for authenticated users
    if (this.authService.isAuthenticated() && this.authService.accessToken()) {
      console.log('🔌 Initializing WebSocket connection on app startup');
      this.initializeWebSocket();
    }

    // Current user is now loaded from AuthService via computed signal

    // Load sample notifications
    this.notifications.set([
      {
        id: 1,
        title: 'New order received',
        time: '5 minutes ago',
        icon: 'shopping_cart',
        type: 'success',
      },
      {
        id: 2,
        title: 'Server maintenance scheduled',
        time: '2 hours ago',
        icon: 'warning',
        type: 'warning',
      },
      {
        id: 3,
        title: 'New user registration',
        time: '3 hours ago',
        icon: 'person_add',
        type: 'info',
      },
    ]);
  }

  toggleTheme() {
    this.isDarkMode.update((value) => !value);
    this.applyTheme();
  }

  private applyTheme() {
    const theme = this.isDarkMode() ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }

  getNotificationClass(type: string): string {
    const classes = {
      info: 'text-blue-500',
      warning: 'text-amber-500',
      error: 'text-red-500',
      success: 'text-green-500',
    };
    return classes[type as keyof typeof classes] || 'text-gray-500';
  }

  logout() {
    // Disconnect WebSocket before logout
    this.websocketService.disconnect();

    this.authService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (error) => {
        console.error('Logout error:', error);
        // AuthService will still clear data and navigate
      },
    });
  }

  private initializeWebSocket(): void {
    try {
      const token = this.authService.accessToken();
      if (token) {
        console.log('🔌 Connecting to WebSocket...');
        this.websocketService.connect(token);

        // Subscribe to all real-time features
        setTimeout(() => {
          console.log('📡 Subscribing to real-time features...');
          this.websocketService.subscribe({
            features: ['users', 'rbac', 'products', 'orders'],
          });
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  }
}
