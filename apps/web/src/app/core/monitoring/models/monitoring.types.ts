/**
 * Monitoring Types
 *
 * Type definitions for system monitoring and error logs
 */

// ============================================================================
// System Metrics Types
// ============================================================================

export interface SystemMetrics {
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  process: ProcessMetrics;
  timestamp: string;
}

export interface CPUMetrics {
  usage: number; // CPU usage in microseconds
  cores: number; // Number of CPU cores
  loadAverage: number[]; // 1min, 5min, 15min load averages
}

export interface MemoryMetrics {
  total: number; // Total memory in bytes
  used: number; // Used memory in bytes
  free: number; // Free memory in bytes
  usagePercent: number; // Memory usage percentage
}

export interface ProcessMetrics {
  memoryUsage: number; // Process memory usage in bytes
  uptime: number; // Process uptime in seconds
  pid: number; // Process ID
}

// ============================================================================
// API Performance Types
// ============================================================================

export interface APIPerformance {
  responseTime: ResponseTimeStats;
  throughput: ThroughputStats;
  timestamp: string;
}

export interface ResponseTimeStats {
  average: number; // Average response time in ms
  median: number; // Median response time in ms
  p95: number; // 95th percentile response time in ms
  p99: number; // 99th percentile response time in ms
  min: number; // Minimum response time in ms
  max: number; // Maximum response time in ms
}

export interface ThroughputStats {
  requestsPerSecond: number;
  requestsPerMinute: number;
  totalRequests: number;
}

// ============================================================================
// Database Stats Types
// ============================================================================

export interface DatabaseStats {
  pool: PoolStats;
  queries: QueryStats;
  timestamp: string;
}

export interface PoolStats {
  total: number; // Total connections in pool
  idle: number; // Idle connections
  active: number; // Active connections
}

export interface QueryStats {
  total: number; // Total queries executed
  slow: number; // Slow queries (>1s)
}

// ============================================================================
// Redis Stats Types
// ============================================================================

export interface RedisStats {
  memory: RedisMemoryStats;
  cache: CacheStats;
  keys: number; // Total number of keys
  timestamp: string;
}

export interface RedisMemoryStats {
  used: number; // Used memory in bytes
  peak: number; // Peak memory in bytes
  fragmentation: number; // Memory fragmentation ratio
}

export interface CacheStats {
  hits: number; // Cache hits
  misses: number; // Cache misses
  hitRate: number; // Hit rate percentage
}

// ============================================================================
// Active Sessions Types
// ============================================================================

export interface ActiveSessions {
  total: number; // Total active sessions
  users: number; // Unique users count
  sessions: SessionInfo[];
  timestamp: string;
}

export interface SessionInfo {
  userId: string;
  lastActivity: string; // ISO timestamp
}

// ============================================================================
// Request Metrics Types
// ============================================================================

export interface RequestMetrics {
  byEndpoint: EndpointMetric[];
  timestamp: string;
}

export interface EndpointMetric {
  endpoint: string;
  method: string;
  count: number;
  avgResponseTime: number; // in ms
  errorRate: number; // percentage
}

// ============================================================================
// Error Log Types
// ============================================================================

export interface ErrorLog {
  id: string;
  timestamp: string; // Client timestamp
  level: 'error' | 'warn' | 'info';
  message: string;
  url?: string;
  stack?: string;
  context?: Record<string, any>;
  type: 'javascript' | 'http' | 'angular' | 'custom' | 'backend' | 'system';

  // User context
  userId?: string;
  sessionId?: string;
  userAgent?: string;

  // Request context
  correlationId?: string;
  ipAddress?: string;
  referer?: string;

  // Server timestamps
  serverTimestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorLogsQuery {
  level?: 'error' | 'warn' | 'info';
  type?: 'javascript' | 'http' | 'angular' | 'custom' | 'backend' | 'system';
  userId?: string;
  sessionId?: string;
  startDate?: string; // ISO timestamp
  endDate?: string; // ISO timestamp
  search?: string; // Search in message
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'createdAt' | 'level';
  sortOrder?: 'asc' | 'desc';
}

export interface ErrorStats {
  totalErrors: number;
  byLevel: {
    error: number;
    warn: number;
    info: number;
  };
  byType: {
    javascript: number;
    http: number;
    angular: number;
    custom: number;
    backend: number;
    system: number;
  };
  recentErrors: number; // Last 24 hours
  topErrors: Array<{
    message: string;
    count: number;
  }>;
}

export interface CleanupQuery {
  olderThan: number; // Number of days
}

// ============================================================================
// Activity Log Types
// ============================================================================

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
  device_info?: {
    browser?: string;
    os?: string;
    device?: string;
    isMobile?: boolean;
    isDesktop?: boolean;
    isTablet?: boolean;
  };
  location_info?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ActivityLogsQuery {
  page?: number;
  limit?: number;
  user_id?: string; // Admin only: Filter by user ID
  action?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  from_date?: string; // YYYY-MM-DD format
  to_date?: string; // YYYY-MM-DD format
  search?: string; // Search in description or user email
}

export interface ActivityStats {
  total_activities: number;
  activities_by_action: Record<string, number>;
  activities_by_severity: {
    info: number;
    warning: number;
    error: number;
    critical: number;
  };
  recent_activities_count: {
    today: number;
    this_week: number;
    this_month: number;
  };
  unique_devices: number;
  unique_locations: number;
  last_activity?: string; // ISO timestamp
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ErrorLogResponse {
  success: true;
  data: ErrorLog;
  message: string;
}

export interface ErrorLogsListResponse {
  success: true;
  data: ErrorLog[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
  message: string;
}

export interface ErrorStatsResponse {
  success: true;
  data: ErrorStats;
  message: string;
}

export interface CleanupResponse {
  success: true;
  data: {
    deletedCount: number;
  };
  message: string;
}

export interface ActivityLogResponse {
  success: true;
  data: ActivityLog;
}

export interface ActivityLogsListResponse {
  success: true;
  data: {
    activities: ActivityLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ActivityStatsResponse {
  success: true;
  data: ActivityStats;
}

// ============================================================================
// Service State Types
// ============================================================================

export interface MonitoringState {
  systemMetrics: SystemMetrics | null;
  apiPerformance: APIPerformance | null;
  databaseStats: DatabaseStats | null;
  redisStats: RedisStats | null;
  activeSessions: ActiveSessions | null;
  requestMetrics: RequestMetrics | null;
  loading: boolean;
  error: string | null;
}

export interface ErrorLogsState {
  errorLogs: ErrorLog[];
  errorStats: ErrorStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  } | null;
}

export interface ActivityLogsState {
  activityLogs: ActivityLog[];
  activityStats: ActivityStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

// ============================================================================
// API Error Response Type
// ============================================================================

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
