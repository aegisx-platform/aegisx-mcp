import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import {
  AxLauncherComponent,
  AxLauncherCardComponent,
  LauncherApp,
  LauncherCategory,
} from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
} from '../../../../../../components/docs';
import { CodeTab } from '../../../../../../types/docs.types';

@Component({
  selector: 'app-launcher-doc',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    AxLauncherComponent,
    AxLauncherCardComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="launcher-doc">
      <ax-doc-header
        title="Launcher"
        icon="apps"
        description="Application launcher with pastel-colored cards, categories, RBAC, bento grid, and full dark mode support."
        [breadcrumbs]="[
          {
            label: 'Navigation',
            link: '/docs/components/aegisx/navigation/stepper',
          },
          { label: 'Launcher' },
        ]"
        [showImport]="false"
        [showQuickLinks]="false"
      ></ax-doc-header>

      <!-- Demo Link Banner -->
      <mat-card appearance="outlined" class="demo-banner mb-6">
        <mat-card-content class="flex items-center justify-between py-3 px-4">
          <div class="flex items-center gap-3">
            <mat-icon class="text-primary">play_circle</mat-icon>
            <div>
              <span class="font-semibold">Live Demo Available</span>
              <span class="text-on-surface-variant ml-2"
                >See the full launcher in action</span
              >
            </div>
          </div>
          <a
            mat-flat-button
            routerLink="/app-launcher-demo"
            class="demo-button"
          >
            <mat-icon>open_in_new</mat-icon>
            View Demo
          </a>
        </mat-card-content>
      </mat-card>

      <!-- Tabs -->
      <mat-tab-group class="docs-tabs" animationDuration="200ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="py-6">
            <section class="mb-8">
              <h2 class="text-2xl font-semibold mb-4">Introduction</h2>
              <p class="text-on-surface-variant mb-4">
                The
                <code class="bg-surface-container px-2 py-1 rounded"
                  >ax-launcher</code
                >
                component provides a beautiful application launcher with
                pastel-colored cards, category filtering, keyboard shortcuts,
                and full dark mode support. Perfect for dashboards, admin
                panels, and enterprise applications.
              </p>
            </section>

            <!-- Features -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Key Features</h3>
              <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                @for (feature of features; track feature.title) {
                  <mat-card appearance="outlined" class="p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <mat-icon class="text-primary">{{
                        feature.icon
                      }}</mat-icon>
                      <h4 class="font-semibold">{{ feature.title }}</h4>
                    </div>
                    <p class="text-sm text-on-surface-variant">
                      {{ feature.description }}
                    </p>
                  </mat-card>
                }
              </div>
            </section>

            <!-- Quick Demo -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Quick Demo</h3>
              <mat-card appearance="outlined" class="p-6">
                <div class="flex flex-wrap gap-4">
                  @for (app of demoApps; track app.id) {
                    <ax-launcher-card
                      [app]="app"
                      [isFavorite]="favoriteApps().includes(app.id)"
                      [isPinned]="pinnedApps().includes(app.id)"
                      (cardClick)="onAppClick($event)"
                      (favoriteToggle)="toggleFavorite($event)"
                      (pinToggle)="togglePin($event)"
                    />
                  }
                </div>
                <p class="text-sm text-on-surface-variant mt-4">
                  Last clicked:
                  <span class="font-mono">{{ lastClicked() }}</span>
                </p>
              </mat-card>
            </section>

            <!-- Color Variants -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Color Variants</h3>
              <p class="text-on-surface-variant mb-4">
                10 pastel colors available with full dark mode support:
              </p>
              <div class="flex flex-wrap gap-2 mb-6">
                @for (color of colors; track color) {
                  <mat-chip-option [selected]="false">{{
                    color
                  }}</mat-chip-option>
                }
              </div>

              <!-- All Colors Demo -->
              <mat-card appearance="outlined" class="p-6">
                <h4 class="text-lg font-medium mb-4">All Color Previews</h4>
                <div
                  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  @for (app of colorVariantApps; track app.id) {
                    <ax-launcher-card
                      [app]="app"
                      (cardClick)="onAppClick($event)"
                    />
                  }
                </div>
              </mat-card>
            </section>

            <!-- Basic Usage -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Basic Usage</h3>
              <ax-code-tabs [tabs]="basicUsageTabs"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="py-6 space-y-8">
            <!-- Full Launcher Example -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Full Launcher</h3>
              <ax-live-preview title="App Launcher with Categories">
                <ax-launcher
                  [apps]="fullDemoApps"
                  [categories]="demoCategories"
                  title="Applications"
                  subtitle="Select an application to launch"
                  [config]="{
                    showSearch: true,
                    showCategoryTabs: true,
                    enableFavorites: true,
                    enableRecent: true,
                    cardMinWidth: 220,
                    cardGap: 16,
                  }"
                  (appClick)="onAppClick($event)"
                />
              </ax-live-preview>
              <ax-code-tabs [tabs]="fullLauncherTabs"></ax-code-tabs>
            </section>

            <!-- Card Sizes -->
            <section>
              <h3 class="text-xl font-semibold mb-4">
                Card Sizes (Bento Grid)
              </h3>
              <p class="text-on-surface-variant mb-4">
                Use different sizes for featured apps in a bento grid layout.
              </p>
              <ax-live-preview title="Different Card Sizes">
                <div
                  class="grid grid-cols-4 gap-4"
                  style="grid-auto-rows: minmax(140px, auto);"
                >
                  @for (app of bentoApps; track app.id) {
                    <ax-launcher-card
                      [app]="app"
                      [size]="app.size || 'md'"
                      [class.col-span-2]="
                        app.size === 'lg' || app.size === 'xl'
                      "
                      [class.row-span-2]="app.size === 'xl'"
                    />
                  }
                </div>
              </ax-live-preview>
              <ax-code-tabs [tabs]="bentoGridTabs"></ax-code-tabs>
            </section>

            <!-- Single Card Example -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Single Card Usage</h3>
              <p class="text-on-surface-variant mb-4">
                Use
                <code class="bg-surface-container px-2 py-1 rounded"
                  >ax-launcher-card</code
                >
                directly for individual app cards.
              </p>
              <ax-live-preview title="Individual Launcher Cards">
                <div class="flex flex-wrap gap-4">
                  @for (app of demoApps; track app.id) {
                    <ax-launcher-card
                      [app]="app"
                      [isFavorite]="favoriteApps().includes(app.id)"
                      [isPinned]="pinnedApps().includes(app.id)"
                      (cardClick)="onAppClick($event)"
                      (favoriteToggle)="toggleFavorite($event)"
                      (pinToggle)="togglePin($event)"
                    />
                  }
                </div>
              </ax-live-preview>
              <ax-code-tabs [tabs]="singleCardTabs"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="py-6 space-y-8">
            <!-- Inputs -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Inputs</h3>
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="inputsData" class="w-full">
                  <ng-container matColumnDef="property">
                    <th mat-header-cell *matHeaderCellDef>Property</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-primary">{{ row.property }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-secondary">{{ row.type }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="default">
                    <th mat-header-cell *matHeaderCellDef>Default</th>
                    <td mat-cell *matCellDef="let row">{{ row.default }}</td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let row">
                      {{ row.description }}
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr
                    mat-row
                    *matRowDef="let row; columns: displayedColumns"
                  ></tr>
                </table>
              </div>
            </section>

            <!-- Outputs -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Outputs</h3>
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="outputsData" class="w-full">
                  <ng-container matColumnDef="property">
                    <th mat-header-cell *matHeaderCellDef>Event</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-primary">{{ row.property }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-secondary">{{ row.type }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let row">
                      {{ row.description }}
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="outputColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: outputColumns"></tr>
                </table>
              </div>
            </section>

            <!-- LauncherApp Interface -->
            <section>
              <h3 class="text-xl font-semibold mb-4">LauncherApp Interface</h3>
              <ax-code-tabs [tabs]="interfaceTabs"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Keyboard Shortcuts Tab -->
        <mat-tab label="Keyboard">
          <div class="py-6">
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Keyboard Shortcuts</h3>
              <mat-card appearance="outlined" class="p-6">
                <table class="w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left py-2">Shortcut</th>
                      <th class="text-left py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b">
                      <td class="py-2">
                        <code class="bg-surface-container px-2 py-1 rounded"
                          >Cmd/Ctrl + K</code
                        >
                      </td>
                      <td class="py-2">Focus search input</td>
                    </tr>
                    <tr class="border-b">
                      <td class="py-2">
                        <code class="bg-surface-container px-2 py-1 rounded"
                          >Escape</code
                        >
                      </td>
                      <td class="py-2">Clear search</td>
                    </tr>
                    <tr>
                      <td class="py-2">
                        <code class="bg-surface-container px-2 py-1 rounded"
                          >Enter</code
                        >
                      </td>
                      <td class="py-2">Open focused app</td>
                    </tr>
                  </tbody>
                </table>
              </mat-card>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .launcher-doc {
        max-width: 1200px;
        margin: 0 auto;
      }

      ax-launcher-card {
        width: 220px;
      }

      .col-span-2 {
        grid-column: span 2;
      }

      .row-span-2 {
        grid-row: span 2;
      }

      .demo-banner {
        background: var(--ax-brand-faint);
        border: 1px solid var(--ax-brand-200);
      }

      .demo-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .grid ax-launcher-card {
        width: 100%;
        min-width: 0;
      }
    `,
  ],
})
export class LauncherDocComponent {
  lastClicked = signal<string>('None');
  favoriteApps = signal<string[]>([]);
  pinnedApps = signal<string[]>([]);

  features = [
    {
      icon: 'palette',
      title: 'Pastel Colors',
      description: '10 beautiful pastel color variants with dark mode support',
    },
    {
      icon: 'category',
      title: 'Categories',
      description: 'Group apps by category with tab navigation',
    },
    {
      icon: 'keyboard',
      title: 'Keyboard Shortcuts',
      description: 'Cmd/Ctrl+K to focus search quickly',
    },
    {
      icon: 'dark_mode',
      title: 'Dark Mode',
      description: 'Full dark mode support with deep color variants',
    },
    {
      icon: 'push_pin',
      title: 'Pin & Favorites',
      description: 'Pin apps for quick access, mark favorites',
    },
    {
      icon: 'history',
      title: 'Recent Apps',
      description: 'Track recently used applications',
    },
    {
      icon: 'dashboard',
      title: 'Bento Grid',
      description: 'Different card sizes for featured apps',
    },
    {
      icon: 'security',
      title: 'RBAC Support',
      description: 'Role-based access control for apps',
    },
  ];

  colors = [
    'pink',
    'peach',
    'mint',
    'blue',
    'yellow',
    'lavender',
    'cyan',
    'rose',
    'neutral',
    'white',
  ];

  // All 10 color variants with sample apps
  colorVariantApps: LauncherApp[] = [
    {
      id: 'pink-app',
      name: 'Health',
      description: 'Healthcare system',
      icon: 'favorite',
      color: 'pink',
      status: 'active',
      enabled: true,
    },
    {
      id: 'peach-app',
      name: 'Social',
      description: 'Social network',
      icon: 'people',
      color: 'peach',
      status: 'active',
      enabled: true,
    },
    {
      id: 'mint-app',
      name: 'Finance',
      description: 'Banking app',
      icon: 'account_balance',
      color: 'mint',
      status: 'active',
      enabled: true,
    },
    {
      id: 'blue-app',
      name: 'Dashboard',
      description: 'Main dashboard',
      icon: 'dashboard',
      color: 'blue',
      status: 'active',
      enabled: true,
    },
    {
      id: 'yellow-app',
      name: 'Alerts',
      description: 'Notifications',
      icon: 'notifications',
      color: 'yellow',
      status: 'new',
      enabled: true,
      notificationCount: 3,
    },
    {
      id: 'lavender-app',
      name: 'Settings',
      description: 'App settings',
      icon: 'settings',
      color: 'lavender',
      status: 'active',
      enabled: true,
    },
    {
      id: 'cyan-app',
      name: 'Calendar',
      description: 'Schedule events',
      icon: 'calendar_month',
      color: 'cyan',
      status: 'active',
      enabled: true,
    },
    {
      id: 'rose-app',
      name: 'Reports',
      description: 'Generate reports',
      icon: 'assessment',
      color: 'rose',
      status: 'beta',
      enabled: true,
    },
    {
      id: 'neutral-app',
      name: 'Archive',
      description: 'Document storage',
      icon: 'folder',
      color: 'neutral',
      status: 'active',
      enabled: true,
    },
    {
      id: 'white-app',
      name: 'Notes',
      description: 'Take notes',
      icon: 'edit_note',
      color: 'white',
      status: 'active',
      enabled: true,
    },
  ];

  demoApps: LauncherApp[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Main dashboard',
      icon: 'dashboard',
      color: 'blue',
      status: 'active',
      enabled: true,
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'View statistics',
      icon: 'analytics',
      color: 'mint',
      status: 'active',
      enabled: true,
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'App settings',
      icon: 'settings',
      color: 'lavender',
      status: 'active',
      enabled: true,
    },
    {
      id: 'users',
      name: 'Users',
      description: 'User management',
      icon: 'people',
      color: 'peach',
      status: 'new',
      enabled: true,
      notificationCount: 5,
    },
  ];

  fullDemoApps: LauncherApp[] = [
    ...this.demoApps,
    {
      id: 'reports',
      name: 'Reports',
      description: 'Generate reports',
      icon: 'assessment',
      color: 'rose',
      status: 'active',
      enabled: true,
      categoryId: 'tools',
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Schedule events',
      icon: 'calendar_month',
      color: 'cyan',
      status: 'active',
      enabled: true,
      categoryId: 'tools',
    },
  ];

  bentoApps: LauncherApp[] = [
    {
      id: 'main',
      name: 'Main App',
      description: 'Primary application',
      icon: 'apps',
      color: 'blue',
      status: 'active',
      enabled: true,
      size: 'xl',
    },
    {
      id: 'quick1',
      name: 'Quick Action',
      icon: 'bolt',
      color: 'yellow',
      status: 'active',
      enabled: true,
      size: 'sm',
    },
    {
      id: 'quick2',
      name: 'Settings',
      icon: 'settings',
      color: 'neutral',
      status: 'active',
      enabled: true,
      size: 'sm',
    },
    {
      id: 'featured',
      name: 'Featured',
      description: 'Featured content',
      icon: 'star',
      color: 'lavender',
      status: 'active',
      enabled: true,
      size: 'lg',
    },
  ];

  demoCategories: LauncherCategory[] = [
    { id: 'main', name: 'Main', icon: 'home' },
    { id: 'tools', name: 'Tools', icon: 'build' },
  ];

  displayedColumns = ['property', 'type', 'default', 'description'];
  outputColumns = ['property', 'type', 'description'];

  inputsData = [
    {
      property: 'apps',
      type: 'LauncherApp[]',
      default: 'required',
      description: 'Array of apps to display',
    },
    {
      property: 'categories',
      type: 'LauncherCategory[]',
      default: '[]',
      description: 'Categories for grouping apps',
    },
    {
      property: 'userContext',
      type: 'LauncherUserContext',
      default: '{}',
      description: 'User context for RBAC',
    },
    {
      property: 'config',
      type: 'LauncherConfig',
      default: 'defaults',
      description: 'Component configuration',
    },
    {
      property: 'title',
      type: 'string',
      default: "''",
      description: 'Launcher title',
    },
    {
      property: 'subtitle',
      type: 'string',
      default: "''",
      description: 'Launcher subtitle',
    },
  ];

  outputsData = [
    {
      property: 'appClick',
      type: 'LauncherAppClickEvent',
      description: 'Emitted when app is clicked',
    },
    {
      property: 'menuAction',
      type: 'LauncherMenuActionEvent',
      description: 'Emitted when menu action is clicked',
    },
    {
      property: 'statusChange',
      type: 'LauncherStatusChangeEvent',
      description: 'Emitted when app status changes',
    },
    {
      property: 'enabledChange',
      type: 'LauncherEnabledChangeEvent',
      description: 'Emitted when app enabled state changes',
    },
  ];

  // Code Tabs Data
  basicUsageTabs: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import {
  AxLauncherComponent,
  LauncherApp,
  LauncherCategory,
} from '@aegisx/ui';

// Define your apps
apps: LauncherApp[] = [
  {
    id: 'app-1',
    name: 'Dashboard',
    description: 'Main dashboard',
    icon: 'dashboard',
    color: 'blue',
    route: '/dashboard',
    status: 'active',
    enabled: true,
    categoryId: 'main',
  },
  // ... more apps
];

// Define categories
categories: LauncherCategory[] = [
  { id: 'main', name: 'Main', icon: 'home' },
  { id: 'tools', name: 'Tools', icon: 'build' },
];`,
    },
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-launcher
  [apps]="apps"
  [categories]="categories"
  title="Applications"
  subtitle="Select an app to launch"
  (appClick)="onAppClick($event)"
/>`,
    },
  ];

  fullLauncherTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-launcher
  [apps]="apps"
  [categories]="categories"
  title="Applications"
  subtitle="Select an application to launch"
  [config]="{
    showSearch: true,
    showCategoryTabs: true,
    enableFavorites: true,
    enableRecent: true,
    cardMinWidth: 220,
    cardGap: 16
  }"
  (appClick)="onAppClick($event)"
/>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `apps: LauncherApp[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main dashboard',
    icon: 'dashboard',
    color: 'blue',
    status: 'active',
    enabled: true,
    categoryId: 'main',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'View statistics',
    icon: 'analytics',
    color: 'mint',
    status: 'active',
    enabled: true,
    categoryId: 'main',
  },
  // ... more apps
];

