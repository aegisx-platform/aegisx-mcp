import { FastifyRequest } from 'fastify';
import { UserActivityRepository, PaginationResult } from './user-activity.repository';
import { 
  ActivityLog, 
  CreateActivityLog, 
  GetActivityLogsQuery, 
  ActivitySession,
  ActivityStats,
  ACTIVITY_ACTIONS,
  ActivityAction
} from './user-activity.schemas';

// Device info parser (simple implementation)
interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  isMobile?: boolean;
  isDesktop?: boolean;
  isTablet?: boolean;
}

interface LocationInfo {
  country?: string;
  city?: string;
  timezone?: string;
}

export class UserActivityService {
  constructor(private repository: UserActivityRepository) {}

  /**
   * Log user activity with automatic request info extraction
   */
  async logActivity(
    userId: string,
    action: ActivityAction,
    description: string,
    request?: FastifyRequest,
    options?: {
      severity?: 'info' | 'warning' | 'error' | 'critical';
      metadata?: Record<string, any>;
    }
  ): Promise<ActivityLog> {
    const requestInfo = request ? this.extractRequestInfo(request) : undefined;
    
    const activityData: CreateActivityLog = {
      action,
      description,
      severity: options?.severity || 'info',
      metadata: options?.metadata
    };

    return this.repository.createActivityLog(userId, activityData, requestInfo);
  }

  /**
   * Log authentication events
   */
  async logLogin(userId: string, request: FastifyRequest, success: boolean = true): Promise<ActivityLog> {
    const action = success ? ACTIVITY_ACTIONS.LOGIN : ACTIVITY_ACTIONS.LOGIN_FAILED;
    const description = success 
      ? 'User successfully logged in' 
      : 'Failed login attempt';
    const severity = success ? 'info' : 'warning';

    return this.logActivity(userId, action, description, request, { 
      severity,
      metadata: { success, timestamp: new Date().toISOString() }
    });
  }

  async logLogout(userId: string, request: FastifyRequest): Promise<ActivityLog> {
    return this.logActivity(
      userId, 
      ACTIVITY_ACTIONS.LOGOUT, 
      'User logged out', 
      request,
      { metadata: { timestamp: new Date().toISOString() } }
    );
  }

  async logSessionCreated(userId: string, sessionId: string, request: FastifyRequest): Promise<ActivityLog> {
    return this.logActivity(
      userId,
      ACTIVITY_ACTIONS.SESSION_CREATED,
      'New session created',
      request,
      { 
        metadata: { 
          session_id: sessionId,
          timestamp: new Date().toISOString()
        }
      }
    );
  }

  /**
   * Log profile-related events
   */
  async logProfileUpdate(
    userId: string, 
    request: FastifyRequest, 
    fields: string[]
  ): Promise<ActivityLog> {
    return this.logActivity(
      userId,
      ACTIVITY_ACTIONS.PROFILE_UPDATE,
      `Profile updated: ${fields.join(', ')}`,
      request,
      { metadata: { fields_updated: fields } }
    );
  }

  async logPasswordChange(userId: string, request: FastifyRequest): Promise<ActivityLog> {
    return this.logActivity(
      userId,
      ACTIVITY_ACTIONS.PASSWORD_CHANGE,
      'Password changed successfully',
      request,
      { 
        severity: 'warning', // Password changes are security events
        metadata: { timestamp: new Date().toISOString() }
      }
    );
  }

  async logAvatarUpload(userId: string, request: FastifyRequest): Promise<ActivityLog> {
    return this.logActivity(
      userId,
      ACTIVITY_ACTIONS.AVATAR_UPLOAD,
      'Profile avatar uploaded',
      request,
      { metadata: { timestamp: new Date().toISOString() } }
    );
  }

  /**
   * Log preferences events
   */
  async logPreferencesUpdate(
    userId: string, 
    request: FastifyRequest, 
    preferences: string[]
  ): Promise<ActivityLog> {
    return this.logActivity(
      userId,
      ACTIVITY_ACTIONS.PREFERENCES_UPDATE,
      `Preferences updated: ${preferences.join(', ')}`,
      request,
      { metadata: { preferences_updated: preferences } }
    );
  }

  async logThemeChange(userId: string, newTheme: string, request: FastifyRequest): Promise<ActivityLog> {
    return this.logActivity(
      userId,
      ACTIVITY_ACTIONS.THEME_CHANGE,
      `Theme changed to ${newTheme}`,
      request,
      { metadata: { new_theme: newTheme } }
    );
  }

