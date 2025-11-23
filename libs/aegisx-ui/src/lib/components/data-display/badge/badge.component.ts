import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type BadgeVariant = 'outlined' | 'soft' | 'outlined-strong';
export type BadgeType = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge Component
 *
 * Displays status, labels, and metadata with customizable styling.
 * Inspired by Tremor design patterns with Material Design integration.
 *
 * @example
 * // Simple badge
 * <ax-badge type="success">Active</ax-badge>
 *
 * @example
 * // Badge with icon
 * <ax-badge variant="soft" type="success" icon="trending_up">+9.3%</ax-badge>
 *
 * @example
 * // Badge with dot
 * <ax-badge variant="soft" type="success" [dot]="true">Online</ax-badge>
 *
 * @example
 * // Removable badge
 * <ax-badge variant="soft" type="info" [removable]="true" (remove)="onRemove()">
 *   TypeScript
 * </ax-badge>
 *
 * @example
 * // Counter badge
 * <ax-badge variant="outlined" type="error" [counter]="5">Notifications</ax-badge>
 */
@Component({
  selector: 'ax-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class AxBadgeComponent {
  /** Badge variant style */
  @Input() variant: BadgeVariant = 'soft';

  /** Badge semantic type/color */
  @Input() type: BadgeType = 'neutral';

  /** Badge size */
  @Input() size: BadgeSize = 'md';

  /** Optional Material icon name (e.g., 'trending_up') */
  @Input() icon?: string;

  /** Show colored dot indicator */
  @Input() dot = false;

  /** Show remove/close button (for tags) */
  @Input() removable = false;

  /** Optional counter value */
  @Input() counter?: number;

  /** Emitted when remove button is clicked */
  @Output() remove = new EventEmitter<void>();

  /** Get CSS classes for badge */
  get badgeClasses(): string {
    const classes = ['badge'];
    classes.push(`badge-${this.variant}`);
    classes.push(`badge-${this.type}`);
    classes.push(`badge-${this.size}`);

    if (this.icon) classes.push('badge-icon');
    if (this.dot) classes.push('badge-dot');
    if (this.removable) classes.push('badge-removable');
    if (this.counter !== undefined) classes.push('badge-counter');

    return classes.join(' ');
  }

  /** Handle remove button click */
  onRemoveClick(event: Event): void {
    event.stopPropagation();
    this.remove.emit();
  }
}
