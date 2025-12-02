import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { AxThemeService } from '@aegisx/ui';
import { DocHeaderComponent } from '../../../../components/docs/doc-header/doc-header.component';
import { CodeTabsComponent } from '../../../../components/docs/code-tabs/code-tabs.component';
import { CodeTab } from '../../../../types/docs.types';

@Component({
  selector: 'app-theming',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatTooltipModule,
    MatSnackBarModule,
    DocHeaderComponent,
    CodeTabsComponent,
  ],
  template: `
    <div class="theming-page">
      <ax-doc-header
        title="Theming"
        icon="palette"
        description="Complete guide to the AegisX theme system. Learn how to configure, customize, and create themes for your application."
        [breadcrumbs]="[
          { label: 'Foundations', link: '/docs/foundations/overview' },
          { label: 'Theming' },
        ]"
        [showImport]="false"
        [showQuickLinks]="false"
      ></ax-doc-header>

      <!-- Overview Section -->
      <section class="doc-section">
        <h2>Overview</h2>
        <p>
          The AegisX theme system provides a flexible, CSS-variable-based
          approach to theming. It supports multiple color schemes, light/dark
          modes, and easy customization through the Theme Builder tool.
        </p>

        <div class="feature-grid">
          <div class="feature-card">
            <mat-icon>palette</mat-icon>
            <h3>CSS Variables</h3>
            <p>
              All styling uses <code>--ax-*</code> CSS custom properties for
              easy customization
            </p>
          </div>
          <div class="feature-card">
            <mat-icon>dark_mode</mat-icon>
            <h3>Light & Dark Mode</h3>
            <p>
              Built-in support for light and dark modes with automatic system
              detection
            </p>
          </div>
          <div class="feature-card">
            <mat-icon>tune</mat-icon>
            <h3>Theme Builder</h3>
            <p>
              Visual editor with M3 color generation for creating custom themes
            </p>
          </div>
          <div class="feature-card">
            <mat-icon>sync</mat-icon>
            <h3>Runtime Switching</h3>
            <p>Switch themes instantly with the AxThemeService API</p>
          </div>
        </div>
      </section>

      <!-- Architecture Section -->
      <section class="doc-section">
        <h2>Architecture</h2>

        <div class="architecture-diagram">
          <div class="arch-box seed">
            <mat-icon>colorize</mat-icon>
            <span>Seed Color</span>
          </div>
          <mat-icon class="arch-arrow">arrow_forward</mat-icon>
          <div class="arch-box m3">
            <mat-icon>auto_awesome</mat-icon>
            <span>M3 Algorithm</span>
          </div>
          <mat-icon class="arch-arrow">arrow_forward</mat-icon>
          <div class="arch-box variables">
            <mat-icon>code</mat-icon>
            <span>--ax-* Variables</span>
          </div>
          <mat-icon class="arch-arrow">arrow_forward</mat-icon>
          <div class="arch-box theme">
            <mat-icon>style</mat-icon>
            <span>Theme File</span>
          </div>
        </div>

        <div class="file-structure">
          <h3>File Structure</h3>
          <ax-code-tabs [tabs]="fileStructureTabs"></ax-code-tabs>
        </div>
      </section>

      <!-- Quick Start Section -->
      <section class="doc-section">
        <h2>Quick Start</h2>

        <div class="step-cards">
          <div class="step-card">
            <div class="step-header">
              <span class="step-number">1</span>
              <h4>Import Styles</h4>
            </div>
            <p>Add the AegisX theme to your application's styles</p>
            <ax-code-tabs [tabs]="quickStartStep1Tabs"></ax-code-tabs>
          </div>

          <div class="step-card">
            <div class="step-header">
              <span class="step-number">2</span>
              <h4>Provide Theme Service</h4>
            </div>
            <p>Register the AxThemeService in your app config</p>
            <ax-code-tabs [tabs]="quickStartStep2Tabs"></ax-code-tabs>
          </div>

          <div class="step-card">
            <div class="step-header">
              <span class="step-number">3</span>
              <h4>Use Theme Switcher</h4>
            </div>
            <p>Add the theme switcher component to your layout</p>
            <ax-code-tabs [tabs]="quickStartStep3Tabs"></ax-code-tabs>
          </div>
        </div>
      </section>

      <!-- CSS Variables Section -->
      <section class="doc-section">
        <h2>CSS Variables Reference</h2>
        <p>
          All theme variables follow the <code>--ax-*</code> naming convention.
          Use these variables in your components for consistent theming.
        </p>

        <mat-tab-group>
          <mat-tab label="Brand & Primary">
            <div class="variables-table">
              @for (v of brandVariables; track v.name) {
                <div
                  class="variable-row"
                  (click)="copyVariable(v.name)"
                  matTooltip="Click to copy"
                >
                  <div
                    class="color-preview"
                    [style.background]="'var(' + v.name + ')'"
                  ></div>
                  <code class="var-name">{{ v.name }}</code>
                  <span class="var-desc">{{ v.description }}</span>
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Background">
            <div class="variables-table">
              @for (v of backgroundVariables; track v.name) {
                <div
                  class="variable-row"
                  (click)="copyVariable(v.name)"
                  matTooltip="Click to copy"
                >
                  <div
                    class="color-preview"
                    [style.background]="'var(' + v.name + ')'"
                  ></div>
                  <code class="var-name">{{ v.name }}</code>
                  <span class="var-desc">{{ v.description }}</span>
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Text">
            <div class="variables-table">
              @for (v of textVariables; track v.name) {
                <div
                  class="variable-row"
                  (click)="copyVariable(v.name)"
                  matTooltip="Click to copy"
                >
                  <div
                    class="color-preview"
                    [style.background]="'var(' + v.name + ')'"
                  ></div>
                  <code class="var-name">{{ v.name }}</code>
                  <span class="var-desc">{{ v.description }}</span>
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Semantic">
            <div class="variables-table">
              @for (v of semanticVariables; track v.name) {
                <div
                  class="variable-row"
                  (click)="copyVariable(v.name)"
                  matTooltip="Click to copy"
                >
                  <div
                    class="color-preview"
                    [style.background]="'var(' + v.name + ')'"
                  ></div>
                  <code class="var-name">{{ v.name }}</code>
                  <span class="var-desc">{{ v.description }}</span>
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Border & Shadow">
            <div class="variables-table">
              @for (v of borderVariables; track v.name) {
                <div
                  class="variable-row"
                  (click)="copyVariable(v.name)"
                  matTooltip="Click to copy"
                >
                  <div
                    class="color-preview"
                    [style.background]="'var(' + v.name + ')'"
                  ></div>
                  <code class="var-name">{{ v.name }}</code>
                  <span class="var-desc">{{ v.description }}</span>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </section>

      <!-- Creating Custom Theme Section -->
      <section class="doc-section">
        <h2>Creating a Custom Theme</h2>

        <div class="workflow-overview">
          <p>
            The easiest way to create a custom theme is using the
            <a routerLink="/tools/theme-builder">Theme Builder</a> with M3 color
            generation. Here's the complete workflow:
          </p>
        </div>

        <div class="step-cards">
          <div class="step-card highlight">
            <div class="step-header">
              <span class="step-number">1</span>
              <h4>Generate Colors with Theme Builder</h4>
            </div>
            <ol>
              <li>
                Open <a routerLink="/tools/theme-builder">Theme Builder</a>
              </li>
              <li>Go to the <strong>Color Palette</strong> tab</li>
              <li>
                Pick your <strong>seed color</strong> (brand primary color)
              </li>
              <li>The M3 algorithm generates all palettes automatically</li>
              <li>Switch to <strong>Key Colors</strong> view</li>
              <li>Toggle Light/Dark to preview both modes</li>
              <li>
                Click <strong>"Preview Code"</strong> to see generated CSS
              </li>
              <li>Click <strong>"Copy CSS"</strong> to copy to clipboard</li>
            </ol>
          </div>

          <div class="step-card">
            <div class="step-header">
              <span class="step-number">2</span>
              <h4>Create Theme Files</h4>
            </div>
            <p>Create your theme directory and files:</p>
            <ax-code-tabs [tabs]="createThemeFilesTabs"></ax-code-tabs>
          </div>

          <div class="step-card">
            <div class="step-header">
              <span class="step-number">3</span>
              <h4>Paste Generated CSS</h4>
            </div>
            <p>Paste the CSS from Theme Builder into your theme files:</p>
            <ax-code-tabs [tabs]="pasteThemeCssTabs"></ax-code-tabs>
          </div>

          <div class="step-card">
            <div class="step-header">
              <span class="step-number">4</span>
              <h4>Register Theme in Service</h4>
            </div>
            <p>Add your theme to the AxThemeService:</p>
            <ax-code-tabs [tabs]="registerThemeTabs"></ax-code-tabs>
          </div>

          <div class="step-card">
            <div class="step-header">
              <span class="step-number">5</span>
              <h4>Import in _all-themes.scss</h4>
            </div>
            <p>Add your theme imports:</p>
            <ax-code-tabs [tabs]="importThemeTabs"></ax-code-tabs>
          </div>
        </div>
      </section>

      <!-- Theme Service API Section -->
      <section class="doc-section">
        <h2>AxThemeService API</h2>

        <div class="api-table-container">
          <h3>Properties (Signals)</h3>
          <table class="api-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>colorScheme()</code></td>
                <td><code>'aegisx' | 'verus' | string</code></td>
                <td>Current color scheme name</td>
              </tr>
              <tr>
                <td><code>mode()</code></td>
                <td><code>'light' | 'dark'</code></td>
                <td>Current light/dark mode</td>
              </tr>
              <tr>
                <td><code>themeId()</code></td>
                <td><code>string</code></td>
                <td>Combined theme ID (e.g., 'aegisx-light')</td>
              </tr>
              <tr>
                <td><code>dataTheme()</code></td>
                <td><code>string</code></td>
                <td>Value used in data-theme attribute</td>
              </tr>
              <tr>
                <td><code>currentTheme()</code></td>
                <td><code>ThemeOption</code></td>
                <td>Full current theme configuration object</td>
              </tr>
              <tr>
                <td><code>themes</code></td>
                <td><code>ThemeOption[]</code></td>
                <td>Array of all available themes</td>
              </tr>
              <tr>
                <td><code>colorSchemes</code></td>
                <td><code>ColorSchemeOption[]</code></td>
                <td>Array of available color schemes</td>
              </tr>
            </tbody>
          </table>

          <h3>Methods</h3>
          <table class="api-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Parameters</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>setColorScheme()</code></td>
                <td><code>scheme: string</code></td>
                <td>Change color scheme (keeps current mode)</td>
              </tr>
              <tr>
                <td><code>setMode()</code></td>
                <td><code>mode: 'light' | 'dark'</code></td>
                <td>Change light/dark mode</td>
              </tr>
              <tr>
                <td><code>toggleMode()</code></td>
                <td>none</td>
                <td>Toggle between light and dark mode</td>
              </tr>
              <tr>
                <td><code>setTheme()</code></td>
                <td><code>themeId: string</code></td>
                <td>Set theme by ID (e.g., 'verus-dark')</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Usage Examples</h3>
        <ax-code-tabs [tabs]="serviceUsageTabs"></ax-code-tabs>
      </section>

      <!-- Current Theme Status -->
      <section class="doc-section">
        <h2>Current Theme</h2>
        <div class="current-theme-card">
          <div class="theme-info">
            <div class="info-row">
              <span class="label">Color Scheme:</span>
              <code>{{ themeService.colorScheme() }}</code>
            </div>
            <div class="info-row">
              <span class="label">Mode:</span>
              <code>{{ themeService.mode() }}</code>
            </div>
            <div class="info-row">
              <span class="label">Theme ID:</span>
              <code>{{ themeService.themeId() }}</code>
            </div>
            <div class="info-row">
              <span class="label">Data Theme:</span>
              <code>{{ themeService.dataTheme() }}</code>
            </div>
          </div>
          <div class="theme-actions">
            <button mat-stroked-button (click)="themeService.toggleMode()">
              <mat-icon>{{
                themeService.mode() === 'light' ? 'dark_mode' : 'light_mode'
              }}</mat-icon>
              Toggle Mode
            </button>
          </div>
        </div>
      </section>

      <!-- Related Links -->
      <section class="doc-section">
        <h2>Related</h2>
        <div class="related-links">
          <a routerLink="/tools/theme-builder" class="related-card">
            <mat-icon>build</mat-icon>
            <div>
              <strong>Theme Builder Tool</strong>
              <span>Visual editor for creating themes</span>
            </div>
          </a>
          <a routerLink="/docs/foundations/colors" class="related-card">
            <mat-icon>palette</mat-icon>
            <div>
              <strong>Colors</strong>
              <span>Semantic color system documentation</span>
            </div>
          </a>
          <a routerLink="/docs/foundations/design-tokens" class="related-card">
            <mat-icon>token</mat-icon>
            <div>
              <strong>Design Tokens</strong>
              <span>All available design tokens</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .theming-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .doc-section {
        margin-bottom: 3rem;

        h2 {
          margin: 0 0 1rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          border-bottom: 1px solid var(--ax-border-default);
          padding-bottom: 0.5rem;
        }

        h3 {
          margin: 1.5rem 0 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          color: var(--ax-text-secondary);
          line-height: 1.6;
        }
      }

      /* Feature Grid */
      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
      }

      .feature-card {
        padding: 1.25rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: var(--ax-brand-default);
          margin-bottom: 0.75rem;
        }

        h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          font-weight: 600;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }

      /* Architecture Diagram */
      .architecture-diagram {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.75rem;
        padding: 2rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-xl);
        margin: 1.5rem 0;
      }

      .arch-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        border-radius: var(--ax-radius-lg);
        background: white;
        border: 2px solid var(--ax-border-default);
        min-width: 120px;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        span {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ax-text-primary);
        }

        &.seed {
          border-color: var(--ax-brand-default);
          mat-icon {
            color: var(--ax-brand-default);
          }
        }

        &.m3 {
          border-color: #10b981;
          mat-icon {
            color: #10b981;
          }
        }

        &.variables {
          border-color: #f59e0b;
          mat-icon {
            color: #f59e0b;
          }
        }

        &.theme {
          border-color: #8b5cf6;
          mat-icon {
            color: #8b5cf6;
          }
        }
      }

      .arch-arrow {
        color: var(--ax-text-subtle);
        font-size: 20px !important;
      }

      /* Step Cards */
      .step-cards {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .step-card {
        padding: 1.5rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);

        &.highlight {
          border-color: var(--ax-brand-default);
          background: var(--ax-brand-faint);
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .step-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ax-brand-default);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.875rem;
        }

        h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          margin: 0 0 1rem;
          font-size: 0.875rem;
        }

        ol {
          margin: 0;
          padding-left: 1.25rem;

          li {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            color: var(--ax-text-secondary);
          }
        }
      }

      /* Variables Table */
      .variables-table {
        padding: 1rem;
      }

      .variable-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        border-radius: var(--ax-radius-md);
        cursor: pointer;
        transition: background 0.15s;

        &:hover {
          background: var(--ax-background-subtle);
        }

        .color-preview {
          width: 32px;
          height: 32px;
          border-radius: var(--ax-radius-sm);
          border: 1px solid var(--ax-border-default);
          flex-shrink: 0;
        }

        .var-name {
          font-family: monospace;
          font-size: 0.875rem;
          color: var(--ax-brand-default);
          min-width: 200px;
        }

        .var-desc {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }

      /* API Table */
      .api-table-container {
        overflow-x: auto;
      }

      .api-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;

        th,
        td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--ax-border-default);
        }

        th {
          font-weight: 600;
          background: var(--ax-background-subtle);
          color: var(--ax-text-heading);
        }

        td {
          color: var(--ax-text-primary);

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: var(--ax-radius-sm);
            font-family: monospace;
            font-size: 0.875rem;
          }
        }
      }

      /* Current Theme Card */
      .current-theme-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1.5rem;
        padding: 1.5rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
      }

      .theme-info {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .label {
            font-size: 0.875rem;
            color: var(--ax-text-secondary);
          }

          code {
            background: var(--ax-brand-faint);
            color: var(--ax-brand-emphasis);
            padding: 0.25rem 0.5rem;
            border-radius: var(--ax-radius-sm);
            font-family: monospace;
            font-size: 0.875rem;
          }
        }
      }

      /* Related Links */
      .related-links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
      }

      .related-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
        text-decoration: none;
        transition:
          border-color 0.15s,
          box-shadow 0.15s;

        &:hover {
          border-color: var(--ax-brand-default);
          box-shadow: var(--ax-shadow-sm);
        }

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: var(--ax-brand-default);
        }

        strong {
          display: block;
          color: var(--ax-text-heading);
          margin-bottom: 0.25rem;
        }

        span {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }
    `,
  ],
})
export class ThemingComponent {
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);
  readonly themeService = inject(AxThemeService);

  // CSS Variables
  brandVariables = [
    { name: '--ax-primary', description: 'Primary brand color' },
    { name: '--ax-primary-light', description: 'Lighter primary shade' },
    { name: '--ax-primary-dark', description: 'Darker primary shade' },
    { name: '--ax-primary-contrast', description: 'Text on primary' },
    { name: '--ax-brand-default', description: 'Brand color for actions' },
    { name: '--ax-brand-emphasis', description: 'Dark brand for text' },
    { name: '--ax-brand-faint', description: 'Light brand background' },
    { name: '--ax-brand-muted', description: 'Subtle brand tint' },
  ];

  backgroundVariables = [
    { name: '--ax-background-default', description: 'Main background' },
    { name: '--ax-background-subtle', description: 'Elevated backgrounds' },
    { name: '--ax-background-muted', description: 'Lowered backgrounds' },
    {
      name: '--ax-background-emphasis',
      description: 'Dark contrast backgrounds',
    },
    { name: '--ax-background-page', description: 'Page/app background' },
    { name: '--ax-white', description: 'Pure white surface' },
  ];

  textVariables = [
    { name: '--ax-text-default', description: 'Main text color' },
    { name: '--ax-text-primary', description: 'Primary text' },
    { name: '--ax-text-secondary', description: 'Secondary/muted text' },
    { name: '--ax-text-subtle', description: 'Subtle/placeholder text' },
    { name: '--ax-text-disabled', description: 'Disabled text' },
    { name: '--ax-text-heading', description: 'Headings' },
    { name: '--ax-text-inverse', description: 'Text on dark backgrounds' },
  ];

  semanticVariables = [
    { name: '--ax-success-default', description: 'Success state color' },
    { name: '--ax-success-faint', description: 'Success background' },
    { name: '--ax-error-default', description: 'Error state color' },
    { name: '--ax-error-faint', description: 'Error background' },
    { name: '--ax-warning-default', description: 'Warning state color' },
    { name: '--ax-warning-faint', description: 'Warning background' },
    { name: '--ax-info-default', description: 'Info state color' },
    { name: '--ax-info-faint', description: 'Info background' },
  ];

  borderVariables = [
    { name: '--ax-border-default', description: 'Default border color' },
    { name: '--ax-border-subtle', description: 'Subtle divider color' },
    { name: '--ax-border-emphasis', description: 'Emphasized border' },
    { name: '--ax-shadow-sm', description: 'Small shadow' },
    { name: '--ax-shadow-md', description: 'Medium shadow' },
    { name: '--ax-shadow-lg', description: 'Large shadow' },
  ];

  // Code Tabs
  fileStructureTabs: CodeTab[] = [
    {
      label: 'Structure',
      language: 'bash',
      code: `libs/aegisx-ui/src/lib/styles/themes/
├── _all-themes.scss          # Import all themes
├── aegisx/
│   ├── _light.scss           # AegisX light mode
│   ├── _dark.scss            # AegisX dark mode
│   └── _colors.scss          # Color definitions
├── verus/
│   ├── _light.scss           # Verus light mode
│   ├── _dark.scss            # Verus dark mode
│   └── _colors.scss          # Color definitions
└── my-theme/                 # Your custom theme
    ├── _light.scss
    └── _dark.scss`,
    },
  ];

  quickStartStep1Tabs: CodeTab[] = [
    {
      label: 'styles.scss',
      language: 'scss',
      code: `// Import AegisX theme system
@use '@aegisx/ui/styles/themes/all-themes';

// Your app styles...`,
    },
  ];

  quickStartStep2Tabs: CodeTab[] = [
    {
      label: 'app.config.ts',
      language: 'typescript',
      code: `import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { AxThemeService } from '@aegisx/ui';

function initializeTheme(themeService: AxThemeService) {
  return () => themeService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    AxThemeService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTheme,
      deps: [AxThemeService],
      multi: true,
    },
  ],
};`,
    },
  ];

  quickStartStep3Tabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Add theme switcher to your header/toolbar -->
