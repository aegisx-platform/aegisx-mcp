import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
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
  NavbarNavAlign,
} from '@aegisx/ui';

@Component({
  selector: 'app-navbar-demo',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    AxNavbarComponent,
    AxNavbarBrandComponent,
    AxNavbarNavComponent,
    AxNavItemComponent,
    AxNavbarActionsComponent,
    AxNavbarIconButtonComponent,
    AxNavbarUserComponent,
  ],
  template: `
    <div class="navbar-demo-page">
      <!-- Fixed Navbar at top -->
      <ax-navbar
        [color]="selectedColor()"
        [navAlign]="selectedAlign()"
        position="fixed"
        shadow="md"
      >
        <ng-container axNavbarStart>
          <ax-navbar-brand
            name="Rocket Platform"
            logo="assets/rocket-logo-white.svg"
            logoHeight="28px"
            routerLink="/"
          ></ax-navbar-brand>
        </ng-container>

        <ng-container axNavbarCenter>
          <ax-navbar-nav>
            <ax-nav-item
              label="Dashboard"
              icon="dashboard"
              [isActive]="activeTab() === 'dashboard'"
              (itemClick)="setActiveTab('dashboard')"
            ></ax-nav-item>
            <ax-nav-item
              label="Projects"
              icon="folder"
              (itemClick)="setActiveTab('projects')"
            ></ax-nav-item>
            <ax-nav-item
              label="Analytics"
              icon="analytics"
              (itemClick)="setActiveTab('analytics')"
            ></ax-nav-item>
            <ax-nav-item
              label="Products"
              icon="inventory"
              [menu]="productMenu"
            ></ax-nav-item>
            <ax-nav-item
              label="Resources"
              icon="library_books"
              [menu]="resourceMenu"
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
              [badge]="notificationCount()"
              tooltip="Notifications"
              (buttonClick)="clearNotifications()"
            ></ax-navbar-icon-button>
            <ax-navbar-icon-button
              icon="apps"
              tooltip="Apps"
            ></ax-navbar-icon-button>
          </ax-navbar-actions>
          <ax-navbar-user
            [user]="currentUser"
            [menuItems]="userMenuItems"
            [showInfo]="true"
            (menuAction)="onUserMenuAction($event)"
          ></ax-navbar-user>
        </ng-container>
      </ax-navbar>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-content">
            <h1>Navbar Color Variants Demo</h1>
            <p>
              Interactive demonstration of semantic color themes for
              professional applications
            </p>

            <!-- Selectors -->
            <div class="selector-row">
              <mat-form-field appearance="outline" class="color-select">
                <mat-label>Navbar Color</mat-label>
                <mat-select
                  [value]="selectedColor()"
                  (selectionChange)="setColor($event.value)"
                >
                  @for (color of colors; track color.value) {
                    <mat-option [value]="color.value">
                      <span class="color-option">
                        <span
                          class="color-swatch"
                          [style.background]="color.hex"
                        ></span>
                        {{ color.label }}
                      </span>
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="align-select">
                <mat-label>Menu Alignment</mat-label>
                <mat-select
                  [value]="selectedAlign()"
                  (selectionChange)="setAlign($event.value)"
                >
                  @for (align of alignments; track align.value) {
                    <mat-option [value]="align.value">
                      <span class="align-option">
                        <mat-icon>{{ align.icon }}</mat-icon>
                        {{ align.label }}
                      </span>
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </section>

        <!-- Dashboard Content -->
        <section class="dashboard-section">
          <div class="dashboard-grid">
            <!-- Stats Cards -->
            <div class="stat-card">
              <mat-icon class="stat-icon text-primary">trending_up</mat-icon>
              <div class="stat-info">
                <span class="stat-value">2,847</span>
                <span class="stat-label">Total Users</span>
              </div>
            </div>
            <div class="stat-card">
              <mat-icon class="stat-icon text-secondary"
                >shopping_cart</mat-icon
              >
              <div class="stat-info">
                <span class="stat-value">1,234</span>
                <span class="stat-label">Orders Today</span>
              </div>
            </div>
            <div class="stat-card">
              <mat-icon class="stat-icon text-tertiary">attach_money</mat-icon>
              <div class="stat-info">
                <span class="stat-value">$45,678</span>
                <span class="stat-label">Revenue</span>
              </div>
            </div>
            <div class="stat-card">
              <mat-icon class="stat-icon" style="color: #10b981"
                >check_circle</mat-icon
              >
              <div class="stat-info">
                <span class="stat-value">98.5%</span>
                <span class="stat-label">Success Rate</span>
              </div>
            </div>
          </div>

          <!-- Color Palette Preview -->
          <div class="color-palette-section">
            <h2>All Available Colors</h2>
            <div class="color-palette">
              @for (color of colors; track color.value) {
                <button
                  class="color-palette-item"
                  [class.active]="selectedColor() === color.value"
                  [style.background]="color.hex"
                  (click)="setColor(color.value)"
                >
                  <span class="color-name">{{ color.label }}</span>
                  <span class="color-hex">{{ color.hex }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Sample Content -->
          <div class="content-section">
            <h2>Sample Page Content</h2>
            <p>
              This demo page showcases the navbar component with Clarity Design
              inspired color variants. The navbar stays fixed at the top while
              you scroll through the content.
            </p>
            <p>
              Try selecting different colors from the dropdown above or clicking
              on the color palette to see how the navbar appearance changes. All
              colors are optimized for proper text contrast and accessibility.
            </p>

            <!-- Feature List -->
            <div class="feature-list">
              <div class="feature-item">
                <mat-icon>palette</mat-icon>
                <div>
                  <h4>10 Semantic Colors</h4>
                  <p>
                    Professional colors with meaning: Trust, Creative, Growth,
                    Energy
                  </p>
                </div>
              </div>
              <div class="feature-item">
                <mat-icon>contrast</mat-icon>
                <div>
                  <h4>Optimized Contrast</h4>
                  <p>WCAG compliant white text with proper opacity</p>
                </div>
              </div>
              <div class="feature-item">
                <mat-icon>business</mat-icon>
                <div>
                  <h4>Enterprise Ready</h4>
                  <p>Slate & Charcoal for corporate, Ocean for trust</p>
                </div>
              </div>
              <div class="feature-item">
                <mat-icon>devices</mat-icon>
                <div>
                  <h4>Fully Responsive</h4>
                  <p>Mobile menu with hamburger toggle on smaller screens</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Spacer for scroll testing -->
          <div class="scroll-spacer">
            <p class="text-center text-on-surface-variant">
              Scroll down to test the fixed navbar behavior
            </p>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      .navbar-demo-page {
        min-height: 100vh;
        background: var(--ax-background);
      }

      .main-content {
        padding-top: 64px; /* Account for fixed navbar */
      }

      .hero-section {
        background: linear-gradient(
          135deg,
          var(--ax-primary-container) 0%,
          var(--ax-secondary-container) 100%
        );
        padding: 4rem 2rem;
        text-align: center;
      }

      .hero-content {
        max-width: 800px;
        margin: 0 auto;
      }

      .hero-content h1 {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--ax-on-primary-container);
        margin-bottom: 1rem;
      }

      .hero-content p {
        font-size: 1.125rem;
        color: var(--ax-on-primary-container);
        opacity: 0.8;
        margin-bottom: 2rem;
      }

      .selector-row {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .color-select,
      .align-select {
        width: 240px;
      }

      .color-option,
      .align-option {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .align-option mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--ax-on-surface-variant);
      }

      .color-swatch {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .dashboard-section {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
      }

      .stat-card {
        background: var(--ax-surface-container-low);
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: var(--ax-shadow-sm);
      }

      .stat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ax-on-surface);
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--ax-on-surface-variant);
      }

      .color-palette-section {
        margin-bottom: 3rem;
      }

      .color-palette-section h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        color: var(--ax-on-surface);
      }

      .color-palette {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .color-palette-item {
        height: 100px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;
        color: white;
        font-weight: 500;
        transition: all 0.2s ease;
        box-shadow: var(--ax-shadow-sm);
      }

      .color-palette-item:hover {
        transform: translateY(-4px);
        box-shadow: var(--ax-shadow-md);
      }

      .color-palette-item.active {
        ring: 4px;
        outline: 4px solid var(--ax-primary);
        outline-offset: 2px;
      }

      .color-name {
        font-size: 0.875rem;
      }

      .color-hex {
        font-size: 0.75rem;
        opacity: 0.8;
        font-family: monospace;
      }

      .content-section {
        margin-bottom: 3rem;
      }

      .content-section h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--ax-on-surface);
      }

      .content-section p {
        color: var(--ax-on-surface-variant);
        line-height: 1.7;
        margin-bottom: 1rem;
      }

      .feature-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }

      .feature-item {
        display: flex;
        gap: 1rem;
        padding: 1.5rem;
        background: var(--ax-surface-container-low);
        border-radius: 12px;
      }

      .feature-item mat-icon {
        color: var(--ax-primary);
        font-size: 32px;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }

      .feature-item h4 {
        font-weight: 600;
        color: var(--ax-on-surface);
        margin-bottom: 0.25rem;
      }

      .feature-item p {
        font-size: 0.875rem;
        color: var(--ax-on-surface-variant);
        margin: 0;
      }

      .scroll-spacer {
        height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed var(--ax-outline-variant);
        border-radius: 12px;
        margin-top: 2rem;
      }
    `,
  ],
})
export class NavbarDemoComponent {
  selectedColor = signal<NavbarColor>('ocean');
  selectedAlign = signal<NavbarNavAlign>('center');
  activeTab = signal<string>('dashboard');
  notificationCount = signal<number>(5);

