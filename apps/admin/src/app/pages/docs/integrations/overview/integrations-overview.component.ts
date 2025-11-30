import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  DocHeaderComponent,
  LivePreviewComponent,
} from '../../../../components/docs';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'layout' | 'calendar' | 'charts' | 'data' | 'utils';
  package: string;
  version: string;
  wrapper?: string;
  docsUrl: string;
  npmUrl: string;
  status: 'stable' | 'beta' | 'experimental';
}

@Component({
  selector: 'ax-integrations-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    DocHeaderComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="integrations-overview">
      <ax-doc-header
        title="Integrations"
        icon="extension"
        description="Third-party libraries integrated into AegisX UI with custom wrappers and theming support."
        [breadcrumbs]="[{ label: 'Integrations' }]"
        status="stable"
        version="1.0.0"
      ></ax-doc-header>

      <!-- Introduction -->
      <section class="section">
        <h2>Overview</h2>
        <p>
          AegisX UI integrates several powerful third-party libraries to provide
          advanced functionality. Each integration includes a custom wrapper
          component that follows AegisX design system patterns and supports
          light/dark theming.
        </p>
      </section>

      <!-- Categories -->
      <section class="section">
        <h2>Integration Categories</h2>

        <!-- Layout Category -->
        <div class="category">
          <div class="category-header">
            <mat-icon>dashboard</mat-icon>
            <h3>Layout & Grid</h3>
          </div>
          <p class="category-desc">
            Components for creating dynamic, draggable grid layouts
          </p>

          <div class="integrations-grid">
            @for (
              integration of getByCategory('layout');
              track integration.id
            ) {
              <mat-card
                class="integration-card"
                [routerLink]="integration.docsUrl"
              >
                <mat-card-header>
                  <div class="card-icon">
                    <mat-icon>{{ integration.icon }}</mat-icon>
                  </div>
                  <mat-card-title>{{ integration.name }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ integration.package }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ integration.description }}</p>
                  <div class="card-meta">
                    <mat-chip-set>
                      <mat-chip [highlighted]="integration.status === 'stable'">
                        {{ integration.status }}
                      </mat-chip>
                      <mat-chip>v{{ integration.version }}</mat-chip>
                    </mat-chip-set>
                    @if (integration.wrapper) {
                      <div class="wrapper-badge">
                        <mat-icon>widgets</mat-icon>
                        <span>{{ integration.wrapper }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <a
                    mat-button
                    [href]="integration.npmUrl"
                    target="_blank"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon>open_in_new</mat-icon>
                    NPM
                  </a>
                  <button mat-flat-button color="primary">
                    <mat-icon>menu_book</mat-icon>
                    Docs
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        </div>

        <!-- Calendar Category -->
        <div class="category">
          <div class="category-header">
            <mat-icon>calendar_month</mat-icon>
            <h3>Calendar & Scheduling</h3>
          </div>
          <p class="category-desc">
            Full-featured calendar components with event management
          </p>

          <div class="integrations-grid">
            @for (
              integration of getByCategory('calendar');
              track integration.id
            ) {
              <mat-card
                class="integration-card"
                [routerLink]="integration.docsUrl"
              >
                <mat-card-header>
                  <div class="card-icon">
                    <mat-icon>{{ integration.icon }}</mat-icon>
                  </div>
                  <mat-card-title>{{ integration.name }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ integration.package }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ integration.description }}</p>
                  <div class="card-meta">
                    <mat-chip-set>
                      <mat-chip [highlighted]="integration.status === 'stable'">
                        {{ integration.status }}
                      </mat-chip>
                      <mat-chip>v{{ integration.version }}</mat-chip>
                    </mat-chip-set>
                    @if (integration.wrapper) {
                      <div class="wrapper-badge">
                        <mat-icon>widgets</mat-icon>
                        <span>{{ integration.wrapper }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <a
                    mat-button
                    [href]="integration.npmUrl"
                    target="_blank"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon>open_in_new</mat-icon>
                    NPM
                  </a>
                  <button mat-flat-button color="primary">
                    <mat-icon>menu_book</mat-icon>
                    Docs
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        </div>

        <!-- Utils Category -->
        <div class="category">
          <div class="category-header">
            <mat-icon>build</mat-icon>
            <h3>Utilities</h3>
          </div>
          <p class="category-desc">
            Utility components for common tasks like QR codes, file handling,
            and data visualization
          </p>

          <div class="integrations-grid">
            @for (integration of getByCategory('utils'); track integration.id) {
              <mat-card
                class="integration-card"
                [routerLink]="integration.docsUrl"
              >
                <mat-card-header>
                  <div class="card-icon">
                    <mat-icon>{{ integration.icon }}</mat-icon>
                  </div>
                  <mat-card-title>{{ integration.name }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ integration.package }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ integration.description }}</p>
                  <div class="card-meta">
                    <mat-chip-set>
                      <mat-chip [highlighted]="integration.status === 'stable'">
                        {{ integration.status }}
                      </mat-chip>
                      <mat-chip>v{{ integration.version }}</mat-chip>
                    </mat-chip-set>
                    @if (integration.wrapper) {
                      <div class="wrapper-badge">
                        <mat-icon>widgets</mat-icon>
                        <span>{{ integration.wrapper }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <a
                    mat-button
                    [href]="integration.npmUrl"
                    target="_blank"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon>open_in_new</mat-icon>
                    NPM
                  </a>
                  <button mat-flat-button color="primary">
                    <mat-icon>menu_book</mat-icon>
                    Docs
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        </div>
      </section>

      <!-- Why Wrappers Section -->
      <section class="section">
        <h2>Why Custom Wrappers?</h2>
        <ax-live-preview variant="bordered" direction="column">
          <div class="benefits-grid">
            <div class="benefit-card">
              <mat-icon>palette</mat-icon>
              <h4>Consistent Theming</h4>
              <p>
                All integrations use AegisX design tokens and support light/dark
                mode automatically.
              </p>
            </div>
            <div class="benefit-card">
              <mat-icon>code</mat-icon>
              <h4>Simplified API</h4>
              <p>
                Wrapper components provide a cleaner, more intuitive API that
                follows Angular best practices.
              </p>
            </div>
            <div class="benefit-card">
              <mat-icon>verified</mat-icon>
              <h4>Type Safety</h4>
              <p>
                Full TypeScript support with exported types and interfaces for
                better developer experience.
              </p>
            </div>
            <div class="benefit-card">
              <mat-icon>sync</mat-icon>
              <h4>Signals Support</h4>
              <p>
                Modern Angular signal-based reactivity for better performance
                and change detection.
              </p>
            </div>
          </div>
        </ax-live-preview>
      </section>

      <!-- Quick Links -->
      <section class="section">
        <h2>Quick Links</h2>
        <div class="quick-links">
          @for (integration of integrations; track integration.id) {
            <a
              [routerLink]="integration.docsUrl"
              class="quick-link"
              [attr.data-status]="integration.status"
            >
              <mat-icon>{{ integration.icon }}</mat-icon>
              <span>{{ integration.name }}</span>
              <mat-icon class="arrow">arrow_forward</mat-icon>
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .integrations-overview {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .section {
        margin-bottom: 3rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        > p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
          max-width: 800px;
        }
      }

      .category {
        margin-bottom: 2.5rem;
        padding: 1.5rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-xl);

        .category-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            color: var(--ax-primary-default);
          }

          h3 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--ax-text-heading);
          }
        }

        .category-desc {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
      }

      .integrations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
      }

      .integration-card {
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--ax-background-default);

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--ax-shadow-lg);
        }

        mat-card-header {
          .card-icon {
            width: 48px;
            height: 48px;
            border-radius: var(--ax-radius-lg);
            background: var(--ax-primary-faint);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;

            mat-icon {
              font-size: 28px;
              width: 28px;
              height: 28px;
              color: var(--ax-primary-default);
            }
          }
        }

        mat-card-content {
          padding-top: 1rem;

          p {
            color: var(--ax-text-secondary);
            font-size: 0.875rem;
            line-height: 1.5;
            margin-bottom: 1rem;
          }
        }

        .card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
        }

        .wrapper-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: var(--ax-info-faint);
          border-radius: var(--ax-radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--ax-info-default);

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }
        }

        mat-card-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--ax-border-muted);
        }
      }

      .benefits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .benefit-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.5rem;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-muted);

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--ax-primary-default);
        }

        h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          line-height: 1.5;
        }
      }

      .quick-links {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
      }

      .quick-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        text-decoration: none;
        color: var(--ax-text-heading);
        font-weight: 500;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--ax-primary-default);
          background: var(--ax-primary-faint);
          transform: translateX(4px);

          .arrow {
            opacity: 1;
            transform: translateX(4px);
          }
        }

        mat-icon:first-child {
          color: var(--ax-primary-default);
        }

        span {
          flex: 1;
        }

        .arrow {
          opacity: 0;
          transition: all 0.2s ease;
          color: var(--ax-primary-default);
        }

        &[data-status='beta'] {
          mat-icon:first-child {
            color: var(--ax-warning-default);
          }
        }

        &[data-status='experimental'] {
          mat-icon:first-child {
            color: var(--ax-info-default);
          }
        }
      }
    `,
  ],
})
export class IntegrationsOverviewComponent {
  integrations: Integration[] = [
    {
      id: 'gridster',
      name: 'Gridster',
      description:
        'Drag-and-drop grid layout component for building dashboards, launchers, and kanban boards.',
      icon: 'grid_view',
      category: 'layout',
      package: 'angular-gridster2',
      version: '18.0.1',
      wrapper: 'AxGridsterComponent',
      docsUrl: '/docs/integrations/gridster',
      npmUrl: 'https://www.npmjs.com/package/angular-gridster2',
      status: 'stable',
    },
    {
      id: 'fullcalendar',
      name: 'FullCalendar',
      description:
        'Full-featured calendar with month, week, day views, drag & drop events, and API integration.',
      icon: 'calendar_month',
      category: 'calendar',
      package: '@fullcalendar/angular',
      version: '6.1.11',
      wrapper: 'AxCalendarComponent',
      docsUrl: '/docs/components/aegisx/data-display/calendar',
      npmUrl: 'https://www.npmjs.com/package/@fullcalendar/angular',
      status: 'beta',
    },
    {
      id: 'qrcode',
      name: 'QR Code',
      description:
        'Generate QR codes for URLs, text, vCards, WiFi credentials, and custom data with customizable colors and sizes.',
      icon: 'qr_code',
      category: 'utils',
      package: 'angularx-qrcode',
      version: '20.0.0',
      docsUrl: '/docs/integrations/qrcode',
      npmUrl: 'https://www.npmjs.com/package/angularx-qrcode',
      status: 'stable',
    },
  ];

  getByCategory(category: Integration['category']): Integration[] {
    return this.integrations.filter((i) => i.category === category);
  }
}
