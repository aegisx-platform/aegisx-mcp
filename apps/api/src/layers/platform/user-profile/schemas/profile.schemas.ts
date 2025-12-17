import { Type, Static } from '@sinclair/typebox';
import { ApiSuccessResponseSchema } from '../../../../schemas/base.schemas';

/**
 * User Profile TypeBox Schemas
 *
 * Comprehensive schemas for user profile management including preferences,
 * profile information, and related API responses.
 */

// ==================== ENUM SCHEMAS ====================

/**
 * Theme Enum - User interface theme preference
 */
export const ThemeSchema = Type.Union(
  [Type.Literal('light'), Type.Literal('dark'), Type.Literal('auto')],
  {
    description: 'User interface theme preference',
  },
);

export type Theme = 'light' | 'dark' | 'auto';

/**
 * Primary Department Schema
 *
 * Represents user's primary department information
 */
export const PrimaryDepartmentSchema = Type.Object(
  {
    id: Type.Number({
      description: 'Department ID',
    }),
    code: Type.String({
      description: 'Department code',
    }),
    name: Type.String({
      description: 'Department name',
    }),
    isPrimary: Type.Boolean({
      description: 'Primary department flag',
    }),
  },
  {
    $id: 'PrimaryDepartment',
    description: "User's primary department",
  },
);

export type PrimaryDepartment = Static<typeof PrimaryDepartmentSchema>;

/**
 * Language Enum - User interface language preference
 */
export const LanguageSchema = Type.Union(
  [Type.Literal('en'), Type.Literal('th')],
  {
    description: 'User interface language preference',
  },
);

export type Language = 'en' | 'th';

// ==================== PREFERENCES SCHEMA ====================

/**
 * User Preferences Schema
 *
 * Represents user-configurable preferences for UI and notifications.
 */
export const PreferencesSchema = Type.Object(
  {
    theme: ThemeSchema,
    language: LanguageSchema,
    notifications: Type.Boolean({
      description: 'Enable or disable notifications',
    }),
  },
  {
    $id: 'Preferences',
    description: 'User preferences for UI and notifications',
  },
);

export type Preferences = Static<typeof PreferencesSchema>;

// ==================== PROFILE SCHEMA ====================

/**
 * Profile Schema - Complete User Profile
 *
 * Represents the complete user profile information including personal details,
 * preferences, and metadata.
 */
export const ProfileSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid',
      description: 'User profile unique identifier',
    }),
    email: Type.String({
      format: 'email',
      description: 'User email address',
    }),
    firstName: Type.String({
      maxLength: 100,
      description: 'User first name',
    }),
    lastName: Type.String({
      maxLength: 100,
      description: 'User last name',
    }),
    avatarUrl: Type.Optional(
      Type.String({
        format: 'uri',
        description: 'User avatar URL',
      }),
    ),
    primaryDepartment: Type.Optional(PrimaryDepartmentSchema),
    theme: ThemeSchema,
    language: LanguageSchema,
    notifications: Type.Boolean({
      description: 'Notification preference',
    }),
    createdAt: Type.String({
      format: 'date-time',
      description: 'Profile creation timestamp',
    }),
    updatedAt: Type.String({
      format: 'date-time',
      description: 'Profile last update timestamp',
    }),
  },
  {
    $id: 'Profile',
    description: 'Complete user profile with all settings',
  },
);

export type Profile = Static<typeof ProfileSchema>;

// ==================== UPDATE PROFILE SCHEMA ====================

/**
 * Update Profile Schema
 *
 * Schema for updating user profile information.
 * All fields are optional to allow partial updates.
 */
export const UpdateProfileSchema = Type.Object(
  {
    firstName: Type.Optional(
      Type.String({
        maxLength: 100,
        description: 'User first name',
      }),
    ),
    lastName: Type.Optional(
      Type.String({
        maxLength: 100,
        description: 'User last name',
      }),
    ),
    avatarUrl: Type.Optional(
      Type.Union(
        [
          Type.String({
            format: 'uri',
            description: 'User avatar URL',
          }),
          Type.Null(),
        ],
        {
          description: 'User avatar URL or null to remove',
        },
      ),
    ),
    theme: Type.Optional(ThemeSchema),
    language: Type.Optional(LanguageSchema),
    notifications: Type.Optional(Type.Boolean()),
  },
  {
    $id: 'UpdateProfile',
    description: 'Profile update request - all fields optional',
  },
);

export type UpdateProfile = Static<typeof UpdateProfileSchema>;

// ==================== RESPONSE SCHEMAS ====================

/**
 * Profile Response Schema
 *
 * Standard API response wrapper for single profile.
 */
export const ProfileResponseSchema = ApiSuccessResponseSchema(ProfileSchema);

export type ProfileResponse = Static<typeof ProfileResponseSchema>;

/**
 * Profile Update Response Schema
 *
 * Response after updating user profile.
 */
export const ProfileUpdateResponseSchema =
  ApiSuccessResponseSchema(ProfileSchema);

export type ProfileUpdateResponse = Static<typeof ProfileUpdateResponseSchema>;