  colors: { value: NavbarColor; label: string; hex: string }[] = [
    { value: 'primary', label: 'Primary (Brand)', hex: '#6366f1' },
    { value: 'charcoal', label: 'Charcoal (Premium)', hex: '#18181b' },
    { value: 'slate', label: 'Slate (Neutral)', hex: '#334155' },
    { value: 'slate-dark', label: 'Slate Dark', hex: '#1e293b' },
    { value: 'ocean', label: 'Ocean (Trust)', hex: '#0369a1' },
    { value: 'ocean-dark', label: 'Ocean Dark', hex: '#0c4a6e' },
    { value: 'royal', label: 'Royal (Creative)', hex: '#7c3aed' },
    { value: 'royal-dark', label: 'Royal Dark', hex: '#5b21b6' },
    { value: 'forest', label: 'Forest (Growth)', hex: '#15803d' },
    { value: 'amber', label: 'Amber (Energy)', hex: '#92400e' },
  ];

  alignments: { value: NavbarNavAlign; label: string; icon: string }[] = [
    { value: 'start', label: 'Left', icon: 'format_align_left' },
    { value: 'center', label: 'Center', icon: 'format_align_center' },
    { value: 'end', label: 'Right', icon: 'format_align_right' },
  ];

  currentUser: NavbarUser = {
    name: 'John Doe',
    email: 'john.doe@aegisx.io',
    initials: 'JD',
    role: 'Administrator',
  };

