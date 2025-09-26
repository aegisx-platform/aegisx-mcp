import { FastifyInstance } from 'fastify';
import Knex from 'knex';
import * as os from 'os';

export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  environment: string;
  uptime: number;
  timestamp: string;
}

export interface ServiceStatus {
  status: 'connected' | 'disconnected' | 'error';
  responseTime?: number;
}

export interface MemoryStatus {
  used: number;
  total: number;
  free: number;
  percentage: number;
}

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceStatus;
    redis?: ServiceStatus;
  };
  memory: MemoryStatus;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  checks?: Array<{
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }>;
}

export class DefaultService {
  private startTime: number;

  constructor(
    private knex: any,
    private fastify?: FastifyInstance,
  ) {
    this.startTime = Date.now();
  }

  async getApiInfo(): Promise<ApiInfo> {
    return {
      name: 'AegisX Platform API',
      version: '1.0.0',
      description: 'Enterprise monorepo API for AegisX Platform',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    // Check database connection
    const databaseStatus = await this.checkDatabase();

    // Check Redis connection if available
    const redisStatus = this.fastify?.redis
      ? await this.checkRedis()
      : undefined;

    // Get memory status
    const memoryStatus = this.getMemoryStatus();

    // Determine overall status
    const overallStatus = this.determineOverallStatus(
      databaseStatus,
      redisStatus,
      memoryStatus,
    );

    const services: { database: ServiceStatus; redis?: ServiceStatus } = {
      database: databaseStatus,
    };

    if (redisStatus) {
      services.redis = redisStatus;
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '1.0.0',
      services,
      memory: memoryStatus,
    };
  }

  async getHealthStatus(): Promise<HealthStatus> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    try {
      const startTime = Date.now();

      // Simple query to test connection
      await this.knex.raw('SELECT 1');

      const responseTime = Date.now() - startTime;

      return {
        status: 'connected',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'error',
      };
    }
  }

  private async checkRedis(): Promise<ServiceStatus> {
    try {
      if (!this.fastify?.redis) {
        return { status: 'disconnected' };
      }

      const startTime = Date.now();

      // Simple ping to test connection
      await this.fastify.redis.ping();

      const responseTime = Date.now() - startTime;

      return {
        status: 'connected',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'error',
      };
    }
  }

  private getMemoryStatus(): MemoryStatus {
    const memoryUsage = process.memoryUsage();
    const totalSystemMemory = os.totalmem();
    const freeSystemMemory = os.freemem();
    const usedSystemMemory = totalSystemMemory - freeSystemMemory;

    return {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      free: memoryUsage.heapTotal - memoryUsage.heapUsed,
      percentage: Math.round(
        (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      ),
    };
  }

  private determineOverallStatus(
    databaseStatus: ServiceStatus,
    redisStatus?: ServiceStatus,
    memoryStatus?: MemoryStatus,
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // If database is down, system is unhealthy
    if (
      databaseStatus.status === 'error' ||
      databaseStatus.status === 'disconnected'
    ) {
      return 'unhealthy';
    }

    // If memory usage is very high, system is degraded
    if (memoryStatus && memoryStatus.percentage > 90) {
      return 'degraded';
    }

    // If Redis is configured but down, system is degraded
    if (
      redisStatus &&
      (redisStatus.status === 'error' || redisStatus.status === 'disconnected')
    ) {
      return 'degraded';
    }

    // If database response time is too high, system is degraded
    if (databaseStatus.responseTime && databaseStatus.responseTime > 1000) {
      return 'degraded';
    }

    return 'healthy';
  }
}
