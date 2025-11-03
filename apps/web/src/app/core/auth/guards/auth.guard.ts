import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    // Wait for auth state to be determined
    const isAuthenticated = await this.authService.waitForAuthState();

    if (isAuthenticated && !this.authService.isTokenExpired()) {
      return true;
    }

    // Not authenticated or token expired, redirect to login
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  async canActivate(): Promise<boolean> {
    // Wait for auth state to be determined
    const isAuthenticated = await this.authService.waitForAuthState();

    if (isAuthenticated && !this.authService.isTokenExpired()) {
      // User is authenticated, redirect to home
      this.router.navigate(['/']);
      return false;
    }

    // User is not authenticated or token expired, allow access to login/register
    return true;
  }
}