  userMenuItems: NavbarUserMenuItem[] = [
    { label: 'Profile', icon: 'person', action: 'profile' },
    { label: 'Settings', icon: 'settings', action: 'settings' },
    { label: 'Help Center', icon: 'help', action: 'help' },
    { divider: true, label: '' },
    { label: 'Sign Out', icon: 'logout', action: 'logout', danger: true },
  ];

  productMenu = [
    { label: 'All Products', routerLink: '/products', icon: 'inventory_2' },
    { label: 'Categories', routerLink: '/categories', icon: 'category' },
    { label: 'Inventory', routerLink: '/inventory', icon: 'warehouse' },
    { divider: true, label: '' },
    { label: 'New Product', routerLink: '/products/new', icon: 'add_circle' },
  ];

  resourceMenu = [
    { label: 'Documentation', routerLink: '/docs', icon: 'description' },
    { label: 'API Reference', routerLink: '/api', icon: 'api' },
    { label: 'Community', href: 'https://github.com', icon: 'groups' },
    { label: 'Support', routerLink: '/support', icon: 'support_agent' },
  ];

  setColor(color: NavbarColor): void {
    this.selectedColor.set(color);
  }

  setAlign(align: NavbarNavAlign): void {
    this.selectedAlign.set(align);
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  clearNotifications(): void {
    this.notificationCount.set(0);
  }

  onUserMenuAction(action: string): void {
    console.log('User menu action:', action);
    if (action === 'logout') {
      alert('Logout clicked!');
    }
  }
}