categories: LauncherCategory[] = [
  { id: 'main', name: 'Main', icon: 'home' },
  { id: 'tools', name: 'Tools', icon: 'build' },
];

onAppClick(event: { app: LauncherApp }): void {
  console.log('App clicked:', event.app.name);
  // Navigate or perform action
}`,
    },
  ];

  bentoGridTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<div class="grid grid-cols-4 gap-4" style="grid-auto-rows: minmax(140px, auto);">
  @for (app of bentoApps; track app.id) {
    <ax-launcher-card
      [app]="app"
      [size]="app.size || 'md'"
      [class.col-span-2]="app.size === 'lg' || app.size === 'xl'"
      [class.row-span-2]="app.size === 'xl'"
    />
  }
</div>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `bentoApps: LauncherApp[] = [
  {
    id: 'main',
    name: 'Main App',
    description: 'Primary application',
    icon: 'apps',
    color: 'blue',
    status: 'active',
    enabled: true,
    size: 'xl', // Extra large card
  },
  {
    id: 'quick1',
    name: 'Quick Action',
    icon: 'bolt',
    color: 'yellow',
    status: 'active',
    enabled: true,
    size: 'sm', // Small card
  },
  {
    id: 'featured',
    name: 'Featured',
    description: 'Featured content',
    icon: 'star',
    color: 'lavender',
    status: 'active',
    enabled: true,
    size: 'lg', // Large card
  },
];`,
    },
    {
      label: 'SCSS',
      language: 'scss',
      code: `.col-span-2 {
  grid-column: span 2;
}

