import { Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BaseWidgetComponent } from '../../core/base-widget.component';
import {
  TableWidgetConfig,
  TableWidgetData,
  TableColumn,
  TABLE_WIDGET_DEFAULTS,
} from './table-widget.types';

@Component({
  selector: 'ax-table-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
  ],
  template: `
    <div
      class="ax-table-widget"
      [class.ax-table-widget--compact]="mergedConfig().compact"
    >
      <!-- Header -->
      <div class="ax-table-widget__header">
        <span class="ax-table-widget__title">{{ mergedConfig().title }}</span>
        @if (data()?.total) {
          <span class="ax-table-widget__count">{{ data()?.total }} items</span>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="ax-table-widget__loading">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="ax-table-widget__error">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
        </div>
      }

      <!-- Table -->
      @if (!loading() && !error() && data()) {
        <div class="ax-table-widget__container">
          <table
            class="ax-table-widget__table"
            [class.ax-table-widget__table--striped]="mergedConfig().striped"
          >
            <thead>
              <tr>
                @if (mergedConfig().showRowNumbers) {
                  <th class="ax-table-widget__th ax-table-widget__th--number">
                    #
                  </th>
                }
                @for (col of mergedConfig().columns; track col.key) {
                  <th
                    class="ax-table-widget__th"
                    [style.width]="col.width"
                    [attr.data-align]="col.align || 'left'"
                    [class.ax-table-widget__th--sortable]="
                      col.sortable !== false && mergedConfig().sortable
                    "
                    (click)="toggleSort(col)"
                  >
                    {{ col.label }}
                    @if (sortColumn() === col.key) {
                      <mat-icon class="ax-table-widget__sort-icon">
                        {{
                          sortDirection() === 'asc'
                            ? 'arrow_upward'
                            : 'arrow_downward'
                        }}
                      </mat-icon>
                    }
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of paginatedItems(); track $index; let i = $index) {
                <tr class="ax-table-widget__tr">
                  @if (mergedConfig().showRowNumbers) {
                    <td class="ax-table-widget__td ax-table-widget__td--number">
                      {{ currentPage() * pageSize() + i + 1 }}
                    </td>
                  }
                  @for (col of mergedConfig().columns; track col.key) {
                    <td
                      class="ax-table-widget__td"
                      [attr.data-align]="col.align || 'left'"
                    >
                      {{ formatValue(row[col.key], col) }}
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (mergedConfig().showPagination && totalPages() > 1) {
          <div class="ax-table-widget__pagination">
            <button
              class="ax-table-widget__page-btn"
              [disabled]="currentPage() === 0"
              (click)="prevPage()"
            >
              <mat-icon>chevron_left</mat-icon>
            </button>
            <span class="ax-table-widget__page-info">
              {{ currentPage() + 1 }} / {{ totalPages() }}
            </span>
            <button
              class="ax-table-widget__page-btn"
              [disabled]="currentPage() >= totalPages() - 1"
              (click)="nextPage()"
            >
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .ax-table-widget {
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

        &__container {
          flex: 1;
          overflow: auto;
        }

        &__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;

          &--striped tbody tr:nth-child(even) {
            background: var(--ax-background-subtle);
          }
        }

        &__th {
          padding: 8px 12px;
          text-align: left;
          font-weight: 500;
          color: var(--ax-text-secondary);
          border-bottom: 1px solid var(--ax-border-default);
          white-space: nowrap;

          &--sortable {
            cursor: pointer;
            user-select: none;

            &:hover {
              color: var(--ax-text-heading);
            }
          }

          &--number {
            width: 40px;
            text-align: center;
          }

          &[data-align='center'] {
            text-align: center;
          }
          &[data-align='right'] {
            text-align: right;
          }
        }

        &__sort-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
          vertical-align: middle;
          margin-left: 4px;
        }

        &__tr {
          &:hover {
            background: var(--ax-background-subtle);
          }
        }

        &__td {
          padding: 8px 12px;
          color: var(--ax-text-default);
          border-bottom: 1px solid var(--ax-border-faint);

          &--number {
            text-align: center;
            color: var(--ax-text-muted);
          }

          &[data-align='center'] {
            text-align: center;
          }
          &[data-align='right'] {
            text-align: right;
          }
        }

        &--compact &__th,
        &--compact &__td {
          padding: 6px 8px;
          font-size: 12px;
        }

        &__pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--ax-border-faint);
        }

        &__page-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid var(--ax-border-default);
          border-radius: var(--ax-radius-sm);
          background: var(--ax-background-default);
          color: var(--ax-text-secondary);
          cursor: pointer;

          &:hover:not(:disabled) {
            background: var(--ax-background-subtle);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }

        &__page-info {
          font-size: 12px;
          color: var(--ax-text-muted);
          min-width: 60px;
          text-align: center;
        }
      }
    `,
  ],
})
export class TableWidgetComponent extends BaseWidgetComponent<
  TableWidgetConfig,
  TableWidgetData
> {
  currentPage = signal(0);
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  mergedConfig = computed(() => ({
    ...TABLE_WIDGET_DEFAULTS,
    ...this.config(),
  }));

  pageSize = computed(() => this.mergedConfig().pageSize || 5);

  sortedItems = computed(() => {
    const items = this.data()?.items || [];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    if (!col) return items;

    return [...items].sort((a, b) => {
      const aVal = a[col];
      const bVal = b[col];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return dir === 'asc' ? comparison : -comparison;
    });
  });

  paginatedItems = computed(() => {
    const items = this.sortedItems();
    const page = this.currentPage();
    const size = this.pageSize();
    return items.slice(page * size, (page + 1) * size);
  });

  totalPages = computed(() => {
    const items = this.data()?.items || [];
    return Math.ceil(items.length / this.pageSize());
  });

  getDefaultConfig(): TableWidgetConfig {
    return TABLE_WIDGET_DEFAULTS;
  }

  toggleSort(col: TableColumn): void {
    if (col.sortable === false || !this.mergedConfig().sortable) return;

    if (this.sortColumn() === col.key) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(col.key);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(0);
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
    }
  }

  formatValue(value: unknown, col: TableColumn): string {
    if (value === null || value === undefined) return '-';

    switch (col.type) {
      case 'number':
        return typeof value === 'number'
          ? value.toLocaleString()
          : String(value);
      case 'currency':
        return typeof value === 'number'
          ? value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })
          : String(value);
      case 'date':
        return value instanceof Date
          ? value.toLocaleDateString()
          : new Date(String(value)).toLocaleDateString();
      case 'status':
        return String(value);
      default:
        return String(value);
    }
  }
}
