import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
  forwardRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import SignaturePad from 'signature_pad';

export type SignatureOutputFormat = 'png' | 'jpeg' | 'svg';
export type SignatureMode = 'draw' | 'upload';

export interface SignatureData {
  dataUrl: string;
  mode: SignatureMode;
  isEmpty: boolean;
}

/**
 * AegisX Signature Pad Component
 *
 * A signature capture component that supports both drawing and uploading signatures.
 * Uses signature_pad library for smooth signature drawing.
 *
 * @example
 * ```html
 * <!-- Basic usage - both draw and upload -->
 * <ax-signature-pad
 *   (signatureChange)="onSignatureChange($event)"
 * />
 *
 * <!-- Draw only -->
 * <ax-signature-pad
 *   [enableDraw]="true"
 *   [enableUpload]="false"
 * />
 *
 * <!-- Upload only -->
 * <ax-signature-pad
 *   [enableDraw]="false"
 *   [enableUpload]="true"
 * />
 *
 * <!-- With form control -->
 * <ax-signature-pad formControlName="signature" />
 * ```
 */
@Component({
  selector: 'ax-signature-pad',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxSignaturePadComponent),
      multi: true,
    },
  ],
  template: `
    <mat-card appearance="outlined" class="ax-signature-pad">
      <!-- Mode Toggle (only if both modes enabled) -->
      @if (showModeToggle()) {
        <div class="flex justify-center mb-4">
          <mat-button-toggle-group
            [value]="currentMode()"
            (change)="onModeChange($event.value)"
            [disabled]="disabled"
          >
            <mat-button-toggle value="draw">
              <mat-icon>draw</mat-icon>
              <span class="ml-2">วาดลายเซ็น</span>
            </mat-button-toggle>
            <mat-button-toggle value="upload">
              <mat-icon>upload_file</mat-icon>
              <span class="ml-2">อัพโหลด</span>
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      }

      <!-- Canvas Area (Draw Mode) -->
      @if (currentMode() === 'draw' && enableDraw) {
        <div
          class="canvas-container"
          [style.height.px]="height"
          [class.has-drawing]="hasDrawing()"
        >
          <canvas
            #signatureCanvas
            class="signature-canvas"
            [class.disabled]="disabled"
          ></canvas>
          @if (isEmpty() && !disabled) {
            <div class="canvas-placeholder">
              <mat-icon>gesture</mat-icon>
              <span>วาดลายเซ็นที่นี่</span>
            </div>
          }
        </div>
      }

      <!-- Upload Area (Upload Mode) -->
      @if (currentMode() === 'upload' && enableUpload) {
        <div
          class="upload-container"
          [style.height.px]="height"
          [class.drag-over]="isDragOver()"
          [class.disabled]="disabled"
          [class.has-image]="uploadedImage()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="openFileDialog()"
          (keydown.enter)="openFileDialog()"
          (keydown.space)="openFileDialog()"
          tabindex="0"
          role="button"
          [attr.aria-label]="
            uploadedImage() ? 'เปลี่ยนรูปลายเซ็น' : 'อัพโหลดลายเซ็น'
          "
        >
          <input
            #fileInput
            type="file"
            class="hidden"
            [accept]="acceptUpload"
            [disabled]="disabled"
            (change)="onFileSelected($event)"
          />

          @if (uploadedImage()) {
            <img
              [src]="uploadedImage()"
              alt="Uploaded signature"
              class="uploaded-image"
            />
          } @else {
            <div class="upload-placeholder">
              <mat-icon>cloud_upload</mat-icon>
              <span class="text-base font-medium">ลากไฟล์มาวางที่นี่</span>
              <span class="text-sm text-gray-500">หรือ คลิกเพื่อเลือกไฟล์</span>
              <span class="text-xs text-gray-400 mt-2"
                >รองรับ PNG, JPG ขนาดไม่เกิน
                {{ formatSize(maxUploadSize) }}</span
              >
            </div>
          }
        </div>
      }

      <!-- Actions -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t">
        <div class="flex gap-2">
          @if (currentMode() === 'draw') {
            @if (enableUndo) {
              <button
                mat-stroked-button
                (click)="undo()"
                [disabled]="disabled || undoStack().length === 0"
                matTooltip="ย้อนกลับ (Undo)"
              >
                <mat-icon>undo</mat-icon>
              </button>
            }
            @if (enableRedo) {
              <button
                mat-stroked-button
                (click)="redo()"
                [disabled]="disabled || redoStack().length === 0"
                matTooltip="ทำซ้ำ (Redo)"
              >
                <mat-icon>redo</mat-icon>
              </button>
            }
            @if (enableClear && !isEmpty()) {
              <button
                mat-stroked-button
                (click)="clear()"
                [disabled]="disabled"
                matTooltip="ล้างลายเซ็น"
              >
                <mat-icon>delete_outline</mat-icon>
                ล้าง
              </button>
            }
          }
          @if (currentMode() === 'upload' && uploadedImage()) {
            <button
              mat-stroked-button
              (click)="clearUpload()"
              [disabled]="disabled"
            >
              <mat-icon>refresh</mat-icon>
              เปลี่ยนรูป
            </button>
          }
        </div>

        @if (enableSave) {
          <button
            mat-flat-button
            color="primary"
            (click)="save()"
            [disabled]="disabled || isEmpty()"
          >
            <mat-icon>save</mat-icon>
            บันทึกลายเซ็น
          </button>
        }
      </div>
    </mat-card>
  `,
  styles: [
    `
      .ax-signature-pad {
        padding: 1rem;
      }

      .canvas-container {
        position: relative;
        border: 1px dotted rgba(0, 0, 0, 0.12);
        border-radius: 8px;
        overflow: hidden;
        background: #f8f9fa;
        transition: all 0.2s ease;

        &.has-drawing {
          border-color: rgba(0, 0, 0, 0.15);
        }
      }

      .signature-canvas {
        width: 100%;
        height: 100%;
        cursor: crosshair;
        touch-action: none;

        &.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
      }

      .canvas-placeholder {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: var(--mat-sys-outline);
        pointer-events: none;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          opacity: 0.5;
        }
      }

      .upload-container {
        position: relative;
        border: 2px dashed var(--mat-sys-outline-variant);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;
      }

      .signature-upload:hover:not(.disabled) {
        border-color: var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
      }

      .signature-upload.drag-over {
        border-color: var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        border-style: solid;
      }

      .signature-upload.disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .signature-upload.has-image {
        border-style: solid;
        border-color: var(--mat-sys-outline-variant);
        background: white;
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: var(--mat-sys-outline);

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: var(--mat-sys-primary);
          opacity: 0.7;
        }
      }

      .uploaded-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    `,
  ],
})
export class AxSignaturePadComponent
  implements AfterViewInit, OnDestroy, ControlValueAccessor
{
  private platformId = inject(PLATFORM_ID);

  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  // Feature Toggles
  @Input() enableDraw = true;
  @Input() enableUpload = true;
  @Input() enableUndo = true;
  @Input() enableRedo = true;
  @Input() enableClear = true;
  @Input() enableSave = true;

  // Canvas Settings
  @Input() width = 400;
  @Input() height = 200;
  @Input() penColor = '#000000';
  @Input() penWidth = 2.5;
  @Input() backgroundColor = '#ffffff';

  // Upload Settings
  @Input() acceptUpload = 'image/png,image/jpeg';
  @Input() maxUploadSize = 2 * 1024 * 1024; // 2MB

  // State
  @Input() disabled = false;

  // Outputs
  @Output() signatureChange = new EventEmitter<SignatureData>();
  @Output() cleared = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  // Internal state
  private signaturePad: SignaturePad | null = null;
  protected currentMode = signal<SignatureMode>('draw');
  protected uploadedImage = signal<string | null>(null);
  protected isDragOver = signal(false);
  protected undoStack = signal<string[]>([]);
  protected redoStack = signal<string[]>([]);
  protected hasDrawing = signal(false); // Track drawing state reactively

  // Computed
  protected showModeToggle = computed(
    () => this.enableDraw && this.enableUpload,
  );

  protected isEmpty = computed(() => {
    if (this.currentMode() === 'draw') {
      return !this.hasDrawing();
    }
    return !this.uploadedImage();
  });

  // Form control callbacks
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string | null) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.enableDraw) {
      this.initSignaturePad();
    }

    // Set initial mode
    if (!this.enableDraw && this.enableUpload) {
      this.currentMode.set('upload');
    }
  }

  ngOnDestroy(): void {
    if (this.signaturePad) {
      this.signaturePad.off();
    }
  }

  private initSignaturePad(): void {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    this.resizeCanvas(canvas);

    this.signaturePad = new SignaturePad(canvas, {
      penColor: this.penColor,
      minWidth: this.penWidth * 0.5,
      maxWidth: this.penWidth * 1.5,
      backgroundColor: this.backgroundColor,
    });

    // Listen for stroke end to save undo state and update hasDrawing
    this.signaturePad.addEventListener('endStroke', () => {
      this.hasDrawing.set(true);
      this.saveUndoState();
      this.emitChange();
    });

    // Handle resize
    window.addEventListener('resize', () => this.resizeCanvas(canvas));
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = container.offsetWidth * ratio;
    canvas.height = container.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);

    // Clear and redraw if we have signature pad
    if (this.signaturePad) {
      const data = this.signaturePad.toData();
      this.signaturePad.clear();
      if (data.length > 0) {
        this.signaturePad.fromData(data);
      }
    }
  }

  private saveUndoState(): void {
    if (!this.signaturePad) return;
    const data = this.signaturePad.toDataURL();
    this.undoStack.update((stack) => [...stack, data]);
    // Clear redo stack when new stroke is added
    this.redoStack.set([]);
  }

  // Public Methods
  clear(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
      this.undoStack.set([]);
      this.redoStack.set([]);
      this.hasDrawing.set(false);
      this.emitChange();
      this.cleared.emit();
    }
  }

  undo(): void {
    const stack = this.undoStack();
    if (stack.length > 0 && this.signaturePad) {
      const newStack = [...stack];
      const poppedState = newStack.pop();

      // Save popped state to redo stack
      if (poppedState) {
        this.redoStack.update((redoStack) => [...redoStack, poppedState]);
      }

      this.undoStack.set(newStack);

      if (newStack.length > 0) {
        this.signaturePad.fromDataURL(newStack[newStack.length - 1]);
      } else {
        this.signaturePad.clear();
        this.hasDrawing.set(false);
      }
      this.emitChange();
    }
  }

  redo(): void {
    const stack = this.redoStack();
    if (stack.length > 0 && this.signaturePad) {
      const newRedoStack = [...stack];
      const stateToRestore = newRedoStack.pop();

      if (stateToRestore) {
        // Restore the state
        this.signaturePad.fromDataURL(stateToRestore);
        this.hasDrawing.set(true);

        // Add to undo stack
        this.undoStack.update((undoStack) => [...undoStack, stateToRestore]);
      }

      this.redoStack.set(newRedoStack);
      this.emitChange();
    }
  }

  save(): void {
    const dataUrl = this.toDataURL();
    if (dataUrl) {
      this.saved.emit(dataUrl);
    }
  }

  toDataURL(format: SignatureOutputFormat = 'png'): string | null {
    if (this.currentMode() === 'draw' && this.signaturePad) {
      if (!this.hasDrawing()) return null;
      switch (format) {
        case 'jpeg':
          return this.signaturePad.toDataURL('image/jpeg');
        case 'svg':
          return this.signaturePad.toDataURL('image/svg+xml');
        default:
          return this.signaturePad.toDataURL('image/png');
      }
    }
    return this.uploadedImage();
  }

  fromDataURL(dataUrl: string): void {
    if (this.signaturePad && dataUrl) {
      this.signaturePad.fromDataURL(dataUrl);
      this.hasDrawing.set(true);
      this.emitChange();
    }
  }

  // Mode handling
  onModeChange(mode: SignatureMode): void {
    this.currentMode.set(mode);

    // Reinitialize canvas when switching to draw mode
    if (mode === 'draw' && isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSignaturePad(), 0);
    }
  }

  // Upload handling
  openFileDialog(): void {
    if (!this.disabled && this.fileInputRef) {
      this.fileInputRef.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.handleFile(input.files[0]);
    }
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (!this.disabled && event.dataTransfer?.files?.[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    // Validate type
    const acceptedTypes = this.acceptUpload.split(',').map((t) => t.trim());
    if (!acceptedTypes.some((t) => file.type.match(t.replace('*', '.*')))) {
      console.error('Invalid file type');
      return;
    }

    // Validate size
    if (file.size > this.maxUploadSize) {
      console.error('File too large');
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = () => {
      this.uploadedImage.set(reader.result as string);
      this.emitChange();
    };
    reader.readAsDataURL(file);
  }

  clearUpload(): void {
    this.uploadedImage.set(null);
    this.emitChange();
    this.cleared.emit();
  }

  // Helpers
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private emitChange(): void {
    const data: SignatureData = {
      dataUrl: this.toDataURL() || '',
      mode: this.currentMode(),
      isEmpty: this.isEmpty(),
    };
    this.signatureChange.emit(data);
    this.onChange(data.dataUrl || null);
    this.onTouched();
  }

  // ControlValueAccessor
  writeValue(value: string | null): void {
    if (value) {
      if (this.currentMode() === 'draw') {
        setTimeout(() => this.fromDataURL(value), 0);
      } else {
        this.uploadedImage.set(value);
      }
    } else {
      this.clear();
      this.clearUpload();
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.signaturePad) {
      if (isDisabled) {
        this.signaturePad.off();
      } else {
        this.signaturePad.on();
      }
    }
  }
}
