import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AxCardComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-card-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    AxCardComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="card-doc">
      <ax-doc-header
        title="Card"
        description="Container component for grouping related content with consistent styling and semantic color variants."
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          {
            label: 'Components',
            link: '/docs/components/data-display/overview',
          },
          {
            label: 'Data Display',
            link: '/docs/components/data-display/overview',
          },
          { label: 'Card' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxCardComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="card-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="card-doc__tab-content">
            <section class="card-doc__section">
              <h2>Basic Usage</h2>
              <p>
                The Card component provides a flexible container with consistent
                styling. Use it to group related content like form sections,
                data displays, or action areas.
              </p>

              <ax-live-preview variant="bordered">
                <ax-card title="Card Title" subtitle="Card subtitle text">
                  <p>
                    This is the card body content. You can place any content
                    here including text, forms, or other components.
                  </p>
                </ax-card>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="card-doc__section">
              <h2>Variants</h2>
              <p>
                Cards support different visual variants for various use cases.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-lg)"
              >
                <ax-card
                  variant="default"
                  title="Default"
                  class="card-doc__demo-card"
                >
                  <p>Default card style</p>
                </ax-card>

                <ax-card
                  variant="outlined"
                  title="Outlined"
                  class="card-doc__demo-card"
                >
                  <p>Card with border only</p>
                </ax-card>

                <ax-card
                  variant="elevated"
                  title="Elevated"
                  class="card-doc__demo-card"
                >
                  <p>Card with shadow</p>
                </ax-card>
              </ax-live-preview>

              <ax-code-tabs [tabs]="variantsCode"></ax-code-tabs>
            </section>

            <section class="card-doc__section">
              <h2>Color Variants</h2>
              <p>Use semantic colors to convey meaning.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-md)"
              >
                <ax-card
                  color="primary"
                  colorIntensity="subtle"
                  title="Primary"
                  class="card-doc__demo-card"
                >
                  <p>Primary color card</p>
                </ax-card>

                <ax-card
                  color="success"
                  colorIntensity="subtle"
                  title="Success"
                  class="card-doc__demo-card"
                >
                  <p>Success color card</p>
                </ax-card>

                <ax-card
                  color="warning"
                  colorIntensity="subtle"
                  title="Warning"
                  class="card-doc__demo-card"
                >
                  <p>Warning color card</p>
                </ax-card>

                <ax-card
                  color="error"
                  colorIntensity="subtle"
                  title="Error"
                  class="card-doc__demo-card"
                >
                  <p>Error color card</p>
                </ax-card>

                <ax-card
                  color="info"
                  colorIntensity="subtle"
                  title="Info"
                  class="card-doc__demo-card"
                >
                  <p>Info color card</p>
                </ax-card>
              </ax-live-preview>
            </section>

            <section class="card-doc__section">
              <h2>Sizes</h2>
              <p>Control the card size with the size input.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-lg)"
              >
                <ax-card size="sm" title="Small" class="card-doc__demo-card">
                  <p>size="sm"</p>
                </ax-card>

                <ax-card size="md" title="Medium" class="card-doc__demo-card">
                  <p>size="md" (default)</p>
                </ax-card>

                <ax-card size="lg" title="Large" class="card-doc__demo-card">
                  <p>size="lg"</p>
                </ax-card>
              </ax-live-preview>
            </section>

            <section class="card-doc__section">
              <h2>Interactive Cards</h2>
              <p>Add hover and click effects for interactive cards.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                gap="var(--ax-spacing-lg)"
              >
                <ax-card
                  [hoverable]="true"
                  title="Hoverable"
                  class="card-doc__demo-card"
                >
                  <p>Hover to see effect</p>
                </ax-card>

                <ax-card
                  [clickable]="true"
                  title="Clickable"
                  class="card-doc__demo-card"
                >
                  <p>Click to interact</p>
                </ax-card>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="card-doc__tab-content">
            <section class="card-doc__section">
              <h2>Profile Card</h2>
              <ax-live-preview variant="bordered">
                <ax-card variant="outlined" class="card-doc__profile-card">
                  <div class="profile-content">
                    <div class="profile-avatar">JD</div>
                    <div class="profile-info">
                      <h4>John Doe</h4>
                      <span>Software Engineer</span>
                      <p>Full-stack developer with 5+ years of experience.</p>
                    </div>
                  </div>
                  <div class="profile-actions">
                    <button mat-button>View Profile</button>
                    <button mat-flat-button color="primary">Connect</button>
                  </div>
                </ax-card>
              </ax-live-preview>
            </section>

            <section class="card-doc__section">
              <h2>Stats Cards</h2>
              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-lg)"
              >
                <ax-card variant="outlined" class="card-doc__stats-card">
                  <div class="stats-content">
                    <mat-icon class="stats-icon stats-icon--success"
                      >trending_up</mat-icon
                    >
                    <div class="stats-info">
                      <span class="stats-value">12,543</span>
                      <span class="stats-label">Total Users</span>
                    </div>
                  </div>
                </ax-card>

                <ax-card variant="outlined" class="card-doc__stats-card">
                  <div class="stats-content">
                    <mat-icon class="stats-icon stats-icon--brand"
                      >shopping_cart</mat-icon
                    >
                    <div class="stats-info">
                      <span class="stats-value">$45,231</span>
                      <span class="stats-label">Revenue</span>
                    </div>
                  </div>
                </ax-card>

                <ax-card variant="outlined" class="card-doc__stats-card">
                  <div class="stats-content">
                    <mat-icon class="stats-icon stats-icon--warning"
                      >schedule</mat-icon
                    >
                    <div class="stats-info">
                      <span class="stats-value">24</span>
                      <span class="stats-label">Pending Orders</span>
                    </div>
                  </div>
                </ax-card>
              </ax-live-preview>
            </section>

            <section class="card-doc__section">
              <h2>File Card</h2>
              <ax-live-preview variant="bordered">
                <ax-card
                  variant="outlined"
                  [hoverable]="true"
                  [clickable]="true"
                  class="card-doc__file-card"
                >
                  <mat-icon>folder</mat-icon>
                  <h4>Project Files</h4>
                  <p>12 files, 2.4 MB</p>
                </ax-card>
              </ax-live-preview>
            </section>

            <section class="card-doc__section">
              <h2>Alert Card</h2>
              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
                gap="var(--ax-spacing-md)"
              >
                <ax-card color="warning" colorIntensity="subtle">
                  <div class="alert-card-content">
                    <mat-icon>warning</mat-icon>
                    <div>
                      <strong>Action Required</strong>
                      <p>
                        Please update your payment method before the next
                        billing cycle.
                      </p>
                    </div>
                  </div>
                </ax-card>

                <ax-card color="success" colorIntensity="subtle">
                  <div class="alert-card-content">
                    <mat-icon>check_circle</mat-icon>
                    <div>
                      <strong>Payment Successful</strong>
                      <p>Your order #12345 has been confirmed.</p>
                    </div>
                  </div>
                </ax-card>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="card-doc__tab-content">
            <section class="card-doc__section">
              <h2>Properties</h2>
              <div class="card-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>variant</code></td>
                      <td><code>'default' | 'outlined' | 'elevated'</code></td>
                      <td><code>'default'</code></td>
                      <td>Visual style of the card</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td><code>'sm' | 'md' | 'lg'</code></td>
                      <td><code>'md'</code></td>
                      <td>Card size (affects padding)</td>
                    </tr>
                    <tr>
                      <td><code>color</code></td>
                      <td>
                        <code
                          >'default' | 'primary' | 'success' | 'warning' |
                          'error' | 'info' | 'neutral'</code
                        >
                      </td>
                      <td><code>'default'</code></td>
                      <td>Semantic color variant</td>
                    </tr>
                    <tr>
                      <td><code>colorIntensity</code></td>
                      <td><code>'filled' | 'subtle'</code></td>
                      <td><code>'filled'</code></td>
                      <td>Color intensity level</td>
                    </tr>
                    <tr>
                      <td><code>title</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Card title text</td>
                    </tr>
                    <tr>
                      <td><code>subtitle</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Card subtitle text</td>
                    </tr>
                    <tr>
                      <td><code>hoverable</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Adds hover effect</td>
                    </tr>
                    <tr>
                      <td><code>clickable</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Adds click cursor</td>
                    </tr>
                    <tr>
                      <td><code>loading</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Shows loading state</td>
                    </tr>
                    <tr>
                      <td><code>borderWidth</code></td>
                      <td><code>'1' | '2' | '3' | '4' | string</code></td>
                      <td><code>'1'</code></td>
                      <td>Border width (supports custom values)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="card-doc__section">
              <h2>Content Projection</h2>
              <p>
                Card content is projected via <code>ng-content</code>. Use the
                title and subtitle inputs for standard headers, or project
                custom content for complex layouts.
              </p>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="card-doc__tab-content">
            <ax-component-tokens [tokens]="cardTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="card-doc__tab-content">
            <section class="card-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="card-doc__guidelines">
                <div class="card-doc__guideline card-doc__guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Use cards to group related content</li>
                    <li>Keep card content focused on a single topic</li>
                    <li>
                      Use consistent card variants within the same context
                    </li>
                    <li>
                      Add clear titles when the content purpose isn't obvious
                    </li>
                    <li>Use hoverable/clickable for interactive cards</li>
                  </ul>
                </div>

                <div class="card-doc__guideline card-doc__guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Nest cards more than one level deep</li>
                    <li>Use cards for every piece of content</li>
                    <li>Mix too many different card variants on one page</li>
                    <li>Overload cards with too much content</li>
                    <li>Use elevated cards in already elevated surfaces</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="card-doc__section">
              <h2>Accessibility</h2>
              <ul class="card-doc__a11y-list">
                <li>
                  Clickable cards should be focusable and have appropriate ARIA
                  roles
                </li>
                <li>Use semantic heading elements for card titles</li>
                <li>
                  Ensure sufficient color contrast between card background and
                  content
                </li>
                <li>Card actions should be keyboard accessible</li>
              </ul>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .card-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .card-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .card-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .card-doc__section {
        margin-bottom: var(--ax-spacing-3xl, 3rem);

        h2 {
          font-size: var(--ax-text-xl, 1.25rem);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 var(--ax-spacing-sm, 0.5rem) 0;
        }

        > p {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin: 0 0 var(--ax-spacing-lg, 1rem) 0;
          max-width: 700px;
        }
      }

      .card-doc__demo-card {
        width: 180px;
        min-height: 80px;
      }

      /* Profile Card Example */
      .card-doc__profile-card {
        max-width: 320px;
      }

      .profile-content {
        display: flex;
        gap: var(--ax-spacing-md, 0.75rem);
        margin-bottom: var(--ax-spacing-md, 0.75rem);
      }

      .profile-avatar {
        width: 48px;
        height: 48px;
        border-radius: var(--ax-radius-full);
        background: var(--ax-brand-default);
        color: var(--ax-brand-inverted);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        flex-shrink: 0;
      }

      .profile-info {
        h4 {
          margin: 0;
          font-size: var(--ax-text-base, 1rem);
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        span {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
        }

        p {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin: var(--ax-spacing-xs, 0.25rem) 0 0 0;
        }
      }

      .profile-actions {
        display: flex;
        gap: var(--ax-spacing-sm, 0.5rem);
        justify-content: flex-end;
        padding-top: var(--ax-spacing-sm, 0.5rem);
        border-top: 1px solid var(--ax-border-default);
      }

      /* Stats Card Example */
      .card-doc__stats-card {
        width: 180px;
      }

      .stats-content {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md, 0.75rem);
      }

      .stats-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .stats-icon--success {
        color: var(--ax-success-default);
      }
      .stats-icon--brand {
        color: var(--ax-brand-default);
      }
      .stats-icon--warning {
        color: var(--ax-warning-default);
      }

      .stats-info {
        display: flex;
        flex-direction: column;
      }

      .stats-value {
        font-size: var(--ax-text-xl, 1.25rem);
        font-weight: 700;
        color: var(--ax-text-heading);
      }

      .stats-label {
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-text-secondary);
      }

      /* File Card */
      .card-doc__file-card {
        width: 160px;
        text-align: center;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: var(--ax-brand-default);
          margin-bottom: var(--ax-spacing-sm, 0.5rem);
        }

        h4 {
          margin: 0;
          font-size: var(--ax-text-sm, 0.875rem);
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          margin: var(--ax-spacing-xs, 0.25rem) 0 0 0;
          font-size: var(--ax-text-xs, 0.75rem);
          color: var(--ax-text-secondary);
        }
      }

      /* Alert Card */
      .alert-card-content {
        display: flex;
        gap: var(--ax-spacing-md, 0.75rem);
        align-items: flex-start;

        mat-icon {
          flex-shrink: 0;
        }

        strong {
          display: block;
          margin-bottom: var(--ax-spacing-xs, 0.25rem);
        }

        p {
          margin: 0;
          font-size: var(--ax-text-sm, 0.875rem);
        }
      }

      /* API Table */
      .card-doc__api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg, 0.75rem);

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          text-align: left;
          padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-md, 0.75rem);
          border-bottom: 1px solid var(--ax-border-default);
        }

        th {
          background: var(--ax-background-subtle);
          font-size: var(--ax-text-xs, 0.75rem);
          font-weight: 600;
          color: var(--ax-text-secondary);
          text-transform: uppercase;
        }

        td {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-primary);
        }

        td code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs, 0.75rem);
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm, 0.25rem);
        }

        tr:last-child td {
          border-bottom: none;
        }
      }

      /* Guidelines */
      .card-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .card-doc__guideline {
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

      .card-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .card-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      .card-doc__a11y-list {
        margin: 0;
        padding-left: var(--ax-spacing-lg, 1rem);

        li {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin-bottom: var(--ax-spacing-sm, 0.5rem);
        }
      }
    `,
  ],
})
export class CardDocComponent {
  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-card title="Card Title" subtitle="Card subtitle">
  <p>Card content goes here.</p>
</ax-card>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxCardComponent } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [AxCardComponent],
  template: \`
    <ax-card title="My Card">
      <p>Content here</p>
    </ax-card>
  \`,
})
export class MyComponent {}`,
    },
  ];

  variantsCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Default -->
<ax-card variant="default" title="Default">
  Content
</ax-card>

<!-- Outlined -->
<ax-card variant="outlined" title="Outlined">
  Content
</ax-card>

<!-- Elevated -->
<ax-card variant="elevated" title="Elevated">
  Content
</ax-card>`,
    },
  ];

  cardTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Card surface background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-default',
      usage: 'Card border color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'Subtle color intensity',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-heading',
      usage: 'Title text color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-secondary',
      usage: 'Subtitle text color',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-lg',
      usage: 'Card corner rounding',
    },
    {
      category: 'Shadows',
      cssVar: '--ax-shadow-sm',
      usage: 'Elevated variant shadow',
    },
    {
      category: 'Shadows',
      cssVar: '--ax-shadow-md',
      usage: 'Hover state shadow',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-sm',
      usage: 'Small size padding',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-md',
      usage: 'Medium size padding',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-lg',
      usage: 'Large size padding',
    },
  ];
}
