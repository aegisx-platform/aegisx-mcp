import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AxAlertComponent } from '@aegisx/ui';

@Component({
  selector: 'app-alerts-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    AxAlertComponent,
  ],
  templateUrl: './alerts-demo.component.html',
  styleUrls: ['./alerts-demo.component.scss'],
})
export class AlertsDemoComponent {
  // Auto-hide alert states
  showAutoHideInfo = false;
  showAutoHideSuccess = false;
  showAutoHideWarning = false;
  showAutoHideError = false;

  // Closeable alert states
  showCloseableInfo = true;
  showCloseableSuccess = true;
  showCloseableWarning = true;
  showCloseableError = true;

  /**
   * Show auto-hide alerts
   */
  showInfoAlert(): void {
    this.showAutoHideInfo = true;
  }

  showSuccessAlert(): void {
    this.showAutoHideSuccess = true;
  }

  showWarningAlert(): void {
    this.showAutoHideWarning = true;
  }

  showErrorAlert(): void {
    this.showAutoHideError = true;
  }

  /**
   * Handle alert close events
   */
  onAlertClose(alertType: string): void {
    switch (alertType) {
      case 'info':
        this.showAutoHideInfo = false;
        break;
      case 'success':
        this.showAutoHideSuccess = false;
        break;
      case 'warning':
        this.showAutoHideWarning = false;
        break;
      case 'error':
        this.showAutoHideError = false;
        break;
      case 'closeable-info':
        this.showCloseableInfo = false;
        break;
      case 'closeable-success':
        this.showCloseableSuccess = false;
        break;
      case 'closeable-warning':
        this.showCloseableWarning = false;
        break;
      case 'closeable-error':
        this.showCloseableError = false;
        break;
    }
  }

  /**
   * Reset closeable alerts
   */
  resetCloseableAlerts(): void {
    this.showCloseableInfo = true;
    this.showCloseableSuccess = true;
    this.showCloseableWarning = true;
    this.showCloseableError = true;
  }
}
