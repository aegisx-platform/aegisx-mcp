import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { AxDialogService, AxConfirmDialogComponent } from '@aegisx/ui';

@Component({
  selector: 'app-dialogs-doc',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
  ],
  template: `
    <div class="docs-page p-6 max-w-6xl mx-auto">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
          <a routerLink="/docs/components/feedback/alert" class="hover:text-primary">Feedback</a>
          <mat-icon class="text-base">chevron_right</mat-icon>
          <span>Dialogs</span>
        </div>
        <h1 class="text-4xl font-bold text-on-surface mb-2">Dialogs</h1>
        <p class="text-lg text-on-surface-variant">
          Modal dialogs for confirmations, forms, and user interactions with Material Design 3 styling.
        </p>
      </header>

      <!-- Tabs -->
      <mat-tab-group class="docs-tabs" animationDuration="200ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="py-6">
            <section class="mb-8">
              <h2 class="text-2xl font-semibold mb-4">Introduction</h2>
              <p class="text-on-surface-variant mb-4">
                AegisX provides two approaches for dialogs: the convenient <code class="bg-surface-container px-2 py-1 rounded">AxDialogService</code>
                for standard confirmations, and custom <code class="bg-surface-container px-2 py-1 rounded">MatDialog</code> components
                for complex forms and interactions.
              </p>
            </section>

            <!-- Dialog Approaches -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Available Approaches</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <mat-card appearance="outlined" class="p-4">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                      <mat-icon class="text-primary">auto_awesome</mat-icon>
                    </div>
                    <h4 class="font-semibold">AxDialogService</h4>
                  </div>
                  <p class="text-sm text-on-surface-variant">
                    Pre-built confirm dialogs with consistent styling. Perfect for delete confirmations,
                    simple yes/no decisions, and dangerous actions.
                  </p>
                </mat-card>

                <mat-card appearance="outlined" class="p-4">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                      <mat-icon class="text-secondary">build</mat-icon>
                    </div>
                    <h4 class="font-semibold">Custom MatDialog</h4>
                  </div>
                  <p class="text-sm text-on-surface-variant">
                    Full-featured custom dialogs using Angular Material Dialog with AegisX global styles.
                    Use for forms, wizards, and complex interactions.
                  </p>
                </mat-card>
              </div>
            </section>

            <!-- Quick Demo -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Quick Demo</h3>
              <mat-card appearance="outlined" class="p-6">
                <div class="flex flex-wrap gap-3">
                  <button mat-flat-button color="primary" (click)="openBasicConfirm()">
                    <mat-icon>check_circle</mat-icon>
                    Basic Confirm
                  </button>
                  <button mat-flat-button color="warn" (click)="openDeleteConfirm()">
                    <mat-icon>delete</mat-icon>
                    Delete Item
                  </button>
                  <button mat-flat-button color="warn" (click)="openBulkDelete()">
                    <mat-icon>delete_sweep</mat-icon>
                    Bulk Delete (5)
                  </button>
                </div>
                <p class="text-sm text-on-surface-variant mt-4">
                  Result: <span class="font-mono">{{ confirmResult() }}</span>
                </p>
              </mat-card>
            </section>

            <!-- When to Use -->
            <section>
              <h3 class="text-xl font-semibold mb-4">When to Use</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-primary mb-2">Use AxDialogService for:</h4>
                  <ul class="space-y-2 text-sm text-on-surface-variant">
                    <li class="flex items-start gap-2">
                      <mat-icon class="text-success text-lg">check_circle</mat-icon>
                      <span>Delete confirmations (single or bulk)</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <mat-icon class="text-success text-lg">check_circle</mat-icon>
                      <span>Simple yes/no decisions</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <mat-icon class="text-success text-lg">check_circle</mat-icon>
                      <span>Dangerous action warnings</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <mat-icon class="text-success text-lg">check_circle</mat-icon>
                      <span>Save/discard changes prompts</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-secondary mb-2">Use Custom Dialog for:</h4>
                  <ul class="space-y-2 text-sm text-on-surface-variant">
                    <li class="flex items-start gap-2">
                      <mat-icon class="text-info text-lg">build</mat-icon>
                      <span>Forms with multiple fields</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <mat-icon class="text-info text-lg">build</mat-icon>
                      <span>Multi-step wizards</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <mat-icon class="text-info text-lg">build</mat-icon>
                      <span>Content preview dialogs</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <mat-icon class="text-info text-lg">build</mat-icon>
                      <span>Complex interactions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="py-6 space-y-8">
            <!-- Basic Confirm -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Basic Confirmation</h3>
              <mat-card appearance="outlined">
                <div class="p-6 border-b border-outline-variant">
                  <button mat-flat-button color="primary" (click)="openBasicConfirm()">
                    <mat-icon>check_circle</mat-icon>
                    Open Basic Confirm
                  </button>
                </div>
                <div class="p-4 bg-surface-container-lowest">
                  <pre class="text-sm overflow-x-auto"><code>this.axDialog.confirm({{'{'}}{{'}'}}
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Proceed',
  cancelText: 'Cancel',
{{'}'}}).subscribe(confirmed => {{'{'}}
  if (confirmed) {{'{'}}
    // Handle confirmation
  {{'}'}}
{{'}'}});</code></pre>
                </div>
              </mat-card>
            </section>

            <!-- Dangerous Action -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Dangerous Action (Delete)</h3>
              <mat-card appearance="outlined">
                <div class="p-6 border-b border-outline-variant">
                  <button mat-flat-button color="warn" (click)="openDangerConfirm()">
                    <mat-icon>warning</mat-icon>
                    Open Danger Confirm
                  </button>
                </div>
                <div class="p-4 bg-surface-container-lowest">
                  <pre class="text-sm overflow-x-auto"><code>this.axDialog.confirm({{'{'}}{{'}'}}
  title: 'Delete Confirmation',
  message: 'This action cannot be undone. Delete this item?',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  isDangerous: true, // Red warning button
{{'}'}}).subscribe(confirmed => {{'{'}}
  // Handle deletion
{{'}'}});</code></pre>
                </div>
              </mat-card>
            </section>

            <!-- Delete Helper -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Delete Helper Method</h3>
              <mat-card appearance="outlined">
                <div class="p-6 border-b border-outline-variant">
                  <button mat-flat-button color="warn" (click)="openDeleteConfirm()">
                    <mat-icon>delete</mat-icon>
                    Confirm Delete "User Account"
                  </button>
                </div>
                <div class="p-4 bg-surface-container-lowest">
                  <pre class="text-sm overflow-x-auto"><code>// Shorthand for single item deletion
this.axDialog.confirmDelete('User Account').subscribe(confirmed => {{'{'}}
  if (confirmed) {{'{'}}
    this.deleteUser(userId);
  {{'}'}}
{{'}'}});</code></pre>
                </div>
              </mat-card>
            </section>

            <!-- Bulk Delete -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Bulk Delete</h3>
              <mat-card appearance="outlined">
                <div class="p-6 border-b border-outline-variant">
                  <button mat-flat-button color="warn" (click)="openBulkDelete()">
                    <mat-icon>delete_sweep</mat-icon>
                    Delete 5 Items
                  </button>
                </div>
                <div class="p-4 bg-surface-container-lowest">
                  <pre class="text-sm overflow-x-auto"><code>// Shorthand for bulk deletion
this.axDialog.confirmBulkDelete(5, 'items').subscribe(confirmed => {{'{'}}
  if (confirmed) {{'{'}}
    this.deleteItems(selectedIds);
  {{'}'}}
{{'}'}});</code></pre>
                </div>
              </mat-card>
            </section>

            <!-- Size Variants -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Dialog Size Variants</h3>
              <p class="text-on-surface-variant mb-4">
                Use <code class="bg-surface-container px-2 py-1 rounded">panelClass</code> to control dialog width.
              </p>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (size of dialogSizes; track size.class) {
                  <mat-card appearance="outlined" class="p-4">
                    <h4 class="font-semibold mb-1">{{ size.name }}</h4>
                    <p class="text-sm text-on-surface-variant mb-3">{{ size.description }}</p>
                    <code class="text-xs bg-surface-container px-2 py-1 rounded">
                      panelClass: '{{ size.class }}'
                    </code>
                  </mat-card>
                }
              </div>
            </section>

            <!-- Header Variants -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Gradient Header Styles</h3>
              <p class="text-on-surface-variant mb-4">
                Use gradient headers with icons to indicate dialog type and importance.
              </p>
              <div class="space-y-4">
                @for (header of headerVariants; track header.class) {
                  <mat-card appearance="outlined" class="overflow-hidden">
                    <div [class]="'ax-header ' + header.class + ' p-4 flex items-center gap-3'">
                      <div [class]="'w-10 h-10 rounded-full flex items-center justify-center ' + header.iconClass">
                        <mat-icon>{{ header.icon }}</mat-icon>
                      </div>
                      <div>
                        <div class="font-semibold">{{ header.title }}</div>
                        <div class="text-sm opacity-80">{{ header.subtitle }}</div>
                      </div>
                    </div>
                    <div class="p-4 bg-surface-container-lowest">
                      <code class="text-xs">class="{{ header.class }}"</code>
                      <span class="text-xs text-on-surface-variant ml-2">{{ header.usage }}</span>
                    </div>
                  </mat-card>
                }
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="py-6 space-y-8">
            <!-- AxDialogService -->
            <section>
              <h3 class="text-xl font-semibold mb-4">AxDialogService</h3>
              <mat-card appearance="outlined">
                <div class="p-4 border-b border-outline-variant bg-surface-container">
                  <code class="text-sm">import {{'{'}} AxDialogService {{'}'}} from '@aegisx/ui';</code>
                </div>
                <table mat-table [dataSource]="serviceMethodsData" class="w-full">
                  <ng-container matColumnDef="method">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Method</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-sm text-primary">{{ row.method }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="parameters">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Parameters</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-xs bg-surface-container px-1 rounded">{{ row.parameters }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="returns">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Returns</th>
                    <td mat-cell *matCellDef="let row">{{ row.returns }}</td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Description</th>
                    <td mat-cell *matCellDef="let row">{{ row.description }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['method', 'parameters', 'returns', 'description']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['method', 'parameters', 'returns', 'description'];"></tr>
                </table>
              </mat-card>
            </section>

            <!-- AxConfirmDialogData -->
            <section>
              <h3 class="text-xl font-semibold mb-4">AxConfirmDialogData Interface</h3>
              <mat-card appearance="outlined">
                <table mat-table [dataSource]="dialogDataProps" class="w-full">
                  <ng-container matColumnDef="property">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Property</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-sm text-primary">{{ row.property }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Type</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-xs bg-surface-container px-1 rounded">{{ row.type }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="default">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Default</th>
                    <td mat-cell *matCellDef="let row">{{ row.default }}</td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Description</th>
                    <td mat-cell *matCellDef="let row">{{ row.description }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['property', 'type', 'default', 'description']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['property', 'type', 'default', 'description'];"></tr>
                </table>
              </mat-card>
            </section>

            <!-- Dialog Panel Classes -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Dialog Size Classes</h3>
              <mat-card appearance="outlined">
                <table mat-table [dataSource]="sizeClassesData" class="w-full">
                  <ng-container matColumnDef="class">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Class</th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-sm text-primary">{{ row.class }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="width">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Width</th>
                    <td mat-cell *matCellDef="let row">{{ row.width }}</td>
                  </ng-container>
                  <ng-container matColumnDef="useCase">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Use Case</th>
                    <td mat-cell *matCellDef="let row">{{ row.useCase }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['class', 'width', 'useCase']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['class', 'width', 'useCase'];"></tr>
                </table>
              </mat-card>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="py-6 space-y-8">
            <!-- Dialog Tokens -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Dialog CSS Classes</h3>
              <mat-card appearance="outlined">
                <div class="p-4 bg-surface-container-lowest">
                  <pre class="text-sm overflow-x-auto"><code>/* Header Gradient Classes */
.ax-header-gradient-info      /* Blue gradient for information */
.ax-header-gradient-success   /* Green gradient for success */
.ax-header-gradient-warning   /* Orange gradient for warnings */
.ax-header-gradient-error     /* Red gradient for errors/danger */
.ax-header-gradient-neutral   /* Gray gradient for neutral */

/* Icon Container Classes */
.ax-icon-info                 /* Blue icon container */
.ax-icon-success              /* Green icon container */
.ax-icon-warning              /* Orange icon container */
.ax-icon-error                /* Red icon container */
.ax-icon-neutral              /* Gray icon container */

/* Size Classes (for panelClass) */
.dialog-sm                    /* 600px width */
.dialog-md                    /* 800px width */
.dialog-lg                    /* 1000px width */
.dialog-xl                    /* 1200px width */
.dialog-fullscreen            /* 100vw x 100vh */

/* Form Styling */
.form-compact                 /* Compact form field sizing */</code></pre>
                </div>
              </mat-card>
            </section>

            <!-- CSS Variables -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Design Tokens Used</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold mb-3">Surface Colors</h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <code>--md-sys-color-surface</code>
                      <span class="text-on-surface-variant">Dialog background</span>
                    </div>
                    <div class="flex justify-between">
                      <code>--md-sys-color-on-surface</code>
                      <span class="text-on-surface-variant">Title text</span>
                    </div>
                    <div class="flex justify-between">
                      <code>--md-sys-color-outline-variant</code>
                      <span class="text-on-surface-variant">Dividers</span>
                    </div>
                  </div>
                </mat-card>

                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold mb-3">Button Colors</h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <code>--md-sys-color-primary</code>
                      <span class="text-on-surface-variant">Confirm button</span>
                    </div>
                    <div class="flex justify-between">
                      <code>--md-sys-color-error</code>
                      <span class="text-on-surface-variant">Danger button</span>
                    </div>
                    <div class="flex justify-between">
                      <code>--md-sys-color-on-surface-variant</code>
                      <span class="text-on-surface-variant">Cancel button</span>
                    </div>
                  </div>
                </mat-card>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="py-6 space-y-8">
            <!-- Best Practices -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Best Practices</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold text-success mb-3 flex items-center gap-2">
                    <mat-icon>check_circle</mat-icon>
                    Do
                  </h4>
                  <ul class="space-y-2 text-sm text-on-surface-variant">
                    <li>Use clear, action-oriented titles</li>
                    <li>Provide specific details about the action</li>
                    <li>Use <code>isDangerous: true</code> for destructive actions</li>
                    <li>Allow ESC key to close non-critical dialogs</li>
                    <li>Keep dialog content focused and concise</li>
                    <li>Match dialog size to content complexity</li>
                  </ul>
                </mat-card>

                <mat-card appearance="outlined" class="p-4">
                  <h4 class="font-semibold text-error mb-3 flex items-center gap-2">
                    <mat-icon>cancel</mat-icon>
                    Don't
                  </h4>
                  <ul class="space-y-2 text-sm text-on-surface-variant">
                    <li>Use generic titles like "Are you sure?"</li>
                    <li>Nest dialogs inside other dialogs</li>
                    <li>Use dialogs for simple notifications (use snackbar)</li>
                    <li>Force users through unnecessary confirmations</li>
                    <li>Use fullscreen dialogs for simple confirmations</li>
                    <li>Block ESC key without good reason</li>
                  </ul>
                </mat-card>
              </div>
            </section>

            <!-- Accessibility -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Accessibility</h3>
              <mat-card appearance="outlined" class="p-4">
                <ul class="space-y-3 text-sm text-on-surface-variant">
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>Focus trap:</strong> Dialog automatically traps focus within itself</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>ESC key:</strong> Use <code>disableClose: false</code> to allow ESC dismissal</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>ARIA:</strong> Material Dialog provides proper ARIA attributes automatically</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>Clear labels:</strong> Button text should clearly describe the action</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg">accessibility</mat-icon>
                    <span><strong>Focus restoration:</strong> Focus returns to trigger element after close</span>
                  </li>
                </ul>
              </mat-card>
            </section>

            <!-- Size Guidelines -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Size Selection Guide</h3>
              <div class="space-y-4">
                @for (guide of sizeGuidelines; track guide.size) {
                  <mat-card appearance="outlined" class="p-4">
                    <div class="flex items-start gap-4">
                      <div class="w-20 h-12 rounded bg-surface-container flex items-center justify-center text-xs font-mono">
                        {{ guide.width }}
                      </div>
                      <div class="flex-1">
                        <h4 class="font-semibold">{{ guide.size }}</h4>
                        <p class="text-sm text-on-surface-variant mt-1">{{ guide.description }}</p>
                        <div class="flex flex-wrap gap-2 mt-2">
                          @for (use of guide.uses; track use) {
                            <span class="text-xs bg-surface-container px-2 py-1 rounded">{{ use }}</span>
                          }
                        </div>
                      </div>
                    </div>
                  </mat-card>
                }
              </div>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .docs-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
        flex: 1;
      }

      .ax-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ax-header-gradient-info {
        background: linear-gradient(
          135deg,
          var(--md-sys-color-primary-container) 0%,
          var(--md-sys-color-surface) 100%
        );
      }

      .ax-header-gradient-success {
        background: linear-gradient(
          135deg,
          #dcfce7 0%,
          var(--md-sys-color-surface) 100%
        );
      }

      .ax-header-gradient-warning {
        background: linear-gradient(
          135deg,
          #fef3c7 0%,
          var(--md-sys-color-surface) 100%
        );
      }

      .ax-header-gradient-error {
        background: linear-gradient(
          135deg,
          #fee2e2 0%,
          var(--md-sys-color-surface) 100%
        );
      }

      .ax-header-gradient-neutral {
        background: linear-gradient(
          135deg,
          var(--md-sys-color-surface-container) 0%,
          var(--md-sys-color-surface) 100%
        );
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }

      code {
        font-family: 'Fira Code', 'Consolas', monospace;
      }
    `,
  ],
})
export class DialogsDocComponent {
  private dialog = inject(MatDialog);
  private axDialog = inject(AxDialogService);

