import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { PdfTemplateService } from '../services/pdf-templates.service';
import {
  PdfTemplate,
  UpdatePdfTemplateRequest,
} from '../types/pdf-templates.types';
import {
  PdfTemplateFormComponent,
  PdfTemplateFormData,
} from './pdf-templates-form.component';

export interface PdfTemplateEditDialogData {
  pdfTemplates: PdfTemplate;
}

@Component({
  selector: 'app-pdf-templates-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PdfTemplateFormComponent,
    NgxExtendedPdfViewerModule,
  ],
  template: `
    <div class="edit-dialog-container">
      <!-- Header -->
      <h2
        mat-dialog-title
        class="flex items-center justify-between gap-3 text-xl font-semibold"
      >
        <div class="flex items-center gap-3">
          <mat-icon class="text-brand">edit</mat-icon>
          <span>Edit PDF Template: {{ data.pdfTemplates.display_name }}</span>
        </div>
        <div class="header-actions flex gap-2">
          <button
            mat-icon-button
            (click)="togglePreview()"
            [matTooltip]="previewVisible() ? 'Hide Preview' : 'Show Preview'"
          >
            <mat-icon>{{
              previewVisible() ? 'visibility_off' : 'visibility'
            }}</mat-icon>
          </button>
          <button
            mat-icon-button
            (click)="refreshPreview()"
            [disabled]="loadingPreview() || !previewVisible()"
            matTooltip="Refresh Preview"
          >
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </h2>

      <!-- Split Screen Content -->
      <div class="split-content">
        <!-- Left Panel: Form -->
        <div
          class="form-panel"
          [class.with-preview]="previewVisible()"
          [style.width]="previewVisible() ? leftPanelWidth() + '%' : '100%'"
        >
          <app-pdf-templates-form
            mode="edit"
            [initialData]="data.pdfTemplates"
            [loading]="loading()"
            (formSubmit)="onFormSubmit($event)"
            (formCancel)="onCancel()"
            (logoChanged)="onLogoChanged()"
          ></app-pdf-templates-form>
        </div>

        <!-- Resize Handle -->
        @if (previewVisible()) {
          <div
            class="resize-handle"
            [class.dragging]="isDragging()"
            (mousedown)="onResizeStart($event)"
            matTooltip="Drag to resize panels"
          >
            <div class="resize-handle-line"></div>
          </div>
        }

        <!-- Right Panel: Preview -->
        @if (previewVisible()) {
          <div class="preview-panel" [style.width.%]="rightPanelWidth()">
            <div class="preview-header">
              <h3>PDF Preview</h3>
              @if (loadingPreview()) {
                <mat-spinner diameter="20"></mat-spinner>
              }
            </div>

            <div class="preview-content">
              @if (loadingPreview()) {
                <div class="preview-loading">
                  <mat-spinner diameter="50"></mat-spinner>
                  <p>Generating preview...</p>
                </div>
              } @else if (previewError()) {
                <div class="preview-error">
                  <mat-icon>error_outline</mat-icon>
                  <h4>Preview Error</h4>
                  <p>{{ previewError() }}</p>
                  <button
                    mat-flat-button
                    color="primary"
                    (click)="refreshPreview()"
                  >
                    <mat-icon>refresh</mat-icon>
                    Try Again
                  </button>
                </div>
              } @else if (pdfPreviewUrl()) {
                <ngx-extended-pdf-viewer
                  [src]="pdfPreviewUrl()!"
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
                  [theme]="'light'"
                  [backgroundColor]="'#e4e4e4'"
                  class="pdf-viewer"
                ></ngx-extended-pdf-viewer>
              } @else {
                <div class="preview-placeholder">
                  <mat-icon>picture_as_pdf</mat-icon>
                  <p>
                    Click "Refresh Preview" to generate PDF preview with sample
                    data
                  </p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .edit-dialog-container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--mat-sys-surface-container);
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .split-content {
        flex: 1;
        display: flex;
        gap: 0;
        overflow: hidden;
        position: relative;
      }

      .form-panel {
        background: var(--mat-sys-surface);
        overflow-y: auto;
        padding: 24px;
        flex-shrink: 0;
      }

      .form-panel.with-preview {
        min-width: 20%;
        max-width: 80%;
      }

      .resize-handle {
        width: 16px;
        background: var(--mat-sys-surface-container-high);
        cursor: col-resize;
        position: relative;
        flex-shrink: 0;
        transition: background-color 0.15s ease;
        user-select: none;
      }

      .resize-handle:hover {
        background: var(--mat-sys-primary-container);
      }

      .resize-handle.dragging {
        background: var(--mat-sys-primary-container);
      }

      .resize-handle-line {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 2px;
        height: 40px;
        background: var(--mat-sys-outline);
        border-radius: 1px;
      }

      .resize-handle:hover .resize-handle-line,
      .resize-handle.dragging .resize-handle-line {
        background: var(--mat-sys-on-primary-container);
      }

      .preview-panel {
        background: var(--mat-sys-surface-container);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 20%;
        flex: 1;
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background: var(--mat-sys-surface);
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .preview-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--mat-sys-on-surface);
      }

      .preview-content {
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      .pdf-viewer {
        width: 100%;
        height: 100%;
        display: block;
        overflow: auto;
      }

      .preview-loading,
      .preview-error,
      .preview-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 40px;
        text-align: center;
      }

      .preview-loading mat-icon,
      .preview-error mat-icon,
      .preview-placeholder mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 16px;
      }

      .preview-error mat-icon {
        color: var(--mat-sys-error);
      }

      .preview-error h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: var(--mat-sys-error);
      }

      .preview-error p {
        margin: 0 0 24px 0;
        color: var(--mat-sys-on-surface-variant);
        max-width: 400px;
      }

      .preview-placeholder p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
        max-width: 300px;
      }

      /* Responsive */
      @media (max-width: 1200px) {
        .split-content {
          flex-direction: column;
        }

        .resize-handle {
          display: none;
        }

        .form-panel,
        .preview-panel {
          width: 100% !important;
          max-width: 100%;
          min-width: 100%;
        }

        .form-panel {
          border-right: none;
          border-bottom: 1px solid var(--mat-sys-outline-variant);
        }

        .preview-panel {
          min-height: 400px;
        }
      }
    `,
  ],
})
export class PdfTemplateEditDialogComponent implements OnInit {
  private pdfTemplatesService = inject(PdfTemplateService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<PdfTemplateEditDialogComponent>);
  public data = inject<PdfTemplateEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);
  loadingPreview = signal<boolean>(false);
  previewError = signal<string | null>(null);
  pdfPreviewUrl = signal<string | null>(null); // Changed from SafeResourceUrl to string for ng2-pdf-viewer
  previewVisible = signal<boolean>(true); // Show preview by default

  // Resize panel state
  leftPanelWidth = signal<number>(50); // Default 50% split
  rightPanelWidth = signal<number>(50);
  isDragging = signal<boolean>(false);
  private startX = 0;
  private startLeftWidth = 0;
  private readonly STORAGE_KEY = 'pdf-template-editor-split-ratio';
  private readonly MIN_PANEL_WIDTH = 20; // Minimum 20% width
  private readonly MAX_PANEL_WIDTH = 80; // Maximum 80% width

  ngOnInit() {
    // Restore saved split ratio from localStorage
    this.loadSplitRatio();

    // Auto-generate preview on load
    this.refreshPreview();

    // Setup global mouse event listeners for resize
    this.setupResizeListeners();
  }

  /**
   * Toggle preview panel visibility
   */
  togglePreview(): void {
    this.previewVisible.set(!this.previewVisible());
  }

  /**
   * Load saved split ratio from localStorage
   */
  private loadSplitRatio(): void {
    try {
      const savedRatio = localStorage.getItem(this.STORAGE_KEY);
      if (savedRatio) {
        const leftWidth = parseFloat(savedRatio);
        if (
          leftWidth >= this.MIN_PANEL_WIDTH &&
          leftWidth <= this.MAX_PANEL_WIDTH
        ) {
          this.leftPanelWidth.set(leftWidth);
          this.rightPanelWidth.set(100 - leftWidth);
        }
      }
    } catch (error) {
      console.warn('Failed to load split ratio from localStorage:', error);
    }
  }

  /**
   * Save split ratio to localStorage
   */
  private saveSplitRatio(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.leftPanelWidth().toString());
    } catch (error) {
      console.warn('Failed to save split ratio to localStorage:', error);
    }
  }

  /**
   * Setup global mouse event listeners for resizing
   */
  private setupResizeListeners(): void {
    // Mouse move handler
    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging()) return;

      const container = document.querySelector('.split-content') as HTMLElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const newLeftWidth = (mouseX / containerRect.width) * 100;

      // Clamp width between min and max
      const clampedWidth = Math.max(
        this.MIN_PANEL_WIDTH,
        Math.min(this.MAX_PANEL_WIDTH, newLeftWidth),
      );

      this.leftPanelWidth.set(clampedWidth);
      this.rightPanelWidth.set(100 - clampedWidth);

      // Prevent text selection during drag
      e.preventDefault();
    };

    // Mouse up handler
    const onMouseUp = () => {
      if (this.isDragging()) {
        this.isDragging.set(false);
        this.saveSplitRatio();
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    // Add global listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Cleanup on component destroy
    this.dialogRef.afterClosed().subscribe(() => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    });
  }

  /**
   * Handle resize start (mouse down on handle)
   */
  onResizeStart(event: MouseEvent): void {
    this.isDragging.set(true);
    this.startX = event.clientX;
    this.startLeftWidth = this.leftPanelWidth();

    // Prevent text selection during drag
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    event.preventDefault();
  }

  /**
   * Handle logo changed event - refresh preview
   */
  onLogoChanged() {
    console.log('[Edit Dialog] Logo changed, refreshing preview...');
    if (this.previewVisible()) {
      this.refreshPreview();
    }
  }

  async refreshPreview() {
    this.loadingPreview.set(true);
    this.previewError.set(null);
    this.pdfPreviewUrl.set(null);

    try {
      // Use template's sample_data or empty object
      const previewData = this.data.pdfTemplates.sample_data || {};
      console.log(
        '[Preview] Requesting preview for template:',
        this.data.pdfTemplates.id,
      );
      console.log('[Preview] Sample data:', previewData);

      const pdfBlob = await this.pdfTemplatesService.previewTemplate(
        this.data.pdfTemplates.id,
        previewData,
      );

      console.log('[Preview] Received blob:', {
        size: pdfBlob?.size,
        type: pdfBlob?.type,
        isBlob: pdfBlob instanceof Blob,
      });

      if (pdfBlob && pdfBlob.size > 0) {
        // Check if it's actually a PDF
        if (
          pdfBlob.type !== 'application/pdf' &&
          !pdfBlob.type.includes('pdf')
        ) {
          // Try to read as text to see if it's an error message
          const text = await pdfBlob.text();
          console.error('[Preview] Not a PDF, content:', text);
          this.previewError.set(`Invalid response: ${text.substring(0, 200)}`);
          return;
        }

        const url = URL.createObjectURL(pdfBlob);
        console.log('[Preview] Created blob URL:', url);
        this.pdfPreviewUrl.set(url); // ng2-pdf-viewer accepts string URLs directly
      } else {
        console.error('[Preview] Empty or null blob received');
        this.previewError.set('Failed to generate preview - empty response');
      }
    } catch (error: any) {
      console.error('[Preview] Error:', error);
      console.error('[Preview] Error details:', {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        error: error?.error,
      });
      this.previewError.set(
        error?.message ||
          'Failed to generate PDF preview. Check template syntax and sample data.',
      );
    } finally {
      this.loadingPreview.set(false);
    }
  }

  async onFormSubmit(formData: PdfTemplateFormData) {
    this.loading.set(true);

    try {
      const updateRequest = formData as UpdatePdfTemplateRequest;
      const result = await this.pdfTemplatesService.updatePdfTemplate(
        this.data.pdfTemplates.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('Pdf Templates updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update Pdf Templates', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.pdfTemplatesService.permissionError()
        ? 'You do not have permission to update Pdf Templates'
        : error?.message || 'Failed to update Pdf Templates';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
