import { Injectable, signal, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  ApiKey,
  ApiKeyWithPreview,
  GenerateApiKeyRequest,
  GenerateApiKeyResponse,
  GeneratedApiKey,
  ValidateApiKeyRequest,
  ValidateApiKeyResponse,
  ValidationResult,
  RevokeApiKeyRequest,
  RevokeApiKeyResponse,
  RotateApiKeyRequest,
  RotateApiKeyResponse,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  ListApiKeysQuery,
  UserApiKeysQuery,
  ApiKeyResponse,
  ApiKeysListResponse,
  ApiErrorResponse,
  ApiKeysState,
} from '../models/api-keys.types';

@Injectable({
  providedIn: 'root',
})
export class ApiKeysService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api-keys';

  // Signal-based state management
  private _state = signal<ApiKeysState>({
    keys: [],
    loading: false,
    error: null,
    selectedKey: null,
    totalKeys: 0,
    activeKeys: 0,
  });

  // Read-only state signals
  readonly state = this._state.asReadonly();
  readonly keys = () => this._state().keys;
  readonly loading = () => this._state().loading;
  readonly error = () => this._state().error;
  readonly selectedKey = () => this._state().selectedKey;
  readonly totalKeys = () => this._state().totalKeys;
  readonly activeKeys = () => this._state().activeKeys;

  /**
   * Generate a new API key
   * POST /api/api-keys/generate
   */
  generateKey(request: GenerateApiKeyRequest): Observable<GeneratedApiKey> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .post<{
        success: boolean;
        data: any;
        message: string;
      }>(`${this.baseUrl}/generate`, request)
      .pipe(
        map((response) => {
          // Backend sends flat structure: {id, name, key, prefix, preview, ...}
          // Transform to frontend interface: {apiKey, fullKey, preview}
          const data = response.data;
          return {
            apiKey: {
              id: data.id,
              user_id: '', // Not returned from backend
              name: data.name,
              key_hash: '', // Not returned
              key_prefix: data.prefix,
              scopes: data.scopes,
              last_used_at: null,
              last_used_ip: null,
              expires_at: data.expires_at,
              is_active: data.is_active,
              created_at: data.created_at,
              updated_at: data.created_at,
            },
            fullKey: data.key, // ← Map "key" to "fullKey"
            preview: data.preview,
          } as GeneratedApiKey;
        }),
        tap((generated) => {
          // Add new key to state
          const newKey: ApiKeyWithPreview = {
            ...generated.apiKey,
            preview: generated.preview,
          };
          this.updateState({
            keys: [newKey, ...this.keys()],
            totalKeys: this.totalKeys() + 1,
            activeKeys: this.activeKeys() + 1,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Validate an API key
   * POST /api/api-keys/validate
   */
  validateKey(request: ValidateApiKeyRequest): Observable<ValidationResult> {
    return this.http
      .post<ValidateApiKeyResponse>(`${this.baseUrl}/validate`, request)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Get current user's API keys
   * GET /api/api-keys/my-keys
   */
  getMyKeys(query?: UserApiKeysQuery): Observable<{
    data: ApiKeyWithPreview[];
    pagination: any;
  }> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<ApiKeysListResponse>(`${this.baseUrl}/my-keys`, { params })
      .pipe(
        map((response) => ({
          data: response.data,
          pagination: response.pagination,
        })),
        tap((result) => {
          this.updateState({
            keys: result.data,
            totalKeys: result.pagination.total,
            activeKeys: result.data.filter((k) => k.is_active).length,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Revoke (deactivate) an API key
   * POST /api/api-keys/:id/revoke
   */
  revokeKey(
    id: string,
    request?: RevokeApiKeyRequest,
  ): Observable<RevokeApiKeyResponse> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .post<RevokeApiKeyResponse>(`${this.baseUrl}/${id}/revoke`, request || {})
      .pipe(
        tap((response) => {
          // Update key in state
          const updatedKeys = this.keys().map((key) =>
            key.id === id ? { ...key, is_active: false } : key,
          );
          this.updateState({
            keys: updatedKeys,
            activeKeys: this.activeKeys() - 1,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Rotate an API key (generate new, deactivate old)
   * POST /api/api-keys/:id/rotate
   */
  rotateKey(
    id: string,
    request?: RotateApiKeyRequest,
  ): Observable<RotateApiKeyResponse> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .post<{
        success: boolean;
        data: RotateApiKeyResponse;
        message: string;
      }>(`${this.baseUrl}/${id}/rotate`, request || {})
      .pipe(
        map((response) => response.data),
        tap((rotated) => {
          // Replace old key with new key in state
          const newKey: ApiKeyWithPreview = {
            ...rotated.newApiKey,
            preview: rotated.preview,
          };
          const updatedKeys = this.keys().map((key) =>
            key.id === id ? newKey : key,
          );
          this.updateState({
            keys: updatedKeys,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Create a new API key (CRUD)
   * POST /api/api-keys
   */
  createKey(request: CreateApiKeyRequest): Observable<ApiKey> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<ApiKeyResponse>(`${this.baseUrl}`, request).pipe(
      map((response) => response.data),
      tap((newKey) => {
        // Note: Created key doesn't have preview, only for direct CRUD
        this.updateState({
          totalKeys: this.totalKeys() + 1,
          loading: false,
        });
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * Get all API keys with pagination (CRUD)
   * GET /api/api-keys
   */
  getAllKeys(query?: ListApiKeysQuery): Observable<{
    data: ApiKey[];
    pagination: any;
  }> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<ApiKeysListResponse>(`${this.baseUrl}`, { params })
      .pipe(
        map((response) => ({
          data: response.data,
          pagination: response.pagination,
        })),
        tap(() => {
          this.updateState({ loading: false });
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Get API key by ID (CRUD)
   * GET /api/api-keys/:id
   */
  getKeyById(id: string): Observable<ApiKey> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<ApiKeyResponse>(`${this.baseUrl}/${id}`).pipe(
      map((response) => response.data),
      tap((key) => {
        this.updateState({
          selectedKey: key,
          loading: false,
        });
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * Update an API key (CRUD)
   * PUT /api/api-keys/:id
   */
  updateKey(id: string, request: UpdateApiKeyRequest): Observable<ApiKey> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<ApiKeyResponse>(`${this.baseUrl}/${id}`, request).pipe(
      map((response) => response.data),
      tap((updatedKey) => {
        // Update key in state
        const updatedKeys = this.keys().map((key) =>
          key.id === id ? { ...key, ...updatedKey } : key,
        );
        this.updateState({
          keys: updatedKeys,
          loading: false,
        });
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * Delete an API key (CRUD)
   * DELETE /api/api-keys/:id
   */
  deleteKey(id: string): Observable<{ success: boolean; message: string }> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`)
      .pipe(
        tap(() => {
          // Remove key from state
          const updatedKeys = this.keys().filter((key) => key.id !== id);
          this.updateState({
            keys: updatedKeys,
            totalKeys: this.totalKeys() - 1,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  // Helper methods

  /**
   * Clear selected key
   */
  clearSelectedKey(): void {
    this.updateState({ selectedKey: null });
  }

  /**
   * Refresh current user's keys
   */
  refreshMyKeys(): Observable<any> {
    return this.getMyKeys();
  }

  // Private helper methods

  private updateState(partialState: Partial<ApiKeysState>): void {
    this._state.update((current) => ({ ...current, ...partialState }));
  }

  private setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  private clearError(): void {
    this.updateState({ error: null });
  }

  private setError(error: string): void {
    this.updateState({ error, loading: false });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.error && typeof error.error === 'object') {
      const apiError = error.error as ApiErrorResponse;
      errorMessage = apiError.error?.message || 'An unexpected error occurred';
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;
    }

    this.setError(errorMessage);

    console.error('API Keys Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
