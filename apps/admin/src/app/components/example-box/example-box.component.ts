import { Component, input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ExampleBoxVariant = 'default' | 'dark' | 'subtle' | 'bordered';
export type ExampleBoxAlign = 'center' | 'start' | 'end' | 'stretch';
export type ExampleBoxDirection = 'row' | 'column';

/**
 * ExampleBoxComponent - Container for displaying component examples/demos
 *
 * @example
 * <ax-example-box
 *   title="Button Variants"
 *   description="Different button styles available"
 *   variant="bordered"
 * >
 *   <button mat-raised-button>Example</button>
 * </ax-example-box>
 */
@Component({
  selector: 'ax-example-box',
  imports: [CommonModule],
  templateUrl: './example-box.component.html',
  styleUrl: './example-box.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ExampleBoxComponent {
  /** Example title (optional) */
  title = input<string | undefined>();

  /** Example description (optional) */
  description = input<string | undefined>();

  /** Visual variant */
  variant = input<ExampleBoxVariant>('default');

  /** Content alignment */
  align = input<ExampleBoxAlign>('center');

  /** Content direction */
  direction = input<ExampleBoxDirection>('row');

  /** Minimum height */
  minHeight = input<string>('120px');

  /** Add padding */
  padding = input<string>('2rem');

  /** Enable gap between items */
  gap = input<string>('1rem');

  /** Wrap content */
  wrap = input<boolean>(true);

  /**
   * Get container classes
   */
  protected getContainerClasses(): Record<string, boolean> {
    return {
      'example-box': true,
      [`example-box-${this.variant()}`]: true,
      [`example-box-align-${this.align()}`]: true,
      [`example-box-${this.direction()}`]: true,
      'example-box-nowrap': !this.wrap(),
    };
  }

  /**
   * Get container styles
   */
  protected getContainerStyles(): Record<string, string> {
    return {
      'min-height': this.minHeight(),
      padding: this.padding(),
      gap: this.gap(),
    };
  }
}
