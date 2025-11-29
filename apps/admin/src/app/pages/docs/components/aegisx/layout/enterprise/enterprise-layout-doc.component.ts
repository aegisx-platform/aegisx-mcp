import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { DocHeaderComponent } from '../../../../../../components/docs/doc-header/doc-header.component';
import { CodeTabsComponent } from '../../../../../../components/docs/code-tabs/code-tabs.component';
import { PropsTableComponent } from '../../../../../../components/props-table/props-table.component';
import { CodeTab } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-enterprise-layout-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatTooltipModule,
    RouterLink,
    DocHeaderComponent,
    CodeTabsComponent,
    PropsTableComponent,
  ],
  template: `
    <div class="docs-page">
      <!-- Header -->
      <ax-doc-header
        title="Enterprise Layout"
        description="A full-width layout with horizontal navigation only. Ideal for data-intensive applications that need maximum horizontal space."
        category="Layout"
      />

      <!-- Overview -->
      <mat-card class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">Overview</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="text-secondary mb-4">
            Enterprise Layout เป็น layout ที่ออกแบบมาสำหรับ enterprise
            applications ที่ต้องการพื้นที่กว้างสำหรับแสดงข้อมูล เช่น dashboards,
            data tables, และ analytics
          </p>

          <div class="feature-grid">
            <div class="feature-item">
              <mat-icon class="feature-icon">view_column</mat-icon>
              <h4>Full-Width Content</h4>
              <p>ไม่มี sidebar ทำให้มีพื้นที่แนวนอนเต็มจอ</p>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">tab</mat-icon>
              <h4>Tab Navigation</h4>
              <p>Navigation แบบ tabs ที่ header ประหยัดพื้นที่</p>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">tune</mat-icon>
              <h4>Customizable</h4>
              <p>ปรับแต่ง header actions, user menu ได้ง่าย</p>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">speed</mat-icon>
              <h4>Loading Bar</h4>
              <p>Built-in loading bar สำหรับ async operations</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Preview -->
      <mat-card class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">Preview</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="preview-container">
            <div class="layout-preview">
              <!-- Mock Header -->
              <div class="mock-header">
                <div class="mock-brand">
                  <div class="mock-logo"></div>
                  <span>Enterprise App</span>
                </div>
                <div class="mock-nav">
                  <span class="mock-nav-item active">Dashboard</span>
                  <span class="mock-nav-item">Analytics</span>
                  <span class="mock-nav-item">Reports</span>
                  <span class="mock-nav-item">Settings</span>
                </div>
                <div class="mock-actions">
                  <div class="mock-icon"></div>
                  <div class="mock-icon"></div>
                  <div class="mock-avatar"></div>
                </div>
              </div>
              <!-- Mock Sub Nav -->
              <div class="mock-subnav">
                <span class="mock-tab active">Overview</span>
                <span class="mock-tab">Performance</span>
                <span class="mock-tab">Users</span>
                <span class="mock-tab">Revenue</span>
              </div>
              <!-- Mock Content -->
              <div class="mock-content">
                <div class="mock-card"></div>
                <div class="mock-card"></div>
                <div class="mock-card"></div>
                <div class="mock-card large"></div>
              </div>
              <!-- Mock Footer -->
              <div class="mock-footer">
                <span>© 2024 Enterprise App</span>
              </div>
            </div>
          </div>
          <p class="text-center text-subtle mt-4">
            Layout structure preview showing header, sub-navigation tabs, and
            full-width content area
          </p>
        </mat-card-content>
      </mat-card>

      <!-- Usage -->
      <mat-card class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">Usage</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h3 class="subsection-title">Basic Usage</h3>
          <ax-code-tabs [tabs]="basicUsageCode" />

          <h3 class="subsection-title mt-6">With Sub Navigation Tabs</h3>
          <ax-code-tabs [tabs]="withSubNavCode" />

          <h3 class="subsection-title mt-6">Navigation as Tabs</h3>
          <p class="text-secondary mb-4">
            ใช้ <code>showSubNavAsTabs</code> เพื่อแสดง navigation เป็น tabs แทน
            header links
          </p>
          <ax-code-tabs [tabs]="navAsTabsCode" />
        </mat-card-content>
      </mat-card>

      <!-- API -->
      <mat-card class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">API Reference</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h3 class="subsection-title">Inputs</h3>
          <ax-props-table [properties]="inputProps" />

          <h3 class="subsection-title mt-6">Outputs</h3>
          <ax-props-table [properties]="outputProps" />

          <h3 class="subsection-title mt-6">Content Projections</h3>
          <ax-props-table [properties]="contentProps" />

          <h3 class="subsection-title mt-6">EnterpriseNavItem Interface</h3>
          <ax-code-tabs [tabs]="interfaceCode" />
        </mat-card-content>
      </mat-card>

      <!-- App Theming -->
      <mat-card class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">App Theming</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="text-secondary mb-4">
            Enterprise Layout รองรับ app-specific theming
            ที่ช่วยให้แต่ละแอพมีสีที่แตกต่างกันได้ โดยไม่ขึ้นกับ global AegisX
            UI theme ทำให้สามารถสร้าง HIS, Inventory, Finance apps ที่มี
            identity ที่แตกต่างกันได้ง่าย
          </p>

          <h3 class="subsection-title">Available Preset Themes</h3>
          <p class="text-secondary mb-4">
            มี 9 preset themes พร้อมใช้งาน ออกแบบมาสำหรับ industry ต่างๆ
          </p>

          <div class="theme-grid">
            @for (theme of presetThemes; track theme.id) {
              <div class="theme-card">
                <div class="theme-preview" [style.background]="theme.headerBg">
                  <div class="theme-header-mock">
                    <div
                      class="theme-logo"
                      [style.background]="theme.primary"
                    ></div>
                    <span
                      class="theme-name-preview"
                      [style.color]="theme.headerText"
                      >{{ theme.name }}</span
                    >
                  </div>
                  <div
                    class="theme-indicator"
                    [style.background]="theme.tabIndicator"
                  ></div>
                </div>
                <div class="theme-info">
                  <span class="theme-id"
                    ><code>{{ theme.id }}</code></span
                  >
                  <span class="theme-desc">{{ theme.description }}</span>
                </div>
                <div class="theme-colors">
                  <div
                    class="color-swatch"
                    [style.background]="theme.primary"
                    [matTooltip]="'Primary: ' + theme.primary"
                  ></div>
                  <div
                    class="color-swatch"
                    [style.background]="theme.headerBg"
                    [matTooltip]="'Header: ' + theme.headerBg"
                  ></div>
                  <div
                    class="color-swatch"
                    [style.background]="theme.accent"
                    [matTooltip]="'Accent: ' + theme.accent"
                  ></div>
                </div>
              </div>
            }
          </div>

          <h3 class="subsection-title mt-6">Using Preset Theme</h3>
          <ax-code-tabs [tabs]="presetThemeCode" />

          <h3 class="subsection-title mt-6">Theme with Override</h3>
          <p class="text-secondary mb-4">
            สามารถ override บางค่าของ preset theme ได้ เช่น เปลี่ยนเฉพาะสี
            header
          </p>
          <ax-code-tabs [tabs]="themeOverrideCode" />

          <h3 class="subsection-title mt-6">Custom Theme Object</h3>
          <p class="text-secondary mb-4">
            สร้าง theme ของตัวเองได้โดยส่ง object ที่มี interface
            <code>EnterpriseAppTheme</code>
          </p>
          <ax-code-tabs [tabs]="customThemeCode" />

          <h3 class="subsection-title mt-6">EnterpriseAppTheme Interface</h3>
          <ax-code-tabs [tabs]="themeInterfaceCode" />
        </mat-card-content>
      </mat-card>

      <!-- Route-based Theme Configuration -->
      <mat-card class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">Route-based Theme Configuration</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="text-secondary mb-4">
            Enterprise Layout รองรับการเปลี่ยน theme, navigation และ app name
            ตาม route ได้ ทำให้สามารถสร้าง multi-app experience ภายใน
            application เดียวได้ เช่น
            <code>/medical/*</code> ใช้ theme medical,
            <code>/finance/*</code> ใช้ theme finance
          </p>

          <div class="feature-grid">
            <div class="feature-item">
              <mat-icon class="feature-icon">route</mat-icon>
              <h4>Dynamic Theme</h4>
              <p>เปลี่ยนสี theme อัตโนมัติตาม URL path</p>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">menu</mat-icon>
              <h4>Dynamic Navigation</h4>
              <p>แสดงเมนูที่แตกต่างกันในแต่ละ module</p>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">badge</mat-icon>
              <h4>Dynamic App Name</h4>
              <p>เปลี่ยนชื่อแอพตาม context ที่ใช้งาน</p>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">data_object</mat-icon>
              <h4>Route Data</h4>
              <p>กำหนดค่าผ่าน route data สะดวกจัดการ</p>
            </div>
          </div>

          <h3 class="subsection-title mt-6">
            Method 1: Using Computed Signals
          </h3>
          <p class="text-secondary mb-4">
            ใช้ Angular signals ร่วมกับ Router events เพื่อเปลี่ยน
            theme/navigation ตาม URL
          </p>
          <ax-code-tabs [tabs]="routeSignalsCode" />

          <h3 class="subsection-title mt-6">Method 2: Using Route Data</h3>
          <p class="text-secondary mb-4">
            กำหนด theme และ navigation ใน route configuration แล้วอ่านค่าจาก
            activated route วิธีนี้ช่วยให้ configuration อยู่รวมกันที่เดียว
            ง่ายต่อการจัดการ
          </p>
          <ax-code-tabs [tabs]="routeDataCode" />

          <h3 class="subsection-title mt-6">Method 3: Using a Theme Service</h3>
          <p class="text-secondary mb-4">
            สร้าง service กลางสำหรับจัดการ theme state เหมาะสำหรับ app
            ขนาดใหญ่ที่มีหลาย modules
          </p>
          <ax-code-tabs [tabs]="themeServiceCode" />

          <h3 class="subsection-title mt-6">Complete Example</h3>
          <p class="text-secondary mb-4">
            ตัวอย่างการรวมทุกอย่างเข้าด้วยกัน - Multi-module app ที่มี Medical,
            Finance และ HR modules
          </p>
          <ax-code-tabs [tabs]="completeExampleCode" />
        </mat-card-content>
      </mat-card>

      <!-- When to Use -->
      <mat-card class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">When to Use</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="usage-comparison">
            <div class="usage-column do">
              <h4>
                <mat-icon>check_circle</mat-icon> Use Enterprise Layout for:
              </h4>
              <ul>
                <li>Data-intensive dashboards</li>
                <li>Analytics and reporting pages</li>
                <li>Wide data tables and grids</li>
                <li>Monitoring and admin panels</li>
                <li>Apps that need maximum horizontal space</li>
              </ul>
            </div>
            <div class="usage-column dont">
              <h4><mat-icon>cancel</mat-icon> Consider Compact Layout for:</h4>
              <ul>
                <li>Deep navigation hierarchies (5+ levels)</li>
                <li>Content-focused applications</li>
                <li>Mobile-first applications</li>
                <li>Documentation sites</li>
                <li>Apps with many navigation items (20+)</li>
              </ul>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Demo Link -->
      <mat-card class="card-section demo-card">
        <mat-card-content>
          <div class="demo-content">
            <mat-icon class="demo-icon">open_in_new</mat-icon>
            <div class="demo-text">
              <h3>Try Enterprise Layout Demo</h3>
              <p>See the full working example in a separate page</p>
            </div>
            <a mat-flat-button color="primary" routerLink="/enterprise-demo">
              Open Demo
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .docs-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .card-section {
        margin-bottom: 1rem;
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0;
      }

      .subsection-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 1.5rem 0 0.75rem 0;
      }

      .text-secondary {
        color: var(--ax-text-secondary);
      }

      .text-subtle {
        color: var(--ax-text-subtle);
      }

      .text-center {
        text-align: center;
      }

      .mb-4 {
        margin-bottom: 1rem;
      }

      .mt-4 {
        margin-top: 1rem;
      }

      .mt-6 {
        margin-top: 1.5rem;
      }

      /* Feature Grid */
      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
      }

      .feature-item {
        padding: 1.25rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);

        h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0.75rem 0 0.5rem 0;
        }

        p {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          margin: 0;
          line-height: 1.5;
        }
      }

      .feature-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: var(--ax-brand-default);
      }

      /* Preview Container */
      .preview-container {
        padding: 1.5rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
      }

      .layout-preview {
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-md);
        overflow: hidden;
        box-shadow: var(--ax-shadow-lg);
      }

      .mock-header {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        background: var(--ax-surface-elevated);
        border-bottom: 1px solid var(--ax-border-subtle);
      }

      .mock-brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: var(--ax-text-heading);
      }

      .mock-logo {
        width: 24px;
        height: 24px;
        background: var(--ax-brand-default);
        border-radius: 4px;
      }

      .mock-nav {
        display: flex;
        gap: 0.5rem;
        margin-left: 2rem;
      }

      .mock-nav-item {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
        color: var(--ax-text-secondary);
        border-radius: 4px;

        &.active {
          color: var(--ax-brand-default);
          background: var(--ax-brand-faint);
        }
      }

      .mock-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
      }

      .mock-icon {
        width: 20px;
        height: 20px;
        background: var(--ax-text-subtle);
        border-radius: 4px;
        opacity: 0.5;
      }

      .mock-avatar {
        width: 24px;
        height: 24px;
        background: var(--ax-brand-default);
        border-radius: 50%;
      }

      .mock-subnav {
        display: flex;
        gap: 0.25rem;
        padding: 0.5rem 1rem;
        background: var(--ax-background-surface);
        border-bottom: 1px solid var(--ax-border-default);
      }

      .mock-tab {
        padding: 0.5rem 1rem;
        font-size: 0.8125rem;
        color: var(--ax-text-secondary);
        border-bottom: 2px solid transparent;

        &.active {
          color: var(--ax-brand-default);
          border-bottom-color: var(--ax-brand-default);
        }
      }

      .mock-content {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        padding: 1rem;
        min-height: 150px;
      }

      .mock-card {
        background: var(--ax-background-subtle);
        border-radius: 8px;
        border: 1px solid var(--ax-border-default);

        &.large {
          grid-column: span 3;
          height: 60px;
        }
      }

      .mock-footer {
        padding: 0.75rem 1rem;
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
        background: var(--ax-background-surface);
        border-top: 1px solid var(--ax-border-default);
      }

      /* Usage Comparison */
      .usage-comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .usage-column {
        padding: 1.25rem;
        border-radius: var(--ax-radius-lg);

        h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            padding: 0.5rem 0;
            font-size: 0.9375rem;
            color: var(--ax-text-primary);
            border-bottom: 1px solid var(--ax-border-default);

            &:last-child {
              border-bottom: none;
            }
          }
        }

        &.do {
          background: var(--ax-success-faint);
          border: 1px solid var(--ax-success-200);

          h4 {
            color: var(--ax-success-700);

            mat-icon {
              color: var(--ax-success-default);
            }
          }
        }

        &.dont {
          background: var(--ax-error-faint);
          border: 1px solid var(--ax-error-200);

          h4 {
            color: var(--ax-error-700);

            mat-icon {
              color: var(--ax-error-default);
            }
          }
        }
      }

      /* Demo Card */
      .demo-card {
        background: linear-gradient(
          135deg,
          var(--ax-brand-faint) 0%,
          var(--ax-background-surface) 100%
        );
        border: 1px solid var(--ax-brand-200);
      }

      .demo-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .demo-icon {
        font-size: 2.5rem;
        width: 2.5rem;
        height: 2.5rem;
        color: var(--ax-brand-default);
      }

      .demo-text {
        flex: 1;

        h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 0.25rem 0;
        }

        p {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          margin: 0;
        }
      }

      code {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 0.875em;
        padding: 0.125rem 0.375rem;
        background-color: var(--ax-background-muted);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-sm);
        color: var(--ax-text-heading);
      }

      /* Theme Grid */
      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .theme-card {
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;
        background: var(--ax-background-surface);
        transition:
          box-shadow 0.2s ease,
          transform 0.2s ease;

        &:hover {
          box-shadow: var(--ax-shadow-md);
          transform: translateY(-2px);
        }
      }

      .theme-preview {
        padding: 0.75rem;
        min-height: 60px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .theme-header-mock {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .theme-logo {
        width: 20px;
        height: 20px;
        border-radius: 4px;
      }

      .theme-name-preview {
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .theme-indicator {
        height: 3px;
        width: 40px;
        border-radius: 2px;
        margin-top: 0.5rem;
      }

      .theme-info {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--ax-border-default);
      }

      .theme-id {
        display: block;
        margin-bottom: 0.25rem;

        code {
          font-size: 0.8125rem;
          color: var(--ax-brand-default);
        }
      }

      .theme-desc {
        font-size: 0.75rem;
        color: var(--ax-text-secondary);
      }

      .theme-colors {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
      }

      .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: var(--ax-radius-sm);
        border: 2px solid var(--ax-background-surface);
        box-shadow: 0 0 0 1px var(--ax-border-default);
        cursor: help;
      }
    `,
  ],
})
export class EnterpriseLayoutDocComponent {
  // Preset themes data for display
  presetThemes = [
    {
      id: 'default',
      name: 'Default',
      description: 'General purpose apps',
      primary: '#6366f1',
      headerBg: '#0f172a',
      headerText: 'rgba(255, 255, 255, 0.8)',
      accent: '#14b8a6',
      tabIndicator: '#6366f1',
    },
    {
      id: 'medical',
      name: 'Medical / Healthcare',
      description: 'HIS, Hospital systems',
      primary: '#0891b2',
      headerBg: '#164e63',
      headerText: 'rgba(255, 255, 255, 0.85)',
      accent: '#10b981',
      tabIndicator: '#22d3ee',
    },
    {
      id: 'finance',
      name: 'Finance / Banking',
      description: 'Banking, Finance apps',
      primary: '#0d9488',
      headerBg: '#134e4a',
      headerText: 'rgba(255, 255, 255, 0.85)',
      accent: '#f59e0b',
      tabIndicator: '#2dd4bf',
    },
    {
      id: 'inventory',
      name: 'Inventory / Warehouse',
      description: 'Stock management',
      primary: '#7c3aed',
      headerBg: '#3b0764',
      headerText: 'rgba(255, 255, 255, 0.85)',
      accent: '#f97316',
      tabIndicator: '#a78bfa',
    },
    {
      id: 'hr',
      name: 'HR / Human Resources',
      description: 'HR management systems',
      primary: '#ec4899',
      headerBg: '#831843',
      headerText: 'rgba(255, 255, 255, 0.85)',
      accent: '#8b5cf6',
      tabIndicator: '#f472b6',
    },
    {
      id: 'education',
      name: 'Education / LMS',
      description: 'Learning management',
      primary: '#3b82f6',
      headerBg: '#1e3a8a',
      headerText: 'rgba(255, 255, 255, 0.85)',
      accent: '#10b981',
      tabIndicator: '#60a5fa',
    },
    {
      id: 'retail',
      name: 'Retail / POS',
      description: 'Point of sale systems',
      primary: '#f97316',
      headerBg: '#7c2d12',
      headerText: 'rgba(255, 255, 255, 0.85)',
      accent: '#84cc16',
      tabIndicator: '#fb923c',
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing / MES',
      description: 'Factory systems',
      primary: '#64748b',
      headerBg: '#1e293b',
      headerText: 'rgba(255, 255, 255, 0.85)',
      accent: '#eab308',
      tabIndicator: '#94a3b8',
    },
    {
      id: 'logistics',
      name: 'Logistics / TMS',
      description: 'Transport management',
      primary: '#059669',
      headerBg: '#064e3b',
      headerText: 'rgba(255, 255, 255, 0.85)',
      accent: '#0ea5e9',
      tabIndicator: '#34d399',
    },
  ];

