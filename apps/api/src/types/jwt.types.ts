// JWT Payload type definition
export interface JWTPayload {
  // Standard JWT claims
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  
  // User claims
  id: string;
  email: string;
  role: string;
  
  // Custom claims
  permissions?: string[];
  sessionId?: string;
  fingerprint?: string;
  v?: number;
}