  confirmResult = signal<string>('No dialog opened yet');

  // Dialog sizes
  dialogSizes = [
    {
      name: 'Small',
      class: 'dialog-sm',
      description: 'Simple confirmations, alerts',
    },
    {
      name: 'Medium',
      class: 'dialog-md',
      description: 'Standard forms (4-8 fields)',
    },
    {
      name: 'Large',
      class: 'dialog-lg',
      description: 'Complex forms, multi-column',
    },
    {
      name: 'Extra Large',
      class: 'dialog-xl',
      description: 'Data tables, dashboards',
    },
    {
      name: 'Fullscreen',
      class: 'dialog-fullscreen',
      description: 'Mobile-first, wizards',
    },
  ];

  // Header variants
  headerVariants = [
    {
      class: 'ax-header-gradient-info',
      iconClass: 'bg-primary-container text-primary',
      icon: 'info',
      title: 'Information',
      subtitle: 'General information',
      usage: 'Help text, explanations',
    },
    {
      class: 'ax-header-gradient-success',
      iconClass: 'bg-green-100 text-green-700',
      icon: 'check_circle',
      title: 'Success',
      subtitle: 'Action completed',
      usage: 'Confirmations, positive feedback',
    },
    {
      class: 'ax-header-gradient-warning',
      iconClass: 'bg-amber-100 text-amber-700',
      icon: 'warning',
      title: 'Warning',
      subtitle: 'Please review',
      usage: 'Caution messages, reversible actions',
    },
    {
      class: 'ax-header-gradient-error',
      iconClass: 'bg-red-100 text-red-700',
      icon: 'error',
      title: 'Delete',
      subtitle: 'Cannot be undone',
      usage: 'Destructive actions, critical errors',
    },
    {
      class: 'ax-header-gradient-neutral',
      iconClass: 'bg-gray-200 text-gray-700',
      icon: 'settings',
      title: 'Settings',
      subtitle: 'Configure preferences',
      usage: 'Neutral actions, configurations',
    },
  ];

