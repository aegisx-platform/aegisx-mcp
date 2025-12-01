import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../components/docs';
import { CodeTab, ComponentToken } from '../../../../types/docs.types';

@Component({
  selector: 'ax-pdf-viewer-doc',
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
    MatSlideToggleModule,
    MatSliderModule,
    NgxExtendedPdfViewerModule,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="pdf-viewer-doc">
      <ax-doc-header
        title="PDF Viewer"
        icon="picture_as_pdf"
        description="Powerful PDF viewer component based on Mozilla's PDF.js. View, print, and interact with PDF documents directly in your application."
        [breadcrumbs]="[
          { label: 'Integrations', link: '/docs/integrations/overview' },
          { label: 'PDF Viewer' },
        ]"
        status="stable"
        version="21.x"
        importStatement="import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';"
      ></ax-doc-header>

      <!-- Library Reference -->
      <div class="library-reference">
        <mat-icon>info</mat-icon>
        <span>
          This integration uses
          <a
            href="https://github.com/nicegood8787/ngx-extended-pdf-viewer"
            target="_blank"
            rel="noopener"
          >
            ngx-extended-pdf-viewer
          </a>
          library by nicegood8787 (Apache 2.0 License)
        </span>
      </div>

      <mat-tab-group class="pdf-viewer-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="pdf-viewer-doc__tab-content">
            <section class="pdf-viewer-doc__section">
              <h2>Basic PDF Viewer</h2>
              <p>
                Display PDF documents with full navigation and zoom controls.
              </p>

              <ax-live-preview variant="bordered" minHeight="500px">
                <div class="pdf-container">
                  <ngx-extended-pdf-viewer
                    [src]="pdfSrc()"
                    [height]="'450px'"
                    [showToolbar]="showToolbar()"
                    [showSidebarButton]="showSidebar()"
                    [showFindButton]="true"
                    [showPagingButtons]="true"
                    [showZoomButtons]="true"
                    [showPresentationModeButton]="false"
                    [showOpenFileButton]="false"
                    [showPrintButton]="showPrint()"
                    [showDownloadButton]="showDownload()"
                    [zoom]="zoomLevel()"
                    [textLayer]="true"
                  >
                  </ngx-extended-pdf-viewer>
                </div>
              </ax-live-preview>

              <div class="demo-controls">
                <mat-slide-toggle
                  [checked]="showToolbar()"
                  (change)="showToolbar.set($event.checked)"
                >
                  Show Toolbar
                </mat-slide-toggle>

                <mat-slide-toggle
                  [checked]="showSidebar()"
                  (change)="showSidebar.set($event.checked)"
                >
                  Show Sidebar Button
                </mat-slide-toggle>

                <mat-slide-toggle
                  [checked]="showPrint()"
                  (change)="showPrint.set($event.checked)"
                >
                  Show Print
                </mat-slide-toggle>

                <mat-slide-toggle
                  [checked]="showDownload()"
                  (change)="showDownload.set($event.checked)"
                >
                  Show Download
                </mat-slide-toggle>

                <mat-form-field appearance="outline">
                  <mat-label>Zoom Level</mat-label>
                  <mat-select
                    [value]="zoomLevel()"
                    (selectionChange)="zoomLevel.set($event.value)"
                  >
                    <mat-option value="auto">Auto</mat-option>
                    <mat-option value="page-fit">Page Fit</mat-option>
                    <mat-option value="page-width">Page Width</mat-option>
                    <mat-option value="50%">50%</mat-option>
                    <mat-option value="75%">75%</mat-option>
                    <mat-option value="100%">100%</mat-option>
                    <mat-option value="125%">125%</mat-option>
                    <mat-option value="150%">150%</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <ax-code-tabs [tabs]="basicCode"></ax-code-tabs>
            </section>

            <section class="pdf-viewer-doc__section">
              <h2>Features Overview</h2>
              <p>Key capabilities of the PDF viewer.</p>

              <div class="features-grid">
                <div class="feature-card">
                  <mat-icon>search</mat-icon>
                  <h4>Text Search</h4>
                  <p>Full-text search with highlighting</p>
                </div>
                <div class="feature-card">
                  <mat-icon>bookmark</mat-icon>
                  <h4>Bookmarks</h4>
                  <p>Navigate using document outline</p>
                </div>
                <div class="feature-card">
                  <mat-icon>photo_size_select_small</mat-icon>
                  <h4>Thumbnails</h4>
                  <p>Visual page navigation sidebar</p>
                </div>
                <div class="feature-card">
                  <mat-icon>print</mat-icon>
                  <h4>Print Support</h4>
                  <p>High-quality printing with dialog</p>
                </div>
                <div class="feature-card">
                  <mat-icon>download</mat-icon>
                  <h4>Download</h4>
                  <p>Save PDF to local device</p>
                </div>
                <div class="feature-card">
                  <mat-icon>text_fields</mat-icon>
                  <h4>Text Layer</h4>
                  <p>Selectable and searchable text</p>
                </div>
                <div class="feature-card">
                  <mat-icon>rotate_right</mat-icon>
                  <h4>Rotation</h4>
                  <p>Rotate pages 90° increments</p>
                </div>
                <div class="feature-card">
                  <mat-icon>fullscreen</mat-icon>
                  <h4>Presentation</h4>
                  <p>Full-screen presentation mode</p>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="pdf-viewer-doc__tab-content">
            <section class="pdf-viewer-doc__section">
              <h2>Minimal Viewer</h2>
              <p>Clean, minimal PDF viewer without toolbar.</p>

              <ax-live-preview variant="bordered" minHeight="400px">
                <div class="pdf-container">
                  <ngx-extended-pdf-viewer
                    [src]="pdfSrc()"
                    [height]="'350px'"
                    [showToolbar]="false"
                    [showSidebarButton]="false"
                    [showHandToolButton]="false"
                    [textLayer]="true"
                  >
                  </ngx-extended-pdf-viewer>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="minimalCode"></ax-code-tabs>
            </section>

            <section class="pdf-viewer-doc__section">
              <h2>Custom Toolbar</h2>
              <p>Use specific toolbar buttons only.</p>

              <ax-live-preview variant="bordered" minHeight="400px">
                <div class="pdf-container">
                  <ngx-extended-pdf-viewer
                    [src]="pdfSrc()"
                    [height]="'350px'"
                    [showToolbar]="true"
                    [showSidebarButton]="false"
                    [showFindButton]="true"
                    [showPagingButtons]="true"
                    [showZoomButtons]="true"
                    [showPresentationModeButton]="false"
                    [showOpenFileButton]="false"
                    [showPrintButton]="false"
                    [showDownloadButton]="false"
                    [showRotateButton]="true"
                    [showHandToolButton]="false"
                  >
                  </ngx-extended-pdf-viewer>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="customToolbarCode"></ax-code-tabs>
            </section>

            <section class="pdf-viewer-doc__section">
              <h2>Loading from URL</h2>
              <p>Load PDF from external URLs or base64 data.</p>

              <div class="url-demo">
                <mat-form-field appearance="outline" class="url-input">
                  <mat-label>PDF URL</mat-label>
                  <input
                    matInput
                    [value]="pdfSrc()"
                    (input)="updatePdfUrl($event)"
                  />
                  <mat-hint>Enter a URL to a PDF file</mat-hint>
                </mat-form-field>

                <button
                  mat-raised-button
                  color="primary"
                  (click)="loadSamplePdf()"
                >
                  <mat-icon>refresh</mat-icon>
                  Load Sample PDF
                </button>
              </div>

              <ax-code-tabs [tabs]="loadingCode"></ax-code-tabs>
            </section>

            <section class="pdf-viewer-doc__section">
              <h2>Event Handling</h2>
              <p>React to user interactions with the PDF.</p>

              <ax-code-tabs [tabs]="eventsCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="pdf-viewer-doc__tab-content">
            <section class="pdf-viewer-doc__section">
              <h2>Inputs</h2>
              <p>Configuration options for the PDF viewer.</p>

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
                      <td><code>src</code></td>
                      <td>string | Uint8Array</td>
                      <td>-</td>
                      <td>PDF source URL, base64, or binary data</td>
                    </tr>
                    <tr>
                      <td><code>height</code></td>
                      <td>string</td>
                      <td>'100%'</td>
                      <td>Viewer height (CSS value)</td>
                    </tr>
                    <tr>
                      <td><code>zoom</code></td>
                      <td>string | number</td>
                      <td>'auto'</td>
                      <td>Initial zoom level</td>
                    </tr>
                    <tr>
                      <td><code>page</code></td>
                      <td>number</td>
                      <td>1</td>
                      <td>Initial page number</td>
                    </tr>
                    <tr>
                      <td><code>showToolbar</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show/hide main toolbar</td>
                    </tr>
                    <tr>
                      <td><code>showSidebarButton</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show sidebar toggle button</td>
                    </tr>
                    <tr>
                      <td><code>showFindButton</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show search button</td>
                    </tr>
                    <tr>
                      <td><code>showPagingButtons</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show page navigation</td>
                    </tr>
                    <tr>
                      <td><code>showZoomButtons</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show zoom controls</td>
                    </tr>
                    <tr>
                      <td><code>showPrintButton</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show print button</td>
                    </tr>
                    <tr>
                      <td><code>showDownloadButton</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Show download button</td>
                    </tr>
                    <tr>
                      <td><code>textLayer</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Enable text selection</td>
                    </tr>
                    <tr>
                      <td><code>password</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Password for protected PDFs</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="pdf-viewer-doc__section">
              <h2>Outputs</h2>
              <p>Events emitted by the PDF viewer.</p>

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
                      <td><code>pdfLoaded</code></td>
                      <td>PdfLoadedEvent</td>
                      <td>Emitted when PDF is loaded</td>
                    </tr>
                    <tr>
                      <td><code>pdfLoadingFailed</code></td>
                      <td>Error</td>
                      <td>Emitted on load failure</td>
                    </tr>
                    <tr>
                      <td><code>pageRendered</code></td>
                      <td>PageRenderedEvent</td>
                      <td>Emitted when page is rendered</td>
                    </tr>
                    <tr>
                      <td><code>pageChange</code></td>
                      <td>number</td>
                      <td>Emitted when page changes</td>
                    </tr>
                    <tr>
                      <td><code>zoomChange</code></td>
                      <td>number</td>
                      <td>Emitted when zoom changes</td>
                    </tr>
                    <tr>
                      <td><code>beforePrint</code></td>
                      <td>void</td>
                      <td>Emitted before print dialog</td>
                    </tr>
                    <tr>
                      <td><code>afterPrint</code></td>
                      <td>void</td>
                      <td>Emitted after printing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="pdf-viewer-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>

            <section class="pdf-viewer-doc__section">
              <h2>Custom Styling</h2>
              <p>Override PDF viewer styles with CSS variables.</p>

              <ax-code-tabs [tabs]="stylingCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="pdf-viewer-doc__tab-content">
            <section class="pdf-viewer-doc__section">
              <h2>Installation</h2>
              <p>Setup requirements for ngx-extended-pdf-viewer.</p>

              <ax-code-tabs [tabs]="installationCode"></ax-code-tabs>
            </section>

            <section class="pdf-viewer-doc__section">
              <h2>Best Practices</h2>

              <div class="guidelines-grid">
                <div class="guideline guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Set appropriate height for the viewer</li>
                    <li>Use lazy loading for large PDFs</li>
                    <li>Enable text layer for searchability</li>
                    <li>Handle loading errors gracefully</li>
                    <li>Provide password input for protected PDFs</li>
                  </ul>
                </div>

                <div class="guideline guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Load very large PDFs without warning</li>
                    <li>Enable all features when not needed</li>
                    <li>Forget to handle print in mobile views</li>
                    <li>Ignore accessibility considerations</li>
                    <li>Use without proper CORS configuration</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="pdf-viewer-doc__section">
              <h2>Performance Tips</h2>

              <div class="tips-list">
                <div class="tip">
                  <mat-icon>speed</mat-icon>
                  <div>
                    <strong>Lazy Loading</strong>
                    <p>
                      Use range requests for large files to load pages on
                      demand.
                    </p>
                  </div>
                </div>
                <div class="tip">
                  <mat-icon>memory</mat-icon>
                  <div>
                    <strong>Memory Management</strong>
                    <p>Destroy viewer when navigating away to free memory.</p>
                  </div>
                </div>
                <div class="tip">
                  <mat-icon>cached</mat-icon>
                  <div>
                    <strong>Caching</strong>
                    <p>
                      Use service worker caching for frequently accessed PDFs.
                    </p>
                  </div>
                </div>
                <div class="tip">
                  <mat-icon>compress</mat-icon>
                  <div>
                    <strong>Compression</strong>
                    <p>
                      Use web-optimized PDFs with reduced resolution images.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .pdf-viewer-doc {
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
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;
        margin-bottom: 1.5rem;
        font-size: 0.875rem;

        mat-icon {
          color: var(--ax-info-default);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        a {
          color: var(--ax-brand-default);
          font-weight: 500;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .pdf-viewer-doc__tabs {
        margin-top: 1rem;
      }

      .pdf-viewer-doc__tab-content {
        padding: 1.5rem 0;
      }

      .pdf-viewer-doc__section {
        margin-bottom: 3rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        > p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
      }

      .pdf-container {
        width: 100%;
        border-radius: 8px;
        overflow: hidden;
      }

      .demo-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        margin: 1rem 0;

        mat-form-field {
          min-width: 150px;
        }
      }

      .url-demo {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        margin-bottom: 1.5rem;

        .url-input {
          flex: 1;
        }

        button {
          margin-top: 4px;
        }
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;

        @media (max-width: 1024px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 600px) {
          grid-template-columns: 1fr;
        }
      }

      .feature-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 1.5rem 1rem;
        background: var(--ax-background-subtle);
        border-radius: 12px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--ax-brand-default);
          margin-bottom: 0.75rem;
        }

        h4 {
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--ax-text-secondary);
        }
      }

      .api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;

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
            border-radius: 4px;
            font-size: 0.8125rem;
          }

          tr:last-child td {
            border-bottom: none;
          }
        }
      }

      .guidelines-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .guideline {
        padding: 1rem;
        border-radius: 12px;

        h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.75rem;
          font-weight: 600;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        ul {
          margin: 0;
          padding-left: 1.25rem;

          li {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }
        }
      }

      .guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }

        li {
          color: var(--ax-success-emphasis);
        }
      }

      .guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }

        li {
          color: var(--ax-error-emphasis);
        }
      }

      .tips-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .tip {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-radius: 8px;

        mat-icon {
          color: var(--ax-brand-default);
        }

        strong {
          display: block;
          color: var(--ax-text-heading);
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }
    `,
  ],
})
export class PdfViewerDocComponent {
  // Demo state
  pdfSrc = signal(
    'https://raw.githubusercontent.com/nicegood8787/ngx-extended-pdf-viewer/main/assets/pdfs/pdf-sample.pdf',
  );
  showToolbar = signal(true);
  showSidebar = signal(true);
  showPrint = signal(true);
  showDownload = signal(true);
  zoomLevel = signal('auto');

  // Design tokens
  designTokens: ComponentToken[] = [
    {
      category: 'Layout',
      cssVar: '--pdfViewer-background-color',
      usage: 'Viewer background',
    },
    {
      category: 'Toolbar',
      cssVar: '--toolbarBackgroundColor',
      usage: 'Toolbar background',
    },
    {
      category: 'Sidebar',
      cssVar: '--sidebarBackgroundColor',
      usage: 'Sidebar background',
    },
    {
      category: 'Typography',
      cssVar: '--ax-font-family',
      usage: 'UI font family',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-default',
      usage: 'Accent colors',
    },
  ];

  updatePdfUrl(event: Event) {
    const input = event.target as HTMLInputElement;
    this.pdfSrc.set(input.value);
  }

  loadSamplePdf() {
    this.pdfSrc.set(
      'https://raw.githubusercontent.com/nicegood8787/ngx-extended-pdf-viewer/main/assets/pdfs/pdf-sample.pdf',
    );
  }

  // Code examples
  readonly basicCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ngx-extended-pdf-viewer
  [src]="pdfSrc"
  [height]="'500px'"
  [showToolbar]="true"
  [showSidebarButton]="true"
  [showFindButton]="true"
  [showPagingButtons]="true"
  [showZoomButtons]="true"
  [showPrintButton]="true"
  [showDownloadButton]="true"
  [zoom]="'auto'"
  [textLayer]="true"
>
</ngx-extended-pdf-viewer>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  imports: [NgxExtendedPdfViewerModule],
  ...
})
export class MyComponent {
  pdfSrc = 'https://example.com/document.pdf';
  // Or use base64: 'data:application/pdf;base64,...'
  // Or use Uint8Array for binary data
}`,
    },
  ];

  readonly minimalCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Minimal viewer without toolbar -->
