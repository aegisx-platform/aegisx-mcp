import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import {
  AxSkeletonComponent,
  AxSkeletonCardComponent,
  AxSkeletonAvatarComponent,
  AxSkeletonTableComponent,
  AxSkeletonListComponent,
} from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken, CodeTab } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-skeleton-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    FormsModule,
    AxSkeletonComponent,
    AxSkeletonCardComponent,
    AxSkeletonAvatarComponent,
    AxSkeletonTableComponent,
    AxSkeletonListComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="skeleton-doc">
      <ax-doc-header
        title="Skeleton"
        icon="view_stream"
        description="Skeleton is a placeholder to display instead of the actual content. Improve perceived performance with skeleton screens while content is loading."
        [breadcrumbs]="[
          { label: 'Feedback', link: '/docs/components/aegisx/feedback/alert' },
          { label: 'Skeleton' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxSkeletonComponent } from '&#64;aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="skeleton-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="skeleton-doc__tab-content">
            <!-- Shapes Section -->
            <section class="skeleton-doc__section">
              <h2>Shapes</h2>
              <p>
                Skeleton comes in different shapes to match your content layout.
                Use rectangle for images, circle for avatars, and rounded for
                cards.
              </p>

              <ax-live-preview
                variant="white"
                direction="column"
                gap="var(--ax-spacing-xl)"
              >
                <!-- Rectangle shapes with different sizes -->
                <div class="shapes-demo">
                  <h4 class="shapes-demo__title">Rectangle</h4>
                  <div class="shapes-demo__row">
                    <ax-skeleton
                      variant="rectangular"
                      width="100%"
                      height="100px"
                    ></ax-skeleton>
                    <ax-skeleton
                      variant="rectangular"
                      width="100%"
                      height="50px"
                    ></ax-skeleton>
                  </div>
                </div>

                <!-- Rounded shapes -->
                <div class="shapes-demo">
                  <h4 class="shapes-demo__title">Rounded</h4>
                  <div class="shapes-demo__row">
                    <ax-skeleton
                      variant="rounded"
                      width="100%"
                      height="100px"
                    ></ax-skeleton>
                    <ax-skeleton
                      variant="rounded"
                      width="100%"
                      height="50px"
                    ></ax-skeleton>
                  </div>
                </div>

                <!-- Circle & Square -->
                <div class="shapes-demo">
                  <h4 class="shapes-demo__title">Circle & Square</h4>
                  <div class="shapes-demo__row shapes-demo__row--inline">
                    <ax-skeleton
                      variant="circular"
                      width="4rem"
                      height="4rem"
                    ></ax-skeleton>
                    <ax-skeleton
                      variant="circular"
                      width="3rem"
                      height="3rem"
                    ></ax-skeleton>
                    <ax-skeleton
                      variant="rectangular"
                      width="4rem"
                      height="4rem"
                    ></ax-skeleton>
                    <ax-skeleton
                      variant="rectangular"
                      width="3rem"
                      height="3rem"
                    ></ax-skeleton>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="shapesCode"></ax-code-tabs>
            </section>

            <!-- Sizes Section -->
            <section class="skeleton-doc__section">
              <h2>Sizes</h2>
              <p>
                Control the width and height of skeletons using CSS values.
                Common patterns include full-width blocks, fixed dimensions, and
                percentages.
              </p>

              <ax-live-preview
                variant="white"
                direction="column"
                gap="var(--ax-spacing-lg)"
              >
                <div class="size-grid">
                  @for (size of sizes; track size.label) {
                    <div class="size-item">
                      <span class="size-label">{{ size.label }}</span>
                      <ax-skeleton
                        [variant]="size.variant"
                        [width]="size.width"
                        [height]="size.height"
                      ></ax-skeleton>
                    </div>
                  }
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="sizesCode"></ax-code-tabs>
            </section>

            <!-- Animation Section -->
            <section class="skeleton-doc__section">
              <h2>Animation</h2>
              <p>
                Two animation styles are available:
                <strong>pulse</strong> (default) fades in and out, while
                <strong>wave</strong> creates a shimmer effect. Use
                <strong>none</strong> to disable animation.
              </p>

              <ax-live-preview
                variant="white"
                direction="row"
                gap="var(--ax-spacing-xl)"
              >
                <div class="animation-demo">
                  <span class="demo-label">Pulse (default)</span>
                  <ax-skeleton
                    variant="rounded"
                    width="200px"
                    height="100px"
                    animation="pulse"
                  ></ax-skeleton>
                </div>
                <div class="animation-demo">
                  <span class="demo-label">Wave</span>
                  <ax-skeleton
                    variant="rounded"
                    width="200px"
                    height="100px"
                    animation="wave"
                  ></ax-skeleton>
                </div>
                <div class="animation-demo">
                  <span class="demo-label">None</span>
                  <ax-skeleton
                    variant="rounded"
                    width="200px"
                    height="100px"
                    animation="none"
                  ></ax-skeleton>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="animationCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Real-World Examples Tab -->
        <mat-tab label="Examples">
          <div class="skeleton-doc__tab-content">
            <!-- Product Card -->
            <section class="skeleton-doc__section">
              <h2>Product Card</h2>
              <p>E-commerce product card loading state.</p>

              <ax-live-preview
                variant="white"
                direction="row"
                gap="var(--ax-spacing-lg)"
              >
                <div class="product-skeleton">
                  <ax-skeleton
                    variant="rectangular"
                    width="100%"
                    height="200px"
                  ></ax-skeleton>
                  <div class="product-skeleton__content">
                    <ax-skeleton variant="text" width="70%"></ax-skeleton>
                    <ax-skeleton variant="text" width="40%"></ax-skeleton>
                    <div class="product-skeleton__price">
                      <ax-skeleton
                        variant="text"
                        width="60px"
                        height="24px"
                      ></ax-skeleton>
                      <ax-skeleton
                        variant="circular"
                        width="32px"
                        height="32px"
                      ></ax-skeleton>
                    </div>
                  </div>
                </div>
                <div class="product-skeleton">
                  <ax-skeleton
                    variant="rectangular"
                    width="100%"
                    height="200px"
                  ></ax-skeleton>
                  <div class="product-skeleton__content">
                    <ax-skeleton variant="text" width="85%"></ax-skeleton>
                    <ax-skeleton variant="text" width="50%"></ax-skeleton>
                    <div class="product-skeleton__price">
                      <ax-skeleton
                        variant="text"
                        width="60px"
                        height="24px"
                      ></ax-skeleton>
                      <ax-skeleton
                        variant="circular"
                        width="32px"
                        height="32px"
                      ></ax-skeleton>
                    </div>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="productCode"></ax-code-tabs>
            </section>

            <!-- Blog Article -->
            <section class="skeleton-doc__section">
              <h2>Blog Article</h2>
              <p>Article or blog post loading state.</p>

              <ax-live-preview variant="white">
                <div class="article-skeleton">
                  <ax-skeleton
                    variant="circular"
                    width="48px"
                    height="48px"
                  ></ax-skeleton>
                  <div class="article-skeleton__meta">
                    <ax-skeleton variant="text" width="120px"></ax-skeleton>
                    <ax-skeleton variant="text" width="80px"></ax-skeleton>
                  </div>
                  <ax-skeleton
                    variant="rounded"
                    width="100%"
                    height="250px"
                    class="article-skeleton__image"
                  ></ax-skeleton>
                  <ax-skeleton variant="text" width="100%"></ax-skeleton>
                  <ax-skeleton variant="text" width="100%"></ax-skeleton>
                  <ax-skeleton variant="text" width="75%"></ax-skeleton>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="articleCode"></ax-code-tabs>
            </section>

            <!-- Video Thumbnail -->
            <section class="skeleton-doc__section">
              <h2>Video Thumbnail</h2>
              <p>YouTube/Video platform style loading.</p>

              <ax-live-preview
                variant="white"
                direction="row"
                gap="var(--ax-spacing-lg)"
              >
                @for (i of [1, 2, 3]; track i) {
                  <div class="video-skeleton">
                    <ax-skeleton
                      variant="rounded"
                      width="100%"
                      height="120px"
                    ></ax-skeleton>
                    <div class="video-skeleton__info">
                      <ax-skeleton
                        variant="circular"
                        width="36px"
                        height="36px"
                      ></ax-skeleton>
                      <div class="video-skeleton__text">
                        <ax-skeleton variant="text" width="100%"></ax-skeleton>
                        <ax-skeleton variant="text" width="60%"></ax-skeleton>
                      </div>
                    </div>
                  </div>
                }
              </ax-live-preview>

              <ax-code-tabs [tabs]="videoCode"></ax-code-tabs>
            </section>

            <!-- Payment Card -->
            <section class="skeleton-doc__section">
              <h2>Payment Card</h2>
              <p>Credit card or payment method loading.</p>

              <ax-live-preview variant="white">
                <div class="payment-skeleton">
                  <div class="payment-skeleton__header">
                    <ax-skeleton
                      variant="rounded"
                      width="48px"
                      height="32px"
                    ></ax-skeleton>
                    <ax-skeleton variant="text" width="80px"></ax-skeleton>
                  </div>
                  <ax-skeleton
                    variant="text"
                    width="180px"
                    height="20px"
                  ></ax-skeleton>
                  <div class="payment-skeleton__footer">
                    <ax-skeleton variant="text" width="100px"></ax-skeleton>
                    <ax-skeleton variant="text" width="60px"></ax-skeleton>
                  </div>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="paymentCode"></ax-code-tabs>
            </section>

            <!-- Shopping Cart -->
            <section class="skeleton-doc__section">
              <h2>Shopping Cart Item</h2>
              <p>Cart line item loading state.</p>

              <ax-live-preview variant="white">
                <div class="cart-skeleton">
                  @for (i of [1, 2]; track i) {
                    <div class="cart-skeleton__item">
                      <ax-skeleton
                        variant="rounded"
                        width="80px"
                        height="80px"
                      ></ax-skeleton>
                      <div class="cart-skeleton__details">
                        <ax-skeleton variant="text" width="200px"></ax-skeleton>
                        <ax-skeleton variant="text" width="120px"></ax-skeleton>
                        <div class="cart-skeleton__actions">
                          <ax-skeleton
                            variant="rounded"
                            width="100px"
                            height="32px"
                          ></ax-skeleton>
                          <ax-skeleton
                            variant="text"
                            width="60px"
                          ></ax-skeleton>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="cartCode"></ax-code-tabs>
            </section>

            <!-- Comment Section -->
            <section class="skeleton-doc__section">
              <h2>Comments</h2>
              <p>Social media or blog comments loading.</p>

              <ax-live-preview variant="white">
                <div class="comments-skeleton">
                  @for (i of [1, 2, 3]; track i) {
                    <div class="comment-skeleton">
                      <ax-skeleton
                        variant="circular"
                        width="40px"
                        height="40px"
                      ></ax-skeleton>
                      <div class="comment-skeleton__content">
                        <div class="comment-skeleton__header">
                          <ax-skeleton
                            variant="text"
                            width="100px"
                          ></ax-skeleton>
                          <ax-skeleton
                            variant="text"
                            width="60px"
                          ></ax-skeleton>
                        </div>
                        <ax-skeleton
                          variant="text"
                          [lines]="2"
                          width="100%"
                        ></ax-skeleton>
                      </div>
                    </div>
                  }
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="commentsCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Data Table Tab -->
        <mat-tab label="DataTable">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>DataTable Loading</h2>
              <p>
                Use the skeleton table preset for loading data tables. Configure
                rows and columns to match your actual table structure.
              </p>

              <ax-live-preview variant="white">
                <ax-skeleton-table [rows]="5" [columns]="4"></ax-skeleton-table>
              </ax-live-preview>

              <ax-code-tabs [tabs]="tableCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>Custom DataTable</h2>
              <p>
                Build a custom data table skeleton with specific column widths.
              </p>

              <ax-live-preview variant="white">
                <div class="custom-table-skeleton">
                  <!-- Header -->
                  <div class="custom-table-skeleton__header">
                    <ax-skeleton
                      variant="text"
                      width="32px"
                      height="16px"
                    ></ax-skeleton>
                    <ax-skeleton
                      variant="text"
                      width="120px"
                      height="16px"
                    ></ax-skeleton>
                    <ax-skeleton
                      variant="text"
                      width="200px"
                      height="16px"
                    ></ax-skeleton>
                    <ax-skeleton
                      variant="text"
                      width="100px"
                      height="16px"
                    ></ax-skeleton>
                    <ax-skeleton
                      variant="text"
                      width="80px"
                      height="16px"
                    ></ax-skeleton>
                  </div>
                  <!-- Rows -->
                  @for (i of [1, 2, 3, 4, 5]; track i) {
                    <div class="custom-table-skeleton__row">
                      <ax-skeleton
                        variant="circular"
                        width="32px"
                        height="32px"
                      ></ax-skeleton>
                      <ax-skeleton variant="text" width="100px"></ax-skeleton>
                      <ax-skeleton variant="text" width="180px"></ax-skeleton>
                      <ax-skeleton
                        variant="rounded"
                        width="80px"
                        height="24px"
                      ></ax-skeleton>
                      <ax-skeleton variant="text" width="60px"></ax-skeleton>
                    </div>
                  }
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="customTableCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Presets Tab -->
        <mat-tab label="Presets">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>Card Preset</h2>
              <p>Pre-built card skeleton with configurable options.</p>

              <ax-live-preview
                variant="white"
                direction="row"
                gap="var(--ax-spacing-lg)"
              >
                <div style="width: 280px;">
                  <ax-skeleton-card></ax-skeleton-card>
                </div>
                <div style="width: 280px;">
                  <ax-skeleton-card [showActions]="true"></ax-skeleton-card>
                </div>
                <div style="width: 320px;">
                  <ax-skeleton-card [horizontal]="true"></ax-skeleton-card>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="cardPresetCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>Avatar Preset</h2>
              <p>Pre-built avatar skeleton with size variants.</p>

              <ax-live-preview
                variant="white"
                direction="row"
                gap="var(--ax-spacing-xl)"
                align="center"
              >
                <ax-skeleton-avatar size="sm"></ax-skeleton-avatar>
                <ax-skeleton-avatar size="md"></ax-skeleton-avatar>
                <ax-skeleton-avatar
                  size="lg"
                  [showSubtitle]="true"
                ></ax-skeleton-avatar>
                <ax-skeleton-avatar
                  size="xl"
                  [showSubtitle]="true"
                ></ax-skeleton-avatar>
              </ax-live-preview>

              <ax-code-tabs [tabs]="avatarPresetCode"></ax-code-tabs>
            </section>

            <section class="skeleton-doc__section">
              <h2>List Preset</h2>
              <p>Pre-built list skeleton for common list layouts.</p>

              <ax-live-preview
                variant="white"
                direction="row"
                gap="var(--ax-spacing-xl)"
              >
                <div style="width: 300px;">
                  <ax-skeleton-list [items]="3"></ax-skeleton-list>
                </div>
                <div style="width: 300px;">
                  <ax-skeleton-list
                    [items]="3"
                    [showAction]="true"
                  ></ax-skeleton-list>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="listPresetCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Interactive Demo Tab -->
        <mat-tab label="Playground">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>Interactive Playground</h2>
              <p>
                Configure skeleton properties and see the result in real-time.
              </p>

              <div class="playground">
                <div class="playground__controls">
                  <mat-form-field appearance="outline">
                    <mat-label>Variant</mat-label>
                    <mat-select [(ngModel)]="playgroundVariant">
                      <mat-option value="text">Text</mat-option>
                      <mat-option value="circular">Circular</mat-option>
                      <mat-option value="rectangular">Rectangular</mat-option>
                      <mat-option value="rounded">Rounded</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Animation</mat-label>
                    <mat-select [(ngModel)]="playgroundAnimation">
                      <mat-option value="pulse">Pulse</mat-option>
                      <mat-option value="wave">Wave</mat-option>
                      <mat-option value="none">None</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Width</mat-label>
                    <mat-select [(ngModel)]="playgroundWidth">
                      <mat-option value="100%">100%</mat-option>
                      <mat-option value="200px">200px</mat-option>
                      <mat-option value="300px">300px</mat-option>
                      <mat-option value="50%">50%</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Height</mat-label>
                    <mat-select [(ngModel)]="playgroundHeight">
                      <mat-option value="1em">1em (text)</mat-option>
                      <mat-option value="50px">50px</mat-option>
                      <mat-option value="100px">100px</mat-option>
                      <mat-option value="150px">150px</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <ax-live-preview variant="white">
                  <ax-skeleton
                    [variant]="playgroundVariant"
                    [animation]="playgroundAnimation"
                    [width]="playgroundWidth"
                    [height]="playgroundHeight"
                  ></ax-skeleton>
                </ax-live-preview>

                <div class="playground__code">
                  <pre><code>&lt;ax-skeleton
  variant="{{ playgroundVariant }}"
  animation="{{ playgroundAnimation }}"
  width="{{ playgroundWidth }}"
  height="{{ playgroundHeight }}"
&gt;&lt;/ax-skeleton&gt;</code></pre>
                </div>
              </div>
            </section>

            <section class="skeleton-doc__section">
              <h2>Loading Simulation</h2>
              <p>Click the button to simulate a loading state.</p>

              <ax-live-preview
                variant="white"
                direction="column"
                gap="var(--ax-spacing-md)"
              >
                <button
                  mat-flat-button
                  color="primary"
                  (click)="simulateLoading()"
                >
                  <mat-icon>refresh</mat-icon>
                  {{ isLoading() ? 'Loading...' : 'Simulate Loading' }}
                </button>

                <div class="simulation-content">
                  @if (isLoading()) {
                    <div class="simulation-skeleton">
                      <ax-skeleton
                        variant="circular"
                        width="64px"
                        height="64px"
                      ></ax-skeleton>
                      <div class="simulation-skeleton__text">
                        <ax-skeleton variant="text" width="150px"></ax-skeleton>
                        <ax-skeleton variant="text" width="100px"></ax-skeleton>
                      </div>
                    </div>
                  } @else {
                    <div class="simulation-content__loaded">
                      <div class="avatar-placeholder">
                        <mat-icon>person</mat-icon>
                      </div>
                      <div>
                        <strong>John Doe</strong>
                        <p>Software Engineer</p>
                      </div>
                    </div>
                  }
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>AxSkeletonComponent</h2>
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
                      <td><code>variant</code></td>
                      <td>'text' | 'circular' | 'rectangular' | 'rounded'</td>
                      <td>'text'</td>
                      <td>Shape of the skeleton</td>
                    </tr>
                    <tr>
                      <td><code>animation</code></td>
                      <td>'pulse' | 'wave' | 'none'</td>
                      <td>'pulse'</td>
                      <td>Animation type</td>
                    </tr>
                    <tr>
                      <td><code>width</code></td>
                      <td>string</td>
                      <td>'100%'</td>
                      <td>Width (CSS value)</td>
                    </tr>
                    <tr>
                      <td><code>height</code></td>
                      <td>string</td>
                      <td>'1em' for text</td>
                      <td>Height (CSS value)</td>
                    </tr>
                    <tr>
                      <td><code>lines</code></td>
                      <td>number</td>
                      <td>1</td>
                      <td>Number of lines (text variant)</td>
                    </tr>
                    <tr>
                      <td><code>lastLineWidth</code></td>
                      <td>string</td>
                      <td>'60%'</td>
                      <td>Width of the last line when lines > 1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="skeleton-doc__section">
              <h2>Preset Components</h2>
              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Key Inputs</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>ax-skeleton-card</code></td>
                      <td>showImage, showActions, horizontal</td>
                      <td>Card layout skeleton</td>
                    </tr>
                    <tr>
                      <td><code>ax-skeleton-avatar</code></td>
                      <td>size, showText, showSubtitle</td>
                      <td>Avatar with text skeleton</td>
                    </tr>
                    <tr>
                      <td><code>ax-skeleton-table</code></td>
                      <td>rows, columns, showHeader</td>
                      <td>Data table skeleton</td>
                    </tr>
                    <tr>
                      <td><code>ax-skeleton-list</code></td>
                      <td>items, showAvatar, showAction</td>
                      <td>List items skeleton</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Design Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="skeleton-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="skeleton-doc__tab-content">
            <section class="skeleton-doc__section">
              <h2>Best Practices</h2>

              <div class="skeleton-doc__guidelines">
                <div
                  class="skeleton-doc__guideline skeleton-doc__guideline--do"
                >
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Match skeleton shapes to actual content layout</li>
                    <li>Use consistent animation across related components</li>
                    <li>
                      Show skeleton for predictable loading times (&lt; 5s)
                    </li>
                    <li>Maintain similar dimensions to actual content</li>
                    <li>Use presets for common UI patterns</li>
                    <li>Respect prefers-reduced-motion preference</li>
                  </ul>
                </div>

                <div
                  class="skeleton-doc__guideline skeleton-doc__guideline--dont"
                >
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>
                      Use skeleton for very short loading times (&lt; 300ms)
                    </li>
                    <li>Create overly complex skeleton layouts</li>
                    <li>Show skeleton indefinitely without timeout</li>
                    <li>Mix different animation styles on one page</li>
                    <li>
                      Use skeleton for empty states (use EmptyState component)
                    </li>
                    <li>
                      Use skeleton for error states (use ErrorState component)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="skeleton-doc__section">
              <h2>When to Use</h2>
              <div class="skeleton-doc__use-cases">
                <div class="use-case use-case--do">
                  <mat-icon>check</mat-icon>
                  <div>
                    <strong>Initial page load</strong>
                    <p>Show skeleton while fetching initial data from API</p>
                  </div>
                </div>
                <div class="use-case use-case--do">
                  <mat-icon>check</mat-icon>
                  <div>
                    <strong>Lazy-loaded content</strong>
                    <p>Below-the-fold content or infinite scroll items</p>
                  </div>
                </div>
                <div class="use-case use-case--do">
                  <mat-icon>check</mat-icon>
                  <div>
                    <strong>Tab/view switching</strong>
                    <p>When switching tabs loads new data</p>
                  </div>
                </div>
                <div class="use-case use-case--dont">
                  <mat-icon>close</mat-icon>
                  <div>
                    <strong>Form submission</strong>
                    <p>Use loading spinner or button loading state instead</p>
                  </div>
                </div>
                <div class="use-case use-case--dont">
                  <mat-icon>close</mat-icon>
                  <div>
                    <strong>No data</strong>
                    <p>Use EmptyState component for empty results</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="skeleton-doc__section">
              <h2>Accessibility</h2>
              <ul class="skeleton-doc__a11y-list">
                <li>
                  Skeleton components use <code>aria-hidden="true"</code> as
                  they are decorative
                </li>
                <li>Add <code>aria-busy="true"</code> to loading containers</li>
                <li>
                  Provide <code>aria-label</code> on loading regions for screen
                  readers
                </li>
                <li>
                  Animation respects
                  <code>prefers-reduced-motion</code> preference
                </li>
                <li>Ensure sufficient color contrast for visibility</li>
              </ul>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .skeleton-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .skeleton-doc__tabs {
        margin-top: 2rem;
      }

      .skeleton-doc__tab-content {
        padding: 1.5rem 0;
      }

      .skeleton-doc__section {
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
          max-width: 700px;
        }
      }

      /* Shapes Demo */
      .shapes-demo {
        width: 100%;

        &__title {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ax-text-subtle);
          margin-bottom: 0.75rem;
        }

        &__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;

          &--inline {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
          }
        }
      }

      /* Size Grid */
      .size-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .size-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .size-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--ax-text-subtle);
        text-transform: uppercase;
      }

      /* Animation Demo */
      .animation-demo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .demo-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--ax-text-subtle);
        text-transform: uppercase;
      }

      /* Product Skeleton */
      .product-skeleton {
        width: 200px;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;

        &__content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        &__price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
        }
      }

      /* Article Skeleton */
      .article-skeleton {
        max-width: 500px;
        display: grid;
        grid-template-columns: 48px 1fr;
        gap: 0.75rem;

        &__meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          justify-content: center;
        }

        &__image {
          grid-column: 1 / -1;
          margin: 0.5rem 0;
        }

        ax-skeleton[variant='text'] {
          grid-column: 1 / -1;
        }
      }

      /* Video Skeleton */
      .video-skeleton {
        width: 200px;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        &__info {
          display: flex;
          gap: 0.75rem;
        }

        &__text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
      }

      /* Payment Skeleton */
      .payment-skeleton {
        width: 300px;
        padding: 1.25rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: var(--ax-radius-lg);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

        &__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        &__footer {
          display: flex;
          justify-content: space-between;
        }

        ax-skeleton {
          --ax-background-subtle: rgba(255, 255, 255, 0.3);
        }
      }

      /* Cart Skeleton */
      .cart-skeleton {
        max-width: 500px;
        display: flex;
        flex-direction: column;
        gap: 1rem;

        &__item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: var(--ax-background-default);
          border: 1px solid var(--ax-border-default);
          border-radius: var(--ax-radius-lg);
        }

        &__details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        &__actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
      }

      /* Comments Skeleton */
      .comments-skeleton {
        max-width: 500px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .comment-skeleton {
        display: flex;
        gap: 0.75rem;

        &__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        &__header {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
      }

      /* Custom Table Skeleton */
      .custom-table-skeleton {
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;

        &__header {
          display: grid;
          grid-template-columns: 50px 140px 1fr 120px 100px;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: var(--ax-background-subtle);
          border-bottom: 1px solid var(--ax-border-default);
        }

        &__row {
          display: grid;
          grid-template-columns: 50px 140px 1fr 120px 100px;
          gap: 1rem;
          padding: 0.75rem 1rem;
          align-items: center;
          border-bottom: 1px solid var(--ax-border-muted);

          &:last-child {
            border-bottom: none;
          }
        }
      }

      /* Playground */
      .playground {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

        &__controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;

          mat-form-field {
            width: 150px;
          }
        }

        &__code {
          background: var(--ax-background-subtle);
          padding: 1rem;
          border-radius: var(--ax-radius-md);
          overflow-x: auto;

          pre {
            margin: 0;
          }

          code {
            font-family: 'Fira Code', monospace;
            font-size: 0.875rem;
          }
        }
      }

      /* Simulation */
      .simulation-content {
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .simulation-skeleton {
        display: flex;
        gap: 1rem;
        align-items: center;

        &__text {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
      }

      .simulation-content__loaded {
        display: flex;
        gap: 1rem;
        align-items: center;

        .avatar-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--ax-brand-faint);
          color: var(--ax-brand-default);
          display: flex;
          align-items: center;
          justify-content: center;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
          }
        }

        strong {
          display: block;
          font-size: 1.125rem;
        }

        p {
          margin: 0.25rem 0 0;
          color: var(--ax-text-secondary);
        }
      }

      /* API Table */
      .api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);

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
            font-size: 0.75rem;
            text-transform: uppercase;
          }

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: var(--ax-radius-sm);
            font-size: 0.8125rem;
          }

          tr:last-child td {
            border-bottom: none;
          }
        }
      }

      /* Guidelines */
      .skeleton-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .skeleton-doc__guideline {
        padding: var(--ax-spacing-lg, 1rem);
        border-radius: var(--ax-radius-lg, 0.75rem);

        h4 {
          display: flex;
          align-items: center;
          gap: var(--ax-spacing-xs, 0.25rem);
          font-size: var(--ax-text-base, 1rem);
          font-weight: 600;
          margin: 0 0 var(--ax-spacing-sm, 0.5rem) 0;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        ul {
          margin: 0;
          padding-left: var(--ax-spacing-lg, 1rem);

          li {
            font-size: var(--ax-text-sm, 0.875rem);
            margin-bottom: var(--ax-spacing-xs, 0.25rem);
          }
        }
      }

      .skeleton-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .skeleton-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      /* Use Cases */
      .skeleton-doc__use-cases {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .use-case {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-md);

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        &--do mat-icon {
          color: var(--ax-success-default);
        }
        &--dont mat-icon {
          color: var(--ax-error-default);
        }

        div {
          strong {
            display: block;
            font-size: 0.875rem;
            color: var(--ax-text-heading);
          }

          p {
            margin: 0.25rem 0 0;
            font-size: 0.8125rem;
            color: var(--ax-text-secondary);
          }
        }
      }

      /* Accessibility List */
      .skeleton-doc__a11y-list {
        margin: 0;
        padding-left: var(--ax-spacing-lg, 1rem);

        li {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin-bottom: var(--ax-spacing-sm, 0.5rem);
        }

        code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs, 0.75rem);
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm, 0.25rem);
        }
      }
    `,
  ],
})
export class SkeletonDocComponent {
  // Playground state
  playgroundVariant: 'text' | 'circular' | 'rectangular' | 'rounded' =
    'rounded';
  playgroundAnimation: 'pulse' | 'wave' | 'none' = 'pulse';
  playgroundWidth = '200px';
  playgroundHeight = '100px';

  // Loading simulation
  isLoading = signal(false);

  // Size examples
  sizes = [
    {
      label: 'Full width',
      variant: 'rounded' as const,
      width: '100%',
      height: '60px',
    },
    {
      label: '200px fixed',
      variant: 'rounded' as const,
      width: '200px',
      height: '60px',
    },
    {
      label: '50% width',
      variant: 'rounded' as const,
      width: '50%',
      height: '60px',
    },
    {
      label: 'Circle 48px',
      variant: 'circular' as const,
      width: '48px',
      height: '48px',
    },
    {
      label: 'Square 64px',
      variant: 'rectangular' as const,
      width: '64px',
      height: '64px',
    },
    {
      label: 'Text line',
      variant: 'text' as const,
      width: '80%',
      height: '1em',
    },
  ];

  simulateLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 2000);
  }

  // Code examples
  readonly shapesCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Rectangle -->
<ax-skeleton variant="rectangular" width="100%" height="100px"></ax-skeleton>

<!-- Rounded -->
<ax-skeleton variant="rounded" width="100%" height="100px"></ax-skeleton>

<!-- Circle -->
<ax-skeleton variant="circular" width="4rem" height="4rem"></ax-skeleton>

<!-- Square -->
<ax-skeleton variant="rectangular" width="4rem" height="4rem"></ax-skeleton>`,
    },
  ];

  readonly sizesCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Full width -->