  // Service methods data
  serviceMethodsData = [
    {
      method: 'confirm(config)',
      parameters: 'AxConfirmDialogData',
      returns: 'Observable<boolean>',
      description: 'Opens a confirm dialog with custom configuration',
    },
    {
      method: 'confirmDelete(itemName)',
      parameters: 'string, boolean?',
      returns: 'Observable<boolean>',
      description: 'Shorthand for single item delete confirmation',
    },
    {
      method: 'confirmBulkDelete(count, itemType)',
      parameters: 'number, string?',
      returns: 'Observable<boolean>',
      description: 'Shorthand for bulk delete confirmation',
    },
  ];

  // Dialog data properties
  dialogDataProps = [
    {
      property: 'title',
      type: 'string',
      default: 'Required',
      description: 'Dialog title text',
    },
    {
      property: 'message',
      type: 'string',
      default: 'Required',
      description: 'Dialog message/content',
    },
    {
      property: 'confirmText',
      type: 'string',
      default: "'Confirm'",
      description: 'Confirm button text',
    },
    {
      property: 'cancelText',
      type: 'string',
      default: "'Cancel'",
      description: 'Cancel button text',
    },
    {
      property: 'isDangerous',
      type: 'boolean',
      default: 'false',
      description: 'Shows red warning button',
    },
  ];

