/**
 * Layout Configuration
 *
 * Centralized configuration for layout behavior and standalone routes.
 */

/**
 * Breakpoints aligned with Tailwind CSS and Angular Material
 */
export const BREAKPOINTS = {
  SM: 600, // Phone landscape
  MD: 960, // Tablet
  LG: 1280, // Desktop
  XL: 1440, // Large desktop
} as const;

/**
 * Routes that should NOT show the main layout wrapper.
 * These routes have their own full-page layouts (e.g., Enterprise Layout).
 */
export const STANDALONE_ROUTES = [
  '/login',
  '/enterprise-demo',
  '/inventory-demo',
  '/his-demo',
  '/app-launcher-demo',
  '/widget-demo',
  '/gridster-demo',
  '/gridster-poc',
  '/playground/pages/dashboard',
  '/tools',
  '/examples/error',
  '/examples/account',
  '/examples/dashboard',
  '/examples/auth',
  '/docs/components/aegisx/auth/examples',
] as const;

/**
 * Routes that should use the docs layout (AxDocsLayoutComponent)
 * instead of the compact layout (AxCompactLayoutComponent)
 */
export const DOCS_ROUTES_PREFIX = '/docs';

/**
 * Check if a URL matches any standalone route
 */
export function isStandaloneRoute(url: string): boolean {
  return STANDALONE_ROUTES.some((route) => url.startsWith(route));
}

/**
 * Check if a URL is a docs route
 */
export function isDocsRoute(url: string): boolean {
  return url.startsWith(DOCS_ROUTES_PREFIX);
}

/**
 * Check if current viewport is mobile
 */
export function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.MD;
}

/**
 * Check if current viewport is tablet
 */
export function isTabletViewport(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.innerWidth >= BREAKPOINTS.MD &&
    window.innerWidth < BREAKPOINTS.LG
  );
}

/**
 * Layout type definitions
 */
export type LayoutMode = 'docs' | 'compact' | 'none';

/**
 * Get the appropriate layout mode for a given URL
 */
export function getLayoutMode(url: string): LayoutMode {
  if (isStandaloneRoute(url)) {
    return 'none';
  }
  if (isDocsRoute(url)) {
    return 'docs';
  }
  return 'compact';
}
