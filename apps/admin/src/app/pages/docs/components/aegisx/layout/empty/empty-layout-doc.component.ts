import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
} from '../../../../../../components/docs';

@Component({
  selector: 'ax-empty-layout-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="empty-layout-doc">
      <ax-doc-header
        title="Empty Layout"
        icon="crop_free"
        description="A minimal layout with no chrome - just a centered content area. Ideal for login pages, error pages, and standalone views."
        [breadcrumbs]="[
          { label: 'Layout', link: '/docs/components/aegisx/layout/drawer' },
          { label: 'Empty Layout' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { EmptyLayoutComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="doc-tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Layout Structure</h2>
              <p>
                The Empty Layout provides a minimal container that centers its
                content both horizontally and vertically. No navigation,
                toolbar, or footer is included.
              </p>

              <ax-live-preview variant="bordered">
                <div class="layout-preview">
                  <div class="preview-content">
                    <div class="preview-card">
                      <div class="preview-card-header"></div>
                      <div class="preview-card-body">Centered Content</div>
                    </div>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="doc-section">
              <h2>Use Cases</h2>
              <ul class="use-case-list">
                <li>
                  <mat-icon>login</mat-icon>
                  <div>
                    <strong>Login/Register Pages</strong>
                    <p>Clean, focused experience for authentication</p>
                  </div>
                </li>
                <li>
                  <mat-icon>error_outline</mat-icon>
                  <div>
                    <strong>Error Pages</strong>
                    <p>404, 500, and other error states</p>
                  </div>
                </li>
                <li>
                  <mat-icon>check_circle_outline</mat-icon>
                  <div>
                    <strong>Confirmation Pages</strong>
                    <p>Email verification, success messages</p>
                  </div>
                </li>
                <li>
                  <mat-icon>print</mat-icon>
                  <div>
                    <strong>Print Views</strong>
                    <p>Clean pages optimized for printing</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Component API</h2>
              <p>
                The Empty Layout is a simple container with no inputs or
                outputs. Content is projected via <code>ng-content</code> and
                <code>router-outlet</code>.
              </p>

              <h3>Content Projection</h3>
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
                      <td><code>ng-content</code></td>
                      <td>Main content to display in the center</td>
                    </tr>
                    <tr>
                      <td><code>router-outlet</code></td>
                      <td>Routes rendered inside the layout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="doc-section">
              <h2>CSS Variables</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>--ax-bg-default</code></td>
                      <td>Theme background</td>
                      <td>Background color of the layout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Login Page</h2>
              <ax-code-tabs [tabs]="loginPageCode"></ax-code-tabs>
            </section>

            <section class="doc-section">
              <h2>404 Error Page</h2>
              <ax-code-tabs [tabs]="errorPageCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="doc-tab-content">
            <section class="doc-section">
              <h2>Best Practices</h2>
              <div class="guidelines-grid">
                <div class="guideline do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Use for standalone pages (login, errors)</li>
                    <li>Keep content focused and minimal</li>
                    <li>Provide clear navigation back to main app</li>
                    <li>Support both light and dark themes</li>
                  </ul>
                </div>
                <div class="guideline dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Use for regular application pages</li>
                    <li>Add navigation or complex layouts</li>
                    <li>Overcrowd with too much content</li>
                    <li>Forget accessibility considerations</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .empty-layout-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl);
      }

      .doc-tabs {
        margin-top: var(--ax-spacing-xl);
      }
      .doc-tab-content {
        padding: var(--ax-spacing-xl) 0;
      }

      .doc-section {
        margin-bottom: var(--ax-spacing-3xl);

        h2 {
          font-size: var(--ax-text-xl);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 var(--ax-spacing-sm) 0;
        }

        h3 {
          font-size: var(--ax-text-lg);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: var(--ax-spacing-lg) 0 var(--ax-spacing-sm) 0;
        }

        > p {
          font-size: var(--ax-text-sm);
          color: var(--ax-text-secondary);
          margin: 0 0 var(--ax-spacing-lg) 0;
          max-width: 700px;
        }

        code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs);
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm);
        }
      }

      .layout-preview {
        display: flex;
        width: 100%;
        height: 250px;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        background: var(--ax-background-subtle);
        overflow: hidden;
      }

      .preview-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preview-card {
        width: 280px;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
        box-shadow: var(--ax-shadow-lg);
        overflow: hidden;
      }

      .preview-card-header {
        height: 40px;
        background: var(--ax-brand-default);
      }

      .preview-card-body {
        padding: var(--ax-spacing-xl);
        text-align: center;
        font-size: var(--ax-text-sm);
        color: var(--ax-text-secondary);
      }

      .use-case-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-md);

        li {
          display: flex;
          align-items: flex-start;
          gap: var(--ax-spacing-md);
          padding: var(--ax-spacing-lg);
          background: var(--ax-background-subtle);
          border-radius: var(--ax-radius-lg);
          border: 1px solid var(--ax-border-default);

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            color: var(--ax-brand-default);
          }

          strong {
            font-size: var(--ax-text-base);
            color: var(--ax-text-heading);
          }

          p {
            font-size: var(--ax-text-sm);
            color: var(--ax-text-secondary);
            margin: var(--ax-spacing-xs) 0 0 0;
          }
        }
      }

      .api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          text-align: left;
          padding: var(--ax-spacing-sm) var(--ax-spacing-md);
          border-bottom: 1px solid var(--ax-border-default);
        }

        th {
          background: var(--ax-background-subtle);
          font-size: var(--ax-text-xs);
          font-weight: 600;
          color: var(--ax-text-secondary);
          text-transform: uppercase;
        }

        td {
          font-size: var(--ax-text-sm);
          color: var(--ax-text-primary);
        }
        tr:last-child td {
          border-bottom: none;
        }
      }

      .guidelines-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg);
      }

      .guideline {
        padding: var(--ax-spacing-lg);
        border-radius: var(--ax-radius-lg);

        h4 {
          display: flex;
          align-items: center;
          gap: var(--ax-spacing-xs);
          font-size: var(--ax-text-base);
          font-weight: 600;
          margin: 0 0 var(--ax-spacing-sm) 0;
          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        ul {
          margin: 0;
          padding-left: var(--ax-spacing-lg);
          li {
            font-size: var(--ax-text-sm);
            margin-bottom: var(--ax-spacing-xs);
          }
        }
      }

      .guideline.do {
        background: var(--ax-success-faint);
        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .guideline.dont {
        background: var(--ax-error-faint);
        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }
    `,
  ],
})
export class EmptyLayoutDocComponent {
  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-empty-layout>
  <div class="login-card">
    <h1>Welcome Back</h1>
    <form>
      <!-- Login form content -->
    </form>
  </div>
</ax-empty-layout>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { EmptyLayoutComponent } from '@aegisx/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [EmptyLayoutComponent],
  template: \`
    <ax-empty-layout>
      <div class="login-card">
        <h1>Welcome Back</h1>
        <!-- Login form -->
      </div>
    </ax-empty-layout>
  \`,
})
export class LoginComponent {}`,
    },
  ];

  loginPageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-empty-layout>
  <div class="login-container">
    <div class="login-card">
      <img src="assets/logo.svg" alt="Logo" class="logo">
      <h1>Sign In</h1>
      <p>Enter your credentials to access your account</p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" type="password">
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit">
          Sign In
        </button>
      </form>
    </div>
  </div>
</ax-empty-layout>`,
    },
  ];

  errorPageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-empty-layout>
  <div class="error-container">
    <mat-icon class="error-icon">error_outline</mat-icon>
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <button mat-raised-button color="primary" routerLink="/">
      Go Home
    </button>
  </div>
</ax-empty-layout>`,
    },
  ];
}
