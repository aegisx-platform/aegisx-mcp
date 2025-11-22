import {
  Component,
  input,
  output,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  applyFilters?: boolean;
  selectedIds?: string[];
  fields?: string[];
  filename?: string;
}

export interface ExportService {
  export(options: ExportOptions): Promise<Blob>;
}

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <div class="export-container">
      <!-- Export Button with Menu -->
      <button
        mat-stroked-button
        [matMenuTriggerFor]="exportMenu"
        [disabled]="isExporting()"
        class="export-button"
      >
        <mat-icon class="text-blue-600">download</mat-icon>
        @if (isExporting()) {
          <mat-spinner diameter="20" class="ml-2"></mat-spinner>
        } @else {
          Export Data
        }
      </button>

      <!-- Export Menu -->
      <mat-menu #exportMenu="matMenu" class="export-menu-wide">
        <div class="export-menu-content" (click)="$event.stopPropagation()">
          <!-- Format Selection -->
          <div class="format-section">
            <h4>Export Format</h4>
            <div class="format-buttons">
              <button
                mat-button
                [class.selected]="selectedFormat() === 'csv'"
                (click)="selectedFormat.set('csv')"
                class="format-btn"
              >
                <mat-icon>table_chart</mat-icon>
                CSV
              </button>
              <button
                mat-button
                [class.selected]="selectedFormat() === 'excel'"
                (click)="selectedFormat.set('excel')"
                class="format-btn"
              >
                <mat-icon>grid_on</mat-icon>
                Excel
              </button>
              <button
                mat-button
                [class.selected]="selectedFormat() === 'pdf'"
                (click)="selectedFormat.set('pdf')"
                class="format-btn"
              >
                <mat-icon>picture_as_pdf</mat-icon>
                PDF
              </button>
            </div>
          </div>

          <!-- Export Options -->
          <div class="options-section">
            <h4>Export Options</h4>

            <!-- Apply Filters Checkbox -->
            <mat-checkbox [(ngModel)]="applyFilters" class="option-checkbox">
              Apply current filters
              <span class="option-description">
                @if (hasActiveFilters()) {
                  ({{ activeFiltersCount() }} filters active)
                } @else {
                  (no active filters)
                }
              </span>
            </mat-checkbox>

            <!-- Selected Items Only (if items are selected) -->
            @if (selectedItemsCount() > 0) {
              <mat-checkbox
                [(ngModel)]="exportSelectedOnly"
                class="option-checkbox"
              >
                Export selected items only
                <span class="option-description">
                  ({{ selectedItemsCount() }} items selected)
                </span>
              </mat-checkbox>
            }

            <!-- Field Selection -->
            @if (availableFields().length > 0) {
              <div class="field-selection">
                <mat-form-field appearance="outline" class="field-select">
                  <mat-label>Fields to export</mat-label>
                  <mat-select
                    multiple
                    [(value)]="selectedFields"
                    placeholder="All fields"
                  >
                    <mat-option value="all">All fields</mat-option>
                    @for (field of availableFields(); track field.key) {
                      <mat-option [value]="field.key">
                        {{ field.label }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            }
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button mat-button (click)="closeMenu()" class="cancel-btn">
              Cancel
            </button>
            <button
              mat-raised-button
              color="primary"
              [disabled]="!selectedFormat() || isExporting()"
              (click)="executeExport()"
              class="export-btn"
            >
              @if (isExporting()) {
                <mat-spinner diameter="16" class="mr-1"></mat-spinner>
              }
              Export {{ getExportButtonText() }}
            </button>
          </div>
        </div>
      </mat-menu>
    </div>
  `,
  styles: [
    `
      .export-container {
        display: inline-block;
      }

      .export-button {
        min-width: 140px;
      }

      .export-menu-content {
        padding: 12px;
        width: 280px;
        box-sizing: border-box;
      }

      .format-section,
      .options-section {
        margin-bottom: 12px;
      }

      .format-section h4,
      .options-section h4 {
        margin: 0 0 8px 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .format-buttons {
        display: flex;
        gap: 6px;
      }

      .format-btn {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 2px;
        padding: 6px 4px !important;
        border: 1px solid var(--ax-border-default);
        border-radius: 4px;
        background: var(--ax-background-default);
        color: var(--ax-text-primary);
        transition: all 0.2s ease;
        flex: 1;
        min-width: 0;
        height: auto;
        min-height: 48px;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.2;
      }

      .format-btn:hover {
        background: var(--ax-background-muted) !important;
        border-color: var(--ax-border-emphasis);
      }

      .format-btn.selected {
        background: var(--ax-brand-faint) !important;
        border-color: var(--ax-brand-default);
        color: var(--ax-brand-emphasis);
      }

      .format-btn mat-icon {
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
        line-height: 18px !important;
        margin: 0 !important;
        color: var(--ax-brand-default);
      }

      .option-checkbox {
        display: block;
        margin: 6px 0;
      }

      .option-description {
        font-size: 11px;
        color: var(--ax-text-subtle);
        margin-left: 4px;
      }

      .field-selection {
        margin-top: 8px;
      }

      .field-select {
        width: 100%;
      }

      .action-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--ax-border-default);
      }

      .cancel-btn {
        color: var(--ax-text-secondary);
      }

      .export-btn {
        white-space: nowrap;
      }

      .ml-2 {
        margin-left: 8px;
      }
      .mr-1 {
        margin-right: 4px;
      }

      /* Menu panel width override */
      ::ng-deep .export-menu-wide.mat-mdc-menu-panel {
        min-width: 304px !important;
        max-width: 304px !important;
        background: var(--ax-background-default) !important;
        border: 1px solid var(--ax-border-default);
      }
    `,
  ],
})
export class SharedExportComponent {
  // Inputs
  exportService = input.required<ExportService>();
  currentFilters = input<Record<string, any>>({});
  selectedItems = input<any[]>([]);
  availableFields = input<Array<{ key: string; label: string }>>([]);
  moduleName = input<string>('data');

  // Outputs
  exportStarted = output<ExportOptions>();
  exportCompleted = output<{ success: boolean; format: string }>();

  // ViewChild for menu trigger
  menuTrigger = viewChild(MatMenuTrigger);

  // State
  selectedFormat = signal<'csv' | 'excel' | 'pdf' | null>(null);
  isExporting = signal(false);
  applyFilters = true;
  exportSelectedOnly = false;
  selectedFields: string[] = [];

  // Computed
  hasActiveFilters = computed(() => {
    const filters = this.currentFilters();
    return Object.keys(filters).length > 0;
  });

  activeFiltersCount = computed(() => {
    const filters = this.currentFilters();
    return Object.keys(filters).length;
  });

  selectedItemsCount = computed(() => {
    return this.selectedItems().length;
  });

  constructor(private snackBar: MatSnackBar) {}

  getExportButtonText(): string {
    const format = this.selectedFormat();
    if (!format) return '';

    const count = this.exportSelectedOnly ? this.selectedItemsCount() : 'All';
    return `${count} as ${format.toUpperCase()}`;
  }

  closeMenu(): void {
    const trigger = this.menuTrigger();
    if (trigger) {
      trigger.closeMenu();
    }
  }

  async executeExport(): Promise<void> {
    const format = this.selectedFormat();
    if (!format) return;

    // Close menu immediately to show loading state
    this.closeMenu();

    try {
      this.isExporting.set(true);

      const options: ExportOptions = {
        format,
        applyFilters: this.applyFilters && this.hasActiveFilters(),
        selectedIds: this.exportSelectedOnly
          ? this.selectedItems().map((item) => item.id)
          : undefined,
        fields:
          this.selectedFields.length > 0 && !this.selectedFields.includes('all')
            ? this.selectedFields
            : undefined,
        filename: this.generateFilename(format),
      };

      // Emit export started event
      this.exportStarted.emit(options);

      // Call export service
      const blob = await this.exportService().export(options);

      // Download the file
      const extensionMap: Record<string, string> = {
        csv: 'csv',
        excel: 'xlsx',
        pdf: 'pdf',
      };
      const extension = extensionMap[format] || format;
      this.downloadFile(
        blob,
        options.filename || `${this.moduleName()}-export.${extension}`,
      );

      // Show success message
      this.snackBar.open(
        `Export completed successfully! (${format.toUpperCase()})`,
        'Close',
        { duration: 3000, panelClass: ['success-snackbar'] },
      );

      // Emit completion event
      this.exportCompleted.emit({ success: true, format });

      // Reset form
      this.resetForm();
    } catch (error) {
      console.error('Export failed:', error);

      this.snackBar.open(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] },
      );

      // Emit completion event with error
      this.exportCompleted.emit({
        success: false,
        format: format || 'unknown',
      });
    } finally {
      this.isExporting.set(false);
    }
  }

  private generateFilename(format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const module = this.moduleName();

    let suffix = '';
    if (this.exportSelectedOnly) {
      suffix = `-selected-${this.selectedItemsCount()}`;
    } else if (this.applyFilters && this.hasActiveFilters()) {
      suffix = '-filtered';
    }

    // Map format to correct file extension
    const extensionMap: Record<string, string> = {
      csv: 'csv',
      excel: 'xlsx',
      pdf: 'pdf',
    };

    const extension = extensionMap[format] || format;

    return `${module}-export${suffix}-${timestamp}.${extension}`;
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private resetForm(): void {
    this.selectedFormat.set(null);
    this.applyFilters = true;
    this.exportSelectedOnly = false;
    this.selectedFields = [];
  }
}
