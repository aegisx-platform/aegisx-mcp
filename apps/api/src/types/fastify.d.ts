import '@fastify/jwt';
import { Knex } from 'knex';
import { Redis } from 'ioredis';
import { JWTPayload } from './jwt.types';

declare module 'fastify' {
  interface FastifyInstance {
    knex: Knex;
    redis?: Redis;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}