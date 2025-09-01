// JWT Payload type definition
export interface JWTPayload {
  id: string;
  email: string;
  roles: string[];
}

// Extend Fastify JWT module
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}