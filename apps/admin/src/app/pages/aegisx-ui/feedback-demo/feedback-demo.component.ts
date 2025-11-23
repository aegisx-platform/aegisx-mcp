import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import {
  AxAlertComponent,
  AxLoadingBarComponent,
  LoadingBarService,
} from '@aegisx/ui';

@Component({
  selector: 'app-feedback-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    AxAlertComponent,
    AxLoadingBarComponent,
  ],
  templateUrl: './feedback-demo.component.html',
  styleUrls: ['./feedback-demo.component.scss'],
})
export class FeedbackDemoComponent {
  constructor(private loadingBarService: LoadingBarService) {}

  // Alert demo states
  showAutoHideAlert = false;
  showAutoHideSuccess = false;
  showAutoHideWarning = false;

  /**
   * Alert auto-hide demos
   */
  showInfoAlert(): void {
    this.showAutoHideAlert = true;
  }

  showSuccessAlert(): void {
    this.showAutoHideSuccess = true;
  }

  showWarningAlert(): void {
    this.showAutoHideWarning = true;
  }

  onAlertClose(alertType: string): void {
    if (alertType === 'info') {
      this.showAutoHideAlert = false;
    } else if (alertType === 'success') {
      this.showAutoHideSuccess = false;
    } else if (alertType === 'warning') {
      this.showAutoHideWarning = false;
    }
  }

  /**
   * Demo 1: Simple indeterminate loading
   */
  demoSimpleLoading(): void {
    this.loadingBarService.show('primary');
    setTimeout(() => this.loadingBarService.hide(), 3000);
  }

  /**
   * Demo 2: Success loading
   */
  demoSuccessLoading(): void {
    this.loadingBarService.showSuccess('Operation successful!');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  /**
   * Demo 3: Error loading
   */
  demoErrorLoading(): void {
    this.loadingBarService.showError('Something went wrong!');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  /**
   * Demo 4: Warning loading
   */
  demoWarningLoading(): void {
    this.loadingBarService.showWarning('Please wait...');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  /**
   * Demo 5: Progress loading (simulated upload)
   */
  demoProgressLoading(): void {
    this.loadingBarService.showProgress(0, 'primary', 'Uploading file...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.loadingBarService.setProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        this.loadingBarService.complete(500);
      }
    }, 300);
  }

  /**
   * Demo 6: Multi-step process
   */
  demoMultiStepProcess(): void {
    this.loadingBarService.showProgress(0, 'primary', 'Step 1: Validating...');

    setTimeout(() => {
      this.loadingBarService.setProgress(33, 'Step 2: Processing...');
    }, 1000);

    setTimeout(() => {
      this.loadingBarService.setProgress(66, 'Step 3: Finalizing...');
    }, 2000);

    setTimeout(() => {
      this.loadingBarService.setProgress(100, 'Completed!');
      this.loadingBarService.complete(500);
    }, 3000);
  }

  /**
   * Demo 7: Simulated API call with error handling
   */
  async demoApiCall(): Promise<void> {
    this.loadingBarService.show('primary', 'Fetching data...');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.loadingBarService.showSuccess('Data loaded successfully!');
      setTimeout(() => this.loadingBarService.hide(), 1500);
    } catch (_error) {
      this.loadingBarService.showError('Failed to load data');
      setTimeout(() => this.loadingBarService.hide(), 2000);
    }
  }

  /**
   * Demo 8: Auto-progress simulation
   */
  demoAutoProgress(): void {
    this.loadingBarService.showProgress(0, 'success');
    this.loadingBarService.simulateProgress(3000, 90);

    setTimeout(() => {
      this.loadingBarService.complete();
    }, 3500);
  }
}
