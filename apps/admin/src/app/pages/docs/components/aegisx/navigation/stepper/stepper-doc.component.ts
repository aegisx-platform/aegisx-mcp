import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken, CodeTab } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-stepper-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="stepper-doc">
      <ax-doc-header
        title="Stepper"
        description="Custom styled Material Stepper with AegisX design tokens. Provides multiple variants for different use cases including forms, wizards, and progress indicators."
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          { label: 'Components', link: '/docs/components' },
          { label: 'Navigation', link: '/docs/components/navigation/stepper' },
          { label: 'Stepper' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { MatStepperModule } from '&#64;angular/material/stepper';"
      ></ax-doc-header>

      <mat-tab-group class="stepper-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="stepper-doc__tab-content">
            <section class="stepper-doc__section">
              <h2>Horizontal Stepper</h2>
              <p>
                Standard horizontal stepper for multi-step forms and wizards.
              </p>

              <ax-live-preview variant="bordered">
                <mat-horizontal-stepper #horizontalStepper linear>
                  <mat-step [stepControl]="firstFormGroup">
                    <ng-template matStepLabel>Personal Info</ng-template>
                    <form [formGroup]="firstFormGroup">
                      <mat-form-field appearance="outline">
                        <mat-label>Name</mat-label>
                        <input
                          matInput
                          formControlName="name"
                          placeholder="Enter your name"
                        />
                      </mat-form-field>
                      <div class="stepper-actions">
                        <button mat-flat-button color="primary" matStepperNext>
                          Next
                        </button>
                      </div>
                    </form>
                  </mat-step>
                  <mat-step [stepControl]="secondFormGroup">
                    <ng-template matStepLabel>Contact</ng-template>
                    <form [formGroup]="secondFormGroup">
                      <mat-form-field appearance="outline">
                        <mat-label>Email</mat-label>
                        <input
                          matInput
                          formControlName="email"
                          placeholder="Enter your email"
                        />
                      </mat-form-field>
                      <div class="stepper-actions">
                        <button mat-stroked-button matStepperPrevious>
                          Back
                        </button>
                        <button mat-flat-button color="primary" matStepperNext>
                          Next
                        </button>
                      </div>
                    </form>
                  </mat-step>
                  <mat-step>
                    <ng-template matStepLabel>Review</ng-template>
                    <p>Review your information and submit.</p>
                    <div class="stepper-actions">
                      <button mat-stroked-button matStepperPrevious>
                        Back
                      </button>
                      <button
                        mat-flat-button
                        color="primary"
                        (click)="horizontalStepper.reset()"
                      >
                        Submit
                      </button>
                    </div>
                  </mat-step>
                </mat-horizontal-stepper>
              </ax-live-preview>

              <ax-code-tabs [tabs]="horizontalCode"></ax-code-tabs>
            </section>

            <section class="stepper-doc__section">
              <h2>Vertical Stepper</h2>
              <p>
                Vertical layout for step-by-step processes with more content per
                step.
              </p>

              <ax-live-preview variant="bordered">
                <mat-vertical-stepper #verticalStepper>
                  <mat-step>
                    <ng-template matStepLabel>Choose a plan</ng-template>
                    <p>
                      Select the subscription plan that best fits your needs.
                    </p>
                    <div class="stepper-actions">
                      <button mat-flat-button color="primary" matStepperNext>
                        Continue
                      </button>
                    </div>
                  </mat-step>
                  <mat-step>
                    <ng-template matStepLabel>Add payment method</ng-template>
                    <p>Enter your payment details securely.</p>
                    <div class="stepper-actions">
                      <button mat-stroked-button matStepperPrevious>
                        Back
                      </button>
                      <button mat-flat-button color="primary" matStepperNext>
                        Continue
                      </button>
                    </div>
                  </mat-step>
                  <mat-step>
                    <ng-template matStepLabel>Confirm subscription</ng-template>
                    <p>Review and confirm your subscription.</p>
                    <div class="stepper-actions">
                      <button mat-stroked-button matStepperPrevious>
                        Back
                      </button>
                      <button
                        mat-flat-button
                        color="primary"
                        (click)="verticalStepper.reset()"
                      >
                        Confirm
                      </button>
                    </div>
                  </mat-step>
                </mat-vertical-stepper>
              </ax-live-preview>

              <ax-code-tabs [tabs]="verticalCode"></ax-code-tabs>
            </section>

            <section class="stepper-doc__section">
              <h2>Compact Variant</h2>
              <p>
                Smaller stepper for limited space. Add the
                <code>ax-stepper-compact</code> class.
              </p>

              <ax-live-preview variant="bordered">
                <mat-horizontal-stepper
                  class="ax-stepper-compact"
                  #compactStepper
                >
                  <mat-step label="Step 1">
                    <p>First step content</p>
                    <button mat-flat-button color="primary" matStepperNext>
                      Next
                    </button>
                  </mat-step>
                  <mat-step label="Step 2">
                    <p>Second step content</p>
                    <button mat-stroked-button matStepperPrevious>Back</button>
                    <button mat-flat-button color="primary" matStepperNext>
                      Next
                    </button>
                  </mat-step>
                  <mat-step label="Step 3">
                    <p>Third step content</p>
                    <button mat-stroked-button matStepperPrevious>Back</button>
                    <button
                      mat-flat-button
                      color="primary"
                      (click)="compactStepper.reset()"
                    >
                      Done
                    </button>
                  </mat-step>
                </mat-horizontal-stepper>
              </ax-live-preview>

              <ax-code-tabs [tabs]="compactCode"></ax-code-tabs>
            </section>

            <section class="stepper-doc__section">
              <h2>Card Variant</h2>
              <p>
                Elevated card style for prominent steppers. Add the
                <code>ax-stepper-card</code> class.
              </p>

              <ax-live-preview variant="bordered">
                <mat-horizontal-stepper class="ax-stepper-card" #cardStepper>
                  <mat-step label="Account">
                    <p>Create your account credentials.</p>
                    <button mat-flat-button color="primary" matStepperNext>
                      Next
                    </button>
                  </mat-step>
                  <mat-step label="Profile">
                    <p>Complete your profile information.</p>
                    <button mat-stroked-button matStepperPrevious>Back</button>
                    <button mat-flat-button color="primary" matStepperNext>
                      Next
                    </button>
                  </mat-step>
                  <mat-step label="Complete">
                    <p>All done! Your account is ready.</p>
                    <button mat-stroked-button matStepperPrevious>Back</button>
                    <button
                      mat-flat-button
                      color="primary"
                      (click)="cardStepper.reset()"
                    >
                      Finish
                    </button>
                  </mat-step>
                </mat-horizontal-stepper>
              </ax-live-preview>

              <ax-code-tabs [tabs]="cardCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="stepper-doc__tab-content">
            <section class="stepper-doc__section">
              <h2>CSS Classes</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>ax-stepper-compact</code></td>
                      <td>Smaller step icons and reduced spacing</td>
                    </tr>
                    <tr>
                      <td><code>ax-stepper-card</code></td>
                      <td>Elevated card appearance with shadow</td>
                    </tr>
                    <tr>
                      <td><code>ax-stepper-no-border</code></td>
                      <td>Removes header border for cleaner look</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="stepper-doc__section">
              <h2>Stepper Inputs</h2>
              <p>Standard Angular Material Stepper inputs are supported:</p>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>linear</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Require steps to be completed in order</td>
                    </tr>
                    <tr>
                      <td><code>selectedIndex</code></td>
                      <td>number</td>
                      <td>0</td>
                      <td>Index of the current step</td>
                    </tr>
                    <tr>
                      <td><code>orientation</code></td>
                      <td>'horizontal' | 'vertical'</td>
                      <td>'horizontal'</td>
                      <td>Stepper orientation</td>
                    </tr>
                    <tr>
                      <td><code>labelPosition</code></td>
                      <td>'bottom' | 'end'</td>
                      <td>'end'</td>
                      <td>Label position for horizontal stepper</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="stepper-doc__section">
              <h2>Step Inputs</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>label</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Step label text</td>
                    </tr>
                    <tr>
                      <td><code>stepControl</code></td>
                      <td>AbstractControl</td>
                      <td>-</td>
                      <td>Form control for validation</td>
                    </tr>
                    <tr>
                      <td><code>optional</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Mark step as optional</td>
                    </tr>
                    <tr>
                      <td><code>editable</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Allow returning to this step</td>
                    </tr>
                    <tr>
                      <td><code>completed</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Mark step as completed</td>
                    </tr>
                    <tr>
                      <td><code>errorMessage</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Error message when step has error</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Design Tokens Tab -->
        <mat-tab label="Design Tokens">
          <div class="stepper-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .stepper-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .stepper-doc__tabs {
        margin-top: 2rem;
      }

      .stepper-doc__tab-content {
        padding: 1.5rem 0;
      }

      .stepper-doc__section {
        margin-bottom: 3rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
      }

      .stepper-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .api-table {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;

          th,
          td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--ax-border-default);
          }

          th {
            font-weight: 600;
            color: var(--ax-text-heading);
            background: var(--ax-background-subtle);
          }

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: var(--ax-radius-sm);
            font-size: 0.8125rem;
          }
        }
      }

      mat-form-field {
        width: 100%;
        max-width: 300px;
      }
    `,
  ],
})
export class StepperDocComponent {
  private fb = new FormBuilder();

  firstFormGroup = this.fb.group({
    name: ['', Validators.required],
  });

  secondFormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly horizontalCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<mat-horizontal-stepper #stepper linear>
  <mat-step [stepControl]="firstFormGroup">
    <ng-template matStepLabel>Personal Info</ng-template>
    <form [formGroup]="firstFormGroup">
      <mat-form-field appearance="outline">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name">
      </mat-form-field>
      <div class="stepper-actions">
        <button mat-flat-button color="primary" matStepperNext>
          Next
        </button>
      </div>
    </form>
  </mat-step>

  <mat-step [stepControl]="secondFormGroup">
    <ng-template matStepLabel>Contact</ng-template>
    <!-- Step content -->
  </mat-step>

  <mat-step>
    <ng-template matStepLabel>Review</ng-template>
    <!-- Final step -->
  </mat-step>
</mat-horizontal-stepper>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { FormBuilder, Validators } from '@angular/forms';

export class MyComponent {
  private fb = new FormBuilder();

  firstFormGroup = this.fb.group({
    name: ['', Validators.required]
  });

  secondFormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
}`,
    },
  ];

  readonly verticalCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<mat-vertical-stepper #stepper>
  <mat-step>
    <ng-template matStepLabel>Choose a plan</ng-template>
    <p>Select the subscription plan.</p>
    <button mat-flat-button color="primary" matStepperNext>
      Continue
    </button>
  </mat-step>

  <mat-step>
    <ng-template matStepLabel>Payment</ng-template>
    <p>Enter payment details.</p>
    <button mat-stroked-button matStepperPrevious>Back</button>
    <button mat-flat-button color="primary" matStepperNext>
      Continue
    </button>
  </mat-step>

  <mat-step>
    <ng-template matStepLabel>Confirm</ng-template>
    <p>All done!</p>
  </mat-step>
