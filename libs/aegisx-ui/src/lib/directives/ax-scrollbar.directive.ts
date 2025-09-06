import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[axScrollbar]',
  standalone: true,
})
export class AxScrollbarDirective {
  @Input() axScrollbarOptions: any = {};

  constructor(private elementRef: ElementRef) {}
}
