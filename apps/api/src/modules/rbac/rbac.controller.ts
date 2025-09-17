import { FastifyRequest, FastifyReply } from 'fastify';
import { RbacService } from './rbac.service';
import {
  RoleQuery,
  PermissionQuery,
  UserRoleQuery,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  AssignRoleRequest,
  UpdateUserRoleExpiryRequest,
  BulkAssignRolesRequest,
  BulkRoleUpdateRequest,
  BulkPermissionUpdateRequest,
} from './rbac.schemas';
import { UuidParam } from '../../schemas/base.schemas';

export class RbacController {
  constructor(private rbacService: RbacService) {}

  // ===== ROLE ENDPOINTS =====

  async getRoles(
    request: FastifyRequest<{ Querystring: RoleQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.rbacService.getRoles(request.query);

      return reply.code(200).send({
        success: true,
        data: result.roles,
        pagination: result.pagination,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in getRoles');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve roles',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async getRoleById(
    request: FastifyRequest<{
      Params: UuidParam;
      Querystring: { include_permissions?: boolean };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const role = await this.rbacService.getRoleById(
        request.params.id,
        request.query.include_permissions !== false,
      );

      return reply.code(200).send({
        success: true,
        data: role,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in getRoleById');

      if (error instanceof Error && error.message === 'Role not found') {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'ROLE_NOT_FOUND',
            message: 'Role not found',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve role',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async createRole(
    request: FastifyRequest<{ Body: CreateRoleRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const role = await this.rbacService.createRole(request.body, userId);

      return reply.code(201).send({
        success: true,
        data: role,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in createRole');

      if (error instanceof Error) {
        const statusCode = error.message.includes('already exists')
          ? 409
          : error.message.includes('not found')
            ? 404
            : error.message.includes('circular')
              ? 400
              : 500;

        return reply.code(statusCode).send({
          success: false,
          error: {
            code:
              statusCode === 409
                ? 'ROLE_ALREADY_EXISTS'
                : statusCode === 404
                  ? 'PARENT_ROLE_NOT_FOUND'
                  : statusCode === 400
                    ? 'CIRCULAR_DEPENDENCY'
                    : 'INTERNAL_SERVER_ERROR',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create role',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async updateRole(
    request: FastifyRequest<{ Params: UuidParam; Body: UpdateRoleRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const role = await this.rbacService.updateRole(
        request.params.id,
        request.body,
        userId,
      );

      return reply.code(200).send({
        success: true,
        data: role,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in updateRole');

      if (error instanceof Error) {
        const statusCode =
          error.message === 'Role not found'
            ? 404
            : error.message.includes('already exists')
              ? 409
              : error.message.includes('system role')
                ? 403
                : error.message.includes('circular')
                  ? 400
                  : 500;

        return reply.code(statusCode).send({
          success: false,
          error: {
            code:
              statusCode === 404
                ? 'ROLE_NOT_FOUND'
                : statusCode === 409
                  ? 'ROLE_ALREADY_EXISTS'
                  : statusCode === 403
                    ? 'SYSTEM_ROLE_PROTECTED'
                    : statusCode === 400
                      ? 'CIRCULAR_DEPENDENCY'
                      : 'INTERNAL_SERVER_ERROR',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update role',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async deleteRole(
    request: FastifyRequest<{ Params: UuidParam }>,
    reply: FastifyReply,
  ) {
    try {
      await this.rbacService.deleteRole(request.params.id);

      return reply.code(200).send({
        success: true,
        data: {
          id: request.params.id,
          deleted: true,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in deleteRole');

      if (error instanceof Error) {
        const statusCode =
          error.message === 'Role not found'
            ? 404
            : error.message.includes('child roles')
              ? 400
              : error.message.includes('assigned users')
                ? 400
                : error.message.includes('system role')
                  ? 403
                  : 500;

        return reply.code(statusCode).send({
          success: false,
          error: {
            code:
              statusCode === 404
                ? 'ROLE_NOT_FOUND'
                : statusCode === 400
                  ? 'ROLE_IN_USE'
                  : statusCode === 403
                    ? 'SYSTEM_ROLE_PROTECTED'
                    : 'INTERNAL_SERVER_ERROR',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete role',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  // ===== PERMISSION ENDPOINTS =====

  async getPermissions(
    request: FastifyRequest<{ Querystring: PermissionQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.rbacService.getPermissions(request.query);

      return reply.code(200).send({
        success: true,
        data: result.permissions,
        pagination: result.pagination,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in getPermissions');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve permissions',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async getPermissionById(
    request: FastifyRequest<{ Params: UuidParam }>,
    reply: FastifyReply,
  ) {
    try {
      const permission = await this.rbacService.getPermissionById(
        request.params.id,
      );

      return reply.code(200).send({
        success: true,
        data: permission,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in getPermissionById');

      if (error instanceof Error && error.message === 'Permission not found') {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PERMISSION_NOT_FOUND',
            message: 'Permission not found',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve permission',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async createPermission(
    request: FastifyRequest<{ Body: CreatePermissionRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const permission = await this.rbacService.createPermission(
        request.body,
        userId,
      );

      return reply.code(201).send({
        success: true,
        data: permission,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in createPermission');

      if (error instanceof Error && error.message.includes('already exists')) {
        return reply.code(409).send({
          success: false,
          error: {
            code: 'PERMISSION_ALREADY_EXISTS',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create permission',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async updatePermission(
    request: FastifyRequest<{
      Params: UuidParam;
      Body: UpdatePermissionRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const permission = await this.rbacService.updatePermission(
        request.params.id,
        request.body,
        userId,
      );

      return reply.code(200).send({
        success: true,
        data: permission,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in updatePermission');

      if (error instanceof Error) {
        const statusCode =
          error.message === 'Permission not found'
            ? 404
            : error.message.includes('already exists')
              ? 409
              : error.message.includes('system permission')
                ? 403
                : 500;

        return reply.code(statusCode).send({
          success: false,
          error: {
            code:
              statusCode === 404
                ? 'PERMISSION_NOT_FOUND'
                : statusCode === 409
                  ? 'PERMISSION_ALREADY_EXISTS'
                  : statusCode === 403
                    ? 'SYSTEM_PERMISSION_PROTECTED'
                    : 'INTERNAL_SERVER_ERROR',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update permission',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async deletePermission(
    request: FastifyRequest<{ Params: UuidParam }>,
    reply: FastifyReply,
  ) {
    try {
      await this.rbacService.deletePermission(request.params.id);

      return reply.code(200).send({
        success: true,
        data: {
          id: request.params.id,
          deleted: true,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in deletePermission');

      if (error instanceof Error) {
        const statusCode =
          error.message === 'Permission not found'
            ? 404
            : error.message.includes('system permission')
              ? 403
              : 500;

        return reply.code(statusCode).send({
          success: false,
          error: {
            code:
              statusCode === 404
                ? 'PERMISSION_NOT_FOUND'
                : statusCode === 403
                  ? 'SYSTEM_PERMISSION_PROTECTED'
                  : 'INTERNAL_SERVER_ERROR',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete permission',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  // ===== USER-ROLE ENDPOINTS =====

  async getUserRoles(
    request: FastifyRequest<{ Querystring: UserRoleQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.rbacService.getUserRoles(request.query);

      return reply.code(200).send({
        success: true,
        data: result.userRoles,
        pagination: result.pagination,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in getUserRoles');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve user roles',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async assignRoleToUser(
    request: FastifyRequest<{ Params: UuidParam; Body: AssignRoleRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const assignedBy = request.user?.id;
      if (!assignedBy) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const userRole = await this.rbacService.assignRoleToUser(
        request.params.id,
        request.body,
        assignedBy,
      );

      return reply.code(201).send({
        success: true,
        data: userRole,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in assignRoleToUser');

      if (error instanceof Error) {
        const statusCode = error.message.includes('not found')
          ? 404
          : error.message.includes('already has')
            ? 409
            : error.message.includes('inactive')
              ? 400
              : error.message.includes('future')
                ? 400
                : 500;

        return reply.code(statusCode).send({
          success: false,
          error: {
            code:
              statusCode === 404
                ? 'NOT_FOUND'
                : statusCode === 409
                  ? 'ROLE_ALREADY_ASSIGNED'
                  : statusCode === 400
                    ? 'INVALID_REQUEST'
                    : 'INTERNAL_SERVER_ERROR',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign role to user',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async removeRoleFromUser(
    request: FastifyRequest<{ Params: { userId: string; roleId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      await this.rbacService.removeRoleFromUser(
        request.params.userId,
        request.params.roleId,
      );

      return reply.code(200).send({
        success: true,
        data: {
          user_id: request.params.userId,
          role_id: request.params.roleId,
          removed: true,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in removeRoleFromUser');

      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'USER_ROLE_NOT_FOUND',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove role from user',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async updateUserRoleExpiry(
    request: FastifyRequest<{
      Params: { userId: string; roleId: string };
      Body: UpdateUserRoleExpiryRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const userRole = await this.rbacService.updateUserRoleExpiry(
        request.params.userId,
        request.params.roleId,
        request.body.expires_at,
      );

      return reply.code(200).send({
        success: true,
        data: userRole,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in updateUserRoleExpiry');

      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'USER_ROLE_NOT_FOUND',
            message: error.message,
            statusCode: 404,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user role expiry',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  // ===== BULK OPERATIONS =====

  async bulkAssignRoles(
    request: FastifyRequest<{ Body: BulkAssignRolesRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const assignedBy = request.user?.id;
      if (!assignedBy) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const result = await this.rbacService.bulkAssignRoles(
        request.body,
        assignedBy,
      );

      return reply.code(200).send({
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in bulkAssignRoles');

      if (error instanceof Error) {
        const statusCode = error.message.includes('not found')
          ? 404
          : error.message.includes('inactive')
            ? 400
            : 500;

        return reply.code(statusCode).send({
          success: false,
          error: {
            code:
              statusCode === 404
                ? 'NOT_FOUND'
                : statusCode === 400
                  ? 'INVALID_REQUEST'
                  : 'INTERNAL_SERVER_ERROR',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to bulk assign roles',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async bulkUpdateRoles(
    request: FastifyRequest<{ Body: BulkRoleUpdateRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const updatedBy = request.user?.id;
      if (!updatedBy) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const result = await this.rbacService.bulkUpdateRoles(
        request.body,
        updatedBy,
      );

      return reply.code(200).send({
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in bulkUpdateRoles');

      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to bulk update roles',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async bulkUpdatePermissions(
    request: FastifyRequest<{ Body: BulkPermissionUpdateRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const updatedBy = request.user?.id;
      if (!updatedBy) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const result = await this.rbacService.bulkUpdatePermissions(
        request.body,
        updatedBy,
      );

      return reply.code(200).send({
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in bulkUpdatePermissions');

      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to bulk update permissions',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  // ===== STATISTICS & UTILITY ENDPOINTS =====

  async getRbacStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await this.rbacService.getRbacStats();

      return reply.code(200).send({
        success: true,
        data: stats,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in getRbacStats');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve RBAC statistics',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async getRoleHierarchy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const hierarchy = await this.rbacService.getRoleHierarchy();

      return reply.code(200).send({
        success: true,
        data: hierarchy,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in getRoleHierarchy');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve role hierarchy',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async getPermissionsByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const permissionsByCategory =
        await this.rbacService.getPermissionsByCategory();

      return reply.code(200).send({
        success: true,
        data: permissionsByCategory,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in getPermissionsByCategory');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve permissions by category',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  async getUserEffectivePermissions(
    request: FastifyRequest<{ Params: UuidParam }>,
    reply: FastifyReply,
  ) {
    try {
      const permissions = await this.rbacService.getUserEffectivePermissions(
        request.params.id,
      );

      return reply.code(200).send({
        success: true,
        data: permissions,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error in getUserEffectivePermissions');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve user effective permissions',
          statusCode: 500,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }
}
