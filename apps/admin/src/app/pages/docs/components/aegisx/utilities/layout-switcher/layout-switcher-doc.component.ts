import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AxLayoutSwitcherComponent, LayoutType } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
} from '../../../../../../components/docs';

@Component({
  selector: 'ax-layout-switcher-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    AxLayoutSwitcherComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="layout-switcher-doc">
      <ax-doc-header
        title="Layout Switcher"
        icon="view_quilt"
        description="A dropdown component for switching between different application layouts: Compact, Enterprise, and Empty."
        [breadcrumbs]="[
          {
            label: 'Utilities',
            link: '/docs/components/aegisx/utilities/theme-switcher',
          },
          { label: 'Layout Switcher' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxLayoutSwitcherComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="doc-tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Basic Usage</h2>
              <p>
                Layout Switcher allows users to change the application layout
                dynamically. The selection is persisted to localStorage.
              </p>

              <ax-live-preview variant="bordered">
                <div class="preview-container">
                  <ax-layout-switcher
                    (layoutChange)="onLayoutChange($event)"
                  ></ax-layout-switcher>
                  <span class="selected-layout"
                    >Selected: {{ selectedLayout }}</span
                  >
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="doc-section">
              <h2>Available Layouts</h2>
              <div class="layout-options">
                @for (layout of layoutOptions; track layout.value) {
                  <div class="layout-card">
                    <mat-icon>{{ layout.icon }}</mat-icon>
                    <div class="layout-info">
                      <h4>{{ layout.label }}</h4>
                      <p>{{ layout.description }}</p>
                    </div>
                  </div>
                }
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Outputs</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Output</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>layoutChange</code></td>
                      <td><code>EventEmitter&lt;LayoutType&gt;</code></td>
                      <td>Emits when layout selection changes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="doc-section">
              <h2>LayoutType</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Value</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>'compact'</code></td>
                      <td>Collapsible sidebar with compact navigation</td>
                    </tr>
                    <tr>
                      <td><code>'enterprise'</code></td>
                      <td>Full-featured layout with multiple panels</td>
                    </tr>
                    <tr>
                      <td><code>'empty'</code></td>
                      <td>Minimal layout with no chrome</td>
                    </tr>
                    <tr>
                      <td><code>'docs'</code></td>
                      <td>Documentation-focused layout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="doc-section">
              <h2>Methods</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>selectLayout(layout: LayoutType)</code></td>
                      <td>Programmatically select a layout</td>
                    </tr>
                    <tr>
                      <td><code>currentLayoutLabel()</code></td>
                      <td>Returns the label of current layout</td>
                    </tr>
                    <tr>
                      <td><code>currentLayoutIcon()</code></td>
                      <td>Returns the icon of current layout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Best Practices</h2>
              <div class="guidelines-grid">
                <div class="guideline do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Place in settings or toolbar</li>
                    <li>Remember user's layout preference</li>
                    <li>Provide smooth layout transitions</li>
                    <li>Ensure all layouts work with current route</li>
                  </ul>
                </div>
                <div class="guideline dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Force layout changes unexpectedly</li>
                    <li>Lose user data during layout switch</li>
                    <li>Break navigation when changing layouts</li>
                    <li>Show layouts that don't work for the app</li>
                  </ul>
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
      .layout-switcher-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl);
      }

      .doc-tabs {
        margin-top: var(--ax-spacing-xl);
      }
      .doc-tab-content {
        padding: var(--ax-spacing-xl) 0;
      }

      .doc-section {
        margin-bottom: var(--ax-spacing-3xl);

        h2 {
          font-size: var(--ax-text-xl);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 var(--ax-spacing-sm) 0;
        }

        > p {
          font-size: var(--ax-text-sm);
          color: var(--ax-text-secondary);
          margin: 0 0 var(--ax-spacing-lg) 0;
          max-width: 700px;
        }

        code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs);
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm);
        }
      }

      .preview-container {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-lg);
        padding: var(--ax-spacing-lg);
      }

      .selected-layout {
        font-size: var(--ax-text-sm);
        color: var(--ax-text-secondary);
      }

      .layout-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-md);
      }

      .layout-card {
        display: flex;
        align-items: flex-start;
        gap: var(--ax-spacing-md);
        padding: var(--ax-spacing-lg);
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
          color: var(--ax-brand-default);
        }

        .layout-info {
          h4 {
            font-size: var(--ax-text-base);
            font-weight: 600;
            color: var(--ax-text-heading);
            margin: 0 0 var(--ax-spacing-xs) 0;
          }

          p {
            font-size: var(--ax-text-sm);
            color: var(--ax-text-secondary);
            margin: 0;
          }
        }
      }

      .api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          text-align: left;
          padding: var(--ax-spacing-sm) var(--ax-spacing-md);
          border-bottom: 1px solid var(--ax-border-default);
        }

        th {
          background: var(--ax-background-subtle);
          font-size: var(--ax-text-xs);
          font-weight: 600;
          color: var(--ax-text-secondary);
          text-transform: uppercase;
        }

        td {
          font-size: var(--ax-text-sm);
          color: var(--ax-text-primary);
        }
        tr:last-child td {
          border-bottom: none;
        }
      }

      .guidelines-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg);
      }

      .guideline {
        padding: var(--ax-spacing-lg);
        border-radius: var(--ax-radius-lg);

        h4 {
          display: flex;
          align-items: center;
          gap: var(--ax-spacing-xs);
          font-size: var(--ax-text-base);
          font-weight: 600;
          margin: 0 0 var(--ax-spacing-sm) 0;
          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        ul {
          margin: 0;
          padding-left: var(--ax-spacing-lg);
          li {
            font-size: var(--ax-text-sm);
            margin-bottom: var(--ax-spacing-xs);
          }
        }
      }

      .guideline.do {
        background: var(--ax-success-faint);
        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .guideline.dont {
        background: var(--ax-error-faint);
        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }
    `,
  ],
})
export class LayoutSwitcherDocComponent {
  selectedLayout: LayoutType = 'compact';

  layoutOptions = [
    {
      value: 'compact',
      label: 'Compact Layout',
      icon: 'view_quilt',
      description: 'Collapsible sidebar with compact navigation',
    },
    {
      value: 'enterprise',
      label: 'Enterprise Layout',
      icon: 'dashboard_customize',
      description: 'Full-featured layout with multiple panels',
    },
    {
      value: 'empty',
      label: 'Empty Layout',
      icon: 'crop_free',
      description: 'Minimal layout with no chrome',
    },
  ];

  onLayoutChange(layout: LayoutType): void {
    this.selectedLayout = layout;
  }

  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-layout-switcher (layoutChange)="onLayoutChange($event)"></ax-layout-switcher>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxLayoutSwitcherComponent, LayoutType } from '@aegisx/ui';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [AxLayoutSwitcherComponent],
  template: \`
    <div class="settings">
      <label>Layout</label>
      <ax-layout-switcher (layoutChange)="onLayoutChange($event)"></ax-layout-switcher>
    </div>
  \`,
})
export class SettingsComponent {
  onLayoutChange(layout: LayoutType): void {
    console.log('Layout changed to:', layout);
    // Handle layout change in your app
  }
}`,
    },
  ];
}