  // Theme code examples
  presetThemeCode: CodeTab[] = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<!-- ใช้ preset theme โดยระบุชื่อ -->
<ax-enterprise-layout
  [appName]="'Hospital Information System'"
  [appTheme]="'medical'"
  [navigation]="navigation"
>
  <router-outlet></router-outlet>
</ax-enterprise-layout>

<!-- ตัวอย่าง themes อื่นๆ -->
<ax-enterprise-layout [appTheme]="'finance'" ... />
<ax-enterprise-layout [appTheme]="'inventory'" ... />
<ax-enterprise-layout [appTheme]="'hr'" ... />`,
    },
  ];

  themeOverrideCode: CodeTab[] = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<!-- ใช้ medical theme แต่เปลี่ยนสี header -->
<ax-enterprise-layout
  [appName]="'Custom Medical App'"
  [appTheme]="'medical'"
  [themeOverrides]="{
    headerBg: '#1a365d',
    primary: '#3182ce'
  }"
>
  <router-outlet></router-outlet>
</ax-enterprise-layout>`,
    },
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { EnterpriseAppThemeOverride } from '@aegisx/ui';

@Component({...})
export class AppComponent {
  // Override เฉพาะบางค่า
  themeOverrides: EnterpriseAppThemeOverride = {
    headerBg: '#1a365d',
    primary: '#3182ce',
    accent: '#38a169',
  };
}`,
    },
  ];

  customThemeCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { EnterpriseAppTheme } from '@aegisx/ui';

@Component({...})
export class AppComponent {
  // สร้าง custom theme ทั้งหมด
  customTheme: EnterpriseAppTheme = {
    id: 'my-app',
    name: 'My Custom App',
    primary: '#e11d48',
    primaryLight: '#fb7185',
    primaryDark: '#be123c',
    accent: '#facc15',
    headerBg: '#450a0a',
    headerText: 'rgba(255, 255, 255, 0.85)',
    headerTextHover: '#ffffff',
    headerActiveBg: 'rgba(225, 29, 72, 0.3)',
    subnavBg: '#7f1d1d',
    tabIndicator: '#fb7185',
    logoPlaceholderBg: '#e11d48',
    logoPlaceholderColor: '#ffffff',
    badgePrimary: '#e11d48',
    badgeAccent: '#facc15',
  };
}`,
    },
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<ax-enterprise-layout
  [appName]="'My Custom App'"
  [appTheme]="customTheme"
  [navigation]="navigation"
