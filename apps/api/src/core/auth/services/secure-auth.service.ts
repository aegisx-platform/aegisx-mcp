import { FastifyInstance, FastifyRequest } from 'fastify';
import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from '../auth.repository';

export interface SecureTokenPayload {
  sub: string; // User ID
  email: string;
  role: string;
  permissions?: string[];
  sessionId: string;
  jti: string; // JWT ID
  fingerprint?: string;
  v: number; // Token version
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  fingerprint: string;
  csrfToken: string;
}

export class SecureAuthService {
  private readonly TOKEN_VERSION = 1;
  private readonly FINGERPRINT_COOKIE = '__Secure-Fgp';
  private readonly CSRF_COOKIE = '__Host-csrf';
  private readonly BLACKLIST_PREFIX = 'revoked:jwt:';
  private readonly SESSION_PREFIX = 'auth:session:';
  private authRepository: AuthRepository;

  constructor(private readonly app: FastifyInstance) {
    this.authRepository = new AuthRepository(app.knex);
  }

  /**
   * Generate secure token pair with enhanced security features
   */
  async generateSecureTokens(
    user: any,
    request: FastifyRequest,
  ): Promise<TokenPair> {
    // Generate security tokens
    const jti = this.generateJTI();
    const fingerprint = this.generateFingerprint();
    const fingerprintHash = this.hashFingerprint(fingerprint);
    const csrfToken = this.generateCSRFToken();

    // Create secure session
    const sessionId = await this.createSecureSession({
      userId: user.id,
      jti,
      fingerprint: fingerprintHash,
      csrfToken,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Generate access token with comprehensive claims
    const accessToken = this.app.jwt.sign({
      // Standard claims
      sub: user.id,
      iss: process.env.JWT_ISSUER || 'aegisx-api',
      aud: ['aegisx-web', 'aegisx-admin'],
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      jti,

      // User claims required by JWTPayload interface
      id: user.id,
      email: user.email,
      role: user.role || 'user',

      // Custom claims
      permissions: user.permissions || [],
      sessionId,
      fingerprint: fingerprintHash,
      v: this.TOKEN_VERSION,
    });

    // Generate and hash refresh token
    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = await this.hashRefreshToken(refreshToken);

    // Store refresh token hash with session
    await this.storeRefreshToken(sessionId, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      fingerprint,
      csrfToken,
    };
  }

  /**
   * Verify token with comprehensive security checks
   */
  async verifySecureToken(
    token: string,
    fingerprint?: string,
    checkRevocation = true,
  ): Promise<SecureTokenPayload> {
    try {
      // Verify JWT signature and claims
      const decoded = (await this.app.jwt.verify(token)) as SecureTokenPayload;

      // Check token version
      if (decoded.v !== this.TOKEN_VERSION) {
        throw new Error('Invalid token version');
      }

      // Verify fingerprint if provided
      if (fingerprint && decoded.fingerprint) {
        const fingerprintHash = this.hashFingerprint(fingerprint);
        if (
          !timingSafeEqual(
            Buffer.from(fingerprintHash),
            Buffer.from(decoded.fingerprint),
          )
        ) {
          throw new Error('Token fingerprint mismatch');
        }
      }

      // Check token revocation
      if (checkRevocation) {
        const isRevoked = await this.isTokenRevoked(decoded.jti);
        if (isRevoked) {
          throw new Error('Token has been revoked');
        }
      }

      // Verify session validity
      const session = await this.getSession(decoded.sessionId);
      if (!session || !session.isActive) {
        throw new Error('Invalid or expired session');
      }

      return decoded;
    } catch (error: any) {
      this.app.log.error({ msg: 'Token verification failed', error });
      const authError = new Error('Invalid or expired token');
      (authError as any).statusCode = 401;
      throw authError;
    }
  }

  /**
   * Refresh access token with rotation
   */
  async refreshAccessToken(
    refreshToken: string,
    fingerprint?: string,
  ): Promise<TokenPair> {
    try {
      // Find session by refresh token
      const sessions = await this.app
        .knex('user_sessions')
        .where('is_active', true)
        .where('expires_at', '>', new Date());

      let validSession = null;
      for (const session of sessions) {
        const storedHash = await this.getRefreshTokenHash(session.id);
        if (storedHash && (await bcrypt.compare(refreshToken, storedHash))) {
          validSession = session;
          break;
        }
      }

      if (!validSession) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await this.authRepository.findUserById(validSession.user_id);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Revoke old JWT
      const oldJti = await this.getSessionJTI(validSession.id);
      if (oldJti) {
        await this.revokeToken(oldJti, Date.now() + 15 * 60 * 1000);
      }

      // Generate new tokens with rotation
      return this.generateSecureTokens(user, {
        ip: validSession.ip_address,
      } as any);
    } catch (error: any) {
      this.app.log.error({ msg: 'Token refresh failed', error });
      const authError = new Error('Invalid refresh token');
      (authError as any).statusCode = 401;
      throw authError;
    }
  }

  /**
   * Revoke token by adding to blacklist
   */
  async revokeToken(jti: string, expiresAt: number): Promise<void> {
    if (!this.app.redis) return;

    const ttl = Math.ceil((expiresAt - Date.now()) / 1000);
    if (ttl > 0) {
      await this.app.redis.setex(`${this.BLACKLIST_PREFIX}${jti}`, ttl, '1');
    }
  }

  /**
   * Check if token is revoked
   */
  async isTokenRevoked(jti: string): Promise<boolean> {
    if (!this.app.redis) return false;

    const result = await this.app.redis.get(`${this.BLACKLIST_PREFIX}${jti}`);
    return result === '1';
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    // Get all active sessions
    const sessions = await this.app
      .knex('user_sessions')
      .where('user_id', userId)
      .where('is_active', true)
      .select('id', 'jti');

    // Revoke all JTIs
    for (const session of sessions) {
      if (session.jti) {
        await this.revokeToken(session.jti, Date.now() + 15 * 60 * 1000);
      }
    }

    // Deactivate all sessions
    await this.app
      .knex('user_sessions')
      .where('user_id', userId)
      .update({ is_active: false });
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(requestToken: string, sessionToken: string): boolean {
    if (!requestToken || !sessionToken) return false;

    return timingSafeEqual(
      Buffer.from(requestToken),
      Buffer.from(sessionToken),
    );
  }

  // Private helper methods

  private generateJTI(): string {
    return randomBytes(16).toString('hex');
  }

  private generateFingerprint(): string {
    return randomBytes(32).toString('base64');
  }

  private hashFingerprint(fingerprint: string): string {
    return createHash('sha256').update(fingerprint).digest('hex');
  }

  private generateCSRFToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private generateRefreshToken(): string {
    return randomBytes(64).toString('base64url');
  }

  private async hashRefreshToken(token: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(token, salt);
  }

  private async createSecureSession(data: any): Promise<string> {
    const [session] = await this.app
      .knex('user_sessions')
      .insert({
        user_id: data.userId,
        jti: data.jti,
        fingerprint: data.fingerprint,
        csrf_token: data.csrfToken,
        user_agent: data.userAgent,
        ip_address: data.ipAddress,
        expires_at: data.expiresAt,
        is_active: true,
        created_at: new Date(),
      })
      .returning('id');

    return session.id;
  }

  private async getSession(sessionId: string): Promise<any> {
    return this.app
      .knex('user_sessions')
      .where('id', sessionId)
      .where('is_active', true)
      .where('expires_at', '>', new Date())
      .first();
  }

  private async storeRefreshToken(
    sessionId: string,
    hashedToken: string,
  ): Promise<void> {
    if (!this.app.redis) {
      // Fallback to database
      await this.app
        .knex('user_sessions')
        .where('id', sessionId)
        .update({ refresh_token_hash: hashedToken });
    } else {
      // Use Redis for better performance
      await this.app.redis.setex(
        `${this.SESSION_PREFIX}refresh:${sessionId}`,
        7 * 24 * 60 * 60, // 7 days
        hashedToken,
      );
    }
  }

  private async getRefreshTokenHash(sessionId: string): Promise<string | null> {
    if (!this.app.redis) {
      const session = await this.app
        .knex('user_sessions')
        .where('id', sessionId)
        .first();
      return session?.refresh_token_hash || null;
    }

    return this.app.redis.get(`${this.SESSION_PREFIX}refresh:${sessionId}`);
  }

  private async getSessionJTI(sessionId: string): Promise<string | null> {
    const session = await this.app
      .knex('user_sessions')
      .where('id', sessionId)
      .first();
    return session?.jti || null;
  }
}
