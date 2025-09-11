import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  private baseUrl = `${environment.apiUrl}/api/users`;

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
        .get<ApiResponse<Role[]>>(`/api/roles`)
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
}
