/**
 * Component without @Component decorator (edge case for testing)
 */
import { Component, Input } from '@angular/core';

/**
 * This is not a valid Angular component - no @Component decorator
 */
export class InvalidComponent {
  @Input() value: string = '';
}