<ax-skeleton variant="rounded" width="100%" height="60px"></ax-skeleton>

<!-- Fixed width -->
<ax-skeleton variant="rounded" width="200px" height="60px"></ax-skeleton>

<!-- Percentage -->
<ax-skeleton variant="rounded" width="50%" height="60px"></ax-skeleton>

<!-- Circle with rem -->
<ax-skeleton variant="circular" width="3rem" height="3rem"></ax-skeleton>`,
    },
  ];

  readonly animationCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Pulse (default) -->
<ax-skeleton animation="pulse"></ax-skeleton>

<!-- Wave shimmer effect -->
<ax-skeleton animation="wave"></ax-skeleton>

<!-- No animation -->
<ax-skeleton animation="none"></ax-skeleton>`,
    },
  ];

  readonly productCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<div class="product-card">
  <!-- Product Image -->
  <ax-skeleton variant="rectangular" width="100%" height="200px"></ax-skeleton>

  <div class="product-content">
    <!-- Title -->
    <ax-skeleton variant="text" width="70%"></ax-skeleton>
    <!-- Subtitle -->
    <ax-skeleton variant="text" width="40%"></ax-skeleton>

    <div class="product-footer">
      <!-- Price -->
      <ax-skeleton variant="text" width="60px" height="24px"></ax-skeleton>
      <!-- Add to cart button -->
      <ax-skeleton variant="circular" width="32px" height="32px"></ax-skeleton>
    </div>
  </div>
