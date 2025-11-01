import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// API Keys Statistics
export interface ApiKeysStats {
  totalKeys: number;
  activeKeys: number;
  inactiveKeys: number;
  expiredKeys: number;
  recentlyUsedKeys: number;
  keysByUser: Array<{ userId: string; count: number }>;
  usageToday: number;
}

// System Metrics
export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  process: {
    memoryUsage: number;
    uptime: number;
    pid: number;
  };
  timestamp: string;
}

// Database Pool Stats
export interface DatabasePoolStats {
  pool: {
    total: number;
    active: number;
    idle: number;
  };
  queries: {
    total: number;
    slow: number;
  };
  timestamp: string;
}

// Cache Stats
export interface CacheStats {
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    keys: number;
    memory: number;
  };
  timestamp: string;
}

// System Alert
export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  /**
   * Get API Keys statistics
   */
  getApiKeysStats(): Observable<{ success: boolean; data: ApiKeysStats }> {
    return this.http.get<{ success: boolean; data: ApiKeysStats }>(
      `${this.apiUrl}/api-keys/stats`,
    );
  }

  /**
   * Get system metrics (CPU, Memory)
   */
  getSystemMetrics(): Observable<{ success: boolean; data: SystemMetrics }> {
    return this.http.get<{ success: boolean; data: SystemMetrics }>(
      `${this.apiUrl}/monitoring/system-metrics`,
    );
  }

  /**
   * Get database pool stats
   */
  getDatabasePoolStats(): Observable<{
    success: boolean;
    data: DatabasePoolStats;
  }> {
    return this.http.get<{ success: boolean; data: DatabasePoolStats }>(
      `${this.apiUrl}/monitoring/database-pool`,
    );
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): Observable<{ success: boolean; data: CacheStats }> {
    return this.http.get<{ success: boolean; data: CacheStats }>(
      `${this.apiUrl}/monitoring/cache-stats`,
    );
  }

  /**
   * Generate system alerts based on metrics
   */
  generateSystemAlerts(
    systemMetrics?: SystemMetrics,
    dbStats?: DatabasePoolStats,
    cacheStats?: CacheStats,
  ): SystemAlert[] {
    const alerts: SystemAlert[] = [];

    // CPU alerts
    if (systemMetrics && systemMetrics.cpu.usage > 80) {
      alerts.push({
        id: 'cpu-high',
        type: 'error',
        title: 'High CPU Usage',
        message: `CPU usage is at ${systemMetrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    } else if (systemMetrics && systemMetrics.cpu.usage > 60) {
      alerts.push({
        id: 'cpu-warning',
        type: 'warning',
        title: 'Elevated CPU Usage',
        message: `CPU usage is at ${systemMetrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Memory alerts
    if (systemMetrics && systemMetrics.memory.usagePercent > 85) {
      alerts.push({
        id: 'memory-high',
        type: 'error',
        title: 'High Memory Usage',
        message: `Memory usage is at ${systemMetrics.memory.usagePercent.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    } else if (systemMetrics && systemMetrics.memory.usagePercent > 70) {
      alerts.push({
        id: 'memory-warning',
        type: 'warning',
        title: 'Elevated Memory Usage',
        message: `Memory usage is at ${systemMetrics.memory.usagePercent.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Database pool alerts
    if (dbStats) {
      const poolUsagePercent = (dbStats.pool.active / dbStats.pool.total) * 100;
      if (poolUsagePercent > 90) {
        alerts.push({
          id: 'db-pool-high',
          type: 'error',
          title: 'Database Pool Almost Full',
          message: `${dbStats.pool.active}/${dbStats.pool.total} connections in use`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
    }

    // Cache hit rate alerts
    if (cacheStats && cacheStats.cache.hitRate < 50) {
      alerts.push({
        id: 'cache-low-hit-rate',
        type: 'warning',
        title: 'Low Cache Hit Rate',
        message: `Cache hit rate is ${cacheStats.cache.hitRate.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }

    return alerts;
  }
}
