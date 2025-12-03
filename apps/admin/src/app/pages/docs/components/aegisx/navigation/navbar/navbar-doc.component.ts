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
  AxNavbarComponent,
  AxNavbarBrandComponent,
  AxNavbarNavComponent,
  AxNavItemComponent,
  AxNavbarActionsComponent,
  AxNavbarIconButtonComponent,
  AxNavbarUserComponent,
  NavbarUser,
  NavbarUserMenuItem,
  NavbarColor,
} from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { CodeTab, ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'app-navbar-doc',
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
    AxNavbarComponent,
    AxNavbarBrandComponent,
    AxNavbarNavComponent,
    AxNavItemComponent,
    AxNavbarActionsComponent,
    AxNavbarIconButtonComponent,
    AxNavbarUserComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="navbar-doc">
      <ax-doc-header
        title="Navbar"
        icon="menu"
        description="Enterprise-grade navigation bar with brand, navigation items, actions, and user menu. Supports multiple variants, positions, and responsive mobile menu."
        [breadcrumbs]="[
          {
            label: 'Navigation',
            link: '/docs/components/aegisx/navigation/stepper',
          },
          { label: 'Navbar' },
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
                The
                <code class="bg-surface-container px-2 py-1 rounded"
                  >ax-navbar</code
                >
                component provides a flexible, enterprise-grade navigation bar
                with support for branding, navigation items, action buttons, and
                user menus. Built with Material Design principles and full
                responsiveness.
              </p>
              <a routerLink="/navbar-demo" class="open-demo-btn">
                <mat-icon>open_in_new</mat-icon>
                View Full Demo
              </a>
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
              <mat-card appearance="outlined" class="p-0 overflow-hidden">
                <ax-navbar variant="solid" color="ocean">
                  <ng-container axNavbarStart>
                    <ax-navbar-brand
                      name="Rocket App"
                      logo="assets/rocket-logo-white.svg"
                      logoHeight="28px"
                    ></ax-navbar-brand>
                  </ng-container>

                  <ng-container axNavbarCenter>
                    <ax-navbar-nav>
                      <ax-nav-item
                        label="Dashboard"
                        icon="dashboard"
                        [isActive]="true"
                      ></ax-nav-item>
                      <ax-nav-item label="Projects" icon="folder"></ax-nav-item>
                      <ax-nav-item
                        label="Products"
                        icon="inventory"
                        [menu]="productMenu"
                      ></ax-nav-item>
                    </ax-navbar-nav>
                  </ng-container>

                  <ng-container axNavbarEnd>
                    <ax-navbar-actions>
                      <ax-navbar-icon-button
                        icon="search"
                        tooltip="Search"
                      ></ax-navbar-icon-button>
                      <ax-navbar-icon-button
                        icon="notifications"
                        [badge]="3"
                        tooltip="Notifications"
                      ></ax-navbar-icon-button>
                    </ax-navbar-actions>
                    <ax-navbar-user
                      [user]="demoUser"
                      [menuItems]="userMenuItems"
                      (menuAction)="onMenuAction($event)"
                    ></ax-navbar-user>
                  </ng-container>
                </ax-navbar>
              </mat-card>
              <p class="text-sm text-on-surface-variant mt-4">
                Last action:
                <span class="font-mono">{{ lastAction() }}</span>
              </p>
            </section>

            <!-- Variants -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Visual Variants</h3>
              <p class="text-on-surface-variant mb-4">
                4 visual variants available:
              </p>
              <div class="flex flex-wrap gap-2 mb-6">
                @for (variant of variants; track variant) {
                  <mat-chip-option [selected]="false">{{
                    variant
                  }}</mat-chip-option>
                }
              </div>
            </section>

            <!-- Color Variants -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">
                Color Variants (Clarity Design Inspired)
              </h3>
              <p class="text-on-surface-variant mb-4">
                8 color presets available for solid backgrounds with proper text
                contrast:
              </p>
              <div class="space-y-3">
                @for (color of colors; track color.value) {
                  <mat-card appearance="outlined" class="p-0 overflow-hidden">
                    <ax-navbar [color]="color.value">
                      <ng-container axNavbarStart>
                        <ax-navbar-brand name="AegisX"></ax-navbar-brand>
                      </ng-container>
                      <ng-container axNavbarCenter>
                        <ax-navbar-nav>
                          <ax-nav-item
                            label="Home"
                            [isActive]="true"
                          ></ax-nav-item>
                          <ax-nav-item label="Products"></ax-nav-item>
                          <ax-nav-item label="About"></ax-nav-item>
                        </ax-navbar-nav>
                      </ng-container>
                      <ng-container axNavbarEnd>
                        <span class="text-sm opacity-75 mr-4">{{
                          color.label
                        }}</span>
                        <ax-navbar-actions>
                          <ax-navbar-icon-button
                            icon="settings"
                          ></ax-navbar-icon-button>
                        </ax-navbar-actions>
                      </ng-container>
                    </ax-navbar>
                  </mat-card>
                }
              </div>
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
            <!-- Brand Logo/Icon Variants -->
            <section>
              <h3 class="text-xl font-semibold mb-4">
                Brand Logo &amp; Icon Variants
              </h3>
              <p class="text-on-surface-variant mb-4">
                The
                <code class="bg-surface-container px-2 py-1 rounded"
                  >ax-navbar-brand</code
                >
                component supports multiple logo options: SVG/image files,
                Material icons, or custom SVG icons registered via
                MatIconRegistry.
              </p>

              <!-- With SVG Logo File -->
              <div class="mb-6">
                <h4 class="font-medium mb-3 text-on-surface-variant">
                  1. SVG/Image Logo File
                </h4>
                <ax-live-preview title="Brand with SVG Logo">
                  <ax-navbar variant="solid" color="ocean">
                    <ng-container axNavbarStart>
                      <ax-navbar-brand
                        name="Rocket App"
                        logo="assets/rocket-logo-white.svg"
                        logoHeight="28px"
                      ></ax-navbar-brand>
                    </ng-container>
                    <ng-container axNavbarCenter>
                      <ax-navbar-nav>
                        <ax-nav-item
                          label="Home"
                          [isActive]="true"
                        ></ax-nav-item>
                        <ax-nav-item label="Products"></ax-nav-item>
                      </ax-navbar-nav>
                    </ng-container>
                  </ax-navbar>
                </ax-live-preview>
                <ax-code-tabs [tabs]="logoFileTabs"></ax-code-tabs>
              </div>

              <!-- With Material Icon -->
              <div class="mb-6">
                <h4 class="font-medium mb-3 text-on-surface-variant">
                  2. Material Icon
                </h4>
                <ax-live-preview title="Brand with Material Icon">
                  <ax-navbar variant="solid" color="royal">
                    <ng-container axNavbarStart>
                      <ax-navbar-brand
                        name="Enterprise App"
                        icon="business"
                      ></ax-navbar-brand>
                    </ng-container>
                    <ng-container axNavbarCenter>
                      <ax-navbar-nav>
                        <ax-nav-item
                          label="Dashboard"
                          icon="dashboard"
                          [isActive]="true"
                        ></ax-nav-item>
                        <ax-nav-item
                          label="Reports"
                          icon="assessment"
                        ></ax-nav-item>
                      </ax-navbar-nav>
                    </ng-container>
                  </ax-navbar>
                </ax-live-preview>
                <ax-code-tabs [tabs]="materialIconTabs"></ax-code-tabs>
              </div>

              <!-- With Custom SVG Icon (MatIconRegistry) -->
              <div class="mb-6">
                <h4 class="font-medium mb-3 text-on-surface-variant">
                  3. Custom SVG Icon (MatIconRegistry)
                </h4>
                <ax-live-preview title="Brand with Custom SVG Icon">
                  <ax-navbar variant="solid" color="primary">
                    <ng-container axNavbarStart>
                      <ax-navbar-brand
                        name="Custom Brand"
                        svgIcon="custom-logo"
                      ></ax-navbar-brand>
                    </ng-container>
                    <ng-container axNavbarCenter>
                      <ax-navbar-nav>
                        <ax-nav-item
                          label="Home"
                          [isActive]="true"
                        ></ax-nav-item>
                        <ax-nav-item label="Features"></ax-nav-item>
                      </ax-navbar-nav>
                    </ng-container>
                  </ax-navbar>
                </ax-live-preview>
                <ax-code-tabs [tabs]="svgIconTabs"></ax-code-tabs>
              </div>

              <!-- Text Only -->
              <div class="mb-6">
                <h4 class="font-medium mb-3 text-on-surface-variant">
                  4. Text Only (No Logo/Icon)
                </h4>
                <ax-live-preview title="Brand with Text Only">
                  <ax-navbar variant="bordered">
                    <ng-container axNavbarStart>
                      <ax-navbar-brand name="Simple Brand"></ax-navbar-brand>
                    </ng-container>
                    <ng-container axNavbarCenter>
                      <ax-navbar-nav>
                        <ax-nav-item
                          label="Home"
                          [isActive]="true"
                        ></ax-nav-item>
                        <ax-nav-item label="About"></ax-nav-item>
                      </ax-navbar-nav>
                    </ng-container>
                  </ax-navbar>
                </ax-live-preview>
                <ax-code-tabs [tabs]="textOnlyTabs"></ax-code-tabs>
              </div>
            </section>

            <!-- Nav Item with SVG Icons -->
            <section>
              <h3 class="text-xl font-semibold mb-4">
                Navigation Items with SVG Icons
              </h3>
              <p class="text-on-surface-variant mb-4">
                The
                <code class="bg-surface-container px-2 py-1 rounded"
                  >ax-nav-item</code
                >
                component also supports both Material icons and custom SVG
                icons.
              </p>
              <ax-live-preview title="Nav Items with Different Icon Types">
                <ax-navbar variant="solid" color="ocean">
                  <ng-container axNavbarStart>
                    <ax-navbar-brand
                      name="Icon Demo"
                      icon="widgets"
                    ></ax-navbar-brand>
                  </ng-container>
                  <ng-container axNavbarCenter>
                    <ax-navbar-nav>
                      <ax-nav-item
                        label="Dashboard"
                        icon="dashboard"
                        [isActive]="true"
                      ></ax-nav-item>
                      <ax-nav-item
                        label="Analytics"
                        icon="analytics"
                      ></ax-nav-item>
                      <ax-nav-item
                        label="Settings"
                        icon="settings"
                      ></ax-nav-item>
                      <ax-nav-item
                        label="Custom"
                        svgIcon="custom-icon"
                      ></ax-nav-item>
                    </ax-navbar-nav>
                  </ng-container>
                </ax-navbar>
              </ax-live-preview>
              <ax-code-tabs [tabs]="navItemIconTabs"></ax-code-tabs>
            </section>

            <!-- Navigation Alignment -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Navigation Alignment</h3>
              <p class="text-on-surface-variant mb-4">
                Use
                <code class="bg-surface-container px-2 py-1 rounded"
                  >navAlign</code
                >
                to control how navigation items are positioned within the center
                zone.
              </p>

              <!-- navAlign: start -->
              <div class="mb-6">
                <h4 class="font-medium mb-3 text-on-surface-variant">
                  navAlign="start"
                </h4>
                <ax-live-preview title="Navigation Aligned to Start">
                  <ax-navbar variant="bordered" navAlign="start">
                    <ng-container axNavbarStart>
                      <ax-navbar-brand
                        name="AegisX"
                        icon="widgets"
                      ></ax-navbar-brand>
                    </ng-container>
                    <ng-container axNavbarCenter>
                      <ax-navbar-nav>
                        <ax-nav-item
                          label="Home"
                          [isActive]="true"
                        ></ax-nav-item>
                        <ax-nav-item label="Products"></ax-nav-item>
                        <ax-nav-item label="About"></ax-nav-item>
                      </ax-navbar-nav>
                    </ng-container>
                    <ng-container axNavbarEnd>
                      <ax-navbar-actions>
                        <ax-navbar-icon-button
                          icon="search"
                        ></ax-navbar-icon-button>
                      </ax-navbar-actions>
                    </ng-container>
                  </ax-navbar>
                </ax-live-preview>
              </div>

              <!-- navAlign: center (default) -->
              <div class="mb-6">
                <h4 class="font-medium mb-3 text-on-surface-variant">
                  navAlign="center" (default)
                </h4>
                <ax-live-preview title="Navigation Centered">
                  <ax-navbar variant="bordered" navAlign="center">
                    <ng-container axNavbarStart>
                      <ax-navbar-brand
                        name="AegisX"
                        icon="widgets"
                      ></ax-navbar-brand>
                    </ng-container>
                    <ng-container axNavbarCenter>
                      <ax-navbar-nav>
                        <ax-nav-item
                          label="Home"
                          [isActive]="true"
                        ></ax-nav-item>
                        <ax-nav-item label="Products"></ax-nav-item>
                        <ax-nav-item label="About"></ax-nav-item>
                      </ax-navbar-nav>
                    </ng-container>
                    <ng-container axNavbarEnd>
                      <ax-navbar-actions>
                        <ax-navbar-icon-button
                          icon="search"
                        ></ax-navbar-icon-button>
                      </ax-navbar-actions>
                    </ng-container>
                  </ax-navbar>
                </ax-live-preview>
              </div>

              <!-- navAlign: end -->
              <div class="mb-6">
                <h4 class="font-medium mb-3 text-on-surface-variant">
                  navAlign="end"
                </h4>
                <ax-live-preview title="Navigation Aligned to End">
                  <ax-navbar variant="bordered" navAlign="end">
                    <ng-container axNavbarStart>
                      <ax-navbar-brand
                        name="AegisX"
                        icon="widgets"
                      ></ax-navbar-brand>
                    </ng-container>
                    <ng-container axNavbarCenter>
                      <ax-navbar-nav>
                        <ax-nav-item
                          label="Home"
                          [isActive]="true"
                        ></ax-nav-item>
                        <ax-nav-item label="Products"></ax-nav-item>
                        <ax-nav-item label="About"></ax-nav-item>
                      </ax-navbar-nav>
                    </ng-container>
                    <ng-container axNavbarEnd>
                      <ax-navbar-actions>
                        <ax-navbar-icon-button
                          icon="search"
                        ></ax-navbar-icon-button>
                      </ax-navbar-actions>
                    </ng-container>
                  </ax-navbar>
                </ax-live-preview>
              </div>

              <ax-code-tabs [tabs]="navAlignTabs"></ax-code-tabs>
            </section>

            <!-- Default Variant -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Default Variant</h3>
              <ax-live-preview title="Default Navbar">
                <ax-navbar variant="default">
                  <ng-container axNavbarStart>
                    <ax-navbar-brand name="Brand"></ax-navbar-brand>
                  </ng-container>
                  <ng-container axNavbarCenter>
                    <ax-navbar-nav>
                      <ax-nav-item label="Home" [isActive]="true"></ax-nav-item>
                      <ax-nav-item label="About"></ax-nav-item>
                      <ax-nav-item label="Contact"></ax-nav-item>
                    </ax-navbar-nav>
                  </ng-container>
                  <ng-container axNavbarEnd>
                    <ax-navbar-actions>
                      <ax-navbar-icon-button
                        icon="settings"
                      ></ax-navbar-icon-button>
                    </ax-navbar-actions>
                  </ng-container>
                </ax-navbar>
              </ax-live-preview>
            </section>

            <!-- Bordered Variant -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Bordered Variant</h3>
              <ax-live-preview title="Bordered Navbar">
                <ax-navbar variant="bordered">
                  <ng-container axNavbarStart>
                    <ax-navbar-brand
                      name="Enterprise"
                      icon="business"
                    ></ax-navbar-brand>
                  </ng-container>
                  <ng-container axNavbarCenter>
                    <ax-navbar-nav>
                      <ax-nav-item
                        label="Dashboard"
                        icon="dashboard"
                      ></ax-nav-item>
                      <ax-nav-item
                        label="Reports"
                        icon="assessment"
                      ></ax-nav-item>
                      <ax-nav-item
                        label="Settings"
                        icon="settings"
                      ></ax-nav-item>
                    </ax-navbar-nav>
                  </ng-container>
                  <ng-container axNavbarEnd>
                    <ax-navbar-user
                      [user]="demoUser"
                      [menuItems]="userMenuItems"
                    ></ax-navbar-user>
                  </ng-container>
                </ax-navbar>
              </ax-live-preview>
            </section>

            <!-- With Dropdown Menu -->
            <section>
              <h3 class="text-xl font-semibold mb-4">With Dropdown Menu</h3>
              <ax-live-preview title="Navbar with Dropdown">
                <ax-navbar variant="solid">
                  <ng-container axNavbarStart>
                    <ax-navbar-brand name="Menu Demo"></ax-navbar-brand>
                  </ng-container>
                  <ng-container axNavbarCenter>
                    <ax-navbar-nav>
                      <ax-nav-item label="Home"></ax-nav-item>
                      <ax-nav-item
                        label="Products"
                        [menu]="productMenu"
                      ></ax-nav-item>
                      <ax-nav-item
                        label="Resources"
                        [menu]="resourceMenu"
                      ></ax-nav-item>
                    </ax-navbar-nav>
                  </ng-container>
                </ax-navbar>
              </ax-live-preview>
              <ax-code-tabs [tabs]="dropdownTabs"></ax-code-tabs>
            </section>

            <!-- With Actions and User -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Full Featured Navbar</h3>
              <ax-live-preview title="Complete Navbar with All Features">
                <ax-navbar variant="solid" shadow="md">
                  <ng-container axNavbarStart>
                    <ax-navbar-brand
                      name="AegisX Platform"
                      logo="assets/logo.svg"
                    ></ax-navbar-brand>
                  </ng-container>

                  <ng-container axNavbarCenter>
                    <ax-navbar-nav>
                      <ax-nav-item
                        label="Dashboard"
                        icon="dashboard"
                        [isActive]="true"
                      ></ax-nav-item>
                      <ax-nav-item
                        label="Analytics"
                        icon="analytics"
                      ></ax-nav-item>
                      <ax-nav-item
                        label="Projects"
                        icon="folder"
                        badge="new_releases"
                      ></ax-nav-item>
                      <ax-nav-item
                        label="More"
                        icon="more_horiz"
                        [menu]="moreMenu"
                      ></ax-nav-item>
                    </ax-navbar-nav>
                  </ng-container>

                  <ng-container axNavbarEnd>
                    <ax-navbar-actions>
                      <ax-navbar-icon-button
                        icon="search"
                        tooltip="Search"
                        size="sm"
                      ></ax-navbar-icon-button>
                      <ax-navbar-icon-button
                        icon="notifications"
                        [badge]="5"
                        tooltip="Notifications"
                      ></ax-navbar-icon-button>
                      <ax-navbar-icon-button
                        icon="apps"
                        tooltip="Apps"
                      ></ax-navbar-icon-button>
                    </ax-navbar-actions>
                    <ax-navbar-user
                      [user]="demoUser"
                      [menuItems]="userMenuItems"
                      [showInfo]="true"
                      (menuAction)="onMenuAction($event)"
                    ></ax-navbar-user>
                  </ng-container>
                </ax-navbar>
              </ax-live-preview>
              <ax-code-tabs [tabs]="fullFeatureTabs"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="navbar-doc__tab-content">
            <!-- ax-navbar Properties -->
            <section class="navbar-doc__section">
              <h2>ax-navbar Properties</h2>
              <p>Main navbar container component.</p>
              <div class="navbar-doc__api-table">
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
                          >'default' | 'transparent' | 'solid' |
                          'bordered'</code
                        >
                      </td>
                      <td><code>'default'</code></td>
                      <td>Visual style variant</td>
                    </tr>
                    <tr>
                      <td><code>color</code></td>
                      <td>
                        <code
                          >'default' | 'primary' | 'charcoal' | 'slate' |
                          'slate-dark' | 'ocean' | 'ocean-dark' | 'royal' |
                          'royal-dark' | 'forest' | 'amber'</code
                        >
                      </td>
                      <td><code>'default'</code></td>
                      <td>Background color preset</td>
                    </tr>
                    <tr>
                      <td><code>position</code></td>
                      <td><code>'fixed' | 'sticky' | 'static'</code></td>
                      <td><code>'static'</code></td>
                      <td>Navbar positioning</td>
                    </tr>
                    <tr>
                      <td><code>height</code></td>
                      <td><code>'sm' | 'md' | 'lg'</code></td>
                      <td><code>'md'</code></td>
                      <td>Navbar height</td>
                    </tr>
                    <tr>
                      <td><code>shadow</code></td>
                      <td><code>'none' | 'sm' | 'md' | 'lg'</code></td>
                      <td><code>'none'</code></td>
                      <td>Box shadow intensity</td>
                    </tr>
                    <tr>
                      <td><code>blur</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Apply backdrop blur effect</td>
                    </tr>
                    <tr>
                      <td><code>hideOnScroll</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Hide navbar when scrolling down</td>
                    </tr>
                    <tr>
                      <td><code>mobileBreakpoint</code></td>
                      <td><code>number</code></td>
                      <td><code>768</code></td>
                      <td>Breakpoint for mobile menu</td>
                    </tr>
                    <tr>
                      <td><code>navAlign</code></td>
                      <td><code>'start' | 'center' | 'end'</code></td>
                      <td><code>'center'</code></td>
                      <td>Alignment of center zone navigation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- ax-navbar-brand Properties -->
            <section class="navbar-doc__section">
              <h2>ax-navbar-brand Properties</h2>
              <p>Brand/logo component for the navbar.</p>
              <div class="navbar-doc__api-table">
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
                      <td><code>name</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Brand name text</td>
                    </tr>
                    <tr>
                      <td><code>logo</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Path to SVG/image file</td>
                    </tr>
                    <tr>
                      <td><code>logoHeight</code></td>
                      <td><code>string</code></td>
                      <td><code>'24px'</code></td>
                      <td>Logo image height</td>
                    </tr>
                    <tr>
                      <td><code>icon</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Material icon name</td>
                    </tr>
                    <tr>
                      <td><code>svgIcon</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Custom SVG icon (MatIconRegistry)</td>
                    </tr>
                    <tr>
                      <td><code>routerLink</code></td>
                      <td><code>string | string[]</code></td>
                      <td><code>undefined</code></td>
                      <td>Navigation link</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- ax-nav-item Properties -->
            <section class="navbar-doc__section">
              <h2>ax-nav-item Properties</h2>
              <p>Individual navigation item with optional dropdown.</p>
              <div class="navbar-doc__api-table">
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
                      <td><code>label</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Navigation item text</td>
                    </tr>
                    <tr>
                      <td><code>icon</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Material icon name</td>
                    </tr>
                    <tr>
                      <td><code>svgIcon</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Custom SVG icon</td>
                    </tr>
                    <tr>
                      <td><code>routerLink</code></td>
                      <td><code>string | string[]</code></td>
                      <td><code>undefined</code></td>
                      <td>Navigation link</td>
                    </tr>
                    <tr>
                      <td><code>menu</code></td>
                      <td><code>NavbarMenuItem[]</code></td>
                      <td><code>undefined</code></td>
                      <td>Dropdown menu items</td>
                    </tr>
                    <tr>
                      <td><code>isActive</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Active state indicator</td>
                    </tr>
                    <tr>
                      <td><code>badge</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Badge icon name</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- ax-navbar-icon-button Properties -->
            <section class="navbar-doc__section">
              <h2>ax-navbar-icon-button Properties</h2>
              <p>Icon button for navbar actions.</p>
              <div class="navbar-doc__api-table">
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
                      <td><code>icon</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Material icon name</td>
                    </tr>
                    <tr>
                      <td><code>badge</code></td>
                      <td><code>number | string</code></td>
                      <td><code>undefined</code></td>
                      <td>Badge content</td>
                    </tr>
                    <tr>
                      <td><code>tooltip</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Tooltip text</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td><code>'sm' | 'md' | 'lg'</code></td>
                      <td><code>'md'</code></td>
                      <td>Button size</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- ax-navbar-user Properties -->
            <section class="navbar-doc__section">
              <h2>ax-navbar-user Properties</h2>
              <p>User profile dropdown menu.</p>
              <div class="navbar-doc__api-table">
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
                      <td><code>user</code></td>
                      <td><code>NavbarUser</code></td>
                      <td><code>required</code></td>
                      <td>User data object</td>
                    </tr>
                    <tr>
                      <td><code>menuItems</code></td>
                      <td><code>NavbarUserMenuItem[]</code></td>
                      <td><code>[]</code></td>
                      <td>Menu items array</td>
                    </tr>
                    <tr>
                      <td><code>showInfo</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Show name/role in dropdown</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Content Projection Slots -->
            <section class="navbar-doc__section">
              <h2>Content Projection Slots</h2>
              <p>Use attribute selectors for content projection.</p>
              <div class="navbar-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Slot</th>
                      <th>Selector</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>start</code></td>
                      <td><code>[axNavbarStart]</code></td>
                      <td>Left section (brand)</td>
                    </tr>
                    <tr>
                      <td><code>center</code></td>
                      <td><code>[axNavbarCenter]</code></td>
                      <td>Center section (navigation)</td>
                    </tr>
                    <tr>
                      <td><code>end</code></td>
                      <td><code>[axNavbarEnd]</code></td>
                      <td>Right section (actions, user)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Interfaces -->
            <section class="navbar-doc__section">
              <h2>Interfaces</h2>
              <ax-code-tabs [tabs]="interfaceTabs"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="py-6">
            <ax-component-tokens [tokens]="navbarTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="navbar-doc__tab-content">
            <section class="navbar-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="navbar-doc__guidelines">
                <div class="navbar-doc__guideline navbar-doc__guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>
                      Use consistent navbar variant across your application
                    </li>
                    <li>Limit navigation items to 5-7 for clarity</li>
                    <li>Use icons with labels for better accessibility</li>
                    <li>Group related actions together</li>
                    <li>Use dropdown menus for secondary navigation</li>
                    <li>Provide clear visual feedback for active states</li>
                  </ul>
                </div>

                <div class="navbar-doc__guideline navbar-doc__guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Overcrowd the navbar with too many items</li>
                    <li>Use deep nested dropdown menus (max 2 levels)</li>
                    <li>Mix different navbar variants on the same page</li>
                    <li>Hide essential navigation behind menus</li>
                    <li>Use low contrast colors for text</li>
                    <li>Forget mobile responsive behavior</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="navbar-doc__section">
              <h2>Accessibility</h2>
              <ul class="navbar-doc__a11y-list">
                <li>
                  All navigation items are keyboard accessible with Tab and
                  Enter keys
                </li>
                <li>
                  ARIA labels are automatically applied for screen readers
                </li>
                <li>Color variants ensure WCAG 2.1 AA contrast compliance</li>
                <li>
                  Mobile menu provides touch-friendly targets (48px minimum)
                </li>
              </ul>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .navbar-doc {
        max-width: 1200px;
        margin: 0 auto;
      }

      /* Reset navbar position for documentation demos */
      ax-navbar {
        position: relative !important;
      }

      /* Disable hide-on-scroll animation for demos */
      :host ::ng-deep .ax-navbar {
        transform: none !important;
        animation: none !important;
      }

      /* Open Demo Button - consistent with Theme Builder style */
      .open-demo-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--ax-primary, #6366f1);
        color: white;
        border-radius: 9999px;
        font-size: 0.9375rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        &:hover {
          background: var(--ax-primary-dark, #4f46e5);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }

      /* API Tab Styles - matching Card doc standard */
      .navbar-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .navbar-doc__section {
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

      .navbar-doc__api-table {
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
      .navbar-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .navbar-doc__guideline {
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

      .navbar-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .navbar-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      .navbar-doc__a11y-list {
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
export class NavbarDocComponent {
  lastAction = signal<string>('None');

  features = [
    {
      icon: 'view_quilt',
      title: '3-Zone Layout',
      description: 'Flexible start, center, and end content areas',
    },
    {
      icon: 'style',
      title: 'Multiple Variants',
      description: 'Default, transparent, solid, and bordered styles',
    },
    {
      icon: 'smartphone',
      title: 'Responsive',
      description: 'Automatic mobile menu with hamburger toggle',
    },
    {
      icon: 'menu',
      title: 'Dropdown Menus',
      description: 'Support for nested navigation menus',
    },
    {
      icon: 'account_circle',
      title: 'User Menu',
      description: 'Built-in user profile dropdown component',
    },
    {
      icon: 'notifications',
      title: 'Action Buttons',
      description: 'Icon buttons with badge support',
    },
    {
      icon: 'vertical_align_top',
      title: 'Position Options',
      description: 'Fixed, sticky, or static positioning',
    },
    {
      icon: 'dark_mode',
      title: 'Theme Support',
      description: 'Full dark mode compatibility',
    },
  ];

  variants = ['default', 'transparent', 'solid', 'bordered'];

  colors: { value: NavbarColor; label: string }[] = [
    { value: 'primary', label: 'Primary (Brand) - #6366f1' },
    { value: 'charcoal', label: 'Charcoal (Premium) - #18181b' },
    { value: 'slate', label: 'Slate (Neutral) - #334155' },
    { value: 'slate-dark', label: 'Slate Dark - #1e293b' },
    { value: 'ocean', label: 'Ocean (Trust) - #0369a1' },
    { value: 'ocean-dark', label: 'Ocean Dark - #0c4a6e' },
    { value: 'royal', label: 'Royal (Creative) - #7c3aed' },
    { value: 'royal-dark', label: 'Royal Dark - #5b21b6' },
    { value: 'forest', label: 'Forest (Growth) - #15803d' },
    { value: 'amber', label: 'Amber (Energy) - #92400e' },
  ];

  demoUser: NavbarUser = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    initials: 'JD',
    role: 'Administrator',
  };

  userMenuItems: NavbarUserMenuItem[] = [
    { label: 'Profile', icon: 'person', action: 'profile' },
    { label: 'Settings', icon: 'settings', action: 'settings' },
    { label: 'Help', icon: 'help', action: 'help' },
    { divider: true, label: '' },
    { label: 'Logout', icon: 'logout', action: 'logout', danger: true },
  ];

  productMenu = [
    { label: 'All Products', routerLink: '/products' },
    { label: 'Categories', routerLink: '/products/categories' },
    { divider: true, label: '' },
    { label: 'New Arrivals', routerLink: '/products/new' },
  ];

  resourceMenu = [
    { label: 'Documentation', routerLink: '/docs' },
    { label: 'API Reference', routerLink: '/api' },
    { label: 'Support', routerLink: '/support' },
  ];

  moreMenu = [
    { label: 'Reports', icon: 'assessment', routerLink: '/reports' },
    { label: 'Team', icon: 'people', routerLink: '/team' },
    { label: 'Settings', icon: 'settings', routerLink: '/settings' },
  ];

  displayedColumns = ['property', 'type', 'default', 'description'];

  navbarInputs = [
    {
      property: 'variant',
      type: "'default' | 'transparent' | 'solid' | 'bordered'",
      default: "'default'",
      description: 'Visual style variant',
    },
    {
      property: 'color',
      type: "'default' | 'primary' | 'charcoal' | 'slate' | 'slate-dark' | 'ocean' | 'ocean-dark' | 'royal' | 'royal-dark' | 'forest' | 'amber'",
      default: "'default'",
      description: 'Semantic color preset with diverse palette',
    },
    {
      property: 'position',
      type: "'fixed' | 'sticky' | 'static'",
      default: "'static'",
      description: 'Navbar positioning',
    },
    {
      property: 'height',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Navbar height',
    },
    {
      property: 'shadow',
      type: 'boolean',
      default: 'false',
      description: 'Show box shadow',
    },
    {
      property: 'blur',
      type: 'boolean',
      default: 'false',
      description: 'Apply backdrop blur effect',
    },
    {
      property: 'hideOnScroll',
      type: 'boolean',
      default: 'false',
      description: 'Hide navbar when scrolling down',
    },
    {
      property: 'mobileBreakpoint',
      type: 'number',
      default: '768',
      description: 'Breakpoint for mobile menu',
    },
  ];

  basicUsageTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-navbar variant="solid">
  <ng-container axNavbarStart>
    <ax-navbar-brand name="My App" logo="assets/logo.svg"></ax-navbar-brand>
  </ng-container>

  <ng-container axNavbarCenter>
    <ax-navbar-nav>
      <ax-nav-item label="Home" routerLink="/"></ax-nav-item>
      <ax-nav-item label="About" routerLink="/about"></ax-nav-item>
      <ax-nav-item label="Contact" routerLink="/contact"></ax-nav-item>
    </ax-navbar-nav>
  </ng-container>

  <ng-container axNavbarEnd>
    <ax-navbar-actions>
      <ax-navbar-icon-button icon="search"></ax-navbar-icon-button>
      <ax-navbar-icon-button icon="notifications" [badge]="3"></ax-navbar-icon-button>
    </ax-navbar-actions>
    <ax-navbar-user [user]="user" [menuItems]="menuItems"></ax-navbar-user>
  </ng-container>
</ax-navbar>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import {
  AxNavbarComponent,
  AxNavbarBrandComponent,
  AxNavbarNavComponent,
  AxNavItemComponent,
  AxNavbarActionsComponent,
  AxNavbarIconButtonComponent,
  AxNavbarUserComponent,
  NavbarUser,
  NavbarUserMenuItem,
} from '@aegisx/ui';

user: NavbarUser = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Admin',
};

menuItems: NavbarUserMenuItem[] = [
  { label: 'Profile', icon: 'person', action: 'profile' },
  { label: 'Settings', icon: 'settings', action: 'settings' },
  { divider: true, label: '' },
  { label: 'Logout', icon: 'logout', action: 'logout', danger: true },
];`,
    },
  ];

  dropdownTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-nav-item
  label="Products"
  [menu]="productMenu"
></ax-nav-item>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { NavbarMenuItem } from '@aegisx/ui';

productMenu: NavbarMenuItem[] = [
  { label: 'All Products', routerLink: '/products' },
  { label: 'Categories', routerLink: '/products/categories' },
  { divider: true, label: '' },
  { label: 'New Arrivals', routerLink: '/products/new', icon: 'new_releases' },
];`,
    },
  ];

  fullFeatureTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-navbar variant="solid" [shadow]="true">
  <ng-container axNavbarStart>
    <ax-navbar-brand
      name="AegisX Platform"
      logo="assets/logo.svg"
    ></ax-navbar-brand>
  </ng-container>

  <ng-container axNavbarCenter>
    <ax-navbar-nav>
      <ax-nav-item label="Dashboard" icon="dashboard" [isActive]="true"></ax-nav-item>
      <ax-nav-item label="Analytics" icon="analytics"></ax-nav-item>
      <ax-nav-item label="Projects" icon="folder" badge="new_releases"></ax-nav-item>
      <ax-nav-item label="More" icon="more_horiz" [menu]="moreMenu"></ax-nav-item>
    </ax-navbar-nav>
  </ng-container>

  <ng-container axNavbarEnd>
    <ax-navbar-actions>
      <ax-navbar-icon-button icon="search" tooltip="Search"></ax-navbar-icon-button>
      <ax-navbar-icon-button icon="notifications" [badge]="5" tooltip="Notifications"></ax-navbar-icon-button>
      <ax-navbar-icon-button icon="apps" tooltip="Apps"></ax-navbar-icon-button>
    </ax-navbar-actions>
    <ax-navbar-user
      [user]="user"
      [menuItems]="userMenuItems"
      [showInfo]="true"
      (menuAction)="onMenuAction($event)"
    ></ax-navbar-user>
  </ng-container>
</ax-navbar>`,
    },
  ];

  interfaceTabs: CodeTab[] = [
    {
      label: 'NavbarUser',
      language: 'typescript',
      code: `interface NavbarUser {
  name: string;
  email?: string;
  avatar?: string;
  initials?: string;
  role?: string;
}`,
    },
    {
      label: 'NavbarUserMenuItem',
      language: 'typescript',
      code: `interface NavbarUserMenuItem {
  label: string;
  icon?: string;
  action?: string;
  routerLink?: string | string[];
  href?: string;
  divider?: boolean;
  disabled?: boolean;
  danger?: boolean;
}`,
    },
    {
      label: 'NavbarMenuItem',
      language: 'typescript',
      code: `interface NavbarMenuItem {
  label: string;
  icon?: string;
  routerLink?: string | string[];
  href?: string;
  disabled?: boolean;
  divider?: boolean;
  children?: NavbarMenuItem[];
}`,
    },
  ];

  navbarTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-surface',
      usage: 'Navbar background (default)',
    },
    {
      category: 'Colors',
      cssVar: '--ax-on-surface',
      usage: 'Navbar text color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-surface-container',
      usage: 'Solid variant background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-primary',
      usage: 'Primary color variant background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-on-primary',
      usage: 'Text on primary background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-outline-variant',
      usage: 'Border color (bordered variant)',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-sm',
      usage: 'Small internal padding',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-md',
      usage: 'Medium internal padding',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-lg',
      usage: 'Large internal padding',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-xl',
      usage: 'Container horizontal padding',
    },
    {
      category: 'Shadows',
      cssVar: '--ax-shadow-sm',
      usage: 'Subtle shadow option',
    },
    {
      category: 'Shadows',
      cssVar: '--ax-shadow-md',
      usage: 'Medium shadow option',
    },
    {
      category: 'Shadows',
      cssVar: '--ax-shadow-lg',
      usage: 'Large shadow option',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-sm',
      usage: 'Small border radius for items',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-md',
      usage: 'Medium border radius',
    },
    {
      category: 'Typography',
      cssVar: '--ax-text-sm',
      usage: 'Nav item text size',
    },
    {
      category: 'Typography',
      cssVar: '--ax-font-medium',
      usage: 'Nav item font weight',
    },
  ];

  // Logo/Icon Example Tabs
  logoFileTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Using an SVG or image file as logo -->
<ax-navbar-brand
  name="Rocket App"
  logo="assets/rocket-logo.svg"
  logoHeight="28px"
></ax-navbar-brand>

<!-- PNG image -->
<ax-navbar-brand
  name="My Company"
  logo="assets/images/company-logo.png"
  logoHeight="32px"
></ax-navbar-brand>`,
    },
  ];

  materialIconTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Using Material icon -->
<ax-navbar-brand
  name="Enterprise App"
  icon="business"
></ax-navbar-brand>

<!-- Other Material icons -->
<ax-navbar-brand name="Admin" icon="admin_panel_settings"></ax-navbar-brand>
<ax-navbar-brand name="Dashboard" icon="dashboard"></ax-navbar-brand>
<ax-navbar-brand name="Store" icon="storefront"></ax-navbar-brand>`,
    },
  ];

  svgIconTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Using custom SVG icon registered via MatIconRegistry -->
<ax-navbar-brand
  name="Custom Brand"
  svgIcon="custom-logo"
></ax-navbar-brand>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({...})
export class AppComponent {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    // Register custom SVG icon
    this.iconRegistry.addSvgIcon(
      'custom-logo',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/custom-logo.svg')
    );

    // Or register from literal SVG string
    this.iconRegistry.addSvgIconLiteral(
      'my-icon',
      this.sanitizer.bypassSecurityTrustHtml(\`
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      \`)
    );
  }
}`,
    },
  ];

  textOnlyTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Text only - no logo or icon -->
