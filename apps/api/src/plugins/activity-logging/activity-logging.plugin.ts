import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { UserActivityService } from '../../core/user-profile/user-activity.service';
import { UserActivityRepository } from '../../core/user-profile/user-activity.repository';
import { ActivityMiddleware } from './activity-middleware';
import { ActivityLogPluginConfig, defaultPluginConfig, ActivityLogConfig } from './activity-config';
import { ActivityUtils } from './activity-utils';

/**
 * Activity logging plugin options
 */
export interface ActivityLoggingPluginOptions extends FastifyPluginOptions {
  config?: Partial<ActivityLogPluginConfig>;
}

/**
 * Main activity logging plugin
 */
async function activityLoggingPlugin(
  fastify: FastifyInstance,
  options: ActivityLoggingPluginOptions
) {
  // Merge configuration with defaults
  const config: ActivityLogPluginConfig = {
    ...defaultPluginConfig,
    ...options.config,
    defaultConfig: {
      ...defaultPluginConfig.defaultConfig,
      ...options.config?.defaultConfig,
    },
  };

  // Skip plugin registration if disabled
  if (!config.enabled) {
    fastify.log.info('Activity logging plugin is disabled');
    return;
  }

  // Initialize UserActivityService after dependencies are available
  let userActivityService: UserActivityService | undefined;
  let middleware: ActivityMiddleware | undefined;
  
  fastify.addHook('onReady', async function() {
    if (!fastify.knex) {
      throw new Error('Activity logging plugin requires knex plugin to be registered first');
    }
    
    const userActivityRepository = new UserActivityRepository(fastify.knex);
    userActivityService = new UserActivityService(userActivityRepository);
    
    // Initialize middleware after service is ready
    middleware = new ActivityMiddleware(fastify, userActivityService, config);
    
    fastify.log.info('Activity logging service initialized');
  });

  // Register global hooks for activity logging
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Wait for service to be initialized
    if (!userActivityService) {
      return;
    }
    
    await middleware.preHandler(request, reply);
  });

  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!userActivityService) {
      return;
    }
    
    await middleware.onResponse(request, reply);
  });

  fastify.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
    if (!userActivityService) {
      return;
    }
    
    await middleware.onError(request, reply, error);
  });

  // Decorate fastify instance with activity logging utilities
  fastify.decorate('activityUtils', ActivityUtils);
  
  // Decorate with configuration
  fastify.decorate('activityLoggingConfig', config);
  
  // Decorate with middleware instance for manual operations
  fastify.decorate('activityMiddleware', middleware);

  // Add helper methods to fastify instance
  fastify.decorate('logActivity', async function(
    userId: string,
    action: string,
    description: string,
    request?: FastifyRequest,
    options?: {
      severity?: 'info' | 'warning' | 'error' | 'critical';
      metadata?: Record<string, any>;
    }
  ) {
    if (!userActivityService) {
      fastify.log.warn('User activity service not initialized, skipping manual activity log');
      return;
    }
    
    return userActivityService.logActivity(userId, action as any, description, request, options);
  });

  // Add route-specific activity logging helper
  fastify.decorate('withActivityLogging', function(
    routeConfig: ActivityLogConfig,
    routeHandler: any
  ) {
    return {
      ...routeHandler,
      schema: {
        ...routeHandler.schema,
        activityLog: routeConfig,
      },
    };
  });

  // Add method to flush batch queue manually
  fastify.decorate('flushActivityLogs', async function() {
    if (middleware) {
      await middleware.flushBatch();
    }
  });

  // Graceful shutdown - flush remaining logs
  fastify.addHook('onClose', async function() {
    fastify.log.info('Flushing remaining activity logs before shutdown...');
    if (middleware) {
      await middleware.flushBatch();
    }
  });

  // Add schema for route options extension
  if (fastify.addSchema) {
    fastify.addSchema({
      $id: 'activityLogConfig',
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        action: { type: 'string' },
        description: { type: 'string' },
        severity: { 
          type: 'string',
          enum: ['info', 'warning', 'error', 'critical']
        },
        skipSuccessfulGets: { type: 'boolean' },
        includeRequestData: { type: 'boolean' },
        includeResponseData: { type: 'boolean' },
        async: { type: 'boolean' },
      },
    });
  }

  fastify.log.info('Activity logging plugin registered successfully');
}

// Export as fastify plugin
export default fp(activityLoggingPlugin, {
  name: 'activity-logging-plugin',
  dependencies: ['knex-plugin'], // Require knex to be loaded first
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    activityUtils: typeof ActivityUtils;
    activityLoggingConfig: ActivityLogPluginConfig;
    activityMiddleware: ActivityMiddleware;
    
    logActivity(
      userId: string,
      action: string,
      description: string,
      request?: FastifyRequest,
      options?: {
        severity?: 'info' | 'warning' | 'error' | 'critical';
        metadata?: Record<string, any>;
      }
    ): Promise<any>;
    
    withActivityLogging(
      routeConfig: ActivityLogConfig,
      routeHandler: any
    ): any;
    
    flushActivityLogs(): Promise<void>;
  }
  
  interface FastifySchema {
    activityLog?: ActivityLogConfig;
  }
  
  interface RouteOptions {
    activityLog?: ActivityLogConfig;
  }
}

// Re-export types and utilities for convenience
export { ActivityLogConfig, ActivityLogPluginConfig } from './activity-config';
export { ActivityUtils } from './activity-utils';
export { ActivityMiddleware } from './activity-middleware';