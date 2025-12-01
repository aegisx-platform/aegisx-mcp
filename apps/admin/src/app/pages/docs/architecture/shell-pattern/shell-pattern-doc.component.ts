import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DocHeaderComponent } from '../../../../components/docs/doc-header/doc-header.component';
import { CodeTabsComponent } from '../../../../components/docs/code-tabs/code-tabs.component';
import { PropsTableComponent } from '../../../../components/props-table/props-table.component';
import { CodeTab } from '../../../../types/docs.types';

@Component({
  selector: 'ax-shell-pattern-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    DocHeaderComponent,
    CodeTabsComponent,
    PropsTableComponent,
  ],
  template: `
    <article class="docs-article">
      <!-- Header -->
      <ax-doc-header
        title="Shell Pattern & Routing"
        description="มาตรฐานการใช้ Shell Components ร่วมกับ Angular Routing เพื่อจัดการ Layouts อย่างมีประสิทธิภาพ"
        category="Architecture"
      />

      <!-- Overview -->
      <section class="doc-section">
        <h2 class="section-title">Overview</h2>
        <p class="prose">
          Shell Pattern คือรูปแบบการออกแบบที่ใช้ "Shell Component"
          เป็นตัวกลางระหว่าง Route และ Layout เพื่อจัดการ layout อย่างมีระบบ ลด
          code ซ้ำซ้อน และง่ายต่อการ maintain
        </p>

        <div class="feature-grid">
          <div class="feature-item">
            <mat-icon class="feature-icon">layers</mat-icon>
            <h4>Separation of Concerns</h4>
            <p>แยก Layout Logic ออกจาก Business Logic</p>
          </div>
          <div class="feature-item">
            <mat-icon class="feature-icon">repeat</mat-icon>
            <h4>DRY Principle</h4>
            <p>Layout code อยู่ที่เดียว ไม่ต้องซ้ำทุก page</p>
          </div>
          <div class="feature-item">
            <mat-icon class="feature-icon">extension</mat-icon>
            <h4>Extensible</h4>
            <p>เพิ่ม shared elements ได้ง่าย (logo, footer, etc.)</p>
          </div>
          <div class="feature-item">
            <mat-icon class="feature-icon">security</mat-icon>
            <h4>Route-Level Guards</h4>
            <p>ใส่ Guards ที่ Shell level ใช้ได้กับทุก children</p>
          </div>
        </div>
      </section>

      <!-- Architecture Diagram -->
      <section class="doc-section">
        <h2 class="section-title">Architecture Diagram</h2>
        <div class="architecture-diagram">
          <div class="diagram-row">
            <div class="diagram-box router">
              <span class="box-label">Angular Router</span>
              <span class="box-detail">matches /login</span>
            </div>
          </div>
          <div class="diagram-arrow">
            <mat-icon>arrow_downward</mat-icon>
          </div>
          <div class="diagram-row">
            <div class="diagram-box shell">
              <span class="box-label">Shell Component</span>
              <span class="box-detail">AuthShellComponent</span>
            </div>
          </div>
          <div class="diagram-arrow">
            <mat-icon>arrow_downward</mat-icon>
          </div>
          <div class="diagram-row">
            <div class="diagram-box layout">
              <span class="box-label">Layout Component</span>
              <span class="box-detail">EmptyLayoutComponent</span>
            </div>
          </div>
          <div class="diagram-arrow">
            <mat-icon>arrow_downward</mat-icon>
          </div>
          <div class="diagram-row">
            <div class="diagram-box outlet">
              <span class="box-label">&lt;router-outlet&gt;</span>
              <span class="box-detail">renders children</span>
            </div>
          </div>
          <div class="diagram-arrow">
            <mat-icon>arrow_downward</mat-icon>
          </div>
          <div class="diagram-row">
            <div class="diagram-box page">
              <span class="box-label">Page Component</span>
              <span class="box-detail">LoginPage</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Shell vs Page -->
      <section class="doc-section">
        <h2 class="section-title">Shell vs Page Component</h2>
        <ax-props-table [properties]="shellVsPageProps" />
      </section>

      <!-- Route Patterns -->
      <section class="doc-section">
        <h2 class="section-title">Route Configuration Patterns</h2>

        <h3 class="subsection-title">
          Pattern 1: Shell with Children (Recommended)
        </h3>
        <p class="prose">
          Shell เป็น parent route พร้อม children routes ที่ render ใน
          router-outlet
        </p>
        <ax-code-tabs [tabs]="shellWithChildrenCode" />

        <h3 class="subsection-title">Pattern 2: Standalone Page</h3>
        <p class="prose">สำหรับ pages ที่จัดการ layout เองภายใน component</p>
        <ax-code-tabs [tabs]="standalonePageCode" />

        <h3 class="subsection-title">
          Pattern 3: loadChildren for Feature Modules
        </h3>
        <p class="prose">สำหรับ feature modules ที่มีหลาย routes</p>
        <ax-code-tabs [tabs]="loadChildrenCode" />
      </section>

      <!-- Implementation Guide -->
      <section class="doc-section">
        <h2 class="section-title">Implementation Guide</h2>

        <h3 class="subsection-title">Step 1: Create Shell Component</h3>
        <ax-code-tabs [tabs]="shellComponentCode" />

        <h3 class="subsection-title">Step 2: Configure Routes with Children</h3>
        <ax-code-tabs [tabs]="routeConfigCode" />

        <h3 class="subsection-title">Step 3: Create Page Components</h3>
        <ax-code-tabs [tabs]="pageComponentCode" />
      </section>

      <!-- Anti-Patterns -->
      <section class="doc-section">
        <h2 class="section-title">Anti-Patterns</h2>

        <h3 class="subsection-title">1. Shell without Children</h3>
        <p class="prose">
          Shell มี router-outlet แต่ไม่มี children routes = outlet ว่างเปล่า
        </p>
        <ax-code-tabs [tabs]="antiPattern1Code" />

        <h3 class="subsection-title">2. Layout in Every Page</h3>
        <p class="prose">ใส่ Layout component ซ้ำในทุก page = code ซ้ำซ้อน</p>
        <ax-code-tabs [tabs]="antiPattern2Code" />

        <h3 class="subsection-title">3. Double router-outlet</h3>
        <p class="prose">
          ทั้ง Shell และ Layout มี router-outlet = render ซ้ำ/ผิดที่
        </p>
        <ax-code-tabs [tabs]="antiPattern3Code" />
      </section>

      <!-- Available Layouts -->
      <section class="doc-section">
        <h2 class="section-title">Available Layout Components</h2>
        <ax-props-table [properties]="layoutProps" />
      </section>

      <!-- Best Practices -->
      <section class="doc-section">
        <h2 class="section-title">Best Practices</h2>
        <div class="usage-comparison">
          <div class="usage-column do">
            <h4><mat-icon>check_circle</mat-icon> Do:</h4>
            <ul>
              <li>One Shell per domain (AuthShell, SystemShell)</li>
              <li>ใส่ Guards ที่ Shell level</li>
              <li>ใช้ children routes สำหรับ pages</li>
              <li>Shell component ทำแค่ layout logic</li>
              <li>ใช้ path: '' สำหรับ default child</li>
              <li>ตั้งชื่อชัดเจน: XxxShellComponent</li>
            </ul>
          </div>
          <div class="usage-column dont">
            <h4><mat-icon>cancel</mat-icon> Don't:</h4>
            <ul>
              <li>Shell without children routes</li>
              <li>Double router-outlet</li>
              <li>Layout ซ้ำในทุก page component</li>
              <li>Business logic ใน Shell</li>
              <li>Guards ซ้ำในทุก child route</li>
              <li>ใช้ Shell component เป็น page</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Checklist -->
      <section class="doc-section">
        <h2 class="section-title">Implementation Checklist</h2>
        <div class="checklist-grid">
          <div class="checklist-item">
            <mat-icon class="checklist-icon">check_box</mat-icon>
            <span>Shell route has <code>loadComponent</code></span>
          </div>
          <div class="checklist-item">
            <mat-icon class="checklist-icon">check_box</mat-icon>
            <span>Shell route has <code>children</code> array</span>
          </div>
          <div class="checklist-item">
            <mat-icon class="checklist-icon">check_box</mat-icon>
            <span>Default child has <code>path: ''</code></span>
          </div>
          <div class="checklist-item">
            <mat-icon class="checklist-icon">check_box</mat-icon>
            <span>Guards at Shell level only</span>
          </div>
          <div class="checklist-item">
            <mat-icon class="checklist-icon">check_box</mat-icon>
            <span>No duplicate router-outlet</span>
          </div>
          <div class="checklist-item">
            <mat-icon class="checklist-icon">check_box</mat-icon>
            <span>Layout has router-outlet</span>
          </div>
        </div>
      </section>

      <!-- Related -->
      <section class="doc-section">
        <h2 class="section-title">Related Documentation</h2>
        <div class="related-links">
          <a mat-stroked-button routerLink="/docs/architecture/multi-app">
            <mat-icon>apps</mat-icon>
            Multi-App Architecture
          </a>
          <a
            mat-stroked-button
            routerLink="/docs/components/aegisx/layout/enterprise"
          >
            <mat-icon>web</mat-icon>
            Enterprise Layout
          </a>
          <a
            mat-stroked-button
            routerLink="/docs/components/aegisx/layout/empty"
          >
            <mat-icon>crop_free</mat-icon>
            Empty Layout
          </a>
        </div>
      </section>
    </article>
  `,
  styles: [
    `
      /* Article Layout - Prose Style */
      .docs-article {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
      }

      .doc-section {
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--ax-border-default);

        &:last-child {
          border-bottom: none;
        }
      }

      .section-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--ax-text-heading);
        margin: 0 0 1rem 0;
        line-height: 1.3;
      }

      .subsection-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 2rem 0 0.75rem 0;
        line-height: 1.4;
      }

      .prose {
        font-size: 1rem;
        line-height: 1.75;
        color: var(--ax-text-secondary);
        margin-bottom: 1.5rem;
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

      /* Architecture Diagram */
      .architecture-diagram {
        padding: 2rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .diagram-row {
        display: flex;
        gap: 1rem;
        justify-content: center;
        width: 100%;
      }

      .diagram-box {
        padding: 1rem 1.5rem;
        border-radius: var(--ax-radius-md);
        text-align: center;
        min-width: 180px;

        .box-label {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .box-detail {
          display: block;
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.25rem;
        }
      }

      .diagram-box.router {
        background: var(--ax-brand-default);
        color: white;
      }

      .diagram-box.shell {
        background: var(--ax-warning-default);
        color: var(--ax-text-heading);
      }

      .diagram-box.layout {
        background: var(--ax-success-default);
        color: white;
      }

      .diagram-box.outlet {
        background: var(--ax-info-default);
        color: white;
      }

      .diagram-box.page {
        background: var(--ax-background-surface);
        border: 2px solid var(--ax-brand-default);
        color: var(--ax-text-heading);
      }

      .diagram-arrow {
        color: var(--ax-text-subtle);
      }

      /* Checklist Grid */
      .checklist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
      }

      .checklist-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--ax-success-faint);
        border-radius: var(--ax-radius-md);
        border: 1px solid var(--ax-success-200);

        span {
          color: var(--ax-text-primary);
          font-size: 0.9375rem;
        }
      }

      .checklist-icon {
        color: var(--ax-success-default);
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

      /* Related Links */
      .related-links {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;

        a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
    `,
  ],
})
export class ShellPatternDocComponent {
  // Shell vs Page comparison
  shellVsPageProps = [
    {
      name: 'Shell Component',
      type: 'Purpose',
      default: 'Layout & Shared Logic',
      description: 'จัดการ layout, shared elements, route-level logic',
    },
    {
      name: 'Page Component',
      type: 'Purpose',
      default: 'Business Logic & UI',
      description: 'จัดการ business logic, forms, data fetching',
    },
    {
      name: 'Shell Component',
      type: 'router-outlet',
      default: 'Yes (via Layout)',
      description: 'มี router-outlet สำหรับ render children',
    },
    {
      name: 'Page Component',
      type: 'router-outlet',
      default: 'No',
      description: 'ไม่มี router-outlet',
    },
    {
      name: 'Shell Component',
      type: 'Example',
      default: 'AuthShellComponent',
      description: 'ใช้กับหลาย pages ที่มี layout เดียวกัน',
    },
    {
      name: 'Page Component',
      type: 'Example',
      default: 'LoginPage',
      description: 'เฉพาะหน้าเดียว',
    },
  ];