>
  <router-outlet></router-outlet>
</ax-enterprise-layout>`,
    },
  ];

  themeInterfaceCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `interface EnterpriseAppTheme {
  id: string;           // Theme identifier
  name: string;         // Display name

  // Primary colors
  primary: string;      // Primary brand color
  primaryLight?: string;  // Light variant
  primaryDark?: string;   // Dark variant
  accent?: string;      // Accent color for highlights

  // Header colors
  headerBg: string;           // Header background
  headerText: string;         // Header text color
  headerTextHover?: string;   // Text hover color
  headerActiveBg?: string;    // Active nav item background
  subnavBg?: string;          // Sub-navigation background
  tabIndicator?: string;      // Tab underline color

  // Logo colors
  logoPlaceholderBg?: string;    // Logo placeholder background
  logoPlaceholderColor?: string; // Logo placeholder icon color

  // Badge colors
  badgePrimary?: string;   // Primary badge
  badgeAccent?: string;    // Accent badge
}

// Available preset theme names
type EnterprisePresetTheme =
  | 'default'
  | 'medical'
  | 'finance'
  | 'inventory'
  | 'hr'
  | 'education'
  | 'retail'
  | 'manufacturing'
  | 'logistics';

// Input type - accepts preset name or custom object
type EnterpriseAppThemeInput = EnterprisePresetTheme | EnterpriseAppTheme;`,
    },
  ];

  basicUsageCode: CodeTab[] = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<ax-enterprise-layout
  [appName]="'My Enterprise App'"
  [navigation]="navigation"
  [showFooter]="true"
>
  <!-- Header Actions (Optional) -->
  <ng-template #headerActions>
    <button mat-icon-button>
      <mat-icon>notifications</mat-icon>
    </button>
  </ng-template>

  <!-- Main Content -->
  <router-outlet></router-outlet>
</ax-enterprise-layout>`,
    },
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { AxNavigationItem, AxEnterpriseLayoutComponent } from '@aegisx/ui';

