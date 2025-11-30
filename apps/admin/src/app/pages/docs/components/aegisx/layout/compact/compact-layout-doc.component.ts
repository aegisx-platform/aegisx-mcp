import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
} from '../../../../../../components/docs';

@Component({
  selector: 'ax-compact-layout-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="compact-layout-doc">
      <ax-doc-header
        title="Compact Layout"
        icon="view_quilt"
        description="A responsive layout with a collapsible sidebar navigation, toolbar, and main content area. Ideal for dashboard-style applications."
        [breadcrumbs]="[
          { label: 'Layout', link: '/docs/components/aegisx/layout/drawer' },
          { label: 'Compact Layout' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxCompactLayoutComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="doc-tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Layout Structure</h2>
              <p>
                The Compact Layout provides a complete application shell with
                sidebar navigation, toolbar, and main content area. The sidebar
                automatically collapses on mobile devices.
              </p>

              <ax-live-preview variant="bordered">
                <div class="layout-preview">
                  <div class="preview-sidebar">
                    <div class="preview-logo"></div>
                    <div class="preview-nav-item"></div>
                    <div class="preview-nav-item"></div>
                    <div class="preview-nav-item"></div>
                  </div>
                  <div class="preview-main">
                    <div class="preview-toolbar"></div>
                    <div class="preview-content">
                      <div class="preview-placeholder">Main Content Area</div>
                    </div>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="doc-section">
              <h2>Features</h2>
              <ul class="feature-list">
                <li>
                  <mat-icon>check_circle</mat-icon>
                  <span>Collapsible sidebar navigation</span>
                </li>
                <li>
                  <mat-icon>check_circle</mat-icon>
                  <span>Responsive design (auto-collapse on mobile)</span>
                </li>
                <li>
                  <mat-icon>check_circle</mat-icon>
                  <span>Customizable toolbar with template slots</span>
                </li>
                <li>
                  <mat-icon>check_circle</mat-icon>
                  <span>Loading bar integration</span>
                </li>
                <li>
                  <mat-icon>check_circle</mat-icon>
                  <span>Optional footer section</span>
                </li>
              </ul>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Inputs</h2>
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
                      <td><code>navigation</code></td>
                      <td><code>AxNavigationItem[]</code></td>
                      <td><code>[]</code></td>
                      <td>Navigation items for sidebar</td>
                    </tr>
                    <tr>
                      <td><code>showFooter</code></td>
                      <td><code>boolean</code></td>
                      <td><code>true</code></td>
                      <td>Show/hide footer section</td>
                    </tr>
                    <tr>
                      <td><code>appName</code></td>
                      <td><code>string</code></td>
                      <td><code>'AegisX Platform'</code></td>
                      <td>Application name in header</td>
                    </tr>
                    <tr>
                      <td><code>appVersion</code></td>
                      <td><code>string</code></td>
                      <td><code>'v2.0'</code></td>
                      <td>Version displayed in footer</td>
                    </tr>
                    <tr>
                      <td><code>isDarkMode</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Dark mode state</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

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
                      <td><code>navigationToggled</code></td>
                      <td><code>EventEmitter&lt;void&gt;</code></td>
                      <td>Emits when navigation toggle button is clicked</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="doc-section">
              <h2>Content Projection Slots</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Slot Name</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>#toolbarTitle</code></td>
                      <td>Custom content for toolbar title area</td>
                    </tr>
                    <tr>
                      <td><code>#toolbarActions</code></td>
                      <td>Actions displayed in toolbar (right side)</td>
                    </tr>
                    <tr>
                      <td><code>#navigationHeader</code></td>
                      <td>Custom header content in navigation sidebar</td>
                    </tr>
                    <tr>
                      <td><code>#navigationFooter</code></td>
                      <td>Custom footer content in navigation sidebar</td>
                    </tr>
                    <tr>
                      <td><code>#footerContent</code></td>
                      <td>Custom content for page footer</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>With Custom Toolbar Actions</h2>
              <ax-code-tabs [tabs]="toolbarActionsCode"></ax-code-tabs>
            </section>

            <section class="doc-section">
              <h2>With Navigation Groups</h2>
              <ax-code-tabs [tabs]="navigationGroupsCode"></ax-code-tabs>
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
                    <li>Use for dashboard-style applications</li>
                    <li>Keep navigation items under 10 for better UX</li>
                    <li>Group related navigation items</li>
                    <li>Place important actions in the toolbar</li>
                  </ul>
                </div>
                <div class="guideline dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Nest navigation more than 2 levels deep</li>
                    <li>Hide critical features in collapsed state</li>
                    <li>Overload the toolbar with too many actions</li>
                    <li>Use for simple single-page applications</li>
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
      .compact-layout-doc {
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

      .layout-preview {
        display: flex;
        width: 100%;
        height: 300px;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;
      }

      .preview-sidebar {
        width: 64px;
        background: var(--ax-background-subtle);
        border-right: 1px solid var(--ax-border-default);
        padding: var(--ax-spacing-md);
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-sm);
      }

      .preview-logo {
        width: 32px;
        height: 32px;
        background: var(--ax-brand-default);
        border-radius: var(--ax-radius-sm);
        margin-bottom: var(--ax-spacing-md);
      }

      .preview-nav-item {
        width: 32px;
        height: 32px;
        background: var(--ax-border-default);
        border-radius: var(--ax-radius-sm);
      }

      .preview-main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .preview-toolbar {
        height: 56px;
        background: var(--ax-background-default);
        border-bottom: 1px solid var(--ax-border-default);
      }

      .preview-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ax-background-default);
      }

      .preview-placeholder {
        font-size: var(--ax-text-sm);
        color: var(--ax-text-subtle);
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
export class CompactLayoutDocComponent {
  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-compact-layout [navigation]="navigation">
  <ng-template #toolbarActions>
    <ax-theme-switcher></ax-theme-switcher>
    <button mat-icon-button>
      <mat-icon>notifications</mat-icon>
    </button>
  </ng-template>
</ax-compact-layout>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxCompactLayoutComponent, AxNavigationItem } from '@aegisx/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AxCompactLayoutComponent],
  template: \`
    <ax-compact-layout [navigation]="navigation">
      <!-- Main content rendered via router-outlet -->
    </ax-compact-layout>
  \`,
})
export class AppComponent {
  navigation: AxNavigationItem[] = [
    { id: 'dashboard', title: 'Dashboard', type: 'item', icon: 'dashboard', link: '/dashboard' },
    { id: 'users', title: 'Users', type: 'item', icon: 'people', link: '/users' },
    { id: 'settings', title: 'Settings', type: 'item', icon: 'settings', link: '/settings' },
  ];
}`,
    },
  ];

  toolbarActionsCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-compact-layout [navigation]="navigation">
  <ng-template #toolbarTitle>
    <span class="app-title">My Application</span>
  </ng-template>

  <ng-template #toolbarActions>
    <ax-theme-switcher></ax-theme-switcher>
    <button mat-icon-button matTooltip="Notifications">
      <mat-icon>notifications</mat-icon>
    </button>
    <button mat-icon-button matTooltip="Account">
      <mat-icon>account_circle</mat-icon>
    </button>
  </ng-template>
</ax-compact-layout>`,
    },
  ];

  navigationGroupsCode = [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `navigation: AxNavigationItem[] = [
  {
    id: 'main',
    title: 'Main',
    type: 'group',
    children: [
      { id: 'dashboard', title: 'Dashboard', type: 'item', icon: 'dashboard', link: '/dashboard' },
      { id: 'analytics', title: 'Analytics', type: 'item', icon: 'analytics', link: '/analytics' },
    ],
  },
  { id: 'divider1', title: '', type: 'divider' },
  {
    id: 'management',
    title: 'Management',
    type: 'group',
    children: [
      { id: 'users', title: 'Users', type: 'item', icon: 'people', link: '/users' },
      { id: 'roles', title: 'Roles', type: 'item', icon: 'admin_panel_settings', link: '/roles' },
    ],
  },
];`,
    },
  ];
}
