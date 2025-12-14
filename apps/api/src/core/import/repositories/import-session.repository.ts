/**
 * Import Session Repository
 * Database persistence layer for import validation sessions
 *
 * Replaces in-memory Map storage with database-backed session management
 * Part of Fix #3: In-Memory Storage migration
 *
 * Features:
 * - Database-persistent session storage
 * - Automatic expiration handling
 * - Session validation (expired check)
 * - Cleanup of expired sessions
 */

import { Knex } from 'knex';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { v4 as uuidv4 } from 'uuid';

/**
 * Import session database record
 * Matches import_sessions table structure
 */
export interface ImportSession {
  session_id: string;
  module_name: string;
  file_name: string;
  file_size_bytes: number | null;
  file_type: string | null;
  validated_data: any; // JSONB
  validation_result: any; // JSONB
  can_proceed: boolean;
  created_at: Date;
  expires_at: Date;
  created_by: string;
}

/**
 * Data for creating a new session
 */
export interface CreateSessionData {
  module_name: string;
  file_name: string;
  file_size_bytes?: number;
  file_type?: string;
  validated_data: any;
  validation_result: any;
  can_proceed: boolean;
  created_by: string;
}

/**
 * Import Session Repository
 * Manages database operations for import validation sessions
 */
export class ImportSessionRepository extends BaseRepository<ImportSession> {
  constructor(db: Knex) {
    super(db, 'import_sessions', [], [], {
      hasCreatedAt: true,
      hasUpdatedAt: false,
      hasCreatedBy: true,
    });
  }

  // Override base methods not needed for this repository
  transformToEntity?(dbRow: any): ImportSession {
    return dbRow;
  }

  transformToDb?(dto: any): any {
    return dto;
  }

  getJoinQuery?(): any {
    return this.knex(this.tableName);
  }

  /**
   * Create a new import session
   * Auto-generates session ID and sets 30-minute expiration
   *
   * @param data - Session data (without session_id, created_at, expires_at)
   * @returns Created session record
   */
  async createSession(data: CreateSessionData): Promise<ImportSession> {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    const sessionData = {
      session_id: sessionId,
      module_name: data.module_name,
      file_name: data.file_name,
      file_size_bytes: data.file_size_bytes || null,
      file_type: data.file_type || null,
      // JSON/JSONB columns require serialized strings in PostgreSQL
      validated_data: JSON.stringify(data.validated_data),
      validation_result: JSON.stringify(data.validation_result),
      can_proceed: data.can_proceed,
      created_at: now,
      expires_at: expiresAt,
      created_by: data.created_by,
    };

    const [session] = await this.knex(this.tableName)
      .insert(sessionData)
      .returning('*');

    return session;
  }

  /**
   * Get a session by ID only if it's still valid (not expired)
   *
   * @param sessionId - Session ID to retrieve
   * @returns Session record if found and not expired, null otherwise
   */
  async getValidSession(sessionId: string): Promise<ImportSession | null> {
    const session = await this.knex(this.tableName)
      .where({ session_id: sessionId })
      .where('expires_at', '>', new Date())
      .first<ImportSession>();

    return session || null;
  }

  /**
   * Delete expired sessions from database
   * Returns number of deleted sessions
   *
   * @returns Number of sessions deleted
   */
  async deleteExpiredSessions(): Promise<number> {
    const deletedCount = await this.knex(this.tableName)
      .where('expires_at', '<', new Date())
      .delete();

    return deletedCount;
  }

  /**
   * Delete a specific session by ID
   * Used after import execution to clean up used session
   *
   * @param sessionId - Session ID to delete
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.knex(this.tableName).where({ session_id: sessionId }).delete();
  }

  /**
   * Get all sessions for a specific user
   * Useful for debugging and admin views
   *
   * @param userId - User ID
   * @param limit - Maximum number of sessions to return
   * @returns Array of sessions
   */
  async getSessionsByUser(
    userId: string,
    limit: number = 10,
  ): Promise<ImportSession[]> {
    return this.knex(this.tableName)
      .where({ created_by: userId })
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  /**
   * Get all sessions for a specific module
   * Useful for monitoring and analytics
   *
   * @param moduleName - Module name
   * @param limit - Maximum number of sessions to return
   * @returns Array of sessions
   */
  async getSessionsByModule(
    moduleName: string,
    limit: number = 10,
  ): Promise<ImportSession[]> {
    return this.knex(this.tableName)
      .where({ module_name: moduleName })
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  /**
   * Check if a session exists and is valid
   *
   * @param sessionId - Session ID to check
   * @returns true if session exists and not expired
   */
  async isSessionValid(sessionId: string): Promise<boolean> {
    const count = await this.knex(this.tableName)
      .where({ session_id: sessionId })
      .where('expires_at', '>', new Date())
      .count('* as count')
      .first();

    return (count?.count as number) > 0;
  }

  /**
   * Get count of active (non-expired) sessions
   *
   * @returns Number of active sessions
   */
  async getActiveSessionCount(): Promise<number> {
    const result = await this.knex(this.tableName)
      .where('expires_at', '>', new Date())
      .count('* as count')
      .first();

    return (result?.count as number) || 0;
  }

  /**
   * Get count of expired sessions ready for cleanup
   *
   * @returns Number of expired sessions
   */
  async getExpiredSessionCount(): Promise<number> {
    const result = await this.knex(this.tableName)
      .where('expires_at', '<=', new Date())
      .count('* as count')
      .first();

    return (result?.count as number) || 0;
  }
}