  // Size classes data
  sizeClassesData = [
    {
      class: 'dialog-sm',
      width: '600px',
      useCase: 'Simple confirmations, alerts, short forms',
    },
    {
      class: 'dialog-md',
      width: '800px',
      useCase: 'Standard forms, user profiles',
    },
    {
      class: 'dialog-lg',
      width: '1000px',
      useCase: 'Complex forms, multi-column layouts',
    },
    { class: 'dialog-xl', width: '1200px', useCase: 'Data tables, dashboards' },
    {
      class: 'dialog-fullscreen',
      width: '100vw',
      useCase: 'Mobile-first, multi-step wizards',
    },
  ];

  // Size guidelines
  sizeGuidelines = [
    {
      size: 'Small (dialog-sm)',
      width: '600px',
      description: 'For simple interactions requiring minimal content.',
      uses: ['Confirmations', 'Alerts', '1-3 field forms', 'Quick actions'],
    },
    {
      size: 'Medium (dialog-md)',
      width: '800px',
      description: 'Standard choice for most dialogs with moderate content.',
      uses: ['4-8 field forms', 'Profile editors', 'Content preview'],
    },
    {
      size: 'Large (dialog-lg)',
      width: '1000px',
      description: 'For complex interactions with multiple sections.',
      uses: ['Multi-section forms', 'Rich text editors', 'Comparison views'],
    },
    {
      size: 'Extra Large (dialog-xl)',
      width: '1200px',
      description: 'For data-heavy interfaces requiring maximum width.',
      uses: ['Data tables', 'Advanced settings', 'Dashboard configs'],
    },
    {
      size: 'Fullscreen',
      width: '100vw',
      description: 'Full viewport coverage for immersive experiences.',
      uses: ['Mobile workflows', '3+ step wizards', 'Focused data entry'],
    },
  ];

  // Dialog methods
  openBasicConfirm(): void {
    this.axDialog
      .confirm({
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed with this action?',
        confirmText: 'Proceed',
        cancelText: 'Cancel',
      })
      .subscribe((confirmed) => {
        this.confirmResult.set(confirmed ? 'Confirmed!' : 'Cancelled');
      });
  }

  openDangerConfirm(): void {
    this.axDialog
      .confirm({
        title: 'Delete Confirmation',
        message:
          'This action cannot be undone. Are you sure you want to delete this item?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isDangerous: true,
      })
      .subscribe((confirmed) => {
        this.confirmResult.set(confirmed ? 'Deleted!' : 'Cancelled');
      });
  }

  openDeleteConfirm(): void {
    this.axDialog.confirmDelete('User Account').subscribe((confirmed) => {
      this.confirmResult.set(confirmed ? 'User deleted!' : 'Cancelled');
    });
  }

  openBulkDelete(): void {
    this.axDialog.confirmBulkDelete(5, 'items').subscribe((confirmed) => {
      this.confirmResult.set(confirmed ? '5 items deleted!' : 'Cancelled');
    });
  }
}
