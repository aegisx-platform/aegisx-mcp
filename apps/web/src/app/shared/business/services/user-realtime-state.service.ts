import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import {
  BaseRealtimeStateManager,
  BaseEntity,
  StateOptions,
  ConflictInfo,
} from './base-realtime-state-manager';
import { ApiConfigService } from '../../../core/http';
import { AuthService } from '../../../core/auth';

export interface User extends BaseEntity {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive?: boolean;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserRealtimeStateService extends BaseRealtimeStateManager<User> {
  private http: HttpClient = inject(HttpClient);
  private apiConfig: ApiConfigService = inject(ApiConfigService);
  private authService: AuthService = inject(AuthService);

  constructor() {
    const stateOptions: StateOptions = {
      feature: 'users',
      entity: 'user',
      enableOptimisticUpdates: true, // ✅ เปิดแล้วหลังจากแก้ race condition
      enableConflictDetection: true,
      debounceMs: 300,
      retryAttempts: 3,
    };

    super(stateOptions);

    console.log('👥 UserRealtimeStateService initialized');
  }

  // Helper method to create HTTP headers with auth
  private getHttpHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  private getHttpHeadersWithoutContentType(): HttpHeaders {
    const token = this.authService.accessToken();
    return new HttpHeaders({
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  // Helper method to handle HTTP errors
  private handleHttpError = (error: any) => {
    console.error('HTTP error:', error);

    if (error.status === 403) {
      console.warn('Insufficient permissions for this operation');
      throw new Error(
        'ไม่มีสิทธิ์ในการดำเนินการนี้ (Insufficient permissions)',
      );
    } else if (error.status === 401) {
      console.warn('Authentication required');
      throw new Error('กรุณาเข้าสู่ระบบใหม่ (Authentication required)');
    } else if (error.status === 400) {
      const message = error.error?.error?.message || 'Invalid request data';
      throw new Error(`ข้อมูลไม่ถูกต้อง: ${message}`);
    }

    throw new Error(`เกิดข้อผิดพลาด: ${error.message || 'Unknown error'}`);
  };

  // Implement abstract methods
  protected async fetchFromServer(): Promise<User[]> {
    try {
      const url = `${this.apiConfig.getApiBaseUrl()}/api/users`;
      const response = await firstValueFrom(
        this.http
          .get<{ success: boolean; data: User[] }>(url, {
            headers: this.getHttpHeaders(),
          })
          .pipe(catchError(this.handleHttpError)),
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  protected async serverCreate(data: Omit<User, 'id'>): Promise<User> {
    try {
      const url = `${this.apiConfig.getApiBaseUrl()}/api/users`;

      // Backend service can handle role name conversion to roleId automatically
      const userData = {
        email: data['email'],
        username: data['username'],
        password: (data as any)['password'],
        firstName: data['firstName'],
        lastName: data['lastName'],
        // Send role name instead of roleId - backend will convert it
        role: (data as any)['role'] || 'user',
        isActive: data['isActive'] !== false, // default to true
      };

      const response = await firstValueFrom(
        this.http
          .post<{ success: boolean; data: User }>(url, userData, {
            headers: this.getHttpHeaders(),
          })
          .pipe(catchError(this.handleHttpError)),
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  protected async serverUpdate(
    id: string | number,
    changes: Partial<User>,
  ): Promise<User> {
    try {
      const url = `${this.apiConfig.getApiBaseUrl()}/api/users/${id}`;
      const response = await firstValueFrom(
        this.http
          .put<{ success: boolean; data: User }>(url, changes, {
            headers: this.getHttpHeaders(),
          })
          .pipe(catchError(this.handleHttpError)),
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  protected async serverDelete(id: string | number): Promise<void> {
    try {
      console.log(
        '🗑️ UserRealtimeStateService.serverDelete called for ID:',
        id,
      );
      const url = `${this.apiConfig.getApiBaseUrl()}/api/users/${id}`;
      console.log('🗑️ DELETE request URL:', url);

      await firstValueFrom(
        this.http
          .delete<void>(url, {
            headers: this.getHttpHeadersWithoutContentType(),
          })
          .pipe(catchError(this.handleHttpError)),
      );

      console.log('✅ DELETE request completed successfully');
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }

  protected extractEntityId(entity: any): string | number {
    return entity.id;
  }

  // Override optional hooks for custom behavior
  protected override onRealtimeConnected(): void {
    console.log('👥 User real-time connection established');
    // Auto-sync when connected
    this.syncWithServer().catch((error) => {
      console.error('Failed to sync users on connection:', error);
    });
  }

  protected override onRealtimeDisconnected(): void {
    console.log('👥 User real-time connection lost');
  }

  protected override onBulkOperationStarted(data: any): void {
    console.log('👥 Bulk user operation started:', data);
  }

  protected override onBulkOperationProgress(data: any): void {
    console.log('👥 Bulk user operation progress:', data);
  }

  protected override onBulkOperationCompleted(data: any): void {
    console.log('👥 Bulk user operation completed:', data);
    // Refresh data after bulk operations
    this.syncWithServer().catch((error) => {
      console.error('Failed to sync users after bulk operation:', error);
    });
  }

  protected override onConflictDetected(
    entityId: string | number,
    conflict: ConflictInfo,
  ): void {
    console.warn('👥 User conflict detected:', entityId, conflict);

    // Custom conflict resolution logic
    if (this.isMinorConflict(conflict)) {
      // Auto-resolve minor conflicts (e.g., lastLoginAt updates)
      this.resolveConflict(entityId, 'accept_server');
    } else {
      // Let user decide on major conflicts
      console.log('👥 Major conflict requires user intervention');
    }
  }

  protected override onEntityLocked(
    entityId: string | number,
    userId: string,
    lockType?: string,
  ): void {
    console.log('👥 User entity locked:', { entityId, userId, lockType });
  }

  protected override onEntityUnlocked(
    entityId: string | number,
    userId: string,
  ): void {
    console.log('👥 User entity unlocked:', { entityId, userId });
  }

  // Public convenience methods
  public async createUser(
    userData: CreateUserRequest,
    options?: { skipOptimistic?: boolean },
  ): Promise<User> {
    if (options?.skipOptimistic) {
      // Server-only mode for when you want guaranteed accuracy
      return this.serverCreate(userData as Omit<User, 'id'>);
    }

    // Default: Optimistic mode for better UX
    return this.optimisticCreate(userData as Omit<User, 'id'>);
  }

  public async updateUser(
    id: string,
    changes: UpdateUserRequest,
  ): Promise<User> {
    return this.optimisticUpdate(id, changes);
  }

  public async deleteUser(id: string): Promise<void> {
    console.log('🗑️ UserRealtimeStateService.deleteUser called for ID:', id);
    return this.optimisticDelete(id);
  }

  public async activateUser(id: string): Promise<User> {
    return this.updateUser(id, { isActive: true });
  }

  public async deactivateUser(id: string): Promise<User> {
    return this.updateUser(id, { isActive: false });
  }

  public getUserById(id: string): User | undefined {
    return this.localState().find((user) => user.id === id);
  }

  public getUsersByRole(role: string): User[] {
    return this.localState().filter((user) => user.role === role);
  }

  public getActiveUsers(): User[] {
    return this.localState().filter((user) => user.isActive);
  }

  public searchUsers(query: string): User[] {
    const lowercaseQuery = query.toLowerCase();
    return this.localState().filter(
      (user) =>
        user.email.toLowerCase().includes(lowercaseQuery) ||
        user.username.toLowerCase().includes(lowercaseQuery) ||
        user.firstName.toLowerCase().includes(lowercaseQuery) ||
        user.lastName.toLowerCase().includes(lowercaseQuery),
    );
  }

  // Custom conflict resolution helpers
  private isMinorConflict(conflict: ConflictInfo): boolean {
    const minorFields = ['lastLoginAt', 'updatedAt'];
    return conflict.conflictedFields.every((field) =>
      minorFields.includes(field),
    );
  }

  // Bulk operations
  public async bulkActivateUsers(userIds: string[]): Promise<void> {
    const url = `${this.apiConfig.getApiBaseUrl()}/api/users/bulk/activate`;
    await firstValueFrom(this.http.post(url, { userIds }));
  }

  public async bulkDeactivateUsers(userIds: string[]): Promise<void> {
    const url = `${this.apiConfig.getApiBaseUrl()}/api/users/bulk/deactivate`;
    await firstValueFrom(this.http.post(url, { userIds }));
  }

  public async bulkDeleteUsers(userIds: string[]): Promise<void> {
    const url = `${this.apiConfig.getApiBaseUrl()}/api/users/bulk/delete`;
    await firstValueFrom(this.http.post(url, { userIds }));
  }
}
