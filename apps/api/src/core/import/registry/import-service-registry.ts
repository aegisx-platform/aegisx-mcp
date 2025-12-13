/**
 * Global Import Service Registry
 * Stores metadata and instances of all registered import services
 * Provides helper functions for discovery and service lookup
 */

import {
  ImportServiceMetadata,
  RegisteredImportService,
  IImportService,
} from '../types/import-service.types';

/**
 * Global registry for import services
 * Stores all discovered and registered import services
 */
class ImportServiceRegistry {
  /**
   * Map of module name -> service metadata
   * @private
   */
  private services: Map<string, ImportServiceMetadata> = new Map();

  /**
   * Map of module name -> service instance
   * @private
   */
  private instances: Map<string, IImportService> = new Map();

  /**
   * Map of module name -> file path
   * @private
   */
  private filePaths: Map<string, string> = new Map();

  /**
   * Register an import service in the global registry
   * Called by the @ImportService decorator
   *
   * @param metadata - Service metadata from decorator
   * @param target - Service class constructor (must implement IImportService)
   * @param filePath - Path to the service file (optional)
   */
  public registerService(
    metadata: ImportServiceMetadata,
    target: new (...args: any[]) => IImportService,
    filePath?: string,
  ): void {
    const moduleName = metadata.module;

    // Check if already registered
    if (this.services.has(moduleName)) {
      console.warn(
        `Import service '${moduleName}' is already registered. Overwriting...`,
      );
    }

    // Store metadata
    const fullMetadata: ImportServiceMetadata = {
      ...metadata,
      target,
      filePath,
    };

    this.services.set(moduleName, fullMetadata);
    if (filePath) {
      this.filePaths.set(moduleName, filePath);
    }

    console.log(
      `[ImportRegistry] Registered service: ${moduleName} (${metadata.displayName})`,
    );
  }

  /**
   * Register a service instance
   * Called after service instantiation during discovery
   *
   * @param moduleName - Module name
   * @param instance - Service instance
   */
  public registerInstance(moduleName: string, instance: IImportService): void {
    if (!this.services.has(moduleName)) {
      throw new Error(
        `Cannot register instance for unknown module '${moduleName}'. Register metadata first.`,
      );
    }

    this.instances.set(moduleName, instance);
  }

  /**
   * Get service metadata by module name
   *
   * @param moduleName - Module name
   * @returns Service metadata or undefined
   */
  public getMetadata(moduleName: string): ImportServiceMetadata | undefined {
    return this.services.get(moduleName);
  }

  /**
   * Get service instance by module name
   *
   * @param moduleName - Module name
   * @returns Service instance or undefined
   */
  public getInstance(moduleName: string): IImportService | undefined {
    return this.instances.get(moduleName);
  }

  /**
   * Get all registered services with their metadata
   *
   * @returns Array of all registered service metadata
   */
  public getAllMetadata(): ImportServiceMetadata[] {
    return Array.from(this.services.values());
  }

  /**
   * Get all registered services with instances
   *
   * @returns Array of registered import services with instances
   */
  public getAllServices(): RegisteredImportService[] {
    return Array.from(this.services.entries())
      .map(([moduleName, metadata]) => {
        const instance = this.instances.get(moduleName);
        if (!instance) {
          console.warn(
            `Service '${moduleName}' has metadata but no instance. May not be initialized yet.`,
          );
          return null;
        }

        return {
          metadata,
          instance,
          filePath: this.filePaths.get(moduleName) || '',
        };
      })
      .filter(
        (service): service is RegisteredImportService => service !== null,
      );
  }

  /**
   * Get services by domain
   *
   * @param domain - Domain name
   * @returns Array of service metadata for the domain
   */
  public getServicesByDomain(domain: string): ImportServiceMetadata[] {
    return Array.from(this.services.values()).filter(
      (meta) => meta.domain === domain,
    );
  }