/**
 * Preferences Response Schema
 *
 * Response containing only user preferences.
 */
export const PreferencesResponseSchema =
  ApiSuccessResponseSchema(PreferencesSchema);

export type PreferencesResponse = Static<typeof PreferencesResponseSchema>;

/**
 * Update Preferences Schema
 *
 * Schema for updating user preferences.
 * All fields are optional.
 */
export const UpdatePreferencesSchema = Type.Object(
  {
    theme: Type.Optional(ThemeSchema),
    language: Type.Optional(LanguageSchema),
    notifications: Type.Optional(Type.Boolean()),
  },
  {
    $id: 'UpdatePreferences',
    description: 'Preferences update request - all fields optional',
  },
);

export type UpdatePreferences = Static<typeof UpdatePreferencesSchema>;

/**
 * Update Preferences Response Schema
 *
 * Response after updating preferences.
 */
export const UpdatePreferencesResponseSchema =
  ApiSuccessResponseSchema(PreferencesSchema);

export type UpdatePreferencesResponse = Static<
  typeof UpdatePreferencesResponseSchema
>;

/**
 * Avatar Upload Response Schema
 *
 * Response after uploading avatar.
 */
export const AvatarUploadResponseSchema = ApiSuccessResponseSchema(
  Type.Object(
    {
      avatarUrl: Type.String({
        format: 'uri',
        description: 'URL to uploaded avatar',
      }),
      uploadedAt: Type.String({
        format: 'date-time',
        description: 'Avatar upload timestamp',
      }),
    },
    {
      description: 'Avatar upload result',
    },
  ),
);

export type AvatarUploadResponse = Static<typeof AvatarUploadResponseSchema>;

/**
 * Profile Delete Response Schema
 *
 * Response after deleting profile.
 */
export const ProfileDeleteResponseSchema = ApiSuccessResponseSchema(
  Type.Object(
    {
      id: Type.String({
        format: 'uuid',
        description: 'Deleted profile ID',
      }),
      message: Type.String({
        description: 'Deletion confirmation message',
      }),
    },
    {
      description: 'Profile deletion result',
    },
  ),
);

export type ProfileDeleteResponse = Static<typeof ProfileDeleteResponseSchema>;

// ==================== QUERY SCHEMAS ====================

/**
 * Get Profile Query Schema
 *
 * Query parameters for retrieving profile information.
 */
export const GetProfileQuerySchema = Type.Object(
  {
    include: Type.Optional(
      Type.String({
        description:
          'Comma-separated fields to include (e.g., "preferences,department")',
      }),
    ),
  },
  {
    $id: 'GetProfileQuery',
    description: 'Query parameters for getting profile',
  },
);

export type GetProfileQuery = Static<typeof GetProfileQuerySchema>;

// ==================== PASSWORD CHANGE SCHEMAS ====================

/**
 * Change Password Schema
 *
 * Schema for changing user password.
 * Requires current password for verification and new password with confirmation.
 */
export const ChangePasswordSchema = Type.Object(
  {
    currentPassword: Type.String({
      minLength: 1,
      description: 'Current password for verification',
    }),
    newPassword: Type.String({
      minLength: 8,
      maxLength: 128,
      description: 'New password (minimum 8 characters, maximum 128)',
    }),
    confirmPassword: Type.String({
      minLength: 8,
      maxLength: 128,
      description: 'Confirmation of new password (must match newPassword)',
    }),
  },
  {
    $id: 'ChangePassword',
    description: 'Password change request with current password verification',
  },
);

export type ChangePassword = Static<typeof ChangePasswordSchema>;

/**
 * Change Password Response Schema
 *
 * Response after successfully changing password.
 */
export const ChangePasswordResponseSchema = ApiSuccessResponseSchema(
  Type.Object(
    {
      message: Type.String({
        description: 'Password change confirmation message',
      }),
      changedAt: Type.String({
        format: 'date-time',
        description: 'Timestamp when password was changed',
      }),
    },
    {
      description: 'Password change result',
    },
  ),
);

export type ChangePasswordResponse = Static<
  typeof ChangePasswordResponseSchema
>;

// ==================== EXPORT ALL SCHEMAS ====================

/**
 * All Profile Schemas
 *
 * Convenient object for importing all schemas at once.
 */
export const profileSchemas = {
  // Enums
  'theme-enum': ThemeSchema,
  'language-enum': LanguageSchema,

  // Entity schemas
  profile: ProfileSchema,
  preferences: PreferencesSchema,

  // Request schemas
  'update-profile-request': UpdateProfileSchema,
  'update-preferences-request': UpdatePreferencesSchema,
  'get-profile-query': GetProfileQuerySchema,
  'change-password-request': ChangePasswordSchema,

  // Response schemas
  'profile-response': ProfileResponseSchema,
  'profile-update-response': ProfileUpdateResponseSchema,
  'preferences-response': PreferencesResponseSchema,
  'update-preferences-response': UpdatePreferencesResponseSchema,
  'avatar-upload-response': AvatarUploadResponseSchema,
  'profile-delete-response': ProfileDeleteResponseSchema,
  'change-password-response': ChangePasswordResponseSchema,
};
