import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AxKpiCardComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-kpi-card-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    AxKpiCardComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="kpi-card-doc">
      <ax-doc-header
        title="KPI Card"
        description="Specialized card for displaying Key Performance Indicators with support for trends, badges, and visual accents."
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
          { label: 'KPI Card' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxKpiCardComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="kpi-card-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="kpi-card-doc__tab-content">
            <section class="kpi-card-doc__section">
              <h2>Basic Usage</h2>
              <p>
                KPI Cards display key metrics with labels, values, and optional
                change indicators. Perfect for dashboards and analytics views.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-lg)"
              >
                <ax-kpi-card
                  label="Total Revenue"
                  value="$45,231"
                  [change]="12.5"
                  changeLabel="vs last month"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  label="Active Users"
                  value="2,543"
                  [change]="-3.2"
                  changeLabel="vs last week"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  label="Conversion Rate"
                  value="3.42%"
                  [change]="0"
                  changeLabel="no change"
                >
                </ax-kpi-card>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="kpi-card-doc__section">
              <h2>With Badge</h2>
              <p>Display a badge alongside the value for additional context.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-lg)"
              >
                <ax-kpi-card
                  variant="badge"
                  label="Daily Active Users"
                  value="3,450"
                  badge="+12.1%"
                  badgeType="success"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  variant="badge"
                  label="Bounce Rate"
                  value="42.3%"
                  badge="-5.2%"
                  badgeType="error"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  variant="badge"
                  label="Avg. Session"
                  value="4m 32s"
                  badge="stable"
                  badgeType="info"
                >
                </ax-kpi-card>
              </ax-live-preview>
            </section>

            <section class="kpi-card-doc__section">
              <h2>With Accent</h2>
              <p>Add a color accent bar to highlight the card.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-lg)"
              >
                <ax-kpi-card
                  variant="accent"
                  label="Primary Metric"
                  value="1,234"
                  accentColor="primary"
                  accentPosition="left"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  variant="accent"
                  label="Success Metric"
                  value="98.5%"
                  accentColor="success"
                  accentPosition="left"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  variant="accent"
                  label="Warning Metric"
                  value="24"
                  accentColor="warning"
                  accentPosition="top"
                >
                </ax-kpi-card>
              </ax-live-preview>
            </section>

            <section class="kpi-card-doc__section">
              <h2>Visual Indicator</h2>
              <p>Show progress with filled bars for visual feedback.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-lg)"
              >
                <ax-kpi-card
                  variant="visual-indicator"
                  label="Storage Used"
                  value="450 GB"
                  [barsFilled]="2"
                  [barsTotal]="3"
                  barColor="info"
                  supplementary="450/752 GB"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  variant="visual-indicator"
                  label="Tasks Complete"
                  value="75%"
                  [barsFilled]="3"
                  [barsTotal]="4"
                  barColor="success"
                  supplementary="18/24 tasks"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  variant="visual-indicator"
                  label="API Quota"
                  value="90%"
                  [barsFilled]="3"
                  [barsTotal]="3"
                  barColor="warning"
                  supplementary="9,000/10,000 calls"
                >
                </ax-kpi-card>
              </ax-live-preview>
            </section>

            <section class="kpi-card-doc__section">
              <h2>Sizes</h2>
              <p>KPI Cards come in three sizes.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-lg)"
              >
                <ax-kpi-card size="sm" label="Small" value="1,234">
                </ax-kpi-card>

                <ax-kpi-card size="md" label="Medium (default)" value="5,678">
                </ax-kpi-card>

                <ax-kpi-card size="lg" label="Large" value="9,012">
                </ax-kpi-card>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="kpi-card-doc__tab-content">
            <section class="kpi-card-doc__section">
              <h2>Dashboard Grid</h2>
              <ax-live-preview variant="bordered">
                <div class="kpi-card-doc__dashboard-grid">
                  <ax-kpi-card
                    label="Total Revenue"
                    value="$128,430"
                    [change]="8.2"
                    changeLabel="vs last month"
                    accentColor="success"
                    accentPosition="left"
                  >
                  </ax-kpi-card>

                  <ax-kpi-card
                    label="New Customers"
                    value="1,429"
                    [change]="12.5"
                    changeLabel="vs last month"
                    accentColor="primary"
                    accentPosition="left"
                  >
                  </ax-kpi-card>

                  <ax-kpi-card
                    label="Pending Orders"
                    value="42"
                    [change]="-5"
                    changeLabel="vs last week"
                    accentColor="warning"
                    accentPosition="left"
                  >
                  </ax-kpi-card>

                  <ax-kpi-card
                    label="Support Tickets"
                    value="18"
                    [change]="3"
                    changeLabel="open tickets"
                    accentColor="error"
                    accentPosition="left"
                  >
                  </ax-kpi-card>
                </div>
              </ax-live-preview>
            </section>

            <section class="kpi-card-doc__section">
              <h2>Compact Layout</h2>
              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-md)"
              >
                <ax-kpi-card
                  variant="badge"
                  [compact]="true"
                  label="Users"
                  value="12.5K"
                  badge="+8%"
                  badgeType="success"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  variant="badge"
                  [compact]="true"
                  label="Revenue"
                  value="$45K"
                  badge="+12%"
                  badgeType="success"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  variant="badge"
                  [compact]="true"
                  label="Errors"
                  value="23"
                  badge="-5%"
                  badgeType="error"
                >
                </ax-kpi-card>
              </ax-live-preview>
            </section>

            <section class="kpi-card-doc__section">
              <h2>Interactive Cards</h2>
              <ax-live-preview
                variant="bordered"
                direction="row"
                [wrap]="true"
                gap="var(--ax-spacing-lg)"
              >
                <ax-kpi-card
                  [hoverable]="true"
                  [clickable]="true"
                  label="Clickable Card"
                  value="Click me"
                  subtitle="Click for details"
                >
                </ax-kpi-card>

                <ax-kpi-card
                  [hoverable]="true"
                  label="Hoverable Card"
                  value="Hover me"
                  subtitle="Hover to see effect"
                >
                </ax-kpi-card>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="kpi-card-doc__tab-content">
            <section class="kpi-card-doc__section">
              <h2>Properties</h2>
              <div class="kpi-card-doc__api-table">
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
                        <code
                          >'simple' | 'badge' | 'compact' | 'accent' |
                          'visual-indicator'</code
                        >
                      </td>
                      <td><code>'simple'</code></td>
                      <td>Card variant/layout</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td><code>'sm' | 'md' | 'lg'</code></td>
                      <td><code>'md'</code></td>
                      <td>Card size</td>
                    </tr>
                    <tr>
                      <td><code>label</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>KPI label/title</td>
                    </tr>
                    <tr>
                      <td><code>value</code></td>
                      <td><code>string | number</code></td>
                      <td><code>''</code></td>
                      <td>KPI value</td>
                    </tr>
                    <tr>
                      <td><code>subtitle</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Optional subtitle</td>
                    </tr>
                    <tr>
                      <td><code>change</code></td>
                      <td><code>number</code></td>
                      <td><code>undefined</code></td>
                      <td>Change percentage</td>
                    </tr>
                    <tr>
                      <td><code>changeType</code></td>
                      <td><code>'up' | 'down' | 'neutral'</code></td>
                      <td><code>auto</code></td>
                      <td>Change trend (auto-calculated)</td>
                    </tr>
                    <tr>
                      <td><code>changeLabel</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Change label (e.g., "vs last month")</td>
                    </tr>
                    <tr>
                      <td><code>badge</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Badge text</td>
                    </tr>
                    <tr>
                      <td><code>badgeType</code></td>
                      <td>
                        <code
                          >'success' | 'error' | 'warning' | 'info' |
                          'neutral'</code
                        >
                      </td>
                      <td><code>'neutral'</code></td>
                      <td>Badge color type</td>
                    </tr>
                    <tr>
                      <td><code>accentColor</code></td>
                      <td>
                        <code
                          >'primary' | 'info' | 'success' | 'warning' |
                          'error'</code
                        >
                      </td>
                      <td><code>undefined</code></td>
                      <td>Accent bar color</td>
                    </tr>
                    <tr>
                      <td><code>accentPosition</code></td>
                      <td><code>'left' | 'right' | 'top' | 'bottom'</code></td>
                      <td><code>'left'</code></td>
                      <td>Accent bar position</td>
                    </tr>
                    <tr>
                      <td><code>barsFilled</code></td>
                      <td><code>number</code></td>
                      <td><code>0</code></td>
                      <td>Number of filled bars (visual-indicator)</td>
                    </tr>
                    <tr>
                      <td><code>barsTotal</code></td>
                      <td><code>number</code></td>
                      <td><code>3</code></td>
                      <td>Total number of bars</td>
                    </tr>
                    <tr>
                      <td><code>barColor</code></td>
                      <td>
                        <code
                          >'primary' | 'info' | 'success' | 'warning' |
                          'error'</code
                        >
                      </td>
                      <td><code>'info'</code></td>
                      <td>Bar color</td>
                    </tr>
                    <tr>
                      <td><code>supplementary</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Supplementary text (e.g., "450/752")</td>
                    </tr>
                    <tr>
                      <td><code>compact</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Compact spacing</td>
                    </tr>
                    <tr>
                      <td><code>hoverable</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Hover effect</td>
                    </tr>
                    <tr>
                      <td><code>clickable</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Clickable cursor</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="kpi-card-doc__tab-content">
            <ax-component-tokens [tokens]="kpiCardTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="kpi-card-doc__tab-content">
            <section class="kpi-card-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="kpi-card-doc__guidelines">
                <div
                  class="kpi-card-doc__guideline kpi-card-doc__guideline--do"
                >
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Use clear, concise labels</li>
                    <li>Format numbers for readability (1,234 not 1234)</li>
                    <li>Include context with change labels</li>
                    <li>Use consistent variants within a dashboard</li>
                    <li>Choose semantic colors for badges and accents</li>
                  </ul>
                </div>

                <div
                  class="kpi-card-doc__guideline kpi-card-doc__guideline--dont"
                >
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Display too many KPIs at once</li>
                    <li>Use misleading change percentages</li>
                    <li>Mix different card variants randomly</li>
                    <li>Use colors that don't match the metric meaning</li>
                    <li>Truncate important values</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="kpi-card-doc__section">
              <h2>When to Use Each Variant</h2>
              <div class="kpi-card-doc__variant-guide">
                <div class="variant-item">
                  <strong>Simple:</strong>
                  <span>Basic metrics with optional change indicator</span>
                </div>
                <div class="variant-item">
                  <strong>Badge:</strong>
                  <span>Highlight change percentage prominently</span>
                </div>
                <div class="variant-item">
                  <strong>Accent:</strong>
                  <span>Categorize metrics by color/type</span>
                </div>
                <div class="variant-item">
                  <strong>Visual Indicator:</strong>
                  <span>Show progress toward a goal</span>
                </div>
                <div class="variant-item">
                  <strong>Compact:</strong>
                  <span>Dense layouts with many metrics</span>
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
      .kpi-card-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .kpi-card-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .kpi-card-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .kpi-card-doc__section {
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

      /* Dashboard grid */
      .kpi-card-doc__dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
        width: 100%;
      }

      /* API Table */
      .kpi-card-doc__api-table {
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
      .kpi-card-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .kpi-card-doc__guideline {
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

      .kpi-card-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .kpi-card-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      /* Variant Guide */
      .kpi-card-doc__variant-guide {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-sm, 0.5rem);
      }

      .variant-item {
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-secondary);

        strong {
          color: var(--ax-text-heading);
          margin-right: var(--ax-spacing-xs, 0.25rem);
        }
      }
    `,
  ],
})
export class KpiCardDocComponent {
  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-kpi-card
  label="Total Revenue"
  value="$45,231"
  [change]="12.5"
  changeLabel="vs last month">
</ax-kpi-card>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxKpiCardComponent } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [AxKpiCardComponent],
  template: \`
    <ax-kpi-card
      label="Total Revenue"
      value="$45,231"
      [change]="12.5"
      changeLabel="vs last month">
    </ax-kpi-card>
  \`,
})
export class MyComponent {}`,
    },
  ];

  kpiCardTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Card background',
    },
    { category: 'Colors', cssVar: '--ax-border-default', usage: 'Card border' },
    {
      category: 'Colors',
      cssVar: '--ax-text-heading',
      usage: 'Value text color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-secondary',
      usage: 'Label and subtitle color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-default',
      usage: 'Positive change indicator',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-default',
      usage: 'Negative change indicator',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-faint',
      usage: 'Success badge background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-faint',
      usage: 'Error badge background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-default',
      usage: 'Primary accent color',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-lg',
      usage: 'Card corner radius',
    },
    { category: 'Shadows', cssVar: '--ax-shadow-sm', usage: 'Card shadow' },
    { category: 'Spacing', cssVar: '--ax-spacing-md', usage: 'Card padding' },
  ];
}
