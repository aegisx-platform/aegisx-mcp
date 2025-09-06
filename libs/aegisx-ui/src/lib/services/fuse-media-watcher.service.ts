import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FuseMediaWatcherService {
  onMediaChange$: Observable<{ matchingAliases: string[] }>;

  constructor(private breakpointObserver: BreakpointObserver) {
    // Define custom breakpoints matching Tailwind's defaults
    const breakpoints = {
      sm: '(min-width: 640px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 1024px)',
      xl: '(min-width: 1280px)',
      '2xl': '(min-width: 1536px)',
    };

    this.onMediaChange$ = this.breakpointObserver
      .observe([
        breakpoints.sm,
        breakpoints.md,
        breakpoints.lg,
        breakpoints.xl,
        breakpoints['2xl'],
      ])
      .pipe(
        map((result) => {
          const matchingAliases: string[] = [];

          // Check which breakpoints are active
          if (result.breakpoints[breakpoints.sm]) matchingAliases.push('sm');
          if (result.breakpoints[breakpoints.md]) matchingAliases.push('md');
          if (result.breakpoints[breakpoints.lg]) matchingAliases.push('lg');
          if (result.breakpoints[breakpoints.xl]) matchingAliases.push('xl');
          if (result.breakpoints[breakpoints['2xl']])
            matchingAliases.push('2xl');

          return { matchingAliases };
        }),
      );
  }
}
