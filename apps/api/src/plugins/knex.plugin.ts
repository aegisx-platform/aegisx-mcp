import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import knex, { Knex } from 'knex';

async function knexPlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  const db = knex({
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'aegisx_db'
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10')
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './database/seeds'
    }
  });

  // Test the connection
  try {
    await db.raw('SELECT 1');
    fastify.log.info('Database connected successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Database connection failed');
    throw error;
  }

  // Decorate fastify with knex instance
  fastify.decorate('knex', db);
  fastify.decorate('db', db); // Alias for convenience
  
  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await db.destroy();
  });
}

export default fp(knexPlugin, {
  name: 'knex-plugin'
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    knex: Knex;
    db: Knex;
  }
}