.row-span-2 {
  grid-row: span 2;
}`,
    },
  ];

  singleCardTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-launcher-card
  [app]="app"
  [isFavorite]="favoriteApps().includes(app.id)"
  [isPinned]="pinnedApps().includes(app.id)"
  (cardClick)="onAppClick($event)"
  (favoriteToggle)="toggleFavorite($event)"
  (pinToggle)="togglePin($event)"
/>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { signal } from '@angular/core';
import { AxLauncherCardComponent, LauncherApp } from '@aegisx/ui';

favoriteApps = signal<string[]>([]);
pinnedApps = signal<string[]>([]);

app: LauncherApp = {
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Main dashboard',
  icon: 'dashboard',
  color: 'blue',
  status: 'active',
  enabled: true,
};

onAppClick(event: { app: LauncherApp }): void {
  console.log('App clicked:', event.app.name);
}

toggleFavorite(app: LauncherApp): void {
  const favs = this.favoriteApps();
  if (favs.includes(app.id)) {
    this.favoriteApps.set(favs.filter(id => id !== app.id));
  } else {
    this.favoriteApps.set([...favs, app.id]);
  }
}

togglePin(app: LauncherApp): void {
  const pins = this.pinnedApps();
  if (pins.includes(app.id)) {
    this.pinnedApps.set(pins.filter(id => id !== app.id));
  } else {
    this.pinnedApps.set([...pins, app.id]);
  }
}`,
    },
  ];

  interfaceTabs: CodeTab[] = [
    {
      label: 'LauncherApp',
      language: 'typescript',
      code: `interface LauncherApp {
  id: string;
  name: string;
  description?: string;
  icon: string;
  route?: string;
  externalUrl?: string;
  color: LauncherColor; // 'pink' | 'peach' | 'mint' | 'blue' | ...
  categoryId?: string;
  tags?: string[];
  order?: number;
  status: LauncherAppStatus; // 'active' | 'beta' | 'new' | ...
  enabled: boolean;
  notificationCount?: number;
  size?: LauncherCardSize; // 'sm' | 'md' | 'lg' | 'xl'
  featured?: boolean;
  usageCount?: number;
  permission?: LauncherPermission;
  menuActions?: LauncherMenuAction[];
}`,
    },
    {
      label: 'LauncherConfig',
      language: 'typescript',
      code: `interface LauncherConfig {
  showSearch?: boolean;
  showCategoryTabs?: boolean;
  showStatusFilter?: boolean;
  showViewToggle?: boolean;
  defaultViewMode?: LauncherViewMode;
  defaultGroupBy?: LauncherGroupBy;
  emptyMessage?: string;
  noResultsMessage?: string;
  enableFavorites?: boolean;
  enableRecent?: boolean;
  maxRecentApps?: number;
  storageKeyPrefix?: string;
  defaultMenuActions?: LauncherDefaultMenuActions;
  cardMinWidth?: number;
  cardMaxWidth?: number;
  cardGap?: number;
}`,
    },
    {
      label: 'LauncherCategory',
      language: 'typescript',
      code: `interface LauncherCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  order?: number;
  color?: string;
}`,
    },
  ];

  onAppClick(event: { app: LauncherApp }): void {
    this.lastClicked.set(event.app.name);
  }

  toggleFavorite(app: LauncherApp): void {
    const favs = this.favoriteApps();
    if (favs.includes(app.id)) {
      this.favoriteApps.set(favs.filter((id) => id !== app.id));
    } else {
      this.favoriteApps.set([...favs, app.id]);
    }
  }

  togglePin(app: LauncherApp): void {
    const pins = this.pinnedApps();
    if (pins.includes(app.id)) {
      this.pinnedApps.set(pins.filter((id) => id !== app.id));
    } else {
      this.pinnedApps.set([...pins, app.id]);
    }
  }
}
