/**
 * Metrics Service - Adapter pattern for pluggable metrics backends
 *
 * Architecture:
 * - IMetricsCollector: Abstract interface for metrics collection
 * - PrometheusMetricsCollector: Implementation using prom-client
 * - Future: DataDogMetricsCollector, NewRelicMetricsCollector, etc.
 *
 * This service aggregates metrics data for the /request-metrics endpoint
 */

import { FastifyInstance } from 'fastify';
import promClient from 'prom-client';

// Types for request metrics response
export interface EndpointMetrics {
  endpoint: string;
  count: number;
  avgResponseTime: number;
}

export interface RequestMetricsResponse {
  totalRequests: number;
  byEndpoint: EndpointMetrics[];
  timestamp: string;
}

/**
 * Abstract interface for metrics collectors
 * Allows swapping between different metrics backends
 */
export interface IMetricsCollector {
  /**
   * Get aggregated request metrics
   */
  getRequestMetrics(): Promise<RequestMetricsResponse>;

  /**
   * Get raw metrics in backend-specific format
   * (e.g., Prometheus text format, DataDog JSON, etc.)
   */
  getRawMetrics(): Promise<string>;
}

/**
 * Prometheus-based metrics collector
 * Uses prom-client registry to aggregate metrics
 */
export class PrometheusMetricsCollector implements IMetricsCollector {
  private registry: promClient.Registry;
  private requestCounter: promClient.Counter;
  private requestDuration: promClient.Histogram;

  constructor(fastify: FastifyInstance) {
    // Get metrics from Fastify instance (decorated by metrics plugin)
    if (!fastify.metrics) {
      throw new Error(
        'Metrics plugin not initialized. Register metrics plugin first.',
      );
    }

    this.registry = fastify.metrics.register;
    this.requestCounter = fastify.metrics.requestCounter;
    this.requestDuration = fastify.metrics.requestDuration;
  }

  /**
   * Get aggregated request metrics for dashboard
   */
  async getRequestMetrics(): Promise<RequestMetricsResponse> {
    try {
      // Get metrics from Prometheus registry
      const metrics = await this.registry.getMetricsAsJSON();

      // Find request counter and duration histogram
      const counterMetric = metrics.find(
        (m) => m.name === 'http_requests_total',
      );
      const durationMetric = metrics.find(
        (m) => m.name === 'http_request_duration_seconds',
      );

      if (!counterMetric || !durationMetric) {
        return {
          totalRequests: 0,
          byEndpoint: [],
          timestamp: new Date().toISOString(),
        };
      }

      // Aggregate by endpoint
      const endpointMap = new Map<
        string,
        { count: number; totalDuration: number }
      >();
      let totalRequests = 0;

      // Process counter values (total requests)
      // Cast type to string for comparison (prom-client uses MetricType enum)
      if (String(counterMetric.type) === 'counter' && counterMetric.values) {
        for (const value of counterMetric.values) {
          // Ensure route is string (labels can be string | number)
          const route = String(value.labels?.route || 'unknown');
          const count = value.value || 0;

          totalRequests += count;

          if (!endpointMap.has(route)) {
            endpointMap.set(route, { count: 0, totalDuration: 0 });
          }

          const endpoint = endpointMap.get(route)!;
          endpoint.count += count;
        }
      }

      // Process duration values (response times)
      // Cast type to string for comparison (prom-client uses MetricType enum)
      if (
        String(durationMetric.type) === 'histogram' &&
        durationMetric.values
      ) {
        for (const value of durationMetric.values) {
          // Ensure route is string (labels can be string | number)
          const route = String(value.labels?.route || 'unknown');

          // Type guard for metricName (only exists on some histogram values)
          const hasMetricName = (
            v: typeof value,
          ): v is typeof value & { metricName: string } => {
            return 'metricName' in v && typeof v.metricName === 'string';
          };

          // Histogram stores sum in separate metric
          if (
            hasMetricName(value) &&
            value.metricName === 'http_request_duration_seconds_sum'
          ) {
            const duration = value.value || 0;
            const endpoint = endpointMap.get(route);

            if (endpoint) {
              endpoint.totalDuration = duration;
            }
          }
        }
      }

      // Build endpoint metrics array
      const byEndpoint: EndpointMetrics[] = [];
      for (const [endpoint, data] of endpointMap.entries()) {
        // Skip metrics endpoint itself and system routes
        if (endpoint.includes('/metrics') || endpoint.includes('/health')) {
          continue;
        }

        // Calculate average response time (convert seconds to milliseconds)
        const avgResponseTime =
          data.count > 0 ? (data.totalDuration / data.count) * 1000 : 0;

        byEndpoint.push({
          endpoint,
          count: data.count,
          avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
        });
      }

      // Sort by request count (descending)
      byEndpoint.sort((a, b) => b.count - a.count);

      // Limit to top 20 endpoints
      const topEndpoints = byEndpoint.slice(0, 20);

      return {
        totalRequests,
        byEndpoint: topEndpoints,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Log error and return empty data
      console.error('Failed to get request metrics:', error);
      return {
        totalRequests: 0,
        byEndpoint: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get raw Prometheus metrics (text format)
   */
  async getRawMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}

/**
 * Future: DataDog metrics collector
 * Uncomment when DataDog integration is needed
 */
/*
export class DataDogMetricsCollector implements IMetricsCollector {
  private statsdClient: any; // StatsD client

  constructor(config: DataDogConfig) {
    // Initialize DataDog StatsD client
    // this.statsdClient = new StatsD({ ...config });
  }

  async getRequestMetrics(): Promise<RequestMetricsResponse> {
    // Query DataDog API for metrics
    // Implementation here
    return {
      totalRequests: 0,
      byEndpoint: [],
      timestamp: new Date().toISOString(),
    };
  }

  async getRawMetrics(): Promise<string> {
    // Return DataDog metrics in JSON format
    return JSON.stringify({});
  }
}
*/

/**
 * Future: New Relic metrics collector
 */
/*
export class NewRelicMetricsCollector implements IMetricsCollector {
  // Implementation for New Relic
}
*/

/**
 * Metrics Service Factory
 * Creates appropriate metrics collector based on configuration
 */
export class MetricsService {
  private collector: IMetricsCollector;

  constructor(
    fastify: FastifyInstance,
    backend: 'prometheus' | 'datadog' | 'newrelic' = 'prometheus',
  ) {
    // Factory pattern: Create collector based on backend type
    switch (backend) {
      case 'prometheus':
        this.collector = new PrometheusMetricsCollector(fastify);
        break;
      // case 'datadog':
      //   this.collector = new DataDogMetricsCollector(config);
      //   break;
      // case 'newrelic':
      //   this.collector = new NewRelicMetricsCollector(config);
      //   break;
      default:
        throw new Error(`Unknown metrics backend: ${backend}`);
    }
  }

  /**
   * Get aggregated request metrics for dashboard
   */
  async getRequestMetrics(): Promise<RequestMetricsResponse> {
    return this.collector.getRequestMetrics();
  }

  /**
   * Get raw metrics in backend-specific format
   */
  async getRawMetrics(): Promise<string> {
    return this.collector.getRawMetrics();
  }
}
