import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AxLoadingBarComponent, LoadingBarService } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-loading-bar-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    AxLoadingBarComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="loading-bar-doc">
      <ax-doc-header
        title="Loading Bar"
        description="Top progress bar indicator for page loads, API calls, and async operations with service-based control."
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          {
            label: 'Components',
            link: '/docs/components/data-display/overview',
          },
          { label: 'Feedback', link: '/docs/components/feedback/alert' },
          { label: 'Loading Bar' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxLoadingBarComponent, LoadingBarService } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="loading-bar-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="loading-bar-doc__tab-content">
            <section class="loading-bar-doc__section">
              <h2>Basic Usage</h2>
              <p>
                The loading bar appears at the top of the page to indicate
                loading state. Control it via the LoadingBarService for global
                loading states.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <div class="loading-bar-doc__demo-container">
                  <ax-loading-bar></ax-loading-bar>
                  <div class="loading-bar-doc__demo-content">
                    <p>Click buttons to control loading state:</p>
                    <div class="loading-bar-doc__button-group">
                      <button
                        mat-flat-button
                        color="primary"
                        (click)="startLoading()"
                      >
                        Start Loading
                      </button>
                      <button mat-stroked-button (click)="setProgress(50)">
                        Set 50%
                      </button>
                      <button mat-stroked-button (click)="completeLoading()">
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="loading-bar-doc__section">
              <h2>Variants</h2>
              <p>Use different colors for different types of operations.</p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
                gap="var(--ax-spacing-xl)"
              >
                <div class="loading-bar-doc__variant-demo">
                  <span class="loading-bar-doc__variant-label"
                    >Primary (default)</span
                  >
                  <div class="loading-bar-doc__bar-container">
                    <div
                      class="loading-bar-doc__mock-bar loading-bar-doc__mock-bar--primary"
                    ></div>
                  </div>
                </div>

                <div class="loading-bar-doc__variant-demo">
                  <span class="loading-bar-doc__variant-label">Success</span>
                  <div class="loading-bar-doc__bar-container">
                    <div
                      class="loading-bar-doc__mock-bar loading-bar-doc__mock-bar--success"
                    ></div>
                  </div>
                </div>

                <div class="loading-bar-doc__variant-demo">
                  <span class="loading-bar-doc__variant-label">Error</span>
                  <div class="loading-bar-doc__bar-container">
                    <div
                      class="loading-bar-doc__mock-bar loading-bar-doc__mock-bar--error"
                    ></div>
                  </div>
                </div>

                <div class="loading-bar-doc__variant-demo">
                  <span class="loading-bar-doc__variant-label">Warning</span>
                  <div class="loading-bar-doc__bar-container">
                    <div
                      class="loading-bar-doc__mock-bar loading-bar-doc__mock-bar--warning"
                    ></div>
                  </div>
                </div>

                <div class="loading-bar-doc__variant-demo">
                  <span class="loading-bar-doc__variant-label">Info</span>
                  <div class="loading-bar-doc__bar-container">
                    <div
                      class="loading-bar-doc__mock-bar loading-bar-doc__mock-bar--info"
                    ></div>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="variantsCode"></ax-code-tabs>
            </section>

            <section class="loading-bar-doc__section">
              <h2>Custom Height</h2>
              <p>Adjust the bar height for different visual emphasis.</p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
                gap="var(--ax-spacing-lg)"
              >
                <div class="loading-bar-doc__height-demo">
                  <span class="loading-bar-doc__variant-label"
                    >Height: 2px (subtle)</span
                  >
                  <div class="loading-bar-doc__bar-container">
                    <div
                      class="loading-bar-doc__mock-bar loading-bar-doc__mock-bar--primary"
                      style="height: 2px;"
                    ></div>
                  </div>
                </div>

                <div class="loading-bar-doc__height-demo">
                  <span class="loading-bar-doc__variant-label"
                    >Height: 3px (default)</span
                  >
                  <div class="loading-bar-doc__bar-container">
                    <div
                      class="loading-bar-doc__mock-bar loading-bar-doc__mock-bar--primary"
                      style="height: 3px;"
                    ></div>
                  </div>
                </div>

                <div class="loading-bar-doc__height-demo">
                  <span class="loading-bar-doc__variant-label"
                    >Height: 5px (prominent)</span
                  >
                  <div class="loading-bar-doc__bar-container">
                    <div
                      class="loading-bar-doc__mock-bar loading-bar-doc__mock-bar--primary"
                      style="height: 5px;"
                    ></div>
                  </div>
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="loading-bar-doc__tab-content">
            <section class="loading-bar-doc__section">
              <h2>With HTTP Interceptor</h2>
              <p>Automatically show loading bar during HTTP requests.</p>

              <ax-code-tabs [tabs]="interceptorCode"></ax-code-tabs>
            </section>

            <section class="loading-bar-doc__section">
              <h2>Page Navigation</h2>
              <p>Show loading during route changes.</p>

              <ax-code-tabs [tabs]="routerCode"></ax-code-tabs>
            </section>

            <section class="loading-bar-doc__section">
              <h2>Manual Progress</h2>
              <p>
                Control progress manually for file uploads or multi-step
                operations.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <div class="loading-bar-doc__manual-demo">
                  <div class="loading-bar-doc__progress-display">
                    Progress: {{ manualProgress }}%
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    [value]="manualProgress"
                    (input)="onProgressChange($event)"
                    class="loading-bar-doc__slider"
                  />
                  <div class="loading-bar-doc__bar-container">
                    <div
                      class="loading-bar-doc__mock-bar loading-bar-doc__mock-bar--primary loading-bar-doc__mock-bar--manual"
                      [style.width.%]="manualProgress"
                    ></div>
                  </div>
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="loading-bar-doc__tab-content">
            <section class="loading-bar-doc__section">
              <h2>Component Properties</h2>
              <div class="loading-bar-doc__api-table">
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
                          >'primary' | 'success' | 'error' | 'warning' |
                          'info'</code
                        >
                      </td>
                      <td><code>'primary'</code></td>
                      <td>Bar color variant</td>
                    </tr>
                    <tr>
                      <td><code>height</code></td>
                      <td><code>number</code></td>
                      <td><code>3</code></td>
                      <td>Bar height in pixels</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="loading-bar-doc__section">
              <h2>LoadingBarService Methods</h2>
              <div class="loading-bar-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Returns</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>start()</code></td>
                      <td><code>void</code></td>
                      <td>Start loading with auto-incrementing progress</td>
                    </tr>
                    <tr>
                      <td><code>complete()</code></td>
                      <td><code>void</code></td>
                      <td>Complete loading (sets to 100% then hides)</td>
                    </tr>
                    <tr>
                      <td><code>setProgress(value: number)</code></td>
                      <td><code>void</code></td>
                      <td>Set specific progress (0-100)</td>
                    </tr>
                    <tr>
                      <td><code>getLoading()</code></td>
                      <td><code>Observable&lt;boolean&gt;</code></td>
                      <td>Observable of loading state</td>
                    </tr>
                    <tr>
                      <td><code>getProgress()</code></td>
                      <td><code>Observable&lt;number&gt;</code></td>
                      <td>Observable of progress value</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="loading-bar-doc__tab-content">
            <ax-component-tokens
              [tokens]="loadingBarTokens"
            ></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="loading-bar-doc__tab-content">
            <section class="loading-bar-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="loading-bar-doc__guidelines">
                <div
                  class="loading-bar-doc__guideline loading-bar-doc__guideline--do"
                >
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Use for page-level loading operations</li>
                    <li>Position at the very top of the viewport</li>
                    <li>Use primary color for general loading</li>
                    <li>Complete loading even on errors</li>
                    <li>Use HTTP interceptors for automatic control</li>
                  </ul>
                </div>

                <div
                  class="loading-bar-doc__guideline loading-bar-doc__guideline--dont"
                >
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Show multiple loading bars simultaneously</li>
                    <li>
                      Use for component-level loading (use spinners instead)
                    </li>
                    <li>Leave the bar visible after completion</li>
                    <li>Use overly thick bars that distract from content</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="loading-bar-doc__section">
              <h2>Best Practices</h2>
              <ul class="loading-bar-doc__best-practices">
                <li>
                  <strong>Global placement:</strong> Add the loading bar once in
                  your app root component
                </li>
                <li>
                  <strong>Automatic integration:</strong> Use HTTP interceptors
                  for API calls
                </li>
                <li>
                  <strong>Semantic colors:</strong> Use success for completed,
                  error for failed operations
                </li>
                <li>
                  <strong>Progress simulation:</strong> Auto-increment creates
                  perception of progress
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
      .loading-bar-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .loading-bar-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .loading-bar-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .loading-bar-doc__section {
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

      /* Demo container */
      .loading-bar-doc__demo-container {
        position: relative;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg, 0.75rem);
        overflow: hidden;
      }

      .loading-bar-doc__demo-content {
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .loading-bar-doc__button-group {
        display: flex;
        gap: var(--ax-spacing-sm, 0.5rem);
        margin-top: var(--ax-spacing-md, 0.75rem);
      }

      /* Variant demos */
      .loading-bar-doc__variant-demo,
      .loading-bar-doc__height-demo {
        max-width: 400px;
      }

      .loading-bar-doc__variant-label {
        display: block;
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 600;
        color: var(--ax-text-secondary);
        margin-bottom: var(--ax-spacing-xs, 0.25rem);
      }

      .loading-bar-doc__bar-container {
        background: var(--ax-background-subtle);
        border-radius: 2px;
        overflow: hidden;
      }

      .loading-bar-doc__mock-bar {
        height: 3px;
        width: 60%;
        animation: loading-bar-demo 2s ease-in-out infinite;
      }

      .loading-bar-doc__mock-bar--manual {
        animation: none;
        transition: width 0.3s ease;
      }

      .loading-bar-doc__mock-bar--primary {
        background: var(--ax-brand-default);
      }

      .loading-bar-doc__mock-bar--success {
        background: var(--ax-success-default);
      }

      .loading-bar-doc__mock-bar--error {
        background: var(--ax-error-default);
      }

      .loading-bar-doc__mock-bar--warning {
        background: var(--ax-warning-default);
      }

      .loading-bar-doc__mock-bar--info {
        background: var(--ax-info-default);
      }

      @keyframes loading-bar-demo {
        0% {
          width: 0%;
        }
        50% {
          width: 80%;
        }
        100% {
          width: 100%;
        }
      }

      /* Manual progress demo */
      .loading-bar-doc__manual-demo {
        max-width: 400px;
      }

      .loading-bar-doc__progress-display {
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-secondary);
        margin-bottom: var(--ax-spacing-sm, 0.5rem);
      }

      .loading-bar-doc__slider {
        width: 100%;
        margin-bottom: var(--ax-spacing-md, 0.75rem);
      }

      /* API Table */
      .loading-bar-doc__api-table {
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
      .loading-bar-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .loading-bar-doc__guideline {
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

      .loading-bar-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .loading-bar-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      .loading-bar-doc__best-practices {
        margin: 0;
        padding-left: var(--ax-spacing-lg, 1rem);

        li {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin-bottom: var(--ax-spacing-sm, 0.5rem);
        }

        strong {
          color: var(--ax-text-heading);
        }
      }
    `,
  ],
})
export class LoadingBarDocComponent {
  private loadingBarService = inject(LoadingBarService);
  manualProgress = 0;

  startLoading(): void {
    this.loadingBarService.start();
  }

  setProgress(value: number): void {
    this.loadingBarService.setProgress(value);
  }

  completeLoading(): void {
    this.loadingBarService.complete();
  }

  onProgressChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.manualProgress = parseInt(target.value, 10);
  }

  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Add once in your app.component -->
<ax-loading-bar></ax-loading-bar>
<router-outlet></router-outlet>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component, inject } from '@angular/core';
import { AxLoadingBarComponent, LoadingBarService } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [AxLoadingBarComponent],
  template: \`
    <ax-loading-bar></ax-loading-bar>
    <button (click)="loadData()">Load Data</button>
  \`,
})
export class MyComponent {
  private loadingBarService = inject(LoadingBarService);

  loadData(): void {
    this.loadingBarService.start();

    // Simulate API call
    setTimeout(() => {
      this.loadingBarService.complete();
    }, 2000);
  }
}`,
    },
  ];

  variantsCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-loading-bar variant="primary"></ax-loading-bar>
