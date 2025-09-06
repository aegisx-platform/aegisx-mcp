import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[fuseScrollbar]',
    standalone: true
})
export class FuseScrollbarDirective {
    @Input() fuseScrollbarOptions: any = {};

    constructor(private elementRef: ElementRef) {}
}