import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { UserProfileController } from './user-profile.controller';
import { SchemaRefs } from '../../schemas/registry';

export interface UserProfileRoutesOptions {
  controller: UserProfileController;
}

export async function userProfileRoutes(
  fastify: FastifyInstance,
  options: UserProfileRoutesOptions,
) {
  const { controller } = options;
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Get current user profile
  typedFastify.get(
    '/users/profile',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Get current user profile',
        tags: ['User Profile'],
        summary:
          'Get current user profile with preferences and role information',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module('user-profile', 'user-profile-response'),
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getUserProfile.bind(controller),
  );

  // Update current user profile
  typedFastify.put(
    '/users/profile',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Update current user profile',
        tags: ['User Profile'],
        summary: 'Update user profile information',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('user-profile', 'user-profile-update-request'),
        response: {
          200: SchemaRefs.module('user-profile', 'user-profile-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.updateUserProfile.bind(controller),
  );

  // Get user preferences
  typedFastify.get(
    '/profile/preferences',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Get current user preferences',
        tags: ['User Profile'],
        summary:
          'Get user preferences including theme, language, and notifications',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module('user-profile', 'user-preferences-response'),
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getUserPreferences.bind(controller),
  );

  // Update user preferences
  typedFastify.put(
    '/profile/preferences',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Update current user preferences',
        tags: ['User Profile'],
        summary: 'Update user preferences',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module(
          'user-profile',
          'user-preferences-update-request',
        ),
        response: {
          200: SchemaRefs.module('user-profile', 'user-preferences-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.updateUserPreferences.bind(controller),
  );

  // Upload user avatar
  typedFastify.post(
    '/profile/avatar',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Upload user avatar',
        tags: ['User Profile'],
        summary: 'Upload a new avatar image',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
        // Note: No body schema for multipart/form-data uploads
        response: {
          200: SchemaRefs.module('user-profile', 'avatar-upload-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          413: SchemaRefs.ValidationError,
          415: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.uploadUserAvatar.bind(controller),
  );

  // Delete user avatar
  typedFastify.delete(
    '/profile/avatar',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Delete user avatar',
        tags: ['User Profile'],
        summary: 'Delete the current user avatar',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module('user-profile', 'avatar-delete-response'),
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.deleteUserAvatar.bind(controller),
  );
}
