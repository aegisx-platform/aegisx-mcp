import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from 'ngx-image-cropper';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../components/docs';
import { CodeTab, ComponentToken } from '../../../../types/docs.types';

@Component({
  selector: 'ax-image-cropper-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    ImageCropperComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="image-cropper-doc">
      <ax-doc-header
        title="Image Cropper"
        icon="crop"
        description="Powerful image cropping component for Angular. Crop, rotate, and resize images before upload with a user-friendly interface."
        [breadcrumbs]="[
          { label: 'Integrations', link: '/docs/integrations/overview' },
          { label: 'Image Cropper' },
        ]"
        status="stable"
        version="8.x"
        importStatement="import { ImageCropperComponent } from 'ngx-image-cropper';"
      ></ax-doc-header>

      <!-- Library Reference -->
      <div class="library-reference">
        <mat-icon>info</mat-icon>
        <span>
          This integration uses
          <a
            href="https://github.com/nicegood8787/ngx-image-cropper"
            target="_blank"
            rel="noopener"
          >
            ngx-image-cropper
          </a>
          library (MIT License)
        </span>
      </div>

      <mat-tab-group class="image-cropper-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="image-cropper-doc__tab-content">
            <section class="image-cropper-doc__section">
              <h2>Basic Image Cropper</h2>
              <p>Select and crop images with customizable aspect ratio.</p>

              <ax-live-preview variant="bordered" minHeight="450px">
                <div class="cropper-container">
                  @if (!imageChangedEvent()) {
                    <div class="upload-zone" (click)="fileInput.click()">
                      <mat-icon>cloud_upload</mat-icon>
                      <p>Click to select an image</p>
                      <span>Supports: JPG, PNG, GIF, WebP</span>
                      <input
                        #fileInput
                        type="file"
                        accept="image/*"
                        (change)="fileChangeEvent($event)"
                        style="display: none"
                      />
                    </div>
                  } @else {
                    <div class="cropper-wrapper">
                      <image-cropper
                        [imageChangedEvent]="imageChangedEvent()"
                        [maintainAspectRatio]="maintainAspectRatio()"
                        [aspectRatio]="aspectRatio()"
                        [resizeToWidth]="resizeToWidth()"
                        [cropperStaticWidth]="0"
                        [cropperStaticHeight]="0"
                        [roundCropper]="roundCropper()"
                        [canvasRotation]="rotation()"
                        [transform]="imageTransform()"
                        format="png"
                        (imageCropped)="imageCropped($event)"
                        (imageLoaded)="imageLoaded($event)"
                        (cropperReady)="cropperReady()"
                        (loadImageFailed)="loadImageFailed()"
                      >
                      </image-cropper>
                    </div>
                  }

                  @if (croppedImage()) {
                    <div class="preview-section">
                      <h4>Cropped Result:</h4>
                      <img
                        [src]="croppedImage()"
                        [class.round-preview]="roundCropper()"
                        class="preview-image"
                      />
                    </div>
                  }
                </div>
              </ax-live-preview>

              <div class="demo-controls">
                @if (imageChangedEvent()) {
                  <button mat-stroked-button (click)="resetImage()">
                    <mat-icon>refresh</mat-icon>
                    Reset
                  </button>
                }

                <mat-slide-toggle
                  [checked]="maintainAspectRatio()"
                  (change)="maintainAspectRatio.set($event.checked)"
                >
                  Maintain Aspect Ratio
                </mat-slide-toggle>

                <mat-slide-toggle
                  [checked]="roundCropper()"
                  (change)="roundCropper.set($event.checked)"
                >
                  Round Cropper
                </mat-slide-toggle>

                <mat-form-field appearance="outline">
                  <mat-label>Aspect Ratio</mat-label>
                  <mat-select
                    [value]="aspectRatio()"
                    (selectionChange)="aspectRatio.set($event.value)"
                    [disabled]="!maintainAspectRatio()"
                  >
                    <mat-option [value]="1">1:1 (Square)</mat-option>
                    <mat-option [value]="4 / 3">4:3</mat-option>
                    <mat-option [value]="16 / 9">16:9</mat-option>
                    <mat-option [value]="3 / 4">3:4 (Portrait)</mat-option>
                    <mat-option [value]="2 / 3">2:3</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <ax-code-tabs [tabs]="basicCode"></ax-code-tabs>
            </section>

            <section class="image-cropper-doc__section">
              <h2>Features</h2>
              <p>Key capabilities of the image cropper.</p>

              <div class="features-grid">
                <div class="feature-card">
                  <mat-icon>aspect_ratio</mat-icon>
                  <h4>Aspect Ratio</h4>
                  <p>Lock to specific ratios like 1:1, 16:9</p>
                </div>
                <div class="feature-card">
                  <mat-icon>rotate_right</mat-icon>
                  <h4>Rotation</h4>
                  <p>Rotate images in 90° increments</p>
                </div>
                <div class="feature-card">
                  <mat-icon>flip</mat-icon>
                  <h4>Flip</h4>
                  <p>Flip horizontally or vertically</p>
                </div>
                <div class="feature-card">
                  <mat-icon>zoom_in</mat-icon>
                  <h4>Zoom</h4>
                  <p>Zoom in/out with scale transform</p>
                </div>
                <div class="feature-card">
                  <mat-icon>circle</mat-icon>
                  <h4>Round Cropper</h4>
                  <p>Create circular avatar crops</p>
                </div>
                <div class="feature-card">
                  <mat-icon>photo_size_select_large</mat-icon>
                  <h4>Resize</h4>
                  <p>Output at specific dimensions</p>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="image-cropper-doc__tab-content">
            <section class="image-cropper-doc__section">
              <h2>Avatar Cropper</h2>
              <p>
                Perfect for profile picture uploads with 1:1 ratio and round
                preview.
              </p>

              <ax-code-tabs [tabs]="avatarCode"></ax-code-tabs>
            </section>

            <section class="image-cropper-doc__section">
              <h2>Image Transformations</h2>
              <p>Apply rotation, flip, and scale transformations.</p>

              @if (imageChangedEvent()) {
                <div class="transform-controls">
                  <button mat-mini-fab (click)="rotateLeft()">
                    <mat-icon>rotate_left</mat-icon>
                  </button>
                  <button mat-mini-fab (click)="rotateRight()">
                    <mat-icon>rotate_right</mat-icon>
                  </button>
                  <button mat-mini-fab (click)="flipHorizontal()">
                    <mat-icon>flip</mat-icon>
                  </button>
                  <button mat-mini-fab (click)="flipVertical()">
                    <mat-icon>flip</mat-icon>
                  </button>
                  <button mat-mini-fab (click)="zoomOut()">
                    <mat-icon>zoom_out</mat-icon>
                  </button>
                  <button mat-mini-fab (click)="zoomIn()">
                    <mat-icon>zoom_in</mat-icon>
                  </button>
                </div>
              } @else {
                <p class="hint-text">
                  Upload an image above to try transformations
                </p>
              }

              <ax-code-tabs [tabs]="transformCode"></ax-code-tabs>
            </section>

            <section class="image-cropper-doc__section">
              <h2>Output Formats</h2>
              <p>Get cropped images as base64, blob, or specific formats.</p>

              <ax-code-tabs [tabs]="outputCode"></ax-code-tabs>
            </section>

            <section class="image-cropper-doc__section">
              <h2>Event Handling</h2>
              <p>Handle cropping events for validation and processing.</p>

              <ax-code-tabs [tabs]="eventsCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="image-cropper-doc__tab-content">
            <section class="image-cropper-doc__section">
              <h2>Inputs</h2>
              <p>Configuration options for the image cropper.</p>

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
                      <td><code>imageChangedEvent</code></td>
                      <td>Event</td>
                      <td>-</td>
                      <td>File input change event</td>
                    </tr>
                    <tr>
                      <td><code>imageFile</code></td>
                      <td>Blob</td>
                      <td>-</td>
                      <td>Alternative: direct file/blob input</td>
                    </tr>
                    <tr>
                      <td><code>imageBase64</code></td>
                      <td>string</td>
                      <td>-</td>
                      <td>Alternative: base64 image input</td>
                    </tr>
                    <tr>
                      <td><code>maintainAspectRatio</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Lock aspect ratio during resize</td>
                    </tr>
                    <tr>
                      <td><code>aspectRatio</code></td>
                      <td>number</td>
                      <td>1</td>
                      <td>Ratio width/height (e.g., 16/9)</td>
                    </tr>
                    <tr>
                      <td><code>resizeToWidth</code></td>
                      <td>number</td>
                      <td>0</td>
                      <td>Output width (0 = original)</td>
                    </tr>
                    <tr>
                      <td><code>resizeToHeight</code></td>
                      <td>number</td>
                      <td>0</td>
                      <td>Output height (0 = original)</td>
                    </tr>
                    <tr>
                      <td><code>roundCropper</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Show circular crop area</td>
                    </tr>
                    <tr>
                      <td><code>format</code></td>
                      <td>string</td>
                      <td>'png'</td>
                      <td>Output format: png, jpeg, webp</td>
                    </tr>
                    <tr>
                      <td><code>transform</code></td>
                      <td>ImageTransform</td>
                      <td>&#123;&#125;</td>
                      <td>Scale, rotate, flip transforms</td>
                    </tr>
                    <tr>
                      <td><code>canvasRotation</code></td>
                      <td>number</td>
                      <td>0</td>
                      <td>Canvas rotation (multiples of 90)</td>
                    </tr>
                    <tr>
                      <td><code>autoCrop</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Emit crop on every change</td>
                    </tr>
                    <tr>
                      <td><code>onlyScaleDown</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Only resize if larger than target</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="image-cropper-doc__section">
              <h2>Outputs</h2>
              <p>Events emitted by the image cropper.</p>

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
                      <td><code>imageCropped</code></td>
                      <td>ImageCroppedEvent</td>
                      <td>Emitted when image is cropped</td>
                    </tr>
                    <tr>
                      <td><code>imageLoaded</code></td>
                      <td>LoadedImage</td>
                      <td>Emitted when image is loaded</td>
                    </tr>
                    <tr>
                      <td><code>cropperReady</code></td>
                      <td>Dimensions</td>
                      <td>Emitted when cropper is ready</td>
                    </tr>
                    <tr>
                      <td><code>loadImageFailed</code></td>
                      <td>void</td>
                      <td>Emitted on load failure</td>
                    </tr>
                    <tr>
                      <td><code>startCropImage</code></td>
                      <td>void</td>
                      <td>Emitted when cropping starts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="image-cropper-doc__section">
              <h2>ImageCroppedEvent</h2>
              <p>Properties available in the cropped event.</p>

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
                      <td><code>base64</code></td>
                      <td>string</td>
                      <td>Base64 encoded image</td>
                    </tr>
                    <tr>
                      <td><code>blob</code></td>
                      <td>Blob</td>
                      <td>Blob for upload</td>
                    </tr>
                    <tr>
                      <td><code>width</code></td>
                      <td>number</td>
                      <td>Output width in pixels</td>
                    </tr>
                    <tr>
                      <td><code>height</code></td>
                      <td>number</td>
                      <td>Output height in pixels</td>
                    </tr>
                    <tr>
                      <td><code>cropperPosition</code></td>
                      <td>CropperPosition</td>
                      <td>Position coordinates</td>
                    </tr>
                    <tr>
                      <td><code>imagePosition</code></td>
                      <td>CropperPosition</td>
                      <td>Image position in canvas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="image-cropper-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>

            <section class="image-cropper-doc__section">
              <h2>Custom Styling</h2>
              <p>Style the cropper to match your application theme.</p>

              <ax-code-tabs [tabs]="stylingCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="image-cropper-doc__tab-content">
            <section class="image-cropper-doc__section">
              <h2>Best Practices</h2>

              <div class="guidelines-grid">
                <div class="guideline guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Validate file types before loading</li>
                    <li>Set maximum dimensions for large images</li>
                    <li>Show loading indicator while processing</li>
                    <li>Provide clear instructions to users</li>
                    <li>Use appropriate output format for use case</li>
                  </ul>
                </div>

                <div class="guideline guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Allow unlimited file sizes</li>
                    <li>Skip error handling for failed loads</li>
                    <li>Use PNG for photos (use JPEG)</li>
                    <li>Resize server-side what can be done client-side</li>
                    <li>Forget mobile touch support testing</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="image-cropper-doc__section">
              <h2>Common Use Cases</h2>

              <div class="use-cases">
                <div class="use-case">
                  <mat-icon>account_circle</mat-icon>
                  <div>
                    <strong>Profile Avatars</strong>
                    <p>1:1 ratio, round cropper, 200x200px output</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>photo_library</mat-icon>
                  <div>
                    <strong>Cover Images</strong>
                    <p>16:9 ratio, resizeToWidth: 1200</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>badge</mat-icon>
                  <div>
                    <strong>ID Photos</strong>
                    <p>3:4 ratio, specific dimensions required</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>image</mat-icon>
                  <div>
                    <strong>Product Images</strong>
                    <p>1:1 ratio, high quality PNG output</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="image-cropper-doc__section">
              <h2>Performance Tips</h2>

              <div class="tips-list">
                <div class="tip">
                  <mat-icon>compress</mat-icon>
                  <div>
                    <strong>Limit Input Size</strong>
                    <p>Validate max file size (e.g., 5MB) before processing.</p>
                  </div>
                </div>
                <div class="tip">
                  <mat-icon>photo_size_select_large</mat-icon>
                  <div>
                    <strong>Set Output Dimensions</strong>
                    <p>Use resizeToWidth/Height to reduce memory usage.</p>
                  </div>
                </div>
                <div class="tip">
                  <mat-icon>image</mat-icon>
                  <div>
                    <strong>Choose Format Wisely</strong>
                    <p>
                      JPEG for photos, PNG for graphics, WebP for modern
                      browsers.
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
      .image-cropper-doc {
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

      .image-cropper-doc__tabs {
        margin-top: 1rem;
      }

      .image-cropper-doc__tab-content {
        padding: 1.5rem 0;
      }

      .image-cropper-doc__section {
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

      .cropper-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        width: 100%;
      }

      .upload-zone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 300px;
        border: 2px dashed var(--ax-border-default);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: var(--ax-brand-default);
          background: var(--ax-brand-faint);
        }

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: var(--ax-text-muted);
          margin-bottom: 1rem;
        }

        p {
          margin: 0 0 0.5rem;
          color: var(--ax-text-heading);
          font-weight: 500;
        }

        span {
          font-size: 0.875rem;
          color: var(--ax-text-muted);
        }
      }

      .cropper-wrapper {
        flex: 1;
        min-width: 300px;
        max-width: 600px;
      }

      .preview-section {
        display: flex;
        flex-direction: column;
        align-items: center;

        h4 {
          margin: 0 0 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }
      }

      .preview-image {
        max-width: 200px;
        max-height: 200px;
        border: 1px solid var(--ax-border-default);
        border-radius: 8px;
      }

      .preview-image.round-preview {
        border-radius: 50%;
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

      .transform-controls {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
      }

      .hint-text {
        color: var(--ax-text-muted);
        font-style: italic;
        font-size: 0.875rem;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 480px) {
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

      .use-cases {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .use-case {
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
export class ImageCropperDocComponent {
  // State signals
  imageChangedEvent = signal<Event | null>(null);
  croppedImage = signal<string>('');
  maintainAspectRatio = signal(true);
  aspectRatio = signal(1);
  resizeToWidth = signal(0);
  roundCropper = signal(false);
  rotation = signal(0);
  imageTransform = signal({ scale: 1, flipH: false, flipV: false });

  // Design tokens
  designTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--cropper-overlay-color',
      usage: 'Overlay outside crop area',
    },
    {
      category: 'Colors',
      cssVar: '--cropper-outline-color',
      usage: 'Crop area border',
    },
    {
      category: 'Layout',
      cssVar: '--ax-background-subtle',
      usage: 'Background color',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-md',
      usage: 'Control spacing',
    },
  ];

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent.set(event);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage.set(event.base64 || '');
  }

  imageLoaded(image: LoadedImage) {
    console.log('Image loaded:', image);
  }

  cropperReady() {
    console.log('Cropper ready');
  }

  loadImageFailed() {
    console.error('Failed to load image');
  }

  resetImage() {
    this.imageChangedEvent.set(null);
    this.croppedImage.set('');
    this.rotation.set(0);
    this.imageTransform.set({ scale: 1, flipH: false, flipV: false });
  }

  rotateLeft() {
    this.rotation.update((r) => r - 1);
  }

  rotateRight() {
    this.rotation.update((r) => r + 1);
  }

  flipHorizontal() {
    this.imageTransform.update((t) => ({ ...t, flipH: !t.flipH }));
  }

  flipVertical() {
    this.imageTransform.update((t) => ({ ...t, flipV: !t.flipV }));
  }

  zoomIn() {
    this.imageTransform.update((t) => ({
      ...t,
      scale: Math.min(t.scale + 0.1, 3),
    }));
  }

  zoomOut() {
    this.imageTransform.update((t) => ({
      ...t,
      scale: Math.max(t.scale - 0.1, 0.5),
    }));
  }

  // Code examples
  readonly basicCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<input type="file" accept="image/*" (change)="fileChangeEvent($event)" />

<image-cropper
  [imageChangedEvent]="imageChangedEvent"
  [maintainAspectRatio]="true"
  [aspectRatio]="1"
  [resizeToWidth]="256"
  [roundCropper]="false"
  format="png"
  (imageCropped)="imageCropped($event)"
  (imageLoaded)="imageLoaded($event)"
  (cropperReady)="cropperReady()"
  (loadImageFailed)="loadImageFailed()"
>
</image-cropper>

<img [src]="croppedImage" />`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  imports: [ImageCropperComponent],
  ...
})
export class MyComponent {
  imageChangedEvent: Event | null = null;
  croppedImage = '';

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64 || '';
  }

  imageLoaded() {
    console.log('Image loaded');
  }

  cropperReady() {
    console.log('Cropper ready');
  }

  loadImageFailed() {
    console.error('Load failed');
  }
}`,
    },
  ];

  readonly avatarCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Avatar cropper with round preview -->
