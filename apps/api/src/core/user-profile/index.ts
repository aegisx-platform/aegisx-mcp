// Export plugin
export { default as userProfilePlugin } from './user-profile.plugin';

// Export types (but not the ones that conflict with schemas)
export {
  type AvatarFile,
  type AvatarUploadResult,
  type DatabaseUser,
  type DatabaseUserPreferences
} from './user-profile.types';

// Export services (for testing or external use)
export { UserProfileService } from './services/user-profile.service';
export { AvatarService } from './services/avatar.service';
export { UserProfileRepository } from './user-profile.repository';
export { UserProfileController } from './user-profile.controller';

// Export schemas and their types
export {
  // Schemas
  ThemeEnum,
  SchemeEnum,
  LayoutEnum,
  DateFormatEnum,
  TimeFormatEnum,
  NavigationTypeEnum,
  NavigationPositionEnum,
  UserStatusEnum,
  NotificationPreferencesSchema,
  NavigationPreferencesSchema,
  UserPreferencesSchema,
  UserRoleSchema,
  UserProfileSchema,
  UserProfileUpdateRequestSchema,
  UserPreferencesUpdateRequestSchema,
  UserProfileResponseSchema,
  AvatarUploadDataSchema,
  AvatarUploadResponseSchema,
  AvatarDeleteDataSchema,
  AvatarDeleteResponseSchema,
  userProfileSchemas,
  // Types
  type NotificationPreferences,
  type NavigationPreferences,
  type UserPreferences,
  type UserRole,
  type UserProfile,
  type UserProfileUpdateRequest,
  type UserPreferencesUpdateRequest,
  type UserProfileResponse,
  type AvatarUploadData,
  type AvatarUploadResponse,
  type AvatarDeleteData,
  type AvatarDeleteResponse
} from './user-profile.schemas';