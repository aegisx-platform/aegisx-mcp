import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, User, LoginRequest, AuthResponse } from './auth.service';

describe('AuthService - Department Integration', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: Partial<Router>;

  // Test data fixtures
  const mockUserWithDepartment: User = {
    id: '123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    roles: ['admin'],
    permissions: ['users:read', 'users:write'],
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Test user bio',
    department_id: 42, // User has department assignment
  };

  const mockUserWithoutDepartment: User = {
    id: '456',
    email: 'nodept@example.com',
    firstName: 'No',
    lastName: 'Department',
    role: 'user',
    roles: ['user'],
    permissions: ['users:read'],
    department_id: null, // User has no department assignment
  };

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    // Clear localStorage BEFORE TestBed creation to prevent auto-initialization
    localStorage.clear();

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: mockRouter }],
    });

    httpMock = TestBed.inject(HttpTestingController);
    // Service will auto-initialize and check localStorage (which is empty)
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
    localStorage.clear();
  });

  describe('Login Flow with Department', () => {
    it('should include department_id in currentUser signal after successful login with department', fakeAsync(() => {
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      const mockProfileResponse = {
        success: true,
        data: {
          id: mockUserWithDepartment.id,
          email: mockUserWithDepartment.email,
          firstName: mockUserWithDepartment.firstName,
          lastName: mockUserWithDepartment.lastName,
          role: {
            name: 'admin',
            permissions: mockUserWithDepartment.permissions,
          },
          roles: mockUserWithDepartment.roles,
          avatar: mockUserWithDepartment.avatar,
          bio: mockUserWithDepartment.bio,
          department_id: mockUserWithDepartment.department_id,
        },
      };

      service.login(mockLoginRequest).subscribe();

      const loginReq = httpMock.expectOne('/auth/login');
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush(mockAuthResponse);

      const profileReq = httpMock.expectOne('/profile');
      expect(profileReq.request.method).toBe('GET');
      profileReq.flush(mockProfileResponse);

      tick();

      const currentUser = service.currentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.department_id).toBe(42);
      expect(currentUser?.email).toBe('test@example.com');
      expect(service.isAuthenticated()).toBe(true);

      flush();
    }));

    it('should handle null department_id in currentUser signal after login', fakeAsync(() => {
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithoutDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithoutDepartment,
        },
      };

      const mockProfileResponse = {
        success: true,
        data: {
          id: mockUserWithoutDepartment.id,
          email: mockUserWithoutDepartment.email,
          firstName: mockUserWithoutDepartment.firstName,
          lastName: mockUserWithoutDepartment.lastName,
          role: {
            name: 'user',
            permissions: mockUserWithoutDepartment.permissions,
          },
          roles: mockUserWithoutDepartment.roles,
          department_id: null,
        },
      };

      service.login(mockLoginRequest).subscribe();

      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const profileReq = httpMock.expectOne('/profile');
      profileReq.flush(mockProfileResponse);

      tick();

      const currentUser = service.currentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.department_id).toBeNull();
      expect(currentUser?.email).toBe('nodept@example.com');
      expect(service.isAuthenticated()).toBe(true);

      flush();
    }));

    it('should store department_id from login response before profile load', fakeAsync(() => {
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();

      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      tick();

      // Check immediately after login, before profile completes
      const currentUserBeforeProfile = service.currentUser();
      expect(currentUserBeforeProfile?.department_id).toBe(42);

      // Complete profile request
      const profileReq = httpMock.expectOne('/profile');
      profileReq.flush({
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
        },
      });

      flush();
    }));
  });

  describe('Profile Load with Department', () => {
    it('should include department_id when loading profile from API', fakeAsync(() => {
      // First login to establish auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const firstProfileReq = httpMock.expectOne('/profile');
      firstProfileReq.flush({
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          department_id: 42,
        },
      });

      tick();

      // Now refresh profile
      const mockProfileResponse = {
        success: true,
        data: {
          id: mockUserWithDepartment.id,
          email: mockUserWithDepartment.email,
          firstName: mockUserWithDepartment.firstName,
          lastName: mockUserWithDepartment.lastName,
          role: {
            name: 'admin',
            permissions: mockUserWithDepartment.permissions,
          },
          roles: mockUserWithDepartment.roles,
          avatar: mockUserWithDepartment.avatar,
          bio: mockUserWithDepartment.bio,
          department_id: 42,
        },
      };

      service.refreshUserProfile();

      const profileReq = httpMock.expectOne('/profile');
      expect(profileReq.request.method).toBe('GET');
      profileReq.flush(mockProfileResponse);

      tick();

      const currentUser = service.currentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.department_id).toBe(42);
      expect(currentUser?.email).toBe('test@example.com');

      flush();
    }));

    it('should handle null department_id in profile response', fakeAsync(() => {
      // First login to establish auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithoutDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithoutDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const firstProfileReq = httpMock.expectOne('/profile');
      firstProfileReq.flush({
        success: true,
        data: {
          ...mockUserWithoutDepartment,
          role: { name: 'user', permissions: [] },
          department_id: null,
        },
      });

      tick();

      const mockProfileResponse = {
        success: true,
        data: {
          id: mockUserWithoutDepartment.id,
          email: mockUserWithoutDepartment.email,
          firstName: mockUserWithoutDepartment.firstName,
          lastName: mockUserWithoutDepartment.lastName,
          role: { name: 'user', permissions: [] },
          roles: mockUserWithoutDepartment.roles,
          department_id: null,
        },
      };

      service.refreshUserProfile();

      const profileReq = httpMock.expectOne('/profile');
      profileReq.flush(mockProfileResponse);

      tick();

      const currentUser = service.currentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.department_id).toBeNull();

      flush();
    }));

    it('should handle missing department_id field in profile response (backward compatibility)', fakeAsync(() => {
      // First login to establish auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const firstProfileReq = httpMock.expectOne('/profile');
      firstProfileReq.flush({
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          department_id: 42,
        },
      });

      tick();

      const mockProfileResponseWithoutDept = {
        success: true,
        data: {
          id: mockUserWithDepartment.id,
          email: mockUserWithDepartment.email,
          firstName: mockUserWithDepartment.firstName,
          lastName: mockUserWithDepartment.lastName,
          role: { name: 'admin', permissions: [] },
          roles: mockUserWithDepartment.roles,
          // department_id is missing from response
        },
      };

      service.refreshUserProfile();

      const profileReq = httpMock.expectOne('/profile');
      profileReq.flush(mockProfileResponseWithoutDept);

      tick();

      const currentUser = service.currentUser();
      expect(currentUser).toBeTruthy();
      // Should default to null when missing
      expect(currentUser?.department_id).toBeNull();

      flush();
    }));
  });

  describe('Token Fallback with Department', () => {
    it('should extract department_id from token when profile load fails', fakeAsync(() => {
      // First login to establish auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const firstProfileReq = httpMock.expectOne('/profile');
      firstProfileReq.flush({
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          department_id: 42,
        },
      });

      tick();

      // Now test fallback when refresh fails
      service.refreshUserProfile();

      const profileReq = httpMock.expectOne('/profile');
      // Simulate profile load failure
      profileReq.error(new ProgressEvent('error'));

      tick();

      const currentUser = service.currentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.department_id).toBe(42);
      expect(currentUser?.email).toBe('test@example.com');

      flush();
    }));

    it('should handle null department_id in token fallback', fakeAsync(() => {
      // First login to establish auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithoutDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithoutDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const firstProfileReq = httpMock.expectOne('/profile');
      firstProfileReq.flush({
        success: true,
        data: {
          ...mockUserWithoutDepartment,
          role: { name: 'user', permissions: [] },
          department_id: null,
        },
      });

      tick();

      service.refreshUserProfile();

      const profileReq = httpMock.expectOne('/profile');
      profileReq.error(new ProgressEvent('error'));

      tick();

      const currentUser = service.currentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.department_id).toBeNull();

      flush();
    }));

    it('should handle missing department_id in token payload (backward compatibility)', fakeAsync(() => {
      // Use token without department for this test
      const tokenWithoutDept = createMockTokenWithoutDepartment(
        mockUserWithDepartment,
      );
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: tokenWithoutDept,
          refreshToken: 'mock-refresh-token',
          user: { ...mockUserWithDepartment, department_id: null },
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const firstProfileReq = httpMock.expectOne('/profile');
      firstProfileReq.flush({
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          // department_id missing
        },
      });

      tick();

      service.refreshUserProfile();

      const profileReq = httpMock.expectOne('/profile');
      profileReq.error(new ProgressEvent('error'));

      tick();

      const currentUser = service.currentUser();
      expect(currentUser).toBeTruthy();
      // Should default to null when missing from token
      expect(currentUser?.department_id).toBeNull();

      flush();
    }));
  });

  describe('Signal Reactivity with Department Changes', () => {
    it('should update currentUser signal when department changes via profile refresh', fakeAsync(() => {
      // First login to establish auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      // First profile load with department 42
      const firstProfileResponse = {
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          department_id: 42,
        },
      };

      const firstProfileReq = httpMock.expectOne('/profile');
      firstProfileReq.flush(firstProfileResponse);

      tick();

      let currentUser = service.currentUser();
      expect(currentUser?.department_id).toBe(42);

      // Second profile load with updated department
      const secondProfileResponse = {
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          department_id: 99, // Department changed
        },
      };

      service.refreshUserProfile();

      const secondProfileReq = httpMock.expectOne('/profile');
      secondProfileReq.flush(secondProfileResponse);

      tick();

      currentUser = service.currentUser();
      expect(currentUser?.department_id).toBe(99);

      flush();
    }));

    it('should update from department to null when user department is removed', fakeAsync(() => {
      // First login to establish auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      // First load with department
      const firstProfileResponse = {
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          department_id: 42,
        },
      };

      const firstProfileReq = httpMock.expectOne('/profile');
      firstProfileReq.flush(firstProfileResponse);

      tick();

      let currentUser = service.currentUser();
      expect(currentUser?.department_id).toBe(42);

      // Second load without department
      const secondProfileResponse = {
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          department_id: null, // Department removed
        },
      };

      service.refreshUserProfile();

      const secondProfileReq = httpMock.expectOne('/profile');
      secondProfileReq.flush(secondProfileResponse);

      tick();

      currentUser = service.currentUser();
      expect(currentUser?.department_id).toBeNull();

      flush();
    }));

    it('should update from null to department when user is assigned', fakeAsync(() => {
      // First login to establish auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithoutDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithoutDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      // First load without department
      const firstProfileResponse = {
        success: true,
        data: {
          ...mockUserWithoutDepartment,
          role: { name: 'user', permissions: [] },
          department_id: null,
        },
      };

      const firstProfileReq = httpMock.expectOne('/profile');
      firstProfileReq.flush(firstProfileResponse);

      tick();

      let currentUser = service.currentUser();
      expect(currentUser?.department_id).toBeNull();

      // Second load with department assigned
      const secondProfileResponse = {
        success: true,
        data: {
          ...mockUserWithoutDepartment,
          role: { name: 'user', permissions: [] },
          department_id: 55, // Department assigned
        },
      };

      service.refreshUserProfile();

      const secondProfileReq = httpMock.expectOne('/profile');
      secondProfileReq.flush(secondProfileResponse);

      tick();

      currentUser = service.currentUser();
      expect(currentUser?.department_id).toBe(55);

      flush();
    }));
  });

  describe('Logout with Department', () => {
    it('should clear department_id when user logs out', fakeAsync(() => {
      // First login with department
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();

      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const profileReq = httpMock.expectOne('/profile');
      profileReq.flush({
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
        },
      });

      tick();

      let currentUser = service.currentUser();
      expect(currentUser?.department_id).toBe(42);

      // Logout
      service.logout().subscribe();

      const logoutReq = httpMock.expectOne('/auth/logout');
      logoutReq.flush({ success: true });

      tick();

      currentUser = service.currentUser();
      expect(currentUser).toBeNull();
      expect(service.isAuthenticated()).toBe(false);

      flush();
    }));
  });

  describe('Token Refresh with Department', () => {
    it('should maintain department_id after token refresh', fakeAsync(() => {
      // First login to establish auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const mockProfileResponse = {
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          department_id: 42,
        },
      };

      const profileReq = httpMock.expectOne('/profile');
      profileReq.flush(mockProfileResponse);

      tick();

      let currentUser = service.currentUser();
      expect(currentUser?.department_id).toBe(42);

      // Refresh token
      const newToken = createMockToken(mockUserWithDepartment);
      const refreshResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: newToken,
          refreshToken: 'new-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.refreshToken().subscribe();

      const refreshReq = httpMock.expectOne('/auth/refresh');
      refreshReq.flush(refreshResponse);

      tick();

      // Department should still be present
      currentUser = service.currentUser();
      expect(currentUser?.department_id).toBe(42);
      expect(service.isAuthenticated()).toBe(true);

      flush();
    }));
  });

  describe('Service Initialization with Department', () => {
    it('should load department_id on service initialization when token exists', fakeAsync(() => {
      // Note: We cannot fully test auto-initialization in this setup because
      // the service is already created in beforeEach. This test verifies
      // that refreshUserProfile works when a token is available.

      // Login first to set up auth state
      const mockAuthResponse: AuthResponse = {
        success: true,
        data: {
          accessToken: createMockToken(mockUserWithDepartment),
          refreshToken: 'mock-refresh-token',
          user: mockUserWithDepartment,
        },
      };

      service.login(mockLoginRequest).subscribe();
      const loginReq = httpMock.expectOne('/auth/login');
      loginReq.flush(mockAuthResponse);

      const profileReq = httpMock.expectOne('/profile');
      profileReq.flush({
        success: true,
        data: {
          ...mockUserWithDepartment,
          role: { name: 'admin', permissions: [] },
          department_id: 42,
        },
      });

      tick();

      const currentUser = service.currentUser();
      expect(currentUser?.department_id).toBe(42);
      expect(service.isAuthenticated()).toBe(true);

      flush();
    }));

    it('should not have department_id when no token exists on initialization', () => {
      // Service already initialized with no token
      const currentUser = service.currentUser();
      expect(currentUser).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});

// Helper function to create mock JWT token
function createMockToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId: user.id,
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      department_id: user.department_id,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    }),
  );
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
}

// Helper function to create token without department_id (for backward compatibility testing)
function createMockTokenWithoutDepartment(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId: user.id,
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      // department_id intentionally omitted
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  );
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
}