@Component({
  imports: [AxEnterpriseLayoutComponent, RouterOutlet],
  // ...
})
export class AppComponent {
  navigation: AxNavigationItem[] = [
    { id: 'dashboard', title: 'Dashboard', link: '/dashboard', icon: 'dashboard' },
    { id: 'analytics', title: 'Analytics', link: '/analytics', icon: 'analytics' },
    { id: 'reports', title: 'Reports', link: '/reports', icon: 'assessment' },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      children: [
        { id: 'profile', title: 'Profile', link: '/settings/profile' },
        { id: 'account', title: 'Account', link: '/settings/account' },
      ],
    },
  ];
}`,
    },
  ];

  withSubNavCode: CodeTab[] = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<ax-enterprise-layout
  [appName]="'Analytics Platform'"
  [navigation]="mainNav"
  [subNavigation]="subNav"
>
  <router-outlet></router-outlet>
</ax-enterprise-layout>`,
    },
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `// Main navigation in header
mainNav: AxNavigationItem[] = [
  { id: 'dashboard', title: 'Dashboard', link: '/dashboard' },
  { id: 'analytics', title: 'Analytics', link: '/analytics' },
];

// Sub navigation tabs (below header)
subNav: AxNavigationItem[] = [
  { id: 'overview', title: 'Overview', link: '/analytics/overview' },
  { id: 'performance', title: 'Performance', link: '/analytics/performance' },
  { id: 'users', title: 'Users', link: '/analytics/users', badge: 'New' },
  { id: 'revenue', title: 'Revenue', link: '/analytics/revenue' },
];`,
    },
  ];

  navAsTabsCode: CodeTab[] = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<!-- Navigation displayed as tabs instead of header links -->
