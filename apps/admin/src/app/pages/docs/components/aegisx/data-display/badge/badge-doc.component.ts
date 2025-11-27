import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AxBadgeComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-badge-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    AxBadgeComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="badge-doc">
      <ax-doc-header
        title="Badge"
        description="Small status indicators for labeling, categorizing, or highlighting content with semantic colors."
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
          { label: 'Badge' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxBadgeComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="badge-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="badge-doc__tab-content">
            <section class="badge-doc__section">
              <h2>Basic Usage</h2>
              <p>
                Badges display short status text or labels. They adapt their
                colors based on the semantic color variant to convey meaning at
                a glance.
              </p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-sm)">
                <ax-badge>Default</ax-badge>
                <ax-badge type="success">Success</ax-badge>
                <ax-badge type="warning">Warning</ax-badge>
                <ax-badge type="error">Error</ax-badge>
                <ax-badge type="info">Info</ax-badge>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="badge-doc__section">
              <h2>Sizes</h2>
              <p>Badges come in three sizes to fit different contexts.</p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-sm)">
                <ax-badge size="sm">Small</ax-badge>
                <ax-badge size="md">Medium</ax-badge>
                <ax-badge size="lg">Large</ax-badge>
              </ax-live-preview>

              <ax-code-tabs [tabs]="sizesCode"></ax-code-tabs>
            </section>

            <section class="badge-doc__section">
              <h2>With Icons</h2>
              <p>Combine badges with icons for additional visual context.</p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-sm)">
                <ax-badge type="success" icon="check_circle">
                  Completed
                </ax-badge>
                <ax-badge type="warning" icon="schedule"> Pending </ax-badge>
                <ax-badge type="error" icon="error"> Failed </ax-badge>
                <ax-badge type="info" icon="info"> Info </ax-badge>
              </ax-live-preview>
            </section>

            <section class="badge-doc__section">
              <h2>Outlined Style</h2>
              <p>
                Use the outlined style for a lighter, more subtle appearance.
              </p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-sm)">
                <ax-badge variant="outlined">Default</ax-badge>
                <ax-badge variant="outlined" type="success">Success</ax-badge>
                <ax-badge variant="outlined" type="warning">Warning</ax-badge>
                <ax-badge variant="outlined" type="error">Error</ax-badge>
                <ax-badge variant="outlined" type="info">Info</ax-badge>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="badge-doc__tab-content">
            <section class="badge-doc__section">
              <h2>Status Indicators</h2>
              <ax-live-preview
                variant="bordered"
                direction="column"
                align="start"
                gap="var(--ax-spacing-md)"
              >
                <div class="badge-doc__status-row">
                  <span class="badge-doc__status-label">Order Status:</span>
                  <ax-badge type="success">Delivered</ax-badge>
                </div>
                <div class="badge-doc__status-row">
                  <span class="badge-doc__status-label">Payment:</span>
                  <ax-badge type="warning">Pending</ax-badge>
                </div>
                <div class="badge-doc__status-row">
                  <span class="badge-doc__status-label">Account:</span>
                  <ax-badge type="error">Suspended</ax-badge>
                </div>
              </ax-live-preview>
            </section>

            <section class="badge-doc__section">
              <h2>Category Tags</h2>
              <ax-live-preview
                variant="bordered"
                gap="var(--ax-spacing-xs)"
                [wrap]="true"
              >
                <ax-badge variant="outlined">Angular</ax-badge>
                <ax-badge variant="outlined">TypeScript</ax-badge>
                <ax-badge variant="outlined">Material Design</ax-badge>
                <ax-badge variant="outlined">UI/UX</ax-badge>
                <ax-badge variant="outlined">Design System</ax-badge>
              </ax-live-preview>
            </section>

            <section class="badge-doc__section">
              <h2>With Counts</h2>
              <ax-live-preview variant="bordered" gap="var(--ax-spacing-md)">
                <ax-badge type="error" icon="notifications" [counter]="5">
                  Notifications
                </ax-badge>
                <ax-badge type="info" icon="email" [counter]="12">
                  Unread
                </ax-badge>
                <ax-badge type="success" icon="task_alt" [counter]="8">
                  Completed
                </ax-badge>
              </ax-live-preview>
            </section>

            <section class="badge-doc__section">
              <h2>In Context</h2>
              <ax-live-preview variant="bordered">
                <div class="badge-doc__context-card">
                  <div class="context-header">
                    <h4>Project Alpha</h4>
                    <ax-badge type="success" size="sm">Active</ax-badge>
                  </div>
                  <p>Enterprise dashboard redesign project</p>
                  <div class="context-tags">
                    <ax-badge variant="outlined" size="sm">Q4 2024</ax-badge>
                    <ax-badge variant="outlined" size="sm"
                      >High Priority</ax-badge
                    >
                  </div>
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="badge-doc__tab-content">
            <section class="badge-doc__section">
              <h2>Properties</h2>
              <div class="badge-doc__api-table">
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
                      <td>
                        <code>'outlined' | 'soft' | 'outlined-strong'</code>
                      </td>
                      <td><code>'soft'</code></td>
                      <td>Badge visual style</td>
                    </tr>
                    <tr>
                      <td><code>type</code></td>
                      <td>
                        <code
                          >'success' | 'error' | 'warning' | 'info' |
                          'neutral'</code
                        >
                      </td>
                      <td><code>'neutral'</code></td>
                      <td>Semantic color type</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td><code>'sm' | 'md' | 'lg'</code></td>
                      <td><code>'md'</code></td>
                      <td>Badge size</td>
                    </tr>
                    <tr>
                      <td><code>rounded</code></td>
                      <td><code>'none' | 'sm' | 'md' | 'lg' | 'full'</code></td>
                      <td><code>'sm'</code></td>
                      <td>Border radius size</td>
                    </tr>
                    <tr>
                      <td><code>icon</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Material icon name</td>
                    </tr>
                    <tr>
                      <td><code>dot</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Show colored dot indicator</td>
                    </tr>
                    <tr>
                      <td><code>removable</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Show remove button</td>
                    </tr>
                    <tr>
                      <td><code>counter</code></td>
                      <td><code>number</code></td>
                      <td><code>undefined</code></td>
                      <td>Counter value</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="badge-doc__section">
              <h2>Content Projection</h2>
              <p>
                Badge content is projected via <code>ng-content</code>. You can
                include text, icons, or a combination of both.
              </p>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="badge-doc__tab-content">
            <ax-component-tokens [tokens]="badgeTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="badge-doc__tab-content">
            <section class="badge-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="badge-doc__guidelines">
                <div class="badge-doc__guideline badge-doc__guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>
                      Use semantic colors consistently (success=positive,
                      error=negative)
                    </li>
                    <li>Keep badge text short (1-2 words)</li>
                    <li>Use icons to reinforce meaning</li>
                    <li>Group related badges together</li>
                  </ul>
                </div>

                <div class="badge-doc__guideline badge-doc__guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Use too many different variants in one view</li>
                    <li>Put long text in badges</li>
                    <li>Use badges for primary actions</li>
                    <li>Mix filled and outlined badges inconsistently</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="badge-doc__section">
              <h2>When to Use Each Variant</h2>
              <div class="badge-doc__variant-guide">
                <div class="variant-item">
                  <ax-badge type="success">Success</ax-badge>
                  <span>Completed, active, approved, verified states</span>
                </div>
                <div class="variant-item">
                  <ax-badge type="warning">Warning</ax-badge>
                  <span>Pending, in progress, attention needed</span>
                </div>
                <div class="variant-item">
                  <ax-badge type="error">Error</ax-badge>
                  <span>Failed, rejected, critical, blocked states</span>
                </div>
                <div class="variant-item">
                  <ax-badge type="info">Info</ax-badge>
                  <span>Informational, neutral highlights</span>
                </div>
                <div class="variant-item">
                  <ax-badge type="neutral">Neutral</ax-badge>
                  <span>General labels, categories, tags</span>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .badge-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .badge-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .badge-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .badge-doc__section {
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

      /* Status row example */
      .badge-doc__status-row {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md, 0.75rem);
      }

      .badge-doc__status-label {
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-secondary);
        min-width: 100px;
      }

      /* Context card example */
      .badge-doc__context-card {
        padding: var(--ax-spacing-md, 0.75rem);
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg, 0.75rem);
        max-width: 300px;

        .context-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--ax-spacing-xs, 0.25rem);

          h4 {
            margin: 0;
            font-size: var(--ax-text-base, 1rem);
            font-weight: 600;
            color: var(--ax-text-heading);
          }
        }

        p {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin: 0 0 var(--ax-spacing-sm, 0.5rem) 0;
        }

        .context-tags {
          display: flex;
          gap: var(--ax-spacing-xs, 0.25rem);
        }
      }

      /* API Table */
      .badge-doc__api-table {
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
      .badge-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .badge-doc__guideline {
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

      .badge-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .badge-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      /* Variant Guide */
      .badge-doc__variant-guide {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-md, 0.75rem);
      }

      .variant-item {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md, 0.75rem);

        span {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
        }
      }
    `,
  ],
})
export class BadgeDocComponent {
  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-badge>Default</ax-badge>
<ax-badge type="success">Success</ax-badge>
<ax-badge type="warning">Warning</ax-badge>
<ax-badge type="error">Error</ax-badge>
<ax-badge type="info">Info</ax-badge>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxBadgeComponent } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [AxBadgeComponent],
  template: \`
    <ax-badge type="success">Active</ax-badge>
  \`,
})
export class MyComponent {}`,
    },
  ];

  sizesCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-badge size="sm">Small</ax-badge>
<ax-badge size="md">Medium (default)</ax-badge>
<ax-badge size="lg">Large</ax-badge>`,
    },
  ];

  badgeTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-brand-faint',
      usage: 'Default badge background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-emphasis',
      usage: 'Default badge text color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-faint',
      usage: 'Success variant background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-emphasis',
      usage: 'Success variant text',
    },
    {
      category: 'Colors',
      cssVar: '--ax-warning-faint',
      usage: 'Warning variant background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-faint',
      usage: 'Error variant background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-info-faint',
      usage: 'Info variant background',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-full',
      usage: 'Pill-shaped corners',
    },
    {
      category: 'Typography',
      cssVar: '--ax-text-xs',
      usage: 'Small size text',
    },
    {
      category: 'Typography',
      cssVar: '--ax-text-sm',
      usage: 'Medium size text',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-xs',
      usage: 'Horizontal padding',
    },
  ];
}