<image-cropper
  [imageChangedEvent]="imageChangedEvent"
  [maintainAspectRatio]="true"
  [aspectRatio]="1"
  [resizeToWidth]="200"
  [resizeToHeight]="200"
  [roundCropper]="true"
  format="png"
  (imageCropped)="imageCropped($event)"
>
</image-cropper>

<!-- Preview with round styling -->
<img [src]="croppedImage" class="avatar-preview" />

<style>
  .avatar-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }
</style>`,
    },
  ];

  readonly transformCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { ImageTransform } from 'ngx-image-cropper';

export class MyComponent {
  canvasRotation = 0;
  transform: ImageTransform = {
    scale: 1,
    flipH: false,
    flipV: false
  };

  rotateLeft() {
    this.canvasRotation--;
  }

  rotateRight() {
    this.canvasRotation++;
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  zoomIn() {
    this.transform = {
      ...this.transform,
      scale: Math.min(this.transform.scale + 0.1, 3)
    };
  }

  zoomOut() {
    this.transform = {
      ...this.transform,
      scale: Math.max(this.transform.scale - 0.1, 0.5)
    };
  }
}`,
    },
    {
      label: 'HTML',
      language: 'html',
      code: `<image-cropper
  [imageChangedEvent]="imageChangedEvent"
  [canvasRotation]="canvasRotation"
  [transform]="transform"
  (imageCropped)="imageCropped($event)"
>
</image-cropper>

<div class="controls">
  <button (click)="rotateLeft()">Rotate Left</button>
  <button (click)="rotateRight()">Rotate Right</button>
  <button (click)="flipHorizontal()">Flip H</button>
  <button (click)="flipVertical()">Flip V</button>
  <button (click)="zoomIn()">Zoom +</button>
  <button (click)="zoomOut()">Zoom -</button>
</div>`,
    },
  ];

  readonly outputCode: CodeTab[] = [
    {
      label: 'Base64',
      language: 'typescript',
      code: `// Get base64 string for preview or storage
imageCropped(event: ImageCroppedEvent) {
  const base64 = event.base64;
  // Use directly in <img src="...">
  this.previewImage = base64;

  // Or store in database
  this.api.saveAvatar(base64);
}`,
    },
    {
      label: 'Blob',
      language: 'typescript',
      code: `// Get Blob for file upload
imageCropped(event: ImageCroppedEvent) {
  const blob = event.blob;
  if (blob) {
    // Upload to server
    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.png');
    this.http.post('/api/upload', formData).subscribe();
  }
}`,
    },
    {
      label: 'JPEG Quality',
      language: 'html',
      code: `<!-- Use JPEG with quality setting for photos -->
<image-cropper
  [imageChangedEvent]="imageChangedEvent"
  format="jpeg"
  [imageQuality]="80"
  (imageCropped)="imageCropped($event)"
>
</image-cropper>`,
    },
  ];

  readonly eventsCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import {
  ImageCroppedEvent,
  LoadedImage,
  Dimensions
} from 'ngx-image-cropper';

