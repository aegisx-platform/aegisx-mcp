import { Injectable, signal, computed, inject } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

export interface AegisxBreakpointState {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  '2xl': boolean;
}

@Injectable({ providedIn: 'root' })
export class AegisxMediaWatcherService {
  // Breakpoint definitions
  private readonly _breakpoints = {
    xs: '(max-width: 639px)',
    sm: '(min-width: 640px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 1023px)',
    lg: '(min-width: 1024px) and (max-width: 1279px)',
    xl: '(min-width: 1280px) and (max-width: 1535px)',
    '2xl': '(min-width: 1536px)'
  };
  
  // Private writable signals
  private _currentBreakpoint = signal<keyof AegisxBreakpointState>('md');
  private _breakpointState = signal<AegisxBreakpointState>({
    xs: false,
    sm: false,
    md: true,
    lg: false,
    xl: false,
    '2xl': false
  });
  
  // Public readonly signals
  readonly currentBreakpoint = this._currentBreakpoint.asReadonly();
  readonly breakpointState = this._breakpointState.asReadonly();
  
  // Computed signals for common queries
  readonly isXs = computed(() => this.breakpointState().xs);
  readonly isSm = computed(() => this.breakpointState().sm);
  readonly isMd = computed(() => this.breakpointState().md);
  readonly isLg = computed(() => this.breakpointState().lg);
  readonly isXl = computed(() => this.breakpointState().xl);
  readonly is2xl = computed(() => this.breakpointState()['2xl']);
  
  // Computed signals for screen size groups
  readonly isMobile = computed(() => this.isXs() || this.isSm());
  readonly isTablet = computed(() => this.isMd());
  readonly isDesktop = computed(() => this.isLg() || this.isXl() || this.is2xl());
  readonly isSmallScreen = computed(() => this.isMobile());
  readonly isLargeScreen = computed(() => this.isDesktop());
  
  // Computed signal for screen width
  readonly screenWidth = computed(() => {
    const state = this.breakpointState();
    if (state.xs) return 'xs';
    if (state.sm) return 'sm';
    if (state.md) return 'md';
    if (state.lg) return 'lg';
    if (state.xl) return 'xl';
    if (state['2xl']) return '2xl';
    return 'md';
  });
  
  private _breakpointObserver = inject(BreakpointObserver);
  
  constructor() {
    this._initializeBreakpointObservers();
  }
  
  /**
   * Watch for specific media query changes
   */
  watchMediaQuery(query: string): Observable<boolean> {
    return this._breakpointObserver.observe(query).pipe(
      map((state: BreakpointState) => state.matches)
    );
  }
  
  /**
   * Watch for multiple media queries
   */
  watchMediaQueries(queries: string[]): Observable<{ [key: string]: boolean }> {
    return this._breakpointObserver.observe(queries).pipe(
      map((state: BreakpointState) => state.breakpoints)
    );
  }
  
  /**
   * Check if a specific breakpoint is active
   */
  isBreakpoint(breakpoint: keyof AegisxBreakpointState): boolean {
    return this.breakpointState()[breakpoint];
  }
  
  /**
   * Check if screen is at least a certain size
   */
  isAtLeast(breakpoint: keyof AegisxBreakpointState): boolean {
    const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = order.indexOf(this.screenWidth());
    const targetIndex = order.indexOf(breakpoint);
    return currentIndex >= targetIndex;
  }
  
  /**
   * Check if screen is at most a certain size
   */
  isAtMost(breakpoint: keyof AegisxBreakpointState): boolean {
    const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = order.indexOf(this.screenWidth());
    const targetIndex = order.indexOf(breakpoint);
    return currentIndex <= targetIndex;
  }
  
  /**
   * Initialize breakpoint observers
   */
  private _initializeBreakpointObservers(): void {
    // Observe all breakpoints
    Object.entries(this._breakpoints).forEach(([key, query]) => {
      this._breakpointObserver.observe(query).subscribe((state: BreakpointState) => {
        this._updateBreakpointState(key as keyof AegisxBreakpointState, state.matches);
      });
    });
  }
  
  /**
   * Update breakpoint state
   */
  private _updateBreakpointState(breakpoint: keyof AegisxBreakpointState, matches: boolean): void {
    this._breakpointState.update(state => ({
      ...state,
      [breakpoint]: matches
    }));
    
    // Update current breakpoint if this one matches
    if (matches) {
      this._currentBreakpoint.set(breakpoint);
    }
  }
}