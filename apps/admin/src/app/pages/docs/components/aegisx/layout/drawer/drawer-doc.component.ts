import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AxDrawerComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken, CodeTab } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-drawer-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    AxDrawerComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="drawer-doc">
      <ax-doc-header
        title="Drawer / Sheet"
        description="A sliding panel that appears from the edge of the screen. Useful for navigation, filters, forms, and detail views."
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          { label: 'Components', link: '/docs/components' },
          { label: 'Layout', link: '/docs/components/layout/drawer' },
          { label: 'Drawer' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxDrawerComponent } from '&#64;aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="drawer-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="drawer-doc__tab-content">
            <section class="drawer-doc__section">
              <h2>Position Variants</h2>
              <p>Drawers can slide in from any edge of the screen.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                gap="var(--ax-spacing-md)"
              >
                <button mat-stroked-button (click)="openDrawer('left')">
                  <mat-icon>chevron_right</mat-icon>
                  Left
                </button>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="openDrawer('right')"
                >
                  <mat-icon>chevron_left</mat-icon>
                  Right
                </button>
                <button mat-stroked-button (click)="openDrawer('top')">
                  <mat-icon>expand_more</mat-icon>
                  Top
                </button>
                <button mat-stroked-button (click)="openDrawer('bottom')">
                  <mat-icon>expand_less</mat-icon>
                  Bottom (Sheet)
                </button>
              </ax-live-preview>

              <ax-code-tabs [tabs]="positionCode"></ax-code-tabs>
            </section>

            <section class="drawer-doc__section">
              <h2>Size Variants</h2>
              <p>Choose from predefined sizes: sm, md, lg, xl, or full.</p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                gap="var(--ax-spacing-md)"
              >
                <button mat-stroked-button (click)="openDrawerSize('sm')">
                  Small
                </button>
                <button mat-stroked-button (click)="openDrawerSize('md')">
                  Medium
                </button>
                <button mat-stroked-button (click)="openDrawerSize('lg')">
                  Large
                </button>
                <button mat-stroked-button (click)="openDrawerSize('xl')">
                  X-Large
                </button>
              </ax-live-preview>

              <ax-code-tabs [tabs]="sizeCode"></ax-code-tabs>
            </section>

            <section class="drawer-doc__section">
              <h2>With Footer</h2>
              <p>Use the footer template for action buttons.</p>

              <ax-live-preview variant="bordered">
                <button
                  mat-flat-button
                  color="primary"
                  (click)="openFormDrawer()"
                >
                  <mat-icon>edit</mat-icon>
                  Open Form Drawer
                </button>
              </ax-live-preview>

              <ax-code-tabs [tabs]="footerCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="drawer-doc__tab-content">
            <section class="drawer-doc__section">
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
                      <td><code>open</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Whether the drawer is open (two-way bindable)</td>
                    </tr>
                    <tr>
                      <td><code>position</code></td>
                      <td>'left' | 'right' | 'top' | 'bottom'</td>
                      <td>'right'</td>
                      <td>Position of the drawer</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td>'sm' | 'md' | 'lg' | 'xl' | 'full'</td>
                      <td>'md'</td>
                      <td>Size of the drawer</td>
                    </tr>
                    <tr>
                      <td><code>title</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Drawer title</td>
                    </tr>
                    <tr>
                      <td><code>subtitle</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Drawer subtitle</td>
                    </tr>
                    <tr>
                      <td><code>icon</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Material icon name</td>
                    </tr>
                    <tr>
                      <td><code>showHeader</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show header section</td>
                    </tr>
                    <tr>
                      <td><code>showCloseButton</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show close button</td>
                    </tr>
                    <tr>
                      <td><code>hasBackdrop</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show backdrop overlay</td>
                    </tr>
                    <tr>
                      <td><code>closeOnBackdropClick</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Close when backdrop is clicked</td>
                    </tr>
                    <tr>
                      <td><code>closeOnEscape</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Close on Escape key</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="drawer-doc__section">
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
                      <td><code>openChange</code></td>
                      <td>EventEmitter&lt;boolean&gt;</td>
                      <td>Emits when open state changes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="drawer-doc__section">
              <h2>Content Projection</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Slot</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>default</code></td>
                      <td>Main content area</td>
                    </tr>
                    <tr>
                      <td><code>#footer</code></td>
                      <td>Footer template with action buttons</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Design Tokens Tab -->
        <mat-tab label="Design Tokens">
          <div class="drawer-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Demo Drawers -->
    <ax-drawer
      [(open)]="isDrawerOpen"
      [position]="drawerPosition"
      [size]="drawerSize"
      [title]="drawerTitle"
      [subtitle]="drawerSubtitle"
    >
      <p>
        This is the drawer content. You can put any content here including
        forms, lists, or navigation.
      </p>
      <p>Click outside or press Escape to close.</p>
    </ax-drawer>

    <ax-drawer
      [(open)]="isFormDrawerOpen"
      position="right"
      size="md"
      title="Edit Profile"
      subtitle="Update your personal information"
      icon="person"
    >
      <ng-template #footer>
        <button mat-stroked-button (click)="isFormDrawerOpen = false">
          Cancel
        </button>
        <button
          mat-flat-button
          color="primary"
          (click)="isFormDrawerOpen = false"
        >
          Save Changes
        </button>
      </ng-template>

      <form class="drawer-form">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput placeholder="Enter your name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" placeholder="Enter your email" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Bio</mat-label>
          <textarea
            matInput
            rows="4"
            placeholder="Tell us about yourself"
          ></textarea>
        </mat-form-field>
      </form>
    </ax-drawer>
  `,
  styles: [
    `
      .drawer-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .drawer-doc__tabs {
        margin-top: 2rem;
      }

      .drawer-doc__tab-content {
        padding: 1.5rem 0;
      }

      .drawer-doc__section {
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

      .drawer-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        mat-form-field {
          width: 100%;
        }
      }
    `,
  ],
})
export class DrawerDocComponent {
  isDrawerOpen = false;
  isFormDrawerOpen = false;
  drawerPosition: 'left' | 'right' | 'top' | 'bottom' = 'right';
  drawerSize: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  drawerTitle = 'Drawer Title';
  drawerSubtitle = '';

  openDrawer(position: 'left' | 'right' | 'top' | 'bottom'): void {
    this.drawerPosition = position;
    this.drawerSize = position === 'bottom' ? 'sm' : 'md';
    this.drawerTitle =
      position === 'bottom'
        ? 'Bottom Sheet'
        : `${position.charAt(0).toUpperCase() + position.slice(1)} Drawer`;
    this.drawerSubtitle = `Opens from the ${position}`;
    this.isDrawerOpen = true;
  }

  openDrawerSize(size: 'sm' | 'md' | 'lg' | 'xl'): void {
    this.drawerPosition = 'right';
    this.drawerSize = size;
    this.drawerTitle = `${size.toUpperCase()} Size Drawer`;
    this.drawerSubtitle = `Width: ${size === 'sm' ? '320px' : size === 'md' ? '400px' : size === 'lg' ? '500px' : '640px'}`;
    this.isDrawerOpen = true;
  }

  openFormDrawer(): void {
    this.isFormDrawerOpen = true;
  }

  readonly positionCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Right drawer (default) -->
<ax-drawer [(open)]="isOpen" position="right" title="Settings">
  <p>Drawer content</p>
</ax-drawer>

<!-- Left navigation drawer -->
<ax-drawer [(open)]="navOpen" position="left" title="Menu">
  <nav>...</nav>
</ax-drawer>

<!-- Bottom sheet -->
<ax-drawer [(open)]="sheetOpen" position="bottom" size="sm" title="Options">
  <p>Sheet content</p>
</ax-drawer>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `isOpen = false;