</div>`,
    },
  ];

  readonly articleCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<article class="blog-post">
  <!-- Author avatar -->
  <ax-skeleton variant="circular" width="48px" height="48px"></ax-skeleton>

  <div class="author-meta">
    <ax-skeleton variant="text" width="120px"></ax-skeleton>
    <ax-skeleton variant="text" width="80px"></ax-skeleton>
  </div>

  <!-- Featured image -->
  <ax-skeleton variant="rounded" width="100%" height="250px"></ax-skeleton>

  <!-- Content paragraphs -->
  <ax-skeleton variant="text" width="100%"></ax-skeleton>
  <ax-skeleton variant="text" width="100%"></ax-skeleton>
  <ax-skeleton variant="text" width="75%"></ax-skeleton>
</article>`,
    },
  ];

  readonly videoCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<div class="video-card">
  <!-- Thumbnail -->
  <ax-skeleton variant="rounded" width="100%" height="120px"></ax-skeleton>

  <div class="video-info">
    <!-- Channel avatar -->
    <ax-skeleton variant="circular" width="36px" height="36px"></ax-skeleton>

    <div class="video-text">
      <!-- Title -->
      <ax-skeleton variant="text" width="100%"></ax-skeleton>
      <!-- Channel name & views -->
      <ax-skeleton variant="text" width="60%"></ax-skeleton>
    </div>
  </div>
