import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'aegisx_db',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './apps/api/src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './apps/api/src/database/seeds',
      extension: 'ts',
    },
  },
  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'aegisx_test',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
    },
    migrations: {
      directory: './apps/api/src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './apps/api/src/database/seeds',
      extension: 'ts',
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST,
      port: parseInt(
        process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432',
      ),
      database: process.env.POSTGRES_DB || process.env.DATABASE_NAME,
      user: process.env.POSTGRES_USER || process.env.DATABASE_USER,
      password: process.env.POSTGRES_PASSWORD || process.env.DATABASE_PASSWORD,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    },
    pool: {
      min: 5,
      max: 20,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      createRetryIntervalMillis: 200,
    },
    migrations: {
      directory: './apps/api/src/database/migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
      schemaName: 'public',
    },
    acquireConnectionTimeout: 30000,
    asyncStackTraces: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
  },
};

export default config;
