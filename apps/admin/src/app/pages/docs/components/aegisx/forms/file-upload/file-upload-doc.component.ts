import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AxFileUploadComponent, FileItem } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken, CodeTab } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-file-upload-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    AxFileUploadComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="file-upload-doc">
      <ax-doc-header
        title="File Upload"
        description="A drag-and-drop file upload component with preview and progress indication. Supports single and multiple file uploads with validation."
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          { label: 'Components', link: '/docs/components' },
          { label: 'Forms', link: '/docs/components/forms/date-picker' },
          { label: 'File Upload' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxFileUploadComponent } from '&#64;aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="file-upload-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="file-upload-doc__tab-content">
            <section class="file-upload-doc__section">
              <h2>Basic Usage</h2>
              <p>
                Drag and drop files or click to browse. Files are validated and
                previewed automatically.
              </p>

              <ax-live-preview variant="bordered">
                <ax-file-upload
                  (filesChange)="onFilesChange($event)"
                  hint="Drag and drop files here or click to browse"
                ></ax-file-upload>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicCode"></ax-code-tabs>
            </section>

            <section class="file-upload-doc__section">
              <h2>Image Upload</h2>
              <p>Accept only images with preview thumbnails.</p>

              <ax-live-preview variant="bordered">
                <ax-file-upload
                  accept="image/*"
                  [multiple]="true"
                  [maxFiles]="5"
                  hint="PNG, JPG, GIF up to 5MB each (max 5 files)"
                  (filesChange)="onFilesChange($event)"
                ></ax-file-upload>
              </ax-live-preview>

              <ax-code-tabs [tabs]="imageCode"></ax-code-tabs>
            </section>

            <section class="file-upload-doc__section">
              <h2>Document Upload</h2>
              <p>Accept specific document types with size limit.</p>

              <ax-live-preview variant="bordered">
                <ax-file-upload
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  [maxSize]="10485760"
                  hint="PDF, Word, Excel up to 10MB"
                  (filesChange)="onFilesChange($event)"
                ></ax-file-upload>
              </ax-live-preview>

              <ax-code-tabs [tabs]="documentCode"></ax-code-tabs>
            </section>

            <section class="file-upload-doc__section">
              <h2>Custom Drag Text</h2>
              <p>Customize the drag zone text for better UX.</p>

              <ax-live-preview variant="bordered">
                <ax-file-upload
                  dragText="Drop your CSV file here"
                  accept=".csv"
                  hint="Only CSV files are accepted"
                  (filesChange)="onFilesChange($event)"
                ></ax-file-upload>
              </ax-live-preview>

              <ax-code-tabs [tabs]="customTextCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="file-upload-doc__tab-content">
            <section class="file-upload-doc__section">
              <h2>Inputs</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>accept</code></td>
                      <td>string</td>
                      <td>'*'</td>
                      <td>Accepted file types (same as HTML input)</td>
                    </tr>
                    <tr>
                      <td><code>multiple</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Allow multiple file selection</td>
                    </tr>
                    <tr>
                      <td><code>maxFiles</code></td>
                      <td>number</td>
                      <td>10</td>
                      <td>Maximum number of files</td>
                    </tr>
                    <tr>
                      <td><code>maxSize</code></td>
                      <td>number</td>
                      <td>10485760</td>
                      <td>Maximum file size in bytes (10MB)</td>
                    </tr>
                    <tr>
                      <td><code>dragText</code></td>
                      <td>string</td>
                      <td>'Drag and drop files here'</td>
                      <td>Custom drag zone text</td>
                    </tr>
                    <tr>
                      <td><code>hint</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Hint text below drop zone</td>
                    </tr>
                    <tr>
                      <td><code>disabled</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Disabled state</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="file-upload-doc__section">
              <h2>Outputs</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Output</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>filesChange</code></td>
                      <td>EventEmitter&lt;FileItem[]&gt;</td>
                      <td>Emits when files are added or removed</td>
                    </tr>
                    <tr>
                      <td><code>fileRemoved</code></td>
                      <td>EventEmitter&lt;FileItem&gt;</td>
                      <td>Emits when a file is removed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="file-upload-doc__section">
              <h2>FileItem Interface</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>file</code></td>
                      <td>File</td>
                      <td>The native File object</td>
                    </tr>
                    <tr>
                      <td><code>name</code></td>
                      <td>string</td>
                      <td>File name</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td>number</td>
                      <td>File size in bytes</td>
                    </tr>
                    <tr>
                      <td><code>type</code></td>
                      <td>string</td>
                      <td>MIME type</td>
                    </tr>
                    <tr>
                      <td><code>progress</code></td>
                      <td>number</td>
                      <td>Upload progress (0-100)</td>
                    </tr>
                    <tr>
                      <td><code>status</code></td>
                      <td>'pending' | 'uploading' | 'success' | 'error'</td>
                      <td>Upload status</td>
                    </tr>
                    <tr>
                      <td><code>error</code></td>
                      <td>string</td>
                      <td>Error message if failed</td>
                    </tr>
                    <tr>
                      <td><code>preview</code></td>
                      <td>string</td>
                      <td>Base64 preview URL (images only)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Design Tokens Tab -->
        <mat-tab label="Design Tokens">
          <div class="file-upload-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .file-upload-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .file-upload-doc__tabs {
        margin-top: 2rem;
      }

      .file-upload-doc__tab-content {
        padding: 1.5rem 0;
      }

      .file-upload-doc__section {
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
export class FileUploadDocComponent {
  onFilesChange(files: FileItem[]): void {
    console.log('Files changed:', files);
  }

  readonly basicCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-file-upload
  (filesChange)="onFilesChange($event)"
  hint="Drag and drop files here or click to browse"
></ax-file-upload>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `onFilesChange(files: FileItem[]) {
  console.log('Selected files:', files);
  // Upload files to server
  files.forEach(item => {
    this.uploadService.upload(item.file).subscribe(...);
  });
}`,
    },
  ];

  readonly imageCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-file-upload
  accept="image/*"
  [multiple]="true"
  [maxFiles]="5"
  [maxSize]="5242880"
  hint="PNG, JPG, GIF up to 5MB each (max 5 files)"
  (filesChange)="onImagesChange($event)"
></ax-file-upload>`,
    },
  ];

  readonly documentCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-file-upload
  accept=".pdf,.doc,.docx,.xls,.xlsx"
  [maxSize]="10485760"
  hint="PDF, Word, Excel up to 10MB"
  (filesChange)="onDocumentChange($event)"
></ax-file-upload>`,
    },
  ];

  readonly customTextCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-file-upload
  dragText="Drop your CSV file here"
  accept=".csv"
  hint="Only CSV files are accepted"
></ax-file-upload>`,
    },
  ];

  readonly designTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-border-default',
      usage: 'Drop zone border',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-default',
      usage: 'Hover/active border',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-faint',
      usage: 'Hover/active background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'File item background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-faint',
      usage: 'Error file background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-default',
      usage: 'Success status icon',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-default',
      usage: 'Error status icon',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-lg',
      usage: 'Drop zone radius',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-md',
      usage: 'File item radius',
    },
  ];
}
