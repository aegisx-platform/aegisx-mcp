import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Guard to protect routes based on user permissions
 *
 * Usage in routes:
 * ```typescript
 * {
 *   path: 'users/create',
 *   component: CreateUserComponent,
 *   canActivate: [PermissionGuard],
 *   data: { permission: 'users:create' }
 * }
 * ```
 *
 * Multiple permissions (OR logic):
 * ```typescript
 * data: { permissions: ['users:create', 'users:update'] } // User must have ANY of these
 * ```
 *
 * Multiple permissions (AND logic):
 * ```typescript
 * data: { permissions: ['users:read', 'roles:read'], requireAll: true } // User must have ALL
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
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

    // Get required permission(s) from route data
    const singlePermission = route.data['permission'] as string | undefined;
    const multiplePermissions = route.data['permissions'] as
      | string[]
      | undefined;
    const requireAll = route.data['requireAll'] as boolean | undefined;

    let requiredPermissions: string[] = [];

    if (singlePermission) {
      requiredPermissions = [singlePermission];
    } else if (multiplePermissions && multiplePermissions.length > 0) {
      requiredPermissions = multiplePermissions;
    }

    if (requiredPermissions.length === 0) {
      // No permissions specified -> allow access (just need authentication)
      return true;
    }

    // Check permissions based on requireAll flag
    let hasRequiredPermissions: boolean;

    if (requireAll) {
      // AND logic: User must have ALL specified permissions
      hasRequiredPermissions = requiredPermissions.every((permission) =>
        this.authService.hasPermission()(permission),
      );
    } else {
      // OR logic: User must have ANY of the specified permissions
      hasRequiredPermissions = requiredPermissions.some((permission) =>
        this.authService.hasPermission()(permission),
      );
    }

    if (!hasRequiredPermissions) {
      // User doesn't have required permission(s) -> redirect to unauthorized
      const logicType = requireAll ? 'ALL' : 'ANY';
      console.warn(
        `Access denied: User must have ${logicType} of these permissions: ${requiredPermissions.join(', ')}`,
      );
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
