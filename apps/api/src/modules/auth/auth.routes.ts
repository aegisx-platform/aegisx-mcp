import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  // ⚠️ IMPORTANT: ALL routes MUST have complete schema definition
  
  // POST /api/auth/register
  fastify.route({
    method: 'POST',
    url: '/api/auth/register',
    schema: {
      body: { $ref: 'registerRequest#' },
      response: {
        201: { $ref: 'registerResponse#' },
        400: { $ref: 'validationErrorResponse#' },
        409: { $ref: 'conflictResponse#' },
        500: { $ref: 'serverErrorResponse#' }
      }
    },
    handler: authController.register
  });

  // POST /api/auth/login
  fastify.route({
    method: 'POST',
    url: '/api/auth/login',
    schema: {
      body: { $ref: 'loginRequest#' },
      response: {
        200: { $ref: 'authResponse#' },
        401: { $ref: 'unauthorizedResponse#' },
        500: { $ref: 'serverErrorResponse#' }
      }
    },
    handler: authController.login
  });

  // POST /api/auth/refresh
  fastify.route({
    method: 'POST',
    url: '/api/auth/refresh',
    schema: {
      body: { $ref: 'refreshRequest#' },
      response: {
        200: { $ref: 'refreshResponse#' },
        401: { $ref: 'unauthorizedResponse#' },
        500: { $ref: 'serverErrorResponse#' }
      }
    },
    handler: authController.refresh
  });

  // POST /api/auth/logout
  fastify.route({
    method: 'POST',
    url: '/api/auth/logout',
    schema: {
      response: {
        200: { $ref: 'logoutResponse#' },
        500: { $ref: 'serverErrorResponse#' }
      }
    },
    handler: authController.logout
  });

  // GET /api/auth/me
  fastify.route({
    method: 'GET',
    url: '/api/auth/me',
    schema: {
      response: {
        200: { $ref: 'profileResponse#' },
        401: { $ref: 'unauthorizedResponse#' },
        500: { $ref: 'serverErrorResponse#' }
      }
    },
    preHandler: fastify.auth([fastify.verifyJWT]),
    handler: authController.me
  });
}