import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
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
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Welcome back, {{ getUserName() }}! 👋</h1>
          <p class="hero-subtitle">
            Your enterprise platform for building scalable applications with
            modern technology stack.
          </p>
          <div class="hero-actions">
            <button
              mat-raised-button
              color="primary"
              (click)="navigateTo('/profile')"
            >
              <mat-icon>person</mat-icon>
              View Profile
            </button>
            @if (hasSettingsPermission()) {
              <button mat-stroked-button (click)="navigateTo('/settings')">
                <mat-icon>settings</mat-icon>
                Settings
              </button>
            }
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Quick Actions -->
        <section class="section">
          <h2 class="section-title">Quick Actions</h2>
          <div class="quick-actions-grid">
            @for (action of filteredQuickActions(); track action.title) {
              <mat-card
                appearance="outlined"
                class="quick-action-card"
                (click)="navigateTo(action.route)"
              >
                <mat-card-content>
                  <div class="action-icon-wrapper">
                    <mat-icon>{{ action.icon }}</mat-icon>
                  </div>
                  <h3 class="action-title">{{ action.title }}</h3>
                  <p class="action-description">{{ action.description }}</p>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </section>

        <!-- Features Highlight -->
        <section class="section">
          <h2 class="section-title">Platform Features</h2>
          <div class="features-grid">
            @for (feature of features(); track feature.title) {
              <mat-card appearance="outlined" class="feature-card">
                <mat-card-content>
                  <div class="feature-icon-wrapper">
                    <mat-icon>{{ feature.icon }}</mat-icon>
                  </div>
                  <div>
                    <h3 class="feature-title">{{ feature.title }}</h3>
                    <p class="feature-description">{{ feature.description }}</p>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </section>

        <section class="section">
          <div class="info-cards-grid">
            <!-- Getting Started -->
            <mat-card
              appearance="outlined"
              class="info-card info-card--primary"
            >
              <mat-card-content>
                <div class="info-icon-wrapper">
                  <mat-icon>rocket_launch</mat-icon>
                </div>
                <h3 class="info-title">Getting Started</h3>
                <p class="info-description">
                  New to the platform? Check out our quick start guide to learn
                  about key features.
                </p>
                <button mat-button disabled class="info-button">
                  <mat-icon>menu_book</mat-icon>
                  View Documentation (Coming Soon)
                </button>
              </mat-card-content>
            </mat-card>

            <!-- Need Help? -->
            <mat-card appearance="outlined" class="info-card info-card--accent">
              <mat-card-content>
                <div class="info-icon-wrapper">
                  <mat-icon>support_agent</mat-icon>
                </div>
                <h3 class="info-title">Need Help?</h3>
                <p class="info-description">
                  Our support team is here to help you with any questions or
                  issues.
                </p>
                <button mat-button disabled class="info-button">
                  <mat-icon>email</mat-icon>
                  Contact Support (Coming Soon)
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .home-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-height: 100%;
        background-color: var(--ax-background-muted);
      }

      /* ===== HERO SECTION ===== */
      .hero-section {
        background-color: var(--ax-background-default);
        border-bottom: 1px solid var(--ax-border-default);
        padding: var(--ax-spacing-3xl) var(--ax-spacing-lg);
      }

      .hero-content {
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
      }

      .hero-title {
        margin: 0 0 var(--ax-spacing-sm) 0;
        font-size: var(--ax-font-size-3xl);
        font-weight: var(--ax-font-weight-semibold);
        color: var(--ax-text-heading);
        letter-spacing: -0.02em;
      }

      .hero-subtitle {
        margin: 0 0 var(--ax-spacing-2xl) 0;
        font-size: var(--ax-font-size-md);
        color: var(--ax-text-subtle);
        max-width: 640px;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.5;
      }

      .hero-actions {
        display: flex;
        justify-content: center;
        gap: var(--ax-spacing-md);
        flex-wrap: wrap;
      }

      /* ===== MAIN CONTENT ===== */
      .main-content {
        flex: 1;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
        padding: var(--ax-spacing-3xl) var(--ax-spacing-lg);
      }

      .section {
        margin-bottom: var(--ax-spacing-3xl);

        &:last-child {
          margin-bottom: 0;
        }
      }

      .section-title {
        margin: 0 0 var(--ax-spacing-lg) 0;
        font-size: var(--ax-font-size-2xl);
        font-weight: var(--ax-font-weight-semibold);
        color: var(--ax-text-heading);
        letter-spacing: -0.02em;
      }

      /* ===== QUICK ACTIONS GRID ===== */
      .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: var(--ax-spacing-md);
      }

      .quick-action-card {
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.2, 0, 0, 1);
        background-color: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--ax-shadow-md);
          border-color: var(--ax-brand-muted);
        }

        ::ng-deep .mat-mdc-card-content {
          padding: var(--ax-spacing-lg) !important;
          text-align: center;
        }
      }

      .action-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        margin: 0 auto var(--ax-spacing-md);
        background-color: var(--ax-brand-subtle);
        border-radius: var(--ax-radius-lg);

        mat-icon {
          color: var(--ax-brand-emphasis);
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      .action-title {
        margin: 0 0 var(--ax-spacing-xs) 0;
        font-size: var(--ax-font-size-md);
        font-weight: var(--ax-font-weight-semibold);
        color: var(--ax-text-heading);
      }

      .action-description {
        margin: 0;
        font-size: var(--ax-font-size-sm);
        color: var(--ax-text-subtle);
        line-height: 1.4;
      }

      /* ===== FEATURES GRID ===== */
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--ax-spacing-md);
      }

      .feature-card {
        background-color: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);

        ::ng-deep .mat-mdc-card-content {
          padding: var(--ax-spacing-lg) !important;
          display: flex;
          gap: var(--ax-spacing-md);
          align-items: flex-start;
        }
      }

      .feature-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        background-color: var(--ax-success-subtle);
        border-radius: var(--ax-radius-md);

        mat-icon {
          color: var(--ax-success-emphasis);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .feature-title {
        margin: 0 0 var(--ax-spacing-2xs) 0;
        font-size: var(--ax-font-size-md);
        font-weight: var(--ax-font-weight-semibold);
        color: var(--ax-text-heading);
      }

      .feature-description {
        margin: 0;
        font-size: var(--ax-font-size-sm);
        color: var(--ax-text-subtle);
        line-height: 1.4;
      }

      /* ===== INFO CARDS GRID ===== */
      .info-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--ax-spacing-md);
      }

      .info-card {
        background-color: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);

        ::ng-deep .mat-mdc-card-content {
          padding: var(--ax-spacing-lg) !important;
          display: flex;
          flex-direction: column;
          gap: var(--ax-spacing-sm);
        }

        &.info-card--primary {
          background-color: var(--ax-brand-subtle);
          border-color: var(--ax-brand-muted);

          .info-title {
            color: var(--ax-brand-emphasis);
          }

          .info-description {
            color: var(--ax-text-default);
          }

          .info-icon-wrapper {
            background-color: var(--ax-brand-muted);

            mat-icon {
              color: var(--ax-brand-emphasis);
            }
          }

          .info-button {
            color: var(--ax-brand-emphasis);
          }
        }

        &.info-card--accent {
          background-color: var(--ax-info-subtle);
          border-color: var(--ax-info-muted);

          .info-title {
            color: var(--ax-info-emphasis);
          }

          .info-description {
            color: var(--ax-text-default);
          }

          .info-icon-wrapper {
            background-color: var(--ax-info-muted);

            mat-icon {
              color: var(--ax-info-emphasis);
            }
          }

          .info-button {
            color: var(--ax-info-emphasis);
          }
        }
      }

      .info-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: var(--ax-radius-lg);

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      .info-title {
        margin: 0;
        font-size: var(--ax-font-size-lg);
        font-weight: var(--ax-font-weight-semibold);
      }

      .info-description {
        margin: 0;
        font-size: var(--ax-font-size-sm);
        line-height: 1.5;
      }

      .info-button {
        align-self: flex-start;
        text-transform: none;

        mat-icon {
          margin-right: var(--ax-spacing-xs);
        }
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 768px) {
        .hero-section {
          padding: var(--ax-spacing-2xl) var(--ax-spacing-md);
        }

        .hero-title {
          font-size: var(--ax-font-size-2xl);
        }

        .hero-subtitle {
          font-size: var(--ax-font-size-sm);
        }

        .main-content {
          padding: var(--ax-spacing-2xl) var(--ax-spacing-md);
        }

        .section-title {
          font-size: var(--ax-font-size-xl);
        }

        .quick-actions-grid {
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: var(--ax-spacing-sm);
        }

        .features-grid {
          grid-template-columns: 1fr;
        }

        .info-cards-grid {
          grid-template-columns: 1fr;
        }
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
    },
    {
      title: 'User Management',
      description: 'Manage users, roles and permissions',
      icon: 'people',
      route: '/users',
      permissions: ['users:read', '*:*'],
    },
    {
      title: 'Settings',
      description: 'Configure system preferences',
      icon: 'settings',
      route: '/settings',
      permissions: ['settings:view', '*:*'],
    },
    {
      title: 'API Keys',
      description: 'Manage your API keys and tokens',
      icon: 'key',
      route: '/settings/api-keys',
      permissions: ['api-keys:read', '*:*'],
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
