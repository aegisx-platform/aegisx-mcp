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
    const { email, username, password, firstName, lastName } = input;

    // Check if user exists
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw this.app.httpErrors.conflict('User already exists with this email');
    }

    // Check username
    const existingUsername = await this.app.knex('users')
      .where('username', username)
      .first();
    
    if (existingUsername) {
      throw this.app.httpErrors.conflict('Username already taken');
    }

    // Create user
    const user = await this.authRepository.createUser({
      email,
      username,
      password,
      first_name: firstName || '',
      last_name: lastName || ''
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(input: LoginInput, userAgent?: string, ipAddress?: string) {
    const { email, password } = input;

    // Find user
    const user = await this.authRepository.findUserByEmail(email);
    if (!user || !user.password) {
      throw this.app.httpErrors.unauthorized('Invalid credentials');
    }

    // Verify password
    const isValid = await this.authRepository.verifyPassword(password, user.password);
    if (!isValid) {
      throw this.app.httpErrors.unauthorized('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw this.app.httpErrors.forbidden('Account is disabled');
    }

    // Generate tokens
    const accessToken = this.app.jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        roles: [user.role || 'user'] 
      },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
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
      ip_address: ipAddress
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken: string) {
    // Find session
    const session = await this.authRepository.findSessionByToken(refreshToken);
    if (!session) {
      throw this.app.httpErrors.unauthorized('Invalid refresh token');
    }

    // Get user
    const user = await this.authRepository.findUserById(session.user_id);
    if (!user || !user.isActive) {
      throw this.app.httpErrors.unauthorized('User not found or inactive');
    }

    // Generate new access token
    const accessToken = this.app.jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        roles: [user.role || 'user'] 
      },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    return { accessToken };
  }

  async logout(refreshToken: string) {
    await this.authRepository.deleteSession(refreshToken);
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw this.app.httpErrors.notFound('User not found');
    }

    return user;
  }
}