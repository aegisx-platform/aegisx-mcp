/**
 * Import Service Infrastructure
 * Auto-Discovery Import System exports
 * Provides decorator, types, registry, and discovery service for import service discovery
 */

// Export types
export * from './types/import-service.types';

// Export decorator and utilities
export {
  ImportService,
  getImportServiceMetadata,
  isImportService,
} from './decorator/import-service.decorator';

// Export registry and helpers
export {
  getImportServiceRegistry,
  registerImportService,
  getRegisteredImportServices,
  getServiceMetadata,
  getServiceInstance,
  getAllRegisteredServices,
  ImportServiceRegistry,
} from './registry/import-service-registry';

// Export discovery service and plugin
export {
  ImportDiscoveryService,
  createImportDiscoveryService,
} from './discovery/import-discovery.service';

export { default as importDiscoveryPlugin } from './plugin/import-discovery.plugin';

// Export base service
export { BaseImportService } from './base/base-import.service';

// Export repositories
export * from './repositories';

// Export jobs
export * from './jobs';