</div>`,
    },
  ];

  readonly paymentCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<div class="payment-card">
  <div class="card-header">
    <!-- Card brand logo -->
    <ax-skeleton variant="rounded" width="48px" height="32px"></ax-skeleton>
    <!-- Card type -->
    <ax-skeleton variant="text" width="80px"></ax-skeleton>
  </div>

  <!-- Card number -->
  <ax-skeleton variant="text" width="180px" height="20px"></ax-skeleton>

  <div class="card-footer">
    <!-- Cardholder name -->
    <ax-skeleton variant="text" width="100px"></ax-skeleton>
    <!-- Expiry -->
    <ax-skeleton variant="text" width="60px"></ax-skeleton>
  </div>
</div>`,
    },
  ];

  readonly cartCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<div class="cart-item">
  <!-- Product thumbnail -->
  <ax-skeleton variant="rounded" width="80px" height="80px"></ax-skeleton>

  <div class="item-details">
    <!-- Product name -->
    <ax-skeleton variant="text" width="200px"></ax-skeleton>
    <!-- Variant -->
    <ax-skeleton variant="text" width="120px"></ax-skeleton>

    <div class="item-actions">
      <!-- Quantity selector -->
      <ax-skeleton variant="rounded" width="100px" height="32px"></ax-skeleton>
      <!-- Price -->
      <ax-skeleton variant="text" width="60px"></ax-skeleton>
    </div>
  </div>