  /**
   * Log security events
   */
  async logSuspiciousActivity(
    userId: string, 
    reason: string, 
    request: FastifyRequest
  ): Promise<ActivityLog> {
    return this.logActivity(
      userId,
      ACTIVITY_ACTIONS.SUSPICIOUS_ACTIVITY,
      `Suspicious activity detected: ${reason}`,
      request,
      { 
        severity: 'critical',
        metadata: { 
          reason,
          timestamp: new Date().toISOString(),
          requires_review: true
        }
      }
    );
  }

  /**
   * Log API errors
   */
  async logApiError(
    userId: string, 
    error: Error, 
    request: FastifyRequest,
    endpoint?: string
  ): Promise<ActivityLog> {
    return this.logActivity(
      userId,
      ACTIVITY_ACTIONS.API_ERROR,
      `API error occurred: ${error.message}`,
      request,
      { 
        severity: 'error',
        metadata: { 
          error_message: error.message,
          endpoint: endpoint || request.method + ' ' + (request.url || ''),
          stack: error.stack
        }
      }
    );
  }

  /**
   * Get user's activity logs with filtering
   */
  async getUserActivities(
    userId: string, 
    query: GetActivityLogsQuery = {}
  ): Promise<PaginationResult<ActivityLog>> {
    return this.repository.getUserActivities(userId, query);
  }

  /**
   * Get user's activity sessions
   */
  async getUserActivitySessions(
    userId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginationResult<ActivitySession>> {
    return this.repository.getUserActivitySessions(userId, page, limit);
  }

  /**
   * Get user's activity statistics
   */
  async getUserActivityStats(userId: string): Promise<ActivityStats> {
    return this.repository.getUserActivityStats(userId);
  }

  /**
   * Extract request information for activity logging
   */
  private extractRequestInfo(request: FastifyRequest): {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    request_id?: string;
    device_info?: DeviceInfo;
    location_info?: LocationInfo;
  } {
    const ip_address = this.getClientIp(request);
    const user_agent = request.headers['user-agent'];
    const session_id = this.extractSessionId(request);
    const request_id = request.id;
    
    return {
      ip_address,
      user_agent,
      session_id,
      request_id,
      device_info: user_agent ? this.parseUserAgent(user_agent) : undefined,
      location_info: undefined // Would need IP geolocation service
    };
  }

  /**
   * Get client IP address considering proxies
   */
  private getClientIp(request: FastifyRequest): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded && typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    
    const realIp = request.headers['x-real-ip'];
    if (realIp && typeof realIp === 'string') {
      return realIp;
    }
    
    return request.ip;
  }

  /**
   * Extract session ID from request (from cookie or header)
   */
  private extractSessionId(request: FastifyRequest): string | undefined {
    // Try to get session ID from cookies
    const sessionCookie = request.cookies?.sessionId || request.cookies?.['session-id'];
    if (sessionCookie) {
      return sessionCookie;
    }
    
    // Try to get from Authorization header (JWT sessions)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // For JWT, we could decode and get a session identifier
      // For now, just return a hash of the token for privacy
      const token = authHeader.substring(7);
      return this.hashString(token).substring(0, 16);
    }
    
    return undefined;
  }

  /**
   * Simple user agent parsing (in production, use a library like ua-parser-js)
   */
  private parseUserAgent(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();
    
    const deviceInfo: DeviceInfo = {};
    
    // Browser detection
    if (ua.includes('chrome')) {
      deviceInfo.browser = 'Chrome';
    } else if (ua.includes('firefox')) {
      deviceInfo.browser = 'Firefox';
    } else if (ua.includes('safari')) {
      deviceInfo.browser = 'Safari';
    } else if (ua.includes('edge')) {
      deviceInfo.browser = 'Edge';
    }
    
    // OS detection
    if (ua.includes('windows')) {
      deviceInfo.os = 'Windows';
    } else if (ua.includes('mac')) {
      deviceInfo.os = 'macOS';
    } else if (ua.includes('linux')) {
      deviceInfo.os = 'Linux';
    } else if (ua.includes('android')) {
      deviceInfo.os = 'Android';
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      deviceInfo.os = 'iOS';
    }
    
    // Device type detection
    deviceInfo.isMobile = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone');
    deviceInfo.isTablet = ua.includes('tablet') || ua.includes('ipad');
    deviceInfo.isDesktop = !deviceInfo.isMobile && !deviceInfo.isTablet;
    
    if (deviceInfo.isMobile) {
      deviceInfo.device = 'Mobile';
    } else if (deviceInfo.isTablet) {
      deviceInfo.device = 'Tablet';
    } else {
      deviceInfo.device = 'Desktop';
    }
    
    return deviceInfo;
  }

  /**
   * Simple hash function for session ID generation
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}