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
        icon="view_stream"
        description="Placeholder components that show a loading animation while content is being fetched. Improve perceived performance with skeleton screens."
        [breadcrumbs]="[
          { label: 'Feedback', link: '/docs/components/aegisx/feedback/alert' },
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
                variant="white"
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
                variant="white"
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

              <ax-live-preview variant="white">
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

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>Card Loading State</h2>
              <p>Replace card content with skeleton while data is loading.</p>

              <ax-live-preview
                variant="white"
                direction="row"
                gap="var(--ax-spacing-lg)"
              >
                <div style="width: 280px;">
                  <ax-skeleton-card></ax-skeleton-card>
                </div>
                <div style="width: 280px;">
                  <ax-skeleton-card [showActions]="true"></ax-skeleton-card>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="cardExampleCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>User Profile Loading</h2>
              <p>Display skeleton for user avatars and profile information.</p>

              <ax-live-preview
                variant="white"
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

              <ax-code-tabs [tabs]="avatarExampleCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>Data Table Loading</h2>
              <p>Show skeleton rows while fetching table data.</p>

              <ax-live-preview variant="white">
                <ax-skeleton-table [rows]="4" [columns]="4"></ax-skeleton-table>
              </ax-live-preview>

              <ax-code-tabs [tabs]="tableExampleCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>List Loading</h2>
              <p>Display skeleton items while loading list content.</p>

              <ax-live-preview variant="white">
                <div style="width: 320px;">
                  <ax-skeleton-list [items]="3"></ax-skeleton-list>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="listExampleCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>Mixed Layout</h2>
              <p>
                Combine different skeleton types to match your content layout.
              </p>

              <ax-live-preview
                variant="white"
                direction="column"
                align="stretch"
              >
                <div class="example-layout">
                  <div class="example-header">
                    <ax-skeleton
                      variant="circular"
                      width="40px"
                      height="40px"
                    ></ax-skeleton>
                    <div class="example-header-text">
                      <ax-skeleton variant="text" width="150px"></ax-skeleton>
                      <ax-skeleton variant="text" width="100px"></ax-skeleton>
                    </div>
                  </div>
                  <ax-skeleton
                    variant="rectangular"
                    width="100%"
                    height="200px"
                  ></ax-skeleton>
                  <ax-skeleton
                    variant="text"
                    [lines]="2"
                    width="100%"
                  ></ax-skeleton>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="mixedLayoutCode"></ax-code-tabs>
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
                variant="white"
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
                variant="white"
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

              <ax-live-preview variant="white">
                <ax-skeleton-table [rows]="4" [columns]="4"></ax-skeleton-table>
              </ax-live-preview>

              <ax-code-tabs [tabs]="tablePresetCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>List Skeleton</h2>
              <p>Pre-configured skeleton for list items.</p>

              <ax-live-preview variant="white">
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

            <section class="skeleton-doc__section">
              <h2>AxSkeletonCardComponent</h2>
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
                      <td><code>showImage</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show image placeholder</td>
                    </tr>
                    <tr>
                      <td><code>showActions</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Show action buttons placeholder</td>
                    </tr>
                    <tr>
                      <td><code>horizontal</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Horizontal card layout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="skeleton-doc__section">
              <h2>AxSkeletonAvatarComponent</h2>
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
                      <td><code>size</code></td>
                      <td>'sm' | 'md' | 'lg'</td>
                      <td>'md'</td>
                      <td>Avatar size</td>
                    </tr>
                    <tr>
                      <td><code>showText</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show text lines beside avatar</td>
                    </tr>
                    <tr>
                      <td><code>showSubtitle</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Show subtitle text line</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="skeleton-doc__section">
              <h2>AxSkeletonTableComponent</h2>
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
                      <td><code>rows</code></td>
                      <td>number</td>
                      <td>5</td>
                      <td>Number of rows</td>
                    </tr>
                    <tr>
                      <td><code>columns</code></td>
                      <td>number</td>
                      <td>4</td>
                      <td>Number of columns</td>
                    </tr>
                    <tr>
                      <td><code>showHeader</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show table header</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="skeleton-doc__section">
              <h2>AxSkeletonListComponent</h2>
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
                      <td><code>items</code></td>
                      <td>number</td>
                      <td>3</td>
                      <td>Number of list items</td>
                    </tr>
                    <tr>
                      <td><code>showAvatar</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show avatar placeholder</td>
                    </tr>
                    <tr>
                      <td><code>showAction</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Show action button placeholder</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Design Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="skeleton-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="skeleton-doc__guidelines">
                <div
                  class="skeleton-doc__guideline skeleton-doc__guideline--do"
                >
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Match skeleton shapes to actual content layout</li>
                    <li>Use consistent animation across related components</li>
                    <li>Show skeleton for predictable loading times (< 5s)</li>
                    <li>Maintain similar dimensions to actual content</li>
                    <li>Use presets for common patterns</li>
                  </ul>
                </div>

                <div
                  class="skeleton-doc__guideline skeleton-doc__guideline--dont"
                >
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Use skeleton for very short loading times (< 300ms)</li>
                    <li>Create overly complex skeleton layouts</li>
                    <li>Show skeleton indefinitely without timeout</li>
                    <li>Mix different animation styles on one page</li>
                    <li>Use skeleton for empty states</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="skeleton-doc__section">
              <h2>When to Use Skeleton</h2>
              <div class="skeleton-doc__use-cases">
                <div class="use-case">
                  <mat-icon>check</mat-icon>
                  <div>
                    <strong>Initial page load</strong>
                    <p>Show skeleton while fetching initial data</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>check</mat-icon>
                  <div>
                    <strong>Content refresh</strong>
                    <p>Replace content with skeleton during updates</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>check</mat-icon>
                  <div>
                    <strong>Lazy loading</strong>
                    <p>Show skeleton for below-the-fold content</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>close</mat-icon>
                  <div>
                    <strong>Form submission</strong>
                    <p>Use loading spinner instead</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>close</mat-icon>
                  <div>
                    <strong>Empty state</strong>
                    <p>Use empty state component instead</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="skeleton-doc__section">
              <h2>Accessibility</h2>
              <ul class="skeleton-doc__a11y-list">
                <li>
                  Skeleton components are marked with
                  <code>aria-hidden="true"</code> as they are decorative
                </li>
                <li>
                  Use <code>aria-busy="true"</code> on the container while
                  loading
                </li>
                <li>
                  Provide <code>aria-label</code> on loading containers for
                  screen readers
                </li>
                <li>
                  Animation respects <code>prefers-reduced-motion</code> media
                  query
                </li>
              </ul>
            </section>
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

        > p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
          max-width: 700px;
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

      /* Example Layout */
      .example-layout {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        max-width: 400px;
      }

      .example-header {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .example-header-text {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      /* API Table */
      .api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);

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
            font-size: 0.75rem;
            text-transform: uppercase;
          }

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: var(--ax-radius-sm);
            font-size: 0.8125rem;
          }

          tr:last-child td {
            border-bottom: none;
          }
        }
      }

      /* Guidelines */
      .skeleton-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .skeleton-doc__guideline {
        padding: var(--ax-spacing-lg, 1rem);
        border-radius: var(--ax-radius-lg, 0.75rem);

        h4 {
          display: flex;
          align-items: center;
          gap: var(--ax-spacing-xs, 0.25rem);
          font-size: var(--ax-text-base, 1rem);
          font-weight: 600;
          margin: 0 0 var(--ax-spacing-sm, 0.5rem) 0;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        ul {
          margin: 0;
          padding-left: var(--ax-spacing-lg, 1rem);

          li {
            font-size: var(--ax-text-sm, 0.875rem);
            margin-bottom: var(--ax-spacing-xs, 0.25rem);
          }
        }
      }

      .skeleton-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .skeleton-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      /* Use Cases */
      .skeleton-doc__use-cases {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .use-case {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-md);

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        mat-icon[fontIcon='check'] {
          color: var(--ax-success-default);
        }

        mat-icon[fontIcon='close'] {
          color: var(--ax-error-default);
        }

        div {
          strong {
            display: block;
            font-size: 0.875rem;
            color: var(--ax-text-heading);
          }

          p {
            margin: 0.25rem 0 0;
            font-size: 0.8125rem;
            color: var(--ax-text-secondary);
          }
        }
      }

      /* Accessibility List */
      .skeleton-doc__a11y-list {
        margin: 0;
        padding-left: var(--ax-spacing-lg, 1rem);

        li {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin-bottom: var(--ax-spacing-sm, 0.5rem);
        }

        code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs, 0.75rem);
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm, 0.25rem);
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
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component } from '@angular/core';
import { AxSkeletonComponent } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [AxSkeletonComponent],
  template: \`
    <ax-skeleton variant="text" width="200px"></ax-skeleton>
  \`,
})
export class MyComponent {}`,
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

  readonly cardExampleCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `@if (isLoading) {
  <ax-skeleton-card></ax-skeleton-card>
} @else {
  <my-card [data]="cardData"></my-card>
}`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component, signal } from '@angular/core';
import { AxSkeletonCardComponent } from '@aegisx/ui';

