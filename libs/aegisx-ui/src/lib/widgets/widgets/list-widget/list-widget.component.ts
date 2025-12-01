import { Component, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BaseWidgetComponent } from '../../core/base-widget.component';
import {
  ListWidgetConfig,
  ListWidgetData,
  WidgetListItem,
  LIST_WIDGET_DEFAULTS,
} from './list-widget.types';

@Component({
  selector: 'ax-list-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div
      class="ax-list-widget"
      [class.ax-list-widget--compact]="mergedConfig().compact"
    >
      <!-- Header -->
      <div class="ax-list-widget__header">
        <span class="ax-list-widget__title">{{ mergedConfig().title }}</span>
        @if (data()?.items?.length) {
          <span class="ax-list-widget__count">{{ data()!.items.length }}</span>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="ax-list-widget__loading">
          <mat-spinner diameter="24"></mat-spinner>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="ax-list-widget__error">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
        </div>
      }

      <!-- List -->
      @if (!loading() && !error() && data()) {
        <div
          class="ax-list-widget__list"
          [class.ax-list-widget__list--divided]="mergedConfig().divided"
        >
          @for (item of displayItems(); track item.id) {
            <div
              class="ax-list-widget__item"
              [class.ax-list-widget__item--clickable]="mergedConfig().clickable"
              [attr.tabindex]="mergedConfig().clickable ? 0 : null"
              [attr.role]="mergedConfig().clickable ? 'button' : null"
              (click)="onItemClick(item)"
              (keyup.enter)="onItemClick(item)"
            >
              @if (mergedConfig().showIcons && item.icon) {
                <div
                  class="ax-list-widget__icon"
                  [style.color]="item.iconColor"
                >
                  <mat-icon>{{ item.icon }}</mat-icon>
                </div>
              }
              <div class="ax-list-widget__content">
                <span class="ax-list-widget__item-title">{{ item.title }}</span>
                @if (item.subtitle) {
                  <span class="ax-list-widget__item-subtitle">{{
                    item.subtitle
                  }}</span>
                }
              </div>
              @if (mergedConfig().showMeta) {
                <div class="ax-list-widget__meta">
                  @if (item.status) {
                    <span
                      class="ax-list-widget__status"
                      [attr.data-status]="item.status"
                    >
                      {{ item.status }}
                    </span>
                  }
                  @if (item.meta) {
                    <span class="ax-list-widget__meta-text">{{
                      item.meta
                    }}</span>
                  }
                </div>
              }
            </div>
          }
        </div>

        @if (hasMore()) {
          <div class="ax-list-widget__footer">
            <span class="ax-list-widget__more">
              +{{ data()!.items.length - mergedConfig().maxItems! }} more
            </span>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .ax-list-widget {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 16px;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);

        &--compact {
          padding: 12px;
        }

        &__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        &__title {
          font-size: 14px;
          font-weight: 500;
          color: var(--ax-text-secondary);
        }

        &__count {
          font-size: 12px;
          color: var(--ax-text-muted);
          background: var(--ax-background-subtle);
          padding: 2px 8px;
          border-radius: 10px;
        }

        &__loading,
        &__error {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 8px;
        }

        &__error {
          color: var(--ax-error-default);
          font-size: 14px;
        }

        &__list {
          flex: 1;
          overflow-y: auto;

          &--divided .ax-list-widget__item:not(:last-child) {
            border-bottom: 1px solid var(--ax-border-faint);
          }
        }

        &__item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;

          &--clickable {
            cursor: pointer;
            border-radius: var(--ax-radius-sm);
            margin: 0 -8px;
            padding: 10px 8px;

            &:hover {
              background: var(--ax-background-subtle);
            }
          }
        }

        &--compact &__item {
          padding: 6px 0;
          gap: 8px;
        }

        &__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: var(--ax-background-subtle);
          border-radius: var(--ax-radius-md);
          color: var(--ax-text-secondary);

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        &--compact &__icon {
          width: 28px;
          height: 28px;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }

        &__content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        &__item-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--ax-text-heading);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &__item-subtitle {
          font-size: 12px;
          color: var(--ax-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &--compact &__item-title {
          font-size: 13px;
        }

        &__meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        &__status {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: capitalize;

          &[data-status='active'] {
            background: var(--ax-success-faint);
            color: var(--ax-success-default);
          }
          &[data-status='completed'] {
            background: var(--ax-success-faint);
            color: var(--ax-success-default);
          }
          &[data-status='pending'] {
            background: var(--ax-warning-faint);
            color: var(--ax-warning-default);
          }
          &[data-status='error'] {
            background: var(--ax-error-faint);
            color: var(--ax-error-default);
          }
          &[data-status='warning'] {
            background: var(--ax-warning-faint);
            color: var(--ax-warning-default);
          }
        }

        &__meta-text {
          font-size: 12px;
          color: var(--ax-text-muted);
        }

        &__footer {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--ax-border-faint);
          text-align: center;
        }

        &__more {
          font-size: 12px;
          color: var(--ax-text-muted);
        }
      }
    `,
  ],
})
export class ListWidgetComponent extends BaseWidgetComponent<
  ListWidgetConfig,
  ListWidgetData
> {
  itemClick = output<WidgetListItem>();

  mergedConfig = computed(() => ({
    ...LIST_WIDGET_DEFAULTS,
    ...this.config(),
  }));

  displayItems = computed(() => {
    const items = this.data()?.items || [];
    const max = this.mergedConfig().maxItems || 5;
    return items.slice(0, max);
  });

  hasMore = computed(() => {
    const items = this.data()?.items || [];
    const max = this.mergedConfig().maxItems || 5;
    return items.length > max;
  });

  getDefaultConfig(): ListWidgetConfig {
    return LIST_WIDGET_DEFAULTS;
  }

  onItemClick(item: WidgetListItem): void {
    if (this.mergedConfig().clickable) {
      this.itemClick.emit(item);
    }
  }
}
