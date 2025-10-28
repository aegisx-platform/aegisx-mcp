import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { UserActivityService } from '../../core/user-profile/user-activity.service';
import { 
  ActivityLogConfig, 
  ActivityLogPluginConfig,
  getActionForRequest,
  getSeverityFromStatus,
  generateDescription
} from './activity-config';

/**
 * Batch activity log entry for bulk processing
 */
interface BatchActivityEntry {
  userId: string;
  action: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  request: FastifyRequest;
  metadata?: Record<string, any>;
}

/**
 * Activity logging middleware class
 */
export class ActivityMiddleware {
  private batchQueue: BatchActivityEntry[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(
    private fastify: FastifyInstance,
    private userActivityService: UserActivityService,
    private pluginConfig: ActivityLogPluginConfig
  ) {
    // Set up batch processing if enabled
    if (pluginConfig.enableBatching) {
      this.initializeBatchProcessing();
    }
  }

  /**
   * Pre-handler hook to set up activity logging context
   */
  async preHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Attach activity logging context to request
    (request as any).activityContext = {
      startTime: Date.now(),
      shouldLog: false,
      config: null,
    };

    // Check if route has activity logging configured
    const routeConfig = this.getRouteConfig(request);
    if (!routeConfig?.enabled || !this.pluginConfig.enabled) {
      return;
    }

    // Check if user is authenticated (required for activity logging)
    const userId = this.getUserId(request);
    if (!userId) {
      return;
    }

    // Store configuration and mark for logging
    (request as any).activityContext.shouldLog = true;
    (request as any).activityContext.config = routeConfig;
    (request as any).activityContext.userId = userId;
  }

  /**
   * Response hook to log the activity
   */
  async onResponse(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const context = (request as any).activityContext;
    
    // Skip if not marked for logging
    if (!context?.shouldLog) {
      return;
    }

    const config = context.config as ActivityLogConfig;
    const userId = context.userId as string;

    try {
      // Check custom condition if provided
      if (config.shouldLog && !config.shouldLog(request, reply)) {
        return;
      }

      // Skip successful GET requests if configured
      if (config.skipSuccessfulGets && 
          request.method === 'GET' && 
          reply.statusCode < 300) {
        return;
      }

      // Check minimum severity level
      const severity = config.severity || getSeverityFromStatus(reply.statusCode);
      if (!this.shouldLogSeverity(severity)) {
        return;
      }

      await this.logActivity(request, reply, userId, config);
    } catch (error: any) {
      // Never let activity logging break the main request
      this.fastify.log.error({ error }, 'Activity logging failed');
    }
  }

  /**
   * Error hook to log API errors
   */
  async onError(request: FastifyRequest, reply: FastifyReply, error: Error): Promise<void> {
    if (!this.pluginConfig.autoLogErrors || !this.pluginConfig.enabled) {
      return;
    }

    const userId = this.getUserId(request);
    if (!userId) {
      return;
    }

    try {
      await this.userActivityService.logApiError(userId, error, request);
    } catch (logError: any) {
      this.fastify.log.error({ error: logError }, 'Error logging API error');
    }
  }

  /**
   * Log activity for a request
   */
  private async logActivity(
    request: FastifyRequest,
    reply: FastifyReply,
    userId: string,
    config: ActivityLogConfig
  ): Promise<void> {
    // Determine action
    const action = config.action || getActionForRequest(request.method, request.url);
    
    // Determine severity
    const severity = config.severity || getSeverityFromStatus(reply.statusCode);
    
    // Generate description
    const description = generateDescription(
      config.description,
      request.method,
      request.url,
      reply.statusCode,
      request.headers['user-agent'] as string
    );

    // Build metadata
    const metadata = await this.buildMetadata(request, reply, config);

    const activityData = {
      userId,
      action,
      description,
      severity,
      request,
      metadata,
    };

    // Log activity (async or sync based on config)
    if (config.async !== false && !this.pluginConfig.enableBatching) {
      // Async logging - don't wait
      this.userActivityService.logActivity(
        userId,
        action as any,
        description,
        request,
        { severity, metadata }
      ).catch((error: any) => {
        this.fastify.log.error({ error }, 'Async activity logging failed');
      });
    } else if (this.pluginConfig.enableBatching) {
      // Add to batch queue
      this.addToBatch(activityData);
    } else {
      // Synchronous logging
      await this.userActivityService.logActivity(
        userId,
        action as any,
        description,
        request,
        { severity, metadata }
      );
    }
  }