<ax-enterprise-layout
  [appName]="'Simple App'"
  [navigation]="navigation"
  [showSubNavAsTabs]="true"
>
  <router-outlet></router-outlet>
</ax-enterprise-layout>`,
    },
  ];

  interfaceCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `// ใช้ AxNavigationItem จาก @aegisx/ui
interface AxNavigationItem {
  id: string;
  title: string;
  link?: string;
  icon?: string;
  badge?: string | number;
  badgeColor?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
  children?: AxNavigationItem[];
}`,
    },
  ];

  inputProps = [
    {
      name: 'appName',
      type: 'string',
      default: "'Enterprise App'",
      description: 'Application name displayed in header',
    },
    {
      name: 'logoUrl',
      type: 'string | null',
      default: 'null',
      description: 'URL for custom logo image',
    },
    {
      name: 'appTheme',
      type: 'EnterprisePresetTheme | EnterpriseAppTheme',
      default: 'undefined',
      description: 'App-specific theme preset name or custom theme object',
    },
    {
      name: 'themeOverrides',
      type: 'EnterpriseAppThemeOverride',
      default: 'undefined',
      description: 'Partial theme overrides to customize preset themes',
    },
    {
      name: 'navigation',
      type: 'AxNavigationItem[]',
      default: '[]',
      description: 'Primary navigation items in header',
    },
    {
      name: 'subNavigation',
      type: 'AxNavigationItem[]',
      default: '[]',
      description: 'Sub-navigation tabs below header',
    },
    {
      name: 'showSubNavAsTabs',
      type: 'boolean',
      default: 'false',
      description: 'Display navigation as tabs instead of header links',
    },
    {
      name: 'showFooter',
      type: 'boolean',
      default: 'true',
      description: 'Show footer section',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      description: 'Remove max-width constraint on content',
    },
    {
      name: 'showSearch',
      type: 'boolean',
      default: 'true',
      description: 'Show search button in header',
    },
    {
      name: 'showDefaultUserMenu',
      type: 'boolean',
      default: 'true',
      description: 'Show default user menu if no custom userMenu provided',
    },
  ];

  outputProps = [
    {
      name: 'searchClicked',
      type: 'EventEmitter<void>',
      default: '-',
      description: 'Emitted when search button is clicked',
    },
    {
      name: 'logoutClicked',
      type: 'EventEmitter<void>',
      default: '-',
      description: 'Emitted when logout menu item is clicked',
    },
  ];

  contentProps = [
    {
      name: '#headerActions',
      type: 'TemplateRef',
      default: '-',
      description: 'Custom actions in header (e.g., notifications, settings)',
    },
    {
      name: '#userMenu',
      type: 'TemplateRef',
      default: '-',
      description: 'Custom user menu (replaces default)',
    },
    {
      name: '#footerContent',
      type: 'TemplateRef',
      default: '-',
      description: 'Custom footer content',
    },
  ];

  // Route-based Theme Configuration Code Examples
  routeSignalsCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'app.component.ts',
      code: `import { Component, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { EnterprisePresetTheme, AxNavigationItem } from '@aegisx/ui';

@Component({
  selector: 'app-root',
  template: \`
    <ax-enterprise-layout
      [appName]="currentAppName()"
      [appTheme]="currentTheme()"
      [navigation]="currentNavigation()"
    >
      <router-outlet />
    </ax-enterprise-layout>
  \`
})
export class AppComponent {
  private router = inject(Router);

  // Track current URL as signal
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  // Computed theme based on URL
  currentTheme = computed<EnterprisePresetTheme>(() => {
    const url = this.currentUrl();
    if (url.startsWith('/medical')) return 'medical';
    if (url.startsWith('/finance')) return 'finance';
    if (url.startsWith('/hr')) return 'hr';
    return 'default';
  });

  // Computed app name based on URL
  currentAppName = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/medical')) return 'Hospital System';
    if (url.startsWith('/finance')) return 'Finance Portal';
    if (url.startsWith('/hr')) return 'HR Management';
    return 'Enterprise App';
  });

  // Computed navigation based on URL
  currentNavigation = computed<AxNavigationItem[]>(() => {
    const url = this.currentUrl();
    if (url.startsWith('/medical')) return this.medicalNav;
    if (url.startsWith('/finance')) return this.financeNav;
    if (url.startsWith('/hr')) return this.hrNav;
    return this.defaultNav;
  });

  // Navigation configurations
  defaultNav: AxNavigationItem[] = [
    { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', link: '/' },
    { id: 'medical', title: 'Medical', icon: 'local_hospital', link: '/medical' },
    { id: 'finance', title: 'Finance', icon: 'account_balance', link: '/finance' },
    { id: 'hr', title: 'HR', icon: 'people', link: '/hr' },
  ];

  medicalNav: AxNavigationItem[] = [
    { id: 'patients', title: 'Patients', icon: 'people', link: '/medical/patients' },
    { id: 'appointments', title: 'Appointments', icon: 'event', link: '/medical/appointments' },
    { id: 'records', title: 'Records', icon: 'folder', link: '/medical/records' },
  ];

  financeNav: AxNavigationItem[] = [
    { id: 'accounts', title: 'Accounts', icon: 'account_balance', link: '/finance/accounts' },
    { id: 'transactions', title: 'Transactions', icon: 'receipt', link: '/finance/transactions' },
    { id: 'reports', title: 'Reports', icon: 'assessment', link: '/finance/reports' },
  ];

  hrNav: AxNavigationItem[] = [
    { id: 'employees', title: 'Employees', icon: 'badge', link: '/hr/employees' },
    { id: 'payroll', title: 'Payroll', icon: 'payments', link: '/hr/payroll' },
    { id: 'leave', title: 'Leave', icon: 'event_busy', link: '/hr/leave' },
  ];
}`,
    },
  ];

  routeDataCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'app.routes.ts',
      code: `import { Routes } from '@angular/router';
import { EnterprisePresetTheme, AxNavigationItem } from '@aegisx/ui';

// Define route data interface
interface AppRouteData {
  theme: EnterprisePresetTheme;
  appName: string;
  navigation: AxNavigationItem[];
}

export const routes: Routes = [
  {
    path: '',
    data: {
      theme: 'default',
      appName: 'Enterprise Portal',
      navigation: [
        { id: 'home', title: 'Home', icon: 'home', link: '/' },
        { id: 'medical', title: 'Medical', icon: 'local_hospital', link: '/medical' },
        { id: 'finance', title: 'Finance', icon: 'account_balance', link: '/finance' },
      ],
    } as AppRouteData,
    children: [
      { path: '', component: HomeComponent },
    ],
  },
  {
    path: 'medical',
    data: {
      theme: 'medical',
      appName: 'Hospital Information System',
      navigation: [
        { id: 'patients', title: 'Patients', icon: 'people', link: '/medical/patients' },
        { id: 'appointments', title: 'Appointments', icon: 'event', link: '/medical/appointments' },
        { id: 'pharmacy', title: 'Pharmacy', icon: 'medication', link: '/medical/pharmacy' },
      ],
    } as AppRouteData,
    children: [
      { path: 'patients', component: PatientsComponent },
      { path: 'appointments', component: AppointmentsComponent },
    ],
  },
  {
    path: 'finance',
    data: {
      theme: 'finance',
      appName: 'Finance Management',
      navigation: [
        { id: 'accounts', title: 'Accounts', icon: 'account_balance', link: '/finance/accounts' },
        { id: 'invoices', title: 'Invoices', icon: 'receipt_long', link: '/finance/invoices' },
      ],
    } as AppRouteData,
    children: [
      { path: 'accounts', component: AccountsComponent },
      { path: 'invoices', component: InvoicesComponent },
    ],
  },
];`,
    },
    {
      language: 'typescript' as const,
      label: 'app.component.ts',
      code: `import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: \`
    <ax-enterprise-layout
      [appName]="routeData()?.appName || 'Enterprise App'"
      [appTheme]="routeData()?.theme || 'default'"
      [navigation]="routeData()?.navigation || []"
    >
      <router-outlet />
    </ax-enterprise-layout>
  \`
})
export class AppComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Get route data as signal
  routeData = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        // Get the deepest activated route
        let child = this.route.firstChild;
        while (child?.firstChild) {
          child = child.firstChild;
        }
        return child?.snapshot.data || this.route.snapshot.data;
      })
    ),
    { initialValue: this.route.snapshot.data }
  );
}`,
    },
  ];

  themeServiceCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'app-theme.service.ts',
      code: `import { Injectable, signal, computed } from '@angular/core';
import { EnterprisePresetTheme, EnterpriseAppTheme, AxNavigationItem } from '@aegisx/ui';

interface AppConfig {
  theme: EnterprisePresetTheme | EnterpriseAppTheme;
  appName: string;
  navigation: AxNavigationItem[];
}

@Injectable({ providedIn: 'root' })
export class AppThemeService {
  // Private signals
  private _currentModule = signal<string>('default');

  // App configurations for each module
  private readonly moduleConfigs: Record<string, AppConfig> = {
    default: {
      theme: 'default',
      appName: 'Enterprise Portal',
      navigation: [
        { id: 'home', title: 'Home', icon: 'home', link: '/' },
        { id: 'modules', title: 'Modules', icon: 'apps', link: '/modules' },
      ],
    },
    medical: {
      theme: 'medical',
      appName: 'Hospital System',
      navigation: [
        { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', link: '/medical' },
        { id: 'patients', title: 'Patients', icon: 'people', link: '/medical/patients' },
        { id: 'appointments', title: 'Appointments', icon: 'event', link: '/medical/appointments' },
      ],
    },
    finance: {
      theme: 'finance',
      appName: 'Finance Portal',
      navigation: [
        { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', link: '/finance' },
        { id: 'accounts', title: 'Accounts', icon: 'account_balance', link: '/finance/accounts' },
        { id: 'reports', title: 'Reports', icon: 'assessment', link: '/finance/reports' },
      ],
    },
  };

  // Public computed signals
  readonly currentTheme = computed(() =>
    this.moduleConfigs[this._currentModule()]?.theme || 'default'
  );

  readonly currentAppName = computed(() =>
    this.moduleConfigs[this._currentModule()]?.appName || 'Enterprise App'
  );

  readonly currentNavigation = computed(() =>
    this.moduleConfigs[this._currentModule()]?.navigation || []
  );

  // Methods
  setModule(module: string): void {
    this._currentModule.set(module);
  }

  registerModule(name: string, config: AppConfig): void {
    this.moduleConfigs[name] = config;
  }
}`,
    },
    {
      language: 'typescript' as const,
      label: 'app.component.ts',
      code: `import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppThemeService } from './services/app-theme.service';

@Component({
  selector: 'app-root',
  template: \`
    <ax-enterprise-layout
      [appName]="themeService.currentAppName()"
      [appTheme]="themeService.currentTheme()"
      [navigation]="themeService.currentNavigation()"
    >
      <router-outlet />
    </ax-enterprise-layout>
  \`
})
export class AppComponent implements OnInit {
  protected themeService = inject(AppThemeService);
  private router = inject(Router);

  ngOnInit(): void {
    // Update theme on navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      const url = this.router.url;
      if (url.startsWith('/medical')) {
        this.themeService.setModule('medical');
      } else if (url.startsWith('/finance')) {
        this.themeService.setModule('finance');
      } else {
        this.themeService.setModule('default');
      }
    });
  }
}`,
    },
  ];

  completeExampleCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'Complete Example',
      code: `// ============================================
// app.routes.ts - Route Configuration
// ============================================
export const routes: Routes = [
  // Main portal (default theme)
  {
    path: '',
    component: PortalLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'modules', component: ModuleSelectorComponent },
    ],
  },

  // Medical module (medical theme)
  {
    path: 'medical',
    component: MedicalLayoutComponent,  // Uses medical theme
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: MedicalDashboardComponent },
      { path: 'patients', component: PatientsListComponent },
      { path: 'patients/:id', component: PatientDetailComponent },
      { path: 'appointments', component: AppointmentsComponent },
    ],
  },

  // Finance module (finance theme)
  {
    path: 'finance',
    component: FinanceLayoutComponent,  // Uses finance theme
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: FinanceDashboardComponent },
      { path: 'accounts', component: AccountsComponent },
      { path: 'transactions', component: TransactionsComponent },
    ],
  },
];

// ============================================
// medical-layout.component.ts
// ============================================
@Component({
  selector: 'app-medical-layout',
  template: \`
    <ax-enterprise-layout
      [appName]="'Hospital Information System'"
      [appTheme]="'medical'"
      [navigation]="navigation"
      [subNavigation]="subNav()"
    >
      <!-- Custom header actions -->
      <ng-template #headerActions>
        <button mat-icon-button matTooltip="Emergency">
          <mat-icon>emergency</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Notifications">
          <mat-icon>notifications</mat-icon>
        </button>
      </ng-template>

      <router-outlet />
    </ax-enterprise-layout>
  \`
})
export class MedicalLayoutComponent {
  private route = inject(ActivatedRoute);

  navigation: AxNavigationItem[] = [
    { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', link: '/medical/dashboard' },
    { id: 'patients', title: 'Patients', icon: 'people', link: '/medical/patients' },
    { id: 'appointments', title: 'Appointments', icon: 'event', link: '/medical/appointments' },
    { id: 'pharmacy', title: 'Pharmacy', icon: 'medication', link: '/medical/pharmacy' },
    { id: 'lab', title: 'Laboratory', icon: 'science', link: '/medical/lab' },
    { id: 'back', title: 'Back to Portal', icon: 'arrow_back', link: '/' },
  ];

  // Dynamic sub-navigation based on current route
  subNav = computed(() => {
    const url = this.route.snapshot.url.join('/');
    if (url.includes('patients')) {
      return [
        { id: 'list', title: 'All Patients', link: '/medical/patients' },
        { id: 'new', title: 'New Patient', link: '/medical/patients/new' },
        { id: 'search', title: 'Search', link: '/medical/patients/search' },
      ];
    }
    return [];
  });
}

// ============================================
// finance-layout.component.ts
// ============================================
@Component({
  selector: 'app-finance-layout',
  template: \`
    <ax-enterprise-layout
      [appName]="'Finance Management'"
      [appTheme]="'finance'"
      [navigation]="navigation"
    >
      <router-outlet />
    </ax-enterprise-layout>
  \`
})
export class FinanceLayoutComponent {
  navigation: AxNavigationItem[] = [
    { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', link: '/finance/dashboard' },
    { id: 'accounts', title: 'Accounts', icon: 'account_balance', link: '/finance/accounts' },
    { id: 'transactions', title: 'Transactions', icon: 'receipt', link: '/finance/transactions' },
    { id: 'reports', title: 'Reports', icon: 'assessment', link: '/finance/reports' },
    { id: 'back', title: 'Back to Portal', icon: 'arrow_back', link: '/' },
  ];
}`,
    },
  ];
}