openDrawer() {
  this.isOpen = true;
}`,
    },
  ];

  readonly sizeCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Small: 320px -->
<ax-drawer size="sm">...</ax-drawer>

<!-- Medium: 400px (default) -->
<ax-drawer size="md">...</ax-drawer>

<!-- Large: 500px -->
<ax-drawer size="lg">...</ax-drawer>

<!-- Extra Large: 640px -->
<ax-drawer size="xl">...</ax-drawer>

<!-- Full width -->
<ax-drawer size="full">...</ax-drawer>`,
    },
  ];

  readonly footerCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-drawer
  [(open)]="isOpen"
  title="Edit Profile"
  subtitle="Update your information"
  icon="person"
>
  <!-- Footer template with action buttons -->
  <ng-template #footer>
    <button mat-stroked-button (click)="isOpen = false">
      Cancel
    </button>
    <button mat-flat-button color="primary" (click)="save()">
      Save Changes
    </button>
  </ng-template>

  <!-- Main content -->
  <form>
    <mat-form-field>
      <mat-label>Name</mat-label>
      <input matInput>
    </mat-form-field>
  </form>
</ax-drawer>`,
    },
  ];

  readonly designTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Drawer panel background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-default',
      usage: 'Drawer border',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-muted',
      usage: 'Header/footer divider',
    },
    { category: 'Colors', cssVar: '--ax-text-heading', usage: 'Title color' },
    {
      category: 'Colors',
      cssVar: '--ax-text-secondary',
      usage: 'Subtitle color',
    },
    {
      category: 'Shadows',
      cssVar: '--ax-shadow-xl',
      usage: 'Drawer elevation',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-xl',
      usage: 'Bottom sheet corner radius',
    },
  ];
}
