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

  canActivate(): boolean {
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated && !this.authService.isTokenExpired()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