@Component({
  selector: 'app-card-loader',
  standalone: true,
  imports: [AxSkeletonCardComponent],
  template: \`
    @if (isLoading()) {
      <ax-skeleton-card></ax-skeleton-card>
    } @else {
      <div class="card">{{ data() }}</div>
    }
  \`,
})
export class CardLoaderComponent {
  isLoading = signal(true);
  data = signal(null);

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    const response = await fetch('/api/data');
    this.data.set(await response.json());
    this.isLoading.set(false);
  }
}`,
    },
  ];

  readonly avatarExampleCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Different sizes -->
<ax-skeleton-avatar size="sm"></ax-skeleton-avatar>
<ax-skeleton-avatar size="md"></ax-skeleton-avatar>
<ax-skeleton-avatar size="lg"></ax-skeleton-avatar>

<!-- With subtitle -->
<ax-skeleton-avatar size="lg" [showSubtitle]="true"></ax-skeleton-avatar>`,
    },
  ];

  readonly tableExampleCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `@if (isLoading) {
  <ax-skeleton-table [rows]="5" [columns]="4"></ax-skeleton-table>
} @else {
  <table>
    <!-- actual table content -->
  </table>
}`,
    },
  ];

  readonly listExampleCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `@if (isLoading) {
  <ax-skeleton-list [items]="5"></ax-skeleton-list>
} @else {
  <ul>
    @for (item of items; track item.id) {
      <li>{{ item.name }}</li>
    }
  </ul>
}`,
    },
  ];

  readonly mixedLayoutCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<div class="post-skeleton">
  <!-- Header: Avatar + Name -->
  <div class="header">
    <ax-skeleton variant="circular" width="40px" height="40px"></ax-skeleton>
    <div class="header-text">
      <ax-skeleton variant="text" width="150px"></ax-skeleton>
      <ax-skeleton variant="text" width="100px"></ax-skeleton>
    </div>
  </div>

  <!-- Image placeholder -->
  <ax-skeleton variant="rectangular" width="100%" height="200px"></ax-skeleton>

  <!-- Content text -->
  <ax-skeleton variant="text" [lines]="2" width="100%"></ax-skeleton>
</div>`,
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
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-sm',
      usage: 'Gap between skeleton lines',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-md',
      usage: 'Padding in preset components',
    },
  ];
}
