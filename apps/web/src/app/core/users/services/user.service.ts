import {
  HttpClient,
  HttpEventType,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  // Backward compatibility - primary role (first role in list)
  role: string;
  roleId: string;
  // Multi-role support (required, not optional)
  roles: UserRole[]; // Full role details with metadata
  primaryRole?: UserRole; // Explicitly marked primary role
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

// Types for dropdown/select options (for CRUD generation)
export interface UserOption {
  value: string;
  label: string;
  disabled?: boolean;
  email?: string;
}

export interface SimpleUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
  status?: UserStatus;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  status?: UserStatus;
  roleId?: string;
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: UserStatus;
}

export interface BulkOperationResult {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    userId: string;
    success: boolean;
    error?: {
      code: string;
      message: string;
    };
  }>;
  summary: {
    message: string;
    hasFailures: boolean;
  };
}

export interface BulkUsersRequest {
  userIds: string[];
}

export interface BulkRoleChangeRequest {
  userIds: string[];
  roleId: string;
}

// Multi-role management types
export interface UserRole {
  id: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface AssignRolesToUserRequest {
  roleIds: string[];
  expiresAt?: string;
}

export interface RemoveRoleFromUserRequest {
  roleId: string;
}

export interface UpdateRoleExpiryRequest {
  roleId: string;
  expiresAt?: string;
}

export interface RoleOperationResponse {
  message: string;
  userId: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountRequest {
  confirmation: string;
  password: string;
  reason?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  data?: {
    message: string;
    deletedAt: string;
    recoveryPeriod: string;
    recoveryDeadline: string;
  };
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  // Backward compatibility - primary role (first role in list)
  role: string;
  // Multi-role support (required, not optional)
  roles: UserRole[]; // Full role details with metadata
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
}

export interface UserPreferences {
  theme: 'default' | 'dark' | 'light' | 'auto';
  scheme: 'light' | 'dark' | 'auto';
  layout: 'classic' | 'compact' | 'enterprise' | 'empty';
  language: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  navigation: {
    collapsed: boolean;
    type: 'default' | 'compact' | 'horizontal';
    position: 'left' | 'right' | 'top';
  };
}

export interface AvatarUploadResponse {
  avatar: string;
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = '/users';