  /**
   * Get services by tag
   *
   * @param tag - Tag name
   * @returns Array of service metadata with the tag
   */
  public getServicesByTag(tag: string): ImportServiceMetadata[] {
    return Array.from(this.services.values()).filter((meta) =>
      meta.tags.includes(tag),
    );
  }

  /**
   * Get services sorted by priority (ascending, 1 = highest)
   *
   * @returns Sorted array of service metadata
   */
  public getServicesByPriority(): ImportServiceMetadata[] {
    return Array.from(this.services.values()).sort(
      (a, b) => a.priority - b.priority,
    );
  }

  /**
   * Get total number of registered services
   *
   * @returns Number of registered services
   */
  public getServiceCount(): number {
    return this.services.size;
  }

  /**
   * Check if a service is registered
   *
   * @param moduleName - Module name
   * @returns true if service is registered
   */
  public hasService(moduleName: string): boolean {
    return this.services.has(moduleName);
  }

  /**
   * Check if a service instance is available
   *
   * @param moduleName - Module name
   * @returns true if instance is available
   */
  public hasInstance(moduleName: string): boolean {
    return this.instances.has(moduleName);
  }

  /**
   * Clear all registered services (useful for testing)
   */
  public clear(): void {
    this.services.clear();
    this.instances.clear();
    this.filePaths.clear();
  }

  /**
   * Get registry statistics
   *
   * @returns Statistics about registered services
   */
  public getStats(): {
    totalServices: number;
    instantiatedServices: number;
    domains: string[];
    tags: string[];
    byPriority: Array<{
      module: string;
      displayName: string;
      priority: number;
    }>;
  } {
    const allMetadata = this.getAllMetadata();
    const domains = [...new Set(allMetadata.map((m) => m.domain))];
    const tags = [...new Set(allMetadata.flatMap((m) => m.tags))];

    return {
      totalServices: this.services.size,
      instantiatedServices: this.instances.size,
      domains,
      tags,
      byPriority: allMetadata
        .sort((a, b) => a.priority - b.priority)
        .map((m) => ({
          module: m.module,
          displayName: m.displayName,
          priority: m.priority,
        })),
    };
  }
}

/**
 * Global singleton instance of the registry
 */
const registryInstance = new ImportServiceRegistry();

/**
 * Get the global import service registry
 * This is a singleton - all calls return the same instance
 *
 * @returns The global registry instance
 */
export function getImportServiceRegistry(): ImportServiceRegistry {
  return registryInstance;
}

/**
 * Helper function to register a service (used by decorator)
 *
 * @param metadata - Service metadata
 * @param target - Service class constructor (must implement IImportService)
 * @param filePath - Service file path
 */
export function registerImportService(
  metadata: ImportServiceMetadata,
  target: new (...args: any[]) => IImportService,
  filePath?: string,
): void {
  registryInstance.registerService(metadata, target, filePath);
}

/**
 * Helper function to get registered services
 *
 * @returns Array of all registered services
 */
export function getRegisteredImportServices(): ImportServiceMetadata[] {
  return registryInstance.getAllMetadata();
}

/**
 * Helper function to get service metadata
 *
 * @param moduleName - Module name
 * @returns Service metadata or undefined
 */
export function getServiceMetadata(
  moduleName: string,
): ImportServiceMetadata | undefined {
  return registryInstance.getMetadata(moduleName);
}

/**
 * Helper function to get service instance
 *
 * @param moduleName - Module name
 * @returns Service instance or undefined
 */
export function getServiceInstance(
  moduleName: string,
): IImportService | undefined {
  return registryInstance.getInstance(moduleName);
}

/**
 * Helper function to get all registered services with instances
 *
 * @returns Array of registered services with instances
 */
export function getAllRegisteredServices(): RegisteredImportService[] {
  return registryInstance.getAllServices();
}

/**
 * Export the registry class for direct access if needed
 */
export { ImportServiceRegistry };
