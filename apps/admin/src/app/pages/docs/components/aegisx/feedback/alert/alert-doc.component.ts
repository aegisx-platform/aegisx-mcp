import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AxAlertComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-alert-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    AxAlertComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="alert-doc">
      <ax-doc-header
        title="Alert"
        description="Contextual feedback messages for user actions or system status. Alerts communicate important information with semantic colors."
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          {
            label: 'Components',
            link: '/docs/components/data-display/overview',
          },
          { label: 'Feedback', link: '/docs/components/feedback/alert' },
          { label: 'Alert' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxAlertComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="alert-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="alert-doc__tab-content">
            <section class="alert-doc__section">
              <h2>Basic Usage</h2>
              <p>
                Alerts display important messages with semantic colors to convey
                meaning. Use the appropriate variant based on the type of
                message.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
                gap="var(--ax-spacing-md)"
              >
                <ax-alert variant="info">
                  This is an informational message.
                </ax-alert>
                <ax-alert variant="success">
                  Operation completed successfully!
                </ax-alert>
                <ax-alert variant="warning">
                  Please review before proceeding.
                </ax-alert>
                <ax-alert variant="error">
                  An error occurred. Please try again.
                </ax-alert>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="alert-doc__section">
              <h2>With Title</h2>
              <p>
                Add a title for more context when the message needs emphasis.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
                gap="var(--ax-spacing-md)"
              >
                <ax-alert variant="info" title="New Feature Available">
                  We've added dark mode support. Try it out in settings!
                </ax-alert>
                <ax-alert variant="success" title="Payment Successful">
                  Your order #12345 has been confirmed. Check your email for
                  details.
                </ax-alert>
              </ax-live-preview>

              <ax-code-tabs [tabs]="withTitleCode"></ax-code-tabs>
            </section>

            <section class="alert-doc__section">
              <h2>Dismissible</h2>
              <p>Allow users to close alerts they've acknowledged.</p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
                gap="var(--ax-spacing-md)"
              >
                @if (showDismissible()) {
                  <ax-alert
                    variant="info"
                    dismissible
                    (dismissed)="showDismissible.set(false)"
                  >
                    This alert can be dismissed. Click the X to close.
                  </ax-alert>
                }
                @if (!showDismissible()) {
                  <button
                    mat-stroked-button
                    (click)="showDismissible.set(true)"
                  >
                    Show Alert Again
                  </button>
                }
              </ax-live-preview>

              <ax-code-tabs [tabs]="dismissibleCode"></ax-code-tabs>
            </section>

            <section class="alert-doc__section">
              <h2>With Actions</h2>
              <p>
                Include action buttons for alerts that require user response.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <ax-alert variant="warning" title="Unsaved Changes">
                  You have unsaved changes. Do you want to save before leaving?
                  <div class="alert-doc__actions">
                    <button mat-button>Discard</button>
                    <button mat-flat-button color="primary">
                      Save Changes
                    </button>
                  </div>
                </ax-alert>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="alert-doc__tab-content">
            <section class="alert-doc__section">
              <h2>Form Validation</h2>
              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <ax-alert variant="error" title="Form Submission Failed">
                  <ul class="alert-doc__error-list">
                    <li>Email address is invalid</li>
                    <li>Password must be at least 8 characters</li>
                    <li>Please accept the terms and conditions</li>
                  </ul>
                </ax-alert>
              </ax-live-preview>
            </section>

            <section class="alert-doc__section">
              <h2>System Status</h2>
              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
                gap="var(--ax-spacing-md)"
              >
                <ax-alert variant="warning">
                  <mat-icon>schedule</mat-icon>
                  Scheduled maintenance on Dec 15, 2024 from 2:00 AM - 4:00 AM
                  UTC.
                </ax-alert>
                <ax-alert variant="info">
                  <mat-icon>update</mat-icon>
                  Version 2.0 is now available.
                  <a href="#" class="alert-doc__link">View changelog</a>
                </ax-alert>
              </ax-live-preview>
            </section>

            <section class="alert-doc__section">
              <h2>Inline Alert (Compact)</h2>
              <ax-live-preview variant="bordered">
                <div class="alert-doc__inline-example">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    class="alert-doc__input alert-doc__input--error"
                  />
                  <ax-alert variant="error" compact>
                    Please enter a valid email address
                  </ax-alert>
                </div>
              </ax-live-preview>
            </section>

            <section class="alert-doc__section">
              <h2>Success Feedback</h2>
              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <ax-alert variant="success" title="Profile Updated" dismissible>
                  <div class="alert-doc__success-content">
                    <p>Your profile has been successfully updated.</p>
                    <span class="alert-doc__timestamp">Just now</span>
                  </div>
                </ax-alert>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="alert-doc__tab-content">
            <section class="alert-doc__section">
              <h2>Properties</h2>
              <div class="alert-doc__api-table">
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
                        <code>'info' | 'success' | 'warning' | 'error'</code>
                      </td>
                      <td><code>'info'</code></td>
                      <td>Semantic color variant</td>
                    </tr>
                    <tr>
                      <td><code>title</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Optional heading text</td>
                    </tr>
                    <tr>
                      <td><code>dismissible</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Shows close button</td>
                    </tr>
                    <tr>
                      <td><code>compact</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Reduces padding for inline use</td>
                    </tr>
                    <tr>
                      <td><code>icon</code></td>
                      <td><code>string</code></td>
                      <td><code>auto</code></td>
                      <td>Custom icon name (auto-selects based on variant)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="alert-doc__section">
              <h2>Events</h2>
              <div class="alert-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>dismissed</code></td>
                      <td><code>EventEmitter&lt;void&gt;</code></td>
                      <td>Emitted when the close button is clicked</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="alert-doc__tab-content">
            <ax-component-tokens [tokens]="alertTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="alert-doc__tab-content">
            <section class="alert-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="alert-doc__guidelines">
                <div class="alert-doc__guideline alert-doc__guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Use appropriate variants for message types</li>
                    <li>Keep messages clear and actionable</li>
                    <li>Include actions when user response is needed</li>
                    <li>Make alerts dismissible when appropriate</li>
                    <li>Use titles for complex messages</li>
                  </ul>
                </div>

                <div class="alert-doc__guideline alert-doc__guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Stack too many alerts on one page</li>
                    <li>Use error alerts for non-critical issues</li>
                    <li>Write vague or generic messages</li>
                    <li>Make critical alerts dismissible</li>
                    <li>Use alerts for decorative purposes</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="alert-doc__section">
              <h2>When to Use Each Variant</h2>
              <div class="alert-doc__variant-guide">
                <ax-alert variant="info">
                  <strong>Info:</strong> General information, tips, neutral
                  updates
                </ax-alert>
                <ax-alert variant="success">
                  <strong>Success:</strong> Completed actions, confirmations,
                  positive feedback
                </ax-alert>
                <ax-alert variant="warning">
                  <strong>Warning:</strong> Caution needed, potential issues,
                  important notices
                </ax-alert>
                <ax-alert variant="error">
                  <strong>Error:</strong> Failed actions, validation errors,
                  critical problems
                </ax-alert>
              </div>
            </section>

            <section class="alert-doc__section">
              <h2>Accessibility</h2>
              <ul class="alert-doc__a11y-list">
                <li>
                  Alerts use <code>role="alert"</code> for screen reader
                  announcements
                </li>
                <li>
                  Color is not the only indicator - icons reinforce meaning
                </li>
                <li>Dismiss buttons have accessible labels</li>
                <li>Focus management when alerts appear/disappear</li>
              </ul>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .alert-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .alert-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .alert-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .alert-doc__section {
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

      .alert-doc__actions {
        display: flex;
        gap: var(--ax-spacing-sm, 0.5rem);
        margin-top: var(--ax-spacing-md, 0.75rem);
        justify-content: flex-end;
      }

      .alert-doc__error-list {
        margin: var(--ax-spacing-sm, 0.5rem) 0 0 0;
        padding-left: var(--ax-spacing-lg, 1rem);

        li {
          margin-bottom: var(--ax-spacing-xs, 0.25rem);
        }
      }

      .alert-doc__link {
        color: inherit;
        text-decoration: underline;
        margin-left: var(--ax-spacing-xs, 0.25rem);
      }

      .alert-doc__inline-example {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-xs, 0.25rem);
        max-width: 300px;

        label {
          font-size: var(--ax-text-sm, 0.875rem);
          font-weight: 500;
          color: var(--ax-text-primary);
        }
      }

      .alert-doc__input {
        padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-md, 0.75rem);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-md, 0.5rem);
        font-size: var(--ax-text-sm, 0.875rem);

        &:focus {
          outline: none;
          border-color: var(--ax-brand-default);
        }
      }

      .alert-doc__input--error {
        border-color: var(--ax-error-default);
      }

      .alert-doc__success-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        p {
          margin: 0;
        }
      }

      .alert-doc__timestamp {
        font-size: var(--ax-text-xs, 0.75rem);
        opacity: 0.7;
      }

      /* API Table */
      .alert-doc__api-table {
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
      .alert-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .alert-doc__guideline {
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

      .alert-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .alert-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      .alert-doc__variant-guide {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-md, 0.75rem);
      }

      .alert-doc__a11y-list {
        margin: 0;
        padding-left: var(--ax-spacing-lg, 1rem);

        li {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin-bottom: var(--ax-spacing-sm, 0.5rem);
        }

        code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs, 0.75rem);
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm, 0.25rem);
        }
      }
    `,
  ],
})
export class AlertDocComponent {
  showDismissible = signal(true);

  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-alert variant="info">
  This is an informational message.
</ax-alert>

<ax-alert variant="success">
  Operation completed successfully!
</ax-alert>

<ax-alert variant="warning">
  Please review before proceeding.
</ax-alert>

<ax-alert variant="error">
  An error occurred. Please try again.
</ax-alert>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxAlertComponent } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [AxAlertComponent],
  template: \`
    <ax-alert variant="success">
      Operation completed!
    </ax-alert>
  \`,
})
export class MyComponent {}`,
    },
  ];

  withTitleCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-alert variant="info" title="New Feature Available">
  We've added dark mode support. Try it out in settings!
