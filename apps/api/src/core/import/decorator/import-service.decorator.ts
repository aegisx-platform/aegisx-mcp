/**
 * @ImportService Decorator
 * Class decorator for marking and registering import service classes
 * Automatically stores metadata in global registry during class definition
 *
 * Usage:
 * @ImportService({
 *   module: 'drug_generics',
 *   domain: 'inventory',
 *   subdomain: 'master-data',
 *   displayName: 'Drug Generics (ยาหลัก)',
 *   dependencies: [],
 *   priority: 1,
 *   tags: ['master-data', 'required'],
 *   supportsRollback: true,
 *   version: '1.0.0'
 * })
 * export class DrugGenericsImportService extends BaseImportService<DrugGeneric> {
 *   // Implementation...
 * }
 */

import 'reflect-metadata';

import {
  ImportServiceMetadata,
  ImportServiceOptions,
} from '../types/import-service.types';
import { registerImportService } from '../registry/import-service-registry';

/**
 * Class decorator for marking import service classes
 * Registers service metadata in global registry automatically
 *
 * @param options - Import service configuration options
 * @returns Class decorator function
 *
 * @throws Error if required metadata fields are missing
 *
 * @example
 * @ImportService({
 *   module: 'drug_generics',
 *   domain: 'inventory',
 *   subdomain: 'master-data',
 *   displayName: 'Drug Generics (ยาหลัก)',
 *   dependencies: [],
 *   priority: 1,
 *   tags: ['master-data', 'required'],
 *   supportsRollback: true,
 *   version: '1.0.0'
 * })
 * export class DrugGenericsImportService extends BaseImportService<DrugGeneric> {
 *   // Implementation...
 * }
 */
export function ImportService(
  options: ImportServiceOptions,
): <T extends new (...args: any[]) => any>(constructor: T) => T {
  return function <T extends new (...args: any[]) => any>(constructor: T): T {
    // Validate required options
    if (!options.module || typeof options.module !== 'string') {
      throw new Error(
        '@ImportService: "module" is required and must be a string',
      );
    }

    if (!options.domain || typeof options.domain !== 'string') {
      throw new Error(
        '@ImportService: "domain" is required and must be a string',
      );
    }

    if (!options.displayName || typeof options.displayName !== 'string') {
      throw new Error(
        '@ImportService: "displayName" is required and must be a string',
      );
    }

    if (!Array.isArray(options.dependencies)) {
      throw new Error(
        '@ImportService: "dependencies" is required and must be an array',
      );
    }

    if (
      typeof options.priority !== 'number' ||
      options.priority < 0 ||
      !Number.isInteger(options.priority)
    ) {
      throw new Error(
        '@ImportService: "priority" is required and must be a non-negative integer',
      );
    }

    if (!Array.isArray(options.tags)) {
      throw new Error(
        '@ImportService: "tags" is required and must be an array',
      );
    }

    if (typeof options.supportsRollback !== 'boolean') {
      throw new Error(
        '@ImportService: "supportsRollback" is required and must be a boolean',
      );
    }

    if (!options.version || typeof options.version !== 'string') {
      throw new Error(
        '@ImportService: "version" is required and must be a string',
      );
    }

    // Validate version format (should be semantic versioning)
    const versionRegex = /^\d+\.\d+\.\d+/;
    if (!versionRegex.test(options.version)) {
      console.warn(
        `@ImportService: Version '${options.version}' should follow semantic versioning (e.g., '1.0.0')`,
      );
    }

    // Create metadata object from options
    const metadata: ImportServiceMetadata = {
      module: options.module,
      domain: options.domain,
      subdomain: options.subdomain,
      displayName: options.displayName,
      description: options.description,
      dependencies: options.dependencies,
      priority: options.priority,
      tags: options.tags,
      supportsRollback: options.supportsRollback,
      version: options.version,
      target: constructor,
    };

    // Get file path from stack trace if available
    let filePath: string | undefined;
    try {
      const stack = new Error().stack;
      if (stack) {
        // Try to extract file path from stack trace
        const match = stack.match(/\((.+?):\d+:\d+\)/);
        if (match) {
          filePath = match[1];
        }
      }
    } catch {
      // Stack trace extraction failed, continue without it
    }

    // Register in global registry
    registerImportService(metadata, constructor, filePath);

    // Attach metadata to the class itself for runtime access
    Reflect.defineMetadata('importService:metadata', metadata, constructor);

    return constructor;
  };
}

/**
 * Get metadata from a decorated class
 * Useful for runtime reflection of import service classes
 *
 * @param target - The class to get metadata from
 * @returns Metadata object or undefined if not decorated
 *
 * @example
 * const metadata = getImportServiceMetadata(DrugGenericsImportService);
 * console.log(metadata.module); // 'drug_generics'
 */
export function getImportServiceMetadata(
  target: any,
): ImportServiceMetadata | undefined {
  try {
    return Reflect.getMetadata('importService:metadata', target);
  } catch {
    return undefined;
  }
}

/**
 * Check if a class is decorated with @ImportService
 *
 * @param target - The class to check
 * @returns true if the class is decorated
 *
 * @example
 * if (isImportService(SomeClass)) {
 *   // Handle as import service
 * }
 */
export function isImportService(target: any): boolean {
  return getImportServiceMetadata(target) !== undefined;
}
