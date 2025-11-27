import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  AxSkeletonComponent,
  AxSkeletonCardComponent,
  AxSkeletonAvatarComponent,
  AxSkeletonTableComponent,
  AxSkeletonListComponent,
} from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken, CodeTab } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-skeleton-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    AxSkeletonComponent,
    AxSkeletonCardComponent,
    AxSkeletonAvatarComponent,
    AxSkeletonTableComponent,
    AxSkeletonListComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="skeleton-doc">
      <ax-doc-header
        title="Skeleton Loader"
        description="Placeholder components that show a loading animation while content is being fetched. Improve perceived performance with skeleton screens."
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          { label: 'Components', link: '/docs/components' },
          { label: 'Feedback', link: '/docs/components/feedback/alert' },
          { label: 'Skeleton' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxSkeletonComponent } from '&#64;aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="skeleton-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>Basic Variants</h2>
              <p>
                Choose from different variants based on the content being
                loaded.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                gap="var(--ax-spacing-lg)"
              >
                <div class="demo-row">
                  <div class="demo-item">
                    <span class="demo-label">Text</span>
                    <ax-skeleton variant="text" width="200px"></ax-skeleton>
                  </div>
                  <div class="demo-item">
                    <span class="demo-label">Circular</span>
                    <ax-skeleton
                      variant="circular"
                      width="48px"
                      height="48px"
                    ></ax-skeleton>
                  </div>
                  <div class="demo-item">
                    <span class="demo-label">Rectangular</span>
                    <ax-skeleton
                      variant="rectangular"
                      width="120px"
                      height="80px"
                    ></ax-skeleton>
                  </div>
                  <div class="demo-item">
                    <span class="demo-label">Rounded</span>
                    <ax-skeleton
                      variant="rounded"
                      width="120px"
                      height="80px"
                    ></ax-skeleton>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>Animation Types</h2>
              <p>Two animation styles are available: pulse and wave.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                gap="var(--ax-spacing-xl)"
              >
                <div class="demo-item">
                  <span class="demo-label">Pulse (default)</span>
                  <ax-skeleton
                    variant="rounded"
                    width="200px"
                    height="100px"
                    animation="pulse"
                  ></ax-skeleton>
                </div>
                <div class="demo-item">
                  <span class="demo-label">Wave</span>
                  <ax-skeleton
                    variant="rounded"
                    width="200px"
                    height="100px"
                    animation="wave"
                  ></ax-skeleton>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="animationCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>Multi-line Text</h2>
              <p>
                Create multiple text lines with automatic last line width
                reduction.
              </p>

              <ax-live-preview variant="bordered">
                <ax-skeleton
                  variant="text"
                  [lines]="3"
                  width="300px"
                ></ax-skeleton>
              </ax-live-preview>

              <ax-code-tabs [tabs]="multilineCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Presets Tab -->
        <mat-tab label="Presets">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>Card Skeleton</h2>
              <p>Pre-configured skeleton for card layouts.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                gap="var(--ax-spacing-lg)"
              >
                <div style="width: 280px;">
                  <ax-skeleton-card></ax-skeleton-card>
                </div>
                <div style="width: 280px;">
                  <ax-skeleton-card [showActions]="true"></ax-skeleton-card>
                </div>
                <div style="width: 320px;">
                  <ax-skeleton-card
                    [horizontal]="true"
                    [showImage]="true"
                  ></ax-skeleton-card>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="cardPresetCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>Avatar Skeleton</h2>
              <p>Pre-configured skeleton for user profiles.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                gap="var(--ax-spacing-xl)"
              >
                <ax-skeleton-avatar size="sm"></ax-skeleton-avatar>
                <ax-skeleton-avatar size="md"></ax-skeleton-avatar>
                <ax-skeleton-avatar
                  size="lg"
                  [showSubtitle]="true"
                ></ax-skeleton-avatar>
              </ax-live-preview>

              <ax-code-tabs [tabs]="avatarPresetCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>Table Skeleton</h2>
              <p>Pre-configured skeleton for table rows.</p>

              <ax-live-preview variant="bordered">
                <ax-skeleton-table [rows]="4" [columns]="4"></ax-skeleton-table>
              </ax-live-preview>

              <ax-code-tabs [tabs]="tablePresetCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>List Skeleton</h2>
              <p>Pre-configured skeleton for list items.</p>

              <ax-live-preview variant="bordered">
                <div style="width: 320px;">
                  <ax-skeleton-list [items]="3"></ax-skeleton-list>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="listPresetCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>AxSkeletonComponent</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>variant</code></td>
                      <td>'text' | 'circular' | 'rectangular' | 'rounded'</td>
                      <td>'text'</td>
                      <td>Shape of the skeleton</td>
                    </tr>
                    <tr>
                      <td><code>animation</code></td>
                      <td>'pulse' | 'wave' | 'none'</td>
                      <td>'pulse'</td>
                      <td>Animation type</td>
                    </tr>
                    <tr>
                      <td><code>width</code></td>
                      <td>string</td>
                      <td>'100%'</td>
                      <td>Width (CSS value)</td>
                    </tr>
                    <tr>
                      <td><code>height</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Height (CSS value)</td>
                    </tr>
                    <tr>
                      <td><code>lines</code></td>
                      <td>number</td>
                      <td>1</td>
                      <td>Number of lines (text variant)</td>
                    </tr>
                    <tr>
                      <td><code>lastLineWidth</code></td>
                      <td>string</td>
                      <td>'60%'</td>
                      <td>Width of the last line</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Design Tokens Tab -->
        <mat-tab label="Design Tokens">
          <div class="skeleton-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .skeleton-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .skeleton-doc__tabs {
        margin-top: 2rem;
      }

      .skeleton-doc__tab-content {
        padding: 1.5rem 0;
      }

      .skeleton-doc__section {
        margin-bottom: 3rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
      }

      .demo-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
      }

      .demo-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .demo-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--ax-text-subtle);
        text-transform: uppercase;
      }

      .api-table {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;

          th,
          td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--ax-border-default);
          }

          th {
            font-weight: 600;
            color: var(--ax-text-heading);
            background: var(--ax-background-subtle);
          }

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: var(--ax-radius-sm);
            font-size: 0.8125rem;
          }
        }
      }
    `,
  ],
})
export class SkeletonDocComponent {
  readonly basicCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Text skeleton -->
<ax-skeleton variant="text" width="200px"></ax-skeleton>

<!-- Circular (avatar) -->
<ax-skeleton variant="circular" width="48px" height="48px"></ax-skeleton>

<!-- Rectangular (image placeholder) -->
<ax-skeleton variant="rectangular" width="120px" height="80px"></ax-skeleton>

<!-- Rounded (card) -->
<ax-skeleton variant="rounded" width="120px" height="80px"></ax-skeleton>`,
    },
  ];

  readonly animationCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Pulse animation (default) -->
