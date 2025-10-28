import { FastifyRequest, FastifyReply } from 'fastify';
import { NavigationService } from './services/navigation.service';
import { GetNavigationQuery, GetUserNavigationQuery, NavigationType } from './navigation.types';

/**
 * NavigationController - HTTP request handlers for navigation endpoints
 * Implements endpoints defined in navigation-api.yaml
 */
export class NavigationController {
  private navigationService: NavigationService;

  constructor(navigationService: NavigationService) {
    this.navigationService = navigationService;
  }

  /**
   * GET /api/navigation
   * Get complete navigation structure
   */
  async getNavigation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as GetNavigationQuery;
      const { type, includeDisabled } = query;

      // Validate navigation type if provided
      if (type && !this.isValidNavigationType(type)) {
        return reply.error(
          'INVALID_NAVIGATION_TYPE',
          `Invalid navigation type. Must be one of: default, compact, horizontal, mobile`,
          400
        );
      }

      const navigationResponse = await this.navigationService.getNavigation({
        type,
        includeDisabled: includeDisabled === 'true'
      });

      // Add meta information as per OpenAPI spec
      const meta = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        requestId: request.id || undefined
      };

      return reply.success(navigationResponse, 'Navigation structure retrieved successfully');
    } catch (error) {
      request.log.error(`Failed to get navigation: ${error}`);
      
      if (this.isKnownError(error)) {
        return this.handleKnownError(error, reply);
      }

      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred while retrieving navigation',
        500
      );
    }
  }

  /**
   * GET /api/navigation/user
   * Get user-specific navigation filtered by permissions
   */
  async getUserNavigation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as GetUserNavigationQuery;
      const { type } = query;

      // Get user from JWT token
      const user = request.user as any;
      if (!user || !user.id) {
        return reply.unauthorized('Authentication required');
      }

      // Validate navigation type if provided
      if (type && !this.isValidNavigationType(type)) {
        return reply.error(
          'INVALID_NAVIGATION_TYPE',
          `Invalid navigation type. Must be one of: default, compact, horizontal, mobile`,
          400
        );
      }

      const navigationResponse = await this.navigationService.getUserNavigation(user.id, {
        type,
        userId: user.id
      });

      // Add meta information as per OpenAPI spec
      const meta = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        requestId: request.id || undefined
      };

      return reply.success(navigationResponse, 'User navigation retrieved successfully');
    } catch (error) {
      request.log.error(`Failed to get user navigation: ${error}`);
      
      if (this.isKnownError(error)) {
        return this.handleKnownError(error, reply);
      }

      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred while retrieving user navigation',
        500
      );
    }
  }

  /**
   * Validate navigation type
   * @param type Navigation type to validate
   * @returns boolean
   */
  private isValidNavigationType(type: string): type is NavigationType {
    return ['default', 'compact', 'horizontal', 'mobile'].includes(type);
  }

  /**
   * Check if error is a known business logic error
   * @param error Error object
   * @returns boolean
   */
  private isKnownError(error: any): boolean {
    if (typeof error === 'string') {
      return [
        'USER_NOT_FOUND',
        'NAVIGATION_NOT_FOUND',
        'INSUFFICIENT_PERMISSIONS',
        'INVALID_NAVIGATION_TYPE'
      ].includes(error);
    }

    if (error && typeof error === 'object' && error.message) {
      return [
        'USER_NOT_FOUND',
        'NAVIGATION_NOT_FOUND',
        'INSUFFICIENT_PERMISSIONS',
        'INVALID_NAVIGATION_TYPE'
      ].includes(error.message);
    }

    return false;
  }

  /**
   * Handle known business logic errors
   * @param error Error object or string
   * @param reply Fastify reply object
   */
  private handleKnownError(error: any, reply: FastifyReply) {
    const errorMessage = typeof error === 'string' ? error : error.message;

    switch (errorMessage) {
      case 'USER_NOT_FOUND':
        return reply.notFound('User not found');
      
      case 'NAVIGATION_NOT_FOUND':
        return reply.notFound('Navigation structure not found');
      
      case 'INSUFFICIENT_PERMISSIONS':
        return reply.forbidden('Insufficient permissions to access navigation');
      
      case 'INVALID_NAVIGATION_TYPE':
        return reply.error(
          'INVALID_NAVIGATION_TYPE',
          'Invalid navigation type provided',
          400
        );
      
      default:
        return reply.error(
          'INTERNAL_SERVER_ERROR',
          'An unexpected error occurred',
          500
        );
    }
  }
}

/**
 * Factory function to create navigation controller with proper dependency injection
 * @param navigationService NavigationService instance
 * @returns Object with controller methods bound to the service
 */
export function createNavigationController(navigationService: NavigationService) {
  const controller = new NavigationController(navigationService);

  return {
    getNavigation: controller.getNavigation.bind(controller),
    getUserNavigation: controller.getUserNavigation.bind(controller)
  };
}