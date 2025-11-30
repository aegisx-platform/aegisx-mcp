import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AxThemeSwitcherComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
} from '../../../../../../components/docs';

@Component({
  selector: 'ax-theme-switcher-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    AxThemeSwitcherComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="theme-switcher-doc">
      <ax-doc-header
        title="Theme Switcher"
        icon="palette"
        description="A dropdown component for switching between light and dark themes, integrating with AxThemeService."
        [breadcrumbs]="[
          {
            label: 'Utilities',
            link: '/docs/components/aegisx/utilities/theme-switcher',
          },
          { label: 'Theme Switcher' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxThemeSwitcherComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="doc-tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Basic Usage</h2>
              <p>
                Theme Switcher provides a button that opens a menu with theme
                options. Click to toggle between light and dark modes.
              </p>

              <ax-live-preview variant="bordered">
                <div class="preview-container">
                  <ax-theme-switcher></ax-theme-switcher>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="doc-section">
              <h2>Features</h2>
              <ul class="feature-list">
                <li>
                  <mat-icon>check_circle</mat-icon>
                  <span>Multiple theme presets (light/dark variants)</span>
                </li>
                <li>
                  <mat-icon>check_circle</mat-icon>
                  <span>Quick toggle between light and dark modes</span>
                </li>
                <li>
                  <mat-icon>check_circle</mat-icon>
                  <span>Persists theme preference to localStorage</span>
                </li>
                <li>
                  <mat-icon>check_circle</mat-icon>
                  <span>Integrates with AxThemeService</span>
                </li>
              </ul>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>In Toolbar</h2>
              <p>
                Theme Switcher is commonly placed in the application toolbar for
                easy access.
              </p>

              <ax-live-preview variant="bordered">
                <div class="toolbar-example">
                  <div class="toolbar-spacer"></div>
                  <ax-theme-switcher></ax-theme-switcher>
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Component API</h2>
              <p>
                The Theme Switcher component has no inputs or outputs. It
                automatically integrates with the AxThemeService to manage theme
                state.
              </p>

              <h3>Methods</h3>
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
                      <td><code>selectTheme(themeId: string)</code></td>
                      <td>Select a specific theme by ID</td>
                    </tr>
                    <tr>
                      <td><code>toggleDarkMode()</code></td>
                      <td>Toggle between light and dark variants</td>
                    </tr>
                    <tr>
                      <td><code>isDarkMode()</code></td>
                      <td>Returns true if current theme is dark mode</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="doc-section">
              <h2>AxThemeService</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property/Method</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>themes</code></td>
                      <td><code>Theme[]</code></td>
                      <td>Available theme options</td>
                    </tr>
                    <tr>
                      <td><code>currentTheme</code></td>
                      <td><code>Signal&lt;Theme&gt;</code></td>
                      <td>Currently active theme</td>
                    </tr>
                    <tr>
                      <td><code>setTheme(themeId)</code></td>
                      <td><code>void</code></td>
                      <td>Set the active theme</td>
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
                    <li>Place in toolbar for easy access</li>
                    <li>Respect user's system preference</li>
                    <li>Persist theme choice across sessions</li>
                    <li>Ensure all components support theming</li>
                  </ul>
                </div>
                <div class="guideline dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Hide the theme switcher in deep menus</li>
                    <li>Override user's saved preference</li>
                    <li>Use hard-coded colors that ignore themes</li>
                    <li>Create jarring theme transitions</li>
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
      .theme-switcher-doc {
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

        h3 {
          font-size: var(--ax-text-lg);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: var(--ax-spacing-lg) 0 var(--ax-spacing-sm) 0;
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
        justify-content: center;
        padding: var(--ax-spacing-lg);
      }

      .toolbar-example {
        display: flex;
        align-items: center;
        padding: var(--ax-spacing-md);
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-md);
        width: 100%;
      }

      .toolbar-spacer {
        flex: 1;
      }

      .feature-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          display: flex;
          align-items: center;
          gap: var(--ax-spacing-sm);
          padding: var(--ax-spacing-xs) 0;
          font-size: var(--ax-text-sm);
          color: var(--ax-text-primary);

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: var(--ax-success-default);
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
export class ThemeSwitcherDocComponent {
  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-theme-switcher></ax-theme-switcher>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxThemeSwitcherComponent } from '@aegisx/ui';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [AxThemeSwitcherComponent],
  template: \`
    <div class="toolbar">
      <span>My App</span>
      <div class="spacer"></div>
      <ax-theme-switcher></ax-theme-switcher>
    </div>
  \`,
})
export class ToolbarComponent {}`,
    },
  ];
}
