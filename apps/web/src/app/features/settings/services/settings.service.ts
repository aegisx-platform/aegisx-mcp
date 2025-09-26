import { Injectable, signal, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import { SettingsDemoService } from './settings-demo.service';
import {
  GroupedSettings,
  GroupedSettingsResponse,
  SettingResponse,
  SettingsListResponse,
  SettingHistoryResponse,
  BulkUpdateResponse,
  GetSettingsQuery,
  GetSettingHistoryQuery,
  UpdateSettingValue,
  UpdateUserSetting,
  BulkUpdateSettings,
  Setting,
  SettingHistory,
  ApiErrorResponse,
  SettingsState,
} from '../models/settings.types';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http = inject(HttpClient);
  private demoService = inject(SettingsDemoService);
  private readonly baseUrl = '/settings';

  // Set to true to use demo service instead of real API
  private readonly useDemoMode = false;

  // Signal-based state management
  private _state = signal<SettingsState>({
    groupedSettings: [],
    loading: false,
    error: null,
    hasUnsavedChanges: false,
    isSaving: false,
  });

  // Read-only state signals
  readonly state = this._state.asReadonly();
  readonly groupedSettings = () => this._state().groupedSettings;
  readonly loading = () => this._state().loading;
  readonly error = () => this._state().error;
  readonly hasUnsavedChanges = () => this._state().hasUnsavedChanges;
  readonly isSaving = () => this._state().isSaving;

  // Cache for optimistic updates
  private originalSettings: Map<string, any> = new Map();
  private pendingChanges: Map<string, any> = new Map();

  /**
   * Get grouped settings by category
   */
  getGroupedSettings(query?: GetSettingsQuery): Observable<GroupedSettings[]> {
    this.setLoading(true);
    this.clearError();

    if (this.useDemoMode) {
      return this.demoService.getGroupedSettings().pipe(
        tap((groupedSettings) => {
          this.updateState({
            groupedSettings,
            loading: false,
          });
          // Cache original values for optimistic updates
          this.cacheOriginalValues(groupedSettings);
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
    }

    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<GroupedSettingsResponse>(`${this.baseUrl}/grouped`, { params })
      .pipe(
        map((response) => response.data),
        tap((groupedSettings) => {
          this.updateState({
            groupedSettings,
            loading: false,
          });
          // Cache original values for optimistic updates
          this.cacheOriginalValues(groupedSettings);
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Get all settings (paginated)
   */
  getSettings(query?: GetSettingsQuery): Observable<{
    data: Setting[];
    pagination: any;
  }> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<SettingsListResponse>(`${this.baseUrl}`, { params })
      .pipe(
        map((response) => ({
          data: response.data,
          pagination: response.pagination,
        })),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Get individual setting value by key
   */
  getSettingValue(key: string): Observable<any> {
    return this.http
      .get<{
        success: true;
        data: any;
        message: string;
      }>(`${this.baseUrl}/value/${encodeURIComponent(key)}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Update user-specific setting value
   */
  updateUserSetting(settingId: string, value: any): Observable<Setting> {
    const updateData: UpdateUserSetting = { value };

    return this.http
      .put<SettingResponse>(`${this.baseUrl}/user/${settingId}`, updateData)
      .pipe(
        map((response) => response.data),
        tap((updatedSetting) => {
          this.updateSettingInState(updatedSetting);
          this.removePendingChange(settingId);
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Update multiple settings at once (bulk update)
   */
  bulkUpdateSettings(updates: BulkUpdateSettings[]): Observable<{
    updated: number;
    failed: number;
    errors?: Array<{ key: string; error: string }>;
  }> {
    this.setSaving(true);

    if (this.useDemoMode) {
      return this.demoService.bulkUpdateSettings(updates).pipe(
        tap(() => {
          this.clearPendingChanges();
          this.setHasUnsavedChanges(false);
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setSaving(false)),
      );
    }

    return this.http
      .post<BulkUpdateResponse>(`${this.baseUrl}/bulk-update`, updates)
      .pipe(
        map((response) => response.data),
        tap(() => {
          this.clearPendingChanges();
          this.setHasUnsavedChanges(false);
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setSaving(false)),
      );
  }

  /**
   * Get setting history
   */
  getSettingHistory(query?: GetSettingHistoryQuery): Observable<{
    data: SettingHistory[];
    pagination: any;
  }> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<SettingHistoryResponse>(`${this.baseUrl}/history`, { params })
      .pipe(
        map((response) => ({
          data: response.data,
          pagination: response.pagination,
        })),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Optimistic update - immediately update UI, revert on error
   */
  optimisticUpdate(settingId: string, value: any): void {
    // Store original value if not already stored
    if (!this.originalSettings.has(settingId)) {
      const currentSetting = this.findSettingById(settingId);
      if (currentSetting) {
        this.originalSettings.set(settingId, currentSetting.value);
      }
    }

    // Update UI immediately
    this.updateSettingValueInState(settingId, value);
    this.pendingChanges.set(settingId, value);
    this.setHasUnsavedChanges(true);
  }

  /**
   * Save all pending changes
   */
  saveAllChanges(): Observable<any> {
    if (this.pendingChanges.size === 0) {
      return throwError(() => new Error('No changes to save'));
    }

    this.setSaving(true);

    const updates: BulkUpdateSettings[] = [];
    this.pendingChanges.forEach((value, settingId) => {
      const setting = this.findSettingById(settingId);
      if (setting) {
        updates.push({
          key: setting.key,
          value,
        });
      }
    });

    return this.bulkUpdateSettings(updates).pipe(
      tap(() => {
        this.clearPendingChanges();
        this.originalSettings.clear();
      }),
    );
  }

  /**
   * Revert all pending changes
   */
  revertAllChanges(): void {
    this.originalSettings.forEach((originalValue, settingId) => {
      this.updateSettingValueInState(settingId, originalValue);
    });

    this.clearPendingChanges();
    this.originalSettings.clear();
    this.setHasUnsavedChanges(false);
  }

  /**
   * Revert specific setting change
   */
  revertSettingChange(settingId: string): void {
    const originalValue = this.originalSettings.get(settingId);
    if (originalValue !== undefined) {
      this.updateSettingValueInState(settingId, originalValue);
      this.originalSettings.delete(settingId);
      this.pendingChanges.delete(settingId);
    }

    if (this.pendingChanges.size === 0) {
      this.setHasUnsavedChanges(false);
    }
  }

  /**
   * Get setting by category
   */
  getSettingsByCategory(category: string): Setting[] {
    const groupedSettings = this.groupedSettings();
    const categoryGroup = groupedSettings.find(
      (group) => group.category === category,
    );

    if (!categoryGroup) return [];

    return categoryGroup.groups.flatMap((group) => group.settings);
  }

  /**
   * Check if setting has pending changes
   */
  hasSettingChanged(settingId: string): boolean {
    return this.pendingChanges.has(settingId);
  }

  /**
   * Get pending change value for setting
   */
  getPendingChangeValue(settingId: string): any {
    return this.pendingChanges.get(settingId);
  }

  // Private helper methods

  private updateState(partialState: Partial<SettingsState>): void {
    this._state.update((current) => ({ ...current, ...partialState }));
  }

  private setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  private setSaving(isSaving: boolean): void {
    this.updateState({ isSaving });
  }

  private clearError(): void {
    this.updateState({ error: null });
  }

  private setError(error: string): void {
    this.updateState({ error, loading: false, isSaving: false });
  }

  private setHasUnsavedChanges(hasUnsavedChanges: boolean): void {
    this.updateState({ hasUnsavedChanges });
  }

  private cacheOriginalValues(groupedSettings: GroupedSettings[]): void {
    groupedSettings.forEach((category) => {
      category.groups.forEach((group) => {
        group.settings.forEach((setting) => {
          if (!this.originalSettings.has(setting.id)) {
            this.originalSettings.set(setting.id, setting.value);
          }
        });
      });
    });
  }

  private findSettingById(settingId: string): Setting | null {
    const groupedSettings = this.groupedSettings();
    for (const category of groupedSettings) {
      for (const group of category.groups) {
        const setting = group.settings.find((s) => s.id === settingId);
        if (setting) return setting;
      }
    }
    return null;
  }

  private updateSettingInState(updatedSetting: Setting): void {
    const currentSettings = this.groupedSettings();
    const updatedSettings = currentSettings.map((category) => ({
      ...category,
      groups: category.groups.map((group) => ({
        ...group,
        settings: group.settings.map((setting) =>
          setting.id === updatedSetting.id ? updatedSetting : setting,
        ),
      })),
    }));

    this.updateState({ groupedSettings: updatedSettings });
  }

  private updateSettingValueInState(settingId: string, newValue: any): void {
    const currentSettings = this.groupedSettings();
    const updatedSettings = currentSettings.map((category) => ({
      ...category,
      groups: category.groups.map((group) => ({
        ...group,
        settings: group.settings.map((setting) =>
          setting.id === settingId ? { ...setting, value: newValue } : setting,
        ),
      })),
    }));

    this.updateState({ groupedSettings: updatedSettings });
  }

  private removePendingChange(settingId: string): void {
    this.pendingChanges.delete(settingId);
    if (this.pendingChanges.size === 0) {
      this.setHasUnsavedChanges(false);
    }
  }

  private clearPendingChanges(): void {
    this.pendingChanges.clear();
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

    // Revert optimistic updates on error
    if (this.pendingChanges.size > 0) {
      this.revertAllChanges();
    }

    console.error('Settings API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