</div>`,
    },
  ];

  readonly commentsCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<div class="comment">
  <!-- User avatar -->
  <ax-skeleton variant="circular" width="40px" height="40px"></ax-skeleton>

  <div class="comment-content">
    <div class="comment-header">
      <!-- Username -->
      <ax-skeleton variant="text" width="100px"></ax-skeleton>
      <!-- Timestamp -->
      <ax-skeleton variant="text" width="60px"></ax-skeleton>
    </div>

    <!-- Comment text -->
    <ax-skeleton variant="text" [lines]="2" width="100%"></ax-skeleton>
  </div>
</div>`,
    },
  ];

  readonly tableCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Basic table skeleton -->
<ax-skeleton-table [rows]="5" [columns]="4"></ax-skeleton-table>

<!-- Custom configuration -->
<ax-skeleton-table
  [rows]="10"
  [columns]="6"
  [showHeader]="true"
  animation="wave"
></ax-skeleton-table>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component, signal } from '@angular/core';
import { AxSkeletonTableComponent } from '@aegisx/ui';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [AxSkeletonTableComponent],
  template: \`
    @if (isLoading()) {
      <ax-skeleton-table [rows]="5" [columns]="4"></ax-skeleton-table>
    } @else {
      <table mat-table [dataSource]="users()">
        <!-- actual table -->
      </table>
    }
  \`,
})
export class UsersTableComponent {
  isLoading = signal(true);
  users = signal([]);

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    const data = await fetch('/api/users').then(r => r.json());
    this.users.set(data);
    this.isLoading.set(false);
  }
}`,
    },
  ];

  readonly customTableCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<div class="table-skeleton">
  <!-- Header row -->
  <div class="table-header">
    <ax-skeleton variant="text" width="32px"></ax-skeleton>
    <ax-skeleton variant="text" width="120px"></ax-skeleton>
    <ax-skeleton variant="text" width="200px"></ax-skeleton>
    <ax-skeleton variant="text" width="100px"></ax-skeleton>
  </div>

  <!-- Data rows -->
  @for (i of [1, 2, 3, 4, 5]; track i) {
    <div class="table-row">
      <ax-skeleton variant="circular" width="32px" height="32px"></ax-skeleton>
      <ax-skeleton variant="text" width="100px"></ax-skeleton>
      <ax-skeleton variant="text" width="180px"></ax-skeleton>
      <ax-skeleton variant="rounded" width="80px" height="24px"></ax-skeleton>
    </div>
  }