<ngx-extended-pdf-viewer
  [src]="pdfSrc"
  [height]="'400px'"
  [showToolbar]="false"
  [showSidebarButton]="false"
  [showHandToolButton]="false"
  [textLayer]="true"
>
</ngx-extended-pdf-viewer>`,
    },
  ];

  readonly customToolbarCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Custom toolbar with specific buttons only -->
<ngx-extended-pdf-viewer
  [src]="pdfSrc"
  [showToolbar]="true"
  [showSidebarButton]="false"
  [showFindButton]="true"
  [showPagingButtons]="true"
  [showZoomButtons]="true"
  [showPresentationModeButton]="false"
  [showOpenFileButton]="false"
  [showPrintButton]="false"
  [showDownloadButton]="false"
  [showRotateButton]="true"
  [showHandToolButton]="false"
  [showScrollingButton]="false"
  [showSpreadButton]="false"
  [showPropertiesButton]="false"
>
</ngx-extended-pdf-viewer>`,
    },
  ];

  readonly loadingCode: CodeTab[] = [
    {
      label: 'From URL',
      language: 'typescript',
      code: `// Load from URL
pdfSrc = 'https://example.com/document.pdf';

// Load from relative path
pdfSrc = '/assets/documents/sample.pdf';`,
    },
    {
      label: 'From Base64',
      language: 'typescript',
      code: `// Load from base64 string
pdfSrc = 'data:application/pdf;base64,JVBERi0xLjQK...';

// From API response
async loadPdf(documentId: string) {
  const response = await this.api.getDocument(documentId);
  this.pdfSrc = \`data:application/pdf;base64,\${response.base64Data}\`;
}`,
    },
    {
      label: 'From Blob',
      language: 'typescript',
      code: `// Load from Blob/File
async loadPdfFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  this.pdfSrc = new Uint8Array(arrayBuffer);
}

// Or use URL.createObjectURL
loadPdfBlob(blob: Blob) {
  this.pdfSrc = URL.createObjectURL(blob);
}`,
    },
  ];

  readonly eventsCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ngx-extended-pdf-viewer
  [src]="pdfSrc"
  (pdfLoaded)="onPdfLoaded($event)"
  (pdfLoadingFailed)="onLoadError($event)"
  (pageRendered)="onPageRendered($event)"
  (pageChange)="onPageChange($event)"
  (zoomChange)="onZoomChange($event)"
  (beforePrint)="onBeforePrint()"
  (afterPrint)="onAfterPrint()"
