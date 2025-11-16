import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDividerModule,
  ],
  template: `
    <div class="dialog-container">
      <div mat-dialog-title class="dialog-title">
        <mat-icon class="dialog-icon">settings</mat-icon>
        Preferences
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="flex flex-col gap-4">
          <div class="settings-item">
            <div class="settings-info">
              <p class="settings-label">Email Notifications</p>
              <p class="settings-description">
                Receive email updates about your activity
              </p>
            </div>
            <mat-slide-toggle
              [(ngModel)]="emailNotifications"
              name="emailNotifications"
            ></mat-slide-toggle>
          </div>

          <mat-divider></mat-divider>

          <div class="settings-item">
            <div class="settings-info">
              <p class="settings-label">Push Notifications</p>
              <p class="settings-description">
                Get push notifications on your device
              </p>
            </div>
            <mat-slide-toggle
              [(ngModel)]="pushNotifications"
              name="pushNotifications"
            ></mat-slide-toggle>
          </div>

          <mat-divider></mat-divider>

          <div class="settings-item">
            <div class="settings-info">
              <p class="settings-label">Dark Mode</p>
              <p class="settings-description">
                Use dark theme for the interface
              </p>
            </div>
            <mat-slide-toggle
              [(ngModel)]="darkMode"
              name="darkMode"
            ></mat-slide-toggle>
          </div>

          <mat-divider></mat-divider>

          <div class="settings-item">
            <div class="settings-info">
              <p class="settings-label">Auto-Save</p>
              <p class="settings-description">
                Automatically save changes as you work
              </p>
            </div>
            <mat-slide-toggle
              [(ngModel)]="autoSave"
              name="autoSave"
            ></mat-slide-toggle>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button matButton="outlined" (click)="onCancel()">Cancel</button>
        <button matButton="filled" color="primary" (click)="onSave()">
          Save Settings
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
        overflow: visible;
      }

      :host ::ng-deep mat-dialog-content {
        padding-top: 2rem !important;
      }

      .dialog-container {
        min-width: 450px;
      }

      .dialog-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--aegisx-text-strong);
        padding: 1.5rem 1.5rem 1rem 1.5rem;
        margin: 0;
        border-bottom: 1px solid var(--aegisx-border-default);
      }

      .dialog-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: var(--aegisx-brand-default);
      }

      .dialog-content {
        padding: 2rem 1.5rem 1.5rem 1.5rem;
        margin: 0;
      }

      .dialog-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--aegisx-border-default);
        margin: 0;
      }

      .settings-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        width: 100%;
      }

      .settings-info {
        flex: 1;
      }

      .settings-label {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--aegisx-text-strong);
        margin: 0 0 0.25rem 0;
      }

      .settings-description {
        font-size: 0.8125rem;
        color: var(--aegisx-text-subtle);
        margin: 0;
        line-height: 1.4;
      }
    `,
  ],
})
export class SettingsDialogComponent {
  emailNotifications = true;
  pushNotifications = false;
  darkMode = false;
  autoSave = true;

  constructor(private dialogRef: MatDialogRef<SettingsDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      emailNotifications: this.emailNotifications,
      pushNotifications: this.pushNotifications,
      darkMode: this.darkMode,
      autoSave: this.autoSave,
    });
  }
}
