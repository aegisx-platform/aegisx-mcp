// TypeScript types matching backend settings schemas exactly
// Based on apps/api/src/modules/settings/settings.schemas.ts

// Enums
export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'json'
  | 'array'
  | 'date'
  | 'email'
  | 'url';

export type AccessLevel = 'public' | 'user' | 'admin' | 'system';

// Validation Rules
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  [key: string]: any; // Additional properties allowed
}

// UI Schema
export interface UISchema {
  component: string;
  placeholder?: string;
  options?: Array<{
    value: any;
    label: string;
  }>;
  rows?: number;
  suffix?: string;
  prefix?: string;
  hint?: string;
  [key: string]: any; // Additional properties allowed
}

// Main Setting Interface
export interface Setting {
  id: string; // UUID format
  key: string;
  namespace: string;
  category: string;
  value: any;
  defaultValue: any;
  label: string;
  description?: string;
  dataType: DataType;
  accessLevel: AccessLevel;
  isEncrypted: boolean;
  isReadonly: boolean;
  isHidden: boolean;
  validationRules?: ValidationRules;
  uiSchema?: UISchema;
  sortOrder: number;
  group?: string;
  createdBy?: string; // UUID format
  updatedBy?: string; // UUID format
  createdAt: string; // ISO date-time format
  updatedAt: string; // ISO date-time format
}

// Create/Update DTOs
export interface CreateSetting {
  key: string;
  namespace?: string; // defaults to 'default'
  category: string;
  value: any;
  defaultValue: any;
  label: string;
  description?: string;
  dataType: DataType;
  accessLevel?: AccessLevel;
  isEncrypted?: boolean; // defaults to false
  isReadonly?: boolean; // defaults to false
  isHidden?: boolean; // defaults to false
  validationRules?: ValidationRules;
  uiSchema?: UISchema;
  sortOrder?: number; // defaults to 0
  group?: string;
}

export type UpdateSetting = Partial<CreateSetting>;

export interface UpdateSettingValue {
  value: any;
}

// User Settings Override
export interface UserSetting {
  id: string; // UUID format
  userId: string; // UUID format
  settingId: string; // UUID format
  value: any;
  createdAt: string; // ISO date-time format
  updatedAt: string; // ISO date-time format
}

export interface UpdateUserSetting {
  value: any;
}

// Settings History
export interface SettingHistory {
  id: string; // UUID format
  settingId: string; // UUID format
  oldValue?: any;
  newValue: any;
  action: string;
  reason?: string;
  changedBy?: string; // UUID format
  changedAt: string; // ISO date-time format
  ipAddress?: string;
  userAgent?: string;
}

// Query Parameters
export interface GetSettingsQuery {
  namespace?: string;
  category?: string;
  group?: string;
  accessLevel?: AccessLevel;
  includeHidden?: boolean; // defaults to false
  search?: string;
  page?: number; // minimum 1, defaults to 1
  limit?: number; // minimum 1, maximum 100, defaults to 20
  sortBy?: 'key' | 'category' | 'sortOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetSettingHistoryQuery {
  settingId?: string; // UUID format
  action?: string;
  changedBy?: string; // UUID format
  startDate?: string; // ISO date-time format
  endDate?: string; // ISO date-time format
  page?: number; // minimum 1, defaults to 1
  limit?: number; // minimum 1, maximum 100, defaults to 20
}

// Grouped Settings
export interface GroupedSettings {
  category: string;
  groups: Array<{
    name?: string;
    settings: Setting[];
  }>;
}

// Bulk Operations
export interface BulkUpdateSettings {
  key: string;
  value: any;
}

// Pagination Meta (from base schemas)
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Response Wrappers
export interface ApiResponse<T = any> {
  success: true;
  data: T;
  message: string;
  timestamp?: string;
}

export type SettingResponse = ApiResponse<Setting>;

export interface SettingsListResponse extends ApiResponse<Setting[]> {
  pagination: PaginationMeta;
}

export type GroupedSettingsResponse = ApiResponse<GroupedSettings[]>;

export interface SettingHistoryResponse extends ApiResponse<SettingHistory[]> {
  pagination: PaginationMeta;
}

export type BulkUpdateResponse = ApiResponse<{
  updated: number;
  failed: number;
  errors?: Array<{
    key: string;
    error: string;
  }>;
}>;

// Error Response
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Frontend-specific types for component state
export interface SettingsState {
  groupedSettings: GroupedSettings[];
  loading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

export interface SettingFormControl {
  setting: Setting;
  value: any;
  isDirty: boolean;
  isValid: boolean;
  errors?: string[];
}

export interface CategoryFormState {
  category: string;
  displayName: string;
  controls: Record<string, SettingFormControl>;
  hasChanges: boolean;
}

// Component events
export interface SettingChangeEvent {
  settingId: string;
  key: string;
  oldValue: any;
  newValue: any;
  category: string;
}

export interface SettingsSaveEvent {
  changes: Array<{
    settingId: string;
    key: string;
    value: any;
  }>;
  category?: string;
}
