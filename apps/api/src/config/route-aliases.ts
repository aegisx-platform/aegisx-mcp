/**
 * Route Aliasing Plugin
 *
 * Provides backward compatibility during API architecture migration by redirecting
 * old routes to new layer-based routes using HTTP 307 (Temporary Redirect).
 *
 * HTTP 307 is used because it:
 * - Preserves the original HTTP method (GET, POST, PUT, DELETE, etc.)
 * - Preserves the request body (critical for POST/PUT/PATCH requests)
 * - Indicates the redirect is temporary (not permanent/SEO-affecting)
 *
 * Usage Metrics:
 * - Tracks which old routes are still being used
 * - Helps identify clients that need migration assistance
 * - Provides data for deprecation timeline decisions
 */

import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export interface RouteAliasConfig {
  enableAliasing: boolean;
  aliasMap: Record<string, string>; // old path -> new path
}

/**
 * Default alias mapping from old routes to new layer-based routes
 *
 * Layer structure:
 * - Core: /api/v1/core/{resource} - Infrastructure (auth, monitoring, audit)
 * - Platform: /api/v1/platform/{resource} - Shared services (users, rbac, files)
 * - Domains: /api/v1/domains/{domain} - Business logic (inventory, admin)
 */
const DEFAULT_ALIAS_MAP: Record<string, string> = {
  // Core Layer - Infrastructure
  '/api/auth': '/api/v1/core/auth',
  '/api/monitoring': '/api/v1/core/monitoring',
  '/api/error-logs': '/api/v1/core/error-logs',
  '/api/login-attempts': '/api/v1/core/login-attempts',
  '/api/file-audit': '/api/v1/core/file-audit',

  // Platform Layer - Shared Services
  '/api/users': '/api/v1/platform/users',
  '/api/rbac': '/api/v1/platform/rbac',
  '/api/departments': '/api/v1/platform/departments',
  '/api/settings': '/api/v1/platform/settings',
  '/api/navigation': '/api/v1/platform/navigation',
  '/api/user-profile': '/api/v1/platform/user-profile',
  '/api/file-upload': '/api/v1/platform/file-upload',
  '/api/attachments': '/api/v1/platform/attachments',
  '/api/pdf-export': '/api/v1/platform/pdf-export',
  '/api/api-keys': '/api/v1/platform/api-keys',
  '/api/import': '/api/v1/platform/import',

  // Domains Layer - Business Domains
  '/api/inventory': '/api/v1/domains/inventory',
  '/api/admin': '/api/v1/domains/admin',
  '/api/testProducts': '/api/v1/domains/testProducts',
  '/api/user-departments': '/api/v1/domains/user-departments',
};

/**
 * Route Aliasing Plugin
 *
 * Registers wildcard routes that redirect old API paths to new layer-based paths.
 * Uses HTTP 307 to preserve the original request method and body.
 */
