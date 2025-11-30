/**
 * QR Code Types for AxQrCodeComponent
 *
 * Wrapper types for angularx-qrcode library
 * @see https://github.com/cordobo/angularx-qrcode
 */

// Error Correction Level
export type QRCodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

// Element Type (how QR code is rendered)
export type QRCodeElementType = 'canvas' | 'svg' | 'img';

// Size Presets
export type QRCodeSizePreset =
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'custom';

// Download Format
export type QRCodeDownloadFormat = 'png' | 'svg' | 'jpeg';

// Preset Templates
export type QRCodePresetType =
  | 'url'
  | 'vcard'
  | 'wifi'
  | 'email'
  | 'sms'
  | 'phone'
  | 'text';

// vCard Contact Data
export interface VCardData {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  website?: string;
  note?: string;
}

// WiFi Network Data
export interface WiFiData {
  ssid: string;
  password?: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

// Email Data
export interface EmailData {
  to: string;
  subject?: string;
  body?: string;
}

// SMS Data
export interface SMSData {
  phone: string;
  message?: string;
}

// Component Configuration
export interface AxQrCodeConfig {
  // Core settings
  data: string;
  size?: number;
  sizePreset?: QRCodeSizePreset;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  elementType?: QRCodeElementType;

  // Styling
  colorDark?: string;
  colorLight?: string;
  margin?: number;

  // Features
  showDownload?: boolean;
  showCopy?: boolean;
  downloadFileName?: string;

  // Image/Logo in center
  imageSrc?: string;
  imageHeight?: number;
  imageWidth?: number;
}

// Size Preset Values (in pixels)
export const SIZE_PRESETS: Record<QRCodeSizePreset, number> = {
  small: 128,
  medium: 200,
  large: 256,
  xlarge: 400,
  custom: 200,
};

// Error Correction Level Descriptions
export const ERROR_CORRECTION_DESCRIPTIONS: Record<
  QRCodeErrorCorrectionLevel,
  string
> = {
  L: 'Low (~7% recovery)',
  M: 'Medium (~15% recovery)',
  Q: 'Quartile (~25% recovery)',
  H: 'High (~30% recovery)',
};
