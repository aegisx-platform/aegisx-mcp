import { FastifyRequest, FastifyReply } from 'fastify';

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const user = await this.authService.register(request.body as any);
    return reply.created(user, 'User registered successfully');
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.authService.login(
      request.body as any,
      request.headers['user-agent'],
      request.ip
    );

    // Set refresh token in httpOnly cookie
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return reply.success({
      user: result.user,
      accessToken: result.accessToken,
    }, 'Login successful');
  },

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = request.cookies.refreshToken || (request.body as any).refreshToken;
    
    if (!refreshToken) {
      throw new Error('REFRESH_TOKEN_NOT_FOUND');
    }

    const result = await this.authService.refreshToken(refreshToken);
    
    return reply.success({
      accessToken: result.accessToken
    }, 'Token refreshed successfully');
  },

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = request.cookies.refreshToken;
    
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    reply.clearCookie('refreshToken');
    
    return reply.success({}, 'Logged out successfully');
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const profile = await this.authService.getProfile(userId);
    
    return reply.success(profile, 'Profile retrieved successfully');
  }
};