  /**
   * Build metadata object for activity log
   */
  private async buildMetadata(
    request: FastifyRequest,
    reply: FastifyReply,
    config: ActivityLogConfig
  ): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {
      ...config.metadata,
      method: request.method,
      url: request.url,
      status_code: reply.statusCode,
      response_time: Date.now() - (request as any).activityContext.startTime,
    };

    // Add request data if configured
    if (config.includeRequestData) {
      const requestData = this.sanitizeData({
        query: request.query,
        params: request.params,
        body: request.body,
      });
      
      if (this.getDataSize(requestData) <= (this.pluginConfig.maxDataSize || 10240)) {
        metadata.request_data = requestData;
      }
    }

    // Add response data if configured
    // Note: Response data capture is not implemented yet as Fastify doesn't expose reply.payload
    // This would require implementing a custom serializer or response interceptor
    if (config.includeResponseData) {
      // TODO: Implement response data capture
      metadata.response_data_captured = false;
    }

    return metadata;
  }

  /**
   * Get route configuration for activity logging
   */
  private getRouteConfig(request: FastifyRequest): ActivityLogConfig | null {
    // Check if route has activity logging configuration
    const routeSchema = (request as any).routeSchema || (request as any).routeOptions?.schema;
    if (routeSchema?.activityLog) {
      return {
        ...this.pluginConfig.defaultConfig,
        ...routeSchema.activityLog,
      };
    }

    // Check route options
    const routeOptions = (request as any).routeOptions;
    if (routeOptions?.activityLog) {
      return {
        ...this.pluginConfig.defaultConfig,
        ...routeOptions.activityLog,
      };
    }

    return null;
  }

  /**
   * Extract user ID from request
   */
  private getUserId(request: FastifyRequest): string | null {
    // Check JWT user
    const user = (request as any).user;
    if (user?.id || user?.userId) {
      return user.id || user.userId;
    }

    // Check session or other authentication methods
    const session = (request as any).session;
    if (session?.userId) {
      return session.userId;
    }

    return null;
  }

  /**
   * Check if severity should be logged based on minimum level
   */
  private shouldLogSeverity(severity: string): boolean {
    const levels = { info: 0, warning: 1, error: 2, critical: 3 };
    const minLevel = levels[this.pluginConfig.minSeverity || 'info'];
    const currentLevel = levels[severity as keyof typeof levels] || 0;
    return currentLevel >= minLevel;
  }

  /**
   * Sanitize data by removing sensitive fields
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    const excludeFields = this.pluginConfig.excludeFields || [];

    for (const field of excludeFields) {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Deep sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      }
    }

    return sanitized;
  }

  /**
   * Get approximate size of data in bytes
   */
  private getDataSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * Add activity to batch queue
   */
  private addToBatch(activity: BatchActivityEntry): void {
    this.batchQueue.push(activity);

    // Process batch if it reaches the configured size
    if (this.batchQueue.length >= (this.pluginConfig.batchSize || 10)) {
      this.processBatch();
    }
  }

  /**
   * Initialize batch processing timer
   */
  private initializeBatchProcessing(): void {
    const interval = this.pluginConfig.batchInterval || 5000;
    
    this.batchTimer = setInterval(() => {
      if (this.batchQueue.length > 0) {
        this.processBatch();
      }
    }, interval);

    // Clean up on process exit
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  /**
   * Process batch of activity logs
   */
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) {
      return;
    }

    const batch = this.batchQueue.splice(0);
    
    try {
      // Process activities in parallel but limit concurrency
      const promises = batch.map(activity => 
        this.userActivityService.logActivity(
          activity.userId,
          activity.action as any,
          activity.description,
          activity.request,
          { severity: activity.severity, metadata: activity.metadata }
        )
      );

      await Promise.all(promises);
    } catch (error: any) {
      this.fastify.log.error({ error }, 'Batch activity logging failed');
    }
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // Process remaining batch before shutdown
    if (this.batchQueue.length > 0) {
      this.processBatch().catch((error: any) => {
        this.fastify.log.error({ error }, 'Final batch processing failed');
      });
    }
  }

  /**
   * Manual flush of batch queue (useful for testing or graceful shutdown)
   */
  async flushBatch(): Promise<void> {
    await this.processBatch();
  }
}