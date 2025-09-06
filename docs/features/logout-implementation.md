# Logout Implementation

## Overview
The logout functionality has been implemented across the full stack, providing secure session termination and cleanup.

## Backend Implementation

### Endpoint
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Authentication**: Optional (will clear session if present)
- **Headers**: No Content-Type needed (empty body)

### Flow
1. Extract refresh token from cookies
2. Delete session from database
3. Clear refresh token cookie
4. Return success response

### Example Request
```bash
curl -X POST http://localhost:3333/api/auth/logout \
  -H "Cookie: refreshToken=<token>"
```

## Frontend Implementation

### AuthService
The `AuthService` provides a logout method that:
1. Calls the backend logout endpoint
2. Clears local authentication data
3. Navigates to login page

```typescript
logout(): Observable<any> {
  return this.http
    .post(`${environment.apiUrl}/api/auth/logout`, {}, { withCredentials: true })
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
      })
    );
}
```

### UI Integration
The logout button is integrated in the user menu:
- Located in the top-right toolbar
- Accessible via user avatar dropdown
- Displays "Sign out" with logout icon

### Component Implementation
```typescript
logout() {
  this.authService.logout().subscribe({
    next: () => {
      console.log('Logged out successfully');
    },
    error: (error) => {
      console.error('Logout error:', error);
      // AuthService will still clear data and navigate
    }
  });
}
```

## Security Features

1. **Token Cleanup**: Refresh token is cleared from both client cookies and server database
2. **Session Invalidation**: Server-side session is deleted
3. **Local Storage Clear**: All authentication data removed from browser
4. **Graceful Failure**: Even if server logout fails, client data is cleared
5. **CORS Support**: Proper credentials handling for cross-origin requests

## Testing

### Manual Testing Steps
1. Login with valid credentials
2. Verify authentication state
3. Click user avatar → "Sign out"
4. Verify redirect to login page
5. Verify tokens are cleared
6. Try accessing protected routes (should redirect to login)

### API Testing
```bash
# Login first
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aegisx.local","password":"Admin123!"}'

# Logout
curl -X POST http://localhost:3333/api/auth/logout \
  -H "Cookie: refreshToken=<token-from-login>"
```

## Future Enhancements

1. **Logout from all devices**: Invalidate all sessions for a user
2. **Logout confirmation dialog**: Optional confirmation before logout
3. **Logout reason tracking**: Track why users logout
4. **Session timeout**: Auto-logout after inactivity
5. **Remember me**: Selective session persistence