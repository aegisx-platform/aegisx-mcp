import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { AxLoadingBarComponent, LoadingBarService } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

type LoadingBarColor = 'primary' | 'success' | 'error' | 'warning' | 'neutral';
type LoadingBarMode = 'indeterminate' | 'determinate';

@Component({
  selector: 'ax-loading-bar-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    MatChipsModule,
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
        icon="linear_scale"
        description="Top progress bar indicator for page loads, API calls, and async operations with service-based control."
        [breadcrumbs]="[
          { label: 'Feedback', link: '/docs/components/aegisx/feedback/alert' },
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
            <!-- Interactive Playground -->
            <section class="loading-bar-doc__section">
              <h2>Interactive Playground</h2>
              <p>
                Customize and test all loading bar options. The loading bar will
                appear at the top of the page.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <div class="loading-bar-doc__playground">
                  <!-- Controls -->
                  <div class="loading-bar-doc__controls">
                    <!-- Color Selection -->
                    <div class="loading-bar-doc__control-group">
                      <label class="loading-bar-doc__control-label"
                        >Color</label
                      >
                      <mat-chip-listbox
                        [(ngModel)]="selectedColor"
                        class="loading-bar-doc__chips"
                      >
                        <mat-chip-option value="primary"
                          >Primary</mat-chip-option
                        >
                        <mat-chip-option value="success"
                          >Success</mat-chip-option
                        >
                        <mat-chip-option value="error">Error</mat-chip-option>
                        <mat-chip-option value="warning"
                          >Warning</mat-chip-option
                        >
                        <mat-chip-option value="neutral"
                          >Neutral</mat-chip-option
                        >
                      </mat-chip-listbox>
                    </div>

                    <!-- Mode Selection -->
                    <div class="loading-bar-doc__control-group">
                      <label class="loading-bar-doc__control-label">Mode</label>
                      <mat-chip-listbox
                        [(ngModel)]="selectedMode"
                        class="loading-bar-doc__chips"
                      >
                        <mat-chip-option value="indeterminate"
                          >Indeterminate</mat-chip-option
                        >
                        <mat-chip-option value="determinate"
                          >Determinate</mat-chip-option
                        >
                      </mat-chip-listbox>
                    </div>

                    <!-- Progress Slider (for determinate mode) -->
                    @if (selectedMode === 'determinate') {
                      <div class="loading-bar-doc__control-group">
                        <label class="loading-bar-doc__control-label"
                          >Progress: {{ playgroundProgress }}%</label
                        >
                        <mat-slider
                          min="0"
                          max="100"
                          step="1"
                          class="loading-bar-doc__slider"
                        >
                          <input
                            matSliderThumb
                            [(ngModel)]="playgroundProgress"
                          />
                        </mat-slider>
                      </div>
                    }
                  </div>

                  <!-- Action Buttons -->
                  <div class="loading-bar-doc__button-group">
                    <button
                      mat-flat-button
                      color="primary"
                      (click)="showPlaygroundLoading()"
                    >
                      <mat-icon>play_arrow</mat-icon>
                      Show Loading Bar
                    </button>
                    <button mat-stroked-button (click)="simulateProgress()">
                      <mat-icon>trending_up</mat-icon>
                      Simulate Progress
                    </button>
                    <button mat-stroked-button (click)="completeLoading()">
                      <mat-icon>check</mat-icon>
                      Complete
                    </button>
                  </div>

                  <p class="loading-bar-doc__hint">
                    <mat-icon>info</mat-icon>
                    Loading bar appears at the top of the page (fixed position)
                  </p>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="playgroundCode"></ax-code-tabs>
            </section>

            <!-- Color Variants Interactive -->
            <section class="loading-bar-doc__section">
              <h2>Color Variants</h2>
              <p>
                Click each button to see the loading bar in different colors.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <div class="loading-bar-doc__variant-grid">
                  @for (variant of colorVariants; track variant.value) {
                    <div class="loading-bar-doc__variant-card">
                      <div class="loading-bar-doc__variant-preview">
                        <div
                          class="loading-bar-doc__bar-preview"
                          [class]="
                            'loading-bar-doc__bar-preview--' + variant.value
                          "
                        ></div>
                      </div>
                      <div class="loading-bar-doc__variant-info">
                        <span class="loading-bar-doc__variant-name">{{
                          variant.label
                        }}</span>
                        <span class="loading-bar-doc__variant-desc">{{
                          variant.description
                        }}</span>
                      </div>
                      <button
                        mat-stroked-button
                        (click)="showVariantLoading(variant.value)"
                        class="loading-bar-doc__variant-btn"
                      >
                        <mat-icon>play_arrow</mat-icon>
                        Demo
                      </button>
                    </div>
                  }
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="variantsCode"></ax-code-tabs>
            </section>

            <!-- Mode Comparison -->
            <section class="loading-bar-doc__section">
              <h2>Loading Modes</h2>
              <p>
                Compare indeterminate (auto-animated) vs determinate (manual
                progress) modes.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <div class="loading-bar-doc__modes-demo">
                  <!-- Indeterminate -->
                  <div class="loading-bar-doc__mode-card">
                    <div class="loading-bar-doc__mode-header">
                      <mat-icon>all_inclusive</mat-icon>
                      <h4>Indeterminate</h4>
                    </div>
                    <p>Continuous animation when duration is unknown</p>
                    <button mat-flat-button (click)="showIndeterminate()">
                      Start Indeterminate
                    </button>
                  </div>

                  <!-- Determinate -->
                  <div class="loading-bar-doc__mode-card">
                    <div class="loading-bar-doc__mode-header">
                      <mat-icon>linear_scale</mat-icon>
                      <h4>Determinate</h4>
                    </div>
                    <p>Manual progress control (0-100%)</p>
                    <div class="loading-bar-doc__progress-controls">
                      <button mat-stroked-button (click)="setProgress(0)">
                        0%
                      </button>
                      <button mat-stroked-button (click)="setProgress(25)">
                        25%
                      </button>
                      <button mat-stroked-button (click)="setProgress(50)">
                        50%
                      </button>
                      <button mat-stroked-button (click)="setProgress(75)">
                        75%
                      </button>
                      <button mat-flat-button (click)="setProgress(100)">
                        100%
                      </button>
                    </div>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="modesCode"></ax-code-tabs>
            </section>

            <!-- Quick Actions -->
            <section class="loading-bar-doc__section">
              <h2>Quick Actions</h2>
              <p>Common loading scenarios you can test instantly.</p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <div class="loading-bar-doc__quick-actions">
                  <button
                    mat-flat-button
                    color="primary"
                    (click)="simulateApiCall()"
                  >
                    <mat-icon>api</mat-icon>
                    Simulate API Call (2s)
                  </button>
                  <button
                    mat-flat-button
                    color="accent"
                    (click)="simulateFileUpload()"
                  >
                    <mat-icon>cloud_upload</mat-icon>
                    Simulate File Upload
                  </button>
                  <button
                    mat-flat-button
                    (click)="simulatePageLoad()"
                    style="background: var(--ax-text-secondary); color: white;"
                  >
                    <mat-icon>refresh</mat-icon>
                    Simulate Page Load
                  </button>
                  <button
                    mat-flat-button
                    (click)="simulateError()"
                    style="background: var(--ax-error-default); color: white;"
                  >
                    <mat-icon>error</mat-icon>
                    Simulate Error
                  </button>
                  <button
                    mat-flat-button
                    (click)="simulateSuccess()"
                    style="background: var(--ax-success-default); color: white;"
                  >
                    <mat-icon>check_circle</mat-icon>
                    Simulate Success
                  </button>
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

      /* Playground */
      .loading-bar-doc__playground {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-lg, 1rem);
      }

      .loading-bar-doc__controls {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-md, 0.75rem);
      }

      .loading-bar-doc__control-group {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-xs, 0.25rem);
      }

      .loading-bar-doc__control-label {
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 600;
        color: var(--ax-text-heading);
      }

      .loading-bar-doc__chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ax-spacing-xs, 0.25rem);
      }

      .loading-bar-doc__slider {
        width: 100%;
        max-width: 300px;
      }

      .loading-bar-doc__button-group {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ax-spacing-sm, 0.5rem);
      }

      .loading-bar-doc__hint {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs, 0.25rem);
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-subtle);
        margin: 0;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      /* Variant Grid */
      .loading-bar-doc__variant-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--ax-spacing-md, 0.75rem);
      }

      .loading-bar-doc__variant-card {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md, 0.75rem);
        padding: var(--ax-spacing-md, 0.75rem);
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg, 0.75rem);
        border: 1px solid var(--ax-border-default);
      }

      .loading-bar-doc__variant-preview {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-md, 0.5rem);
        overflow: hidden;
      }

      .loading-bar-doc__bar-preview {
        width: 100%;
        height: 4px;
        animation: loading-bar-pulse 1.5s ease-in-out infinite;
      }

      .loading-bar-doc__bar-preview--primary {
        background: var(--ax-brand-default);
      }
      .loading-bar-doc__bar-preview--success {
        background: var(--ax-success-default);
      }
      .loading-bar-doc__bar-preview--error {
        background: var(--ax-error-default);
      }
      .loading-bar-doc__bar-preview--warning {
        background: var(--ax-warning-default);
      }
      .loading-bar-doc__bar-preview--neutral {
        background: var(--ax-text-secondary);
      }

      @keyframes loading-bar-pulse {
        0%,
        100% {
          opacity: 0.5;
          transform: scaleX(0.5);
        }
        50% {
          opacity: 1;
          transform: scaleX(1);
        }
      }

      .loading-bar-doc__variant-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .loading-bar-doc__variant-name {
        font-weight: 600;
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-heading);
      }

      .loading-bar-doc__variant-desc {
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-text-subtle);
      }

      .loading-bar-doc__variant-btn {
        flex-shrink: 0;
      }

      /* Modes Demo */
      .loading-bar-doc__modes-demo {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .loading-bar-doc__mode-card {
        padding: var(--ax-spacing-lg, 1rem);
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg, 0.75rem);
        border: 1px solid var(--ax-border-default);

        .loading-bar-doc__mode-header {
          display: flex;
          align-items: center;
          gap: var(--ax-spacing-sm, 0.5rem);
          margin-bottom: var(--ax-spacing-sm, 0.5rem);

          mat-icon {
            color: var(--ax-brand-default);
          }

          h4 {
            margin: 0;
            font-size: var(--ax-text-base, 1rem);
            font-weight: 600;
            color: var(--ax-text-heading);
          }
        }

        > p {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin: 0 0 var(--ax-spacing-md, 0.75rem) 0;
        }
      }

      .loading-bar-doc__progress-controls {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ax-spacing-xs, 0.25rem);
      }

      /* Quick Actions */
      .loading-bar-doc__quick-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ax-spacing-sm, 0.5rem);

        button {
          mat-icon {
            margin-right: var(--ax-spacing-xs, 0.25rem);
          }
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

  // Playground state
  selectedColor: LoadingBarColor = 'primary';
  selectedMode: LoadingBarMode = 'indeterminate';
  playgroundProgress = 50;
  manualProgress = 0;

  // Color variants data
  colorVariants = [
    {
      value: 'primary' as const,
      label: 'Primary',
      description: 'Default loading state',
    },
    {
      value: 'success' as const,
      label: 'Success',
      description: 'Completed operations',
    },
    {
      value: 'error' as const,
      label: 'Error',
      description: 'Failed operations',
    },
    {
      value: 'warning' as const,
      label: 'Warning',
      description: 'Attention needed',
    },
    {
      value: 'neutral' as const,
      label: 'Neutral',
      description: 'General purpose',
    },
  ];

  // Basic controls
  startLoading(): void {
    this.loadingBarService.start();
  }

  setProgress(value: number): void {
    this.loadingBarService.setProgress(value);
  }

  completeLoading(): void {
    this.loadingBarService.complete();
  }

  // Playground controls
  showPlaygroundLoading(): void {
    if (this.selectedMode === 'determinate') {
      this.loadingBarService.showProgress(
        this.playgroundProgress,
        this.selectedColor,
      );
    } else {
      this.loadingBarService.show(this.selectedColor);
    }
  }

  simulateProgress(): void {
    this.loadingBarService.showProgress(0, this.selectedColor);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.loadingBarService.setProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => this.loadingBarService.complete(), 300);
      }
    }, 200);
  }

  // Variant demos
  showVariantLoading(color: LoadingBarColor): void {
    this.loadingBarService.show(color);
    setTimeout(() => this.loadingBarService.complete(), 2000);
  }

  // Mode demos
  showIndeterminate(): void {
    this.loadingBarService.show('primary');
    setTimeout(() => this.loadingBarService.complete(), 3000);
  }

  // Simulation demos
  simulateApiCall(): void {
    this.loadingBarService.show('primary');
    setTimeout(() => this.loadingBarService.complete(), 2000);
  }

  simulateFileUpload(): void {
    this.loadingBarService.showProgress(0, 'primary');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.loadingBarService.setProgress(100);
        setTimeout(() => {
          this.loadingBarService.showSuccess();
          setTimeout(() => this.loadingBarService.complete(), 500);
        }, 200);
      } else {
        this.loadingBarService.setProgress(progress);
      }
    }, 300);
  }

  simulatePageLoad(): void {
    this.loadingBarService.show('neutral');
    setTimeout(() => this.loadingBarService.complete(), 1500);
  }

  simulateError(): void {
    this.loadingBarService.show('primary');
    setTimeout(() => {
      this.loadingBarService.showError();
      setTimeout(() => this.loadingBarService.complete(), 1000);
    }, 1500);
  }

  simulateSuccess(): void {
    this.loadingBarService.show('primary');
    setTimeout(() => {
      this.loadingBarService.showSuccess();
      setTimeout(() => this.loadingBarService.complete(), 500);
    }, 1000);
  }

  onProgressChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.manualProgress = parseInt(target.value, 10);
  }

  // Code examples
  playgroundCode = [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component, inject } from '@angular/core';
