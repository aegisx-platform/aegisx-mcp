/**
 * Import Discovery Service
 * Auto-discovers import services using file scanning and decorator registration
 * Builds dependency graph, validates dependencies, and persists registry to database
 * Performance requirement: Sub-100ms discovery for 30+ modules
 */

import * as fs from 'fs';
import * as path from 'path';
import { Knex } from 'knex';
import { FastifyInstance } from 'fastify';

import {
  ImportServiceMetadata,
  RegisteredImportService,
  IImportService,
} from '../types/import-service.types';
import {
  getImportServiceRegistry,
  getRegisteredImportServices,
} from '../registry/import-service-registry';

/**
 * Dependency graph: Map of module name -> Set of dependent modules
 */
interface DependencyGraph {
  [moduleName: string]: Set<string>;
}

/**
 * Circular dependency error details
 */
interface CircularDependencyError {
  path: string[];
  detected: boolean;
}

/**
 * Discovery result summary
 */
interface DiscoveryResult {
  totalServices: number;
  discoveredServices: string[];
  dependencies: DependencyGraph;
  importOrder: string[];
  circularDependencies: CircularDependencyError[];
  validationErrors: string[];
}

/**
 * Import Discovery Service
 *
 * Responsible for:
 * 1. Scanning for *-import.service.ts files using directory traversal
 * 2. Dynamic import to trigger decorator registration
 * 3. Building dependency graph
 * 4. Topological sorting for import order
 * 5. Validating dependencies (circular, missing)
 * 6. Persisting registry to database
 */
export class ImportDiscoveryService {
  private registry: Map<string, RegisteredImportService> = new Map();
  private dependencyGraph: DependencyGraph = {};
  private circularDependencies: CircularDependencyError[] = [];
  private validationErrors: string[] = [];

  constructor(
    private fastify: FastifyInstance,
    private db: Knex,
    private logger = console,
  ) {}

  /**
   * Start discovery process
   * Main entry point for discovering all import services
   */
  async discoverServices(): Promise<DiscoveryResult> {
    const startTime = Date.now();
    this.logger.log('[ImportDiscovery] Starting service discovery...');

    try {
      // Step 1: Scan for import service files
      const filePaths = this.scanForImportServices();
      this.logger.log(
        `[ImportDiscovery] Found ${filePaths.length} import service files`,
      );

      // Step 2: Dynamic import to trigger decorator registration
      await this.dynamicImportServices(filePaths);

      // Step 3: Collect registered metadata
      const registeredServices = getRegisteredImportServices();
      this.logger.log(
        `[ImportDiscovery] Registered ${registeredServices.length} services`,
      );

      // Step 4: Build registry with service instances
      this.buildRegistry(registeredServices);

      // Step 5: Build dependency graph
      this.buildDependencyGraph();

      // Step 6: Validate dependencies
      this.validateDependencies();

      // Step 7: Calculate import order
      const importOrder = this.topologicalSort();

      // Step 8: Persist registry to database
      await this.persistRegistry();

      const duration = Date.now() - startTime;
      this.logger.log(`[ImportDiscovery] Discovery completed in ${duration}ms`);

      // Verify performance requirement
      if (duration > 100) {
        this.logger.warn(
          `[ImportDiscovery] PERFORMANCE: Discovery took ${duration}ms (target: <100ms)`,
        );
      }

      return {
        totalServices: this.registry.size,
        discoveredServices: Array.from(this.registry.keys()),
        dependencies: this.dependencyGraph,
        importOrder,
        circularDependencies: this.circularDependencies,
        validationErrors: this.validationErrors,
      };
    } catch (error) {
      this.logger.error('[ImportDiscovery] Discovery failed:', error);
      throw error;
    }
  }

