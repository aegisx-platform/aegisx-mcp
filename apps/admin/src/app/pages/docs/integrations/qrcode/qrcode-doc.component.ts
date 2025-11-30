import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { QRCodeComponent } from 'angularx-qrcode';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
} from '../../../../components/docs';
import { CodeTab } from '../../../../types/docs.types';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type ElementType = 'canvas' | 'svg' | 'img';

@Component({
  selector: 'ax-qrcode-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    QRCodeComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="qrcode-doc">
      <ax-doc-header
        title="QR Code"
        icon="qr_code"
        description="Generate QR codes for URLs, text, and data. Powered by angularx-qrcode library."
        [breadcrumbs]="[
          { label: 'Integrations', link: '/docs/integrations/overview' },
          { label: 'QR Code' },
        ]"
        status="stable"
        version="20.0.0"
        importStatement="import { QRCodeComponent } from 'angularx-qrcode';"
      ></ax-doc-header>

      <!-- Library Reference -->
      <div class="library-reference">
        <mat-icon>info</mat-icon>
        <span>
          This integration uses
          <a
            href="https://github.com/cordobo/angularx-qrcode"
            target="_blank"
            rel="noopener"
          >
            angularx-qrcode
          </a>
          library by Andreas Jacob (MIT License)
        </span>
      </div>

      <mat-tab-group class="qrcode-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="qrcode-doc__tab-content">
            <section class="qrcode-doc__section">
              <h2>Interactive Demo</h2>
              <p>
                Try changing the options below to see how QR codes are
                generated.
              </p>

              <div class="demo-container">
                <div class="demo-preview">
                  <ax-live-preview variant="bordered">
                    <qrcode
                      [qrdata]="qrData()"
                      [width]="qrWidth()"
                      [errorCorrectionLevel]="errorLevel()"
                      [elementType]="elementType()"
                      [margin]="margin()"
                      [colorDark]="colorDark()"
                      [colorLight]="colorLight()"
                    ></qrcode>
                  </ax-live-preview>
                </div>

                <div class="demo-controls">
                  <mat-form-field appearance="outline">
                    <mat-label>QR Data</mat-label>
                    <input
                      matInput
                      [ngModel]="qrData()"
                      (ngModelChange)="qrData.set($event)"
                      placeholder="Enter text or URL"
                    />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Width (px)</mat-label>
                    <input
                      matInput
                      type="number"
                      [ngModel]="qrWidth()"
                      (ngModelChange)="qrWidth.set($event)"
                      min="50"
                      max="500"
                    />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Error Correction</mat-label>
                    <mat-select
                      [ngModel]="errorLevel()"
                      (ngModelChange)="errorLevel.set($event)"
                    >
                      <mat-option value="L">L - Low (7%)</mat-option>
                      <mat-option value="M">M - Medium (15%)</mat-option>
                      <mat-option value="Q">Q - Quartile (25%)</mat-option>
                      <mat-option value="H">H - High (30%)</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Element Type</mat-label>
                    <mat-select
                      [ngModel]="elementType()"
                      (ngModelChange)="elementType.set($event)"
                    >
                      <mat-option value="canvas">Canvas</mat-option>
                      <mat-option value="svg">SVG</mat-option>
                      <mat-option value="img">Image</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Margin</mat-label>
                    <input
                      matInput
                      type="number"
                      [ngModel]="margin()"
                      (ngModelChange)="margin.set($event)"
                      min="0"
                      max="10"
                    />
                  </mat-form-field>

                  <div class="color-inputs">
                    <div class="color-input">
                      <label>Dark Color</label>
                      <input
                        type="color"
                        [ngModel]="colorDark()"
                        (ngModelChange)="colorDark.set($event)"
                      />
                    </div>
                    <div class="color-input">
                      <label>Light Color</label>
                      <input
                        type="color"
                        [ngModel]="colorLight()"
                        (ngModelChange)="colorLight.set($event)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="qrcode-doc__section">
              <h2>Features</h2>
              <div class="features-grid">
                <div class="feature-card">
                  <mat-icon>speed</mat-icon>
                  <h4>Lightweight</h4>
                  <p>Fast generation with minimal bundle size impact</p>
                </div>
                <div class="feature-card">
                  <mat-icon>palette</mat-icon>
                  <h4>Customizable</h4>
                  <p>Custom colors, sizes, margins, and element types</p>
                </div>
                <div class="feature-card">
                  <mat-icon>verified</mat-icon>
                  <h4>Error Correction</h4>
                  <p>4 levels of error correction for reliability</p>
                </div>
                <div class="feature-card">
                  <mat-icon>download</mat-icon>
                  <h4>Downloadable</h4>
                  <p>Get QR code as data URL for saving</p>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="qrcode-doc__tab-content">
            <section class="qrcode-doc__section">
              <h2>Common Use Cases</h2>

              <div class="examples-grid">
                <!-- URL QR Code -->
                <div class="example-card">
                  <h4>Website URL</h4>
                  <ax-live-preview variant="bordered">
                    <qrcode
                      qrdata="https://aegisx.io"
                      [width]="150"
                      errorCorrectionLevel="M"
                    ></qrcode>
                  </ax-live-preview>
                  <p>Share website links</p>
                </div>

                <!-- vCard QR Code -->
                <div class="example-card">
                  <h4>Contact Info</h4>
                  <ax-live-preview variant="bordered">
                    <qrcode
                      [qrdata]="vcardData"
                      [width]="150"
                      errorCorrectionLevel="M"
                    ></qrcode>
                  </ax-live-preview>
                  <p>Share contact information</p>
                </div>

                <!-- WiFi QR Code -->
                <div class="example-card">
                  <h4>WiFi Network</h4>
                  <ax-live-preview variant="bordered">
                    <qrcode
                      [qrdata]="wifiData"
                      [width]="150"
                      errorCorrectionLevel="H"
                    ></qrcode>
                  </ax-live-preview>
                  <p>Share WiFi credentials</p>
                </div>

                <!-- Custom Colors -->
                <div class="example-card">
                  <h4>Custom Colors</h4>
                  <ax-live-preview variant="bordered">
                    <qrcode
                      qrdata="Custom styled QR"
                      [width]="150"
                      colorDark="#6366f1"
                      colorLight="#f0f0ff"
                    ></qrcode>
                  </ax-live-preview>
                  <p>Brand-colored QR codes</p>
                </div>
              </div>

              <ax-code-tabs [tabs]="examplesCode"></ax-code-tabs>
            </section>

            <section class="qrcode-doc__section">
              <h2>Download QR Code</h2>
              <p>
                Use the <code>qrCodeURL</code> output to get the generated image
                URL for downloading.
              </p>
              <ax-code-tabs [tabs]="downloadCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="qrcode-doc__tab-content">
            <section class="qrcode-doc__section">
              <h2>Inputs</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>qrdata</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>The data to encode in the QR code (required)</td>
                    </tr>
                    <tr>
                      <td><code>width</code></td>
                      <td>number</td>
                      <td>256</td>
                      <td>Width of the QR code in pixels</td>
                    </tr>
                    <tr>
                      <td><code>errorCorrectionLevel</code></td>
                      <td>'L' | 'M' | 'Q' | 'H'</td>
                      <td>'M'</td>
                      <td>Error correction level</td>
                    </tr>
                    <tr>
                      <td><code>elementType</code></td>
                      <td>'canvas' | 'svg' | 'img'</td>
                      <td>'canvas'</td>
                      <td>Output element type</td>
                    </tr>
                    <tr>
                      <td><code>margin</code></td>
                      <td>number</td>
                      <td>4</td>
                      <td>Quiet zone margin around QR code</td>
                    </tr>
                    <tr>
                      <td><code>colorDark</code></td>
                      <td>string</td>
                      <td>'#000000'</td>
                      <td>Color of dark modules</td>
                    </tr>
                    <tr>
                      <td><code>colorLight</code></td>
                      <td>string</td>
                      <td>'#ffffff'</td>
                      <td>Color of light modules</td>
                    </tr>
                    <tr>
                      <td><code>imageSrc</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>URL of image to overlay on QR code center</td>
                    </tr>
                    <tr>
                      <td><code>imageHeight</code></td>
                      <td>number</td>
                      <td>-</td>
                      <td>Height of overlay image</td>
                    </tr>
                    <tr>
                      <td><code>imageWidth</code></td>
                      <td>number</td>
                      <td>-</td>
                      <td>Width of overlay image</td>
                    </tr>
                    <tr>
                      <td><code>alt</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Alt text for accessibility</td>
                    </tr>
                    <tr>
                      <td><code>ariaLabel</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>ARIA label for accessibility</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="qrcode-doc__section">
              <h2>Outputs</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>qrCodeURL</code></td>
                      <td>EventEmitter&lt;string&gt;</td>
                      <td>
                        Emits the generated QR code as a data URL (base64
                        encoded)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="qrcode-doc__section">
              <h2>Error Correction Levels</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Recovery Capacity</th>
                      <th>Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>L</code></td>
                      <td>~7%</td>
                      <td>Best for clean environments, smallest QR size</td>
                    </tr>
                    <tr>
                      <td><code>M</code></td>
                      <td>~15%</td>
                      <td>Standard use, good balance</td>
                    </tr>
                    <tr>
                      <td><code>Q</code></td>
                      <td>~25%</td>
                      <td>Outdoor/industrial environments</td>
                    </tr>
                    <tr>
                      <td><code>H</code></td>
                      <td>~30%</td>
                      <td>Required when adding logo overlay</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .qrcode-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .library-reference {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--ax-info-faint);
        border: 1px solid var(--ax-info-default);
        border-radius: var(--ax-radius-lg);
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
        color: var(--ax-text-secondary);

        mat-icon {
          color: var(--ax-info-default);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        a {
          color: var(--ax-info-default);
          font-weight: 500;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .qrcode-doc__tabs {
        margin-top: 1rem;
      }

      .qrcode-doc__tab-content {
        padding: 1.5rem 0;
      }

      .qrcode-doc__section {
        margin-bottom: 3rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        code {
          background: var(--ax-background-subtle);
          padding: 0.125rem 0.375rem;
          border-radius: var(--ax-radius-sm);
          font-size: 0.875rem;
        }
      }

      .demo-container {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 2rem;
        margin-bottom: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .demo-preview {
        display: flex;
        justify-content: center;
        align-items: center;

        ax-live-preview {
          width: 100%;
        }

        qrcode {
          display: flex;
          justify-content: center;
        }
      }

      .demo-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        mat-form-field {
          width: 100%;
        }
      }

      .color-inputs {
        display: flex;
        gap: 1.5rem;
      }

      .color-input {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }

        input[type='color'] {
          width: 60px;
          height: 36px;
          border: 1px solid var(--ax-border-default);
          border-radius: var(--ax-radius-md);
          cursor: pointer;
          padding: 2px;
        }
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .feature-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.5rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--ax-primary-default);
        }

        h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          line-height: 1.5;
        }
      }

      .examples-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .example-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);

        h4 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        ax-live-preview {
          display: flex;
          justify-content: center;
        }

        qrcode {
          display: flex;
          justify-content: center;
        }

        p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--ax-text-muted);
          text-align: center;
        }
      }

      .api-table {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;

          th,
          td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--ax-border-default);
          }

          th {
            font-weight: 600;
            color: var(--ax-text-heading);
            background: var(--ax-background-subtle);
          }

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: var(--ax-radius-sm);
            font-size: 0.8125rem;
          }
        }
      }
    `,
  ],
})
export class QRCodeDocComponent {
  // Demo state
  qrData = signal('https://aegisx.io');
  qrWidth = signal(200);
  errorLevel = signal<ErrorCorrectionLevel>('M');
  elementType = signal<ElementType>('canvas');
  margin = signal(4);
  colorDark = signal('#000000');
  colorLight = signal('#ffffff');

  // Example data
  vcardData = `BEGIN:VCARD
