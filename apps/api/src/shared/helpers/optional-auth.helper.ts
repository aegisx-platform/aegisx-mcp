import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

/**
 * Optional authentication helper
 * Attempts to authenticate the user if Authorization header or token query parameter is present,
 * but doesn't fail the request if authentication fails or no token is provided.
 * This allows public files to be accessed without authentication,
 * while private files require valid authentication.
 *
 * Supports two authentication methods:
 * 1. Bearer token in Authorization header (standard JWT auth)
 * 2. Token query parameter (for signed URLs)
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  reply: FastifyReply,
  fastify: FastifyInstance,
): Promise<void> {
  try {
    // Method 1: Check if Authorization header exists
    if (request.headers.authorization) {
      // Attempt authentication if token is present
      await fastify.authenticate(request, reply);
      // If successful, request.user will be set
      return;
    }

    // Method 2: Check for token in query parameters (for signed URLs)
    const tokenFromQuery = (request.query as any)?.token;
    if (tokenFromQuery) {
      // For signed URLs, we validate the token differently
      // Store the token for later validation in the route handlers
      (request as any).signedUrlToken = tokenFromQuery;
      request.log.debug('Found signed URL token in query parameters');
      return;
    }

    // If no Authorization header or token query param, continue as anonymous user
  } catch (error) {
    // If authentication fails (invalid/expired token), continue as anonymous user
    // This allows public files to be accessed even with invalid tokens
    request.user = undefined;

    // Log authentication failure for debugging (but don't fail the request)
    request.log.debug(
      { error },
      'Optional authentication failed, continuing as anonymous user',
    );
  }
}

/**
 * Create a preHandler for optional authentication
 * Usage: preHandler: createOptionalAuthHandler(fastify)
 */
export function createOptionalAuthHandler(fastify: FastifyInstance) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await optionalAuthenticate(request, reply, fastify);
  };
}
