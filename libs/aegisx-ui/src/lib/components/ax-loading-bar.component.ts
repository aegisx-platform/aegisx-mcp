import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

export type LoadingBarMode = 'indeterminate' | 'determinate';
export type LoadingBarColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';
export type LoadingBarPosition = 'top' | 'bottom';

@Component({
  selector: 'ax-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ax-loading-bar-container"
      [class]="containerClasses"
      [class.ax-loading-bar-hidden]="!visible"
      [@slideIn]="visible ? 'visible' : 'hidden'"
    >
      <div class="ax-loading-bar-track">
        <!-- Determinate Mode: Progress Bar -->
        <div
          *ngIf="mode === 'determinate'"
          class="ax-loading-bar-fill"
          [style.width.%]="progress"
          [class]="fillClasses"
        ></div>

        <!-- Indeterminate Mode: Animated Bar -->
        <div
          *ngIf="mode === 'indeterminate'"
          class="ax-loading-bar-indeterminate"
          [class]="indeterminateClasses"
        >
          <div class="ax-loading-bar-indeterminate-inner"></div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ax-loading-bar.component.scss'],
  animations: [
    trigger('slideIn', [
      state('hidden', style({ transform: 'translateY(-100%)' })),
      state('visible', style({ transform: 'translateY(0)' })),
      transition('hidden => visible', animate('200ms ease-out')),
      transition('visible => hidden', animate('200ms ease-in')),
    ]),
  ],
})
export class AxLoadingBarComponent implements OnInit {
  /**
   * Whether the loading bar is visible
   */
  @Input() visible = false;

  /**
   * Loading mode: 'indeterminate' for unknown duration, 'determinate' for known progress
   */
  @Input() mode: LoadingBarMode = 'indeterminate';

  /**
   * Progress value (0-100) for determinate mode
   */
  @Input() progress = 0;

  /**
   * Color variant
   */
  @Input() color: LoadingBarColor = 'primary';

  /**
   * Position of the loading bar
   */
  @Input() position: LoadingBarPosition = 'top';

  /**
   * Height of the loading bar in pixels
   */
  @Input() height = 4;

  /**
   * Whether to show a subtle glow effect
   */
  @Input() glow = true;

  /**
   * Animation speed for indeterminate mode (1 = normal, 2 = double speed, 0.5 = half speed)
   */
  @Input() speed = 1;

  get containerClasses(): string {
    return [
      `ax-loading-bar-${this.position}`,
      this.glow ? 'ax-loading-bar-glow' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  get fillClasses(): string {
    return [`ax-loading-bar-color-${this.color}`].join(' ');
  }

  get indeterminateClasses(): string {
    return [
      `ax-loading-bar-color-${this.color}`,
      `ax-loading-bar-speed-${this.speed}`,
    ].join(' ');
  }

  ngOnInit(): void {
    // Clamp progress between 0-100
    if (this.progress < 0) this.progress = 0;
    if (this.progress > 100) this.progress = 100;
  }

  /**
   * Update the progress value (for determinate mode)
   */
  setProgress(value: number): void {
    this.progress = Math.max(0, Math.min(100, value));
  }

  /**
   * Show the loading bar
   */
  show(): void {
    this.visible = true;
  }

  /**
   * Hide the loading bar
   */
  hide(): void {
    this.visible = false;
  }

  /**
   * Reset progress to 0
   */
  reset(): void {
    this.progress = 0;
  }

  /**
   * Complete the loading (set to 100% and hide after delay)
   */
  complete(delay = 300): void {
    if (this.mode === 'determinate') {
      this.progress = 100;
      setTimeout(() => this.hide(), delay);
    } else {
      this.hide();
    }
  }
}
