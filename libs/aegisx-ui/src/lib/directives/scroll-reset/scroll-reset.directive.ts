import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

@Directive({
  selector: '[axScrollReset]',
  standalone: true
})
export class AegisxScrollResetDirective implements OnInit, OnDestroy {
  private _router = inject(Router);
  private _elementRef = inject(ElementRef);
  private _destroyed$ = new Subject<void>();
  
  ngOnInit(): void {
    // Reset scroll position on route navigation
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this._destroyed$)
      )
      .subscribe(() => {
        this.resetScroll();
      });
  }
  
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
  
  private resetScroll(): void {
    const element = this._elementRef.nativeElement as HTMLElement;
    
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      element.scrollTop = 0;
      element.scrollLeft = 0;
      
      // Also try to scroll any child elements that might be scrollable
      const scrollableChildren = element.querySelectorAll('[axScrollbar], .overflow-auto, .overflow-y-auto, .overflow-x-auto');
      scrollableChildren.forEach(child => {
        (child as HTMLElement).scrollTop = 0;
        (child as HTMLElement).scrollLeft = 0;
      });
    });
  }
}