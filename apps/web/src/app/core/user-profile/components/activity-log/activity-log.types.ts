export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  device_info?: {
    device?: string;
    isMobile?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface ActivityLogPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ActivityLogResponse {
  activities: ActivityLog[];
  pagination: ActivityLogPagination;
}

export interface ActivityLogStats {
  total_activities: number;
  activities_by_action: Record<string, number>;
  activities_by_severity: Record<string, number>;
  recent_activities_count: {
    today: number;
    this_week: number;
    this_month: number;
  };
  unique_devices: number;
  unique_locations: number;
  last_activity: string;
}

export interface ActivityLogFilters {
  action?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Activity severity configurations
export const SEVERITY_CONFIG = {
  info: {
    label: 'Info',
    color: 'primary',
    icon: 'info',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  warning: {
    label: 'Warning',
    color: 'accent',
    icon: 'warning',
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  },
  error: {
    label: 'Error',
    color: 'warn',
    icon: 'error',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  critical: {
    label: 'Critical',
    color: 'warn',
    icon: 'dangerous',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
} as const;

// Common action types
export const ACTION_TYPES = [
  'profile_view',
  'profile_update',
  'password_change',
  'login',
  'logout',
  'api_access',
  'api_error',
  'settings_change',
  'avatar_update',
  'preferences_update',
  'security_event'
] as const;

export type ActionType = typeof ACTION_TYPES[number];