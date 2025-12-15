/**
 * System Initialization Service
 * Business logic for import system API endpoints
 * Integrates with ImportDiscoveryService for auto-discovery functionality
 */

import { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import { ImportDiscoveryService, ImportContext } from '../../../platform/import';
import {
  ImportModule,
  ImportOrderItem,
  DashboardOverview,
  DomainStats,
  NextRecommended,
  ImportHistoryRecord,
  TemplateColumn,
  ValidateResponse,
  ValidationStats,
  ValidationMessage,
  ImportResponse,
  StatusResponse,
  ImportProgress,
  RollbackResponse,
  UserRef,
} from './system-init.schemas';

export class SystemInitService {
  private discovery: ImportDiscoveryService;

  constructor(
    private fastify: FastifyInstance,
    private db: Knex,
  ) {
    // Get the import discovery service from fastify decorators
    this.discovery = this.fastify.importDiscovery;

    if (!this.discovery) {
      throw new Error(
        'ImportDiscoveryService not available. Ensure import-discovery-plugin is registered before system-init routes.',
      );
    }
  }

  /**
   * Get list of all available import modules
   */
  async getAvailableModules(options?: {
    domain?: string;
    tag?: string;
    limit?: number;
  }): Promise<{
    modules: ImportModule[];
    totalModules: number;
    completedModules: number;
    pendingModules: number;
  }> {
    let services = this.discovery.getAllServices();

    // Filter by domain
    if (options?.domain) {
      services = services.filter((s) => s.metadata.domain === options.domain);
    }

    // Filter by tag
    if (options?.tag) {
      services = services.filter((s) => s.metadata.tags.includes(options.tag!));
    }

    // Apply limit
    if (options?.limit && options.limit > 0) {
      services = services.slice(0, options.limit);
    }

    // Convert to response format
    const modules: ImportModule[] = await Promise.all(
      services.map(async (service) => {
        // Get current status from database
        const record = await this.db('import_service_registry')
          .select('import_status', 'record_count', 'last_import_date')
          .where('module_name', service.metadata.module)
          .first();

        return {
          module: service.metadata.module,
          domain: service.metadata.domain,
          subdomain: service.metadata.subdomain,
          displayName: service.metadata.displayName,
          description: service.metadata.description,
          dependencies: service.metadata.dependencies,
          priority: service.metadata.priority,
          tags: service.metadata.tags,
          supportsRollback: service.metadata.supportsRollback,
          version: service.metadata.version,
          importStatus: record?.import_status || 'not_started',
          recordCount: record?.record_count || 0,
          lastImportDate: record?.last_import_date || undefined,
        };
      }),
    );

    // Calculate statistics
    const completedModules = modules.filter(
      (m) => m.importStatus === 'completed',
    ).length;
    const pendingModules = modules.filter(
      (m) => m.importStatus === 'not_started',
    ).length;

    return {
      modules,
      totalModules: modules.length,
      completedModules,
      pendingModules,
    };
  }

  /**
   * Get recommended import order with dependency reasons
   */
  async getImportOrder(includeDetails: boolean = false): Promise<{
    order: ImportOrderItem[];
  }> {
    const orderWithReasons = this.discovery.getImportOrderWithReasons();

    if (!includeDetails) {
      return {
        order: orderWithReasons.map((item) => ({
          module: item.module,
          reason: item.reason,
        })),
      };
    }

    // With details: include metadata
    const detailed = orderWithReasons.map((item) => {
      const service = this.discovery.getService(item.module);
      return {
        module: item.module,
        reason: item.reason,
        displayName: service?.getMetadata().displayName,
        dependencies: service?.getMetadata().dependencies,
      };
    });

    return {
      order: detailed as ImportOrderItem[],
    };
  }

  /**
   * Get template columns for a module
   */
  async getTemplateColumns(moduleName: string): Promise<TemplateColumn[]> {
    const service = this.discovery.getService(moduleName);

    if (!service) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    return service.getTemplateColumns();
  }

  /**
   * Generate template file for a module
   */
  async generateTemplate(
    moduleName: string,
    format: 'csv' | 'excel',
  ): Promise<Buffer> {
    const service = this.discovery.getService(moduleName);

    if (!service) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    return service.generateTemplate(format);
  }

  /**
   * Validate uploaded file for a module
   */
  async validateFile(
    moduleName: string,
    buffer: Buffer,
    fileName: string,
    fileType: 'csv' | 'excel',
    context: ImportContext,
  ): Promise<ValidateResponse['data']> {
    const service = this.discovery.getService(moduleName);

    if (!service) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    // Delegate to service validation with context
    const result = await service.validateFile(
      buffer,
      fileName,
      fileType,
      context,
    );

    return {
      sessionId: result.sessionId,
      isValid: result.isValid,
      errors: result.errors as ValidationMessage[],
      warnings: result.warnings as ValidationMessage[],
      stats: result.stats as ValidationStats,
      expiresAt: (result.expiresAt || new Date()).toISOString(),
      canProceed: result.canProceed,
    };
  }

  /**
   * Execute import for validated session
   */
  async executeImport(
    moduleName: string,
    sessionId: string,
    options?: {
      skipWarnings?: boolean;
      batchSize?: number;
      onConflict?: 'skip' | 'update' | 'error';
    },
    context?: ImportContext,
  ): Promise<ImportResponse['data']> {
    const service = this.discovery.getService(moduleName);

    if (!service) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    if (!context) {
      throw new Error('User context is required for import execution');
    }

    // Delegate to service with context
    const result = await service.importData(sessionId, options || {}, context);

    return {
      jobId: result.jobId,
      status: result.status,
      message: `Import job created for module '${moduleName}'`,
    };
  }

  /**
   * Get import job status
   */
  async getImportStatus(
    moduleName: string,
    jobId: string,
  ): Promise<StatusResponse['data']> {
    const service = this.discovery.getService(moduleName);

    if (!service) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    // Delegate to service
    const status = await service.getImportStatus(jobId);

    // Convert to response format
    return {
      jobId: status.jobId,
      status: status.status,
      progress: status.progress
        ? (status.progress as ImportProgress)
        : undefined,
      startedAt: status.startedAt?.toISOString(),
      completedAt: undefined,
      estimatedCompletion: status.estimatedCompletion?.toISOString(),
      error: status.error,
    };
  }

  /**
   * Rollback completed import job
   */
  async rollbackImport(
    moduleName: string,
    jobId: string,
    context?: ImportContext,
  ): Promise<RollbackResponse['data']> {
    const service = this.discovery.getService(moduleName);

    if (!service) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    if (!context) {
      throw new Error('User context is required for rollback');
    }

    // Check if rollback is supported
    const metadata = service.getMetadata();
    if (!metadata.supportsRollback) {
      throw new Error(`Module '${moduleName}' does not support rollback`);
    }

    // Check if job can be rolled back
    const canRollback = await service.canRollback(jobId);
    if (!canRollback) {
      throw new Error(`Job '${jobId}' cannot be rolled back`);
    }

    // Execute rollback with context
    await service.rollback(jobId, context);

    // Get job details for response
    const status = await service.getImportStatus(jobId);
    const deletedRecords = status.progress?.importedRows || 0;

    return {
      jobId,
      message: `Import job '${jobId}' rolled back successfully`,
      deletedRecords,
    };
  }

  /**
   * Get centralized dashboard data
   */
  async getDashboardData(options?: {
    includeHistory?: boolean;
    historyLimit?: number;
  }): Promise<{
    overview: DashboardOverview;
    modulesByDomain: Record<string, DomainStats>;
    recentImports: ImportHistoryRecord[];
    nextRecommended: NextRecommended[];
  }> {
    // Get all modules
    const { modules } = await this.getAvailableModules();

    // Calculate overview
    const overview: DashboardOverview = {
      totalModules: modules.length,
      completedModules: modules.filter((m) => m.importStatus === 'completed')
        .length,
      inProgressModules: modules.filter((m) => m.importStatus === 'in_progress')
        .length,
      pendingModules: modules.filter((m) => m.importStatus === 'not_started')
        .length,
      totalRecordsImported: modules.reduce((sum, m) => sum + m.recordCount, 0),
    };

    // Group by domain
    const modulesByDomain: Record<string, DomainStats> = {};
    for (const module of modules) {
      if (!modulesByDomain[module.domain]) {
        modulesByDomain[module.domain] = { total: 0, completed: 0 };
      }
      modulesByDomain[module.domain].total++;
      if (module.importStatus === 'completed') {
        modulesByDomain[module.domain].completed++;
      }
    }

    // Get recent imports if requested
    let recentImports: ImportHistoryRecord[] = [];
    if (options?.includeHistory !== false) {
      const limit = options?.historyLimit || 10;
      const records = await this.db('import_history')
        .select(
          'job_id',
          'module_name',
          'status',
          'imported_rows as recordsImported',
          'completed_at',
          'imported_by',
        )
        .where('status', 'completed')
        .orderBy('completed_at', 'desc')
        .limit(limit);

      recentImports = await Promise.all(
        records.map(async (record) => {
          // Get user info
          const user = await this.db('users')
            .select('id', 'name')
            .where('id', record.imported_by)
            .first();

          return {
            jobId: record.job_id,
            module: record.module_name,
            status: record.status,
            recordsImported: record.recordsImported || 0,
            completedAt: record.completed_at,
            importedBy: {
              id: record.imported_by,
              name: user?.name || 'Unknown',
            } as UserRef,
          };
        }),
      );
    }

    // Get next recommended modules
    const importOrder = this.discovery.getImportOrderWithReasons();
    const nextRecommended: NextRecommended[] = [];

    for (const item of importOrder) {
      const module = modules.find((m) => m.module === item.module);
      if (module && module.importStatus === 'not_started') {
        // Check if all dependencies are completed
        const depsCompleted = module.dependencies.every((dep) =>
          modules.some(
            (m) => m.module === dep && m.importStatus === 'completed',
          ),
        );

        if (depsCompleted) {
          nextRecommended.push({
            module: item.module,
            reason: item.reason,
          });

          // Limit to 5 recommendations
          if (nextRecommended.length >= 5) {
            break;
          }
        }
      }
    }

    return {
      overview,
      modulesByDomain,
      recentImports,
      nextRecommended,
    };
  }

  /**
   * Check health status of discovery service
   */
  async getHealthStatus(): Promise<{
    isHealthy: boolean;
    validationErrors: string[];
    circularDependencies: Array<{ path: string[] }>;
  }> {
    return {
      isHealthy: this.discovery.isHealthy(),
      validationErrors: this.discovery.getValidationErrors(),
      circularDependencies: this.discovery
        .getCircularDependencies()
        .map((cd) => ({
          path: cd.path,
        })),
    };
  }
}
