import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QRCodeComponent } from 'angularx-qrcode';

import {
  QRCodeErrorCorrectionLevel,
  QRCodeElementType,
  QRCodeSizePreset,
  QRCodeDownloadFormat,
  VCardData,
  WiFiData,
  EmailData,
  SMSData,
  SIZE_PRESETS,
} from './ax-qrcode.types';

/**
 * AegisX QR Code Component
 *
 * A feature-rich wrapper around angularx-qrcode library providing:
 * - Preset templates (vCard, WiFi, Email, SMS, Phone, URL)
 * - Download functionality (PNG, SVG, JPEG)
 * - Copy to clipboard
 * - Size presets
 * - Theming support
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <ax-qrcode [data]="'https://aegisx.io'" />
 *
 * <!-- With download button -->
 * <ax-qrcode
 *   [data]="'https://aegisx.io'"
 *   [showDownload]="true"
 *   downloadFileName="my-qrcode"
 * />
 *
 * <!-- vCard preset -->
 * <ax-qrcode
 *   [vCard]="{ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }"
 * />
 *
 * <!-- WiFi preset -->
 * <ax-qrcode
 *   [wifi]="{ ssid: 'MyNetwork', password: 'secret123', security: 'WPA' }"
 * />
 *
 * <!-- Custom styling -->
 * <ax-qrcode
 *   [data]="'Hello World'"
 *   colorDark="#1976d2"
 *   colorLight="#ffffff"
 *   sizePreset="large"
 * />
 * ```
 *
 * @see https://github.com/cordobo/angularx-qrcode
 */
