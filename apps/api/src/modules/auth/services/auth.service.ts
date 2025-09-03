import { FastifyInstance } from 'fastify';
import { randomBytes } from 'crypto';
import { AuthRepository } from '../auth.repository';

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

  constructor(private readonly app: FastifyInstance) {
    this.authRepository = new AuthRepository(app.knex);
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
          role: user.role || 'user',
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
        .first();
      if (userResult) {
        const roleResult = await this.app
          .knex('user_roles')
          .join('roles', 'user_roles.role_id', 'roles.id')
          .where('user_roles.user_id', userResult.id)
          .select('roles.name')
          .first();

        user = {
          ...userResult,
          isActive: userResult.is_active,
          role: roleResult?.name || 'user',
        };
      }
    }

    if (!user || !user.password) {
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
      const error = new Error('Invalid credentials');
      (error as any).statusCode = 401;
      (error as any).code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error('Account is disabled');
      (error as any).statusCode = 403;
      (error as any).code = 'ACCOUNT_DISABLED';
      throw error;
    }

    // Generate tokens
    const accessToken = this.app.jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
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
      user: userWithoutPassword,
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

    // Generate new access token
    const accessToken = this.app.jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
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
}