  // Signals for state management
  private usersSignal = signal<User[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedUserSignal = signal<User | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalUsersSignal = signal<number>(0);

  // Public readonly signals
  readonly users = this.usersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedUser = this.selectedUserSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalUsers = this.totalUsersSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // Computed signals
  readonly totalPages = computed(() => {
    const total = this.totalUsersSignal();
    const size = this.pageSizeSignal();
    return Math.ceil(total / size);
  });

  readonly hasNextPage = computed(() => {
    return this.currentPageSignal() < this.totalPages();
  });

  readonly hasPreviousPage = computed(() => {
    return this.currentPageSignal() > 1;
  });

  // Computed for dropdown/select options (for CRUD generation)
  readonly userOptions = computed(() => {
    return this.usersSignal().map((user) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} (${user.email})`,
      disabled: user.status !== 'active',
    }));
  });

  readonly activeUserOptions = computed(() => {
    return this.usersSignal()
      .filter((user) => user.status === 'active')
      .map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
        email: user.email,
      }));
  });

  // Actions using HttpClient
  async loadUsers(params?: GetUsersParams): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      // Build HTTP params
      let httpParams = new HttpParams();
      if (params?.page)
        httpParams = httpParams.set('page', params.page.toString());
      if (params?.limit)
        httpParams = httpParams.set('limit', params.limit.toString());
      if (params?.search) httpParams = httpParams.set('search', params.search);
      if (params?.role) httpParams = httpParams.set('role', params.role);
      if (params?.status) httpParams = httpParams.set('status', params.status);

      // Direct HTTP call - Standard paginated response
      const response = await this.http
        .get<ApiResponse<User[]>>(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response?.success && response.data) {
        this.usersSignal.set(response.data);

        if (response.pagination) {
          this.totalUsersSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load users');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadUserById(id: string): Promise<User | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<User>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response?.success && response.data) {
        this.selectedUserSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load user');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createUser(data: CreateUserRequest): Promise<User | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<User>>(this.baseUrl, data)
        .toPromise();

      if (response?.success && response.data) {
        // Update users list
        this.usersSignal.update((users) => [...users, response.data!]);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to create user');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<User>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response?.success && response.data) {
        // Update users list
        this.usersSignal.update((users) =>
          users.map((user) => (user.id === id ? response.data! : user)),
        );
        // Update selected user if it's the same
        if (this.selectedUserSignal()?.id === id) {
          this.selectedUserSignal.set(response.data);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to update user');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const response = await this.http
        .get<ApiResponse<Role[]>>(`/roles`)
        .toPromise();

      if (response?.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch roles:', error);
      return [];
    }
  }

  // ===== MULTI-ROLE MANAGEMENT METHODS =====

  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const response = await this.http
        .get<ApiResponse<UserRole[]>>(`${this.baseUrl}/${userId}/roles`)
        .toPromise();

      if (response?.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error(`Failed to fetch roles for user ${userId}:`, error);
      return [];
    }
  }

  async assignRolesToUser(
    userId: string,
    request: AssignRolesToUserRequest,
  ): Promise<RoleOperationResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<
          ApiResponse<RoleOperationResponse>
        >(`${this.baseUrl}/${userId}/roles/assign`, request)
        .toPromise();

      if (response?.success && response.data) {
        // Refresh user data if it's the selected user
        if (this.selectedUserSignal()?.id === userId) {
          await this.loadUserById(userId);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to assign roles');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async removeRoleFromUser(
    userId: string,
    request: RemoveRoleFromUserRequest,
  ): Promise<RoleOperationResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<
          ApiResponse<RoleOperationResponse>
        >(`${this.baseUrl}/${userId}/roles/remove`, request)
        .toPromise();

      if (response?.success && response.data) {
        // Refresh user data if it's the selected user
        if (this.selectedUserSignal()?.id === userId) {
          await this.loadUserById(userId);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to remove role');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateRoleExpiry(
    userId: string,
    request: UpdateRoleExpiryRequest,
  ): Promise<RoleOperationResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<
          ApiResponse<RoleOperationResponse>
        >(`${this.baseUrl}/${userId}/roles/expiry`, request)
        .toPromise();

      if (response?.success && response.data) {
        // Refresh user data if it's the selected user
        if (this.selectedUserSignal()?.id === userId) {
          await this.loadUserById(userId);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to update role expiry');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // Method for CRUD generation - get users for dropdown
  async loadUsersForDropdown(): Promise<void> {
    try {
      const response = await this.http
        .get<ApiResponse<User[]>>(`${this.baseUrl}/dropdown`)
        .toPromise();

      if (response?.success && response.data) {
        this.usersSignal.set(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch users for dropdown:', error);
      // Fallback to regular load with minimal params
      await this.loadUsers({ limit: 100 });
    }
  }

  // Get users dropdown options with search support
  getUsersDropdownOptions(search?: string): Observable<UserOption[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('limit', '50');

    return this.http
      .get<
        ApiResponse<{
          options: UserOption[];
          total: number;
        }>
      >(`${this.baseUrl}/dropdown`, { params })
      .pipe(
        map((response) => {
          if (response?.success && response.data?.options) {
            return response.data.options;
          }
          return [];
        }),
      );
  }

  // Simple method to get user display name
  getUserDisplayName(userId: string): string {
    const user = this.usersSignal().find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  // Method to find user by ID from loaded list
  getUserById(userId: string): User | undefined {
    return this.usersSignal().find((u) => u.id === userId);
  }

  async deleteUser(id: string): Promise<boolean> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<ApiResponse<{ id: string }>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response?.success) {
        // Remove from users list
        this.usersSignal.update((users) =>
          users.filter((user) => user.id !== id),
        );
        // Clear selected user if it's the deleted one
        if (this.selectedUserSignal()?.id === id) {
          this.selectedUserSignal.set(null);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to delete user');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // Utility methods
  setCurrentPage(page: number): void {
    this.currentPageSignal.set(page);
  }

  setPageSize(size: number): void {
    this.pageSizeSignal.set(size);
    this.currentPageSignal.set(1); // Reset to first page
  }

  selectUser(user: User | null): void {
    this.selectedUserSignal.set(user);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  reset(): void {
    this.usersSignal.set([]);
    this.selectedUserSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
  }

  // Bulk operations
  async bulkActivateUsers(userIds: string[]): Promise<BulkOperationResult> {
    try {
      const response = await this.http
        .post<ApiResponse<BulkOperationResult>>(
          `${this.baseUrl}/bulk/activate`,
          {
            userIds,
          },
        )
        .toPromise();

      if (response?.success && response.data) {
        // Refresh users list after bulk operation
        await this.loadUsers();
        return response.data;
      }
      throw new Error('Bulk activate failed');
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to activate users');
      throw error;
    }
  }

  async bulkDeactivateUsers(userIds: string[]): Promise<BulkOperationResult> {
    try {
      const response = await this.http
        .post<ApiResponse<BulkOperationResult>>(
          `${this.baseUrl}/bulk/deactivate`,
          {
            userIds,
          },
        )
        .toPromise();

      if (response?.success && response.data) {
        // Refresh users list after bulk operation
        await this.loadUsers();
        return response.data;
      }
      throw new Error('Bulk deactivate failed');
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to deactivate users');
      throw error;
    }
  }

  async bulkSuspendUsers(userIds: string[]): Promise<BulkOperationResult> {
    try {
      const response = await this.http
        .post<ApiResponse<BulkOperationResult>>(
          `${this.baseUrl}/bulk/suspend`,
          {
            userIds,
          },
        )
        .toPromise();

      if (response?.success && response.data) {
        // Refresh users list after bulk operation
        await this.loadUsers();
        return response.data;
      }
      throw new Error('Bulk suspend failed');
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to suspend users');
      throw error;
    }
  }

  async bulkSetPendingUsers(userIds: string[]): Promise<BulkOperationResult> {
    try {
      const response = await this.http
        .post<ApiResponse<BulkOperationResult>>(
          `${this.baseUrl}/bulk/pending`,
          {
            userIds,
          },
        )
        .toPromise();

      if (response?.success && response.data) {
        // Refresh users list after bulk operation
        await this.loadUsers();
        return response.data;
      }
      throw new Error('Bulk set pending failed');
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to set users to pending');
      throw error;
    }
  }

  async bulkDeleteUsers(userIds: string[]): Promise<BulkOperationResult> {
    try {
      const response = await this.http
        .post<ApiResponse<BulkOperationResult>>(`${this.baseUrl}/bulk/delete`, {
          userIds,
        })
        .toPromise();

      if (response?.success && response.data) {
        // Refresh users list after bulk operation
        await this.loadUsers();
        return response.data;
      }
      throw new Error('Bulk delete failed');
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to delete users');
      throw error;
    }
  }

  async bulkChangeUserRoles(
    userIds: string[],
    roleIds: string[],
  ): Promise<BulkOperationResult> {
    try {
      const response = await this.http
        .post<ApiResponse<BulkOperationResult>>(
          `${this.baseUrl}/bulk/role-change`,
          {
            userIds,
            roleIds,
          },
        )
        .toPromise();

      if (response?.success && response.data) {
        // Refresh users list after bulk operation
        await this.loadUsers();
        return response.data;
      }
      throw new Error('Bulk role change failed');
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to change user roles');
      throw error;
    }
  }

  async bulkChangeUserStatus(
    userIds: string[],
    status: UserStatus,
  ): Promise<BulkOperationResult> {
    try {
      const response = await this.http
        .post<ApiResponse<BulkOperationResult>>(
          `${this.baseUrl}/bulk/change-status`,
          {
            userIds,
            status,
          },
        )
        .toPromise();

      if (response?.success && response.data) {
        // Refresh users list after bulk operation
        await this.loadUsers();
        return response.data;
      }
      throw new Error('Bulk change status failed');
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to change user status');
      throw error;
    }
  }

  // Password change method
  async changePassword(data: ChangePasswordRequest): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http
        .post<ApiResponse<{ message: string }>>(`/profile/password`, data)
        .toPromise();

      if (response?.success) {
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage =
        error.error?.error?.message ||
        error.message ||
        'Failed to change password';
      this.errorSignal.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== PROFILE METHODS =====

  getProfile() {
    return this.http.get<ApiResponse<UserProfile>>(`/profile`).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Failed to get profile');
      }),
    );
  }

  updateProfile(data: UpdateProfileRequest) {
    return this.http.put<ApiResponse<UserProfile>>(`/profile`, data).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Failed to update profile');
      }),
    );
  }

  // ===== AVATAR METHODS =====

  uploadAvatar(
    formData: FormData,
    progressCallback?: (progress: number) => void,
  ): Observable<ApiResponse<AvatarUploadResponse>> {
    const req = new HttpRequest('POST', `/profile/avatar`, formData, {
      reportProgress: true,
    });

    return this.http.request<ApiResponse<AvatarUploadResponse>>(req).pipe(
      map((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          // Calculate upload progress percentage
          const progress = event.total
            ? Math.round((100 * event.loaded) / event.total)
            : 0;

          if (progressCallback) {
            progressCallback(progress);
          }

          // Return a dummy response for progress events
          return {
            success: false,
            data: undefined,
          } as ApiResponse<AvatarUploadResponse>;
        } else if (event.type === HttpEventType.Response) {
          // This is the actual response
          const response = event.body as ApiResponse<AvatarUploadResponse>;
          if (response.success && response.data) {
            return response;
          }
          throw new Error(response.error || 'Failed to upload avatar');
        }

        // Return dummy response for other event types
        return {
          success: false,
          data: undefined,
        } as ApiResponse<AvatarUploadResponse>;
      }),
      filter((response) => response.success || response.data !== undefined),
    );
  }

  deleteAvatar(): Observable<ApiResponse<{ message: string }>> {
    return this.http
      .delete<ApiResponse<{ message: string }>>(`/profile/avatar`)
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          }
          throw new Error(response.error || 'Failed to delete avatar');
        }),
      );
  }

  // ===== PREFERENCES METHODS =====

  getPreferences() {
    return this.http
      .get<ApiResponse<UserPreferences>>(`/profile/preferences`)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.error || 'Failed to get preferences');
        }),
      );
  }

  updatePreferences(data: Partial<UserPreferences>) {
    return this.http
      .put<ApiResponse<UserPreferences>>(`/profile/preferences`, data)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.error || 'Failed to update preferences');
        }),
      );
  }

  // Delete account method
  async deleteAccount(
    data: DeleteAccountRequest,
  ): Promise<DeleteAccountResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http
        .delete<DeleteAccountResponse>(`/profile/delete`, {
          body: data,
        })
        .toPromise();

      if (response?.success) {
        return response;
      }
      throw new Error(response?.error?.message || 'Account deletion failed');
    } catch (error: any) {
      const errorMessage =
        error.error?.error?.message ||
        error.message ||
        'Failed to delete account';
      this.errorSignal.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
