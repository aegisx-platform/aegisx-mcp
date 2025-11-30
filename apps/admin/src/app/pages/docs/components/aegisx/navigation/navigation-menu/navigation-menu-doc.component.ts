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
  selector: 'ax-navigation-menu-doc',
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
    <div class="navigation-menu-doc">
      <ax-doc-header
        title="Navigation Menu"
        icon="menu"
        description="A flexible navigation component for building sidebar menus with support for groups, items, dividers, and badges."
        [breadcrumbs]="[
          {
            label: 'Navigation',
            link: '/docs/components/aegisx/navigation/breadcrumb',
          },
          { label: 'Navigation Menu' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxNavigationComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="doc-tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Basic Usage</h2>
              <p>
                Navigation Menu displays a vertical list of navigation items
                with icons and labels.
              </p>

              <ax-live-preview variant="bordered">
                <div class="nav-preview">
                  <div class="nav-mock">
                    <div class="nav-item active">
                      <mat-icon>dashboard</mat-icon>
                      <span>Dashboard</span>
                    </div>
                    <div class="nav-item">
                      <mat-icon>people</mat-icon>
                      <span>Users</span>
                    </div>
                    <div class="nav-item">
                      <mat-icon>settings</mat-icon>
                      <span>Settings</span>
                    </div>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="doc-section">
              <h2>With Groups</h2>
              <p>Organize navigation items into logical groups with headers.</p>

              <ax-live-preview variant="bordered">
                <div class="nav-preview">
                  <div class="nav-mock">
                    <div class="nav-group-header">Main</div>
                    <div class="nav-item active">
                      <mat-icon>dashboard</mat-icon>
                      <span>Dashboard</span>
                    </div>
                    <div class="nav-item">
                      <mat-icon>analytics</mat-icon>
                      <span>Analytics</span>
                    </div>
                    <div class="nav-group-header">Management</div>
                    <div class="nav-item">
                      <mat-icon>people</mat-icon>
                      <span>Users</span>
                    </div>
                    <div class="nav-item">
                      <mat-icon>admin_panel_settings</mat-icon>
                      <span>Roles</span>
                    </div>
                  </div>
                </div>
              </ax-live-preview>
            </section>

            <section class="doc-section">
              <h2>Compact Mode</h2>
              <p>Use compact appearance for icon-only navigation.</p>

              <ax-live-preview variant="bordered">
                <div class="nav-preview-compact">
                  <div class="nav-mock compact">
                    <div class="nav-item-compact active">
                      <mat-icon>dashboard</mat-icon>
                    </div>
                    <div class="nav-item-compact">
                      <mat-icon>people</mat-icon>
                    </div>
                    <div class="nav-item-compact">
                      <mat-icon>settings</mat-icon>
                    </div>
                  </div>
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Admin Sidebar</h2>
              <ax-live-preview variant="bordered">
                <div class="nav-preview">
                  <div class="nav-mock">
                    <div class="nav-item">
                      <mat-icon>home</mat-icon>
                      <span>Home</span>
                    </div>
                    <div class="nav-divider"></div>
                    <div class="nav-item active">
                      <mat-icon>inventory_2</mat-icon>
                      <span>Products</span>
                    </div>
                    <div class="nav-item">
                      <mat-icon>receipt_long</mat-icon>
                      <span>Orders</span>
                    </div>
                    <div class="nav-item">
                      <mat-icon>people</mat-icon>
                      <span>Customers</span>
                    </div>
                    <div class="nav-divider"></div>
                    <div class="nav-item">
                      <mat-icon>assessment</mat-icon>
                      <span>Reports</span>
                    </div>
                    <div class="nav-item">
                      <mat-icon>settings</mat-icon>
                      <span>Settings</span>
                    </div>
                  </div>
                </div>
              </ax-live-preview>
            </section>

            <section class="doc-section">
              <h2>With Badges</h2>
              <ax-live-preview variant="bordered">
                <div class="nav-preview">
                  <div class="nav-mock">
                    <div class="nav-item">
                      <mat-icon>inbox</mat-icon>
                      <span>Inbox</span>
                      <span class="nav-badge red">5</span>
                    </div>
                    <div class="nav-item active">
                      <mat-icon>task</mat-icon>
                      <span>Tasks</span>
                      <span class="nav-badge blue">12</span>
                    </div>
                    <div class="nav-item">
                      <mat-icon>notifications</mat-icon>
                      <span>Notifications</span>
                      <span class="nav-badge green">New</span>
                    </div>
                  </div>
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Properties</h2>
              <div class="api-table">
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
                      <td><code>navigation</code></td>
                      <td><code>AxNavigationItem[]</code></td>
                      <td><code>[]</code></td>
                      <td>Array of navigation items</td>
                    </tr>
                    <tr>
                      <td><code>layout</code></td>
                      <td><code>'vertical' | 'horizontal'</code></td>
                      <td><code>'vertical'</code></td>
                      <td>Navigation layout direction</td>
                    </tr>
                    <tr>
                      <td><code>appearance</code></td>
                      <td><code>'default' | 'compact' | 'dense'</code></td>
                      <td><code>'default'</code></td>
                      <td>Visual appearance style</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="doc-section">
              <h2>AxNavigationItem Interface</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>id</code></td>
                      <td><code>string</code></td>
                      <td>Unique identifier</td>
                    </tr>
                    <tr>
                      <td><code>title</code></td>
                      <td><code>string</code></td>
                      <td>Display text</td>
                    </tr>
                    <tr>
                      <td><code>type</code></td>
                      <td>
                        <code>'item' | 'group' | 'divider' | 'spacer'</code>
                      </td>
                      <td>Item type</td>
                    </tr>
                    <tr>
                      <td><code>icon</code></td>
                      <td><code>string</code></td>
                      <td>Material icon name</td>
                    </tr>
                    <tr>
                      <td><code>link</code></td>
                      <td><code>string</code></td>
                      <td>Router link path</td>
                    </tr>
                    <tr>
                      <td><code>badge</code></td>
                      <td>
                        <code
                          >{{ '{' }} title: string; classes?: string
                          {{ '}' }}</code
                        >
                      </td>
                      <td>Badge configuration</td>
                    </tr>
                    <tr>
                      <td><code>children</code></td>
                      <td><code>AxNavigationItem[]</code></td>
                      <td>Nested navigation items</td>
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
                    <li>Use meaningful icons for each item</li>
                    <li>Group related items together</li>
                    <li>Keep labels concise</li>
                    <li>Use badges sparingly for important counts</li>
                  </ul>
                </div>
                <div class="guideline dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Create deeply nested navigation (max 2 levels)</li>
                    <li>Use too many top-level items</li>
                    <li>Hide important navigation behind menus</li>
                    <li>Use similar icons for different items</li>
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
      .navigation-menu-doc {
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

      .nav-preview {
        width: 280px;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
        overflow: hidden;
      }

      .nav-preview-compact {
        width: 72px;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
        overflow: hidden;
      }

      .nav-mock {
        padding: var(--ax-spacing-sm);
      }

      .nav-mock.compact {
        padding: var(--ax-spacing-xs);
      }

      .nav-group-header {
        font-size: var(--ax-text-xs);
        font-weight: 600;
        color: var(--ax-text-secondary);
        text-transform: uppercase;
        padding: var(--ax-spacing-md) var(--ax-spacing-md) var(--ax-spacing-xs);
        letter-spacing: 0.5px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md);
        padding: var(--ax-spacing-sm) var(--ax-spacing-md);
        border-radius: var(--ax-radius-md);
        color: var(--ax-text-secondary);
        cursor: pointer;
        transition: background 0.15s ease;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        span {
          font-size: var(--ax-text-sm);
          font-weight: 500;
        }

        &:hover {
          background: var(--ax-background-subtle);
        }

        &.active {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-default);
        }
      }

      .nav-item-compact {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--ax-spacing-sm);
        border-radius: var(--ax-radius-md);
        color: var(--ax-text-secondary);
        cursor: pointer;
        transition: background 0.15s ease;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        &:hover {
          background: var(--ax-background-subtle);
        }

        &.active {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-default);
        }
      }

      .nav-divider {
        height: 1px;
        background: var(--ax-border-default);
        margin: var(--ax-spacing-sm) var(--ax-spacing-md);
      }

      .nav-badge {
        margin-left: auto;
        font-size: var(--ax-text-xs);
        font-weight: 600;
        padding: 2px 8px;
        border-radius: var(--ax-radius-full);

        &.red {
          background: #ef4444;
          color: white;
        }
        &.blue {
          background: #3b82f6;
          color: white;
        }
        &.green {
          background: #22c55e;
          color: white;
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
export class NavigationMenuDocComponent {
  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-navigation [navigation]="items"></ax-navigation>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxNavigationComponent, AxNavigationItem } from '@aegisx/ui';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AxNavigationComponent],
  template: \`<ax-navigation [navigation]="items"></ax-navigation>\`,
})
export class SidebarComponent {
  items: AxNavigationItem[] = [
    { id: 'dashboard', title: 'Dashboard', type: 'item', icon: 'dashboard', link: '/dashboard' },
    { id: 'users', title: 'Users', type: 'item', icon: 'people', link: '/users' },
    { id: 'settings', title: 'Settings', type: 'item', icon: 'settings', link: '/settings' },
  ];
}`,
    },
  ];
}
