import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxSkeletonComponent, SkeletonAnimation } from './skeleton.component';

/**
 * AegisX Skeleton Card Preset
 *
 * Pre-configured skeleton for card layouts.
 *
 * @example
 * ```html
 * <ax-skeleton-card></ax-skeleton-card>
 * <ax-skeleton-card [showImage]="true" [showActions]="true"></ax-skeleton-card>
 * ```
 */
@Component({
  selector: 'ax-skeleton-card',
  standalone: true,
  imports: [CommonModule, AxSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ax-skeleton-card"
      [class.ax-skeleton-card-horizontal]="horizontal"
    >
      @if (showImage) {
        <ax-skeleton
          [variant]="horizontal ? 'rounded' : 'rectangular'"
          [width]="horizontal ? '120px' : '100%'"
          [height]="horizontal ? '100%' : '180px'"
          [animation]="animation"
        ></ax-skeleton>
      }
      <div class="ax-skeleton-card-content">
        <ax-skeleton
          variant="text"
          width="60%"
          [animation]="animation"
        ></ax-skeleton>
        <ax-skeleton
          variant="text"
          [lines]="2"
          [animation]="animation"
        ></ax-skeleton>
        @if (showActions) {
          <div class="ax-skeleton-card-actions">
            <ax-skeleton
              variant="rounded"
              width="80px"
              height="36px"
              [animation]="animation"
            ></ax-skeleton>
            <ax-skeleton
              variant="rounded"
              width="80px"
              height="36px"
              [animation]="animation"
            ></ax-skeleton>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .ax-skeleton-card {
        display: flex;
        flex-direction: column;
        background: var(--ax-background-default, #ffffff);
        border: 1px solid var(--ax-border-default, #e4e4e7);
        border-radius: var(--ax-radius-lg, 0.75rem);
        overflow: hidden;
      }

      .ax-skeleton-card-horizontal {
        flex-direction: row;
        height: 120px;
      }

      .ax-skeleton-card-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        flex: 1;
      }

      .ax-skeleton-card-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: auto;
        padding-top: 0.5rem;
      }
    `,
  ],
})
export class AxSkeletonCardComponent {
  @Input() showImage = true;
  @Input() showActions = false;
  @Input() horizontal = false;
  @Input() animation: SkeletonAnimation = 'pulse';
}

/**
 * AegisX Skeleton Avatar Preset
 *
 * Pre-configured skeleton for avatar with text.
 *
 * @example
 * ```html
 * <ax-skeleton-avatar></ax-skeleton-avatar>
 * <ax-skeleton-avatar size="lg" [showSubtitle]="true"></ax-skeleton-avatar>
 * ```
 */
@Component({
  selector: 'ax-skeleton-avatar',
  standalone: true,
  imports: [CommonModule, AxSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ax-skeleton-avatar-wrapper">
      <ax-skeleton
        variant="circular"
        [width]="avatarSize"
        [height]="avatarSize"
        [animation]="animation"
      ></ax-skeleton>
      @if (showText) {
        <div class="ax-skeleton-avatar-text">
          <ax-skeleton
            variant="text"
            [width]="textWidth"
            [animation]="animation"
          ></ax-skeleton>
          @if (showSubtitle) {
            <ax-skeleton
              variant="text"
              width="60%"
              [animation]="animation"
            ></ax-skeleton>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ax-skeleton-avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .ax-skeleton-avatar-text {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        flex: 1;
      }
    `,
  ],
})
export class AxSkeletonAvatarComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showText = true;
  @Input() showSubtitle = false;
  @Input() textWidth = '120px';
  @Input() animation: SkeletonAnimation = 'pulse';

  get avatarSize(): string {
    const sizes = { sm: '32px', md: '40px', lg: '48px', xl: '64px' };
    return sizes[this.size];
  }
}

/**
 * AegisX Skeleton Table Preset
 *
 * Pre-configured skeleton for table rows.
 *
 * @example
 * ```html
 * <ax-skeleton-table [rows]="5" [columns]="4"></ax-skeleton-table>
 * ```
 */
