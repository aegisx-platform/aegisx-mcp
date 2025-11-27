import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AxDatePickerComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-date-picker-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    AxDatePickerComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="date-picker-doc">
      <ax-doc-header
        title="Date Picker"
        description="Full-featured date selection component with Thai/English localization, Buddhist calendar support, and keyboard navigation."
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          {
            label: 'Components',
            link: '/docs/components/data-display/overview',
          },
          { label: 'Forms', link: '/docs/components/forms/date-picker' },
          { label: 'Date Picker' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxDatePickerComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="date-picker-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="date-picker-doc__tab-content">
            <section class="date-picker-doc__section">
              <h2>Basic Usage</h2>
              <p>
                A date picker with calendar dropdown. Supports both English and
                Thai locales, with optional Buddhist calendar year display.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="start"
                gap="var(--ax-spacing-lg)"
              >
                <ax-date-picker
                  label="Select Date"
                  placeholder="Choose a date"
                  [(ngModel)]="basicDate"
                >
                </ax-date-picker>
                <span class="date-picker-doc__value">
                  Selected:
                  {{ basicDate ? basicDate.toLocaleDateString() : 'None' }}
                </span>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="date-picker-doc__section">
              <h2>Thai Locale</h2>
              <p>
                Switch to Thai language with full Thai month names and weekdays.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="start"
                gap="var(--ax-spacing-lg)"
              >
                <ax-date-picker
                  label="เลือกวันที่"
                  placeholder="กรุณาเลือกวันที่"
                  locale="th"
                  [(ngModel)]="thaiDate"
                >
                </ax-date-picker>

                <ax-date-picker
                  label="พ.ศ. (Buddhist Era)"
                  placeholder="เลือกวันที่"
                  locale="th"
                  calendar="buddhist"
                  [(ngModel)]="buddhistDate"
                >
                </ax-date-picker>
              </ax-live-preview>
            </section>

            <section class="date-picker-doc__section">
              <h2>Sizes</h2>
              <p>Two sizes available for different form contexts.</p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="start"
                gap="var(--ax-spacing-md)"
              >
                <ax-date-picker
                  label="Small"
                  size="sm"
                  placeholder="Small date picker"
                >
                </ax-date-picker>

                <ax-date-picker
                  label="Medium (default)"
                  size="md"
                  placeholder="Medium date picker"
                >
                </ax-date-picker>
              </ax-live-preview>
            </section>

            <section class="date-picker-doc__section">
              <h2>Date Constraints</h2>
              <p>Set minimum and maximum dates to restrict selection.</p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="start"
                gap="var(--ax-spacing-md)"
              >
                <ax-date-picker
                  label="Future dates only"
                  placeholder="Select future date"
                  [minDate]="today"
                  [(ngModel)]="futureDate"
                >
                </ax-date-picker>

                <ax-date-picker
                  label="Past dates only"
                  placeholder="Select past date"
                  [maxDate]="today"
                  [(ngModel)]="pastDate"
                >
                </ax-date-picker>

                <ax-date-picker
                  label="Date range (next 30 days)"
                  placeholder="Select date"
                  [minDate]="today"
                  [maxDate]="thirtyDaysFromNow"
                  [(ngModel)]="rangeDate"
                >
                </ax-date-picker>
              </ax-live-preview>
            </section>

            <section class="date-picker-doc__section">
              <h2>Custom Format</h2>
              <p>Use custom date format patterns for display.</p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="start"
                gap="var(--ax-spacing-md)"
              >
                <ax-date-picker
                  label="DD/MM/YYYY format"
                  placeholder="DD/MM/YYYY"
                  dateFormat="DD/MM/YYYY"
                  [(ngModel)]="formatDate1"
                >
                </ax-date-picker>

                <ax-date-picker
                  label="MMM DD, YYYY format"
                  placeholder="MMM DD, YYYY"
                  dateFormat="MMM DD, YYYY"
                  [(ngModel)]="formatDate2"
                >
                </ax-date-picker>

                <ax-date-picker
                  label="Thai format (DD MMMM YYYY)"
                  placeholder="วัน เดือน ปี"
                  locale="th"
                  calendar="buddhist"
                  dateFormat="DD MMMM YYYY"
                  [(ngModel)]="formatDate3"
                >
                </ax-date-picker>
              </ax-live-preview>
            </section>

            <section class="date-picker-doc__section">
              <h2>States</h2>
              <p>Different visual states for form validation and feedback.</p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                align="start"
                gap="var(--ax-spacing-md)"
              >
                <ax-date-picker
                  label="With helper text"
                  placeholder="Select date"
                  helperText="Choose your preferred date"
                >
                </ax-date-picker>

                <ax-date-picker
                  label="With error"
                  placeholder="Select date"
                  errorMessage="This field is required"
                >
                </ax-date-picker>

                <ax-date-picker
                  label="Disabled"
                  placeholder="Cannot select"
                  [disabled]="true"
                >
                </ax-date-picker>

                <ax-date-picker
                  label="Read-only"
                  placeholder="View only"
                  [readonly]="true"
                  [ngModel]="today"
                >
                </ax-date-picker>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="date-picker-doc__tab-content">
            <section class="date-picker-doc__section">
              <h2>Event Registration Form</h2>
              <ax-live-preview variant="bordered">
                <div class="date-picker-doc__form-example">
                  <ax-date-picker
                    label="Event Date"
                    placeholder="When is your event?"
                    [minDate]="today"
                    [required]="true"
                    [showActionButtons]="true"
                    [(ngModel)]="eventDate"
                  >
                  </ax-date-picker>

                  <ax-date-picker
                    label="Registration Deadline"
                    placeholder="Last day to register"
                    [minDate]="today"
                    [maxDate]="eventDate || undefined"
                    helperText="Must be before event date"
                    [(ngModel)]="registrationDeadline"
                  >
                  </ax-date-picker>
                </div>
              </ax-live-preview>
            </section>

            <section class="date-picker-doc__section">
              <h2>Booking Form (Thai)</h2>
              <ax-live-preview variant="bordered">
                <div class="date-picker-doc__form-example">
                  <ax-date-picker
                    label="วันที่เช็คอิน"
                    placeholder="เลือกวันที่"
                    locale="th"
                    calendar="buddhist"
                    [minDate]="today"
                    [firstDayOfWeek]="1"
                    [(ngModel)]="checkInDate"
                  >
                  </ax-date-picker>

                  <ax-date-picker
                    label="วันที่เช็คเอาท์"
                    placeholder="เลือกวันที่"
                    locale="th"
                    calendar="buddhist"
                    [minDate]="checkInDate || today"
                    [firstDayOfWeek]="1"
                    [(ngModel)]="checkOutDate"
                  >
                  </ax-date-picker>
                </div>
              </ax-live-preview>
            </section>

            <section class="date-picker-doc__section">
              <h2>Birthday Selection</h2>
              <ax-live-preview variant="bordered">
                <div class="date-picker-doc__form-example">
                  <ax-date-picker
                    label="Date of Birth"
                    placeholder="Select your birthday"
                    [maxDate]="today"
                    dateFormat="MMMM DD, YYYY"
                    [(ngModel)]="birthday"
                  >
                  </ax-date-picker>
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="date-picker-doc__tab-content">
            <section class="date-picker-doc__section">
              <h2>Properties</h2>
              <div class="date-picker-doc__api-table">
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
                      <td>Field label</td>
                    </tr>
                    <tr>
                      <td><code>placeholder</code></td>
                      <td><code>string</code></td>
                      <td><code>'Select date'</code></td>
                      <td>Placeholder text</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td><code>'sm' | 'md'</code></td>
                      <td><code>'md'</code></td>
                      <td>Input size</td>
                    </tr>
                    <tr>
                      <td><code>locale</code></td>
                      <td><code>'en' | 'th'</code></td>
                      <td><code>'en'</code></td>
                      <td>Display locale</td>
                    </tr>
                    <tr>
                      <td><code>calendar</code></td>
                      <td><code>'gregorian' | 'buddhist'</code></td>
                      <td><code>'gregorian'</code></td>
                      <td>Calendar system</td>
                    </tr>
                    <tr>
                      <td><code>monthFormat</code></td>
                      <td><code>'full' | 'short'</code></td>
                      <td><code>'full'</code></td>
                      <td>Month name format</td>
                    </tr>
                    <tr>
                      <td><code>firstDayOfWeek</code></td>
                      <td><code>0-6</code></td>
                      <td><code>0</code></td>
                      <td>Week start (0=Sun, 1=Mon)</td>
                    </tr>
                    <tr>
                      <td><code>dateFormat</code></td>
                      <td><code>string</code></td>
                      <td><code>undefined</code></td>
                      <td>Custom date format pattern</td>
                    </tr>
                    <tr>
                      <td><code>minDate</code></td>
                      <td><code>Date</code></td>
                      <td><code>undefined</code></td>
                      <td>Minimum selectable date</td>
                    </tr>
                    <tr>
                      <td><code>maxDate</code></td>
                      <td><code>Date</code></td>
                      <td><code>undefined</code></td>
                      <td>Maximum selectable date</td>
                    </tr>
                    <tr>
                      <td><code>disabled</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Disable the input</td>
                    </tr>
                    <tr>
                      <td><code>readonly</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Make input read-only</td>
                    </tr>
                    <tr>
                      <td><code>required</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Mark as required</td>
                    </tr>
                    <tr>
                      <td><code>helperText</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Helper text below input</td>
                    </tr>
                    <tr>
                      <td><code>errorMessage</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Error message to display</td>
                    </tr>
                    <tr>
                      <td><code>showActionButtons</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Show Today/Clear buttons</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="date-picker-doc__section">
              <h2>Date Format Tokens</h2>
              <div class="date-picker-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Description</th>
                      <th>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>DD</code></td>
                      <td>Day with leading zero</td>
                      <td>01, 15, 31</td>
                    </tr>
                    <tr>
                      <td><code>D</code></td>
                      <td>Day without leading zero</td>
                      <td>1, 15, 31</td>
                    </tr>
                    <tr>
                      <td><code>MM</code></td>
                      <td>Month with leading zero</td>
                      <td>01, 06, 12</td>
                    </tr>
                    <tr>
                      <td><code>M</code></td>
                      <td>Month without leading zero</td>
                      <td>1, 6, 12</td>
                    </tr>
                    <tr>
                      <td><code>MMM</code></td>
                      <td>Short month name</td>
                      <td>Jan, Jun, ม.ค.</td>
                    </tr>
                    <tr>
                      <td><code>MMMM</code></td>
                      <td>Full month name</td>
                      <td>January, มกราคม</td>
                    </tr>
                    <tr>
                      <td><code>YYYY</code></td>
                      <td>Full year</td>
                      <td>2024, 2567</td>
                    </tr>
                    <tr>
                      <td><code>YY</code></td>
                      <td>2-digit year</td>
                      <td>24, 67</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="date-picker-doc__tab-content">
            <ax-component-tokens
              [tokens]="datePickerTokens"
            ></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="date-picker-doc__tab-content">
            <section class="date-picker-doc__section">
              <h2>Keyboard Navigation</h2>
              <div class="date-picker-doc__keyboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>Enter</code> / <code>Space</code></td>
                      <td>Open calendar / Select date</td>
                    </tr>
                    <tr>
                      <td><code>Escape</code></td>
                      <td>Close calendar</td>
                    </tr>
                    <tr>
                      <td><code>Arrow keys</code></td>
                      <td>Navigate days/months/years</td>
                    </tr>
                    <tr>
                      <td><code>PageUp</code></td>
                      <td>Previous month</td>
                    </tr>
                    <tr>
                      <td><code>PageDown</code></td>
                      <td>Next month</td>
                    </tr>
                    <tr>
                      <td><code>Shift + PageUp</code></td>
                      <td>Previous year</td>
                    </tr>
                    <tr>
                      <td><code>Shift + PageDown</code></td>
                      <td>Next year</td>
                    </tr>
                    <tr>
                      <td><code>Home</code></td>
                      <td>First day of month</td>
                    </tr>
                    <tr>
                      <td><code>End</code></td>
                      <td>Last day of month</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="date-picker-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="date-picker-doc__guidelines">
                <div
                  class="date-picker-doc__guideline date-picker-doc__guideline--do"
                >
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Use appropriate date constraints (min/max)</li>
                    <li>Match locale to your user's language</li>
                    <li>Provide clear labels and helper text</li>
                    <li>Use consistent date formats across your app</li>
                  </ul>
                </div>

                <div
                  class="date-picker-doc__guideline date-picker-doc__guideline--dont"
                >
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Set conflicting min/max dates</li>
                    <li>Mix calendar systems without clear indication</li>
                    <li>Use overly complex date formats</li>
                    <li>Disable dates without explaining why</li>
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
      .date-picker-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .date-picker-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .date-picker-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .date-picker-doc__section {
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

      .date-picker-doc__value {
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-secondary);
      }

      .date-picker-doc__form-example {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-md, 0.75rem);
        max-width: 320px;
      }

      /* API Table */
      .date-picker-doc__api-table,
      .date-picker-doc__keyboard-table {
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
      .date-picker-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .date-picker-doc__guideline {
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

      .date-picker-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .date-picker-doc__guideline--dont {
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
export class DatePickerDocComponent {
  // Demo values
  basicDate: Date | null = null;
  thaiDate: Date | null = null;
  buddhistDate: Date | null = null;
  futureDate: Date | null = null;
  pastDate: Date | null = null;
  rangeDate: Date | null = null;
  formatDate1: Date | null = null;
  formatDate2: Date | null = null;
  formatDate3: Date | null = null;
  eventDate: Date | null = null;
  registrationDeadline: Date | null = null;
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  birthday: Date | null = null;

  // Date references
  today = new Date();
  thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-date-picker
  label="Select Date"
  placeholder="Choose a date"
  [(ngModel)]="selectedDate">
</ax-date-picker>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AxDatePickerComponent } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [FormsModule, AxDatePickerComponent],
  template: \`
    <ax-date-picker
      label="Select Date"
      [(ngModel)]="selectedDate">
    </ax-date-picker>
  \`,
})
export class MyComponent {
  selectedDate: Date | null = null;
}`,
    },
  ];

  datePickerTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Input and calendar background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-default',
      usage: 'Input border',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-emphasis',
      usage: 'Focus state border',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-default',
      usage: 'Selected date background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-inverted',
      usage: 'Selected date text',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-primary',
      usage: 'Calendar day text',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-secondary',
      usage: 'Other month days',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-default',
      usage: 'Error state border',
    },
    { category: 'Borders', cssVar: '--ax-radius-md', usage: 'Input corners' },
    {
      category: 'Borders',
      cssVar: '--ax-radius-lg',
      usage: 'Calendar corners',
    },
    {
      category: 'Shadows',
      cssVar: '--ax-shadow-lg',
      usage: 'Calendar dropdown shadow',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-sm',
      usage: 'Calendar cell padding',
    },
  ];
}