<ax-theme-switcher></ax-theme-switcher>

<!-- Or create custom controls -->
<button (click)="themeService.toggleMode()">
  Toggle Dark Mode
</button>`,
    },
  ];

  createThemeFilesTabs: CodeTab[] = [
    {
      label: 'File Structure',
      language: 'bash',
      code: `# Create theme directory
mkdir libs/aegisx-ui/src/lib/styles/themes/my-brand

# Create theme files
touch libs/aegisx-ui/src/lib/styles/themes/my-brand/_light.scss
touch libs/aegisx-ui/src/lib/styles/themes/my-brand/_dark.scss`,
    },
  ];

  pasteThemeCssTabs: CodeTab[] = [
    {
      label: '_light.scss',
      language: 'scss',
      code: `// Generated from Theme Builder - Light Mode
[data-theme='my-brand'],
.theme-my-brand {
  // PRIMARY / BRAND (paste from Theme Builder)
  --ax-primary: #your-color;
  --ax-brand-default: #your-color;
  --ax-brand-emphasis: #darker-shade;
  --ax-brand-faint: #lighter-shade;

  // BACKGROUNDS
  --ax-background-default: #ffffff;
  --ax-background-subtle: #f9fafb;
  // ... more variables

  // TEXT
  --ax-text-default: #1f2937;
  --ax-text-secondary: #6b7280;
  // ... more variables
}`,
    },
    {
      label: '_dark.scss',
      language: 'scss',
      code: `// Generated from Theme Builder - Dark Mode