>
</ngx-extended-pdf-viewer>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { PdfLoadedEvent, PageRenderedEvent } from 'ngx-extended-pdf-viewer';

export class MyComponent {
  onPdfLoaded(event: PdfLoadedEvent) {
    console.log('PDF loaded:', event.pagesCount, 'pages');
  }

  onLoadError(error: Error) {
    console.error('Failed to load PDF:', error);
  }

  onPageRendered(event: PageRenderedEvent) {
    console.log('Page rendered:', event.pageNumber);
  }

  onPageChange(page: number) {
    console.log('Current page:', page);
  }

  onZoomChange(zoom: number) {
    console.log('Zoom level:', zoom);
  }

  onBeforePrint() {
    console.log('Preparing to print...');
  }

  onAfterPrint() {
    console.log('Printing completed');
  }
}`,
    },
  ];

  readonly installationCode: CodeTab[] = [
    {
      label: 'Install',
      language: 'bash',
      code: `# Install the package
npm install ngx-extended-pdf-viewer

# Or with pnpm
pnpm add ngx-extended-pdf-viewer`,
    },
    {
      label: 'angular.json',
      language: 'json',
      code: `{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "node_modules/ngx-extended-pdf-viewer/assets",
                "output": "/assets/"
              }
            ]
          }
        }
      }
    }
  }
}`,
    },
    {
      label: 'Module Import',
      language: 'typescript',
      code: `import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  standalone: true,
  imports: [NgxExtendedPdfViewerModule],
  ...
})
export class MyComponent {}`,
    },
  ];

  readonly stylingCode: CodeTab[] = [
    {
      label: 'SCSS',
      language: 'scss',
      code: `// Override PDF viewer styles
::ng-deep {
  .pdf-viewer-container {
    --pdfViewer-background-color: var(--ax-background-subtle);
  }

  #toolbarContainer {
    background-color: var(--ax-background-default);
    border-bottom: 1px solid var(--ax-border-default);
  }

  #sidebarContainer {
    background-color: var(--ax-background-subtle);
  }

  .toolbarButton {
    color: var(--ax-text-default);

    &:hover {
      background-color: var(--ax-background-muted);
    }
  }
}`,
    },
    {
      label: 'Dark Theme',
      language: 'scss',
      code: `// Dark theme overrides
:host-context(.dark-theme) {
  ::ng-deep {
    .pdf-viewer-container {
      --pdfViewer-background-color: #1e1e1e;
    }

    #toolbarContainer {
      background-color: #2d2d2d;
      border-color: #404040;
    }

    #sidebarContainer {
      background-color: #252525;
    }
  }
}`,
    },
  ];
}
