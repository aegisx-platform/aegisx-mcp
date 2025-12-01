import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'app-breadcrumb-doc',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    AxBreadcrumbComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="breadcrumb-doc">
      <ax-doc-header
        title="Breadcrumb"
        icon="turn_right"
        description="Navigation breadcrumbs showing the user's current location within a hierarchical site structure."
        [breadcrumbs]="[
          { label: 'Navigation', link: '/docs/components/aegisx/navigation/stepper' },
          { label: 'Breadcrumb' },
        ]"
        [showImport]="false"
        [showQuickLinks]="false"
      ></ax-doc-header>

      <!-- Tabs -->
      <mat-tab-group class="docs-tabs" animationDuration="200ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="py-6">
            <section class="mb-8">
              <h2 class="text-2xl font-semibold mb-4">Introduction</h2>
              <p class="text-on-surface-variant mb-4">
                Breadcrumbs help users understand their current location within a hierarchical navigation structure
                and provide quick access to parent pages. The <code class="bg-surface-container px-2 py-1 rounded">ax-breadcrumb</code>
                component supports icons, custom separators, and multiple sizes.
              </p>
            </section>

            <!-- Quick Demo -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Quick Demo</h3>
              <mat-card appearance="outlined" class="p-6">
                <ax-breadcrumb
                  [items]="demoBreadcrumbs"
                  separatorIcon="chevron_right"
                  (itemClick)="onBreadcrumbClick($event)"
                />
                <p class="text-sm text-on-surface-variant mt-4">
                  Clicked: <span class="font-mono">{{ clickedItem() }}</span>
                </p>
              </mat-card>
            </section>

            <!-- Features -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Key Features</h3>
              <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                @for (feature of features; track feature.title) {
                  <mat-card appearance="outlined" class="p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <mat-icon class="text-primary">{{ feature.icon }}</mat-icon>
                      <h4 class="font-semibold">{{ feature.title }}</h4>
                    </div>
                    <p class="text-sm text-on-surface-variant">{{ feature.description }}</p>
                  </mat-card>
                }
              </div>
            </section>

            <!-- Basic Usage -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Basic Usage</h3>
              <ax-code-tabs [tabs]="basicUsageCode" />
            </section>

            <!-- Interactive Playground -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Interactive Playground</h3>
              <mat-card appearance="outlined" class="p-6">
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                  <mat-form-field appearance="outline">
                    <mat-label>Size</mat-label>
                    <mat-select [(ngModel)]="playgroundSize">
                      <mat-option value="sm">Small</mat-option>
                      <mat-option value="md">Medium</mat-option>
                      <mat-option value="lg">Large</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Separator Type</mat-label>
                    <mat-select [(ngModel)]="playgroundSeparatorType">
                      <mat-option value="text">Text</mat-option>
                      <mat-option value="icon">Icon</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    @if (playgroundSeparatorType === 'text') {
                      <mat-label>Text Separator</mat-label>
                      <mat-select [(ngModel)]="playgroundTextSeparator">
                        @for (sep of textSeparators; track sep) {
                          <mat-option [value]="sep">{{ sep }}</mat-option>
                        }
                      </mat-select>
                    } @else {
                      <mat-label>Icon Separator</mat-label>
                      <mat-select [(ngModel)]="playgroundIconSeparator">
                        @for (sep of iconSeparators; track sep) {
                          <mat-option [value]="sep">{{ sep }}</mat-option>
                        }
                      </mat-select>
                    }
                  </mat-form-field>
                </div>

                <div class="p-4 bg-surface-container rounded-lg">
                  @if (playgroundSeparatorType === 'text') {
                    <ax-breadcrumb
                      [items]="iconBreadcrumbs"
                      [size]="playgroundSize"
                      [separator]="playgroundTextSeparator"
                      (itemClick)="onBreadcrumbClick($event)"
                    />
                  } @else {
                    <ax-breadcrumb
                      [items]="iconBreadcrumbs"
                      [size]="playgroundSize"
                      [separatorIcon]="playgroundIconSeparator"
                      (itemClick)="onBreadcrumbClick($event)"
                    />
                  }
                </div>
              </mat-card>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="py-6 space-y-8">
            <!-- Size Variants -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Size Variants</h3>
              <ax-live-preview title="Breadcrumb Sizes">
                <div class="space-y-6">
                  @for (size of sizes; track size.value) {
                    <div>
                      <p class="text-sm text-on-surface-variant mb-2">{{ size.label }}</p>
                      <ax-breadcrumb
                        [items]="sizeDemoBreadcrumbs"
                        [size]="size.value"
                        separatorIcon="chevron_right"
                      />
                    </div>
                  }
                </div>
              </ax-live-preview>
              <ax-code-tabs [tabs]="sizeVariantsCode" />
            </section>

            <!-- With Icons -->
            <section>
              <h3 class="text-xl font-semibold mb-4">With Icons</h3>
              <ax-live-preview title="Breadcrumb with Icons">
                <ax-breadcrumb
                  [items]="iconBreadcrumbs"
                  separatorIcon="chevron_right"
                  (itemClick)="onBreadcrumbClick($event)"
                />
              </ax-live-preview>
              <ax-code-tabs [tabs]="withIconsCode" />
            </section>

            <!-- Separator Variants -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Separator Variants</h3>
              <ax-live-preview title="Separator Options">
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-on-surface-variant mb-2">Text separator: "/"</p>
                    <ax-breadcrumb [items]="basicBreadcrumbs" separator="/" />
                  </div>
                  <div>
                    <p class="text-sm text-on-surface-variant mb-2">Text separator: "›"</p>
                    <ax-breadcrumb [items]="basicBreadcrumbs" separator="›" />
                  </div>
                  <div>
                    <p class="text-sm text-on-surface-variant mb-2">Icon separator: chevron_right</p>
                    <ax-breadcrumb [items]="basicBreadcrumbs" separatorIcon="chevron_right" />
                  </div>
                  <div>
                    <p class="text-sm text-on-surface-variant mb-2">Icon separator: navigate_next</p>
                    <ax-breadcrumb [items]="basicBreadcrumbs" separatorIcon="navigate_next" />
                  </div>
                </div>
              </ax-live-preview>
              <ax-code-tabs [tabs]="separatorVariantsCode" />
            </section>

            <!-- Real World Examples -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Real World Examples</h3>
              <div class="space-y-4">
                <!-- Dashboard -->
                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold mb-3">Dashboard Navigation</h4>
                  <ax-breadcrumb
                    [items]="dashboardBreadcrumbs"
                    separatorIcon="chevron_right"
                    (itemClick)="onBreadcrumbClick($event)"
                  />
                </mat-card>

                <!-- E-commerce -->
                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold mb-3">E-Commerce Category</h4>
                  <ax-breadcrumb
                    [items]="ecommerceBreadcrumbs"
                    separatorIcon="chevron_right"
                    (itemClick)="onBreadcrumbClick($event)"
                  />
                </mat-card>

                <!-- Settings -->
                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold mb-3">Settings Panel</h4>
                  <ax-breadcrumb
                    [items]="settingsBreadcrumbs"
                    separatorIcon="chevron_right"
                    (itemClick)="onBreadcrumbClick($event)"
                  />
                </mat-card>

                <!-- Project Management -->
                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold mb-3">Project Management</h4>
                  <ax-breadcrumb
                    [items]="projectBreadcrumbs"
                    separatorIcon="chevron_right"
                    (itemClick)="onBreadcrumbClick($event)"
                  />
                </mat-card>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="py-6 space-y-8">
            <!-- Component API -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Component Inputs</h3>
              <mat-card appearance="outlined">
                <div class="p-4 border-b border-outline-variant bg-surface-container">
                  <code class="text-sm">import {{'{'}} AxBreadcrumbComponent {{'}'}} from '@aegisx/ui';</code>
                </div>
                <table mat-table [dataSource]="inputsData" class="w-full">
                  <ng-container matColumnDef="property">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Property</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-sm text-primary">{{ row.property }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Type</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-xs bg-surface-container px-1 rounded">{{ row.type }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="default">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Default</th>
                    <td mat-cell *matCellDef="let row">{{ row.default }}</td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Description</th>
                    <td mat-cell *matCellDef="let row">{{ row.description }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['property', 'type', 'default', 'description']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['property', 'type', 'default', 'description'];"></tr>
                </table>
              </mat-card>
            </section>

            <!-- Outputs -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Component Outputs</h3>
              <mat-card appearance="outlined">
                <table mat-table [dataSource]="outputsData" class="w-full">
                  <ng-container matColumnDef="event">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Event</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-sm text-primary">{{ row.event }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="payload">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Payload</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-xs bg-surface-container px-1 rounded">{{ row.payload }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Description</th>
                    <td mat-cell *matCellDef="let row">{{ row.description }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['event', 'payload', 'description']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['event', 'payload', 'description'];"></tr>
                </table>
              </mat-card>
            </section>

            <!-- BreadcrumbItem Interface -->
            <section>
              <h3 class="text-xl font-semibold mb-4">BreadcrumbItem Interface</h3>
              <mat-card appearance="outlined">
                <div class="p-4 bg-surface-container-lowest">
                  <pre class="text-sm overflow-x-auto"><code>export interface BreadcrumbItem {{'{'}}
  label: string;      // Display text (required)
  url?: string;       // Navigation URL (optional, last item usually has none)
  icon?: string;      // Material icon name (optional)
{{'}'}}</code></pre>
                </div>
              </mat-card>
            </section>

            <!-- BreadcrumbSize Type -->
            <section>
              <h3 class="text-xl font-semibold mb-4">BreadcrumbSize Type</h3>
              <mat-card appearance="outlined">
                <div class="p-4 bg-surface-container-lowest">
                  <pre class="text-sm overflow-x-auto"><code>export type BreadcrumbSize = 'sm' | 'md' | 'lg';</code></pre>
                </div>
                <table mat-table [dataSource]="sizeData" class="w-full">
                  <ng-container matColumnDef="value">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Value</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-sm text-primary">{{ row.value }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="fontSize">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Font Size</th>
                    <td mat-cell *matCellDef="let row">{{ row.fontSize }}</td>
                  </ng-container>
                  <ng-container matColumnDef="useCase">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Use Case</th>
                    <td mat-cell *matCellDef="let row">{{ row.useCase }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['value', 'fontSize', 'useCase']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['value', 'fontSize', 'useCase'];"></tr>
                </table>
              </mat-card>
            </section>
          </div>
        </mat-tab>

        <!-- Design Tokens Tab -->
        <mat-tab label="Design Tokens">
          <div class="py-6">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="py-6 space-y-8">
            <!-- Best Practices -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Best Practices</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold text-success mb-3 flex items-center gap-2">
                    <mat-icon>check_circle</mat-icon>
                    Do
                  </h4>
                  <ul class="space-y-2 text-sm text-on-surface-variant">
                    <li>Start with a "Home" link as the first item</li>
                    <li>Use concise, descriptive labels</li>
                    <li>Show the current page as the last item without a link</li>
                    <li>Use icons to improve visual recognition</li>
                    <li>Keep breadcrumb depth to 3-5 levels maximum</li>
                    <li>Position breadcrumbs at the top of the page</li>
                  </ul>
                </mat-card>

                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold text-error mb-3 flex items-center gap-2">
                    <mat-icon>cancel</mat-icon>
                    Don't
                  </h4>
                  <ul class="space-y-2 text-sm text-on-surface-variant">
                    <li>Use breadcrumbs as primary navigation</li>
                    <li>Include the current page as a clickable link</li>
                    <li>Use very long labels that truncate poorly</li>
                    <li>Show too many levels (collapse if > 5)</li>
                    <li>Mix icon and non-icon items inconsistently</li>
                    <li>Use breadcrumbs on single-level pages</li>
                  </ul>
                </mat-card>
              </div>
            </section>

            <!-- Accessibility -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Accessibility</h3>
              <mat-card appearance="outlined" class="p-4">
                <ul class="space-y-3 text-sm text-on-surface-variant">
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>ARIA:</strong> Use <code>nav</code> element with <code>aria-label="Breadcrumb"</code></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>Current page:</strong> Mark with <code>aria-current="page"</code></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>Separators:</strong> Decorative separators should be hidden from screen readers</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>Keyboard:</strong> All links should be focusable and activatable with Enter</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>Contrast:</strong> Ensure sufficient color contrast for all states</span>
                  </li>
                </ul>
              </mat-card>
            </section>

            <!-- Placement Guidelines -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Placement Guidelines</h3>
              <div class="space-y-4">
                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold mb-2">Standard Placement</h4>
                  <p class="text-sm text-on-surface-variant">
                    Place breadcrumbs below the main navigation bar and above the page title.
                    This provides clear context before users engage with page content.
                  </p>
                </mat-card>

                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold mb-2">Responsive Behavior</h4>
                  <p class="text-sm text-on-surface-variant">
                    On mobile devices, consider showing only the parent page link or implementing
                    a collapsed view that expands on interaction.
                  </p>
                </mat-card>

                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold mb-2">Depth Recommendations</h4>
                  <div class="grid grid-cols-3 gap-4 mt-3">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-success">3</div>
                      <div class="text-xs text-on-surface-variant">Ideal</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-warning">4-5</div>
                      <div class="text-xs text-on-surface-variant">Acceptable</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-error">6+</div>
                      <div class="text-xs text-on-surface-variant">Consider collapsing</div>
                    </div>
                  </div>
                </mat-card>
              </div>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .docs-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
        flex: 1;
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }

      code {
        font-family: 'Fira Code', 'Consolas', monospace;
      }
    `,
  ],
})
export class BreadcrumbDocComponent {
  clickedItem = signal<string>('None');

  // Playground state
  playgroundSize: 'sm' | 'md' | 'lg' = 'md';
  playgroundSeparatorType: 'text' | 'icon' = 'icon';
  playgroundTextSeparator = '/';
  playgroundIconSeparator = 'chevron_right';

  textSeparators = ['/', '›', '>', '•', '-', '|'];
  iconSeparators = [
    'chevron_right',
    'navigate_next',
    'arrow_forward_ios',
    'keyboard_arrow_right',
  ];

  // Features
  features = [
    {
      icon: 'link',
      title: 'Clickable Links',
      description: 'Navigate to parent pages',
    },
    {
      icon: 'format_size',
      title: 'Multiple Sizes',
      description: 'sm, md, lg variants',
    },
    {
      icon: 'apps',
      title: 'Icon Support',
      description: 'Material icons per item',
    },
    {
      icon: 'more_horiz',
      title: 'Custom Separators',
      description: 'Text or icon separators',
    },
  ];

  // Sizes
  sizes = [
    { value: 'sm' as const, label: 'Small (sm)' },
    { value: 'md' as const, label: 'Medium (md) - Default' },
    { value: 'lg' as const, label: 'Large (lg)' },
  ];

  // Demo breadcrumbs
  demoBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Products', url: '/products', icon: 'inventory_2' },
    { label: 'Electronics', url: '/electronics', icon: 'devices' },
    { label: 'Smartphones' },
  ];

  sizeDemoBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Category', url: '/category' },
    { label: 'Current Page' },
  ];

  basicBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Components', url: '/components' },
    { label: 'Breadcrumb' },
  ];

  iconBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Products', url: '/products', icon: 'inventory_2' },
    { label: 'Electronics', url: '/products/electronics', icon: 'devices' },
    { label: 'Smartphones' },
  ];

  dashboardBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard', icon: 'dashboard' },
    { label: 'Analytics', url: '/dashboard/analytics', icon: 'analytics' },
    {
      label: 'Reports',
      url: '/dashboard/analytics/reports',
      icon: 'assessment',
    },
    { label: 'Q4 2024 Summary' },
  ];

  ecommerceBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Store', url: '/store', icon: 'store' },
    { label: 'Catalog', url: '/store/catalog', icon: 'category' },
    { label: 'Women', url: '/store/catalog/women', icon: 'person' },
    {
      label: 'Dresses',
      url: '/store/catalog/women/dresses',
      icon: 'checkroom',
    },
    { label: 'Summer Collection 2024' },
  ];

  settingsBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Settings', url: '/settings', icon: 'settings' },
    { label: 'Account', url: '/settings/account', icon: 'account_circle' },
    { label: 'Security', url: '/settings/account/security', icon: 'security' },
    { label: 'Two-Factor Authentication' },
  ];

  projectBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Projects', url: '/projects', icon: 'folder' },
    { label: 'Frontend Redesign', url: '/projects/123', icon: 'brush' },
    { label: 'Tasks', url: '/projects/123/tasks', icon: 'task' },
    { label: 'TASK-456: Update Header' },
  ];

  // API Data
  inputsData = [
    {
      property: 'items',
      type: 'BreadcrumbItem[]',
      default: '[]',
      description: 'Array of breadcrumb items',
    },
    {
      property: 'separator',
      type: 'string',
      default: "'/'",
      description: 'Text character to use as separator',
    },
    {
      property: 'separatorIcon',
      type: 'string',
      default: 'undefined',
      description: 'Material icon name for separator (overrides text)',
    },
    {
      property: 'size',
      type: 'BreadcrumbSize',
      default: "'md'",
      description: 'Size variant (sm, md, lg)',
    },
  ];

  outputsData = [
    {
      event: 'itemClick',
      payload: 'BreadcrumbItem',
      description: 'Emitted when a breadcrumb item with URL is clicked',
    },
  ];

  sizeData = [
    {
      value: 'sm',
      fontSize: '0.875rem (14px)',
      useCase: 'Compact layouts, secondary navigation',
    },
    {
      value: 'md',
      fontSize: '1rem (16px)',
      useCase: 'Default size, most use cases',
    },
    {
      value: 'lg',
      fontSize: '1.125rem (18px)',
      useCase: 'Prominent navigation, landing pages',
    },
  ];

  // Code Examples
  basicUsageCode = [
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { Component, signal } from '@angular/core';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

@Component({
  selector: 'app-basic-breadcrumb',
  standalone: true,
  imports: [AxBreadcrumbComponent],
  template: \`
    <ax-breadcrumb
      [items]="breadcrumbs"
      separatorIcon="chevron_right"
      (itemClick)="onBreadcrumbClick($event)"
    />
  \`
})
export class BasicBreadcrumbComponent {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Products', url: '/products', icon: 'inventory_2' },
    { label: 'Smartphones' } // Last item has no URL
  ];

  onBreadcrumbClick(item: BreadcrumbItem): void {
    console.log('Clicked:', item.label, item.url);
    // Navigate or handle click
  }
}`,
    },
    {
      language: 'html' as const,
      label: 'Template',
      code: `<ax-breadcrumb
  [items]="breadcrumbs"
  separatorIcon="chevron_right"
  (itemClick)="onBreadcrumbClick($event)"
/>`,
    },
  ];

  sizeVariantsCode = [
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { Component } from '@angular/core';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

@Component({
  selector: 'app-breadcrumb-sizes',
  standalone: true,
  imports: [AxBreadcrumbComponent],
  template: \`
    <!-- Small -->
    <ax-breadcrumb [items]="items" size="sm" separatorIcon="chevron_right" />

    <!-- Medium (default) -->
    <ax-breadcrumb [items]="items" size="md" separatorIcon="chevron_right" />

    <!-- Large -->
    <ax-breadcrumb [items]="items" size="lg" separatorIcon="chevron_right" />
  \`
})
export class BreadcrumbSizesComponent {
  items: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Category', url: '/category' },
    { label: 'Current Page' }
  ];
}`,
    },
    {
      language: 'html' as const,
      label: 'Template',
      code: `<!-- Small -->
<ax-breadcrumb [items]="items" size="sm" separatorIcon="chevron_right" />

<!-- Medium (default) -->
<ax-breadcrumb [items]="items" size="md" separatorIcon="chevron_right" />

<!-- Large -->
<ax-breadcrumb [items]="items" size="lg" separatorIcon="chevron_right" />`,
    },
  ];

  withIconsCode = [
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { Component, signal } from '@angular/core';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

@Component({
  selector: 'app-breadcrumb-with-icons',
  standalone: true,
  imports: [AxBreadcrumbComponent],
  template: \`
    <ax-breadcrumb
      [items]="breadcrumbs"
      separatorIcon="chevron_right"
      (itemClick)="onBreadcrumbClick($event)"
    />
    <p>Clicked: {{ clickedItem() }}</p>
  \`
})
export class BreadcrumbWithIconsComponent {
  clickedItem = signal<string>('None');

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Products', url: '/products', icon: 'inventory_2' },
    { label: 'Electronics', url: '/products/electronics', icon: 'devices' },
    { label: 'Smartphones' } // Last item has no URL (current page)
  ];

  onBreadcrumbClick(item: BreadcrumbItem): void {
    this.clickedItem.set(\`\${item.label} (\${item.url})\`);
    // Navigate to item.url or handle click
  }
}`,
    },
    {
      language: 'html' as const,
      label: 'Template',
      code: `<ax-breadcrumb
  [items]="breadcrumbs"
  separatorIcon="chevron_right"
  (itemClick)="onBreadcrumbClick($event)"
/>`,
    },
  ];

  separatorVariantsCode = [
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { Component } from '@angular/core';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

@Component({
  selector: 'app-breadcrumb-separators',
  standalone: true,
  imports: [AxBreadcrumbComponent],
  template: \`
    <!-- Text separator "/" -->
    <ax-breadcrumb [items]="items" separator="/" />

    <!-- Text separator "›" -->
    <ax-breadcrumb [items]="items" separator="›" />

    <!-- Icon separator: chevron_right -->
    <ax-breadcrumb [items]="items" separatorIcon="chevron_right" />

    <!-- Icon separator: navigate_next -->
    <ax-breadcrumb [items]="items" separatorIcon="navigate_next" />
  \`
})
export class BreadcrumbSeparatorsComponent {
  items: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Components', url: '/components' },
    { label: 'Breadcrumb' }
  ];
}`,
    },
    {
      language: 'html' as const,
      label: 'Template',
      code: `<!-- Text separator "/" -->
<ax-breadcrumb [items]="items" separator="/" />

<!-- Text separator "›" -->
<ax-breadcrumb [items]="items" separator="›" />

<!-- Icon separator: chevron_right -->
<ax-breadcrumb [items]="items" separatorIcon="chevron_right" />

<!-- Icon separator: navigate_next -->
<ax-breadcrumb [items]="items" separatorIcon="navigate_next" />`,
    },
  ];

  // Design Tokens
  readonly designTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-text-default',
      usage: 'Link text color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-muted',
      usage: 'Current item, separator text',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-default',
      usage: 'Link hover state',
    },
    {
      category: 'Typography',
      cssVar: '--ax-font-size-sm',
      usage: 'Small size (0.875rem)',
    },
    {
      category: 'Typography',
      cssVar: '--ax-font-size-md',
      usage: 'Medium size (1rem)',
    },
    {
      category: 'Typography',
      cssVar: '--ax-font-size-lg',
      usage: 'Large size (1.125rem)',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-xs',
      usage: 'Gap between items and separators',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-sm',
      usage: 'Icon margin',
    },
  ];

  onBreadcrumbClick(item: BreadcrumbItem): void {
    this.clickedItem.set(`${item.label} (${item.url})`);
  }
}
