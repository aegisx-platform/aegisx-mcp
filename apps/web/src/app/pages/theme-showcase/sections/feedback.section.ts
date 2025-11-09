import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-feedback-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <div class="section-container">
      <h2 class="section-title">Feedback</h2>
      <p class="section-description">Progress indicators, notifications, and user feedback components</p>

      <!-- Progress Bar -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Progress Bar</mat-card-title>
          <mat-card-subtitle>Linear progress indicators</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="progress-section">
            <p class="progress-label">Determinate</p>
            <mat-progress-bar mode="determinate" value="75"></mat-progress-bar>
          </div>

          <div class="progress-section">
            <p class="progress-label">Indeterminate</p>
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          </div>

          <div class="progress-section">
            <p class="progress-label">Buffered</p>
            <mat-progress-bar mode="buffer" value="75" bufferValue="90"></mat-progress-bar>
          </div>

          <div class="progress-section">
            <p class="progress-label">Query</p>
            <mat-progress-bar mode="query"></mat-progress-bar>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Progress Spinner -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Progress Spinner</mat-card-title>
          <mat-card-subtitle>Circular progress indicators</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="spinner-grid">
            <div class="spinner-item">
              <p class="spinner-label">Determinate (75%)</p>
              <mat-spinner [value]="75" mode="determinate" diameter="100"></mat-spinner>
            </div>

            <div class="spinner-item">
              <p class="spinner-label">Indeterminate</p>
              <mat-spinner diameter="100"></mat-spinner>
            </div>

            <div class="spinner-item">
              <p class="spinner-label">Small (50px)</p>
              <mat-spinner diameter="50"></mat-spinner>
            </div>

            <div class="spinner-item">
              <p class="spinner-label">Large (120px)</p>
              <mat-spinner diameter="120"></mat-spinner>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tooltip -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Tooltip</mat-card-title>
          <mat-card-subtitle>Hover information overlays</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="tooltip-grid">
            <button mat-raised-button matTooltip="Right aligned tooltip" matTooltipPosition="right">
              Right
            </button>
            <button mat-raised-button matTooltip="Left aligned tooltip" matTooltipPosition="left">
              Left
            </button>
            <button mat-raised-button matTooltip="Above the button" matTooltipPosition="above">
              Above
            </button>
            <button mat-raised-button matTooltip="Below the button" matTooltipPosition="below">
              Below
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Notifications -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Snackbar & Notifications</mat-card-title>
          <mat-card-subtitle>User feedback and notifications</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="notification-buttons">
            <button mat-raised-button color="primary" (click)="showSuccessSnackBar()">
              <mat-icon>check_circle</mat-icon>
              Success Message
            </button>

            <button mat-raised-button color="warn" (click)="showErrorSnackBar()">
              <mat-icon>error</mat-icon>
              Error Message
            </button>

            <button mat-raised-button (click)="showInfoSnackBar()">
              <mat-icon>info</mat-icon>
              Info Message
            </button>

            <button mat-raised-button (click)="showWarningSnackBar()">
              <mat-icon>warning</mat-icon>
              Warning Message
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .section-container {
        display: flex;
        flex-direction: column;
        gap: var(--preset-spacing-lg, 36px);
      }

      .section-title {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--theme-text-primary);
        letter-spacing: -0.5px;
      }

      .section-description {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: var(--theme-text-secondary);
      }

      .component-card {
        border-radius: var(--preset-border-radius, 12px);
        box-shadow: var(--preset-shadow, 0 10px 15px rgba(0, 0, 0, 0.1));
        transition: var(--preset-transition, all 300ms ease-in-out);
      }

      .component-card mat-card-header {
        padding: var(--preset-spacing-base, 24px) var(--preset-spacing-base, 24px)
          var(--preset-spacing-md, 18px) var(--preset-spacing-base, 24px);
        border-bottom: 1px solid var(--theme-surface-border);
      }

      .component-card mat-card-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .component-card mat-card-subtitle {
        margin-top: 4px;
        font-size: 13px;
        color: var(--theme-text-secondary);
      }

      .component-card mat-card-content {
        padding: var(--preset-spacing-base, 24px);
      }

      .progress-section {
        margin-bottom: var(--preset-spacing-lg, 36px);

        &:last-child {
          margin-bottom: 0;
        }
      }

      .progress-label {
        margin: 0 0 var(--preset-spacing-md, 18px) 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--theme-text-secondary);
      }

      .spinner-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--preset-spacing-lg, 36px);
      }

      .spinner-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--preset-spacing-md, 18px);
      }

      .spinner-label {
        margin: 0;
        font-size: 12px;
        font-weight: 500;
        color: var(--theme-text-secondary);
        text-align: center;
      }

      .tooltip-grid {
        display: flex;
        gap: var(--preset-spacing-lg, 36px);
        flex-wrap: wrap;
      }

      .notification-buttons {
        display: flex;
        gap: var(--preset-spacing-lg, 36px);
        flex-wrap: wrap;
      }

      button {
        &:hover {
          transform: translateY(-2px);
          transition: var(--preset-transition, all 300ms ease-in-out);
        }
      }
    `,
  ],
})
export class FeedbackSection {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  showSuccessSnackBar(): void {
    this.snackBar.open('Success! Operation completed.', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  showErrorSnackBar(): void {
    this.snackBar.open('Error! Something went wrong.', 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }

  showInfoSnackBar(): void {
    this.snackBar.open('Info: This is an informational message.', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar'],
    });
  }

  showWarningSnackBar(): void {
    this.snackBar.open('Warning: Please be careful.', 'Close', {
      duration: 3000,
      panelClass: ['warning-snackbar'],
    });
  }
}
