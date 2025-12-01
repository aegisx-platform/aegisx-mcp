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
  AxKbdComponent,
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
    AxKbdComponent,
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

            <!-- Keyboard Shortcuts -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Keyboard Shortcuts</h3>
              <p class="text-on-surface-variant mb-4">
                The Launcher supports keyboard navigation for power users.
              </p>
              <mat-card appearance="outlined" class="p-6">
                <div class="shortcuts-grid">
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+K"></ax-kbd>
                    <span>Open Launcher</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd>Up</ax-kbd>
                    <span>Previous App</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd>Down</ax-kbd>
                    <span>Next App</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd>Enter</ax-kbd>
                    <span>Open App</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd>Esc</ax-kbd>
                    <span>Close Launcher</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+F"></ax-kbd>
                    <span>Focus Search</span>
                  </div>
                </div>
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

            <!-- Bento Grid with gridSpan -->
            <section>
              <h3 class="text-xl font-semibold mb-4">
                Bento Grid with gridSpan
              </h3>
              <p class="text-on-surface-variant mb-4">
                Use
                <code class="bg-surface-container px-2 py-1 rounded"
                  >gridSpan</code
                >
                for precise control over card dimensions. Configure exact column
                and row spans.
              </p>
              <ax-live-preview title="Custom Grid Spans">
                <div
                  class="grid grid-cols-4 gap-4"
                  style="grid-auto-rows: minmax(140px, auto);"
                >
                  @for (app of featuredDemoApps; track app.id) {
                    <ax-launcher-card [app]="app" />
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
              <p class="text-on-surface-variant mb-4">
                The Launcher provides comprehensive keyboard navigation for
                power users and accessibility.
              </p>
              <mat-card appearance="outlined" class="p-6">
                <div class="shortcuts-list">
                  <div class="shortcut-row">
                    <ax-kbd shortcut="Ctrl+K"></ax-kbd>
                    <span>Open / Focus Search</span>
                  </div>
                  <div class="shortcut-row">
                    <ax-kbd>Esc</ax-kbd>
                    <span>Clear Search / Close</span>
                  </div>
                  <div class="shortcut-row">
                    <ax-kbd>Enter</ax-kbd>
                    <span>Open Focused App</span>
                  </div>
                  <div class="shortcut-row">
                    <ax-kbd>Up</ax-kbd>
                    <span>Previous App</span>
                  </div>
                  <div class="shortcut-row">
                    <ax-kbd>Down</ax-kbd>
                    <span>Next App</span>
                  </div>
                  <div class="shortcut-row">
                    <ax-kbd>Tab</ax-kbd>
                    <span>Navigate Categories</span>
                  </div>
                  <div class="shortcut-row">
                    <ax-kbd shortcut="Ctrl+F"></ax-kbd>
                    <span>Toggle Favorites</span>
                  </div>
                  <div class="shortcut-row">
                    <ax-kbd shortcut="Ctrl+Shift+P"></ax-kbd>
                    <span>Pin/Unpin App</span>
                  </div>
                </div>
              </mat-card>
            </section>

            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Platform Awareness</h3>
              <p class="text-on-surface-variant mb-4">
                The
                <code class="bg-surface-container px-2 py-1 rounded"
                  >ax-kbd</code
                >
                component automatically converts modifier keys based on the
                user's platform.
              </p>
              <mat-card appearance="outlined" class="p-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 class="font-semibold mb-3">macOS</h4>
                    <div class="space-y-2">
                      <div class="flex items-center gap-3">
                        <ax-kbd [keys]="['⌘', 'K']"></ax-kbd>
                        <span class="text-sm text-on-surface-variant"
                          >Command + K</span
                        >
                      </div>
                      <div class="flex items-center gap-3">
                        <ax-kbd [keys]="['⌥', '⇧', 'P']"></ax-kbd>
                        <span class="text-sm text-on-surface-variant"
                          >Option + Shift + P</span
                        >
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 class="font-semibold mb-3">Windows / Linux</h4>
                    <div class="space-y-2">
                      <div class="flex items-center gap-3">
                        <ax-kbd [keys]="['Ctrl', 'K']"></ax-kbd>
                        <span class="text-sm text-on-surface-variant"
                          >Control + K</span
                        >
                      </div>
                      <div class="flex items-center gap-3">
                        <ax-kbd [keys]="['Alt', 'Shift', 'P']"></ax-kbd>
                        <span class="text-sm text-on-surface-variant"
                          >Alt + Shift + P</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
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

      .shortcuts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .shortcut-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--ax-surface-container);
        border-radius: 0.5rem;
      }

      .shortcut-item span {
        color: var(--ax-on-surface-variant);
        font-size: 0.875rem;
      }

      .shortcuts-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .shortcut-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--ax-outline-variant);
      }

      .shortcut-row:last-child {
        border-bottom: none;
      }

      .shortcut-row ax-kbd {
        min-width: 120px;
      }

      .shortcut-row span {
        color: var(--ax-on-surface-variant);
        font-size: 0.875rem;
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

  featuredDemoApps: LauncherApp[] = [
    {
      id: 'main',
      name: 'Main App',
      description: 'Primary application with full feature access',
      icon: 'apps',
      color: 'blue',
      status: 'active',
      enabled: true,
      featured: true,
    },
    {
      id: 'quick1',
      name: 'Quick Action',
      icon: 'bolt',
      color: 'yellow',
      status: 'active',
      enabled: true,
      featured: true,
    },
    {
      id: 'quick2',
      name: 'Settings',
      icon: 'settings',
      color: 'neutral',
      status: 'active',
      enabled: true,
      featured: true,
    },
    {
      id: 'featured',
      name: 'Featured',
      description: 'Featured content and highlights',
      icon: 'star',
      color: 'lavender',
      status: 'active',
      enabled: true,
      featured: true,
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'View detailed statistics and insights',
      icon: 'analytics',
      color: 'mint',
      status: 'active',
      enabled: true,
      featured: true,
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: 'assessment',
      color: 'rose',
      status: 'new',
      enabled: true,
      featured: true,
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
      code: `<!-- gridSpan is automatically applied via CSS classes -->
<div class="grid grid-cols-4 gap-4" style="grid-auto-rows: minmax(140px, auto);">
  @for (app of featuredDemoApps; track app.id) {
    <ax-launcher-card [app]="app" />
  }
</div>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { LauncherApp, LauncherGridSpan } from '@aegisx/ui';

featuredDemoApps: LauncherApp[] = [
  {
    id: 'main',
    name: 'Main App',
    description: 'Primary application',
    icon: 'apps',
    color: 'blue',
    status: 'active',
    enabled: true,
    gridSpan: { cols: 2, rows: 2 }, // 2x2 large square
  },
  {
    id: 'quick1',
    name: 'Quick Action',
    icon: 'bolt',
    color: 'yellow',
    status: 'active',
    enabled: true,
    gridSpan: { cols: 1, rows: 1 }, // 1x1 default
  },
  {
    id: 'featured',
    name: 'Featured',
    description: 'Featured content',
    icon: 'star',
    color: 'lavender',
    status: 'active',
    enabled: true,
    gridSpan: { cols: 2, rows: 1 }, // Wide: 2 cols, 1 row
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: 'analytics',
    color: 'mint',
    status: 'active',
    enabled: true,
    gridSpan: { cols: 1, rows: 2 }, // Tall: 1 col, 2 rows
  },
];

// LauncherGridSpan interface
interface LauncherGridSpan {
  cols: 1 | 2 | 3 | 4;  // Number of columns to span
  rows: 1 | 2 | 3 | 4;  // Number of rows to span
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
