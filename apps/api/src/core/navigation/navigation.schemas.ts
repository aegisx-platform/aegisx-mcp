import { Type, Static } from '@sinclair/typebox';
import { ApiSuccessResponseSchema } from '../../schemas/base.schemas';

/**
 * Navigation API Schemas
 * TypeBox schemas for request validation and response serialization
 * Based on OpenAPI specification: navigation-api.yaml
 */

// Enums
export const BadgeVariantEnum = Type.Union([
  Type.Literal('default'),
  Type.Literal('primary'),
  Type.Literal('secondary'),
  Type.Literal('success'),
  Type.Literal('warning'),
  Type.Literal('error')
]);

export const NavigationTypeEnum = Type.Union([
  Type.Literal('item'),
  Type.Literal('group'),
  Type.Literal('collapsible'),
  Type.Literal('divider'),
  Type.Literal('spacer')
]);

export const NavigationVariantEnum = Type.Union([
  Type.Literal('default'),
  Type.Literal('compact'),
  Type.Literal('horizontal'),
  Type.Literal('mobile'),
  Type.Literal('all')
]);

export const TargetEnum = Type.Union([
  Type.Literal('_self'),
  Type.Literal('_blank'),
  Type.Literal('_parent'),
  Type.Literal('_top')
]);

// Navigation Badge Schema
export const NavigationBadgeSchema = Type.Object({
  title: Type.String({ description: 'Badge title' }),
  classes: Type.Optional(Type.String({ description: 'CSS classes for styling' })),
  variant: Type.Optional(BadgeVariantEnum)
});

// Navigation Item Schema (using recursive pattern)
const NavigationItemBase = Type.Object({
  id: Type.String({ description: 'Unique identifier for the navigation item' }),
  title: Type.String({ description: 'Display title of the navigation item' }),
  type: NavigationTypeEnum,
  icon: Type.Optional(Type.String({ description: 'Icon class or name' })),
  link: Type.Optional(Type.String({ description: 'URL or route path' })),
  target: Type.Optional(TargetEnum),
  disabled: Type.Optional(Type.Boolean({ default: false, description: 'Whether the item is disabled' })),
  hidden: Type.Optional(Type.Boolean({ default: false, description: 'Whether the item is hidden' })),
  badge: Type.Optional(NavigationBadgeSchema),
  permissions: Type.Optional(Type.Array(Type.String(), { description: 'Required permissions to view this item' })),
  meta: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: 'Additional metadata' }))
});

export type NavigationItemBase = Static<typeof NavigationItemBase>;

// Recursive Navigation Item
export interface NavigationItem extends NavigationItemBase {
  children?: NavigationItem[];
}

// Create schema that matches the interface
export const NavigationItemSchema: any = Type.Intersect([
  NavigationItemBase,
  Type.Object({
    children: Type.Optional(Type.Array(Type.Any()))
  })
]);

// Navigation Response Schema
export const NavigationDataSchema = Type.Object({
  default: Type.Optional(Type.Array(NavigationItemSchema, { description: 'Default navigation items' })),
  compact: Type.Optional(Type.Array(NavigationItemSchema, { description: 'Compact navigation items' })),
  horizontal: Type.Optional(Type.Array(NavigationItemSchema, { description: 'Horizontal navigation items' })),
  mobile: Type.Optional(Type.Array(NavigationItemSchema, { description: 'Mobile navigation items' }))
});

export const NavigationResponseSchema = ApiSuccessResponseSchema(NavigationDataSchema);

// Request Query Schemas
export const GetNavigationQuerySchema = Type.Object({
  type: Type.Optional(NavigationVariantEnum),
  includeDisabled: Type.Optional(Type.Boolean({ default: false, description: 'Include disabled items' }))
});

export const GetUserNavigationQuerySchema = Type.Object({
  type: Type.Optional(NavigationVariantEnum)
});

// TypeScript types
export type BadgeVariant = Static<typeof BadgeVariantEnum>;
export type NavigationType = Static<typeof NavigationTypeEnum>;
export type NavigationVariant = Static<typeof NavigationVariantEnum>;
export type Target = Static<typeof TargetEnum>;
export type NavigationBadge = Static<typeof NavigationBadgeSchema>;
export type NavigationData = Static<typeof NavigationDataSchema>;
export type NavigationResponse = Static<typeof NavigationResponseSchema>;
export type GetNavigationQuery = Static<typeof GetNavigationQuerySchema>;
export type GetUserNavigationQuery = Static<typeof GetUserNavigationQuerySchema>;

// Export schemas for registration
export const navigationSchemas = {
  // Main schemas
  'navigation-badge': NavigationBadgeSchema,
  'navigation-item': NavigationItemSchema,
  'navigation-data': NavigationDataSchema,
  'navigation-response': NavigationResponseSchema,
  
  // Query schemas
  'get-navigation-query': GetNavigationQuerySchema,
  'get-user-navigation-query': GetUserNavigationQuerySchema
};