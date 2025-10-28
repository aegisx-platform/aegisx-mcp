/**
 * Navigation Module - AegisX Platform
 * 
 * This module provides a complete navigation system for the AegisX platform.
 * It includes hierarchical navigation structure, permission-based filtering,
 * caching for performance, and support for multiple navigation types.
 * 
 * Features:
 * - Hierarchical navigation structure with parent-child relationships
 * - Permission-based filtering to show only accessible items
 * - Support for multiple navigation types (default, compact, horizontal, mobile)
 * - User-specific navigation preferences and customization
 * - Caching for improved performance
 * - RESTful API endpoints matching OpenAPI specification
 * 
 * Usage:
 * ```typescript
 * // Register the navigation plugin
 * await fastify.register(navigationPlugin);
 * 
 * // Use the service
 * const navigation = await fastify.navigationService.getNavigation();
 * const userNavigation = await fastify.navigationService.getUserNavigation(userId);
 * ```
 */

// Main plugin export
export { default as navigationPlugin } from './navigation.plugin';

// Core classes
export { NavigationService } from './services/navigation.service';
export { NavigationRepository } from './navigation.repository';
export { NavigationController, createNavigationController } from './navigation.controller';

// Types and interfaces
export * from './navigation.types';

// Schemas and validation
export {
  // Schemas
  BadgeVariantEnum,
  NavigationTypeEnum,
  NavigationVariantEnum,
  TargetEnum,
  NavigationBadgeSchema,
  NavigationItemSchema,
  NavigationDataSchema,
  NavigationResponseSchema,
  GetNavigationQuerySchema,
  GetUserNavigationQuerySchema,
  navigationSchemas,
  // Types
  type BadgeVariant,
  type NavigationType,
  type NavigationVariant,
  type Target,
  type NavigationBadge,
  type NavigationItem,
  type NavigationData,
  type NavigationResponse,
  type GetNavigationQuery,
  type GetUserNavigationQuery
} from './navigation.schemas';

// Routes
export { default as navigationRoutes } from './navigation.routes';

// Version and metadata
export const NAVIGATION_MODULE_VERSION = '1.0.0';
export const NAVIGATION_MODULE_NAME = 'navigation';

/**
 * Navigation module configuration options
 */
export interface NavigationModuleConfig {
  /** Enable caching for navigation data */
  cacheEnabled?: boolean;
  /** Cache TTL in seconds */
  cacheTTL?: number;
  /** Enable detailed logging */
  verbose?: boolean;
}

/**
 * Default configuration for navigation module
 */
export const DEFAULT_NAVIGATION_CONFIG: NavigationModuleConfig = {
  cacheEnabled: true,
  cacheTTL: 300, // 5 minutes
  verbose: false
};