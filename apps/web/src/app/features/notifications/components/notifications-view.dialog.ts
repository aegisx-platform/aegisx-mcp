import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { Notification } from '../types/notification.types';

export interface NotificationViewDialogData {
  notifications: Notification;
}

@Component({
  selector: 'app-notifications-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <div class="view-dialog">
      <h2 mat-dialog-title>
        Notifications Details
        <button mat-icon-button class="close-button" (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </h2>

      <mat-dialog-content>
        <div class="details-container">
          <!-- id Field -->
          <div class="detail-row">
            <label class="detail-label">Id</label>
            <div class="detail-value">
              <span>{{ data.notifications.id || '-' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>
          <!-- type Field -->
          <div class="detail-row">
            <label class="detail-label">Type</label>
            <div class="detail-value">
              <span>{{ data.notifications.type || '-' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>
          <!-- title Field -->
          <div class="detail-row">
            <label class="detail-label">Title</label>
            <div class="detail-value">
              <span>{{ data.notifications.title || '-' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>
          <!-- message Field -->
          <div class="detail-row">
            <label class="detail-label">Message</label>
            <div class="detail-value">
              <div class="text-content">
                {{ data.notifications.message || '-' }}
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- data Field -->
          <div class="detail-row">
            <label class="detail-label">Data</label>
            <div class="detail-value">
              <div *ngIf="data.notifications.data" class="json-content">
                <pre>{{ data.notifications.data | json }}</pre>
              </div>
              <span *ngIf="!data.notifications.data">-</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- action_url Field -->
          <div class="detail-row">
            <label class="detail-label">Action Url</label>
            <div class="detail-value">
              <a
                *ngIf="data.notifications.action_url"
                [href]="data.notifications.action_url"
                target="_blank"
                rel="noopener noreferrer"
                class="url-link"
              >
                {{ data.notifications.action_url }}
                <mat-icon class="external-icon">open_in_new</mat-icon>
              </a>
              <span *ngIf="!data.notifications.action_url">-</span>
            </div>
          </div>

          <mat-divider></mat-divider>
          <!-- read Field -->
          <div class="detail-row">
            <label class="detail-label">Read</label>
            <div class="detail-value">
              <span>{{ data.notifications.read || '-' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- read_at Field -->
          <div class="detail-row">
            <label class="detail-label">Read At</label>
            <div class="detail-value">
              <span>{{ data.notifications.read_at | date: 'medium' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>
          <!-- archived Field -->
          <div class="detail-row">
            <label class="detail-label">Archived</label>
            <div class="detail-value">
              <span>{{ data.notifications.archived || '-' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- archived_at Field -->
          <div class="detail-row">
            <label class="detail-label">Archived At</label>
            <div class="detail-value">
              <span>{{ data.notifications.archived_at | date: 'medium' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>
          <!-- priority Field -->
          <div class="detail-row">
            <label class="detail-label">Priority</label>
            <div class="detail-value">
              <span>{{ data.notifications.priority || '-' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- expires_at Field -->
          <div class="detail-row">
            <label class="detail-label">Expires At</label>
            <div class="detail-value">
              <span>{{ data.notifications.expires_at | date: 'medium' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- created_at Field -->
          <div class="detail-row">
            <label class="detail-label">Created At</label>
            <div class="detail-value">
              <span>{{ data.notifications.created_at | date: 'medium' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- updated_at Field -->
          <div class="detail-row">
            <label class="detail-label">Updated At</label>
            <div class="detail-value">
              <span>{{ data.notifications.updated_at | date: 'medium' }}</span>
            </div>
          </div>

          <!-- Metadata Section -->
          <mat-divider class="metadata-divider"></mat-divider>

          <div class="metadata-section">
            <h3 class="metadata-title">Record Information</h3>

            <div class="detail-row">
              <label class="detail-label">Created At</label>
              <div class="detail-value">
                <span>{{ data.notifications.created_at | date: 'full' }}</span>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Updated At</label>
              <div class="detail-value">
                <span>{{ data.notifications.updated_at | date: 'full' }}</span>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">ID</label>
              <div class="detail-value">
                <code class="id-code">{{ data.notifications.id }}</code>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">Close</button>
        <button mat-raised-button color="primary" (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          Edit
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .view-dialog {
        min-width: 600px;
        max-width: 900px;
      }

      .close-button {
        position: absolute;
        right: 8px;
        top: 8px;
      }

      mat-dialog-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0;
        padding-right: 40px;
      }

      .details-container {
        padding: 16px 0;
      }

      .detail-row {
        display: flex;
        flex-direction: column;
        margin-bottom: 24px;
        gap: 8px;
      }

      .detail-label {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-value {
        font-size: 16px;
        line-height: 1.5;
      }

      .text-content {
        white-space: pre-wrap;
        word-break: break-word;
      }

      .url-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #1976d2;
        text-decoration: none;
      }

      .url-link:hover {
        text-decoration: underline;
      }

      .external-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .json-content {
        background: #f5f5f5;
        border-radius: 4px;
        padding: 12px;
        border-left: 4px solid #1976d2;
      }

      .json-content pre {
        margin: 0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        overflow-x: auto;
      }

      .metadata-divider {
        margin: 32px 0 24px 0;
      }

      .metadata-section {
        background: #fafafa;
        border-radius: 8px;
        padding: 16px;
      }

      .metadata-title {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.7);
      }

      .metadata-section .detail-row {
        margin-bottom: 16px;
      }

      .metadata-section .detail-row:last-child {
        margin-bottom: 0;
      }

      .id-code {
        background: #e8eaf6;
        padding: 4px 8px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #3f51b5;
      }

      mat-dialog-content {
        max-height: 70vh;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .view-dialog {
          min-width: 90vw;
        }

        .detail-row {
          margin-bottom: 16px;
        }
      }
    `,
  ],
})
export class NotificationViewDialogComponent {
  private dialogRef = inject(MatDialogRef<NotificationViewDialogComponent>);
  protected data = inject<NotificationViewDialogData>(MAT_DIALOG_DATA);

  onClose() {
    this.dialogRef.close();
  }

  onEdit() {
    this.dialogRef.close({ action: 'edit', data: this.data.notifications });
  }
}