export const routeAliasPlugin = fp(
  async function routeAliasPlugin(
    fastify: FastifyInstance,
    opts: FastifyPluginOptions,
  ) {
    // Get feature flags from config
    // Skip aliasing if new routes are not enabled
    const enableNewRoutes =
      process.env.ENABLE_NEW_ROUTES === 'true' ||
      (fastify as any).config?.features?.enableNewRoutes === true;

    if (!enableNewRoutes) {
      fastify.log.info(
        'Route aliasing plugin: New routes not enabled, skipping alias registration',
      );
      return;
    }

    const aliasMap = DEFAULT_ALIAS_MAP;
    const aliasCount = Object.keys(aliasMap).length;

    fastify.log.info(
      `Route aliasing plugin: Registering ${aliasCount} route aliases for backward compatibility`,
    );

    // Register redirect handlers for each alias mapping
    // Using fastify.all() to catch all HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
    for (const [oldPath, newPath] of Object.entries(aliasMap)) {
      // Register wildcard route to catch all sub-paths
      // Example: /api/users/* catches /api/users, /api/users/123, /api/users/123/profile, etc.
      const wildcardPath = `${oldPath}/*`;

      fastify.all(wildcardPath, async (request, reply) => {
        // Replace old path prefix with new path prefix, preserving the rest of the URL
        // Example: /api/users/123/profile -> /api/v1/platform/users/123/profile
        const targetPath = request.url.replace(oldPath, newPath);

        // Log redirect for metrics tracking
        // This helps identify which clients are still using old routes
        fastify.log.debug({
          event: 'route_alias_redirect',
          oldUrl: request.url,
          newUrl: targetPath,
          method: request.method,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        });

        // Track metrics if monitoring service is available
        // This provides quantitative data for deprecation decisions
        if ((fastify as any).errorQueue) {
          try {
            // Use error queue service as a lightweight metrics tracker
            // (We don't have a dedicated metrics service yet)
            // In production, this could use Prometheus, DataDog, etc.
            const metricsData = {
              type: 'route_alias_usage',
              oldPath,
              newPath,
              method: request.method,
              timestamp: new Date().toISOString(),
            };

            // Log to error queue as info-level event (not actually an error)
            // This ensures metrics are captured without causing alarm
            fastify.log.trace({ metrics: metricsData }, 'Route alias metrics');
          } catch (error) {
            // Silently fail - metrics tracking should never break redirects
            fastify.log.warn(
              { error },
              'Failed to track route alias metrics (non-critical)',
            );
          }
        }

        // HTTP 307: Temporary Redirect
        // - Preserves HTTP method (POST stays POST, etc.)
        // - Preserves request body (critical for mutations)
        // - Indicates temporary nature (not cached by browsers/proxies)
        //
        // Note: The client must re-send the request to the new location
        // Most HTTP clients handle this automatically
        return reply.code(307).redirect(targetPath);
      });

      // Also register exact path match (without wildcard)
      // This catches requests to /api/users (no trailing slash)
      fastify.all(oldPath, async (request, reply) => {
        const targetPath = newPath;

        fastify.log.debug({
          event: 'route_alias_redirect',
          oldUrl: request.url,
          newUrl: targetPath,
          method: request.method,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        });

        if ((fastify as any).errorQueue) {
          try {
            const metricsData = {
              type: 'route_alias_usage',
              oldPath,
              newPath,
              method: request.method,
              timestamp: new Date().toISOString(),
            };
            fastify.log.trace({ metrics: metricsData }, 'Route alias metrics');
          } catch (error) {
            fastify.log.warn(
              { error },
              'Failed to track route alias metrics (non-critical)',
            );
          }
        }

        return reply.code(307).redirect(targetPath);
      });
    }

    fastify.log.info(
      `Route aliasing plugin: Successfully registered ${aliasCount} route aliases`,
    );
  },
  {
    name: 'route-alias-plugin',
    // Dependencies: Must load after logging plugin (for fastify.log)
    // Must load before feature routes (so aliases don't shadow new routes)
    dependencies: ['logging-plugin'],
  },
);

/**
 * Route Alias Metrics Interface
 *
 * Defines the structure for tracking route alias usage metrics.
 * This helps answer questions like:
 * - Which old routes are still being used?
 * - How many requests are being redirected?
 * - Which clients haven't migrated yet?
 * - When is it safe to deprecate old routes?
 */
export interface RouteAliasMetrics {
  route: string; // Old route that was aliased
  targetRoute: string; // New route redirected to
  hitCount: number; // Number of times this alias was used
  uniqueClients: number; // Distinct client IDs (IP or User-Agent)
  firstSeen: Date; // First usage timestamp
  lastSeen: Date; // Last usage timestamp
  methods: Record<string, number>; // HTTP method breakdown (GET: 100, POST: 50, etc.)
}

/**
 * Export default for convenience
 */
export default routeAliasPlugin;
