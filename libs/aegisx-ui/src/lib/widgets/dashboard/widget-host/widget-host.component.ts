/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// TODO: Fix TypeScript errors in widget system
import {
  Component,
  computed,
  inject,
  input,
  output,
  ViewContainerRef,
  viewChild,
  effect,
  ComponentRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import {
  WidgetInstance,
  WidgetConfigChangeEvent,
} from '../../core/widget.types';
import { WIDGET_REGISTRY } from '../../core/widget.tokens';
import { BaseWidgetComponent } from '../../core/base-widget.component';

/**
 * Widget Host - Container that dynamically renders widgets
 */
@Component({
  selector: 'ax-widget-host',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule],
  template: `
    <div
      class="ax-widget-host"
      [class.ax-widget-host--editing]="isEditing()"
      [class.ax-widget-host--error]="hasError()"
    >
      <!-- Edit mode header -->
      @if (isEditing()) {
        <div class="ax-widget-host__header">
          <span class="ax-widget-host__name">{{ widgetName() }}</span>
          <button
            mat-icon-button
            [matMenuTriggerFor]="menu"
            class="ax-widget-host__menu-btn"
          >
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="onConfigure()">
              <mat-icon>settings</mat-icon>
              <span>Configure</span>
            </button>
            <button mat-menu-item (click)="onDuplicate()">
              <mat-icon>content_copy</mat-icon>
              <span>Duplicate</span>
            </button>
            <button
              mat-menu-item
              (click)="onRemove()"
              class="ax-widget-host__remove"
            >
              <mat-icon>delete</mat-icon>
              <span>Remove</span>
            </button>
          </mat-menu>
        </div>
      }

      <!-- Widget content -->
      <div class="ax-widget-host__content">
        @if (hasError()) {
          <div class="ax-widget-host__error-state">
            <mat-icon>error_outline</mat-icon>
            <span>Widget not found: {{ widget().widgetId }}</span>
          </div>
        } @else {
          <ng-container #widgetContainer></ng-container>
        }
      </div>

      <!-- Resize handle (edit mode) -->
      @if (isEditing()) {
        <div class="ax-widget-host__resize-handle">
          <mat-icon>drag_indicator</mat-icon>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ax-widget-host {
        position: relative;
        height: 100%;
        border-radius: var(--ax-radius-lg);
        overflow: hidden;

        &--editing {
          border: 2px dashed var(--ax-border-default);

          &:hover {
            border-color: var(--ax-primary-default);
          }
        }

        &--error {
          border: 2px dashed var(--ax-error-default);
        }

        &__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px;
          background: var(--ax-background-subtle);
          border-bottom: 1px solid var(--ax-border-faint);
        }

        &__name {
          font-size: 12px;
          font-weight: 500;
          color: var(--ax-text-secondary);
        }

        &__menu-btn {
          width: 24px;
          height: 24px;
          line-height: 24px;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }

        &__remove {
          color: var(--ax-error-default);
        }

        &__content {
          height: 100%;
        }

        &--editing &__content {
          height: calc(100% - 40px);
        }

        &__error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 8px;
          color: var(--ax-error-default);
          font-size: 13px;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
          }
        }

        &__resize-handle {
          position: absolute;
          bottom: 4px;
          right: 4px;
          color: var(--ax-text-muted);
          cursor: se-resize;

          mat-icon {
            font-size: 16px;
            transform: rotate(-45deg);
          }
        }
      }
    `,
  ],
})
export class WidgetHostComponent {
  // Inputs
  widget = input.required<WidgetInstance>();
  isEditing = input<boolean>(false);

  // Outputs
  configChange = output<WidgetConfigChangeEvent>();
  configure = output<WidgetInstance>();
  duplicate = output<WidgetInstance>();
  remove = output<WidgetInstance>();

  // View
  widgetContainer = viewChild('widgetContainer', { read: ViewContainerRef });

  // Services
  private registry = inject(WIDGET_REGISTRY);

  // State
  private componentRef: ComponentRef<BaseWidgetComponent> | null = null;

  // Computed
  widgetDef = computed(() => this.registry.get(this.widget().widgetId));
  widgetName = computed(() => this.widgetDef()?.name || 'Unknown');
  hasError = computed(() => !this.widgetDef());

  constructor() {
    // Render widget when container or widget changes
    effect(() => {
      const container = this.widgetContainer();
      const instance = this.widget();
      const def = this.widgetDef();

      if (container && def && instance) {
        this.renderWidget(container, instance, def);
      }
    });
  }

  private renderWidget(
    container: ViewContainerRef,
    instance: WidgetInstance,
    def: ReturnType<typeof this.widgetDef>,
  ): void {
    // Clear previous
    container.clear();
    this.componentRef = null;

    if (!def) return;

    // Create component
    this.componentRef = container.createComponent(
      def.component,
    ) as ComponentRef<BaseWidgetComponent>;

    // Set inputs
    const comp = this.componentRef.instance;
    this.componentRef.setInput('instanceId', instance.instanceId);
    this.componentRef.setInput('config', {
      ...def.defaultConfig,
      ...instance.config,
    });
    this.componentRef.setInput('dataSource', instance.dataSource);
    this.componentRef.setInput('isEditing', this.isEditing());

    // Subscribe to config changes
    if (comp.configChange) {
      comp.configChange.subscribe((event: WidgetConfigChangeEvent) => {
        this.configChange.emit(event);
      });
    }
  }

  onConfigure(): void {
    this.configure.emit(this.widget());
  }

  onDuplicate(): void {
    this.duplicate.emit(this.widget());
  }

  onRemove(): void {
    this.remove.emit(this.widget());
  }
}
