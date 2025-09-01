import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { slideInTop } from '../../animations';

@Component({
  selector: 'ax-alert',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  animations: [slideInTop],
  template: `
    @if (visible()) {
      <div 
        class="ax-alert"
        [class]="alertClass"
        [@slideInTop]
        role="alert"
      >
        <div class="ax-alert-content">
          @if (icon || typeIcon) {
            <mat-icon class="ax-alert-icon">{{ icon || typeIcon }}</mat-icon>
          }
          
          <div class="ax-alert-body">
            @if (title) {
              <h4 class="ax-alert-title">{{ title }}</h4>
            }
            <div class="ax-alert-message">
              <ng-content></ng-content>
            </div>
          </div>
          
          @if (dismissible) {
            <button 
              mat-icon-button 
              class="ax-alert-close"
              (click)="dismiss()"
              [attr.aria-label]="'Dismiss alert'"
            >
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>
        
        @if (hasActions) {
          <div class="ax-alert-actions">
            <ng-content select="[alert-actions]"></ng-content>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    .ax-alert {
      @apply relative overflow-hidden rounded-lg p-4 mb-4;
      @apply border-l-4;
      
      &.ax-alert-info {
        @apply bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-100;
        
        .ax-alert-icon {
          @apply text-blue-500 dark:text-blue-400;
        }
      }
      
      &.ax-alert-success {
        @apply bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100;
        
        .ax-alert-icon {
          @apply text-green-500 dark:text-green-400;
        }
      }
      
      &.ax-alert-warning {
        @apply bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-900 dark:text-yellow-100;
        
        .ax-alert-icon {
          @apply text-yellow-500 dark:text-yellow-400;
        }
      }
      
      &.ax-alert-error {
        @apply bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100;
        
        .ax-alert-icon {
          @apply text-red-500 dark:text-red-400;
        }
      }
      
      &.ax-alert-outlined {
        @apply bg-transparent border-2;
        border-left-width: 2px;
      }
      
      &.ax-alert-filled {
        @apply text-white border-0;
        
        &.ax-alert-info {
          @apply bg-blue-600 dark:bg-blue-700;
        }
        
        &.ax-alert-success {
          @apply bg-green-600 dark:bg-green-700;
        }
        
        &.ax-alert-warning {
          @apply bg-yellow-600 dark:bg-yellow-700;
        }
        
        &.ax-alert-error {
          @apply bg-red-600 dark:bg-red-700;
        }
        
        .ax-alert-icon {
          @apply text-white;
        }
      }
    }

    .ax-alert-content {
      @apply flex items-start gap-3;
    }

    .ax-alert-icon {
      @apply flex-shrink-0;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .ax-alert-body {
      @apply flex-1 min-w-0;
    }

    .ax-alert-title {
      @apply font-semibold mb-1;
    }

    .ax-alert-message {
      @apply text-sm;
    }

    .ax-alert-close {
      @apply -mt-1 -mr-1 ml-auto;
      
      .mat-icon {
        @apply text-current opacity-70 hover:opacity-100;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .ax-alert-actions {
      @apply flex items-center gap-2 mt-3 pt-3 border-t;
      border-color: currentColor;
      opacity: 0.2;
    }
  `]
})
export class AegisxAlertComponent {
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() title?: string;
  @Input() icon?: string;
  @Input() appearance: 'default' | 'outlined' | 'filled' = 'default';
  @Input() dismissible = true;
  @Input() hasActions = false;
  @Output() dismissed = new EventEmitter<void>();
  
  visible = signal(true);
  
  get alertClass(): string {
    const classes = [`ax-alert-${this.type}`];
    if (this.appearance !== 'default') {
      classes.push(`ax-alert-${this.appearance}`);
    }
    return classes.join(' ');
  }
  
  get typeIcon(): string {
    if (this.icon) return this.icon;
    
    const iconMap = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error'
    };
    
    return iconMap[this.type];
  }
  
  dismiss(): void {
    this.visible.set(false);
    setTimeout(() => {
      this.dismissed.emit();
    }, 300);
  }
}