import { Injectable, computed, signal } from '@angular/core';

export interface LoadingState {
  show: boolean;
  progress: number;
  mode: 'determinate' | 'indeterminate';
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AegisxLoadingService {
  // Private writable signal
  private _loading = signal<LoadingState>({
    show: false,
    progress: 0,
    mode: 'indeterminate',
    message: undefined
  });
  
  // Public readonly signals
  readonly loading = this._loading.asReadonly();
  readonly isLoading = computed(() => this.loading().show);
  readonly progress = computed(() => this.loading().progress);
  readonly mode = computed(() => this.loading().mode);
  readonly message = computed(() => this.loading().message);
  
  // Computed signals for specific states
  readonly showProgressBar = computed(() => 
    this.isLoading() && this.mode() === 'determinate'
  );
  
  /**
   * Show the loading bar
   */
  show(message?: string): void {
    this._loading.update(state => ({
      ...state,
      show: true,
      message,
      mode: 'indeterminate',
      progress: 0
    }));
  }
  
  /**
   * Hide the loading bar
   */
  hide(): void {
    this._loading.update(state => ({
      ...state,
      show: false,
      message: undefined
    }));
  }
  
  /**
   * Set the mode
   */
  setMode(mode: 'determinate' | 'indeterminate'): void {
    this._loading.update(state => ({
      ...state,
      mode
    }));
  }
  
  /**
   * Set the progress (0-100)
   */
  setProgress(progress: number): void {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    this._loading.update(state => ({
      ...state,
      progress: clampedProgress,
      mode: 'determinate'
    }));
  }
  
  /**
   * Set the message
   */
  setMessage(message?: string): void {
    this._loading.update(state => ({
      ...state,
      message
    }));
  }
  
  /**
   * Complete the loading (set to 100% then hide)
   */
  complete(): void {
    this.setProgress(100);
    
    // Hide after a short delay
    setTimeout(() => {
      this.hide();
    }, 500);
  }
  
  /**
   * Start a simulated loading progress
   */
  startSimulated(duration = 3000): void {
    this.show();
    this.setMode('determinate');
    this.setProgress(0);
    
    const interval = 50; // Update every 50ms
    const increment = (100 / duration) * interval;
    let progress = 0;
    
    const timer = setInterval(() => {
      progress += increment;
      
      if (progress >= 100) {
        clearInterval(timer);
        this.complete();
      } else {
        this.setProgress(progress);
      }
    }, interval);
  }
}