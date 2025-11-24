import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { LoadingBarService } from '@aegisx/ui';

@Component({
  selector: 'app-loading-bar-demo',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './loading-bar-demo.component.html',
  styleUrls: ['./loading-bar-demo.component.scss'],
})
export class LoadingBarDemoComponent {
  constructor(private loadingBarService: LoadingBarService) {}

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

  /**
   * Demo 9: File download simulation
   */
  demoFileDownload(): void {
    this.loadingBarService.showProgress(0, 'primary', 'Downloading file...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15; // Variable progress increments
      if (progress > 100) progress = 100;

      this.loadingBarService.setProgress(
        progress,
        progress < 100 ? 'Downloading...' : 'Download complete!',
      );

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.loadingBarService.showSuccess('File downloaded successfully!');
          setTimeout(() => this.loadingBarService.hide(), 1500);
        }, 500);
      }
    }, 400);
  }

  /**
   * Demo 10: Failed operation
   */
  demoFailedOperation(): void {
    this.loadingBarService.showProgress(0, 'primary', 'Processing request...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      this.loadingBarService.setProgress(progress);

      if (progress >= 60) {
        clearInterval(interval);
        this.loadingBarService.showError('Operation failed. Please try again.');
        setTimeout(() => this.loadingBarService.hide(), 2500);
      }
    }, 300);
  }

  /**
   * Demo 11: Different colors
   */
  demoPrimaryColor(): void {
    this.loadingBarService.show('primary', 'Primary loading...');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  demoSuccessColor(): void {
    this.loadingBarService.show('success', 'Success loading...');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  demoWarningColor(): void {
    this.loadingBarService.show('warning', 'Warning loading...');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  demoErrorColor(): void {
    this.loadingBarService.show('error', 'Error loading...');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  demoNeutralColor(): void {
    this.loadingBarService.show('neutral', 'Neutral loading...');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }
}
