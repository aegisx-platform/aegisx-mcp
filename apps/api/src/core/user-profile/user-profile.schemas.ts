import { Type, Static } from '@sinclair/typebox';
import { ApiSuccessResponseSchema } from '../../schemas/base.schemas';
// Import activity tracking schemas
import {
  ActivityLogSchema,
  CreateActivityLogSchema,
  GetActivityLogsQuerySchema,
  GetAllActivityLogsQuerySchema,
  ActivityLogsResponseSchema,
  ActivitySessionSchema,
  ActivitySessionsResponseSchema,
  ActivityStatsSchema,
  ActivityStatsResponseSchema,
  ACTIVITY_ACTIONS,
} from './user-activity.schemas';
// Import delete account schemas
import {
  DeleteAccountRequestSchema,
  DeleteAccountResponseSchema,
  DeleteAccountDataSchema,
} from './delete-account.schemas';

// Enums
export const ThemeEnum = Type.Union([
  Type.Literal('default'),
  Type.Literal('dark'),
  Type.Literal('light'),
  Type.Literal('auto'),
]);

export const SchemeEnum = Type.Union([
  Type.Literal('light'),
  Type.Literal('dark'),
  Type.Literal('auto'),
]);

export const LayoutEnum = Type.Union([
  Type.Literal('classic'),
  Type.Literal('compact'),
  Type.Literal('enterprise'),
  Type.Literal('empty'),
]);

export const DateFormatEnum = Type.Union([
  Type.Literal('MM/DD/YYYY'),
  Type.Literal('DD/MM/YYYY'),
  Type.Literal('YYYY-MM-DD'),
]);

export const TimeFormatEnum = Type.Union([
  Type.Literal('12h'),
  Type.Literal('24h'),
]);

export const NavigationTypeEnum = Type.Union([
  Type.Literal('default'),
  Type.Literal('compact'),
  Type.Literal('horizontal'),
]);

export const NavigationPositionEnum = Type.Union([
  Type.Literal('left'),
  Type.Literal('right'),
  Type.Literal('top'),
]);

export const UserStatusEnum = Type.Union([
  Type.Literal('active'),
  Type.Literal('inactive'),
  Type.Literal('suspended'),
  Type.Literal('pending'),
]);

// Sub-schemas
export const NotificationPreferencesSchema = Type.Object({
  email: Type.Boolean({ description: 'Email notifications enabled' }),
  push: Type.Boolean({ description: 'Push notifications enabled' }),
  desktop: Type.Boolean({ description: 'Desktop notifications enabled' }),
  sound: Type.Boolean({ description: 'Sound notifications enabled' }),
});

export const NavigationPreferencesSchema = Type.Object({
  collapsed: Type.Boolean({ description: 'Navigation collapsed state' }),
  type: NavigationTypeEnum,
  position: NavigationPositionEnum,
});

export const UserPreferencesSchema = Type.Object({
  theme: ThemeEnum,
  scheme: SchemeEnum,
  layout: LayoutEnum,
  language: Type.String({
    pattern: '^[a-z]{2}$',
    description: 'Two-letter language code',
  }),
  timezone: Type.String({ description: 'User timezone' }),
  dateFormat: DateFormatEnum,
  timeFormat: TimeFormatEnum,
  notifications: NotificationPreferencesSchema,
  navigation: NavigationPreferencesSchema,
});

export const UserRoleSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String({ description: 'Role name' }),
  permissions: Type.Array(Type.String(), {
    description: 'List of permission codes',
  }),
});

// Main schemas
export const UserProfileSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  username: Type.String(),
  name: Type.String(),
  firstName: Type.Union([Type.String(), Type.Null()]),
  lastName: Type.Union([Type.String(), Type.Null()]),
  bio: Type.Union([Type.String(), Type.Null()], {
    description: 'User biography or description',
  }),
  avatar: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),
  role: UserRoleSchema,
  preferences: UserPreferencesSchema,
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  lastLoginAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  status: UserStatusEnum,
  emailVerified: Type.Boolean(),
  twoFactorEnabled: Type.Boolean(),
});

// Request schemas
export const UserProfileUpdateRequestSchema = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  firstName: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  lastName: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  bio: Type.Optional(
    Type.String({
      maxLength: 500,
      description: 'User biography or description (max 500 characters)',
    }),
  ),
  preferences: Type.Optional(Type.Partial(UserPreferencesSchema)),
});

export const UserPreferencesUpdateRequestSchema = Type.Partial(
  UserPreferencesSchema,
);

// Response schemas
export const UserProfileResponseSchema =
  ApiSuccessResponseSchema(UserProfileSchema);
export const UserPreferencesResponseSchema = ApiSuccessResponseSchema(
  UserPreferencesSchema,
);

// Avatar upload schemas
export const AvatarUploadRequestSchema = Type.Object(
  {
    avatar: Type.Object(
      {
        type: Type.Literal('file'),
        format: Type.Literal('binary'),
      },
      {
        description: 'Avatar image file (JPEG, PNG, or WebP up to 5MB)',
      },
    ),
  },
  {
    title: 'AvatarUploadRequest',
    description: 'Avatar upload form data',
  },
);