<ax-skeleton animation="pulse"></ax-skeleton>

<!-- Wave animation -->
<ax-skeleton animation="wave"></ax-skeleton>

<!-- No animation -->
<ax-skeleton animation="none"></ax-skeleton>`,
    },
  ];

  readonly multilineCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Multiple lines with automatic last line width -->
<ax-skeleton variant="text" [lines]="3" width="300px"></ax-skeleton>

<!-- Custom last line width -->
<ax-skeleton variant="text" [lines]="4" lastLineWidth="40%"></ax-skeleton>`,
    },
  ];

  readonly cardPresetCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Basic card skeleton -->
<ax-skeleton-card></ax-skeleton-card>

<!-- With actions -->
<ax-skeleton-card [showActions]="true"></ax-skeleton-card>

<!-- Horizontal layout -->
<ax-skeleton-card [horizontal]="true"></ax-skeleton-card>

<!-- Without image -->
<ax-skeleton-card [showImage]="false"></ax-skeleton-card>`,
    },
  ];

  readonly avatarPresetCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Small avatar -->
<ax-skeleton-avatar size="sm"></ax-skeleton-avatar>

<!-- Medium with subtitle -->
<ax-skeleton-avatar size="md" [showSubtitle]="true"></ax-skeleton-avatar>

<!-- Large -->
<ax-skeleton-avatar size="lg"></ax-skeleton-avatar>

<!-- Without text -->
<ax-skeleton-avatar [showText]="false"></ax-skeleton-avatar>`,
    },
  ];

  readonly tablePresetCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Table skeleton -->
<ax-skeleton-table [rows]="5" [columns]="4"></ax-skeleton-table>

<!-- Without header -->
<ax-skeleton-table [rows]="3" [showHeader]="false"></ax-skeleton-table>`,
    },
  ];

  readonly listPresetCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- List skeleton -->
<ax-skeleton-list [items]="3"></ax-skeleton-list>

<!-- Without avatar -->
<ax-skeleton-list [items]="3" [showAvatar]="false"></ax-skeleton-list>

<!-- With action button placeholder -->
<ax-skeleton-list [items]="3" [showAction]="true"></ax-skeleton-list>`,
    },
  ];

  readonly designTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'Skeleton background color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Preview/card background',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-sm',
      usage: 'Text skeleton radius',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-lg',
      usage: 'Rounded skeleton radius',
    },
    {
      category: 'Borders',
      cssVar: '--ax-border-default',
      usage: 'Preset component borders',
    },
  ];
}
