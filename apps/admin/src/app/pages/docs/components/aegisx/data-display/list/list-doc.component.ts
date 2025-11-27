import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AxListComponent, ListItem } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-list-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    AxListComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="list-doc">
      <ax-doc-header
        title="List"
        description="Vertical collection of items with optional icons, descriptions, and metadata for displaying structured information."
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
          { label: 'List' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxListComponent, ListItem } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="list-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="list-doc__tab-content">
            <section class="list-doc__section">
              <h2>Basic Usage</h2>
              <p>
                Lists display a collection of items in a vertical layout. Each
                item can include a title, description, icon, and metadata.
              </p>

              <ax-live-preview variant="bordered">
                <ax-list [items]="basicItems"></ax-list>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="list-doc__section">
              <h2>With Icons</h2>
              <p>Add icons to list items for visual context.</p>

              <ax-live-preview variant="bordered">
                <ax-list [items]="iconItems"></ax-list>
              </ax-live-preview>

              <ax-code-tabs [tabs]="iconCode"></ax-code-tabs>
            </section>

            <section class="list-doc__section">
              <h2>Sizes</h2>
              <p>Lists come in three sizes for different density needs.</p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
                gap="var(--ax-spacing-xl)"
              >
                <div class="list-doc__size-demo">
                  <span class="list-doc__size-label">Small</span>
                  <ax-list [items]="sizeItems" size="sm"></ax-list>
                </div>
                <div class="list-doc__size-demo">
                  <span class="list-doc__size-label">Medium (default)</span>
                  <ax-list [items]="sizeItems" size="md"></ax-list>
                </div>
                <div class="list-doc__size-demo">
                  <span class="list-doc__size-label">Large</span>
                  <ax-list [items]="sizeItems" size="lg"></ax-list>
                </div>
              </ax-live-preview>
            </section>

            <section class="list-doc__section">
              <h2>Variants</h2>
              <p>
                Customize list appearance with bordered and hoverable options.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
                gap="var(--ax-spacing-xl)"
              >
                <div class="list-doc__variant-demo">
                  <span class="list-doc__variant-label">Bordered</span>
                  <ax-list [items]="variantItems" [bordered]="true"></ax-list>
                </div>
                <div class="list-doc__variant-demo">
                  <span class="list-doc__variant-label">Hoverable</span>
                  <ax-list [items]="variantItems" [hoverable]="true"></ax-list>
                </div>
                <div class="list-doc__variant-demo">
                  <span class="list-doc__variant-label">Without dividers</span>
                  <ax-list [items]="variantItems" [divided]="false"></ax-list>
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="list-doc__tab-content">
            <section class="list-doc__section">
              <h2>Settings Menu</h2>
              <ax-live-preview variant="bordered">
                <ax-list
                  [items]="settingsItems"
                  [hoverable]="true"
                  [bordered]="true"
                ></ax-list>
              </ax-live-preview>
            </section>

            <section class="list-doc__section">
              <h2>Notifications</h2>
              <ax-live-preview variant="bordered">
                <ax-list
                  [items]="notificationItems"
                  [hoverable]="true"
                ></ax-list>
              </ax-live-preview>
            </section>

            <section class="list-doc__section">
              <h2>File List</h2>
              <ax-live-preview variant="bordered">
                <ax-list
                  [items]="fileItems"
                  [bordered]="true"
                  [hoverable]="true"
                ></ax-list>
              </ax-live-preview>
            </section>

            <section class="list-doc__section">
              <h2>With Disabled Items</h2>
              <ax-live-preview variant="bordered">
                <ax-list [items]="disabledItems" [bordered]="true"></ax-list>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="list-doc__tab-content">
            <section class="list-doc__section">
              <h2>Component Properties</h2>
              <div class="list-doc__api-table">
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
                      <td><code>items</code></td>
                      <td><code>ListItem[]</code></td>
                      <td><code>[]</code></td>
                      <td>Array of list items to display</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td><code>'sm' | 'md' | 'lg'</code></td>
                      <td><code>'md'</code></td>
                      <td>List item size/density</td>
                    </tr>
                    <tr>
                      <td><code>bordered</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Add border around list</td>
                    </tr>
                    <tr>
                      <td><code>hoverable</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Add hover effect to items</td>
                    </tr>
                    <tr>
                      <td><code>divided</code></td>
                      <td><code>boolean</code></td>
                      <td><code>true</code></td>
                      <td>Show dividers between items</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="list-doc__section">
              <h2>ListItem Interface</h2>
              <div class="list-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>title</code></td>
                      <td><code>string</code></td>
                      <td>Yes</td>
                      <td>Primary text of the item</td>
                    </tr>
                    <tr>
                      <td><code>description</code></td>
                      <td><code>string</code></td>
                      <td>No</td>
                      <td>Secondary/supporting text</td>
                    </tr>
                    <tr>
                      <td><code>icon</code></td>
                      <td><code>string</code></td>
                      <td>No</td>
                      <td>Material icon name</td>
                    </tr>
                    <tr>
                      <td><code>meta</code></td>
                      <td><code>string</code></td>
                      <td>No</td>
                      <td>Metadata text (right side)</td>
                    </tr>
                    <tr>
                      <td><code>disabled</code></td>
                      <td><code>boolean</code></td>
                      <td>No</td>
                      <td>Disable the item</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="list-doc__tab-content">
            <ax-component-tokens [tokens]="listTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="list-doc__tab-content">
            <section class="list-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="list-doc__guidelines">
                <div class="list-doc__guideline list-doc__guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Keep item titles concise and scannable</li>
                    <li>Use consistent icon styles within a list</li>
                    <li>Group related items together</li>
                    <li>Use hoverable for interactive lists</li>
                  </ul>
                </div>

                <div class="list-doc__guideline list-doc__guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Mix items with and without icons</li>
                    <li>Use long descriptions that wrap multiple lines</li>
                    <li>Nest lists more than one level deep</li>
                    <li>Overload items with too much information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="list-doc__section">
              <h2>Accessibility</h2>
              <ul class="list-doc__a11y-list">
                <li>Use semantic list markup (ul/li)</li>
                <li>Ensure disabled items are clearly indicated</li>
                <li>Provide keyboard navigation for interactive lists</li>
              </ul>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .list-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .list-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .list-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .list-doc__section {
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

      /* Size demo */
      .list-doc__size-demo,
      .list-doc__variant-demo {
        max-width: 400px;
      }

      .list-doc__size-label,
      .list-doc__variant-label {
        display: block;
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 600;
        color: var(--ax-text-secondary);
        margin-bottom: var(--ax-spacing-sm, 0.5rem);
      }

      /* API Table */
      .list-doc__api-table {
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
      .list-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .list-doc__guideline {
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

      .list-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .list-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      .list-doc__a11y-list {
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
export class ListDocComponent {
  basicItems: ListItem[] = [
    { title: 'Item One', description: 'Description for the first item' },
    { title: 'Item Two', description: 'Description for the second item' },
    { title: 'Item Three', description: 'Description for the third item' },
  ];

  iconItems: ListItem[] = [
    {
      title: 'Dashboard',
      description: 'View analytics and metrics',
      icon: 'dashboard',
    },
    { title: 'Users', description: 'Manage user accounts', icon: 'people' },
    {
      title: 'Settings',
      description: 'Configure application',
      icon: 'settings',
    },
  ];

  sizeItems: ListItem[] = [{ title: 'First Item' }, { title: 'Second Item' }];

  variantItems: ListItem[] = [
    { title: 'Item One', description: 'Description text' },
    { title: 'Item Two', description: 'Description text' },
    { title: 'Item Three', description: 'Description text' },
  ];

  settingsItems: ListItem[] = [
    {
      title: 'Account',
      description: 'Manage your account settings',
      icon: 'person',
      meta: '>',
    },
    {
      title: 'Notifications',
      description: 'Configure alerts and emails',
      icon: 'notifications',
      meta: '>',
    },
    {
      title: 'Privacy',
      description: 'Control your data',
      icon: 'lock',
      meta: '>',
    },
    {
      title: 'Help & Support',
      description: 'Get help or contact us',
      icon: 'help',
      meta: '>',
    },
  ];

  notificationItems: ListItem[] = [
    {
      title: 'New comment on your post',
      description: 'John Doe replied to your comment',
      icon: 'comment',
      meta: '2m ago',
    },
    {
      title: 'Project update',
      description: 'Sprint 5 has been completed',
      icon: 'task_alt',
      meta: '1h ago',
    },
    {
      title: 'Meeting reminder',
      description: 'Team standup in 15 minutes',
      icon: 'event',
      meta: '15m',
    },
  ];

  fileItems: ListItem[] = [
    {
      title: 'project-report.pdf',
      description: '2.4 MB',
      icon: 'picture_as_pdf',
      meta: 'Mar 15',
    },
    {
      title: 'design-assets.zip',
      description: '15.8 MB',
      icon: 'folder_zip',
      meta: 'Mar 14',
    },
    {
      title: 'meeting-notes.docx',
      description: '124 KB',
      icon: 'description',
      meta: 'Mar 12',
    },
  ];

  disabledItems: ListItem[] = [
    {
      title: 'Available Feature',
      description: 'This feature is enabled',
      icon: 'check_circle',
    },
    {
      title: 'Premium Feature',
      description: 'Upgrade to access',
      icon: 'lock',
      disabled: true,
    },
    {
      title: 'Another Feature',
      description: 'This feature is enabled',
      icon: 'check_circle',
    },
  ];

  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-list [items]="items"></ax-list>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxListComponent, ListItem } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [AxListComponent],
  template: \`<ax-list [items]="items"></ax-list>\`,
})
export class MyComponent {
  items: ListItem[] = [
    { title: 'Item One', description: 'Description' },
    { title: 'Item Two', description: 'Description' },
  ];
}`,
    },
  ];

  iconCode = [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `items: ListItem[] = [
  { title: 'Dashboard', description: 'View analytics', icon: 'dashboard' },
  { title: 'Users', description: 'Manage accounts', icon: 'people' },
  { title: 'Settings', description: 'Configure app', icon: 'settings' },
];`,
    },
  ];

  listTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'List background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'Hover state background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-default',
      usage: 'Divider and border color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-heading',
      usage: 'Item title color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-secondary',
      usage: 'Description and meta color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-disabled',
      usage: 'Disabled item text',
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
    {
      category: 'Borders',
      cssVar: '--ax-radius-lg',
      usage: 'Bordered variant corners',
    },
  ];
}
