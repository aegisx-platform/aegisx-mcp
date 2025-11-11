import { Injectable, signal, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AegisxMediaWatcherService {
  private breakpointObserver = inject(BreakpointObserver);

  isMobile = signal(false);
  onMediaChange$ = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.Tablet])
    .pipe(takeUntilDestroyed());

  constructor() {
    this.onMediaChange$.subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }
}
