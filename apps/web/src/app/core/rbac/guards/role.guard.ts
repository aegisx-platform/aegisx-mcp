import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Guard to protect routes based on user roles
 *
 * Usage in routes:
 * ```typescript
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [RoleGuard],
 *   data: { roles: ['admin'] }
 * }
 * ```
 *
 * Multiple roles (OR logic):
 * ```typescript
 * data: { roles: ['admin', 'manager'] } // User must have ANY of these roles
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    // Wait for auth state to be determined
    const isAuthenticated = await this.authService.waitForAuthState();

    if (!isAuthenticated || this.authService.isTokenExpired()) {
      // Not authenticated or token expired -> redirect to login
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[] | undefined;

    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles specified -> allow access (just need authentication)
      return true;
    }

    // Check if user has any of the required roles (OR logic)
    const hasRequiredRole = requiredRoles.some((role) =>
      this.authService.hasRole()(role),
    );

    if (!hasRequiredRole) {
      // User doesn't have required role -> redirect to unauthorized
      console.warn(
        `Access denied: User role does not match required roles: ${requiredRoles.join(', ')}`,
      );
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