@Component({
  selector: 'ax-qrcode',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    QRCodeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ax-qrcode"
      [class.ax-qrcode--with-actions]="showDownload || showCopy"
    >
      <div #qrcodeContainer class="ax-qrcode__container">
        <qrcode
          [qrdata]="qrData()"
          [width]="computedSize()"
          [errorCorrectionLevel]="errorCorrectionLevel"
          [elementType]="elementType"
          [colorDark]="colorDark"
          [colorLight]="colorLight"
          [margin]="margin"
          [imageSrc]="imageSrc"
          [imageHeight]="imageHeight"
          [imageWidth]="imageWidth"
        />
      </div>

      @if (showDownload || showCopy) {
        <div class="ax-qrcode__actions">
          @if (showCopy) {
            <button
              mat-icon-button
              (click)="copyToClipboard()"
              matTooltip="Copy QR data"
              class="ax-qrcode__action-btn"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          }
          @if (showDownload) {
            <button
              mat-icon-button
              (click)="download('png')"
              matTooltip="Download PNG"
              class="ax-qrcode__action-btn"
            >
              <mat-icon>download</mat-icon>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ax-qrcode {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .ax-qrcode__container {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        overflow: hidden;
        background: var(--mat-sys-surface, #ffffff);
      }

      .ax-qrcode__actions {
        display: flex;
        gap: 4px;
      }

      .ax-qrcode__action-btn {
        color: var(--mat-sys-on-surface-variant);
      }

      .ax-qrcode--with-actions .ax-qrcode__container {
        border: 1px solid var(--mat-sys-outline-variant);
        padding: 8px;
      }
    `,
  ],
})
export class AxQrCodeComponent {
  private platformId = inject(PLATFORM_ID);
  private snackBar = inject(MatSnackBar);

  @ViewChild('qrcodeContainer') qrcodeContainer!: ElementRef<HTMLDivElement>;

  // Core Data Inputs
  @Input() data = '';

  // Preset Templates
  @Input() vCard: VCardData | null = null;
  @Input() wifi: WiFiData | null = null;
  @Input() email: EmailData | null = null;
  @Input() sms: SMSData | null = null;
  @Input() phone: string | null = null;
  @Input() url: string | null = null;

  // Size Settings
  @Input() size = 200;
  @Input() sizePreset: QRCodeSizePreset = 'medium';

  // QR Code Settings
  @Input() errorCorrectionLevel: QRCodeErrorCorrectionLevel = 'M';
  @Input() elementType: QRCodeElementType = 'canvas';
  @Input() margin = 4;

  // Styling
  @Input() colorDark = '#000000';
  @Input() colorLight = '#ffffff';

  // Center Image/Logo
  @Input() imageSrc: string | undefined;
  @Input() imageHeight: number | undefined;
  @Input() imageWidth: number | undefined;

  // Features
  @Input() showDownload = false;
  @Input() showCopy = false;
  @Input() downloadFileName = 'qrcode';

  // Events
  @Output() downloaded = new EventEmitter<QRCodeDownloadFormat>();
  @Output() copied = new EventEmitter<string>();

  // Computed QR Data based on presets
  protected qrData = computed(() => {
    // Check presets in order of priority
    if (this.vCard) {
      return this.generateVCard(this.vCard);
    }
    if (this.wifi) {
      return this.generateWiFi(this.wifi);
    }
    if (this.email) {
      return this.generateEmail(this.email);
    }
    if (this.sms) {
      return this.generateSMS(this.sms);
    }
    if (this.phone) {
      return `tel:${this.phone}`;
    }
    if (this.url) {
      return this.url;
    }
    return this.data;
  });

  // Computed size from preset or custom
  protected computedSize = computed(() => {
    if (this.sizePreset === 'custom') {
      return this.size;
    }
    return SIZE_PRESETS[this.sizePreset];
  });

  // Generate vCard format
  private generateVCard(vcard: VCardData): string {
    const lines: string[] = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${vcard.lastName};${vcard.firstName}`,
      `FN:${vcard.firstName} ${vcard.lastName}`,
    ];

    if (vcard.organization) {
      lines.push(`ORG:${vcard.organization}`);
    }
    if (vcard.title) {
      lines.push(`TITLE:${vcard.title}`);
    }
    if (vcard.email) {
      lines.push(`EMAIL:${vcard.email}`);
    }
    if (vcard.phone) {
      lines.push(`TEL;TYPE=WORK:${vcard.phone}`);
    }
    if (vcard.mobile) {
      lines.push(`TEL;TYPE=CELL:${vcard.mobile}`);
    }
    if (vcard.address) {
      const addr = vcard.address;
      lines.push(
        `ADR:;;${addr.street || ''};${addr.city || ''};${addr.state || ''};${addr.postalCode || ''};${addr.country || ''}`,
      );
    }
    if (vcard.website) {
      lines.push(`URL:${vcard.website}`);
    }
    if (vcard.note) {
      lines.push(`NOTE:${vcard.note}`);
    }

    lines.push('END:VCARD');
    return lines.join('\n');
  }

  // Generate WiFi format
  private generateWiFi(wifi: WiFiData): string {
    const security = wifi.security === 'nopass' ? 'nopass' : wifi.security;
    const hidden = wifi.hidden ? 'H:true' : '';
    const password = wifi.password ? `P:${wifi.password}` : '';
    return `WIFI:T:${security};S:${wifi.ssid};${password};${hidden};`;
  }

  // Generate Email format
  private generateEmail(email: EmailData): string {
    let mailto = `mailto:${email.to}`;
    const params: string[] = [];
    if (email.subject) {
      params.push(`subject=${encodeURIComponent(email.subject)}`);
    }
    if (email.body) {
      params.push(`body=${encodeURIComponent(email.body)}`);
    }
    if (params.length > 0) {
      mailto += `?${params.join('&')}`;
    }
    return mailto;
  }

  // Generate SMS format
  private generateSMS(sms: SMSData): string {
    let smsto = `sms:${sms.phone}`;
    if (sms.message) {
      smsto += `?body=${encodeURIComponent(sms.message)}`;
    }
    return smsto;
  }

  // Download QR Code as image
  download(format: QRCodeDownloadFormat = 'png'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const container = this.qrcodeContainer?.nativeElement;
    if (!container) return;

    const canvas = container.querySelector('canvas');
    const svg = container.querySelector('svg');
    const img = container.querySelector('img');

    let dataUrl: string | null = null;

    if (canvas) {
      dataUrl = canvas.toDataURL(`image/${format === 'svg' ? 'png' : format}`);
    } else if (svg && format === 'svg') {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      dataUrl =
        'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    } else if (img) {
      dataUrl = img.src;
    }

    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `${this.downloadFileName}.${format}`;
      link.href = dataUrl;
      link.click();
      this.downloaded.emit(format);
    }
  }

  // Copy QR data to clipboard
  async copyToClipboard(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await navigator.clipboard.writeText(this.qrData());
      this.snackBar.open('Copied to clipboard', 'OK', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
      this.copied.emit(this.qrData());
    } catch {
      this.snackBar.open('Failed to copy', 'OK', {
        duration: 2000,
      });
    }
  }

  // Static helper methods for generating preset data
  static createVCardData(data: VCardData): string {
    const component = new AxQrCodeComponent();
    return component['generateVCard'](data);
  }

  static createWiFiData(data: WiFiData): string {
    const component = new AxQrCodeComponent();
    return component['generateWiFi'](data);
  }

  static createEmailData(data: EmailData): string {
    const component = new AxQrCodeComponent();
    return component['generateEmail'](data);
  }

  static createSMSData(data: SMSData): string {
    const component = new AxQrCodeComponent();
    return component['generateSMS'](data);
  }

  static createPhoneData(phone: string): string {
    return `tel:${phone}`;
  }
}
