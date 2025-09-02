import { Type, type Static } from '@sinclair/typebox';
import { PaginationMetaSchema } from '../../schemas/base.schemas';

// Enums
export const DataTypeEnum = Type.Union([
  Type.Literal('string'),
  Type.Literal('number'),
  Type.Literal('boolean'),
  Type.Literal('json'),
  Type.Literal('array'),
  Type.Literal('date'),
  Type.Literal('email'),
  Type.Literal('url')
]);

export const AccessLevelEnum = Type.Union([
  Type.Literal('public'),
  Type.Literal('user'),
  Type.Literal('admin'),
  Type.Literal('system')
]);

// Validation Rules Schema
export const ValidationRulesSchema = Type.Object({
  required: Type.Optional(Type.Boolean()),
  minLength: Type.Optional(Type.Number()),
  maxLength: Type.Optional(Type.Number()),
  min: Type.Optional(Type.Number()),
  max: Type.Optional(Type.Number()),
  pattern: Type.Optional(Type.String()),
  enum: Type.Optional(Type.Array(Type.Any()))
}, { additionalProperties: true });

// UI Schema
export const UISchemaSchema = Type.Object({
  component: Type.String(),
  placeholder: Type.Optional(Type.String()),
  options: Type.Optional(Type.Array(Type.Object({
    value: Type.Any(),
    label: Type.String()
  }))),
  rows: Type.Optional(Type.Number()),
  suffix: Type.Optional(Type.String()),
  prefix: Type.Optional(Type.String()),
  hint: Type.Optional(Type.String())
}, { additionalProperties: true });

// Main Setting Schema
export const SettingSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  key: Type.String({ minLength: 1, maxLength: 255 }),
  namespace: Type.String({ minLength: 1, maxLength: 100 }),
  category: Type.String({ minLength: 1, maxLength: 100 }),
  value: Type.Any(),
  defaultValue: Type.Any(),
  label: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  dataType: DataTypeEnum,
  accessLevel: AccessLevelEnum,
  isEncrypted: Type.Boolean(),
  isReadonly: Type.Boolean(),
  isHidden: Type.Boolean(),
  validationRules: Type.Optional(ValidationRulesSchema),
  uiSchema: Type.Optional(UISchemaSchema),
  sortOrder: Type.Number(),
  group: Type.Optional(Type.String({ maxLength: 100 })),
  createdBy: Type.Optional(Type.String({ format: 'uuid' })),
  updatedBy: Type.Optional(Type.String({ format: 'uuid' })),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});

// Create/Update DTOs
export const CreateSettingSchema = Type.Object({
  key: Type.String({ minLength: 1, maxLength: 255 }),
  namespace: Type.Optional(Type.String({ minLength: 1, maxLength: 100, default: 'default' })),
  category: Type.String({ minLength: 1, maxLength: 100 }),
  value: Type.Any(),
  defaultValue: Type.Any(),
  label: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  dataType: DataTypeEnum,
  accessLevel: Type.Optional(AccessLevelEnum),
  isEncrypted: Type.Optional(Type.Boolean({ default: false })),
  isReadonly: Type.Optional(Type.Boolean({ default: false })),
  isHidden: Type.Optional(Type.Boolean({ default: false })),
  validationRules: Type.Optional(ValidationRulesSchema),
  uiSchema: Type.Optional(UISchemaSchema),
  sortOrder: Type.Optional(Type.Number({ default: 0 })),
  group: Type.Optional(Type.String({ maxLength: 100 }))
});

export const UpdateSettingSchema = Type.Partial(CreateSettingSchema);

export const UpdateSettingValueSchema = Type.Object({
  value: Type.Any()
});

// User Settings Override
export const UserSettingSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  settingId: Type.String({ format: 'uuid' }),
  value: Type.Any(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});

export const UpdateUserSettingSchema = Type.Object({
  value: Type.Any()
});

// Settings History
export const SettingHistorySchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  settingId: Type.String({ format: 'uuid' }),
  oldValue: Type.Optional(Type.Any()),
  newValue: Type.Any(),
  action: Type.String(),
  reason: Type.Optional(Type.String()),
  changedBy: Type.Optional(Type.String({ format: 'uuid' })),
  changedAt: Type.String({ format: 'date-time' }),
  ipAddress: Type.Optional(Type.String()),
  userAgent: Type.Optional(Type.String())
});