import { LoadingBarService } from '@aegisx/ui';

@Component({...})
export class MyComponent {
  private loadingBarService = inject(LoadingBarService);

  showIndeterminate() {
    // Indeterminate mode - auto animated
    this.loadingBarService.show('primary');
    setTimeout(() => this.loadingBarService.complete(), 2000);
  }

  showDeterminate() {
    // Determinate mode - manual progress
    this.loadingBarService.showProgress(0, 'primary');
    // Update progress as needed
    this.loadingBarService.setProgress(50);
    this.loadingBarService.setProgress(100);
    this.loadingBarService.complete();
  }

  showVariants() {
    this.loadingBarService.showSuccess();  // Green
    this.loadingBarService.showError();    // Red
    this.loadingBarService.showWarning();  // Orange
  }
}`,
    },
  ];

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
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `// Show loading bar with different colors
loadingBarService.show('primary');   // Default brand color
loadingBarService.show('success');   // Green - completed
loadingBarService.show('error');     // Red - failed
loadingBarService.show('warning');   // Orange - attention
loadingBarService.show('neutral');   // Gray - general purpose

// Helper methods for common variants
loadingBarService.showSuccess();     // Green with message
loadingBarService.showError();       // Red with message
loadingBarService.showWarning();     // Orange with message`,
    },
  ];

  modesCode = [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `// Indeterminate mode - continuous animation (unknown duration)
loadingBarService.show('primary');  // Auto-animated

// Determinate mode - manual progress control (known progress)
loadingBarService.showProgress(0, 'primary');

// Update progress as operation proceeds
loadingBarService.setProgress(25);
loadingBarService.setProgress(50);
loadingBarService.setProgress(75);
loadingBarService.setProgress(100);

// Complete and hide the loading bar
loadingBarService.complete();

// Or use start() for auto-incrementing progress
loadingBarService.start();  // Starts at 0 and auto-increments`,
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
