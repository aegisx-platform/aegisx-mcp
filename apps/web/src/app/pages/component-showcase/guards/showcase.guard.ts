import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

export const showcaseGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Check if component showcase is enabled in environment
  if (!environment.features?.enableComponentShowcase) {
    // Redirect to dashboard or home page when not enabled
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

// Alternative guard that allows admin override in production
export const showcaseAdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Always allow in development
  if (!environment.production) {
    return true;
  }

  // In production, check environment setting first
  if (environment.features?.enableComponentShowcase) {
    return true;
  }

  // Check for admin override (you could implement user role checking here)
  const hasAdminOverride =
    localStorage.getItem('showcase-admin-override') === 'true';

  if (hasAdminOverride) {
    return true;
  }

  // Redirect if not allowed
  router.navigate(['/dashboard']);
  return false;
};
