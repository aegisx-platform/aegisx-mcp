export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserPreferences {
  theme?: 'default' | 'dark' | 'light' | 'auto';
  scheme?: 'light' | 'dark' | 'auto';
  layout?: 'classic' | 'compact' | 'enterprise' | 'empty';
  language?: string;
  timezone?: string;
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat?: '12h' | '24h';
  notifications?: NotificationPreferences;
  navigation?: NavigationPreferences;
}

export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  desktop?: boolean;
  sound?: boolean;
}

export interface NavigationPreferences {
  collapsed?: boolean;
  type?: 'default' | 'compact' | 'horizontal';
  position?: 'left' | 'right' | 'top';
}

export interface UserProfileUpdateRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export type UserPreferencesUpdateRequest = UserPreferences

export interface AvatarFile {
  id: string;
  userId: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AvatarUploadResult {
  avatar: string;
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface DatabaseUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
  status: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  role_name?: string;
}

export interface DatabaseUserPreferences {
  id: string;
  user_id: string;
  theme: string;
  scheme: string;
  layout: string;
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  navigation_collapsed: boolean;
  navigation_type: string;
  navigation_position: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_desktop: boolean;
  notifications_sound: boolean;
  notifications_security: boolean;
  notifications_updates: boolean;
  notifications_marketing: boolean;
  notifications_reminders: boolean;
  profile_visibility: string;
  activity_tracking: boolean;
  analytics_opt_out: boolean;
  data_sharing: boolean;
  high_contrast: boolean;
  font_size: string;
  reduced_motion: boolean;
  screen_reader: boolean;
  animations: boolean;
  lazy_loading: boolean;
  caching: boolean;
  compression: boolean;
  created_at: Date;
  updated_at: Date;
}