export const AvatarUploadDataSchema = Type.Object({
  avatar: Type.String({ format: 'uri', description: 'Avatar URL' }),
  thumbnails: Type.Object({
    small: Type.String({ format: 'uri' }),
    medium: Type.String({ format: 'uri' }),
    large: Type.String({ format: 'uri' }),
  }),
});

export const AvatarUploadResponseSchema = ApiSuccessResponseSchema(
  AvatarUploadDataSchema,
);

export const AvatarDeleteDataSchema = Type.Object({
  message: Type.String({ description: 'Success message' }),
});

export const AvatarDeleteResponseSchema = ApiSuccessResponseSchema(
  AvatarDeleteDataSchema,
);

// Re-export activity tracking schemas (already imported above)
export {
  ActivityLogSchema,
  CreateActivityLogSchema,
  GetActivityLogsQuerySchema,
  ActivityLogsResponseSchema,
  ActivitySessionSchema,
  ActivitySessionsResponseSchema,
  ActivityStatsSchema,
  ActivityStatsResponseSchema,
  ACTIVITY_ACTIONS,
};

// Re-export delete account schemas (already imported above)
export {
  DeleteAccountRequestSchema,
  DeleteAccountResponseSchema,
  DeleteAccountDataSchema,
};

// TypeScript types
export type NotificationPreferences = Static<
  typeof NotificationPreferencesSchema
>;
export type NavigationPreferences = Static<typeof NavigationPreferencesSchema>;
export type UserPreferences = Static<typeof UserPreferencesSchema>;
export type UserRole = Static<typeof UserRoleSchema>;
export type UserProfile = Static<typeof UserProfileSchema>;
export type UserProfileUpdateRequest = Static<
  typeof UserProfileUpdateRequestSchema
>;
export type UserPreferencesUpdateRequest = Static<
  typeof UserPreferencesUpdateRequestSchema
>;
export type UserProfileResponse = Static<typeof UserProfileResponseSchema>;
export type UserPreferencesResponse = Static<
  typeof UserPreferencesResponseSchema
>;
export type AvatarUploadRequest = Static<typeof AvatarUploadRequestSchema>;
export type AvatarUploadData = Static<typeof AvatarUploadDataSchema>;
export type AvatarUploadResponse = Static<typeof AvatarUploadResponseSchema>;
export type AvatarDeleteData = Static<typeof AvatarDeleteDataSchema>;
export type AvatarDeleteResponse = Static<typeof AvatarDeleteResponseSchema>;

// Delete account types
export type DeleteAccountRequest = Static<typeof DeleteAccountRequestSchema>;
export type DeleteAccountResponse = Static<typeof DeleteAccountResponseSchema>;
export type DeleteAccountData = Static<typeof DeleteAccountDataSchema>;

// Export schemas for registration
export const userProfileSchemas = {
  // Main schemas
  'user-profile': UserProfileSchema,
  'user-role': UserRoleSchema,
  'user-preferences': UserPreferencesSchema,
  'notification-preferences': NotificationPreferencesSchema,
  'navigation-preferences': NavigationPreferencesSchema,

  // Request schemas
  'user-profile-update-request': UserProfileUpdateRequestSchema,
  'user-preferences-update-request': UserPreferencesUpdateRequestSchema,
  'avatar-upload-request': AvatarUploadRequestSchema,

  // Response schemas
  'user-profile-response': UserProfileResponseSchema,
  'user-preferences-response': UserPreferencesResponseSchema,
  'avatar-upload-response': AvatarUploadResponseSchema,
  'avatar-delete-response': AvatarDeleteResponseSchema,
  'avatar-upload-data': AvatarUploadDataSchema,
  'avatar-delete-data': AvatarDeleteDataSchema,

  // Activity tracking schemas
  'activity-log': ActivityLogSchema,
  'create-activity-log': CreateActivityLogSchema,
  'get-activity-logs-query': GetActivityLogsQuerySchema,
  'get-all-activity-logs-query': GetAllActivityLogsQuerySchema,
  'activity-logs-response': ActivityLogsResponseSchema,
  'activity-session': ActivitySessionSchema,
  'activity-sessions-response': ActivitySessionsResponseSchema,
  'activity-stats': ActivityStatsSchema,
  'activity-stats-response': ActivityStatsResponseSchema,

  // Delete account schemas
  'delete-account-request': DeleteAccountRequestSchema,
  'delete-account-response': DeleteAccountResponseSchema,
  'delete-account-data': DeleteAccountDataSchema,

  // Legacy compatibility
  userProfileResponse: UserProfileResponseSchema,
  userProfileUpdateRequest: UserProfileUpdateRequestSchema,
  userPreferencesUpdateRequest: UserPreferencesUpdateRequestSchema,
  avatarUploadResponse: AvatarUploadResponseSchema,
  avatarDeleteResponse: AvatarDeleteResponseSchema,
};