// Query Params
export const GetSettingsQuerySchema = Type.Object({
  namespace: Type.Optional(Type.String()),
  category: Type.Optional(Type.String()),
  group: Type.Optional(Type.String()),
  accessLevel: Type.Optional(AccessLevelEnum),
  includeHidden: Type.Optional(Type.Boolean({ default: false })),
  search: Type.Optional(Type.String()),
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('key'),
    Type.Literal('category'),
    Type.Literal('sortOrder'),
    Type.Literal('createdAt'),
    Type.Literal('updatedAt')
  ])),
  sortOrder: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')]))
});

export const GetSettingHistoryQuerySchema = Type.Object({
  settingId: Type.Optional(Type.String({ format: 'uuid' })),
  action: Type.Optional(Type.String()),
  changedBy: Type.Optional(Type.String({ format: 'uuid' })),
  startDate: Type.Optional(Type.String({ format: 'date-time' })),
  endDate: Type.Optional(Type.String({ format: 'date-time' })),
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 }))
});

// Grouped Settings Response
export const GroupedSettingsSchema = Type.Object({
  category: Type.String(),
  groups: Type.Array(Type.Object({
    name: Type.Optional(Type.String()),
    settings: Type.Array(SettingSchema)
  }))
});

// Bulk Operations
export const BulkUpdateSettingsSchema = Type.Array(Type.Object({
  key: Type.String(),
  value: Type.Any()
}));

// Response Schemas
export const SettingResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: SettingSchema,
  message: Type.String()
});

export const SettingsListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(SettingSchema),
  message: Type.String(),
  pagination: PaginationMetaSchema
});

export const GroupedSettingsResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(GroupedSettingsSchema),
  message: Type.String()
});

export const SettingHistoryResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(SettingHistorySchema),
  message: Type.String(),
  pagination: PaginationMetaSchema
});

export const BulkUpdateResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    updated: Type.Number(),
    failed: Type.Number(),
    errors: Type.Optional(Type.Array(Type.Object({
      key: Type.String(),
      error: Type.String()
    })))
  }),
  message: Type.String()
});

// Type exports
export type Setting = Static<typeof SettingSchema>;
export type CreateSetting = Static<typeof CreateSettingSchema>;
export type UpdateSetting = Static<typeof UpdateSettingSchema>;
export type UpdateSettingValue = Static<typeof UpdateSettingValueSchema>;
export type UserSetting = Static<typeof UserSettingSchema>;
export type UpdateUserSetting = Static<typeof UpdateUserSettingSchema>;
export type SettingHistory = Static<typeof SettingHistorySchema>;
export type GetSettingsQuery = Static<typeof GetSettingsQuerySchema>;
export type GetSettingHistoryQuery = Static<typeof GetSettingHistoryQuerySchema>;
export type GroupedSettings = Static<typeof GroupedSettingsSchema>;
export type BulkUpdateSettings = Static<typeof BulkUpdateSettingsSchema>;

// Register schemas
export const settingsSchemas = {
  // Main schemas
  'settings-setting': SettingSchema,
  'settings-create-setting': CreateSettingSchema,
  'settings-update-setting': UpdateSettingSchema,
  'settings-update-setting-value': UpdateSettingValueSchema,
  'settings-user-setting': UserSettingSchema,
  'settings-update-user-setting': UpdateUserSettingSchema,
  'settings-setting-history': SettingHistorySchema,
  
  // Query schemas
  'settings-get-settings-query': GetSettingsQuerySchema,
  'settings-get-setting-history-query': GetSettingHistoryQuerySchema,
  
  // Grouped schemas
  'settings-grouped-settings': GroupedSettingsSchema,
  'settings-bulk-update-settings': BulkUpdateSettingsSchema,
  
  // Response schemas
  'settings-setting-response': SettingResponseSchema,
  'settings-settings-list-response': SettingsListResponseSchema,
  'settings-grouped-settings-response': GroupedSettingsResponseSchema,
  'settings-setting-history-response': SettingHistoryResponseSchema,
  'settings-bulk-update-response': BulkUpdateResponseSchema
};