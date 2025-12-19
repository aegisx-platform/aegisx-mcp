/**
 * Sample component for testing TypeScript parser
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ax-sample',
  standalone: true,
  templateUrl: './sample.component.html',
})
export class SampleComponent {
  /**
   * Sample input property
   */
  @Input() label: string = 'Default Label';

  /**
   * Required input
   */
  @Input({ required: true }) value!: number;

  /**
   * Output event emitter
   */
  @Output() valueChange = new EventEmitter<number>();

  private internalValue: string = 'internal';

  public displayName?: string;
}
