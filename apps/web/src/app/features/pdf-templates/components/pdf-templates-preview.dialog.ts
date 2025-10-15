import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfTemplateService } from '../services/pdf-templates.service';
import { PdfTemplate } from '../types/pdf-templates.types';

export interface PdfTemplatePreviewDialogData {
  template: PdfTemplate;
}

@Component({
  selector: 'app-pdf-templates-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    NgxExtendedPdfViewerModule,
  ],
  template: `
    <div class="preview-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>visibility</mat-icon>
          Preview: {{ data.template.display_name }}
        </h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        @if (loading()) {
          <div class="loading-container">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Generating preview...</p>
          </div>
        }

        @if (error()) {
          <div class="error-container">
            <mat-icon class="error-icon">error</mat-icon>
            <h3>Preview Failed</h3>
            <p>{{ error() }}</p>
            <button mat-raised-button color="primary" (click)="loadPreview()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        }

        @if (pdfUrl() && !loading() && !error()) {
          <div class="pdf-container">
            <ngx-extended-pdf-viewer
              [src]="pdfUrl()!"
              [textLayer]="true"
              [showHandToolButton]="true"
              [showSidebarButton]="true"
              [showFindButton]="true"
              [showPagingButtons]="true"
              [showZoomButtons]="true"
              [showPresentationModeButton]="true"
              [showOpenFileButton]="false"
              [showPrintButton]="true"
              [showDownloadButton]="true"
              [showSecondaryToolbarButton]="true"
              [showRotateButton]="true"
              [showSpreadButton]="true"
              [showPropertiesButton]="true"
              [height]="'100%'"
              class="pdf-viewer"
              [theme]="'light'"
              [backgroundColor]="'#e4e4e4'"
            ></ngx-extended-pdf-viewer>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Close</button>
        @if (pdfUrl() && !loading()) {
          <button mat-raised-button color="primary" (click)="downloadPdf()">
            <mat-icon>download</mat-icon>
            Download
          </button>
        }
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .preview-dialog {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 90vh;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);

        h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 20px;
          font-weight: 500;
        }
      }

      .dialog-content {
        flex: 1;
        padding: 0 !important;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .loading-container,
      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 48px;
        text-align: center;

        p {
          margin-top: 16px;
          color: rgba(0, 0, 0, 0.6);
        }
      }

      .error-container {
        .error-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #f44336;
        }

        h3 {
          margin: 16px 0 8px;
          color: #f44336;
        }

        button {
          margin-top: 24px;
        }
      }

      .pdf-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .pdf-viewer {
        width: 100%;
        height: 100%;
        border: none;
        flex: 1;
      }

      mat-dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
      }
    `,
  ],
})
export class PdfTemplatePreviewDialog implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  pdfUrl = signal<string | null>(null);
  private pdfBlob: Blob | null = null;

  constructor(
    public dialogRef: MatDialogRef<PdfTemplatePreviewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PdfTemplatePreviewDialogData,
    private pdfTemplateService: PdfTemplateService,
  ) {}

  ngOnInit() {
    this.loadPreview();
  }

  async loadPreview() {
    this.loading.set(true);
    this.error.set(null);
    this.pdfUrl.set(null);

    try {
      // Use sample_data if available, otherwise use empty object
      const sampleData = this.data.template.sample_data || {};

      const blob = await this.pdfTemplateService.previewTemplate(
        this.data.template.id,
        sampleData,
      );

      if (blob) {
        this.pdfBlob = blob;
        const url = URL.createObjectURL(blob);
        this.pdfUrl.set(url);
      } else {
        this.error.set('Failed to generate preview');
      }
    } catch (err: any) {
      console.error('Preview error:', err);
      this.error.set(err.message || 'Failed to generate preview');
    } finally {
      this.loading.set(false);
    }
  }

  downloadPdf() {
    if (!this.pdfBlob) return;

    const url = URL.createObjectURL(this.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.data.template.name}-preview.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  ngOnDestroy() {
    // Clean up object URL
    const url = this.pdfUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}