  // Available Layouts
  layoutProps = [
    {
      name: 'EmptyLayoutComponent',
      type: 'Use Case',
      default: 'Auth, Error pages',
      description: 'Centered layout ไม่มี navigation',
    },
    {
      name: 'EnterpriseLayoutComponent',
      type: 'Use Case',
      default: 'Main app pages',
      description: 'Layout พร้อม header, sidebar, footer',
    },
  ];

  // Shell with Children code
  shellWithChildrenCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'routes.ts',
      code: `// Pattern 1: Shell with Children (Recommended)
{
  path: 'login',
  loadComponent: () => import('./auth-shell.component')
    .then(m => m.AuthShellComponent),
  canActivate: [GuestGuard],
  children: [
    {
      path: '',  // Matches /login exactly
      loadComponent: () => import('./pages/login.page')
        .then(m => m.LoginPage),
    }
  ]
}`,
    },
  ];

  // Standalone page code
  standalonePageCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'routes.ts',
      code: `// Pattern 2: Standalone Page (No Shell)
{
  path: 'portal',
  loadComponent: () => import('./portal.page')
    .then(m => m.PortalPage),
  canActivate: [AuthGuard],
}

// Use when:
// - Page manages layout internally
// - Page is unique, doesn't share layout`,
    },
  ];

  // loadChildren code
  loadChildrenCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'app.routes.ts',
      code: `// Pattern 3: loadChildren for Feature Modules
{
  path: 'system',
  loadChildren: () => import('./features/system/system.routes')
    .then(m => m.SYSTEM_ROUTES),
}

// system.routes.ts
export const SYSTEM_ROUTES: Route[] = [
  {
    path: '',
    component: SystemShellComponent,  // Shell as root
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => ... },
      { path: 'users', loadComponent: () => ... },
    ]
  }
];`,
    },
  ];

  // Shell component code
  shellComponentCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'auth-shell.component.ts',
      code: `import { Component } from '@angular/core';
import { EmptyLayoutComponent } from '@aegisx/ui';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [EmptyLayoutComponent],
  template: \`
    <!-- Layout component has <router-outlet> -->
    <ax-empty-layout></ax-empty-layout>
  \`,
  styles: [\`
    :host {
      display: block;
      height: 100vh;
    }
  \`]
})
export class AuthShellComponent {}`,
    },
  ];

  // Route config code
  routeConfigCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'app.routes.ts',
      code: `export const appRoutes: Route[] = [
  // Default redirect
  {
    path: '',
    redirectTo: 'portal',
    pathMatch: 'full',
  },

  // Auth routes with Shell
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth-shell.component')
      .then(m => m.AuthShellComponent),
    canActivate: [GuestGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/auth/login.page')
          .then(m => m.LoginPage),
      }
    ]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/auth-shell.component')
      .then(m => m.AuthShellComponent),
    canActivate: [GuestGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/auth/register.page')
          .then(m => m.RegisterPage),
      }
    ]
  },
];`,
    },
  ];

  // Page component code
  pageComponentCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'login.page.ts',
      code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  template: \`
    <!-- Page content only, no layout wrapper -->
    <div class="login-container">
      <h1>Login</h1>
      <form>
        <!-- form fields -->
      </form>
    </div>
  \`,
})
export class LoginPage {
  // Business logic only
  // No layout management
}`,
    },
  ];

  // Anti-pattern 1: Shell without children
  antiPattern1Code: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'Wrong',
      code: `// Shell loads but no content in router-outlet
{
  path: 'login',
  loadComponent: () => import('./auth-shell.component'),
  // Missing children! router-outlet will be empty
}`,
    },
  ];

  // Anti-pattern 2: Layout in every page
  antiPattern2Code: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'Wrong',
      code: `// Duplicating layout in every page
@Component({
  template: \`
    <ax-empty-layout>
      <div class="login-form">...</div>
    </ax-empty-layout>
  \`
})
export class LoginPage {}

@Component({
  template: \`
    <ax-empty-layout>
      <div class="register-form">...</div>
    </ax-empty-layout>
  \`
})
export class RegisterPage {}
// Code duplication! Hard to maintain`,
    },
  ];

  // Anti-pattern 3: Double router-outlet
  antiPattern3Code: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'Wrong',
      code: `// Both shell and layout have router-outlet
@Component({
  template: \`
    <ax-empty-layout></ax-empty-layout>
    <router-outlet></router-outlet>  <!-- Duplicate! -->
  \`
})
export class AuthShellComponent {}

// Content will render twice or in wrong location`,
    },
  ];
}
