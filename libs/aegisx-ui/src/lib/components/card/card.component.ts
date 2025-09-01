import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ax-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-card class="ax-card" [class]="cardClass">
      @if (title || subtitle || icon) {
        <mat-card-header class="ax-card-header">
          @if (icon) {
            <mat-icon mat-card-avatar class="ax-card-icon">{{ icon }}</mat-icon>
          }
          <mat-card-title>{{ title }}</mat-card-title>
          @if (subtitle) {
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
  styles: [`
    :host {
      display: block;
    }

    .ax-card {
      @apply transition-shadow duration-200;
      
      &:not(.ax-card-flat) {
        @apply shadow-sm hover:shadow-md;
      }
      
      &.ax-card-flat {
        box-shadow: none !important;
        border: 1px solid rgba(0, 0, 0, 0.12);
      }
      
      &.ax-card-outlined {
        box-shadow: none !important;
        @apply border-2 border-gray-200 dark:border-gray-700;
      }
      
      &.ax-card-elevated {
        @apply shadow-lg hover:shadow-xl;
      }
    }

    .ax-card-header {
      @apply relative;
      
      .ax-card-header-actions {
        @apply absolute top-4 right-4;
      }
    }

    .ax-card-icon {
      @apply flex items-center justify-center;
      @apply bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400;
      @apply rounded-full;
      width: 40px;
      height: 40px;
      font-size: 24px;
    }

    .ax-card-content {
      &:last-child {
        padding-bottom: 16px;
      }
    }

    .ax-card-actions {
      @apply border-t border-gray-200 dark:border-gray-700;
      padding: 8px 16px;
    }
  `]
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
}