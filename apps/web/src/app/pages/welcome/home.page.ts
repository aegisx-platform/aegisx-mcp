import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/auth/services/auth.service';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  permissions?: string[]; // Optional - if not specified, visible to all
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'ax-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <!-- Hero Section -->
      <div class="relative overflow-hidden bg-white border-b border-slate-200">
        <div
          class="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"
        ></div>
        <div
          class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        >
          <div class="text-center">
            <h1 class="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Welcome back, {{ getUserName() }}! 👋
            </h1>
            <p class="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Your enterprise platform for building scalable applications with
              modern technology stack.
            </p>
            <div class="mt-8 flex justify-center gap-4">
              <button
                mat-raised-button
                color="primary"
                (click)="navigateTo('/profile')"
                class="!bg-blue-600 hover:!bg-blue-700"
              >
                <mat-icon class="mr-2">person</mat-icon>
                View Profile
              </button>
              @if (hasSettingsPermission()) {
                <button mat-stroked-button (click)="navigateTo('/settings')">
                  <mat-icon class="mr-2">settings</mat-icon>
                  Settings
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Quick Actions -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (action of filteredQuickActions(); track action.title) {
              <div
                class="bg-white rounded-xl p-6 border border-slate-200 hover:border-{{
                  action.color
                }}-300 hover:shadow-lg transition-all cursor-pointer group"
                (click)="navigateTo(action.route)"
              >
                <div
                  class="w-12 h-12 rounded-lg bg-{{
                    action.color
                  }}-50 flex items-center justify-center mb-4 group-hover:bg-{{
                    action.color
                  }}-100 transition-colors"
                >
                  <mat-icon class="text-{{ action.color }}-600 !text-2xl">{{
                    action.icon
                  }}</mat-icon>
                </div>
                <h3 class="text-lg font-semibold text-slate-900 mb-2">
                  {{ action.title }}
                </h3>
                <p class="text-sm text-slate-600">{{ action.description }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Features Highlight -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">
            Platform Features
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (feature of features(); track feature.title) {
              <div class="bg-white rounded-xl p-6 border border-slate-200">
                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0"
                  >
                    <mat-icon class="text-blue-600">{{
                      feature.icon
                    }}</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-slate-900 mb-2">
                      {{ feature.title }}
                    </h3>
                    <p class="text-sm text-slate-600">
                      {{ feature.description }}
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Getting Started -->
          <div
            class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
          >
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0"
              >
                <mat-icon class="text-blue-600 !text-2xl"
                  >rocket_launch</mat-icon
                >
              </div>
              <div>
                <h3 class="text-lg font-semibold text-blue-900 mb-2">
                  Getting Started
                </h3>
                <p class="text-sm text-blue-700 mb-4">
                  New to the platform? Check out our quick start guide to learn
                  about key features.
                </p>
                <button mat-button class="!text-blue-700 !font-medium" disabled>
                  <mat-icon class="mr-2">menu_book</mat-icon>
                  View Documentation (Coming Soon)
                </button>
              </div>
            </div>
          </div>

          <!-- Need Help? -->
          <div
            class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
          >
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0"
              >
                <mat-icon class="text-purple-600 !text-2xl"
                  >support_agent</mat-icon
                >
              </div>
              <div>
                <h3 class="text-lg font-semibold text-purple-900 mb-2">
                  Need Help?
                </h3>
                <p class="text-sm text-purple-700 mb-4">
                  Our support team is here to help you with any questions or
                  issues.
                </p>
                <button
                  mat-button
                  class="!text-purple-700 !font-medium"
                  disabled
                >
                  <mat-icon class="mr-2">email</mat-icon>
                  Contact Support (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      // Custom hover effects for dynamic colors
      .hover-border-blue-300:hover {
        border-color: rgb(147 197 253);
      }
      .hover-border-green-300:hover {
        border-color: rgb(134 239 172);
      }
      .hover-border-purple-300:hover {
        border-color: rgb(216 180 254);
      }
      .hover-border-amber-300:hover {
        border-color: rgb(252 211 77);
      }

      .bg-blue-50 {
        background-color: rgb(239 246 255);
      }
      .bg-green-50 {
        background-color: rgb(240 253 244);
      }
      .bg-purple-50 {
        background-color: rgb(250 245 255);
      }
      .bg-amber-50 {
        background-color: rgb(255 251 235);
      }

      .hover-bg-blue-100:hover {
        background-color: rgb(219 234 254);
      }
      .hover-bg-green-100:hover {
        background-color: rgb(220 252 231);
      }
      .hover-bg-purple-100:hover {
        background-color: rgb(243 232 255);
      }
      .hover-bg-amber-100:hover {
        background-color: rgb(254 243 199);
      }

      .text-blue-600 {
        color: rgb(37 99 235);
      }
      .text-green-600 {
        color: rgb(22 163 74);
      }
      .text-purple-600 {
        color: rgb(147 51 234);
      }
      .text-amber-600 {
        color: rgb(217 119 6);
      }
    `,
  ],
})
export class HomePage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  quickActions = signal<QuickAction[]>([
    {
      title: 'My Profile',
      description: 'View and update your profile information',
      icon: 'account_circle',
      route: '/profile',
      color: 'blue',
      // No permissions required - everyone can see their profile
    },
    {
      title: 'User Management',
      description: 'Manage users, roles and permissions',
      icon: 'people',
      route: '/users',
      color: 'green',
      permissions: ['users:read', '*:*'], // Admin or users with user management permission
    },
    {
      title: 'Settings',
      description: 'Configure system preferences',
      icon: 'settings',
      route: '/settings',
      color: 'purple',
      permissions: ['settings:view', '*:*'], // Admin only
    },
    {
      title: 'API Keys',
      description: 'Manage your API keys and tokens',
      icon: 'key',
      route: '/settings/api-keys',
      color: 'amber',
      permissions: ['api-keys:read', '*:*'], // Admin only
    },
  ]);

  // Computed signal to filter quick actions based on user permissions
  filteredQuickActions = computed(() => {
    return this.quickActions().filter((action) => {
      // If no permissions required, show to everyone
      if (!action.permissions || action.permissions.length === 0) {
        return true;
      }
      // Check if user has any of the required permissions (OR logic)
      return action.permissions.some((permission) =>
        this.authService.hasPermission()(permission),
      );
    });
  });

  // Check if user has settings permission for header button
  hasSettingsPermission = computed(() => {
    return (
      this.authService.hasPermission()('settings:view') ||
      this.authService.hasPermission()('*:*')
    );
  });

  features = signal<Feature[]>([
    {
      icon: 'security',
      title: 'Enterprise Security',
      description:
        'Role-based access control with JWT authentication and API key management.',
    },
    {
      icon: 'speed',
      title: 'High Performance',
      description:
        'Built with Angular 19 Signals and Fastify for lightning-fast response times.',
    },
    {
      icon: 'cloud_done',
      title: 'Cloud Ready',
      description:
        'Docker containerized with CI/CD pipelines for seamless deployment.',
    },
    {
      icon: 'analytics',
      title: 'Real-time Monitoring',
      description:
        'System monitoring dashboard with live metrics and performance tracking.',
    },
    {
      icon: 'palette',
      title: 'Modern UI/UX',
      description:
        'Material Design with TailwindCSS for beautiful and responsive interfaces.',
    },
    {
      icon: 'code',
      title: 'Developer Friendly',
      description:
        'TypeScript with full type safety and comprehensive API documentation.',
    },
  ]);

  ngOnInit(): void {
    // Component initialization
  }

  getUserName(): string {
    const user = this.authService.currentUser();
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'User';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