</ax-alert>

<ax-alert variant="success" title="Payment Successful">
  Your order #12345 has been confirmed.
</ax-alert>`,
    },
  ];

  dismissibleCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-alert
  variant="info"
  dismissible
  (dismissed)="onAlertDismissed()"
>
  This alert can be dismissed.
</ax-alert>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component, signal } from '@angular/core';
import { AxAlertComponent } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [AxAlertComponent],
  template: \`
    @if (showAlert()) {
      <ax-alert
        variant="info"
        dismissible
        (dismissed)="showAlert.set(false)"
      >
        Dismissible alert
      </ax-alert>
    }
  \`,
})
export class MyComponent {
  showAlert = signal(true);
}`,
    },
  ];

  alertTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-info-faint',
      usage: 'Info alert background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-info-emphasis',
      usage: 'Info alert text and icon',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-faint',
      usage: 'Success alert background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-emphasis',
      usage: 'Success alert text and icon',
    },
    {
      category: 'Colors',
      cssVar: '--ax-warning-faint',
      usage: 'Warning alert background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-warning-emphasis',
      usage: 'Warning alert text and icon',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-faint',
      usage: 'Error alert background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-emphasis',
      usage: 'Error alert text and icon',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-md',
      usage: 'Alert corner rounding',
    },
    { category: 'Spacing', cssVar: '--ax-spacing-md', usage: 'Alert padding' },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-sm',
      usage: 'Compact variant padding',
    },
  ];
}
