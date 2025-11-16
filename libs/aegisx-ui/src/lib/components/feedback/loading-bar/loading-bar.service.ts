import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type LoadingBarMode = 'indeterminate' | 'determinate';
export type LoadingBarColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';

export interface LoadingBarState {
  visible: boolean;
  mode: LoadingBarMode;
  progress: number;
  color: LoadingBarColor;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoadingBarService {
  private defaultState: LoadingBarState = {
    visible: false,
    mode: 'indeterminate',
    progress: 0,
    color: 'primary',
    message: undefined,
  };

  private stateSubject = new BehaviorSubject<LoadingBarState>(
    this.defaultState,
  );
  private progressInterval: any;

  /**
   * Observable stream of loading bar state
   */
  public state$: Observable<LoadingBarState> = this.stateSubject.asObservable();

  /**
   * Get current state value
   */
  get currentState(): LoadingBarState {
    return this.stateSubject.value;
  }

  /**
   * Legacy method - Get loading observable (for backward compatibility)
   */
  getLoading(): Observable<boolean> {
    return new BehaviorSubject(this.currentState.visible).asObservable();
  }

  /**
   * Legacy method - Get progress observable (for backward compatibility)
   */
  getProgress(): Observable<number> {
    return new BehaviorSubject(this.currentState.progress).asObservable();
  }

  /**
   * Show loading bar with indeterminate mode
   */
  show(color: LoadingBarColor = 'primary', message?: string): void {
    this.stateSubject.next({
      ...this.currentState,
      visible: true,
      mode: 'indeterminate',
      color,
      message,
    });
  }

  /**
   * Show loading bar with determinate mode and initial progress
   */
  showProgress(
    initialProgress = 0,
    color: LoadingBarColor = 'primary',
    message?: string,
  ): void {
    this.stateSubject.next({
      ...this.currentState,
      visible: true,
      mode: 'determinate',
      progress: Math.max(0, Math.min(100, initialProgress)),
      color,
      message,
    });
  }

  /**
   * Legacy method - Start loading with auto-progress simulation (for backward compatibility)
   */
  start(): void {
    this.stateSubject.next({
      ...this.currentState,
      visible: true,
      mode: 'determinate',
      progress: 0,
    });
    this.simulateProgress();
  }

  /**
   * Update progress value (for determinate mode)
   */
  setProgress(value: number, message?: string): void {
    this.stateSubject.next({
      ...this.currentState,
      progress: Math.max(0, Math.min(100, value)),
      message: message ?? this.currentState.message,
    });
  }

  /**
   * Increment progress by a delta value
   */
  incrementProgress(delta: number, message?: string): void {
    const newProgress = this.currentState.progress + delta;
    this.setProgress(newProgress, message);
  }

  /**
   * Hide loading bar
   */
  hide(): void {
    this.clearProgressInterval();
    this.stateSubject.next({
      ...this.currentState,
      visible: false,
    });
  }

  /**
   * Complete loading (set to 100% if determinate, then hide after delay)
   */
  complete(delay = 300): void {
    this.clearProgressInterval();

    if (this.currentState.mode === 'determinate') {
      this.stateSubject.next({
        ...this.currentState,
        progress: 100,
      });

      setTimeout(() => this.hide(), delay);
    } else {
      this.hide();
    }
  }

  /**
   * Reset to default state
   */
  reset(): void {
    this.clearProgressInterval();
    this.stateSubject.next(this.defaultState);
  }

  /**
   * Show error loading bar
   */
  showError(message?: string): void {
    this.show('error', message);
  }

  /**
   * Show success loading bar
   */
  showSuccess(message?: string): void {
    this.show('success', message);
  }

  /**
   * Show warning loading bar
   */
  showWarning(message?: string): void {
    this.show('warning', message);
  }

  /**
   * Simulate progress (useful for testing or fake progress)
   * @param duration - Total duration in milliseconds
   * @param targetProgress - Target progress to reach (default 90)
   */
  simulateProgress(duration = 3000, targetProgress = 90): void {
    this.clearProgressInterval();

    let currentProgress = this.currentState.progress;
    const steps = 20;
    const interval = duration / steps;
    const increment = (targetProgress - currentProgress) / steps;

    this.progressInterval = setInterval(() => {
      if (!this.currentState.visible) {
        this.clearProgressInterval();
        return;
      }

      currentProgress += increment;
      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress;
        this.clearProgressInterval();
      }
      this.setProgress(currentProgress);
    }, interval);
  }

  /**
   * Clear the progress interval
   */
  private clearProgressInterval(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}
