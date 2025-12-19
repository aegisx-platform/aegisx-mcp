import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  BrowserMultiFormatReader,
  Result,
  BarcodeFormat as ZXingBarcodeFormat,
} from '@zxing/library';
import {
  BarcodeFormat,
  ScannerMode,
  ScanResult,
  ScanError,
} from './ax-barcode-scanner.component.types';

/**
 * Barcode Scanner Component for Inventory Management
 *
 * Features:
 * - Camera-based scanning with ZXing integration
 * - Manual barcode entry as fallback
 * - Support for multiple barcode formats (QR, EAN-13, Code 128, etc.)
 * - Beep sound on successful scan
 * - Scan history (last 10 scans)
 * - Continuous scan mode
 * - Flashlight toggle
 * - Auto-cleanup of camera resources
 *
 * @example
 * ```html
 * <ax-barcode-scanner
 *   [mode]="'auto'"
 *   [formats]="['qr', 'ean13', 'code128']"
 *   [continuousScan]="false"
 *   [beepSound]="true"
 *   [showHistory]="true"
 *   (onScan)="handleScan($event)"
 *   (onError)="handleError($event)">
 * </ax-barcode-scanner>
 * ```
 */
@Component({
  selector: 'ax-barcode-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './ax-barcode-scanner.component.html',
  styleUrls: ['./ax-barcode-scanner.component.scss'],
})
export class AxBarcodeScannerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoRef?: ElementRef<HTMLVideoElement>;

  // Inputs
  mode = input<ScannerMode>('auto');
  formats = input<BarcodeFormat[]>(['qr', 'ean13', 'code128']);
  continuousScan = input<boolean>(false);
  beepSound = input<boolean>(true);
  showHistory = input<boolean>(false);
  placeholder = input<string>('Enter barcode...');

  // Outputs
  onScan = output<ScanResult>();
  onError = output<ScanError>();
  onModeChange = output<'camera' | 'manual'>();

  // Internal state
  protected currentMode = signal<'camera' | 'manual'>('camera');
  protected isScanning = signal<boolean>(false);
  protected hasPermission = signal<boolean | null>(null);
  protected recentScans = signal<ScanResult[]>([]);
  protected currentStream = signal<MediaStream | null>(null);
  protected flashlightEnabled = signal<boolean>(false);
  protected manualInput = signal<string>('');

  // Computed
  protected canUseCamera = computed(() => {
    return (
      'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    );
  });

  protected displayedScans = computed(() => {
    return this.showHistory() ? this.recentScans().slice(0, 10) : [];
  });

  private codeReader: BrowserMultiFormatReader | null = null;

  async ngOnInit() {
    const mode = this.mode();
    if (mode === 'auto') {
      if (this.canUseCamera()) {
        await this.initCameraMode();
      } else {
        this.switchToManualMode();
      }
    } else if (mode === 'camera') {
      await this.initCameraMode();
    } else {
      this.switchToManualMode();
    }
  }

  ngOnDestroy() {
    this.cleanupCamera();
  }

  /**
   * Initialize camera mode with permission request
   */
  private async initCameraMode() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      this.currentStream.set(stream);
      this.hasPermission.set(true);
      this.currentMode.set('camera');
      await this.startScanning();
    } catch (error: any) {
      this.hasPermission.set(false);
      this.onError.emit({
        type: 'permission-denied',
        message: error.message || 'Camera permission denied',
      });
      this.switchToManualMode();
    }
  }

  /**
   * Start barcode scanning with ZXing
   */
  private async startScanning() {
    this.codeReader = new BrowserMultiFormatReader();
    const videoElement = this.videoRef?.nativeElement;

    if (!videoElement) {
      this.onError.emit({
        type: 'camera-error',
        message: 'Video element not found',
      });
      return;
    }

    try {
      this.isScanning.set(true);
      await this.codeReader.decodeFromVideoDevice(
        null, // Use default device
        videoElement,
        (result, error) => {
          if (result) {
            this.handleScanSuccess(result);
          }
          // Ignore errors during continuous scanning
        },
      );
    } catch (error: any) {
      this.isScanning.set(false);
      this.onError.emit({
        type: 'camera-error',
        message: error.message || 'Camera error occurred',
      });
    }
  }

  /**
   * Handle successful barcode scan
   */
  private handleScanSuccess(result: Result) {
    const scanResult: ScanResult = {
      code: result.getText(),
      format: this.mapBarcodeFormat(result.getBarcodeFormat()),
      timestamp: new Date(),
      mode: 'camera',
    };

    // Play beep sound
    if (this.beepSound()) {
      this.playBeep();
    }

    // Add to history
    const scans = [scanResult, ...this.recentScans()];
    this.recentScans.set(scans.slice(0, 10));

    // Emit event
    this.onScan.emit(scanResult);

    // Handle continuous scan
    if (!this.continuousScan()) {
      this.isScanning.set(false);
      this.cleanupCamera();
    }
  }

  /**
   * Map ZXing barcode format to our format type
   */
  private mapBarcodeFormat(format: ZXingBarcodeFormat): BarcodeFormat {
    const formatMap: Record<number, BarcodeFormat> = {
      [ZXingBarcodeFormat.QR_CODE]: 'qr',
      [ZXingBarcodeFormat.EAN_13]: 'ean13',
      [ZXingBarcodeFormat.EAN_8]: 'ean8',
      [ZXingBarcodeFormat.CODE_128]: 'code128',
      [ZXingBarcodeFormat.CODE_39]: 'code39',
      [ZXingBarcodeFormat.DATA_MATRIX]: 'datamatrix',
    };
    return formatMap[format] || 'qr';
  }

  /**
   * Play beep sound using Web Audio API
   */
  private playBeep() {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Audio not supported, fail silently
    }
  }

  /**
   * Clean up camera resources
   */
  private cleanupCamera() {
    if (this.codeReader) {
      this.codeReader.reset();
      this.codeReader = null;
    }

    const stream = this.currentStream();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      this.currentStream.set(null);
    }
  }

  /**
   * Switch to manual input mode
   */
  switchToManualMode() {
    this.currentMode.set('manual');
    this.onModeChange.emit('manual');
  }

  /**
   * Switch to camera mode
   */
  protected async switchToCameraMode() {
    if (!this.canUseCamera()) {
      this.onError.emit({
        type: 'camera-error',
        message: 'Camera not supported on this device',
      });
      return;
    }
    await this.initCameraMode();
    this.onModeChange.emit('camera');
  }

  /**
   * Handle manual barcode submission
   */
  protected onManualSubmit() {
    const code = this.manualInput().trim();

    if (!code) return;

    if (!this.validateManualInput(code)) {
      return;
    }

    const result: ScanResult = {
      code,
      format: this.detectFormat(code) || 'qr',
      timestamp: new Date(),
      mode: 'manual',
    };

    if (this.beepSound()) {
      this.playBeep();
    }

    const scans = [result, ...this.recentScans()];
    this.recentScans.set(scans.slice(0, 10));

    this.onScan.emit(result);
    this.manualInput.set('');
  }

  /**
   * Validate manual input
   */
  private validateManualInput(code: string): boolean {
    const format = this.detectFormat(code);

    if (!format) {
      this.onError.emit({
        type: 'invalid-format',
        message: 'Unrecognized barcode format',
      });
      return false;
    }

    if (!this.formats().includes(format)) {
      this.onError.emit({
        type: 'invalid-format',
        message: `Format ${format} not allowed`,
      });
      return false;
    }

    return true;
  }

  /**
   * Detect barcode format from string
   */
  private detectFormat(code: string): BarcodeFormat | null {
    if (code.length === 13 && /^\d+$/.test(code)) {
      return 'ean13';
    }
    if (code.length === 8 && /^\d+$/.test(code)) {
      return 'ean8';
    }
    if (/^[A-Z0-9\-.$/+% ]+$/.test(code)) {
      return 'code128';
    }
    return null;
  }

  /**
   * Toggle flashlight
   */
  protected async toggleFlashlight() {
    const stream = this.currentStream();
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;

    if (!capabilities.torch) {
      this.onError.emit({
        type: 'camera-error',
        message: 'Flashlight not supported on this device',
      });
      return;
    }

    const enabled = !this.flashlightEnabled();
    await track.applyConstraints({
      advanced: [{ torch: enabled } as any],
    });
    this.flashlightEnabled.set(enabled);
  }

  /**
   * Get relative time for scan history
   */
  protected getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec} sec ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    return `${Math.floor(diffSec / 3600)} hr ago`;
  }
}