<ax-loading-bar variant="success"></ax-loading-bar>
<ax-loading-bar variant="error"></ax-loading-bar>
<ax-loading-bar variant="warning"></ax-loading-bar>
<ax-loading-bar variant="info"></ax-loading-bar>`,
    },
  ];

  interceptorCode = [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `// loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingBarService } from '@aegisx/ui';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingBarService = inject(LoadingBarService);
  loadingBarService.start();

  return next(req).pipe(
    finalize(() => loadingBarService.complete())
  );
};

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([loadingInterceptor])),
  ],
};`,
    },
  ];

  routerCode = [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `// app.component.ts
import { Component, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { LoadingBarService } from '@aegisx/ui';
import { filter } from 'rxjs';

@Component({...})
export class AppComponent {
  private router = inject(Router);
  private loadingBarService = inject(LoadingBarService);

  constructor() {
    this.router.events.pipe(
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingBarService.start();
      } else {
        this.loadingBarService.complete();
      }
    });
  }
}`,
    },
  ];

  loadingBarTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-brand-default',
      usage: 'Primary variant color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-default',
      usage: 'Success variant color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-default',
      usage: 'Error variant color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-warning-default',
      usage: 'Warning variant color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-info-default',
      usage: 'Info variant color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'Track background',
    },
    {
      category: 'Motion',
      cssVar: '--ax-duration-normal',
      usage: 'Progress transition',
    },
    {
      category: 'Motion',
      cssVar: '--ax-easing-standard',
      usage: 'Progress animation',
    },
  ];
}