@Component({
  selector: 'ax-skeleton-table',
  standalone: true,
  imports: [CommonModule, AxSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ax-skeleton-table">
      <!-- Header -->
      @if (showHeader) {
        <div class="ax-skeleton-table-header">
          @for (col of columnsArray; track $index) {
            <ax-skeleton
              variant="text"
              width="80%"
              height="14px"
              [animation]="animation"
            ></ax-skeleton>
          }
        </div>
      }
      <!-- Rows -->
      @for (row of rowsArray; track $index) {
        <div class="ax-skeleton-table-row">
          @for (col of columnsArray; track $index) {
            <ax-skeleton
              variant="text"
              [width]="getColumnWidth($index)"
              [animation]="animation"
            ></ax-skeleton>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ax-skeleton-table {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--ax-border-default, #e4e4e7);
        border-radius: var(--ax-radius-lg, 0.75rem);
        overflow: hidden;
      }

      .ax-skeleton-table-header {
        display: grid;
        grid-template-columns: repeat(var(--columns, 4), 1fr);
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border-bottom: 1px solid var(--ax-border-default, #e4e4e7);
      }

      .ax-skeleton-table-row {
        display: grid;
        grid-template-columns: repeat(var(--columns, 4), 1fr);
        gap: 1rem;
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--ax-border-muted, #f4f4f5);
      }

      .ax-skeleton-table-row:last-child {
        border-bottom: none;
      }
    `,
  ],
  host: {
    '[style.--columns]': 'columns',
  },
})
export class AxSkeletonTableComponent {
  @Input() rows = 5;
  @Input() columns = 4;
  @Input() showHeader = true;
  @Input() animation: SkeletonAnimation = 'pulse';

  get rowsArray(): number[] {
    return Array(this.rows).fill(0);
  }

  get columnsArray(): number[] {
    return Array(this.columns).fill(0);
  }

  getColumnWidth(index: number): string {
    // Vary widths for more natural look
    const widths = ['90%', '70%', '85%', '60%', '75%'];
    return widths[index % widths.length];
  }
}

/**
 * AegisX Skeleton List Preset
 *
 * Pre-configured skeleton for list items.
 *
 * @example
 * ```html
 * <ax-skeleton-list [items]="3"></ax-skeleton-list>
 * ```
 */
@Component({
  selector: 'ax-skeleton-list',
  standalone: true,
  imports: [CommonModule, AxSkeletonComponent, AxSkeletonAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ax-skeleton-list">
      @for (item of itemsArray; track $index) {
        <div class="ax-skeleton-list-item">
          @if (showAvatar) {
            <ax-skeleton-avatar
              [showSubtitle]="showSecondary"
              [animation]="animation"
            ></ax-skeleton-avatar>
          } @else {
            <div class="ax-skeleton-list-text">
              <ax-skeleton
                variant="text"
                width="70%"
                [animation]="animation"
              ></ax-skeleton>
              @if (showSecondary) {
                <ax-skeleton
                  variant="text"
                  width="50%"
                  [animation]="animation"
                ></ax-skeleton>
              }
            </div>
          }
          @if (showAction) {
            <ax-skeleton
              variant="circular"
              width="32px"
              height="32px"
              [animation]="animation"
            ></ax-skeleton>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ax-skeleton-list {
        display: flex;
        flex-direction: column;
      }

      .ax-skeleton-list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--ax-border-muted, #f4f4f5);
      }

      .ax-skeleton-list-item:last-child {
        border-bottom: none;
      }

      .ax-skeleton-list-text {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        flex: 1;
      }
    `,
  ],
})
export class AxSkeletonListComponent {
  @Input() items = 3;
  @Input() showAvatar = true;
  @Input() showSecondary = true;
  @Input() showAction = false;
  @Input() animation: SkeletonAnimation = 'pulse';

  get itemsArray(): number[] {
    return Array(this.items).fill(0);
  }
}
