import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

@Component({
  selector: 'ax-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AxAlertComponent implements OnInit, OnDestroy {
  @Input() variant: AlertVariant = 'default';
  @Input() title = '';
  @Input() closeable = false;
  @Input() duration?: number; // Auto-hide after duration (milliseconds)
  @Output() closed = new EventEmitter<void>();

  visible = true;
  private autoHideTimer?: ReturnType<typeof setTimeout>;

  get alertClasses(): string {
    const classes = ['ax-alert', `ax-alert-${this.variant}`];
    return classes.join(' ');
  }

  get iconPath(): string {
    switch (this.variant) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  ngOnInit(): void {
    if (this.duration && this.duration > 0) {
      this.autoHideTimer = setTimeout(() => {
        this.onClose();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
    }
  }

  onClose(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
    }
    this.visible = false;
    this.closed.emit();
  }
}
