import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-advanced-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule,
    ScrollingModule,
  ],
  template: `
    <div class="section-container">
      <h2 class="section-title">Advanced</h2>
      <p class="section-description">CDK features, drag & drop, and advanced interactions</p>

      <!-- Drag & Drop -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Drag & Drop</mat-card-title>
          <mat-card-subtitle>Reorderable lists with CDK drag-drop</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="drag-drop-container">
            <div cdkDropList #todoList="cdkDropList" [cdkDropListData]="todos" class="todo-list">
              @for (todo of todos; track todo.id) {
                <div class="todo-item" cdkDrag>
                  <mat-icon cdkDragHandle>drag_indicator</mat-icon>
                  <span>{{ todo.title }}</span>
                </div>
              }
            </div>
          </div>
          <p class="hint-text">Drag items to reorder them</p>
        </mat-card-content>
      </mat-card>

      <!-- Virtual Scrolling Info -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Virtual Scrolling</mat-card-title>
          <mat-card-subtitle>Efficient rendering of large lists</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="scrolling-demo">
            <cdk-virtual-scroll-viewport itemSize="50" class="virtual-list">
              @for (item of largeList; track item) {
                <div class="virtual-item">
                  <mat-icon>folder</mat-icon>
                  <span>Item {{ item }}</span>
                </div>
              }
            </cdk-virtual-scroll-viewport>
          </div>
          <p class="hint-text">Virtual scrolling renders only visible items for performance</p>
        </mat-card-content>
      </mat-card>

      <!-- CDK Features Info -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Advanced CDK Features</mat-card-title>
          <mat-card-subtitle>Component Dev Kit capabilities</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="features-grid">
            <div class="feature-card">
              <mat-icon>touch_app</mat-icon>
              <h3>A11y</h3>
              <p>Accessibility utilities and focus management</p>
            </div>
            <div class="feature-card">
              <mat-icon>layers</mat-icon>
              <h3>Overlay</h3>
              <p>Flexible overlay positioning system</p>
            </div>
            <div class="feature-card">
              <mat-icon>devices</mat-icon>
              <h3>Platform</h3>
              <p>Platform detection utilities</p>
            </div>
            <div class="feature-card">
              <mat-icon>text_format</mat-icon>
              <h3>Text Selection</h3>
              <p>Control text selection behavior</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Performance Tips -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Performance Optimization</mat-card-title>
          <mat-card-subtitle>Best practices with Material & Presets</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="tips-list">
            <div class="tip-item">
              <mat-icon>check_circle</mat-icon>
              <div>
                <h4>OnPush Change Detection</h4>
                <p>Use ChangeDetectionStrategy.OnPush for better performance</p>
              </div>
            </div>
            <div class="tip-item">
              <mat-icon>check_circle</mat-icon>
              <div>
                <h4>Virtual Scrolling</h4>
                <p>Use CDK virtual scrolling for large lists</p>
              </div>
            </div>
            <div class="tip-item">
              <mat-icon>check_circle</mat-icon>
              <div>
                <h4>Lazy Loading</h4>
                <p>Load images and content on demand</p>
              </div>
            </div>
            <div class="tip-item">
              <mat-icon>check_circle</mat-icon>
              <div>
                <h4>CSS Variables</h4>
                <p>Use preset CSS variables for consistent styling</p>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .section-container {
        display: flex;
        flex-direction: column;
        gap: var(--preset-spacing-lg, 36px);
      }

      .section-title {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--theme-text-primary);
        letter-spacing: -0.5px;
      }

      .section-description {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: var(--theme-text-secondary);
      }

      .component-card {
        border-radius: var(--preset-border-radius, 12px);
        box-shadow: var(--preset-shadow, 0 10px 15px rgba(0, 0, 0, 0.1));
        transition: var(--preset-transition, all 300ms ease-in-out);
      }

      .component-card mat-card-header {
        padding: var(--preset-spacing-base, 24px) var(--preset-spacing-base, 24px)
          var(--preset-spacing-md, 18px) var(--preset-spacing-base, 24px);
        border-bottom: 1px solid var(--theme-surface-border);
      }

      .component-card mat-card-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .component-card mat-card-subtitle {
        margin-top: 4px;
        font-size: 13px;
        color: var(--theme-text-secondary);
      }

      .component-card mat-card-content {
        padding: var(--preset-spacing-base, 24px);
      }

      .drag-drop-container {
        margin-bottom: var(--preset-spacing-lg, 36px);
      }

      .todo-list {
        background: var(--theme-surface-hover);
        border-radius: var(--preset-border-radius, 12px);
        padding: var(--preset-spacing-md, 18px);
        min-height: 200px;
      }

      .cdk-drop-list-dragging .cdk-drag:hover {
        background-color: rgba(var(--md-sys-color-primary-rgb, 57, 73, 171), 0.05);
      }

      .cdk-drag-preview {
        padding: 20px;
        border-radius: var(--preset-border-radius, 12px);
        box-shadow: var(--preset-shadow, 0 10px 15px rgba(0, 0, 0, 0.1));
      }

      .todo-item {
        display: flex;
        align-items: center;
        gap: var(--preset-spacing-md, 18px);
        padding: var(--preset-spacing-md, 18px);
        background-color: var(--theme-surface-bg);
        border-radius: var(--preset-border-radius-sm, 6px);
        border: 1px solid var(--theme-surface-border);
        cursor: move;
        margin-bottom: 8px;
        transition: var(--preset-transition, all 300ms ease-in-out);

        &:hover {
          background-color: var(--theme-surface-border);
        }

        mat-icon {
          cursor: grab;
          color: var(--theme-text-secondary);

          &:active {
            cursor: grabbing;
          }
        }
      }

      .hint-text {
        margin: var(--preset-spacing-md, 18px) 0 0 0;
        font-size: 12px;
        color: var(--theme-text-tertiary);
        font-style: italic;
      }

      .scrolling-demo {
        border-radius: var(--preset-border-radius, 12px);
        border: 1px solid var(--theme-surface-border);
        background-color: var(--theme-surface-hover);
        margin-bottom: var(--preset-spacing-lg, 36px);
      }

      .virtual-list {
        width: 100%;
        height: 300px;
      }

      .virtual-item {
        display: flex;
        align-items: center;
        gap: var(--preset-spacing-md, 18px);
        padding: 12px var(--preset-spacing-md, 18px);
        border-bottom: 1px solid var(--theme-surface-border);
        color: var(--theme-text-primary);

        mat-icon {
          color: var(--md-sys-color-primary, #2196f3);
        }
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--preset-spacing-lg, 36px);
      }

      .feature-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--preset-spacing-md, 18px);
        padding: var(--preset-spacing-base, 24px);
        background-color: var(--theme-surface-hover);
        border-radius: var(--preset-border-radius, 12px);
        border: 1px solid var(--theme-surface-border);
        text-align: center;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: var(--md-sys-color-primary, #2196f3);
        }

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--theme-text-primary);
        }

        p {
          margin: 0;
          font-size: 13px;
          color: var(--theme-text-secondary);
        }
      }

      .tips-list {
        display: flex;
        flex-direction: column;
        gap: var(--preset-spacing-lg, 36px);
      }

      .tip-item {
        display: flex;
        gap: var(--preset-spacing-base, 24px);
        align-items: flex-start;

        mat-icon {
          flex-shrink: 0;
          color: var(--md-sys-color-primary, #2196f3);
          font-size: 20px;
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        h4 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--theme-text-primary);
        }

        p {
          margin: 0;
          font-size: 13px;
          color: var(--theme-text-secondary);
        }
      }
    `,
  ],
})
export class AdvancedSection {
  todos = [
    { id: 1, title: 'Task 1: Review code' },
    { id: 2, title: 'Task 2: Update documentation' },
    { id: 3, title: 'Task 3: Run tests' },
    { id: 4, title: 'Task 4: Deploy to staging' },
    { id: 5, title: 'Task 5: Get approval' },
  ];

  largeList = Array.from({ length: 100 }, (_, i) => i + 1);
}
