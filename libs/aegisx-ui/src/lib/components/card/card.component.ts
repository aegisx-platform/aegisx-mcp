import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ax-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="ax-card" [class]="cardClass">
      @if (
        hasValidValue(title) || hasValidValue(subtitle) || hasValidValue(icon)
      ) {
        <mat-card-header class="ax-card-header">
          @if (hasValidValue(icon)) {
            <mat-icon mat-card-avatar class="ax-card-icon">{{ icon }}</mat-icon>
          }
          @if (hasValidValue(title)) {
            <mat-card-title>{{ title }}</mat-card-title>
          }
          @if (hasValidValue(subtitle)) {
            <mat-card-subtitle>{{ subtitle }}</mat-card-subtitle>
          }
          <div class="ax-card-header-actions">
            <ng-content select="[card-header-actions]"></ng-content>
          </div>
        </mat-card-header>
      }

      <mat-card-content class="ax-card-content">
        <ng-content></ng-content>
      </mat-card-content>

      @if (hasFooter) {
        <mat-card-actions class="ax-card-actions" [align]="actionsAlign">
          <ng-content select="[card-actions]"></ng-content>
        </mat-card-actions>
      }
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ax-card {
        transition: box-shadow var(--ax-transition-base);
      }

      .ax-card:not(.ax-card-flat) {
        box-shadow: var(--ax-shadow-sm);
      }

      .ax-card:not(.ax-card-flat):hover {
        box-shadow: var(--ax-shadow-md);
      }

      .ax-card.ax-card-flat {
        box-shadow: none !important;
        border: 1px solid var(--ax-border-default);
      }

      .ax-card.ax-card-outlined {
        box-shadow: none !important;
        border: 2px solid var(--ax-border-default);
      }

      .ax-card.ax-card-elevated {
        box-shadow: var(--ax-shadow-lg);
      }

      .ax-card.ax-card-elevated:hover {
        box-shadow: var(--ax-shadow-xl);
      }

      .ax-card-header {
        position: relative;

        .ax-card-header-actions {
          position: absolute;
          top: var(--ax-spacing-md);
          right: var(--ax-spacing-md);
        }
      }

      .ax-card-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--ax-primary-faint);
        color: var(--ax-primary-default);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 24px;
      }

      .ax-card-content:last-child {
        padding-bottom: var(--ax-spacing-md);
      }

      .ax-card-actions {
        border-top: 1px solid var(--ax-border-default);
        padding: var(--ax-spacing-sm) var(--ax-spacing-md);
      }
    `,
  ],
})
export class AegisxCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() appearance: 'default' | 'flat' | 'outlined' | 'elevated' = 'default';
  @Input() actionsAlign: 'start' | 'end' = 'end';
  @Input() hasFooter = false;

  get cardClass(): string {
    return this.appearance !== 'default' ? `ax-card-${this.appearance}` : '';
  }

  /**
   * Check if value is valid (not null, undefined, or empty string)
   */
  hasValidValue(value?: string | null): boolean {
    return value != null && value !== '';
  }
}
