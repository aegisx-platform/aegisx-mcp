import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AegisxLoadingService } from '../../services/loading/loading.service';

@Component({
  selector: 'ax-loading-bar',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    @if (isLoading()) {
      <div class="ax-loading-bar">
        <mat-progress-bar
          [mode]="mode()"
          [value]="progress()"
          color="primary"
        ></mat-progress-bar>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      pointer-events: none;
    }

    .ax-loading-bar {
      width: 100%;
      height: 4px;
      overflow: hidden;
    }

    ::ng-deep .mat-mdc-progress-bar {
      height: 4px !important;
    }
  `]
})
export class AegisxLoadingBarComponent {
  private _loadingService = inject(AegisxLoadingService);
  
  isLoading = this._loadingService.isLoading;
  progress = this._loadingService.progress;
  mode = this._loadingService.mode;
}