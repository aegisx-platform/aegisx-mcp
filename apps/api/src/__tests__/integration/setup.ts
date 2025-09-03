import { FastifyInstance } from 'fastify';
import knex, { Knex } from 'knex';
import * as dotenv from 'dotenv';
import { build } from '../../test-helpers/app-helper';
import { TestUserFactory, TestDataFactory } from './factories';

// Load test environment
dotenv.config({ path: '.env.test' });

interface TestDatabase {
  connection: Knex;
  migrate: () => Promise<void>;
  seed: () => Promise<void>;
  cleanup: () => Promise<void>;
  resetSequences: () => Promise<void>;
}

interface TestContext {
  app: FastifyInstance;
  db: TestDatabase;
  factories: {
    user: TestUserFactory;
    data: TestDataFactory;
  };
  cleanup: () => Promise<void>;
}

// Test database configuration
const testDbConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.TEST_DB_HOST || process.env.DATABASE_HOST || 'localhost',
    port: parseInt(
      process.env.TEST_DB_PORT || process.env.DATABASE_PORT || '5432',
    ),
    database: process.env.TEST_DB_NAME || 'aegisx_test',
    user: process.env.TEST_DB_USER || process.env.DATABASE_USER || 'postgres',
    password:
      process.env.TEST_DB_PASSWORD ||
      process.env.DATABASE_PASSWORD ||
      'postgres',
  },
  pool: {
    min: 1,
    max: 5,
  },
  migrations: {
    directory: './apps/api/src/database/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './apps/api/src/database/seeds',
    extension: 'ts',
  },
};

/**
 * Create test database utilities
 */
async function createTestDatabase(): Promise<TestDatabase> {
  const connection = knex(testDbConfig);

  const migrate = async () => {
    await connection.migrate.latest();
  };

  const seed = async () => {
    await connection.seed.run();
  };

  const cleanup = async () => {
    // Truncate all tables except migrations
    const tables = await connection.raw(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'knex_%'
    `);

    if (tables.rows.length > 0) {
      const tableNames = tables.rows.map((row: any) => row.tablename);
      await connection.raw(
        `TRUNCATE TABLE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`,
      );
    }
  };

  const resetSequences = async () => {
    // Reset all sequences to start from 1
    const sequences = await connection.raw(`
      SELECT sequence_name FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);

    for (const seq of sequences.rows) {
      await connection.raw(
        `ALTER SEQUENCE ${seq.sequence_name} RESTART WITH 1`,
      );
    }
  };

  return {
    connection,
    migrate,
    seed,
    cleanup,
    resetSequences,
  };
}

/**
 * Setup test context with full application and database
 */
export async function setupTestContext(
  options: {
    runMigrations?: boolean;
    runSeeds?: boolean;
    cleanDatabase?: boolean;
  } = {},
): Promise<TestContext> {
  const {
    runMigrations = true,
    runSeeds = true,
    cleanDatabase = true,
  } = options;

  // Create test database
  const db = await createTestDatabase();

  // Setup database
  if (cleanDatabase) {
    await db.cleanup();
    await db.resetSequences();
  }

  if (runMigrations) {
    await db.migrate();
  }

  if (runSeeds) {
    await db.seed();
  }

  // Build Fastify app with test configuration
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = testDbConfig.connection.database;
  process.env.DATABASE_NAME = testDbConfig.connection.database;

  const app = await build({
    logger: false,
  });

  // Create factories
  const factories = {
    user: new TestUserFactory(db.connection),
    data: new TestDataFactory(db.connection),
  };

  const cleanup = async () => {
    await app.close();
    await db.connection.destroy();
  };

  return {
    app,
    db,
    factories,
    cleanup,
  };
}

/**
 * Global test setup - run once before all tests
 */
export async function globalSetup(): Promise<void> {
  // Ensure test database exists
  const adminDb = knex({
    client: 'postgresql',
    connection: {
      host: testDbConfig.connection.host,
      port: testDbConfig.connection.port,
      user: testDbConfig.connection.user,
      password: testDbConfig.connection.password,
      database: 'postgres', // Connect to default database
    },
  });

  try {
    // Create test database if it doesn't exist
    const dbExists = await adminDb.raw(
      'SELECT 1 FROM pg_database WHERE datname = ?',
      [testDbConfig.connection.database],
    );

    if (dbExists.rows.length === 0) {
      await adminDb.raw(`CREATE DATABASE ${testDbConfig.connection.database}`);
      console.log(`Created test database: ${testDbConfig.connection.database}`);
    }
  } catch (error) {
    console.warn('Could not create test database:', error);
  } finally {
    await adminDb.destroy();
  }
}

/**
 * Global test teardown - run once after all tests
 */
export async function globalTeardown(): Promise<void> {
  // Optionally drop test database
  if (process.env.DROP_TEST_DB === 'true') {
    const adminDb = knex({
      client: 'postgresql',
      connection: {
        host: testDbConfig.connection.host,
        port: testDbConfig.connection.port,
        user: testDbConfig.connection.user,
        password: testDbConfig.connection.password,
        database: 'postgres',
      },
    });

    try {
      await adminDb.raw(
        `DROP DATABASE IF EXISTS ${testDbConfig.connection.database}`,
      );
      console.log(`Dropped test database: ${testDbConfig.connection.database}`);
    } catch (error) {
      console.warn('Could not drop test database:', error);
    } finally {
      await adminDb.destroy();
    }
  }
}
