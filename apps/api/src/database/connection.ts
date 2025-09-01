import knex from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
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
};

export const db = knex(config);