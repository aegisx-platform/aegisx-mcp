import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { createNavigationItemsController } from './navigation-items.controller';
import { Type } from '@sinclair/typebox';

/**
 * Navigation Items CRUD Routes
 * Manages navigation items creation, updating, deletion, and permissions
 */
export default async function navigationItemsRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  const navigationService = fastify.navigationService;
  if (!navigationService) {
    throw new Error('NavigationService not found');
  }

  const controller = createNavigationItemsController(navigationService);

  /**
   * GET /navigation-items
   * List all navigation items
   */
  typedFastify.get('/navigation-items', {
    schema: {
      description: 'List all navigation items',
      tags: ['Navigation Management'],
      security: [{ bearerAuth: [] }],
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('navigation', 'read'),
    ],
    handler: controller.listNavigationItems,
  });

  /**
   * GET /navigation-items/:id
   * Get single navigation item
   */
  typedFastify.get('/navigation-items/:id', {
    schema: {
      description: 'Get navigation item by ID',
      tags: ['Navigation Management'],
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('navigation', 'read'),
    ],
    handler: controller.getNavigationItem,
  });

  /**
   * POST /navigation-items
   * Create new navigation item
   */
  typedFastify.post('/navigation-items', {
    schema: {
      description: 'Create new navigation item',
      tags: ['Navigation Management'],
      security: [{ bearerAuth: [] }],
      body: Type.Object({
        parent_id: Type.Optional(Type.String({ format: 'uuid' })),
        key: Type.String({ minLength: 1, maxLength: 100 }),
        title: Type.String({ minLength: 1, maxLength: 200 }),
        type: Type.Union([
          Type.Literal('item'),
          Type.Literal('group'),
          Type.Literal('collapsible'),
          Type.Literal('divider'),
          Type.Literal('spacer'),
        ]),
        icon: Type.Optional(Type.String()),
        link: Type.Optional(Type.String()),
        target: Type.Optional(
          Type.Union([
            Type.Literal('_self'),
            Type.Literal('_blank'),
            Type.Literal('_parent'),
            Type.Literal('_top'),
          ]),
        ),
        sort_order: Type.Optional(Type.Number()),
        disabled: Type.Optional(Type.Boolean()),
        hidden: Type.Optional(Type.Boolean()),
        exact_match: Type.Optional(Type.Boolean()),
        badge_title: Type.Optional(Type.String()),
        badge_classes: Type.Optional(Type.String()),
        badge_variant: Type.Optional(Type.String()),
        show_in_default: Type.Optional(Type.Boolean()),
        show_in_compact: Type.Optional(Type.Boolean()),
        show_in_horizontal: Type.Optional(Type.Boolean()),
        show_in_mobile: Type.Optional(Type.Boolean()),
        meta: Type.Optional(Type.Record(Type.String(), Type.Any())),
        permission_ids: Type.Optional(
          Type.Array(Type.String({ format: 'uuid' })),
        ),
      }),
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('navigation', 'create'),
    ],
    handler: controller.createNavigationItem,
  });

  /**
   * PUT /navigation-items/:id
   * Update navigation item
   */
  typedFastify.put('/navigation-items/:id', {
    schema: {
      description: 'Update navigation item',
      tags: ['Navigation Management'],
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      body: Type.Object({
        parent_id: Type.Optional(Type.String({ format: 'uuid' })),
        key: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
        title: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
        type: Type.Optional(
          Type.Union([
            Type.Literal('item'),
            Type.Literal('group'),
            Type.Literal('collapsible'),
            Type.Literal('divider'),
            Type.Literal('spacer'),
          ]),
        ),
        icon: Type.Optional(Type.String()),
        link: Type.Optional(Type.String()),
        target: Type.Optional(
          Type.Union([
            Type.Literal('_self'),
            Type.Literal('_blank'),
            Type.Literal('_parent'),
            Type.Literal('_top'),
          ]),
        ),
        sort_order: Type.Optional(Type.Number()),
        disabled: Type.Optional(Type.Boolean()),
        hidden: Type.Optional(Type.Boolean()),
        exact_match: Type.Optional(Type.Boolean()),
        badge_title: Type.Optional(Type.String()),
        badge_classes: Type.Optional(Type.String()),
        badge_variant: Type.Optional(Type.String()),
        show_in_default: Type.Optional(Type.Boolean()),
        show_in_compact: Type.Optional(Type.Boolean()),
        show_in_horizontal: Type.Optional(Type.Boolean()),
        show_in_mobile: Type.Optional(Type.Boolean()),
        meta: Type.Optional(Type.Record(Type.String(), Type.Any())),
        permission_ids: Type.Optional(
          Type.Array(Type.String({ format: 'uuid' })),
        ),
      }),
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('navigation', 'update'),
    ],
    handler: controller.updateNavigationItem,
  });

  /**
   * DELETE /navigation-items/:id
   * Delete navigation item
   */
  typedFastify.delete('/navigation-items/:id', {
    schema: {
      description: 'Delete navigation item',
      tags: ['Navigation Management'],
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('navigation', 'delete'),
    ],
    handler: controller.deleteNavigationItem,
  });

  /**
   * POST /navigation-items/reorder
   * Reorder navigation items
   */
  typedFastify.post('/navigation-items/reorder', {
    schema: {
      description: 'Reorder navigation items',
      tags: ['Navigation Management'],
      security: [{ bearerAuth: [] }],
      body: Type.Object({
        orders: Type.Array(
          Type.Object({
            id: Type.String({ format: 'uuid' }),
            sort_order: Type.Number(),
          }),
        ),
      }),
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('navigation', 'update'),
    ],
    handler: controller.reorderNavigationItems,
  });

  /**
   * GET /navigation-items/:id/permissions
   * Get navigation item permissions
   */
  typedFastify.get('/navigation-items/:id/permissions', {
    schema: {
      description: 'Get navigation item permissions',
      tags: ['Navigation Management'],
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('navigation', 'read'),
    ],
    handler: controller.getNavigationItemPermissions,
  });

  /**
   * POST /navigation-items/:id/permissions
   * Assign permissions to navigation item
   */
  typedFastify.post('/navigation-items/:id/permissions', {
    schema: {
      description: 'Assign permissions to navigation item',
      tags: ['Navigation Management'],
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      body: Type.Object({
        permission_ids: Type.Array(Type.String({ format: 'uuid' })),
      }),
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('navigation', 'assign-permissions'),
    ],
    handler: controller.assignPermissions,
  });

  fastify.log.info('Navigation items CRUD routes registered successfully');
}
