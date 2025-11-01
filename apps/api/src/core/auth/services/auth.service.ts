import { FastifyInstance } from 'fastify';
import { randomBytes } from 'crypto';
import { AuthRepository } from '../auth.repository';
import { AccountLockoutService } from './account-lockout.service';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';

interface RegisterInput {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private authRepository: AuthRepository;
  private lockoutService: AccountLockoutService;
  private emailVerificationService: EmailVerificationService;
  private passwordResetService: PasswordResetService;

  constructor(private readonly app: FastifyInstance) {
    this.authRepository = new AuthRepository(app.knex);
    this.lockoutService = new AccountLockoutService(app, app.knex, app.redis);
    this.emailVerificationService = new EmailVerificationService(app, app.knex);
    this.passwordResetService = new PasswordResetService(app, app.knex);
  }

  async register(input: RegisterInput) {
    try {
      const { email, username, password, firstName, lastName } = input;

      console.log('[AUTH_SERVICE] Starting registration for email:', email);

      // Check if user exists
      const existingUser = await this.authRepository.findUserByEmail(email);
      if (existingUser) {
        const error = new Error('Email already exists');
        (error as any).statusCode = 409;
        (error as any).code = 'EMAIL_ALREADY_EXISTS';
        throw error;
      }

      // Check username
      const existingUsername = await this.app
        .knex('users')
        .where('username', username)
        .whereNull('deleted_at') // Exclude deleted users
        .first();

      if (existingUsername) {
        const error = new Error('Username already exists');
        (error as any).statusCode = 409;
        (error as any).code = 'USERNAME_ALREADY_EXISTS';
        throw error;
      }

      // Create user
      const user = await this.authRepository.createUser({
        email,
        username,
        password,
        first_name: firstName || '',
        last_name: lastName || '',
      });

      // Generate tokens (similar to login)
      const accessToken = this.app.jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role || 'user', // Backward compatibility
          roles: user.roles || ['user'], // Multi-role support
        },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
      );

      const refreshToken = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      // Save refresh token
      await this.authRepository.createSession({
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        user_agent: undefined,
        ip_address: undefined,
      });

