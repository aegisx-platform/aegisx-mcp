import { Directive, ElementRef, Input, inject } from '@angular/core';

export interface AxScrollbarOptions {
  theme?: string;
  suppressScrollX?: boolean;
  suppressScrollY?: boolean;
}

@Directive({
  selector: '[axScrollbar]',
  standalone: true,
})
export class AxScrollbarDirective {
  private elementRef = inject(ElementRef);
  @Input() axScrollbarOptions: AxScrollbarOptions = {};

  // Empty constructor as we use inject() pattern
}
