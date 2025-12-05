import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

// Load .env first (base configuration)
dotenv.config();

// Load environment-specific configuration for development only
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local', override: true });
}

/**
 * Knex configuration for Inventory System
 * Uses separate schema 'inventory' to isolate from system tables in 'public'
 */
const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host:
        process.env.DATABASE_HOST || process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(
        process.env.DATABASE_PORT || process.env.POSTGRES_PORT || '5432',
      ),
      database:
        process.env.DATABASE_NAME || process.env.POSTGRES_DB || 'aegisx_db',
      user:
        process.env.DATABASE_USER || process.env.POSTGRES_USER || 'postgres',
      password:
        process.env.DATABASE_PASSWORD ||
        process.env.POSTGRES_PASSWORD ||
        'postgres',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './apps/api/src/database/migrations-inventory',
      tableName: 'knex_migrations_inventory',
      schemaName: 'inventory',
      extension: 'ts',
    },
    seeds: {
      directory: './apps/api/src/database/seeds-inventory',
      extension: 'ts',
    },
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host:
        process.env.DATABASE_HOST || process.env.POSTGRES_HOST || 'postgres',
      port: parseInt(
        process.env.DATABASE_PORT || process.env.POSTGRES_PORT || '5432',
      ),
      database:
        process.env.DATABASE_NAME || process.env.POSTGRES_DB || 'aegisx_db',
      user:
        process.env.DATABASE_USER || process.env.POSTGRES_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || process.env.POSTGRES_PASSWORD,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    },
    pool: {
      min: 5,
      max: 20,
    },
    migrations: {
      directory: './apps/api/src/database/migrations-inventory',
      tableName: 'knex_migrations_inventory',
      schemaName: 'inventory',
      extension: 'ts',
    },
  },
};

export default config;
