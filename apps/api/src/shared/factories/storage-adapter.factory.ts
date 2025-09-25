import { FastifyInstance } from 'fastify';
import {
  IStorageAdapter,
  IStorageAdapterFactory,
  StorageType,
  StorageConfiguration,
  ConfigurationError,
} from '../interfaces/storage-adapter.interface';
import {
  LocalStorageAdapter,
  LocalStorageConfig,
} from '../adapters/local-storage.adapter';

/**
 * Storage Adapter Factory
 *
 * Creates storage adapters based on configuration.
 * Supports multiple storage providers and can be extended for cloud providers.
 */
export class StorageAdapterFactory implements IStorageAdapterFactory {
  private static instance: StorageAdapterFactory;
  private adapters: Map<StorageType, IStorageAdapter> = new Map();

  constructor(private fastify?: FastifyInstance) {}

  static getInstance(fastify?: FastifyInstance): StorageAdapterFactory {
    if (!StorageAdapterFactory.instance) {
      StorageAdapterFactory.instance = new StorageAdapterFactory(fastify);
    }
    return StorageAdapterFactory.instance;
  }

  async create(config: StorageConfiguration): Promise<IStorageAdapter> {
    // Check if adapter already exists in cache
    const existingAdapter = this.adapters.get(config.type);
    if (existingAdapter) {
      return existingAdapter;
    }

    let adapter: IStorageAdapter;

    switch (config.type) {
      case StorageType.LOCAL:
        adapter = await this.createLocalAdapter(
          config.options as LocalStorageConfig,
        );
        break;

      case StorageType.AWS_S3:
        throw new ConfigurationError(
          'AWS S3 adapter not yet implemented. Coming soon!',
          StorageType.AWS_S3,
        );

      case StorageType.MINIO:
        throw new ConfigurationError(
          'MinIO adapter not yet implemented. Coming soon!',
          StorageType.MINIO,
        );

      case StorageType.GOOGLE_CLOUD:
        throw new ConfigurationError(
          'Google Cloud Storage adapter not yet implemented. Coming soon!',
          StorageType.GOOGLE_CLOUD,
        );

      case StorageType.AZURE_BLOB:
        throw new ConfigurationError(
          'Azure Blob Storage adapter not yet implemented. Coming soon!',
          StorageType.AZURE_BLOB,
        );

      default:
        throw new ConfigurationError(
          `Unsupported storage type: ${config.type}`,
          config.type as StorageType,
        );
    }

    // Validate the adapter configuration
    await adapter.validateConfiguration();

    // Cache the adapter for reuse
    this.adapters.set(config.type, adapter);

    return adapter;
  }

  getSupportedTypes(): StorageType[] {
    return [
      StorageType.LOCAL,
      // Future implementations:
      // StorageType.AWS_S3,
      // StorageType.MINIO,
      // StorageType.GOOGLE_CLOUD,
      // StorageType.AZURE_BLOB,
    ];
  }

  /**
   * Get the default storage adapter (Local)
   */
  async getDefaultAdapter(): Promise<IStorageAdapter> {
    const defaultConfig: StorageConfiguration = {
      type: StorageType.LOCAL,
      options: {
        jwtSecret: process.env.JWT_SECRET || 'fallback-secret-for-development',
        baseUrl: process.env.BASE_URL || 'http://localhost:4200',
        defaultExpirySeconds: 3600,
        maxExpirySeconds: 86400,
      },
    };

    return this.create(defaultConfig);
  }

  /**
   * Clear cached adapters (useful for testing)
   */
  clearCache(): void {
    this.adapters.clear();
  }

  /**
   * Health check all cached adapters
   */
  async healthCheckAll(): Promise<Record<StorageType, boolean>> {
    const results: Record<StorageType, boolean> = {} as any;

    for (const [type, adapter] of this.adapters) {
      try {
        results[type] = await adapter.healthCheck();
      } catch (error) {
        results[type] = false;
      }
    }

    return results;
  }

  /**
   * Create Local Storage Adapter
   */
  private async createLocalAdapter(
    config: LocalStorageConfig,
  ): Promise<LocalStorageAdapter> {
    // Validate required configuration
    if (!config.jwtSecret) {
      throw new ConfigurationError(
        'JWT secret is required for local storage adapter',
        StorageType.LOCAL,
      );
    }

    if (!config.baseUrl) {
      throw new ConfigurationError(
        'Base URL is required for local storage adapter',
        StorageType.LOCAL,
      );
    }

    // Set defaults
    const adapterConfig: LocalStorageConfig = {
      defaultExpirySeconds: 3600,
      maxExpirySeconds: 86400,
      ...config,
    };

    return new LocalStorageAdapter(adapterConfig, this.fastify);
  }

  /**
   * Future: Create AWS S3 Adapter
   */
  private async createS3Adapter(config: any): Promise<IStorageAdapter> {
    // TODO: Implement S3StorageAdapter
    // Will require AWS SDK and S3 configuration
    throw new ConfigurationError(
      'S3 adapter implementation is planned for future release',
      StorageType.AWS_S3,
    );
  }

  /**
   * Future: Create MinIO Adapter
   */
  private async createMinIOAdapter(config: any): Promise<IStorageAdapter> {
    // TODO: Implement MinIOStorageAdapter
    // Will require MinIO client and MinIO configuration
    throw new ConfigurationError(
      'MinIO adapter implementation is planned for future release',
      StorageType.MINIO,
    );
  }

  /**
   * Get adapter by type (if cached)
   */
  getAdapter(type: StorageType): IStorageAdapter | undefined {
    return this.adapters.get(type);
  }

  /**
   * Check if adapter type is supported
   */
  isSupported(type: StorageType): boolean {
    return this.getSupportedTypes().includes(type);
  }
}

/**
 * Global factory instance for easy access
 */
export const storageAdapterFactory = StorageAdapterFactory.getInstance();

/**
 * Configuration types for different storage providers
 */
export interface S3StorageConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export interface MinIOStorageConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export interface GoogleCloudStorageConfig {
  projectId: string;
  keyFilename?: string;
  bucket: string;
  credentials?: object;
}

export interface AzureBlobStorageConfig {
  accountName: string;
  accountKey: string;
  containerName: string;
  endpoint?: string;
}
