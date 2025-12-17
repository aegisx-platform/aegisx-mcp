import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyInstance } from 'fastify';
import { SchemaRefs } from '../../../schemas/registry';
import { UserDepartmentsController } from './user-departments.controller';

export interface UserDepartmentsRoutesOptions {
  controller: UserDepartmentsController;
}

export async function userDepartmentsRoutes(
  fastify: FastifyInstance,
  options: UserDepartmentsRoutesOptions,
) {
  const { controller } = options;
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Get all departments for current user
  typedFastify.get(
    '/users/me/departments',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Get all active departments for the current user',
        tags: ['User Departments'],
        summary: 'Get my departments',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module(
            'user-departments',
            'user-departments-response',
          ),
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getMyDepartments.bind(controller),
  );

  // Get primary department for current user
  typedFastify.get(
    '/users/me/departments/primary',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Get primary department for the current user',
        tags: ['User Departments'],
        summary: 'Get my primary department',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module(
            'user-departments',
            'primary-department-response',
          ),
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getMyPrimaryDepartment.bind(controller),
  );
}