</div>`,
    },
  ];

  readonly cardPresetCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Basic card -->
<ax-skeleton-card></ax-skeleton-card>

<!-- With action buttons -->
<ax-skeleton-card [showActions]="true"></ax-skeleton-card>

<!-- Horizontal layout -->
<ax-skeleton-card [horizontal]="true"></ax-skeleton-card>

<!-- Without image -->
<ax-skeleton-card [showImage]="false"></ax-skeleton-card>`,
    },
  ];

  readonly avatarPresetCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Small -->
<ax-skeleton-avatar size="sm"></ax-skeleton-avatar>

<!-- Medium (default) -->
<ax-skeleton-avatar size="md"></ax-skeleton-avatar>

<!-- Large with subtitle -->
<ax-skeleton-avatar size="lg" [showSubtitle]="true"></ax-skeleton-avatar>

<!-- Extra large -->
<ax-skeleton-avatar size="xl" [showSubtitle]="true"></ax-skeleton-avatar>

<!-- Without text -->
<ax-skeleton-avatar [showText]="false"></ax-skeleton-avatar>`,
    },
  ];

  readonly listPresetCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Basic list -->
<ax-skeleton-list [items]="3"></ax-skeleton-list>

<!-- With action buttons -->
<ax-skeleton-list [items]="3" [showAction]="true"></ax-skeleton-list>

<!-- Without avatars -->
<ax-skeleton-list [items]="3" [showAvatar]="false"></ax-skeleton-list>`,
    },
  ];

  readonly designTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'Skeleton background color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Card/container background',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-sm',
      usage: 'Text skeleton radius',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-lg',
      usage: 'Rounded skeleton radius',
    },
    {
      category: 'Borders',
      cssVar: '--ax-border-default',
      usage: 'Preset component borders',
    },
    {
      category: 'Borders',
      cssVar: '--ax-border-muted',
      usage: 'Subtle dividers',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-sm',
      usage: 'Gap between skeleton lines',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-md',
      usage: 'Padding in preset components',
    },
    {
      category: 'Animation',
      cssVar: 'N/A',
      usage: '1.5s pulse/wave animation duration',
    },
  ];
}