<ax-navbar-brand name="Simple Brand"></ax-navbar-brand>

<!-- With routerLink -->
<ax-navbar-brand
  name="Home"
  routerLink="/"
></ax-navbar-brand>`,
    },
  ];

  navAlignTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Align navigation to start (left) -->
<ax-navbar navAlign="start">
  <ng-container axNavbarStart>
    <ax-navbar-brand name="Brand"></ax-navbar-brand>
  </ng-container>
  <ng-container axNavbarCenter>
    <ax-navbar-nav>
      <ax-nav-item label="Home"></ax-nav-item>
      <ax-nav-item label="Products"></ax-nav-item>
    </ax-navbar-nav>
  </ng-container>
</ax-navbar>

<!-- Align navigation to center (default) -->
<ax-navbar navAlign="center">...</ax-navbar>

<!-- Align navigation to end (right) -->
<ax-navbar navAlign="end">...</ax-navbar>`,
    },
  ];

  navItemIconTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Navigation items with different icon types -->
<ax-navbar-nav>
  <!-- Material icon -->
  <ax-nav-item label="Dashboard" icon="dashboard"></ax-nav-item>

  <!-- Another Material icon -->
  <ax-nav-item label="Analytics" icon="analytics"></ax-nav-item>

  <!-- Custom SVG icon (registered via MatIconRegistry) -->
  <ax-nav-item label="Custom" svgIcon="custom-icon"></ax-nav-item>

  <!-- With dropdown menu -->
  <ax-nav-item
    label="Products"
    icon="inventory"
    [menu]="productMenu"
  ></ax-nav-item>
</ax-navbar-nav>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

// Register custom SVG icon for nav items
constructor(
  private iconRegistry: MatIconRegistry,
  private sanitizer: DomSanitizer
) {
  this.iconRegistry.addSvgIcon(
    'custom-icon',
    this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/custom-icon.svg')
  );
}

// Menu items can also use svgIcon
productMenu = [
  { label: 'All Products', icon: 'inventory', routerLink: '/products' },
  { label: 'Custom Category', svgIcon: 'category-icon', routerLink: '/category' },
];`,
    },
  ];

  onMenuAction(action: string): void {
    this.lastAction.set(action);
    console.log('Menu action:', action);
  }
}
