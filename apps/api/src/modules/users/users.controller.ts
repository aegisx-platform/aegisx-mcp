import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service';
import {
  ListUsersQuery,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeUserPasswordRequest,
} from './users.schemas';

export class UsersController {
  constructor(private usersService: UsersService) {}

  async listUsers(
    request: FastifyRequest<{ Querystring: ListUsersQuery }>,
    reply: FastifyReply,
  ) {
    try {
      request.log.info({ query: request.query }, 'Listing users with query');
      const result = await this.usersService.listUsers(request.query);
      request.log.info({ resultCount: result.users.length }, 'Users retrieved');

      // Return paginated response according to standard
      return reply.paginated(
        result.users,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
      );
    } catch (error) {
      request.log.error(
        {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          query: request.query,
        },
        'Error listing users',
      );
      throw error;
    }
  }

  async getUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const user = await this.usersService.getUserById(request.params.id);
    return reply.success(user);
  }

  async createUser(
    request: FastifyRequest<{ Body: CreateUserRequest }>,
    reply: FastifyReply,
  ) {
    const user = await this.usersService.createUser(request.body);
    return reply.code(201).success(user);
  }

  async updateUser(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateUserRequest;
    }>,
    reply: FastifyReply,
  ) {
    const user = await this.usersService.updateUser(
      request.params.id,
      request.body,
    );
    return reply.success(user);
  }

  async changeUserPassword(
    request: FastifyRequest<{
      Params: { id: string };
      Body: ChangeUserPasswordRequest;
    }>,
    reply: FastifyReply,
  ) {
    await this.usersService.changeUserPassword(
      request.params.id,
      request.body.newPassword,
    );
    return reply.success({
      message: 'Password changed successfully',
    });
  }

  async deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const currentUserId = request.user.id;
    await this.usersService.deleteUser(request.params.id, currentUserId);
    return reply.success({
      id: request.params.id,
      message: 'User deleted successfully',
    });
  }

  async listRoles(request: FastifyRequest, reply: FastifyReply) {
    const roles = await this.usersService.listRoles();
    return reply.success(roles);
  }
}