</mat-vertical-stepper>`,
    },
  ];

  readonly compactCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Add ax-stepper-compact class for smaller size -->
<mat-horizontal-stepper class="ax-stepper-compact">
  <mat-step label="Step 1">...</mat-step>
  <mat-step label="Step 2">...</mat-step>
  <mat-step label="Step 3">...</mat-step>
</mat-horizontal-stepper>`,
    },
  ];

  readonly cardCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Add ax-stepper-card class for elevated card style -->
<mat-horizontal-stepper class="ax-stepper-card">
  <mat-step label="Account">...</mat-step>
  <mat-step label="Profile">...</mat-step>
  <mat-step label="Complete">...</mat-step>
</mat-horizontal-stepper>

<!-- Combine with other variants -->
<mat-horizontal-stepper class="ax-stepper-card ax-stepper-compact">
  ...
</mat-horizontal-stepper>`,
    },
  ];

  readonly designTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-brand-default',
      usage: 'Active step indicator',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-faint',
      usage: 'Active step background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-default',
      usage: 'Completed step checkmark',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-faint',
      usage: 'Completed step background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-subtle',
      usage: 'Inactive step text',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-heading',
      usage: 'Active step label',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-default',
      usage: 'Step divider line',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Card variant background',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-lg',
      usage: 'Card variant radius',
    },
    {
      category: 'Shadows',
      cssVar: '--ax-shadow-sm',
      usage: 'Card variant elevation',
    },
  ];
}
