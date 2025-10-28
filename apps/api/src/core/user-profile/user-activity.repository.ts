import Knex from 'knex';
import { 
  ActivityLog, 
  CreateActivityLog, 
  GetActivityLogsQuery, 
  ActivitySession,
  ActivityStats
} from './user-activity.schemas';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class UserActivityRepository {
  constructor(private knex: any) {}

  /**
   * Create a new activity log entry
   */
  async createActivityLog(
    userId: string, 
    activityData: CreateActivityLog,
    requestInfo?: {
      ip_address?: string;
      user_agent?: string;
      session_id?: string;
      request_id?: string;
      device_info?: Record<string, any>;
      location_info?: Record<string, any>;
    }
  ): Promise<ActivityLog> {
    const [activity] = await this.knex('user_activity_logs')
      .insert({
        user_id: userId,
        action: activityData.action,
        description: activityData.description,
        severity: activityData.severity || 'info',
        ip_address: requestInfo?.ip_address,
        user_agent: requestInfo?.user_agent,
        session_id: requestInfo?.session_id,
        request_id: requestInfo?.request_id,
        device_info: requestInfo?.device_info ? JSON.stringify(requestInfo.device_info) : null,
        location_info: requestInfo?.location_info ? JSON.stringify(requestInfo.location_info) : null,
        metadata: activityData.metadata ? JSON.stringify(activityData.metadata) : null,
        created_at: this.knex.fn.now()
      })
      .returning('*');

    return this.transformActivityLog(activity);
  }

  /**
   * Get user's activity logs with pagination and filtering
   */
  async getUserActivities(
    userId: string, 
    query: GetActivityLogsQuery = {}
  ): Promise<PaginationResult<ActivityLog>> {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      severity, 
      from_date, 
      to_date, 
      search 
    } = query;
    
    const offset = (page - 1) * limit;
    
    let baseQuery = this.knex('user_activity_logs')
      .where('user_id', userId);
    
    // Apply filters
    if (action) {
      baseQuery = baseQuery.where('action', action);
    }
    
    if (severity) {
      baseQuery = baseQuery.where('severity', severity);
    }
    
    if (from_date) {
      baseQuery = baseQuery.where('created_at', '>=', from_date);
    }
    
    if (to_date) {
      baseQuery = baseQuery.where('created_at', '<=', `${to_date} 23:59:59`);
    }
    
    if (search) {
      baseQuery = baseQuery.where('description', 'ilike', `%${search}%`);
    }
    
    // Get total count
    const countResult = await baseQuery.clone().count('id as count').first();
    const total = parseInt(countResult?.count as string) || 0;
    
    // Get paginated data
    const activities = await baseQuery
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .select('*');
    
    const pages = Math.ceil(total / limit);
    
    return {
      data: activities.map(this.transformActivityLog),
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get user's activity sessions (grouped by session_id)
   */
  async getUserActivitySessions(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResult<ActivitySession>> {
    const offset = (page - 1) * limit;
    
    // Get sessions with aggregated data
    const sessionsQuery = this.knex('user_activity_logs')
      .where('user_id', userId)
      .whereNotNull('session_id')
      .groupBy('session_id', 'ip_address', 'device_info', 'location_info')
      .select([
        'session_id',
        this.knex.raw('MIN(created_at) as start_time'),
        this.knex.raw('MAX(created_at) as end_time'),
        'ip_address',
        'device_info',
        'location_info',
        this.knex.raw('COUNT(*) as activities_count'),
        this.knex.raw(`
          CASE 
            WHEN MAX(created_at) > NOW() - INTERVAL '1 hour' 
            THEN true 
            ELSE false 
          END as is_active
        `)
      ])
      .orderBy('start_time', 'desc');
    
    // Get total count
    const countQuery = this.knex('user_activity_logs')
      .where('user_id', userId)
      .whereNotNull('session_id')
      .countDistinct('session_id as count')
      .first();
    
    const [sessions, countResult] = await Promise.all([
      sessionsQuery.limit(limit).offset(offset),
      countQuery
    ]);
    
    const total = parseInt(countResult?.count as string) || 0;
    const pages = Math.ceil(total / limit);
    
    return {
      data: sessions.map(session => ({
        session_id: session.session_id,
        start_time: session.start_time,
        end_time: session.end_time,
        ip_address: session.ip_address,
        device_info: session.device_info ? JSON.parse(session.device_info) : undefined,
        location_info: session.location_info ? JSON.parse(session.location_info) : undefined,
        activities_count: parseInt(session.activities_count),
        is_active: session.is_active
      })),
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get activity statistics for a user
   */
  async getUserActivityStats(userId: string): Promise<ActivityStats> {
    // Get total activities
    const totalResult = await this.knex('user_activity_logs')
      .where('user_id', userId)
      .count('id as count')
      .first();
    
    const total_activities = parseInt(totalResult?.count as string) || 0;
    
    // Get activities by action
    const actionStats = await this.knex('user_activity_logs')
      .where('user_id', userId)
      .groupBy('action')
      .select('action', this.knex.raw('COUNT(*) as count'))
      .orderBy('count', 'desc');
    
    const activities_by_action: Record<string, number> = {};
    actionStats.forEach(stat => {
      activities_by_action[stat.action] = parseInt(stat.count);
    });
    
    // Get activities by severity
    const severityStats = await this.knex('user_activity_logs')
      .where('user_id', userId)
      .groupBy('severity')
      .select('severity', this.knex.raw('COUNT(*) as count'));
    
    const activities_by_severity = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0
    };
    
    severityStats.forEach(stat => {
      activities_by_severity[stat.severity as keyof typeof activities_by_severity] = parseInt(stat.count);
    });
    
    // Get recent activities count
    const recentStats = await Promise.all([
      // Today
      this.knex('user_activity_logs')
        .where('user_id', userId)
        .where('created_at', '>=', this.knex.raw('CURRENT_DATE'))
        .count('id as count')
        .first(),
      // This week  
      this.knex('user_activity_logs')
        .where('user_id', userId)
        .where('created_at', '>=', this.knex.raw('DATE_TRUNC(\'week\', CURRENT_DATE)'))
        .count('id as count')
        .first(),
      // This month
      this.knex('user_activity_logs')
        .where('user_id', userId)
        .where('created_at', '>=', this.knex.raw('DATE_TRUNC(\'month\', CURRENT_DATE)'))
        .count('id as count')
        .first()
    ]);
    
    const recent_activities_count = {
      today: parseInt(recentStats[0]?.count as string) || 0,
      this_week: parseInt(recentStats[1]?.count as string) || 0,
      this_month: parseInt(recentStats[2]?.count as string) || 0
    };
    
    // Get unique devices and locations
    const uniqueStats = await Promise.all([
      this.knex('user_activity_logs')
        .where('user_id', userId)
        .whereNotNull('device_info')
        .countDistinct('device_info as count')
        .first(),
      this.knex('user_activity_logs')
        .where('user_id', userId)
        .whereNotNull('location_info')
        .countDistinct('location_info as count')
        .first()
    ]);
    
    const unique_devices = parseInt(uniqueStats[0]?.count as string) || 0;
    const unique_locations = parseInt(uniqueStats[1]?.count as string) || 0;
    
    // Get last activity
    const lastActivityResult = await this.knex('user_activity_logs')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .select('created_at')
      .first();
    
    return {
      total_activities,
      activities_by_action,
      activities_by_severity,
      recent_activities_count,
      unique_devices,
      unique_locations,
      last_activity: lastActivityResult?.created_at || undefined
    };
  }

  /**
   * Delete old activity logs (cleanup)
   */
  async cleanupOldActivities(retentionDays: number = 730): Promise<number> {
    const result = await this.knex('user_activity_logs')
      .where('created_at', '<', this.knex.raw(`NOW() - INTERVAL '${retentionDays} days'`))
      .del();
    
    return result;
  }

  /**
   * Transform database row to ActivityLog schema
   */
  private transformActivityLog(row: any): ActivityLog {
    return {
      id: row.id,
      user_id: row.user_id,
      action: row.action,
      description: row.description,
      severity: row.severity,
      ip_address: row.ip_address || undefined,
      user_agent: row.user_agent || undefined,
      session_id: row.session_id || undefined,
      request_id: row.request_id || undefined,
      device_info: row.device_info ? (typeof row.device_info === 'string' ? JSON.parse(row.device_info) : row.device_info) : undefined,
      location_info: row.location_info ? (typeof row.location_info === 'string' ? JSON.parse(row.location_info) : row.location_info) : undefined,
      metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : undefined,
      created_at: row.created_at
    };
  }
}