# Barcode Scanner Component

A versatile barcode/QR code scanner component with camera support, manual input fallback, and multiple format detection.

## Features

- **Camera Scanning**: Real-time barcode detection using device camera (via @zxing/library)
- **Manual Input**: Fallback text input for manual barcode entry
- **Multi-Format Support**: QR, EAN-13, EAN-8, Code-128, Code-39, Data Matrix
- **Auto-Detection**: Automatic format detection from input
- **Continuous Scan Mode**: Option to scan multiple items sequentially
- **Flashlight Control**: Toggle device flashlight (if supported)
- **Recent Scans History**: Track last 10 scanned items
- **Audio Feedback**: Beep sound on successful scan
- **Responsive**: Works on mobile and desktop

## Installation

```typescript
import { AxBarcodeScannerComponent } from '@aegisx/ui';
```

**Dependencies:**

```bash
pnpm add @zxing/library
```

## Basic Usage

```html
<ax-barcode-scanner (onScan)="handleScan($event)" (onError)="handleError($event)" />
```

```typescript
handleScan(result: ScanResult) {
  console.log(`Scanned: ${result.code} (${result.format})`);
}

handleError(error: ScanError) {
  console.error(`Scan error: ${error.message}`);
}
```

## API Reference

### Inputs

| Property         | Type                             | Default                      | Description                                     |
| ---------------- | -------------------------------- | ---------------------------- | ----------------------------------------------- |
| `mode`           | `'camera' \| 'manual' \| 'auto'` | `'auto'`                     | Scanner mode (auto detects camera availability) |
| `formats`        | `BarcodeFormat[]`                | `['qr', 'ean13', 'code128']` | Allowed barcode formats                         |
| `continuousScan` | `boolean`                        | `false`                      | Enable continuous scanning mode                 |
| `beepSound`      | `boolean`                        | `true`                       | Play beep sound on successful scan              |
| `showHistory`    | `boolean`                        | `false`                      | Display recent scans list                       |
| `placeholder`    | `string`                         | `'Enter barcode...'`         | Placeholder for manual input field              |

### Outputs

| Event          | Type                   | Description                                  |
| -------------- | ---------------------- | -------------------------------------------- |
| `onScan`       | `ScanResult`           | Emitted when barcode is successfully scanned |
| `onError`      | `ScanError`            | Emitted when an error occurs                 |
| `onModeChange` | `'camera' \| 'manual'` | Emitted when scanner mode changes            |

### Types

```typescript
export type BarcodeFormat = 'qr' | 'ean13' | 'ean8' | 'code128' | 'code39' | 'datamatrix';
export type ScannerMode = 'camera' | 'manual' | 'auto';

export interface ScanResult {
  code: string; // Scanned barcode value
  format: BarcodeFormat; // Detected format
  timestamp: Date; // Scan timestamp
  mode: 'camera' | 'manual'; // How it was scanned
}

export interface ScanError {
  type: 'permission-denied' | 'invalid-format' | 'camera-error' | 'timeout';
  message: string;
}
```

## Examples

### Camera Mode Only

```html
<ax-barcode-scanner mode="camera" [formats]="['qr', 'ean13']" (onScan)="addItemToCart($event)" />
```

### Manual Input Only (for Desktop)

```html
<ax-barcode-scanner mode="manual" placeholder="Scan or type barcode..." (onScan)="lookupProduct($event)" />
```

### Continuous Scanning (Stock Receive)

```html
<ax-barcode-scanner [continuousScan]="true" [showHistory]="true" [beepSound]="true" (onScan)="addToReceiveList($event)" />
```

```typescript
receiveList: ScanResult[] = [];

addToReceiveList(result: ScanResult) {
  this.receiveList.push(result);
  console.log(`Total items scanned: ${this.receiveList.length}`);
}
```

### Format Validation

```html
<ax-barcode-scanner [formats]="['ean13']" (onScan)="validateProduct($event)" (onError)="showFormatError($event)" />
```

```typescript
validateProduct(result: ScanResult) {
  if (result.format !== 'ean13') {
    alert('Only EAN-13 barcodes are accepted');
    return;
  }
  this.fetchProductDetails(result.code);
}
```

### With Flashlight Toggle

```html
<ax-barcode-scanner mode="camera" (onScan)="handleScan($event)" />

<!-- Flashlight toggle button (component provides method) -->
<button (click)="scanner.toggleFlashlight()">Toggle Flashlight</button>
```

## Camera Permissions

The component requests camera permissions automatically. Handle permission denial:

```typescript
handleError(error: ScanError) {
  if (error.type === 'permission-denied') {
    alert('Please enable camera access to scan barcodes');
    // Component automatically falls back to manual mode
  }
}
```

## Barcode Format Detection

### Automatic Detection (Manual Input)

When users type a barcode manually, the component auto-detects the format:

- **EAN-13**: 13 digits (e.g., `8850999320113`)
- **EAN-8**: 8 digits (e.g., `12345678`)
- **Code-128**: Alphanumeric with special characters

### Camera Detection (ZXing)

Camera mode uses ZXing library for multi-format detection. Supported formats:

- QR Code
- EAN-13, EAN-8
- Code-128, Code-39
- Data Matrix
- And more...

## Best Practices

1. **Mobile-First**: Always test on actual mobile devices (camera quality varies)
2. **Lighting**: Ensure good lighting for camera scanning
3. **Format Restrictions**: Limit `formats` to only what your system accepts
4. **Continuous Mode**: Use for bulk operations (receiving, counting)
5. **Error Handling**: Always implement `onError` handler
6. **Fallback**: Keep manual input enabled for problematic barcodes

## Accessibility

- **Keyboard**: Manual input is fully keyboard accessible
- **Screen Readers**: Announces scan results via `aria-live`
- **Labels**: Proper form labels and ARIA attributes
- **Focus Management**: Auto-focus on manual input when mode switches

## Performance

- **Camera Init**: ~500ms average
- **Scan Detection**: ~100-300ms per scan
- **Bundle Size**: ~25KB (gzipped, ZXing lazy loaded)

## Troubleshooting

### Camera Not Working

1. Check HTTPS (required for camera access)
2. Verify camera permissions in browser settings
3. Test on different devices/browsers
4. Check for camera usage by other apps

### Scan Not Detecting

1. Improve lighting conditions
2. Hold camera steady
3. Ensure barcode is in focus
4. Try different barcode formats
5. Clean camera lens

### Manual Input Not Validating

1. Check `formats` configuration
2. Verify barcode format matches expected pattern
3. Check for leading/trailing spaces

## Related Components

- **AxQuantityInputComponent**: For entering quantities after scan
- **AxBatchSelectorComponent**: For selecting batch after product scan
- **AxStockLevelComponent**: For displaying scanned product stock

## Browser Support

- Chrome/Edge 90+ (camera + manual)
- Firefox 88+ (camera + manual)
- Safari 14+ (camera + manual)
- iOS Safari 14+ (camera + manual)
- Android Chrome 90+ (camera + manual)

**Note**: Camera access requires HTTPS (except localhost).
