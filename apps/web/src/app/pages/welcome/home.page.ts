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
              <mat-card class="feature-card">
                <mat-card-content>
                  <div class="feature-icon-wrapper">
                    <mat-icon>{{ feature.icon }}</mat-icon>
                  </div>
                  <h3 class="feature-title">{{ feature.title }}</h3>
                  <p class="feature-description">{{ feature.description }}</p>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </section>


        <section class="section">
          <div class="info-cards-grid">
            <!-- Getting Started -->
    <!-- Info Cards -->
          <mat-card class="info-card info-card--primary">
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
            <mat-card class="info-card info-card--accent">
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
        background-color: var(--md-sys-color-background, #fffbfe);
      }

      /* ===== HERO SECTION ===== */
      .hero-section {
        background-color: var(--md-sys-color-surface, #fffbfe);
        border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
        padding: 48px 24px;
      }

      .hero-content {
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
      }

      .hero-title {
        margin: 0 0 8px 0;
        font-size: 32px;
        font-weight: 600;
        color: var(--md-sys-color-on-background, #1c1b1f);
        letter-spacing: -0.5px;
      }

      .hero-subtitle {
        margin: 0 0 32px 0;
        font-size: 16px;
        color: var(--md-sys-color-on-surface-variant, #49454e);
        max-width: 640px;
        line-height: 1.5;
      }

      .hero-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      /* ===== MAIN CONTENT ===== */
      .main-content {
        flex: 1;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
        padding: 48px 24px;
      }

      .section {
        margin-bottom: 48px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .section-title {
        margin: 0 0 24px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--md-sys-color-on-background, #1c1b1f);
        letter-spacing: -0.5px;
      }

      /* ===== QUICK ACTIONS GRID ===== */
      .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }

      .quick-action-card {
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.2, 0, 0, 1);
        background-color: var(--md-sys-color-surface, #fffbfe);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        mat-card-content {
          padding: 24px;
          text-align: center;
        }
      }

      .action-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        margin: 0 auto 16px;
        background-color: var(--md-sys-color-primary-container, #eaddff);
        border-radius: 12px;

        mat-icon {
          color: var(--md-sys-color-primary, #6750a4);
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      .action-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--md-sys-color-on-surface, #1c1b1f);
      }

      .action-description {
        margin: 0;
        font-size: 14px;
        color: var(--md-sys-color-on-surface-variant, #49454e);
        line-height: 1.4;
      }

      /* ===== FEATURES GRID ===== */
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      .feature-card {
        background-color: var(--md-sys-color-surface, #fffbfe);

        mat-card-content {
          padding: 24px;
          display: flex;
          gap: 16px;
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
        background-color: var(--md-sys-color-secondary-container, #e8def8);
        border-radius: 8px;

        mat-icon {
          color: var(--md-sys-color-secondary, #625b71);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .feature-title {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--md-sys-color-on-surface, #1c1b1f);
      }

      .feature-description {
        margin: 0;
        font-size: 14px;
        color: var(--md-sys-color-on-surface-variant, #49454e);
        line-height: 1.4;
      }

      /* ===== INFO CARDS GRID ===== */
      .info-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
      }

      .info-card {


        mat-card-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        &.info-card--primary {


          .info-title {
            color: var(--md-sys-color-on-primary-container, #21005e);
          }

          .info-description {
            color: var(--md-sys-color-on-primary-container, #21005e);
          }

          .info-button {
            color: var(--md-sys-color-primary, #6750a4);
          }
        }

        &.info-card--accent {


          .info-title {
            color: var(--md-sys-color-on-tertiary-container, #370b1e);
          }

          .info-description {
            color: var(--md-sys-color-on-tertiary-container, #370b1e);
          }

          .info-button {
            color: var(--md-sys-color-tertiary, #7d5260);
          }
        }
      }

      .info-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 12px;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      .info-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .info-description {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
      }

      .info-button {
        align-self: flex-start;
        text-transform: none;

        mat-icon {
          margin-right: 8px;
        }
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 768px) {
        .hero-section {
          padding: 32px 16px;
        }

        .hero-title {
          font-size: 24px;
        }

        .hero-subtitle {
          font-size: 14px;
        }

        .main-content {
          padding: 32px 16px;
        }

        .section-title {
          font-size: 20px;
        }

        .quick-actions-grid {
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
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
