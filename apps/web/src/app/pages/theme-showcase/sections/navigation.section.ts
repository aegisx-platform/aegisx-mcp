import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navigation-section',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatTabsModule,
    MatSidenavModule,
    MatDividerModule,
  ],
  template: `
    <div class="section-container">
      <h2 class="section-title">Navigation</h2>
      <p class="section-description">Toolbars, menus, tabs, and navigation components</p>

      <!-- Toolbar -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Toolbar</mat-card-title>
          <mat-card-subtitle>App header and navigation bar</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-toolbar color="primary">
            <button mat-icon-button>
              <mat-icon>menu</mat-icon>
            </button>
            <span class="spacer">Application Title</span>
            <button mat-icon-button>
              <mat-icon>favorite</mat-icon>
            </button>
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item>Option 1</button>
              <button mat-menu-item>Option 2</button>
              <button mat-menu-item>Option 3</button>
            </mat-menu>
          </mat-toolbar>

          <mat-toolbar>
            <button mat-button>Link 1</button>
            <button mat-button>Link 2</button>
            <button mat-button>Link 3</button>
          </mat-toolbar>
        </mat-card-content>
      </mat-card>

      <!-- Menu -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Menu</mat-card-title>
          <mat-card-subtitle>Dropdown and context menus</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="menu-container">
            <button mat-raised-button color="primary" [matMenuTriggerFor]="basicMenu">
              <mat-icon>menu</mat-icon>
              Open Menu
            </button>
            <mat-menu #basicMenu="matMenu">
              <button mat-menu-item>
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
              <button mat-menu-item>
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item>
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
            </mat-menu>

            <button mat-stroked-button [matMenuTriggerFor]="subMenu">
              <mat-icon>folder</mat-icon>
              Submenu
            </button>
            <mat-menu #subMenu="matMenu">
              <button mat-menu-item [matMenuTriggerFor]="subMenu2">
                <mat-icon>folder</mat-icon>
                <span>Subfolder</span>
                <mat-icon>arrow_right</mat-icon>
              </button>
            </mat-menu>
            <mat-menu #subMenu2="matMenu">
              <button mat-menu-item>Item 1</button>
              <button mat-menu-item>Item 2</button>
            </mat-menu>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tabs -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Tabs</mat-card-title>
          <mat-card-subtitle>Tab navigation between views</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Tab 1">
              <div class="tab-content">
                <p>Content for tab 1</p>
              </div>
            </mat-tab>
            <mat-tab label="Tab 2">
              <div class="tab-content">
                <p>Content for tab 2</p>
              </div>
            </mat-tab>
            <mat-tab label="Tab 3">
              <div class="tab-content">
                <p>Content for tab 3</p>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .section-container {
        display: flex;
        flex-direction: column;
        gap: var(--preset-spacing-lg, 36px);
      }

      .section-title {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--theme-text-primary);
        letter-spacing: -0.5px;
      }

      .section-description {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: var(--theme-text-secondary);
      }

      .component-card {
        border-radius: var(--preset-border-radius, 12px);
        box-shadow: var(--preset-shadow, 0 10px 15px rgba(0, 0, 0, 0.1));
        transition: var(--preset-transition, all 300ms ease-in-out);
      }

      .component-card mat-card-header {
        padding: var(--preset-spacing-base, 24px) var(--preset-spacing-base, 24px)
          var(--preset-spacing-md, 18px) var(--preset-spacing-base, 24px);
        border-bottom: 1px solid var(--theme-surface-border);
      }

      .component-card mat-card-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .component-card mat-card-subtitle {
        margin-top: 4px;
        font-size: 13px;
        color: var(--theme-text-secondary);
      }

      .component-card mat-card-content {
        padding: var(--preset-spacing-base, 24px);
      }

      mat-toolbar {
        margin-bottom: var(--preset-spacing-lg, 36px);

        &:last-child {
          margin-bottom: 0;
        }
      }

      .spacer {
        flex: 1 1 auto;
      }

      .menu-container {
        display: flex;
        gap: var(--preset-spacing-lg, 36px);
        flex-wrap: wrap;
      }

      .tab-content {
        padding: var(--preset-spacing-base, 24px);
        min-height: 200px;
      }

      mat-divider {
        margin: var(--preset-spacing-md, 18px) 0;
      }
    `,
  ],
})
export class NavigationSection {}
