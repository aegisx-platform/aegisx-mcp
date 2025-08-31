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
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './apps/api/src/database/migrations',
      extension: 'ts',
    },
  },
};

export default config;