  /**
   * Scan for *-import.service.ts files using directory traversal
   * Searches from project root following naming convention
   */
  private scanForImportServices(): string[] {
    const files: string[] = [];
    // Scan both modules and core directories for import services
    const basePaths = [
      path.join(process.cwd(), 'apps/api/src/modules'),
      path.join(process.cwd(), 'apps/api/src/core'),
    ];

    try {
      // Scan each base path for import service files
      for (const basePath of basePaths) {
        if (fs.existsSync(basePath)) {
          this.scanDirectory(basePath, files);
        }
      }

      // Filter and normalize paths
      return files
        .filter(
          (file) =>
            file.endsWith('-import.service.ts') ||
            file.endsWith('-import.service.js'),
        )
        .filter(
          (file) =>
            !file.includes('node_modules') &&
            !file.includes('.spec.') &&
            !file.includes('.test.'),
        )
        .map((file) => path.relative(process.cwd(), file));
    } catch (error) {
      this.logger.error('[ImportDiscovery] Directory scan failed:', error);
      throw new Error(`Failed to scan for import services: ${error}`);
    }
  }

  /**
   * Recursively scan directory for import service files
   */
  private scanDirectory(dirPath: string, results: string[]): void {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        // Skip hidden directories and known exclusions
        if (entry.name.startsWith('.')) {
          continue;
        }

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          this.scanDirectory(fullPath, results);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith('-import.service.ts') ||
            entry.name.endsWith('-import.service.js'))
        ) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      this.logger.warn(
        `[ImportDiscovery] Failed to scan directory ${dirPath}:`,
        error,
      );
    }
  }

  /**
   * Dynamically import service files to trigger decorator registration
   * Uses require() to load compiled JS files from dist/
   */
  private async dynamicImportServices(filePaths: string[]): Promise<void> {
    const importPromises = filePaths.map(async (filePath) => {
      try {
        // Compute the correct dist path
        // Source: apps/api/src/core/departments/departments-import.service.ts
        // Dist:   dist/apps/api/apps/api/src/core/departments/departments-import.service.js
        const distPath = this.getDistPath(filePath);

        if (!distPath) {
          this.logger.warn(
            `[ImportDiscovery] Could not find compiled file for ${filePath}`,
          );
          return;
        }

        // Dynamic import to trigger decorators
        try {
          require(distPath);
        } catch (requireError) {
          this.logger.warn(
            `[ImportDiscovery] Failed to import ${filePath}:`,
            requireError,
          );
        }
      } catch (error) {
        this.logger.warn(
          `[ImportDiscovery] Failed to import ${filePath}:`,
          error,
        );
      }
    });

    await Promise.all(importPromises);
  }

  /**
   * Get the compiled dist path for a source file
   * Maps: apps/api/src/... → dist/apps/api/apps/api/src/...
   */
  private getDistPath(srcFilePath: string): string | null {
    const projectRoot = process.cwd();

    // Convert .ts to .js
    const jsFilePath = srcFilePath.replace(/\.ts$/, '.js');

    // The NX build output structure: dist/apps/api/{relative-path}
    const distPath = path.join(projectRoot, 'dist/apps/api', jsFilePath);

    if (fs.existsSync(distPath)) {
      return distPath;
    }

    // Fallback: try without the apps/api prefix in dist
    const altDistPath = path.join(
      projectRoot,
      'dist/apps/api',
      jsFilePath.replace(/^apps\/api\//, ''),
    );

    if (fs.existsSync(altDistPath)) {
      return altDistPath;
    }

    return null;
  }

  /**
   * Build registry with instantiated service instances
   */
  private buildRegistry(registeredMetadata: ImportServiceMetadata[]): void {
    for (const metadata of registeredMetadata) {
      try {
        // Get service class from metadata
        const ServiceClass = metadata.target;
        if (!ServiceClass) {
          this.logger.warn(
            `[ImportDiscovery] No target class found for ${metadata.module}`,
          );
          continue;
        }

        // Instantiate service with DI
        let instance: IImportService;
        try {
          // Try to inject fastify and knex
          instance = new ServiceClass(this.db, this.fastify);
        } catch {
          // Fallback: try without fastify
          instance = new ServiceClass(this.db);
        }

        // Add to registry
        this.registry.set(metadata.module, {
          metadata,
          instance,
          filePath: metadata.filePath || '',
        });

        this.logger.log(
          `[ImportDiscovery] Registered: ${metadata.module} (${metadata.displayName})`,
        );
      } catch (error) {
        this.logger.error(
          `[ImportDiscovery] Failed to instantiate ${metadata.module}:`,
          error,
        );
        this.validationErrors.push(
          `Failed to instantiate ${metadata.module}: ${error}`,
        );
      }
    }
  }

  /**
   * Build dependency graph from service metadata
   * Map<moduleName, Set<dependentModules>>
   */
  private buildDependencyGraph(): void {
    // Initialize graph with all modules
    for (const [moduleName] of this.registry) {
      this.dependencyGraph[moduleName] = new Set();
    }

    // Add dependency relationships
    for (const [moduleName, service] of this.registry) {
      const dependencies = service.metadata.dependencies || [];

      for (const dep of dependencies) {
        if (!this.dependencyGraph[dep]) {
          this.dependencyGraph[dep] = new Set();
        }
        // Add reverse relationship: dep -> moduleName (modules that depend on it)
        this.dependencyGraph[dep].add(moduleName);
      }
    }
  }

  /**
   * Validate dependencies: check for circular deps and missing deps
   */
  private validateDependencies(): void {
    this.validationErrors = [];
    this.circularDependencies = [];

    for (const [moduleName, service] of this.registry) {
      const dependencies = service.metadata.dependencies || [];

      // Check for missing dependencies
      for (const dep of dependencies) {
        if (!this.registry.has(dep)) {
          const error = `Module '${moduleName}' depends on '${dep}' which is not registered`;
          this.validationErrors.push(error);
          this.logger.error(`[ImportDiscovery] ${error}`);
        }
      }

      // Check for circular dependencies
      const circularPath = this.detectCircularDependency(moduleName);
      if (circularPath.detected) {
        this.circularDependencies.push(circularPath);
        const pathStr = circularPath.path.join(' -> ');
        this.logger.error(
          `[ImportDiscovery] Circular dependency detected: ${pathStr}`,
        );
      }
    }

    // Log summary
    if (this.validationErrors.length > 0) {
      this.logger.warn(
        `[ImportDiscovery] ${this.validationErrors.length} validation errors found`,
      );
    }

    if (this.circularDependencies.length > 0) {
      this.logger.warn(
        `[ImportDiscovery] ${this.circularDependencies.length} circular dependencies detected`,
      );
    }
  }

  /**
   * Detect circular dependency starting from a module using DFS
   */
  private detectCircularDependency(
    startModule: string,
    visited = new Set<string>(),
    pathArray: string[] = [],
  ): CircularDependencyError {
    if (visited.has(startModule)) {
      return {
        path: [...pathArray, startModule],
        detected: true,
      };
    }

    visited.add(startModule);
    const newPath = [...pathArray, startModule];

    const service = this.registry.get(startModule);
    if (!service) {
      return { path: newPath, detected: false };
    }

    const dependencies = service.metadata.dependencies || [];
    for (const dep of dependencies) {
      const result = this.detectCircularDependency(dep, visited, newPath);
      if (result.detected) {
        return result;
      }
    }

    visited.delete(startModule);
    return { path: newPath, detected: false };
  }

  /**
   * Topological sort based on dependencies and priority
   * Returns modules in order of import priority
   */
  private topologicalSort(): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    // First, group by priority
    const byPriority = new Map<number, string[]>();

    for (const [moduleName, service] of this.registry) {
      const priority = service.metadata.priority || 100;
      if (!byPriority.has(priority)) {
        byPriority.set(priority, []);
      }
      byPriority.get(priority)!.push(moduleName);
    }

    // Sort by priority and process each group
    const priorities = Array.from(byPriority.keys()).sort((a, b) => a - b);

    for (const priority of priorities) {
      const modules = byPriority.get(priority) || [];

      for (const moduleName of modules) {
        this.depthFirstSort(moduleName, visited, visiting, sorted);
      }
    }

    return sorted;
  }

  /**
   * Depth-first traversal for topological sort
   */
  private depthFirstSort(
    module: string,
    visited: Set<string>,
    visiting: Set<string>,
    result: string[],
  ): void {
    if (visited.has(module)) {
      return;
    }

    if (visiting.has(module)) {
      // Circular dependency already detected in validation
      return;
    }

    visiting.add(module);

    // Process dependencies first
    const service = this.registry.get(module);
    const dependencies = service?.metadata.dependencies || [];

    for (const dep of dependencies) {
      if (this.registry.has(dep)) {
        this.depthFirstSort(dep, visited, visiting, result);
      }
    }

    visiting.delete(module);
    visited.add(module);
    result.push(module);
  }

  /**
   * Persist registry to database
   * Stores all discovered services in import_service_registry table
   */
  private async persistRegistry(): Promise<void> {
    try {
      // Get all services from registry
      const services = Array.from(this.registry.values());

      if (services.length === 0) {
        this.logger.warn('[ImportDiscovery] No services to persist');
        return;
      }

      // Prepare data for upsert
      const registryData = services.map((service) => ({
        module_name: service.metadata.module,
        domain: service.metadata.domain,
        subdomain: service.metadata.subdomain || null,
        display_name: service.metadata.displayName,
        description: service.metadata.description || null,
        dependencies: JSON.stringify(service.metadata.dependencies || []),
        priority: service.metadata.priority,
        tags: JSON.stringify(service.metadata.tags || []),
        supports_rollback: service.metadata.supportsRollback,
        version: service.metadata.version || null,
        file_path: service.filePath || null,
        discovered_at: this.db.fn.now(),
        updated_at: this.db.fn.now(),
      }));

      // Use upsert to handle existing records
      // Delete old records and re-insert
      await this.db('import_service_registry').del();
      await this.db('import_service_registry').insert(registryData);

      this.logger.log(
        `[ImportDiscovery] Persisted ${registryData.length} services to database`,
      );
    } catch (error) {
      this.logger.error('[ImportDiscovery] Failed to persist registry:', error);
      throw new Error(`Failed to persist registry: ${error}`);
    }
  }

  /**
   * Get import order (topological sort result)
   * Used for UI to show recommended import sequence
   */
  getImportOrder(): string[] {
    return this.topologicalSort();
  }

  /**
   * Get import order with reasons/dependencies
   * For display in UI showing why modules are in this order
   */
  getImportOrderWithReasons(): Array<{ module: string; reason: string }> {
    const order = this.topologicalSort();

    return order.map((module) => {
      const service = this.registry.get(module);
      const dependencies = service?.metadata.dependencies || [];

      let reason: string;
      if (dependencies.length === 0) {
        reason = 'No dependencies';
      } else {
        const completedDeps = dependencies.filter((dep) =>
          order.slice(0, order.indexOf(module)).includes(dep),
        );

        if (completedDeps.length === dependencies.length) {
          reason = `Requires: ${dependencies.join(', ')}`;
        } else {
          reason = `Depends on: ${dependencies.join(', ')}`;
        }
      }

      return { module, reason };
    });
  }

  /**
   * Get service by module name
   */
  getService(moduleName: string): IImportService | null {
    return this.registry.get(moduleName)?.instance || null;
  }

  /**
   * Get all registered services
   */
  getAllServices(): RegisteredImportService[] {
    return Array.from(this.registry.values());
  }

  /**
   * Get services by domain
   */
  getServicesByDomain(domain: string): RegisteredImportService[] {
    return Array.from(this.registry.values()).filter(
      (service) => service.metadata.domain === domain,
    );
  }

  /**
   * Get services by tag
   */
  getServicesByTag(tag: string): RegisteredImportService[] {
    return Array.from(this.registry.values()).filter((service) =>
      service.metadata.tags.includes(tag),
    );
  }

  /**
   * Get services sorted by priority
   */
  getServicesByPriority(): RegisteredImportService[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => (a.metadata.priority || 100) - (b.metadata.priority || 100),
    );
  }

  /**
   * Get dependency graph
   */
  getDependencyGraph(): DependencyGraph {
    return this.dependencyGraph;
  }

  /**
   * Get validation errors from discovery
   */
  getValidationErrors(): string[] {
    return this.validationErrors;
  }

  /**
   * Get circular dependencies detected
   */
  getCircularDependencies(): CircularDependencyError[] {
    return this.circularDependencies;
  }

  /**
   * Check if discovery was successful (no errors or circular deps)
   */
  isHealthy(): boolean {
    return (
      this.validationErrors.length === 0 &&
      this.circularDependencies.length === 0
    );
  }
}

/**
 * Create discovery service instance
 * Factory function for creating and initializing service
 */
export async function createImportDiscoveryService(
  fastify: FastifyInstance,
  db: Knex,
): Promise<ImportDiscoveryService> {
  const service = new ImportDiscoveryService(fastify, db);
  await service.discoverServices();
  return service;
}
