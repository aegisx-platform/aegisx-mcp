/**
 * Session Tracker Service - Tracks active user sessions with Redis
 *
 * Features:
 * - Auto-expire sessions with TTL (30 minutes default)
 * - Track user activity timestamp
 * - Count active sessions and unique users
 * - Non-blocking Redis operations
 *
 * Redis Structure:
 * Key: "session:{userId}"
 * Value: JSON { sessionId, lastActivity, userEmail }
 * TTL: 1800 seconds (30 minutes)
 */

import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';

// Types for session tracking
export interface SessionData {
  userId: string;
  sessionId?: string;
  lastActivity: string;
  userEmail?: string;
}

export interface ActiveSessionsResponse {
  total: number;
  users: number;
  sessions: Array<{
    userId: string;
    lastActivity: string;
  }>;
  timestamp: string;
}

/**
 * Session Tracker Service
 * Uses Redis to track active user sessions
 */
export class SessionTrackerService {
  private redis: Redis;
  private readonly SESSION_TTL = 1800; // 30 minutes in seconds
  private readonly KEY_PREFIX = 'session:';

  constructor(redis: Redis) {
    this.redis = redis;
  }

  /**
   * Update user activity (called on every authenticated request)
   * NON-BLOCKING: Uses Redis fire-and-forget
   */
  updateActivity(userId: string, email?: string, sessionId?: string): void {
    const key = `${this.KEY_PREFIX}${userId}`;
    const data: SessionData = {
      userId,
      lastActivity: new Date().toISOString(),
      userEmail: email,
      sessionId: sessionId || `${userId}-${Date.now()}`,
    };

    // Fire-and-forget: Don't await (non-blocking)
    this.redis
      .setex(key, this.SESSION_TTL, JSON.stringify(data))
      .catch((error) => {
        console.error('Failed to update session activity:', error);
      });
  }

  /**
   * Get all active sessions
   * Returns sessions that haven't expired yet
   */
  async getActiveSessions(): Promise<ActiveSessionsResponse> {
    try {
      // Get all session keys (pattern match)
      const keys = await this.redis.keys(`${this.KEY_PREFIX}*`);

      if (keys.length === 0) {
        return {
          total: 0,
          users: 0,
          sessions: [],
          timestamp: new Date().toISOString(),
        };
      }

      // Get all session data in parallel
      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();

      // Parse session data
      const sessions: SessionData[] = [];
      const uniqueUsers = new Set<string>();

      if (results) {
        for (const [error, data] of results) {
          if (!error && data) {
            try {
              const session: SessionData = JSON.parse(data as string);
              sessions.push(session);
              uniqueUsers.add(session.userId);
            } catch (parseError) {
              // Skip invalid JSON
              console.error('Failed to parse session data:', parseError);
            }
          }
        }
      }

      // Sort by last activity (most recent first)
      sessions.sort((a, b) => {
        return (
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime()
        );
      });

      // Limit to 100 most recent sessions
      const recentSessions = sessions.slice(0, 100);

      return {
        total: sessions.length,
        users: uniqueUsers.size,
        sessions: recentSessions.map((s) => ({
          userId: s.userId,
          lastActivity: s.lastActivity,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      return {
        total: 0,
        users: 0,
        sessions: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get session count (faster than getActiveSessions if you only need count)
   */
  async getSessionCount(): Promise<{ total: number; users: number }> {
    try {
      const keys = await this.redis.keys(`${this.KEY_PREFIX}*`);

      if (keys.length === 0) {
        return { total: 0, users: 0 };
      }

      // Get unique user count
      const userIds = keys.map((key) => key.replace(this.KEY_PREFIX, ''));
      const uniqueUsers = new Set(userIds);

      return {
        total: keys.length,
        users: uniqueUsers.size,
      };
    } catch (error) {
      console.error('Failed to get session count:', error);
      return { total: 0, users: 0 };
    }
  }

  /**
   * Remove expired sessions manually (optional - Redis auto-expires with TTL)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const keys = await this.redis.keys(`${this.KEY_PREFIX}*`);
      let deleted = 0;

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (!data) {
          continue;
        }

        try {
          const session: SessionData = JSON.parse(data);
          const lastActivity = new Date(session.lastActivity);
          const now = new Date();
          const minutesSinceActivity =
            (now.getTime() - lastActivity.getTime()) / 1000 / 60;

          // Delete if inactive for more than 30 minutes
          if (minutesSinceActivity > 30) {
            await this.redis.del(key);
            deleted++;
          }
        } catch (parseError) {
          // Delete invalid session data
          await this.redis.del(key);
          deleted++;
        }
      }

      return deleted;
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return 0;
    }
  }

  /**
   * Check if user has active session
   */
  async hasActiveSession(userId: string): Promise<boolean> {
    try {
      const key = `${this.KEY_PREFIX}${userId}`;
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Failed to check active session:', error);
      return false;
    }
  }

  /**
   * Remove user session (logout)
   */
  async removeSession(userId: string): Promise<void> {
    try {
      const key = `${this.KEY_PREFIX}${userId}`;
      await this.redis.del(key);
    } catch (error) {
      console.error('Failed to remove session:', error);
    }
  }
}

/**
 * Create session tracker service from Fastify instance
 */
export function createSessionTracker(
  fastify: FastifyInstance,
): SessionTrackerService {
  if (!fastify.redis) {
    throw new Error(
      'Redis plugin not initialized. Register Redis plugin first.',
    );
  }

  return new SessionTrackerService(fastify.redis);
}
