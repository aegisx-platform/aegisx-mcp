import { Knex } from 'knex';

export class DatabaseHelper {
  constructor(private db: Knex) {}

  /**
   * Clean all test data from database
   */
  async cleanup(): Promise<void> {
    // Order matters due to foreign key constraints
    const tables = [
      'user_sessions',
      'user_preferences',
      'role_permissions',
      'navigation_items',
      'audit_logs',
      'notifications',
      'users',
      'roles',
      'permissions',
    ];

    for (const table of tables) {
      await this.db(table).del();
    }

    await this.resetSequences();
  }

  /**
   * Reset all sequences to start from 1
   */
  async resetSequences(): Promise<void> {
    const sequences = await this.db.raw(`
      SELECT sequence_name FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);

    for (const seq of sequences.rows) {
      await this.db.raw(`ALTER SEQUENCE ${seq.sequence_name} RESTART WITH 1`);
    }
  }

  /**
   * Truncate specific tables
   */
  async truncateTables(tableNames: string[]): Promise<void> {
    if (tableNames.length === 0) return;

    await this.db.raw(
      `TRUNCATE TABLE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`,
    );
  }

  /**
   * Check if database is connected and healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.db.raw('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Run migrations
   */
  async migrate(): Promise<void> {
    await this.db.migrate.latest();
  }

  /**
   * Rollback migrations
   */
  async rollback(): Promise<void> {
    await this.db.migrate.rollback();
  }

  /**
   * Run seeds
   */
  async seed(): Promise<void> {
    await this.db.seed.run();
  }

  /**
   * Get table record count
   */
  async getTableCount(tableName: string): Promise<number> {
    const result = await this.db(tableName).count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  /**
   * Insert test data and return inserted records
   */
  async insertTestData<T>(tableName: string, data: Partial<T>[]): Promise<T[]> {
    if (data.length === 0) return [];
    return await this.db(tableName).insert(data).returning('*');
  }

  /**
   * Create transaction for test isolation
   */
  async transaction<T>(
    callback: (trx: Knex.Transaction) => Promise<T>,
  ): Promise<T> {
    return await this.db.transaction(callback);
  }

  /**
   * Check if table exists
   */
  async hasTable(tableName: string): Promise<boolean> {
    return await this.db.schema.hasTable(tableName);
  }

  /**
   * Get table schema information
   */
  async getTableInfo(tableName: string): Promise<Record<string, any>> {
    return await this.db(tableName).columnInfo();
  }

  /**
   * Execute raw SQL query
   */
  async raw(sql: string, bindings?: any[]): Promise<any> {
    return await this.db.raw(sql, bindings);
  }

  /**
   * Start a database transaction for test isolation
   */
  async startTransaction(): Promise<Knex.Transaction> {
    return await this.db.transaction();
  }

  /**
   * Commit transaction
   */
  async commitTransaction(trx: Knex.Transaction): Promise<void> {
    await trx.commit();
  }

  /**
   * Rollback transaction
   */
  async rollbackTransaction(trx: Knex.Transaction): Promise<void> {
    await trx.rollback();
  }

  /**
   * Check foreign key constraints
   */
  async checkConstraints(): Promise<any[]> {
    return await this.db.raw(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY'
    `);
  }

  /**
   * Disable foreign key checks (useful for testing)
   */
  async disableForeignKeyChecks(): Promise<void> {
    await this.db.raw('SET session_replication_role = replica;');
  }

  /**
   * Enable foreign key checks
   */
  async enableForeignKeyChecks(): Promise<void> {
    await this.db.raw('SET session_replication_role = DEFAULT;');
  }

  /**
   * Wait for database to be ready (with retry logic)
   */
  async waitForDatabase(
    maxAttempts = 30,
    delayMs = 1000,
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const isHealthy = await this.healthCheck();
        if (isHealthy) {
          return;
        }
      } catch (error) {
        console.log(
          `Database connection attempt ${attempt}/${maxAttempts} failed`,
        );
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error(`Database not ready after ${maxAttempts} attempts`);
  }

  /**
   * Get database statistics for debugging
   */
  async getDatabaseStats(): Promise<any> {
    const tables = await this.db.raw(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'knex_%'
    `);

    const stats: any = {};
    for (const table of tables.rows) {
      stats[table.tablename] = await this.getTableCount(table.tablename);
    }

    return stats;
  }

  /**
   * Create database backup/snapshot for testing
   */
  async createSnapshot(snapshotName: string): Promise<void> {
    // This is a simplified version - in production you might use pg_dump
    console.log(`Creating snapshot: ${snapshotName}`);
    // Implementation would depend on your specific needs
  }

  /**
   * Restore database from snapshot
   */
  async restoreSnapshot(snapshotName: string): Promise<void> {
    // This is a simplified version - in production you might use pg_restore
    console.log(`Restoring snapshot: ${snapshotName}`);
    // Implementation would depend on your specific needs
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.db.destroy();
  }
}
