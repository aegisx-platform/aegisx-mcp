import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AxSignaturePadComponent, SignatureData } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
} from '../../../../components/docs';
import { CodeTab } from '../../../../types/docs.types';

@Component({
  selector: 'ax-signature-pad-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    AxSignaturePadComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="signature-pad-doc">
      <ax-doc-header
        title="Signature Pad"
        icon="draw"
        description="ลายเซ็นดิจิทัล รองรับทั้งการวาดและอัพโหลด สำหรับระบบ HIS, เวียนหนังสือ, สัญญา"
        [breadcrumbs]="[
          { label: 'Integrations', link: '/docs/integrations/overview' },
          { label: 'Signature Pad' },
        ]"
        status="stable"
        version="5.1.2"
        importStatement="import { AxSignaturePadComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <!-- Library Reference -->
      <div class="library-reference">
        <mat-icon>info</mat-icon>
        <span>
          This integration uses
          <a
            href="https://github.com/szimek/signature_pad"
            target="_blank"
            rel="noopener"
          >
            signature_pad
          </a>
          library by Szymon Nowak (MIT License)
        </span>
      </div>

      <mat-tab-group class="signature-pad-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="signature-pad-doc__tab-content">
            <section class="signature-pad-doc__section">
              <h2>Interactive Demo</h2>
              <p>ลองวาดลายเซ็นหรืออัพโหลดรูปภาพลายเซ็นของคุณ</p>

              <div class="demo-container">
                <div class="demo-preview">
                  <ax-signature-pad
                    #signaturePad
                    [enableDraw]="enableDraw()"
                    [enableUpload]="enableUpload()"
                    [enableUndo]="enableUndo()"
                    [enableClear]="enableClear()"
                    [enableSave]="enableSave()"
                    [height]="height()"
                    [penColor]="penColor()"
                    (signatureChange)="onSignatureChange($event)"
                    (saved)="onSaved($event)"
                    (cleared)="onCleared()"
                  />
                </div>

                <div class="demo-controls">
                  <h4>Feature Toggles</h4>

                  <mat-slide-toggle
                    [checked]="enableDraw()"
                    (change)="enableDraw.set($event.checked)"
                  >
                    Enable Draw Mode
                  </mat-slide-toggle>

                  <mat-slide-toggle
                    [checked]="enableUpload()"
                    (change)="enableUpload.set($event.checked)"
                  >
                    Enable Upload Mode
                  </mat-slide-toggle>

                  <mat-slide-toggle
                    [checked]="enableUndo()"
                    (change)="enableUndo.set($event.checked)"
                  >
                    Enable Undo
                  </mat-slide-toggle>

                  <mat-slide-toggle
                    [checked]="enableClear()"
                    (change)="enableClear.set($event.checked)"
                  >
                    Enable Clear
                  </mat-slide-toggle>

                  <mat-slide-toggle
                    [checked]="enableSave()"
                    (change)="enableSave.set($event.checked)"
                  >
                    Enable Save Button
                  </mat-slide-toggle>

                  <h4 class="mt-4">Canvas Settings</h4>

                  <mat-form-field appearance="outline">
                    <mat-label>Height (px)</mat-label>
                    <input
                      matInput
                      type="number"
                      [ngModel]="height()"
                      (ngModelChange)="height.set($event)"
                      min="100"
                      max="400"
                    />
                  </mat-form-field>

                  <div class="color-input">
                    <label>Pen Color</label>
                    <input
                      type="color"
                      [ngModel]="penColor()"
                      (ngModelChange)="penColor.set($event)"
                    />
                  </div>
                </div>
              </div>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="signature-pad-doc__section">
              <h2>Features</h2>
              <div class="features-grid">
                <div class="feature-card">
                  <mat-icon>gesture</mat-icon>
                  <h4>Smooth Drawing</h4>
                  <p>Bezier curves for natural signature feel</p>
                </div>
                <div class="feature-card">
                  <mat-icon>upload_file</mat-icon>
                  <h4>Image Upload</h4>
                  <p>Support PNG/JPG with drag & drop</p>
                </div>
                <div class="feature-card">
                  <mat-icon>toggle_on</mat-icon>
                  <h4>Feature Toggles</h4>
                  <p>Enable/disable any feature</p>
                </div>
                <div class="feature-card">
                  <mat-icon>input</mat-icon>
                  <h4>Form Integration</h4>
                  <p>ControlValueAccessor support</p>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="signature-pad-doc__tab-content">
            <section class="signature-pad-doc__section">
              <h2>Use Cases</h2>

              <div class="examples-grid">
                <!-- Draw Only -->
                <div class="example-card">
                  <h4>Draw Only</h4>
                  <ax-live-preview variant="bordered">
                    <ax-signature-pad
                      [enableDraw]="true"
                      [enableUpload]="false"
                      [enableSave]="false"
                      [height]="150"
                    />
                  </ax-live-preview>
                  <p>สำหรับเซ็นเอกสารออนไลน์</p>
                </div>

                <!-- Upload Only -->
                <div class="example-card">
                  <h4>Upload Only</h4>
                  <ax-live-preview variant="bordered">
                    <ax-signature-pad
                      [enableDraw]="false"
                      [enableUpload]="true"
                      [enableSave]="false"
                      [height]="150"
                    />
                  </ax-live-preview>
                  <p>อัพโหลดลายเซ็นที่สแกนไว้</p>
                </div>

                <!-- HIS Consent -->
                <div class="example-card">
                  <h4>HIS Consent Form</h4>
                  <ax-live-preview variant="bordered">
                    <ax-signature-pad
                      [enableDraw]="true"
                      [enableUpload]="false"
                      [enableUndo]="true"
                      [enableClear]="true"
                      [enableSave]="true"
                      [height]="150"
                    />
                  </ax-live-preview>
                  <p>แบบฟอร์มยินยอมผู้ป่วย</p>
                </div>

                <!-- Document Approval -->
                <div class="example-card">
                  <h4>Document Approval</h4>
                  <ax-live-preview variant="bordered">
                    <ax-signature-pad
                      [enableDraw]="true"
                      [enableUpload]="true"
                      [enableUndo]="false"
                      [enableClear]="true"
                      [enableSave]="true"
                      [height]="150"
                    />
                  </ax-live-preview>
                  <p>ระบบเวียนหนังสืออนุมัติ</p>
                </div>
              </div>

              <ax-code-tabs [tabs]="examplesCode"></ax-code-tabs>
            </section>

            <section class="signature-pad-doc__section">
              <h2>With Reactive Forms</h2>
              <p>
                Component implements <code>ControlValueAccessor</code> for
                seamless form integration.
              </p>
              <ax-code-tabs [tabs]="formCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="signature-pad-doc__tab-content">
            <section class="signature-pad-doc__section">
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
                      <td><code>enableDraw</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Enable draw mode (วาดลายเซ็น)</td>
                    </tr>
                    <tr>
                      <td><code>enableUpload</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Enable upload mode (อัพโหลดไฟล์)</td>
                    </tr>
                    <tr>
                      <td><code>enableUndo</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show undo button</td>
                    </tr>
                    <tr>
                      <td><code>enableClear</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show clear button</td>
                    </tr>
                    <tr>
                      <td><code>enableSave</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show save button</td>
                    </tr>
                    <tr>
                      <td><code>width</code></td>
                      <td>number</td>
                      <td>400</td>
                      <td>Canvas width in pixels</td>
                    </tr>
                    <tr>
                      <td><code>height</code></td>
                      <td>number</td>
                      <td>200</td>
                      <td>Canvas height in pixels</td>
                    </tr>
                    <tr>
                      <td><code>penColor</code></td>
                      <td>string</td>
                      <td>'#000000'</td>
                      <td>Pen color for drawing</td>
                    </tr>
                    <tr>
                      <td><code>penWidth</code></td>
                      <td>number</td>
                      <td>2.5</td>
                      <td>Pen stroke width</td>
                    </tr>
                    <tr>
                      <td><code>backgroundColor</code></td>
                      <td>string</td>
                      <td>'#ffffff'</td>
                      <td>Canvas background color</td>
                    </tr>
                    <tr>
                      <td><code>acceptUpload</code></td>
                      <td>string</td>
                      <td>'image/png,image/jpeg'</td>
                      <td>Accepted file types for upload</td>
                    </tr>
                    <tr>
                      <td><code>maxUploadSize</code></td>
                      <td>number</td>
                      <td>2097152 (2MB)</td>
                      <td>Maximum upload file size in bytes</td>
                    </tr>
                    <tr>
                      <td><code>disabled</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Disable the component</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="signature-pad-doc__section">
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
                      <td><code>signatureChange</code></td>
                      <td>EventEmitter&lt;SignatureData&gt;</td>
                      <td>Emits when signature changes (draw/upload)</td>
                    </tr>
                    <tr>
                      <td><code>saved</code></td>
                      <td>EventEmitter&lt;string&gt;</td>
                      <td>Emits data URL when save button clicked</td>
                    </tr>
                    <tr>
                      <td><code>cleared</code></td>
                      <td>EventEmitter&lt;void&gt;</td>
                      <td>Emits when signature is cleared</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="signature-pad-doc__section">
              <h2>SignatureData Interface</h2>
              <ax-code-tabs [tabs]="interfaceCode"></ax-code-tabs>
            </section>

            <section class="signature-pad-doc__section">
              <h2>Public Methods</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Parameters</th>
                      <th>Returns</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>clear()</code></td>
                      <td>-</td>
                      <td>void</td>
                      <td>Clear the signature canvas</td>
                    </tr>
                    <tr>
                      <td><code>undo()</code></td>
                      <td>-</td>
                      <td>void</td>
                      <td>Undo last stroke</td>
                    </tr>
                    <tr>
                      <td><code>save()</code></td>
                      <td>-</td>
                      <td>void</td>
                      <td>Trigger save event with data URL</td>
                    </tr>
                    <tr>
                      <td><code>toDataURL()</code></td>
                      <td>format?: 'png' | 'jpeg' | 'svg'</td>
                      <td>string | null</td>
                      <td>Get signature as base64 data URL</td>
                    </tr>
                    <tr>
                      <td><code>fromDataURL()</code></td>
                      <td>dataUrl: string</td>
                      <td>void</td>
                      <td>Load signature from data URL</td>
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
      .signature-pad-doc {
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

      .signature-pad-doc__tabs {
        margin-top: 1rem;
      }

      .signature-pad-doc__tab-content {
        padding: 1.5rem 0;
      }

      .signature-pad-doc__section {
        margin-bottom: 3rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 1rem;
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
        grid-template-columns: 1fr 280px;
        gap: 2rem;
        margin-bottom: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .demo-preview {
        ax-signature-pad {
          width: 100%;
        }
      }

      .demo-controls {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        mat-slide-toggle {
          font-size: 0.875rem;
        }

        mat-form-field {
          width: 100%;
        }
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
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
          width: 100%;
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

      .mt-4 {
        margin-top: 1rem;
      }
    `,
  ],
})
export class SignaturePadDocComponent {
  @ViewChild('signaturePad') signaturePad!: AxSignaturePadComponent;

  constructor(private snackBar: MatSnackBar) {}

  // Demo state
  enableDraw = signal(true);
  enableUpload = signal(true);
  enableUndo = signal(true);
  enableClear = signal(true);
  enableSave = signal(true);
  height = signal(200);
  penColor = signal('#000000');

  // Event handlers
  onSignatureChange(data: SignatureData): void {
    console.log('Signature changed:', data);
  }

  onSaved(dataUrl: string): void {
    this.snackBar.open('ลายเซ็นถูกบันทึกแล้ว', 'ปิด', { duration: 3000 });
    console.log('Signature saved:', dataUrl.substring(0, 50) + '...');
  }

  onCleared(): void {
    this.snackBar.open('ล้างลายเซ็นแล้ว', 'ปิด', { duration: 2000 });
  }

  // Code examples
  readonly basicUsageCode: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<!-- Basic - Both draw and upload -->
<ax-signature-pad
  (signatureChange)="onSignatureChange($event)"
  (saved)="onSaved($event)"
/>

<!-- Draw only -->
<ax-signature-pad
  [enableDraw]="true"
  [enableUpload]="false"
/>

<!-- Upload only -->
<ax-signature-pad
  [enableDraw]="false"
  [enableUpload]="true"
/>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component } from '@angular/core';
import { AxSignaturePadComponent, SignatureData } from '@aegisx/ui';

@Component({
  selector: 'my-component',
  standalone: true,
  imports: [AxSignaturePadComponent],
  template: \`
    <ax-signature-pad
      [enableDraw]="true"
      [enableUpload]="true"
      (signatureChange)="onSignatureChange($event)"
      (saved)="onSaved($event)"
    />
  \`
})
export class MyComponent {
  onSignatureChange(data: SignatureData) {
    console.log('Mode:', data.mode); // 'draw' | 'upload'
    console.log('Is Empty:', data.isEmpty);
    console.log('Data URL:', data.dataUrl);
  }

  onSaved(dataUrl: string) {
    // Send to backend or process
    console.log('Saved signature:', dataUrl);
  }
}`,
    },
  ];

  readonly examplesCode: CodeTab[] = [
    {
      label: 'HIS Consent',
      language: 'html',
      code: `<!-- HIS Patient Consent Form -->
<ax-signature-pad
  [enableDraw]="true"
  [enableUpload]="false"
  [enableUndo]="true"
  [enableClear]="true"
  [enableSave]="true"
  [height]="150"
  (saved)="savePatientConsent($event)"
/>`,
    },
    {
      label: 'Document Approval',
      language: 'html',
      code: `<!-- Document Approval System -->
<ax-signature-pad
  [enableDraw]="true"
  [enableUpload]="true"
  [enableUndo]="false"
  [enableClear]="true"
  [enableSave]="true"
  [height]="150"
  (saved)="approveDocument($event)"
/>`,
    },
    {
      label: 'Upload Only',
      language: 'html',
      code: `<!-- Upload scanned signature -->
<ax-signature-pad
  [enableDraw]="false"
  [enableUpload]="true"
  [enableSave]="true"
  [maxUploadSize]="5242880"
  acceptUpload="image/png,image/jpeg"
  (saved)="uploadSignature($event)"
/>`,
    },
  ];

  readonly formCode: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<form [formGroup]="consentForm" (ngSubmit)="onSubmit()">
  <h3>ใบยินยอมรับการรักษา</h3>

  <mat-form-field>
    <mat-label>ชื่อผู้ป่วย</mat-label>
    <input matInput formControlName="patientName">
  </mat-form-field>

  <label>ลายเซ็นผู้ป่วย</label>
  <ax-signature-pad
    formControlName="patientSignature"
    [enableUpload]="false"
    [enableSave]="false"
  />

  <label>ลายเซ็นผู้ดูแล</label>
  <ax-signature-pad
    formControlName="guardianSignature"
    [enableUpload]="false"
    [enableSave]="false"
  />

  <button mat-raised-button color="primary" type="submit">
    ยืนยันการยินยอม
  </button>
</form>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AxSignaturePadComponent } from '@aegisx/ui';

@Component({
  selector: 'consent-form',
  standalone: true,
  imports: [ReactiveFormsModule, AxSignaturePadComponent],
  templateUrl: './consent-form.component.html'
})
export class ConsentFormComponent {
  consentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.consentForm = this.fb.group({
      patientName: ['', Validators.required],
      patientSignature: ['', Validators.required],
      guardianSignature: ['']
    });
  }

  onSubmit() {
    if (this.consentForm.valid) {
      const formData = this.consentForm.value;
      // patientSignature and guardianSignature are base64 data URLs
      console.log('Submitting:', formData);
    }
  }
}`,
    },
  ];

  readonly interfaceCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `export type SignatureMode = 'draw' | 'upload';
export type SignatureOutputFormat = 'png' | 'jpeg' | 'svg';

export interface SignatureData {
  dataUrl: string;      // Base64 encoded image
  mode: SignatureMode;  // 'draw' or 'upload'
  isEmpty: boolean;     // Whether signature is empty
}`,
    },
  ];
}
