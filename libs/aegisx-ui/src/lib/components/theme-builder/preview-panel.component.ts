import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ThemeBuilderService } from './theme-builder.service';

@Component({
  selector: 'ax-theme-preview-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  template: `
    <div class="preview-panel" [class.dark-mode]="previewMode === 'dark'">
      <!-- Header -->
      <div class="preview-header">
        <h3>Live Preview</h3>
        <button
          mat-icon-button
          (click)="toggleMode()"
          matTooltip="Toggle dark/light mode"
        >
          <mat-icon>{{
            previewMode === 'light' ? 'dark_mode' : 'light_mode'
          }}</mat-icon>
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="preview-content">
        <!-- Color Scheme Section (M3-style) -->
        <section class="preview-section color-scheme">
          <h4>Color Scheme</h4>

          <!-- Brand/Primary Colors -->
          <div class="scheme-row">
            <div class="scheme-card brand-500">
              <span class="scheme-label">Brand</span>
              <span class="scheme-text on-brand">On Brand</span>
            </div>
            <div class="scheme-card brand-container">
              <span class="scheme-label">Brand Container</span>
              <span class="scheme-text on-brand-container">On Container</span>
            </div>
          </div>

          <!-- Semantic Colors Grid -->
          <div class="scheme-grid">
            <div class="scheme-card success-500">
              <span class="scheme-mini-label">Success</span>
            </div>
            <div class="scheme-card warning-500">
              <span class="scheme-mini-label">Warning</span>
            </div>
            <div class="scheme-card error-500">
              <span class="scheme-mini-label">Error</span>
            </div>
            <div class="scheme-card info-500">
              <span class="scheme-mini-label">Info</span>
            </div>
          </div>

          <!-- Surface Colors -->
          <div class="scheme-surfaces">
            <div class="surface-item surface-default">
              <span class="surface-label">Surface</span>
              <span class="surface-text">On Surface</span>
            </div>
            <div class="surface-item surface-subtle">
              <span class="surface-label">Subtle</span>
              <span class="surface-text">On Subtle</span>
            </div>
            <div class="surface-item surface-muted">
              <span class="surface-label">Muted</span>
              <span class="surface-text">On Muted</span>
            </div>
            <div class="surface-item surface-emphasis">
              <span class="surface-label">Emphasis</span>
              <span class="surface-text inverse">On Emphasis</span>
            </div>
          </div>

          <!-- Border & Outline -->
          <div class="scheme-borders">
            <div class="border-item border-default">Default</div>
            <div class="border-item border-muted">Muted</div>
            <div class="border-item border-emphasis">Emphasis</div>
          </div>
        </section>

        <!-- Buttons Section -->
        <section class="preview-section">
          <h4>Buttons</h4>
          <div class="preview-row">
            <button mat-flat-button class="preview-btn primary">Primary</button>
            <button mat-flat-button class="preview-btn success">Success</button>
            <button mat-flat-button class="preview-btn warning">Warning</button>
          </div>
          <div class="preview-row">
            <button mat-flat-button class="preview-btn error">Error</button>
            <button mat-stroked-button class="preview-btn-outlined primary">
              Outlined
            </button>
            <button mat-button class="preview-btn-text primary">Text</button>
            <button mat-icon-button class="preview-btn-icon primary">
              <mat-icon>favorite</mat-icon>
            </button>
          </div>
        </section>

        <!-- Badges & Chips -->
        <section class="preview-section">
          <h4>Badges & Chips</h4>
          <div class="preview-row">
            <span class="preview-badge brand">Brand</span>
            <span class="preview-badge success">Success</span>
            <span class="preview-badge warning">Warning</span>
            <span class="preview-badge error">Error</span>
            <span class="preview-badge info">Info</span>
          </div>
        </section>

        <!-- Cards -->
        <section class="preview-section">
          <h4>Cards</h4>
          <div class="preview-row cards">
            <div class="preview-card">
              <div class="card-header">
                <mat-icon>analytics</mat-icon>
                <span>Statistics</span>
              </div>
              <div class="card-value">2,847</div>
              <div class="card-label">Total Users</div>
              <mat-progress-bar
                mode="determinate"
                [value]="75"
                class="card-progress brand"
              ></mat-progress-bar>
            </div>
            <div class="preview-card success-accent">
              <div class="card-header">
                <mat-icon>trending_up</mat-icon>
                <span>Growth</span>
              </div>
              <div class="card-value">+24.5%</div>
              <div class="card-label">This Month</div>
            </div>
          </div>
        </section>

        <!-- Form Elements -->
        <section class="preview-section">
          <h4>Form Elements</h4>
          <div class="form-grid">
            <mat-form-field appearance="outline" class="preview-input">
              <mat-label>Email</mat-label>
              <input matInput placeholder="Enter email" />
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="preview-input">
              <mat-label>Select</mat-label>
              <mat-select>
                <mat-option value="1">Option 1</mat-option>
                <mat-option value="2">Option 2</mat-option>
                <mat-option value="3">Option 3</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="preview-row controls">
            <mat-slide-toggle color="primary">Toggle</mat-slide-toggle>
            <mat-checkbox color="primary">Checkbox</mat-checkbox>
            <mat-radio-group>
              <mat-radio-button value="1" color="primary"
                >Radio</mat-radio-button
              >
            </mat-radio-group>
          </div>
        </section>

        <!-- Tabs Preview -->
        <section class="preview-section">
          <h4>Tabs</h4>
          <mat-tab-group class="preview-tabs" animationDuration="0ms">
            <mat-tab label="Overview">
              <div class="tab-content">
                <p>Overview content with primary text styling</p>
              </div>
            </mat-tab>
            <mat-tab label="Details">
              <div class="tab-content">
                <p>Details content section</p>
              </div>
            </mat-tab>
            <mat-tab label="Settings">
              <div class="tab-content">
                <p>Settings configuration</p>
              </div>
            </mat-tab>
          </mat-tab-group>
        </section>

        <!-- Table Preview -->
        <section class="preview-section">
          <h4>Table</h4>
          <div class="preview-table-container">
            <table class="preview-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="table-cell-user">
                      <div class="avatar brand">JD</div>
                      <span>John Doe</span>
                    </div>
                  </td>
                  <td>
                    <span class="preview-badge success small">Active</span>
                  </td>
                  <td>$1,234.00</td>
                </tr>
                <tr>
                  <td>
                    <div class="table-cell-user">
                      <div class="avatar info">AS</div>
                      <span>Alice Smith</span>
                    </div>
                  </td>
                  <td>
                    <span class="preview-badge warning small">Pending</span>
                  </td>
                  <td>$567.00</td>
                </tr>
                <tr>
                  <td>
                    <div class="table-cell-user">
                      <div class="avatar error">BJ</div>
                      <span>Bob Johnson</span>
                    </div>
                  </td>
                  <td>
                    <span class="preview-badge error small">Inactive</span>
                  </td>
                  <td>$890.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Navigation / Sidebar Preview -->
        <section class="preview-section">
          <h4>Navigation</h4>
          <div class="preview-nav">
            <div class="nav-item active">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </div>
            <div class="nav-item">
              <mat-icon>analytics</mat-icon>
              <span>Analytics</span>
              <span class="nav-badge">New</span>
            </div>
            <div class="nav-item">
              <mat-icon>people</mat-icon>
              <span>Users</span>
            </div>
            <div class="nav-item">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </div>
          </div>
        </section>

        <!-- Dialog Preview -->
        <section class="preview-section">
          <h4>Dialog</h4>
          <div class="preview-dialog">
            <div class="dialog-header">
              <h5>Confirm Action</h5>
              <button mat-icon-button class="dialog-close">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="dialog-content">
              <p>
                Are you sure you want to proceed with this action? This cannot
                be undone.
              </p>
            </div>
            <div class="dialog-actions">
              <button mat-stroked-button>Cancel</button>
              <button mat-flat-button class="preview-btn primary">
                Confirm
              </button>
            </div>
          </div>
        </section>

        <!-- Progress Indicators -->
        <section class="preview-section">
          <h4>Progress</h4>
          <div class="progress-grid">
            <div class="progress-item">
              <span class="progress-label">Brand</span>
              <mat-progress-bar
                mode="determinate"
                [value]="65"
                class="brand"
              ></mat-progress-bar>
            </div>
            <div class="progress-item">
              <span class="progress-label">Success</span>
              <mat-progress-bar
                mode="determinate"
                [value]="100"
                class="success"
              ></mat-progress-bar>
            </div>
            <div class="progress-item">
              <span class="progress-label">Warning</span>
              <mat-progress-bar
                mode="determinate"
                [value]="45"
                class="warning"
              ></mat-progress-bar>
            </div>
            <div class="progress-item">
              <span class="progress-label">Error</span>
              <mat-progress-bar
                mode="determinate"
                [value]="25"
                class="error"
              ></mat-progress-bar>
            </div>
          </div>
          <div class="preview-row spinners">
            <mat-spinner diameter="24" class="brand"></mat-spinner>
            <mat-spinner diameter="24" class="success"></mat-spinner>
            <mat-spinner diameter="24" class="warning"></mat-spinner>
            <mat-spinner diameter="24" class="error"></mat-spinner>
          </div>
        </section>

        <!-- Alerts -->
        <section class="preview-section">
          <h4>Alerts</h4>
          <div class="preview-alert info">
            <mat-icon>info</mat-icon>
            <span>This is an info alert message.</span>
          </div>
          <div class="preview-alert success">
            <mat-icon>check_circle</mat-icon>
            <span>Operation completed successfully!</span>
          </div>
          <div class="preview-alert warning">
            <mat-icon>warning</mat-icon>
            <span>Please review before continuing.</span>
          </div>
          <div class="preview-alert error">
            <mat-icon>error</mat-icon>
            <span>An error occurred. Please try again.</span>
          </div>
        </section>

        <!-- Typography -->
        <section class="preview-section">
          <h4>Typography</h4>
          <div class="preview-typography">
            <h1 class="preview-heading h1">Heading 1</h1>
            <h2 class="preview-heading h2">Heading 2</h2>
            <h3 class="preview-heading h3">Heading 3</h3>
            <p class="preview-text-primary">
              Primary text color for main content
            </p>
            <p class="preview-text-secondary">
              Secondary text for descriptions
            </p>
            <p class="preview-text-subtle">
              Subtle text for captions and hints
            </p>
            <a href="#" class="preview-link">Link text style</a>
          </div>
        </section>

        <!-- Spacing & Radius Preview -->
        <section class="preview-section">
          <h4>Spacing & Radius</h4>
          <div class="preview-row radius-demo">
            <div class="radius-box sm">sm</div>
            <div class="radius-box md">md</div>
            <div class="radius-box lg">lg</div>
            <div class="radius-box xl">xl</div>
            <div class="radius-box full">full</div>
          </div>
        </section>

        <!-- Shadows Preview -->
        <section class="preview-section">
          <h4>Shadows</h4>
          <div class="preview-row shadow-demo">
            <div class="shadow-box sm">sm</div>
            <div class="shadow-box md">md</div>
            <div class="shadow-box lg">lg</div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .preview-panel {
        background: var(--ax-background-default, #ffffff);
        border-radius: var(--ax-radius-xl, 0.75rem);
        border: 1px solid var(--ax-border-default, #e4e4e7);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;
        transition: background 0.3s ease;

        &.dark-mode {
          --preview-bg: #111827;
          --preview-text: #f3f4f6;
          --preview-text-secondary: #9ca3af;
          --preview-text-subtle: #6b7280;
          --preview-border: #374151;
          background: var(--preview-bg);
        }
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid
          var(--preview-border, var(--ax-border-default, #e4e4e7));
        flex-shrink: 0;

        h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--preview-text, var(--ax-text-heading, #0a0a0a));
        }
      }

      .preview-content {
        flex: 1;
        padding: 1rem;
        padding-bottom: 3rem;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .preview-section {
        margin-bottom: 1.5rem;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          margin: 0 0 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(
            --preview-text-secondary,
            var(--ax-text-secondary, #71717a)
          );
        }
      }

      .preview-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;

        &.cards {
          gap: 0.75rem;
        }
        &.controls {
          gap: 1rem;
          margin-top: 0.75rem;
        }
        &.spinners {
          gap: 1rem;
          margin-top: 0.75rem;
          justify-content: flex-start;
        }
        &.radius-demo,
        &.shadow-demo {
          gap: 0.5rem;
        }
      }

      /* Buttons */
      .preview-btn {
        font-size: 0.8125rem;
        padding: 0 1rem;
        height: 32px;
        line-height: 32px;
        &.primary {
          background: var(--ax-brand-500, #6366f1);
          color: white;
        }
        &.success {
          background: var(--ax-success-500, #22c55e);
          color: white;
        }
        &.warning {
          background: var(--ax-warning-500, #f59e0b);
          color: white;
        }
        &.error {
          background: var(--ax-error-500, #ef4444);
          color: white;
        }
      }

      .preview-btn-outlined.primary {
        border-color: var(--ax-brand-500, #6366f1);
        color: var(--ax-brand-500, #6366f1);
      }

      .preview-btn-text.primary {
        color: var(--ax-brand-500, #6366f1);
      }
      .preview-btn-icon.primary {
        color: var(--ax-brand-500, #6366f1);
      }

      /* Badges */
      .preview-badge {
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        font-size: 0.6875rem;
        font-weight: 500;

        &.small {
          padding: 0.125rem 0.5rem;
          font-size: 0.625rem;
        }

        &.brand {
          background: var(--ax-brand-100, #e0e7ff);
          color: var(--ax-brand-700, #4338ca);
        }
        &.success {
          background: var(--ax-success-100, #dcfce7);
          color: var(--ax-success-700, #15803d);
        }
        &.warning {
          background: var(--ax-warning-100, #fef3c7);
          color: var(--ax-warning-700, #b45309);
        }
        &.error {
          background: var(--ax-error-100, #fee2e2);
          color: var(--ax-error-700, #b91c1c);
        }
        &.info {
          background: var(--ax-info-100, #dbeafe);
          color: var(--ax-info-700, #1d4ed8);
        }
      }

      /* Cards */
      .preview-card {
        flex: 1;
        min-width: 120px;
        padding: 0.875rem;
        background: var(--preview-bg, var(--ax-background-default, #ffffff));
        border: 1px solid
          var(--preview-border, var(--ax-border-default, #e4e4e7));
        border-radius: var(--ax-radius-lg, 0.5rem);

        &.success-accent {
          border-left: 3px solid var(--ax-success-500, #22c55e);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin-bottom: 0.375rem;
          font-size: 0.6875rem;
          color: var(
            --preview-text-secondary,
            var(--ax-text-secondary, #71717a)
          );

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }

        .card-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--preview-text, var(--ax-text-heading, #0a0a0a));
        }

        .card-label {
          font-size: 0.6875rem;
          color: var(--preview-text-subtle, var(--ax-text-subtle, #a1a1aa));
          margin-bottom: 0.5rem;
        }

        .card-progress {
          height: 3px;
          border-radius: 2px;
        }
      }

      /* Form */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .preview-input {
        width: 100%;
        font-size: 0.8125rem;

        ::ng-deep .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }
      }

      /* Tabs */
      .preview-tabs {
        border: 1px solid
          var(--preview-border, var(--ax-border-default, #e4e4e7));
        border-radius: var(--ax-radius-md, 0.375rem);
        overflow: hidden;

        ::ng-deep {
          .mat-mdc-tab-labels {
            background: var(--ax-background-subtle, #f4f4f5);
          }
          .mat-mdc-tab {
            min-width: 0;
            padding: 0 12px;
            height: 36px;
          }
        }

        .tab-content {
          padding: 0.75rem;
          font-size: 0.8125rem;
          color: var(--preview-text, var(--ax-text-primary, #3f3f46));

          p {
            margin: 0;
          }
        }
      }

      /* Table */
      .preview-table-container {
        border: 1px solid
          var(--preview-border, var(--ax-border-default, #e4e4e7));
        border-radius: var(--ax-radius-md, 0.375rem);
        overflow: hidden;
      }

      .preview-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.75rem;

        th,
        td {
          padding: 0.625rem 0.75rem;
          text-align: left;
          border-bottom: 1px solid
            var(--preview-border, var(--ax-border-default, #e4e4e7));
        }

        th {
          font-weight: 600;
          color: var(
            --preview-text-secondary,
            var(--ax-text-secondary, #71717a)
          );
          background: var(--ax-background-subtle, #f4f4f5);
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        td {
          color: var(--preview-text, var(--ax-text-primary, #3f3f46));
        }

        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:hover {
          background: var(--ax-background-subtle, #f4f4f5);
        }
      }

      .table-cell-user {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5625rem;
        font-weight: 600;
        color: white;

        &.brand {
          background: var(--ax-brand-500, #6366f1);
        }
        &.success {
          background: var(--ax-success-500, #22c55e);
        }
        &.warning {
          background: var(--ax-warning-500, #f59e0b);
        }
        &.error {
          background: var(--ax-error-500, #ef4444);
        }
        &.info {
          background: var(--ax-info-500, #3b82f6);
        }
      }

      /* Navigation */
      .preview-nav {
        border: 1px solid
          var(--preview-border, var(--ax-border-default, #e4e4e7));
        border-radius: var(--ax-radius-md, 0.375rem);
        overflow: hidden;
        background: var(--ax-background-subtle, #f9fafb);
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.625rem 0.875rem;
        font-size: 0.8125rem;
        color: var(--preview-text-secondary, var(--ax-text-secondary, #71717a));
        cursor: pointer;
        transition: all 0.15s ease;
        border-left: 3px solid transparent;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          opacity: 0.7;
        }

        &:hover {
          background: var(--ax-background-default, #ffffff);
          color: var(--preview-text, var(--ax-text-primary, #3f3f46));
        }

        &.active {
          background: var(--ax-brand-50, #eef2ff);
          color: var(--ax-brand-600, #4f46e5);
          border-left-color: var(--ax-brand-500, #6366f1);
          font-weight: 500;

          mat-icon {
            opacity: 1;
            color: var(--ax-brand-500, #6366f1);
          }
        }

        .nav-badge {
          margin-left: auto;
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
          font-size: 0.5625rem;
          font-weight: 600;
          background: var(--ax-brand-500, #6366f1);
          color: white;
        }
      }

      /* Dialog */
      .preview-dialog {
        border: 1px solid
          var(--preview-border, var(--ax-border-default, #e4e4e7));
        border-radius: var(--ax-radius-lg, 0.5rem);
        background: var(--preview-bg, var(--ax-background-default, #ffffff));
        box-shadow: var(--ax-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
        overflow: hidden;

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid
            var(--preview-border, var(--ax-border-default, #e4e4e7));

          h5 {
            margin: 0;
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--preview-text, var(--ax-text-heading, #0a0a0a));
          }

          .dialog-close {
            width: 28px;
            height: 28px;
            line-height: 28px;

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
            }
          }
        }

        .dialog-content {
          padding: 1rem;

          p {
            margin: 0;
            font-size: 0.8125rem;
            color: var(
              --preview-text-secondary,
              var(--ax-text-secondary, #71717a)
            );
            line-height: 1.5;
          }
        }

        .dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--ax-background-subtle, #f9fafb);
          border-top: 1px solid
            var(--preview-border, var(--ax-border-default, #e4e4e7));
        }
      }

      /* Progress */
      .progress-grid {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .progress-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .progress-label {
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(
            --preview-text-secondary,
            var(--ax-text-secondary, #71717a)
          );
          min-width: 50px;
        }

        mat-progress-bar {
          flex: 1;
          height: 6px;
          border-radius: 3px;
        }
      }

      mat-progress-bar,
      mat-spinner {
        &.brand ::ng-deep .mdc-linear-progress__bar-inner,
        &.brand ::ng-deep circle {
          stroke: var(--ax-brand-500, #6366f1);
          background-color: var(--ax-brand-500, #6366f1);
        }
        &.success ::ng-deep .mdc-linear-progress__bar-inner,
        &.success ::ng-deep circle {
          stroke: var(--ax-success-500, #22c55e);
          background-color: var(--ax-success-500, #22c55e);
        }
        &.warning ::ng-deep .mdc-linear-progress__bar-inner,
        &.warning ::ng-deep circle {
          stroke: var(--ax-warning-500, #f59e0b);
          background-color: var(--ax-warning-500, #f59e0b);
        }
        &.error ::ng-deep .mdc-linear-progress__bar-inner,
        &.error ::ng-deep circle {
          stroke: var(--ax-error-500, #ef4444);
          background-color: var(--ax-error-500, #ef4444);
        }
      }

      /* Alerts */
      .preview-alert {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.625rem 0.875rem;
        border-radius: var(--ax-radius-md, 0.375rem);
        font-size: 0.75rem;
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0;
        }

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        &.info {
          background: var(--ax-info-50, #eff6ff);
          color: var(--ax-info-700, #1d4ed8);
          border: 1px solid var(--ax-info-200, #bfdbfe);
        }
        &.success {
          background: var(--ax-success-50, #f0fdf4);
          color: var(--ax-success-700, #15803d);
          border: 1px solid var(--ax-success-200, #bbf7d0);
        }
        &.warning {
          background: var(--ax-warning-50, #fffbeb);
          color: var(--ax-warning-700, #b45309);
          border: 1px solid var(--ax-warning-200, #fde68a);
        }
        &.error {
          background: var(--ax-error-50, #fef2f2);
          color: var(--ax-error-700, #b91c1c);
          border: 1px solid var(--ax-error-200, #fecaca);
        }
      }

      /* Typography */
      .preview-typography {
        .preview-heading {
          margin: 0 0 0.375rem;
          color: var(--preview-text, var(--ax-text-heading, #0a0a0a));
          &.h1 {
            font-size: 1.5rem;
            font-weight: 700;
          }
          &.h2 {
            font-size: 1.25rem;
            font-weight: 600;
          }
          &.h3 {
            font-size: 1rem;
            font-weight: 600;
          }
        }

        .preview-text-primary {
          margin: 0.5rem 0 0.25rem;
          font-size: 0.875rem;
          color: var(--preview-text, var(--ax-text-primary, #3f3f46));
        }

        .preview-text-secondary {
          margin: 0 0 0.25rem;
          font-size: 0.8125rem;
          color: var(
            --preview-text-secondary,
            var(--ax-text-secondary, #71717a)
          );
        }

        .preview-text-subtle {
          margin: 0 0 0.5rem;
          font-size: 0.75rem;
          color: var(--preview-text-subtle, var(--ax-text-subtle, #a1a1aa));
        }

        .preview-link {
          font-size: 0.8125rem;
          color: var(--ax-brand-500, #6366f1);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      /* Radius Demo */
      .radius-box {
        width: 40px;
        height: 40px;
        background: var(--ax-brand-100, #e0e7ff);
        border: 2px solid var(--ax-brand-500, #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        font-weight: 600;
        color: var(--ax-brand-700, #4338ca);

        &.sm {
          border-radius: var(--ax-radius-sm, 0.25rem);
        }
        &.md {
          border-radius: var(--ax-radius-md, 0.375rem);
        }
        &.lg {
          border-radius: var(--ax-radius-lg, 0.5rem);
        }
        &.xl {
          border-radius: var(--ax-radius-xl, 0.75rem);
        }
        &.full {
          border-radius: 9999px;
        }
      }

      /* Shadow Demo */
      .shadow-box {
        width: 50px;
        height: 50px;
        background: var(--preview-bg, var(--ax-background-default, #ffffff));
        border-radius: var(--ax-radius-md, 0.375rem);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        font-weight: 600;
        color: var(--preview-text-secondary, var(--ax-text-secondary, #71717a));

        &.sm {
          box-shadow: var(--ax-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
        }
        &.md {
          box-shadow: var(--ax-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
        }
        &.lg {
          box-shadow: var(--ax-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
        }
      }

      /* =============================================
         Color Scheme Section (M3-style visualization)
         ============================================= */
      .color-scheme {
        h4 {
          margin-bottom: 1rem;
        }
      }

      /* Brand/Primary Color Row */
      .scheme-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .scheme-card {
        padding: 1rem;
        border-radius: var(--ax-radius-lg, 0.5rem);
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-height: 80px;
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--ax-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
        }

        /* Brand Colors */
        &.brand-500 {
          background: var(--ax-brand-500, #6366f1);
        }
        &.brand-container {
          background: var(--ax-brand-100, #e0e7ff);
        }

        /* Semantic Colors */
        &.success-500 {
          background: var(--ax-success-500, #22c55e);
        }
        &.warning-500 {
          background: var(--ax-warning-500, #f59e0b);
        }
        &.error-500 {
          background: var(--ax-error-500, #ef4444);
        }
        &.info-500 {
          background: var(--ax-info-500, #3b82f6);
        }
      }

      .scheme-label {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.85;
      }

      .scheme-text {
        font-size: 0.75rem;
        font-weight: 500;

        &.on-brand {
          color: white;
        }
        &.on-brand-container {
          color: var(--ax-brand-700, #4338ca);
        }
      }

      .scheme-card.brand-500 .scheme-label {
        color: rgba(255, 255, 255, 0.9);
      }
      .scheme-card.brand-container .scheme-label {
        color: var(--ax-brand-600, #4f46e5);
      }

      /* Semantic Colors Grid */
      .scheme-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        margin-bottom: 1rem;

        .scheme-card {
          min-height: 50px;
          padding: 0.75rem;
          align-items: center;
          justify-content: center;
        }
      }

      .scheme-mini-label {
        font-size: 0.625rem;
        font-weight: 600;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      /* Surface Colors */
      .scheme-surfaces {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .surface-item {
        padding: 0.75rem 0.5rem;
        border-radius: var(--ax-radius-md, 0.375rem);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        border: 1px solid
          var(--preview-border, var(--ax-border-default, #e4e4e7));

        &.surface-default {
          background: var(--preview-bg, var(--ax-background-default, #ffffff));
        }
        &.surface-subtle {
          background: var(--ax-background-subtle, #f4f4f5);
        }
        &.surface-muted {
          background: var(--ax-background-muted, #e4e4e7);
        }
        &.surface-emphasis {
          background: var(--ax-background-emphasis, #18181b);
          border-color: var(--ax-background-emphasis, #18181b);
        }
      }

      .surface-label {
        font-size: 0.5625rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: var(--preview-text-secondary, var(--ax-text-secondary, #71717a));
      }

      .surface-text {
        font-size: 0.625rem;
        font-weight: 500;
        color: var(--preview-text, var(--ax-text-primary, #3f3f46));

        &.inverse {
          color: white;
        }
      }

      .surface-item.surface-emphasis .surface-label {
        color: rgba(255, 255, 255, 0.7);
      }

      /* Border Colors */
      .scheme-borders {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }

      .border-item {
        padding: 0.625rem;
        border-radius: var(--ax-radius-md, 0.375rem);
        text-align: center;
        font-size: 0.625rem;
        font-weight: 500;
        color: var(--preview-text-secondary, var(--ax-text-secondary, #71717a));
        background: var(--preview-bg, var(--ax-background-default, #ffffff));

        &.border-default {
          border: 2px solid var(--ax-border-default, #e4e4e7);
        }
        &.border-muted {
          border: 2px solid var(--ax-border-muted, #d4d4d8);
        }
        &.border-emphasis {
          border: 2px solid var(--ax-border-emphasis, #71717a);
        }
      }
    `,
  ],
})
export class AxThemePreviewPanelComponent {
  private themeService = inject(ThemeBuilderService);

  @Input() previewMode: 'light' | 'dark' = 'light';

  toggleMode(): void {
    this.themeService.togglePreviewMode();
  }
}
