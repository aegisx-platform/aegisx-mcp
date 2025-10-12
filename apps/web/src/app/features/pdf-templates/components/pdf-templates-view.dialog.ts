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

import { PdfTemplate } from '../types/pdf-templates.types';

export interface PdfTemplateViewDialogData {
  pdfTemplates: PdfTemplate;
}

@Component({
  selector: 'app-pdf-templates-view-dialog',
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
        Pdf Templates Details
        <button mat-icon-button class="close-button" (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </h2>

      <mat-dialog-content>
        <div class="details-container">
          <!-- Basic Information Section -->
          <div class="info-section">
            <h3 class="section-title">Basic Information</h3>

            <div class="detail-row">
              <label class="detail-label">Name</label>
              <div class="detail-value">
                <span>{{ data.pdfTemplates.name }}</span>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Display Name</label>
              <div class="detail-value">
                <span>{{ data.pdfTemplates.display_name }}</span>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Description</label>
              <div class="detail-value">
                <span class="text-content">{{
                  data.pdfTemplates.description || 'No description provided'
                }}</span>
              </div>
            </div>
          </div>

          <mat-divider class="section-divider"></mat-divider>

          <!-- Template Configuration Section -->
          <div class="info-section">
            <h3 class="section-title">Template Configuration</h3>

            <div class="detail-row">
              <label class="detail-label">Category</label>
              <div class="detail-value">
                <mat-chip class="category-chip">{{
                  data.pdfTemplates.category || 'Uncategorized'
                }}</mat-chip>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Type</label>
              <div class="detail-value">
                <mat-chip class="type-chip">{{
                  data.pdfTemplates.type || 'Standard'
                }}</mat-chip>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Page Size</label>
              <div class="detail-value">
                <span>{{ data.pdfTemplates.page_size }}</span>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Orientation</label>
              <div class="detail-value">
                <span>{{ data.pdfTemplates.orientation }}</span>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Version</label>
              <div class="detail-value">
                <code class="version-code">{{
                  data.pdfTemplates.version
                }}</code>
              </div>
            </div>
          </div>

          <mat-divider class="section-divider"></mat-divider>

          <!-- Status & Usage Section -->
          <div class="info-section">
            <h3 class="section-title">Status & Usage</h3>

            <div class="detail-row">
              <label class="detail-label">Active Status</label>
              <div class="detail-value">
                <mat-chip
                  [class.active-chip]="data.pdfTemplates.is_active"
                  [class.inactive-chip]="!data.pdfTemplates.is_active"
                >
                  <mat-icon>{{
                    data.pdfTemplates.is_active ? 'check_circle' : 'cancel'
                  }}</mat-icon>
                  {{ data.pdfTemplates.is_active ? 'Active' : 'Inactive' }}
                </mat-chip>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Template Starter</label>
              <div class="detail-value">
                <mat-chip
                  [class.starter-chip]="data.pdfTemplates.is_template_starter"
                  [class.not-starter-chip]="
                    !data.pdfTemplates.is_template_starter
                  "
                >
                  <mat-icon>{{
                    data.pdfTemplates.is_template_starter
                      ? 'stars'
                      : 'star_border'
                  }}</mat-icon>
                  {{ data.pdfTemplates.is_template_starter ? 'Yes' : 'No' }}
                </mat-chip>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Usage Count</label>
              <div class="detail-value">
                <span class="usage-count"
                  >{{ data.pdfTemplates.usage_count || 0 }} times</span
                >
              </div>
            </div>
          </div>

          <!-- Metadata Section -->
          <mat-divider class="metadata-divider"></mat-divider>

          <div class="metadata-section">
            <h3 class="metadata-title">Record Information</h3>

            <div class="detail-row">
              <label class="detail-label">Created At</label>
              <div class="detail-value">
                <span>{{ data.pdfTemplates.created_at | date: 'full' }}</span>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Updated At</label>
              <div class="detail-value">
                <span>{{ data.pdfTemplates.updated_at | date: 'full' }}</span>
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">ID</label>
              <div class="detail-value">
                <code class="id-code">{{ data.pdfTemplates.id }}</code>
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

      .version-code {
        background: #fff3e0;
        padding: 4px 8px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #f57c00;
      }

      .info-section {
        margin-bottom: 16px;
      }

      .section-title {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }

      .section-divider {
        margin: 24px 0;
      }

      .category-chip,
      .type-chip {
        background: #e3f2fd !important;
        color: #1976d2 !important;
      }

      .active-chip {
        background: #c8e6c9 !important;
        color: #2e7d32 !important;
      }

      .inactive-chip {
        background: #ffcdd2 !important;
        color: #c62828 !important;
      }

      .starter-chip {
        background: #ffe0b2 !important;
        color: #e65100 !important;
      }

      .not-starter-chip {
        background: #f5f5f5 !important;
        color: #757575 !important;
      }

      mat-chip mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 4px;
      }

      .usage-count {
        font-weight: 500;
        color: #1976d2;
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
export class PdfTemplateViewDialogComponent {
  private dialogRef = inject(MatDialogRef<PdfTemplateViewDialogComponent>);
  protected data = inject<PdfTemplateViewDialogData>(MAT_DIALOG_DATA);

  onClose() {
    this.dialogRef.close();
  }

  onEdit() {
    this.dialogRef.close({ action: 'edit', data: this.data.pdfTemplates });
  }
}
