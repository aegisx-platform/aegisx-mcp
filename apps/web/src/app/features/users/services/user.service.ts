import {
  HttpClient,
  HttpEventType,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleId?: string;
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
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
  role: string;
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
    roleId: string,
  ): Promise<BulkOperationResult> {
    try {
      const response = await this.http
        .post<ApiResponse<BulkOperationResult>>(
          `${this.baseUrl}/bulk/role-change`,
          {
            userIds,
            roleId,
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