VERSION:3.0
N:Doe;John
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
END:VCARD`;

  wifiData = 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;';

  // Code examples
  readonly basicUsageCode: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<qrcode
  [qrdata]="'https://aegisx.io'"
  [width]="200"
  [errorCorrectionLevel]="'M'"
  [elementType]="'canvas'"
  [margin]="4"
  [colorDark]="'#000000'"
  [colorLight]="'#ffffff'"
></qrcode>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'my-component',
  standalone: true,
  imports: [QRCodeComponent],
  template: \`
    <qrcode
      [qrdata]="qrData"
      [width]="200"
      errorCorrectionLevel="M"
    ></qrcode>
  \`
})
export class MyComponent {
  qrData = 'https://aegisx.io';
}`,
    },
  ];

  readonly examplesCode: CodeTab[] = [
    {
      label: 'URL',
      language: 'html',
      code: `<!-- Website URL -->
<qrcode
  qrdata="https://aegisx.io"
  [width]="150"
  errorCorrectionLevel="M"
></qrcode>`,
    },
    {
      label: 'vCard',
      language: 'typescript',
      code: `// Contact information (vCard format)
vcardData = \`BEGIN:VCARD
VERSION:3.0
N:Doe;John
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
END:VCARD\`;

// In template:
// <qrcode [qrdata]="vcardData" [width]="150"></qrcode>`,
    },
    {
      label: 'WiFi',
      language: 'typescript',
      code: `// WiFi network credentials
// Format: WIFI:T:<auth-type>;S:<ssid>;P:<password>;;
wifiData = 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;';

// In template:
// <qrcode [qrdata]="wifiData" [width]="150" errorCorrectionLevel="H"></qrcode>`,
    },
    {
      label: 'Custom Colors',
      language: 'html',
      code: `<!-- Brand-colored QR code -->
<qrcode
  qrdata="Custom styled QR"
  [width]="150"
  colorDark="#6366f1"
  colorLight="#f0f0ff"
></qrcode>`,
    },
  ];

  readonly downloadCode: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<qrcode
  [qrdata]="qrData"
  [width]="200"
  (qrCodeURL)="onQrCodeGenerated($event)"
></qrcode>

<button mat-raised-button (click)="downloadQR()">
  <mat-icon>download</mat-icon>
  Download QR Code
</button>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component } from '@angular/core';

@Component({ ... })
export class MyComponent {
  qrData = 'https://aegisx.io';
  qrCodeUrl: string = '';

  onQrCodeGenerated(url: string) {
    this.qrCodeUrl = url;
  }

  downloadQR() {
    if (!this.qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = 'qrcode.png';
    link.click();
  }
}`,
    },
  ];
}