      // Create email verification token and send email
      const verificationToken =
        await this.emailVerificationService.createVerificationToken(
          user.id,
          user.email,
        );
      await this.emailVerificationService.sendVerificationEmail(
        user.email,
        verificationToken,
        `${firstName || ''} ${lastName || ''}`.trim(),
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      console.log('[AUTH_SERVICE] Registration successful for user:', user.id);

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      };
    } catch (error) {
      console.error('[AUTH_SERVICE] Registration error:', error);
      throw error;
    }
  }

  async login(input: LoginInput, userAgent?: string, ipAddress?: string) {
    const { email, password } = input;
    const identifier = email; // Can be email or username

    // Check if account is locked
    const lockoutStatus = await this.lockoutService.isAccountLocked(identifier);
    if (lockoutStatus.isLocked) {
      // Record the blocked attempt
      await this.lockoutService.recordAttempt(identifier, {
        email: email.includes('@') ? email : null,
        username: !email.includes('@') ? email : null,
        ipAddress: ipAddress || 'unknown',
        userAgent,
        success: false,
        failureReason: 'account_locked',
      });

      const error = new Error(
        `Account is locked. Try again after ${lockoutStatus.lockoutEndsAt?.toLocaleString()}`,
      );
      (error as any).statusCode = 429;
      (error as any).code = 'ACCOUNT_LOCKED';
      (error as any).lockoutEndsAt = lockoutStatus.lockoutEndsAt;
      throw error;
    }

    // Find user by email or username
    let user;
    if (email.includes('@')) {
      // It's an email
      user = await this.authRepository.findUserByEmail(email);
    } else {
      // It's a username
      const userResult = await this.app
        .knex('users')
        .where('username', email)
        .whereNull('deleted_at') // Exclude deleted users
        .first();
      if (userResult) {
        const rolesResult = await this.app
          .knex('user_roles')
          .join('roles', 'user_roles.role_id', 'roles.id')
          .where('user_roles.user_id', userResult.id)
          .select('roles.name');

        const roles = rolesResult.map((r: any) => r.name);

        user = {
          ...userResult,
          isActive: userResult.is_active,
          role: roles[0] || 'user', // Keep backward compatibility with 'role'
          roles: roles.length > 0 ? roles : ['user'], // New multi-role support
        };
      }
    }

    if (!user || !user.password) {
      // Record failed attempt - user not found
      await this.lockoutService.recordAttempt(identifier, {
        email: email.includes('@') ? email : null,
        username: !email.includes('@') ? email : null,
        ipAddress: ipAddress || 'unknown',
        userAgent,
        success: false,
        failureReason: 'user_not_found',
      });

      const error = new Error('Invalid credentials');
      (error as any).statusCode = 401;
      (error as any).code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Verify password
    const isValid = await this.authRepository.verifyPassword(
      password,
      user.password,
    );
    if (!isValid) {
      // Record failed attempt - invalid password
      await this.lockoutService.recordAttempt(identifier, {
        userId: user.id,
        email: user.email,
        username: user.username,
        ipAddress: ipAddress || 'unknown',
        userAgent,
        success: false,
        failureReason: 'invalid_password',
      });

      const error = new Error('Invalid credentials');
      (error as any).statusCode = 401;
      (error as any).code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      // Record failed attempt - account disabled
      await this.lockoutService.recordAttempt(identifier, {
        userId: user.id,
        email: user.email,
        username: user.username,
        ipAddress: ipAddress || 'unknown',
        userAgent,
        success: false,
        failureReason: 'account_disabled',
      });

      const error = new Error('Account is disabled');
      (error as any).statusCode = 403;
      (error as any).code = 'ACCOUNT_DISABLED';
      throw error;
    }

    // Record successful login attempt
    await this.lockoutService.recordAttempt(identifier, {
      userId: user.id,
      email: user.email,
      username: user.username,
      ipAddress: ipAddress || 'unknown',
      userAgent,
      success: true,
    });

    // Load user permissions
    const permissionsResult = await this.app
      .knex('users as u')
      .select(
        this.app.knex.raw(
          "ARRAY_AGG(DISTINCT CONCAT(p.resource, ':', p.action)) as permissions",
        ),
      )
      .join('user_roles as ur', 'u.id', 'ur.user_id')
      .join('role_permissions as rp', 'ur.role_id', 'rp.role_id')
      .join('permissions as p', 'rp.permission_id', 'p.id')
      .where('u.id', user.id)
      .groupBy('u.id')
      .first();

    const permissions = permissionsResult?.permissions || [];

    // Generate tokens
    const accessToken = this.app.jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'user', // Backward compatibility
        roles: user.roles || ['user'], // Multi-role support
        permissions,
      },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    );

    const refreshToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Save refresh token
    await this.authRepository.createSession({
      user_id: user.id,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    // Update last login timestamp
    await this.app
      .knex('users')
      .where('id', user.id)
      .update({ last_login_at: new Date() });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        permissions, // Add permissions to user response
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    // Find session
    const session = await this.authRepository.findSessionByToken(refreshToken);
    if (!session) {
      const error = new Error('Invalid refresh token');
      (error as any).statusCode = 401;
      (error as any).code = 'INVALID_REFRESH_TOKEN';
      throw error;
    }

    // Get user
    const user = await this.authRepository.findUserById(session.user_id);
    if (!user || !user.isActive) {
      const error = new Error('User not found or inactive');
      (error as any).statusCode = 401;
      (error as any).code = 'USER_NOT_FOUND_OR_INACTIVE';
      throw error;
    }

    // Load user permissions (same as login)
    const permissionsResult = await this.app
      .knex('users as u')
      .select(
        this.app.knex.raw(
          "ARRAY_AGG(DISTINCT CONCAT(p.resource, ':', p.action)) as permissions",
        ),
      )
      .join('user_roles as ur', 'u.id', 'ur.user_id')
      .join('role_permissions as rp', 'ur.role_id', 'rp.role_id')
      .join('permissions as p', 'rp.permission_id', 'p.id')
      .where('u.id', user.id)
      .groupBy('u.id')
      .first();

    const permissions = permissionsResult?.permissions || [];

    // Generate new access token with permissions
    const accessToken = this.app.jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'user', // Backward compatibility
        roles: user.roles || ['user'], // Multi-role support
        permissions,
      },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    );

    return { accessToken };
  }

  async logout(refreshToken: string) {
    await this.authRepository.deleteSession(refreshToken);
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      (error as any).code = 'USER_NOT_FOUND';
      throw error;
    }

    return user;
  }

  async getPermissions(userId: string): Promise<string[]> {
    // Query user permissions from database (aggregated from all roles)
    const permissionsResult = await this.app
      .knex('users as u')
      .select(
        this.app.knex.raw(
          "ARRAY_AGG(DISTINCT CONCAT(p.resource, ':', p.action)) as permissions",
        ),
      )
      .join('user_roles as ur', 'u.id', 'ur.user_id')
      .join('role_permissions as rp', 'ur.role_id', 'rp.role_id')
      .join('permissions as p', 'rp.permission_id', 'p.id')
      .where('u.id', userId)
      .where('ur.is_active', true) // Only active role assignments
      .groupBy('u.id')
      .first();

    return permissionsResult?.permissions || [];
  }

  async unlockAccount(identifier: string): Promise<void> {
    await this.lockoutService.unlockAccount(identifier);
  }

  async verifyEmail(token: string, ipAddress?: string) {
    return await this.emailVerificationService.verifyEmail(token, ipAddress);
  }

  async resendVerification(userId: string) {
    const token =
      await this.emailVerificationService.resendVerification(userId);

    // Get user details to send email
    const user = await this.authRepository.findUserById(userId);
    if (user) {
      await this.emailVerificationService.sendVerificationEmail(
        user.email,
        token,
        `${user.firstName} ${user.lastName}`.trim(),
      );
    }

    return { success: true, message: 'Verification email resent' };
  }

  /**
   * Request password reset - sends reset email
   */
  async requestPasswordReset(email: string) {
    return await this.passwordResetService.requestPasswordReset(email);
  }

  /**
   * Verify password reset token
   */
  async verifyResetToken(token: string) {
    return await this.passwordResetService.verifyResetToken(token);
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string, ipAddress?: string) {
    return await this.passwordResetService.resetPassword(
      token,
      newPassword,
      ipAddress,
    );
  }
}
