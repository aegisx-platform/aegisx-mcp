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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { QRCodeComponent } from 'angularx-qrcode';
import { AxQrCodeComponent, VCardData, WiFiData } from '@aegisx/ui';
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
    MatButtonToggleModule,
    QRCodeComponent,
    AxQrCodeComponent,
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
        importStatement="import { AxQrCodeComponent } from '@aegisx/ui';"
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

      <!-- Usage Toggle -->
      <div class="usage-toggle">
        <mat-button-toggle-group
          [value]="usageMode()"
          (change)="usageMode.set($event.value)"
        >
          <mat-button-toggle value="wrapper">
            <mat-icon>auto_awesome</mat-icon>
            AegisX Wrapper (Recommended)
          </mat-button-toggle>
          <mat-button-toggle value="direct">
            <mat-icon>code</mat-icon>
            Direct Library
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <mat-tab-group class="qrcode-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="qrcode-doc__tab-content">
            @if (usageMode() === 'wrapper') {
              <!-- AegisX Wrapper Section -->
              <section class="qrcode-doc__section">
                <h2>AegisX QR Code Wrapper</h2>
                <p>
                  The <code>ax-qrcode</code> component provides additional
                  features on top of angularx-qrcode: preset templates, download
                  functionality, copy to clipboard, and more.
                </p>

                <div class="demo-container">
                  <div class="demo-preview">
                    <ax-live-preview variant="bordered">
                      <ax-qrcode
                        [data]="qrData()"
                        [sizePreset]="wrapperSizePreset()"
                        [colorDark]="colorDark()"
                        [colorLight]="colorLight()"
                        [showDownload]="true"
                        [showCopy]="true"
                        downloadFileName="aegisx-qr"
                      />
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
                      <mat-label>Size Preset</mat-label>
                      <mat-select
                        [ngModel]="wrapperSizePreset()"
                        (ngModelChange)="wrapperSizePreset.set($event)"
                      >
                        <mat-option value="small">Small (128px)</mat-option>
                        <mat-option value="medium">Medium (200px)</mat-option>
                        <mat-option value="large">Large (256px)</mat-option>
                        <mat-option value="xlarge">XLarge (400px)</mat-option>
                      </mat-select>
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

                <ax-code-tabs [tabs]="wrapperUsageCode"></ax-code-tabs>
              </section>

              <section class="qrcode-doc__section">
                <h2>Preset Templates</h2>
                <p>
                  Use built-in presets to generate common QR code types without
                  manually formatting the data.
                </p>

                <div class="examples-grid">
                  <!-- vCard -->
                  <div class="example-card">
                    <h4>vCard Contact</h4>
                    <ax-live-preview variant="bordered">
                      <ax-qrcode [vCard]="sampleVCard" sizePreset="small" />
                    </ax-live-preview>
                    <p>Share contact info</p>
                  </div>

                  <!-- WiFi -->
                  <div class="example-card">
                    <h4>WiFi Network</h4>
                    <ax-live-preview variant="bordered">
                      <ax-qrcode [wifi]="sampleWifi" sizePreset="small" />
                    </ax-live-preview>
                    <p>Share WiFi credentials</p>
                  </div>

                  <!-- Email -->
                  <div class="example-card">
                    <h4>Email</h4>
                    <ax-live-preview variant="bordered">
                      <ax-qrcode
                        [email]="{ to: 'hello@aegisx.io', subject: 'Hello' }"
                        sizePreset="small"
                      />
                    </ax-live-preview>
                    <p>Compose email</p>
                  </div>

                  <!-- Phone -->
                  <div class="example-card">
                    <h4>Phone Call</h4>
                    <ax-live-preview variant="bordered">
                      <ax-qrcode phone="+1234567890" sizePreset="small" />
                    </ax-live-preview>
                    <p>Quick dial number</p>
                  </div>
                </div>

                <ax-code-tabs [tabs]="presetsCode"></ax-code-tabs>
              </section>
            } @else {
              <!-- Direct Library Section -->
              <section class="qrcode-doc__section">
                <h2>Interactive Demo (Direct Library)</h2>
                <p>
                  Try changing the options below to see how QR codes are
                  generated using the library directly.
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
            }

            <section class="qrcode-doc__section">
              <h2>Features Comparison</h2>
              <div class="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>AegisX Wrapper</th>
                      <th>Direct Library</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Basic QR generation</td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                    </tr>
                    <tr>
                      <td>Custom colors</td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                    </tr>
                    <tr>
                      <td>Size presets</td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                      <td><mat-icon class="cross">cancel</mat-icon></td>
                    </tr>
                    <tr>
                      <td>vCard preset</td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                      <td>
                        <mat-icon class="cross">cancel</mat-icon> (manual)
                      </td>
                    </tr>
                    <tr>
                      <td>WiFi preset</td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                      <td>
                        <mat-icon class="cross">cancel</mat-icon> (manual)
                      </td>
                    </tr>
                    <tr>
                      <td>Email/SMS/Phone presets</td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                      <td>
                        <mat-icon class="cross">cancel</mat-icon> (manual)
                      </td>
                    </tr>
                    <tr>
                      <td>Built-in download</td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                      <td>
                        <mat-icon class="cross">cancel</mat-icon> (manual)
                      </td>
                    </tr>
                    <tr>
                      <td>Copy to clipboard</td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                      <td><mat-icon class="cross">cancel</mat-icon></td>
                    </tr>
                    <tr>
                      <td>Center image/logo</td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                      <td><mat-icon class="check">check_circle</mat-icon></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="qrcode-doc__tab-content">
            @if (usageMode() === 'wrapper') {
              <section class="qrcode-doc__section">
                <h2>Wrapper Examples</h2>

                <div class="examples-grid">
                  <!-- With Download -->
                  <div class="example-card">
                    <h4>With Download</h4>
                    <ax-live-preview variant="bordered">
                      <ax-qrcode
                        data="https://aegisx.io"
                        sizePreset="small"
                        [showDownload]="true"
                      />
                    </ax-live-preview>
                    <p>Download as PNG</p>
                  </div>

                  <!-- With Copy -->
                  <div class="example-card">
                    <h4>With Copy</h4>
                    <ax-live-preview variant="bordered">
                      <ax-qrcode
                        data="Copy this text!"
                        sizePreset="small"
                        [showCopy]="true"
                      />
                    </ax-live-preview>
                    <p>Copy QR data</p>
                  </div>

                  <!-- Custom Colors -->
                  <div class="example-card">
                    <h4>Custom Colors</h4>
                    <ax-live-preview variant="bordered">
                      <ax-qrcode
                        data="Styled QR"
                        sizePreset="small"
                        colorDark="#6366f1"
                        colorLight="#f0f0ff"
                      />
                    </ax-live-preview>
                    <p>Brand colors</p>
                  </div>

                  <!-- SMS -->
                  <div class="example-card">
                    <h4>SMS Message</h4>
                    <ax-live-preview variant="bordered">
                      <ax-qrcode
                        [sms]="{ phone: '+1234567890', message: 'Hello!' }"
                        sizePreset="small"
                      />
                    </ax-live-preview>
                    <p>Pre-filled SMS</p>
                  </div>
                </div>

                <ax-code-tabs [tabs]="wrapperExamplesCode"></ax-code-tabs>
              </section>
            } @else {
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
                  Use the <code>qrCodeURL</code> output to get the generated
                  image URL for downloading.
                </p>
                <ax-code-tabs [tabs]="downloadCode"></ax-code-tabs>
              </section>
            }
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="qrcode-doc__tab-content">
            @if (usageMode() === 'wrapper') {
              <section class="qrcode-doc__section">
                <h2>AxQrCodeComponent API</h2>
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
                        <td><code>data</code></td>
                        <td>string</td>
                        <td>''</td>
                        <td>Raw data to encode</td>
                      </tr>
                      <tr>
                        <td><code>vCard</code></td>
                        <td>VCardData</td>
                        <td>null</td>
                        <td>Contact information preset</td>
                      </tr>
                      <tr>
                        <td><code>wifi</code></td>
                        <td>WiFiData</td>
                        <td>null</td>
                        <td>WiFi network preset</td>
                      </tr>
                      <tr>
                        <td><code>email</code></td>
                        <td>EmailData</td>
                        <td>null</td>
                        <td>Email preset (to, subject, body)</td>
                      </tr>
                      <tr>
                        <td><code>sms</code></td>
                        <td>SMSData</td>
                        <td>null</td>
                        <td>SMS preset (phone, message)</td>
                      </tr>
                      <tr>
                        <td><code>phone</code></td>
                        <td>string</td>
                        <td>null</td>
                        <td>Phone number for tel: link</td>
                      </tr>
                      <tr>
                        <td><code>sizePreset</code></td>
                        <td>
                          'small' | 'medium' | 'large' | 'xlarge' | 'custom'
                        </td>
                        <td>'medium'</td>
                        <td>Predefined size options</td>
                      </tr>
                      <tr>
                        <td><code>size</code></td>
                        <td>number</td>
                        <td>200</td>
                        <td>Custom size when sizePreset is 'custom'</td>
                      </tr>
                      <tr>
                        <td><code>colorDark</code></td>
                        <td>string</td>
                        <td>'#000000'</td>
                        <td>Dark module color</td>
                      </tr>
                      <tr>
                        <td><code>colorLight</code></td>
                        <td>string</td>
                        <td>'#ffffff'</td>
                        <td>Light module color</td>
                      </tr>
                      <tr>
                        <td><code>showDownload</code></td>
                        <td>boolean</td>
                        <td>false</td>
                        <td>Show download button</td>
                      </tr>
                      <tr>
                        <td><code>showCopy</code></td>
                        <td>boolean</td>
                        <td>false</td>
                        <td>Show copy to clipboard button</td>
                      </tr>
                      <tr>
                        <td><code>downloadFileName</code></td>
                        <td>string</td>
                        <td>'qrcode'</td>
                        <td>Filename for downloaded image</td>
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
                        <td><code>downloaded</code></td>
                        <td>EventEmitter&lt;'png' | 'svg' | 'jpeg'&gt;</td>
                        <td>Emitted when QR code is downloaded</td>
                      </tr>
                      <tr>
                        <td><code>copied</code></td>
                        <td>EventEmitter&lt;string&gt;</td>
                        <td>Emitted when QR data is copied</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            } @else {
              <section class="qrcode-doc__section">
                <h2>QRCodeComponent API (Direct Library)</h2>
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
            }

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
        background: var(--mat-sys-secondary-container);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: var(--mat-sys-on-secondary-container);

        mat-icon {
          color: var(--mat-sys-secondary);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        a {
          color: var(--mat-sys-primary);
          font-weight: 500;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .usage-toggle {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;

        mat-button-toggle-group {
          border-radius: 12px;
          overflow: hidden;
        }

        mat-button-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
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
          color: var(--mat-sys-on-surface);
          margin-bottom: 0.75rem;
        }

        p {
          color: var(--mat-sys-on-surface-variant);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        code {
          background: var(--mat-sys-surface-container);
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
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

        qrcode,
        ax-qrcode {
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
          color: var(--mat-sys-on-surface-variant);
        }

        input[type='color'] {
          width: 60px;
          height: 36px;
          border: 1px solid var(--mat-sys-outline-variant);
          border-radius: 8px;
          cursor: pointer;
          padding: 2px;
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
        background: var(--mat-sys-surface-container-low);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;

        h4 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--mat-sys-on-surface);
        }

        ax-live-preview {
          display: flex;
          justify-content: center;
        }

        qrcode,
        ax-qrcode {
          display: flex;
          justify-content: center;
        }

        p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--mat-sys-on-surface-variant);
          text-align: center;
        }
      }

      .comparison-table,
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
            border-bottom: 1px solid var(--mat-sys-outline-variant);
          }

          th {
            font-weight: 600;
            color: var(--mat-sys-on-surface);
            background: var(--mat-sys-surface-container);
          }

          code {
            background: var(--mat-sys-surface-container);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-size: 0.8125rem;
          }

          mat-icon.check {
            color: var(--mat-sys-primary);
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          mat-icon.cross {
            color: var(--mat-sys-outline);
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      }
    `,
  ],
})
export class QRCodeDocComponent {
  // Usage mode toggle
  usageMode = signal<'wrapper' | 'direct'>('wrapper');

  // Demo state
  qrData = signal('https://aegisx.io');
  qrWidth = signal(200);
  errorLevel = signal<ErrorCorrectionLevel>('M');
  elementType = signal<ElementType>('canvas');
  margin = signal(4);
  colorDark = signal('#000000');
  colorLight = signal('#ffffff');
  wrapperSizePreset = signal<'small' | 'medium' | 'large' | 'xlarge'>('medium');

  // Sample preset data
  sampleVCard: VCardData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    organization: 'AegisX',
  };

  sampleWifi: WiFiData = {
    ssid: 'MyNetwork',
    password: 'MyPassword',
    security: 'WPA',
  };

  // Example data for direct library
  vcardData = `BEGIN:VCARD
VERSION:3.0
N:Doe;John
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
END:VCARD`;

  wifiData = 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;';

  // Wrapper usage code
  readonly wrapperUsageCode: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<!-- Basic usage with wrapper -->
<ax-qrcode
  [data]="'https://aegisx.io'"
  sizePreset="medium"
  [showDownload]="true"
  [showCopy]="true"
/>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component } from '@angular/core';
import { AxQrCodeComponent } from '@aegisx/ui';

@Component({
  selector: 'my-component',
  standalone: true,
  imports: [AxQrCodeComponent],
  template: \`
    <ax-qrcode
      [data]="qrData"
      sizePreset="medium"
      [showDownload]="true"
      [showCopy]="true"
    />
  \`
})
export class MyComponent {
  qrData = 'https://aegisx.io';
}`,
    },
  ];

  // Presets code
  readonly presetsCode: CodeTab[] = [
    {
      label: 'vCard',
      language: 'typescript',
      code: `// Contact information preset
<ax-qrcode
  [vCard]="{
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    organization: 'Company'
  }"
  sizePreset="medium"
/>`,
    },
    {
      label: 'WiFi',
      language: 'typescript',
      code: `// WiFi network preset
<ax-qrcode
  [wifi]="{
    ssid: 'NetworkName',
    password: 'SecretPassword',
    security: 'WPA'
  }"
  sizePreset="medium"
/>`,
    },
    {
      label: 'Email',
      language: 'typescript',
      code: `// Email preset
<ax-qrcode
  [email]="{
    to: 'hello@example.com',
    subject: 'Hello',
    body: 'Message content'
  }"
/>`,
    },
    {
      label: 'SMS',
      language: 'typescript',
      code: `// SMS preset
<ax-qrcode
  [sms]="{
    phone: '+1234567890',
    message: 'Hello from QR!'
  }"
/>`,
    },
  ];

  // Wrapper examples code
  readonly wrapperExamplesCode: CodeTab[] = [
    {
      label: 'Download',
      language: 'html',
      code: `<!-- With download button -->
<ax-qrcode
  data="https://aegisx.io"
  [showDownload]="true"
  downloadFileName="my-qrcode"
/>`,
    },
    {
      label: 'Copy',
      language: 'html',
      code: `<!-- With copy to clipboard -->
<ax-qrcode
  data="Copy this text!"
  [showCopy]="true"
/>`,
    },
    {
      label: 'Custom Colors',
      language: 'html',
      code: `<!-- Brand colors -->
<ax-qrcode
  data="Styled QR"
  colorDark="#6366f1"
  colorLight="#f0f0ff"
/>`,
    },
  ];

  // Code examples for direct library
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
