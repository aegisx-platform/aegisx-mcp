import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, map, take, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated && !this.authService.isTokenExpired()) {
      return true;
    }

    // Try to refresh token if expired
    if (isAuthenticated && this.authService.isTokenExpired()) {
      return this.authService.refreshToken().pipe(
        map(() => true),
        take(1),
        catchError(() => {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url },
          });
          return of(false);
        }),
      );
    }

    // Not authenticated, redirect to login
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

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const accessToken = this.authService.accessToken();

    console.log('GuestGuard: accessToken exists =', !!accessToken);

    // If no token at all, allow access to login
    if (!accessToken) {
      console.log('GuestGuard: No token, allowing access to login');
      return true;
    }

    // If token exists but expired, allow access to login
    if (this.authService.isTokenExpired()) {
      console.log('GuestGuard: Token expired, allowing access to login');
      return true;
    }

    // Token exists and not expired, check if user data is loaded
    const currentUser = this.authService.currentUser();
    const isAuthenticated = this.authService.isAuthenticated();

    console.log('GuestGuard: currentUser =', !!currentUser);
    console.log('GuestGuard: isAuthenticated =', isAuthenticated);

    if (isAuthenticated && currentUser) {
      // User is fully authenticated, redirect to dashboard
      console.log(
        'GuestGuard: User is authenticated, redirecting to dashboard',
      );
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Token exists but user data not loaded yet, wait a moment then check
    if (accessToken && !currentUser) {
      console.log(
        'GuestGuard: Token exists but user data not loaded, waiting...',
      );
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const userAfterWait = this.authService.currentUser();
          const authAfterWait = this.authService.isAuthenticated();

          if (authAfterWait && userAfterWait) {
            console.log(
              'GuestGuard: After wait - user authenticated, redirecting',
            );
            this.router.navigate(['/dashboard']);
            resolve(false);
          } else {
            console.log(
              'GuestGuard: After wait - user not authenticated, allowing login',
            );
            resolve(true);
          }
        }, 100);
      });
    }

    console.log('GuestGuard: Default case - allowing access to login');
    return true;
  }
}