[data-theme='my-brand-dark'],
.theme-my-brand-dark {
  // PRIMARY / BRAND
  --ax-primary: #lighter-for-dark;
  --ax-brand-default: #lighter-for-dark;

  // BACKGROUNDS
  --ax-background-default: #111827;
  --ax-background-subtle: #1f2937;
  // ... more variables

  // TEXT
  --ax-text-default: #f9fafb;
  --ax-text-secondary: #9ca3af;
  // ... more variables
}`,
    },
  ];

  registerThemeTabs: CodeTab[] = [
    {
      label: 'ax-theme.service.ts',
      language: 'typescript',
      code: `// Add to the themes array in AxThemeService
readonly themes: ThemeOption[] = [
  // ... existing themes
  {
    id: 'my-brand-light',
    name: 'My Brand Light',
    colorScheme: 'my-brand',
    mode: 'light',
    dataTheme: 'my-brand',
  },
  {
    id: 'my-brand-dark',
    name: 'My Brand Dark',
    colorScheme: 'my-brand',
    mode: 'dark',
    dataTheme: 'my-brand-dark',
  },
];

// Add to colorSchemes array
readonly colorSchemes = [
  { id: 'aegisx', name: 'AegisX' },
  { id: 'verus', name: 'Verus' },
  { id: 'my-brand', name: 'My Brand' }, // Add this
];`,
    },
  ];

  importThemeTabs: CodeTab[] = [
    {
      label: '_all-themes.scss',
      language: 'scss',
      code: `// libs/aegisx-ui/src/lib/styles/themes/_all-themes.scss
@import './aegisx/light';
@import './aegisx/dark';
@import './verus/light';
@import './verus/dark';

// Add your theme imports
@import './my-brand/light';
@import './my-brand/dark';`,
    },
  ];

  serviceUsageTabs: CodeTab[] = [
    {
      label: 'Component',
      language: 'typescript',
      code: `import { Component, inject, computed } from '@angular/core';
import { AxThemeService } from '@aegisx/ui';

@Component({
  selector: 'app-example',
  template: \`
    <p>Current: {{ themeService.themeId() }}</p>
    <button (click)="themeService.toggleMode()">
      Toggle Mode
    </button>
    <button (click)="themeService.setColorScheme('verus')">
      Use Verus
    </button>
  \`
})
export class ExampleComponent {
  readonly themeService = inject(AxThemeService);

  // Computed values for reactive UI
  isDark = computed(() => this.themeService.mode() === 'dark');
  themeName = computed(() => this.themeService.currentTheme()?.name);
}`,
    },
  ];

  copyVariable(varName: string): void {
    const copyText = `var(${varName})`;
    this.clipboard.copy(copyText);
    this.snackBar.open(`Copied: ${copyText}`, 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
