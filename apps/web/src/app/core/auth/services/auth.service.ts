import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string; // Deprecated: Use roles[] for multi-role support
  roles?: string[]; // Multi-role support
  permissions?: string[];
  avatar?: string;
  bio?: string;
  department_id?: number | null; // Department assignment for auto-population and context
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
  private _isLoading = signal<boolean>(false);

  // Public readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

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
    // Check both role (backward compat) and roles[] (multi-role support)
    return user?.role === role || user?.roles?.includes(role) || false;
  });

  readonly hasPermission = computed(() => (permission: string) => {
    const user = this._currentUser();
    if (!user?.permissions || user.permissions.length === 0) {
      return false;
    }

    // Check wildcard patterns (same logic as backend)
    return user.permissions.some((userPerm) => {
      // Exact match
      if (userPerm === permission) {
        return true;
      }

      // *:* matches everything
      if (userPerm === '*:*') {
        return true;
      }

      const [userResource, userAction] = userPerm.split(':');
      const [reqResource, reqAction] = permission.split(':');

      // resource:* matches all actions on that resource
      if (userResource === reqResource && userAction === '*') {
        return true;
      }

      // *:action matches that action on all resources
      if (userResource === '*' && userAction === reqAction) {
        return true;
      }

      return false;
    });
  });

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    this._isLoading.set(true);
    const token = this.getStoredToken();

    if (token && !this.isTokenExpiredStatic(token)) {
      this._accessToken.set(token);
      this.loadUserProfile();
    } else {
      // Token expired or invalid, clear it
      if (token) {
        this.removeStoredToken();
      }
      this._isLoading.set(false);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    return this.http
      .post<AuthResponse>('/auth/login', credentials, {
        withCredentials: true, // Include cookies for refresh token
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuthData(response.data);
            // Load full profile to get avatar, bio, preferences, etc.
            this.loadUserProfile();
            this.router.navigate(['/']);
          } else {
            this._isLoading.set(false);
          }
        }),
        catchError((error) => {
          this._isLoading.set(false);
          return this.handleAuthError(error);
        }),
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/register', userData).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
          // Load full profile to get avatar, bio, preferences, etc.
          this.loadUserProfile();
          this.router.navigate(['/']);
        }
      }),
      catchError(this.handleAuthError.bind(this)),
    );
  }

  logout(): Observable<any> {
    return this.http
      .post(
        '/auth/logout',
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
        '/auth/refresh',
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
    const token = this._accessToken();
    if (token) {
      console.log(
        '🔄 [AuthService] Loading full profile from /api/v1/platform/profile...',
      );
      // Load full profile from API
      this.http.get<any>('/v1/platform/profile').subscribe({
        next: (response) => {
          this._isLoading.set(false);
          if (response.success && response.data) {
            const profile = response.data;
            const user: User = {
              id: profile.id,
              email: profile.email,
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
              role: profile.role?.name || profile.roles?.[0] || 'user', // Backward compat: first role
              roles:
                profile.roles ||
                (profile.role?.name ? [profile.role.name] : ['user']), // Multi-role support
              permissions: profile.role?.permissions || [],
              avatar: profile.avatar,
              bio: profile.bio,
              department_id: profile.department_id || null, // Store department context from profile
            };
            console.log('✅ [AuthService] Profile loaded successfully');
            console.log(
              '🖼️ [AuthService] Profile avatar:',
              user.avatar || 'NO AVATAR',
            );
            this._currentUser.set(user);
            this._isAuthenticated.set(true);
          }
        },
        error: (error) => {
          this._isLoading.set(false);
          console.warn('Could not load user profile, using token data', error);
          // Fallback to token data
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const user: User = {
              id: payload.userId || payload.sub,
              email: payload.email || 'user@example.com',
              firstName: payload.firstName || 'User',
              lastName: payload.lastName || 'Name',
              role: payload.role || payload.roles?.[0] || 'user', // Backward compat
              roles:
                payload.roles || (payload.role ? [payload.role] : ['user']), // Multi-role support
              permissions: payload.permissions || [],
              department_id: payload.department_id || null, // Fallback to token's department context
            };
            this._currentUser.set(user);
            this._isAuthenticated.set(true);
          } catch (tokenError) {
            console.warn('Could not decode token, clearing auth state');
            this.clearAuthData();
          }
        },
      });
    }
  }

  private setAuthData(authData: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }): void {
    // Extract permissions from JWT token if not in user object
    let userWithPermissions = authData.user;
    if (!userWithPermissions.permissions && authData.accessToken) {
      try {
        const payload = JSON.parse(atob(authData.accessToken.split('.')[1]));
        if (payload.permissions) {
          userWithPermissions = {
            ...authData.user,
            permissions: payload.permissions,
          };
          console.log(
            '✅ Extracted permissions from JWT token:',
            payload.permissions,
          );
        }
      } catch (error) {
        console.warn('Could not extract permissions from JWT token', error);
      }
    }

    console.log('🔐 [AuthService] setAuthData - user:', userWithPermissions);
    console.log(
      '🖼️ [AuthService] setAuthData - avatar:',
      userWithPermissions.avatar || 'NO AVATAR',
    );

    this._accessToken.set(authData.accessToken);
    this._currentUser.set(userWithPermissions);
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
    return this.isTokenExpiredStatic(token);
  }

  private isTokenExpiredStatic(token: string | null): boolean {
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

  // Method to refresh user profile data (call after profile updates)
  refreshUserProfile(): void {
    this.loadUserProfile();
  }

  // Helper for guards - wait until auth state is determined
  waitForAuthState(): Promise<boolean> {
    return new Promise((resolve) => {
      // If not loading, resolve immediately
      if (!this._isLoading()) {
        resolve(this._isAuthenticated());
        return;
      }

      // Wait for loading to complete
      const checkAuth = () => {
        if (!this._isLoading()) {
          resolve(this._isAuthenticated());
        } else {
          setTimeout(checkAuth, 50);
        }
      };
      checkAuth();
    });
  }

  // Get access token for interceptors
  getAccessToken(): string | null {
    const token = this._accessToken();

    // Proactive refresh: ถ้า token ใกล้หมดอายุให้ refresh ไว้เลย
    if (token && this.tokenExpiresWithin(token, 2)) {
      // Refresh in background (ไม่ block การทำงาน)
      this.refreshToken().subscribe({
        next: () => console.log('Proactive token refresh successful'),
        error: (error) => console.warn('Proactive token refresh failed', error),
      });
    }

    return token;
  }

  private tokenExpiresWithin(token: string, minutes: number): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const timeLeft = expiry - Date.now();
      return timeLeft < minutes * 60 * 1000;
    } catch {
      return true; // ถ้า decode ไม่ได้ถือว่าหมดอายุ
    }
  }
}