export class MyComponent {
  imageCropped(event: ImageCroppedEvent) {
    console.log('Cropped:', {
      width: event.width,
      height: event.height,
      base64Length: event.base64?.length
    });
  }

  imageLoaded(image: LoadedImage) {
    // Image loaded, can access original dimensions
    console.log('Original size:', image.original.size);
  }

  cropperReady(dimensions: Dimensions) {
    // Cropper is initialized
    console.log('Cropper dimensions:', dimensions);
  }

  loadImageFailed() {
    // Handle error - show message to user
    this.snackBar.open('Failed to load image', 'OK');
  }
}`,
    },
  ];

  readonly stylingCode: CodeTab[] = [
    {
      label: 'SCSS',
      language: 'scss',
      code: `// Custom styling for image cropper
::ng-deep image-cropper {
  .ngx-ic-overlay {
    // Semi-transparent overlay outside crop area
    outline-color: rgba(0, 0, 0, 0.6);
  }

  .ngx-ic-cropper {
    // Crop area border
    outline: 2px dashed var(--ax-brand-default);
  }

  .ngx-ic-move {
    // Cursor when moving
    cursor: move;
  }

  .ngx-ic-resize {
    // Resize handles
    background: var(--ax-brand-default);
    border-radius: 50%;
    width: 12px;
    height: 12px;
  }
}

// Round cropper specific
::ng-deep image-cropper.round-cropper {
  .ngx-ic-cropper {
    border-radius: 50%;
  }
}`,
    },
  ];
}
