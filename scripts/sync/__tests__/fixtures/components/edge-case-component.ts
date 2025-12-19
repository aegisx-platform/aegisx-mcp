/**
 * Edge case component with complex types and optional inputs
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Component with complex types and edge cases
 *
 * @bestPractice Handle optional inputs carefully
 */
@Component({
  selector: 'ax-edge-case',
  template: '',
})
export class EdgeCaseComponent {
  /**
   * Optional input with complex union type
   */
  @Input() complexType?: string | number | null;

  /**
   * Input with default value
   */
  @Input() withDefault: boolean = true;

  /**
   * Required input with no default
   */
  @Input({ required: true }) requiredInput!: {
    id: string;
    name: string;
    metadata?: Record<string, unknown>;
  };

  /**
   * Generic event with complex type
   */
  @Output() complexEvent = new EventEmitter<{
    value: string;
    timestamp: Date;
    metadata?: Map<string, any>;
  }>();

  /**
   * Optional output
   */
  @Output() optionalOutput?: EventEmitter<void>;

  constructor() {
    this.optionalOutput = new EventEmitter<void>();
  }
}
