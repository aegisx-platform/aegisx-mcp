import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  permissions?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals for reactive state management
  private _currentUser = signal<User | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  private _accessToken = signal<string | null>(null);

  // Public readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();

  // Computed signals
  readonly userDisplayName = computed(() => {
    const user = this._currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Guest';
  });

  readonly userInitials = computed(() => {
    const user = this._currentUser();
    return user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'G';
  });

  readonly hasRole = computed(() => (role: string) => {
    const user = this._currentUser();
    return user?.role === role;
  });

  readonly hasPermission = computed(() => (permission: string) => {
    const user = this._currentUser();
    return user?.permissions?.includes(permission) || false;
  });

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    if (token) {
      this._accessToken.set(token);
      this.loadUserProfile();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, credentials, {
        withCredentials: true, // Include cookies for refresh token
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuthData(response.data);
            this.router.navigate(['/dashboard']);
          }
        }),
        catchError(this.handleAuthError.bind(this)),
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, userData)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuthData(response.data);
            this.router.navigate(['/dashboard']);
          }
        }),
        catchError(this.handleAuthError.bind(this)),
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(
        `${environment.apiUrl}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        }),
        catchError(() => {
          // Even if logout fails, clear local data
          this.clearAuthData();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Logout failed'));
        }),
      );
  }

  refreshToken(): Observable<any> {
    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this._accessToken.set(response.data.accessToken);
            this.storeToken(response.data.accessToken);
          }
        }),
        catchError((error) => {
          this.clearAuthData();
          return throwError(() => error);
        }),
      );
  }

  private loadUserProfile(): void {
    // TODO: Implement when profile endpoint is ready
    // For now, we'll try to decode basic info from token
    const token = this._accessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.userId || payload.sub,
          email: payload.email || 'user@example.com',
          firstName: payload.firstName || 'User',
          lastName: payload.lastName || 'Name',
          role: payload.role || 'user',
          permissions: payload.permissions || [],
        };
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      } catch (error) {
        console.warn('Could not decode user from token, using defaults');
        // Set default user for development
        this._currentUser.set({
          id: '1',
          email: 'admin@aegisx.local',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          permissions: ['*.*'],
        });
        this._isAuthenticated.set(true);
      }
    }
  }

  private setAuthData(authData: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }): void {
    this._accessToken.set(authData.accessToken);
    this._currentUser.set(authData.user);
    this._isAuthenticated.set(true);
    this.storeToken(authData.accessToken);
  }

  private clearAuthData(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.removeStoredToken();
  }

  private storeToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private removeStoredToken(): void {
    localStorage.removeItem('accessToken');
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Authentication failed';

    if (error.error?.error?.message) {
      errorMessage = error.error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error.status === 409) {
      errorMessage = 'User already exists';
    } else if (error.status === 0) {
      errorMessage = 'Network error - please check your connection';
    }

    return throwError(() => new Error(errorMessage));
  }

  // Helper methods for guards and interceptors
  isTokenExpired(): boolean {
    const token = this._accessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  getAuthHeaders(): { [key: string]: string } {
    const token = this._accessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
