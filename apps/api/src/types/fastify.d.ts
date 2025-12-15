import '@fastify/jwt';
import Knex from 'knex';
import { Redis } from 'ioredis';
import { JWTPayload } from './jwt.types';
import { ErrorQueueService } from '../layers/core/monitoring/services/error-queue.service';
import { PermissionCacheService } from '../layers/platform/rbac/services/permission-cache.service';
import { ImportDiscoveryService } from '../layers/platform/import/discovery/import-discovery.service';
import { SettingsService } from '../layers/platform/settings/settings.service';
import { SettingsCacheService } from '../layers/platform/settings/settings-cache.service';
import { NavigationService } from '../layers/platform/navigation/services/navigation.service';
import { FileUploadService } from '../layers/platform/file-upload/file-upload.service';
import type { RateLimitPluginOptions } from '@fastify/rate-limit';

declare module 'fastify' {
  interface FastifyInstance {
    knex: any;
    redis?: Redis;
    errorQueue?: ErrorQueueService;
    permissionCache: PermissionCacheService;
    importDiscovery?: ImportDiscoveryService;
    settingsService?: SettingsService;
    settingsCacheService?: SettingsCacheService;
    navigationService?: NavigationService;
    fileUploadService?: FileUploadService;
  }

  interface FastifyContextConfig {
    rateLimit?: RateLimitPluginOptions;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload; // Use the full payload structure
  }
}
