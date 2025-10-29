import { FastifyRequest, FastifyReply } from 'fastify';
import { NavigationService } from './services/navigation.service';
import {
  CreateNavigationItemRequest,
  UpdateNavigationItemRequest,
  AssignPermissionsRequest,
  UpdateOrdersRequest,
} from './navigation.types';

/**
 * NavigationItemsController - CRUD operations for navigation items
 */
export class NavigationItemsController {
  constructor(private navigationService: NavigationService) {}

  /**
   * GET /api/navigation-items
   * List all navigation items (flat list)
   */
  async listNavigationItems(request: FastifyRequest, reply: FastifyReply) {
    try {
      const items = await this.navigationService.getNavigationItems(true);
      return reply.success(items, 'Navigation items retrieved successfully');
    } catch (error) {
      request.log.error(`Failed to list navigation items: ${error}`);
      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve navigation items',
        500,
      );
    }
  }

  /**
   * GET /api/navigation-items/:id
   * Get single navigation item with permissions
   */
  async getNavigationItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const item = await this.navigationService.getNavigationItemById(id);

      if (!item) {
        return reply.notFound('Navigation item not found');
      }

      // Get permissions for this item
      const permissions =
        await this.navigationService.getNavigationItemPermissions(id);

      return reply.success(
        { ...item, permissions },
        'Navigation item retrieved successfully',
      );
    } catch (error) {
      request.log.error(`Failed to get navigation item: ${error}`);
      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve navigation item',
        500,
      );
    }
  }

  /**
   * POST /api/navigation-items
   * Create new navigation item
   */
  async createNavigationItem(
    request: FastifyRequest<{ Body: CreateNavigationItemRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const data = request.body;

      // Validate key uniqueness
      const isUnique = await this.navigationService.isKeyUnique(data.key);
      if (!isUnique) {
        return reply.error(
          'KEY_ALREADY_EXISTS',
          'Navigation item key already exists',
          400,
        );
      }

      // Extract permission_ids and remove from item data
      const { permission_ids, ...itemData } = data;

      // Set defaults
      const navigationItem = {
        ...itemData,
        target: itemData.target || '_self',
        sort_order: itemData.sort_order ?? 0,
        disabled: itemData.disabled ?? false,
        hidden: itemData.hidden ?? false,
        exact_match: itemData.exact_match ?? false,
        show_in_default: itemData.show_in_default ?? true,
        show_in_compact: itemData.show_in_compact ?? false,
        show_in_horizontal: itemData.show_in_horizontal ?? false,
        show_in_mobile: itemData.show_in_mobile ?? true,
      };

      // Create navigation item
      const created =
        await this.navigationService.createNavigationItem(navigationItem);

      // Assign permissions if provided
      if (permission_ids && permission_ids.length > 0) {
        await this.navigationService.assignPermissionsToNavigationItem(
          created.id,
          permission_ids,
        );
      }

      // Get full item with permissions
      const permissions =
        await this.navigationService.getNavigationItemPermissions(created.id);

      return reply
        .code(201)
        .success(
          { ...created, permissions },
          'Navigation item created successfully',
        );
    } catch (error) {
      request.log.error(`Failed to create navigation item: ${error}`);
      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to create navigation item',
        500,
      );
    }
  }

  /**
   * PUT /api/navigation-items/:id
   * Update navigation item
   */
  async updateNavigationItem(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateNavigationItemRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const data = request.body;

      // Check if item exists
      const existing = await this.navigationService.getNavigationItemById(id);
      if (!existing) {
        return reply.notFound('Navigation item not found');
      }

      // Validate key uniqueness if key is being updated
      if (data.key && data.key !== existing.key) {
        const isUnique = await this.navigationService.isKeyUnique(data.key, id);
        if (!isUnique) {
          return reply.error(
            'KEY_ALREADY_EXISTS',
            'Navigation item key already exists',
            400,
          );
        }
      }

      // Extract permission_ids and remove from update data
      const { permission_ids, ...updateData } = data;

      // Update navigation item
      const updated = await this.navigationService.updateNavigationItem(
        id,
        updateData,
      );

      // Update permissions if provided
      if (permission_ids !== undefined) {
        await this.navigationService.assignPermissionsToNavigationItem(
          id,
          permission_ids,
        );
      }

      // Get full item with permissions
      const permissions =
        await this.navigationService.getNavigationItemPermissions(id);

      return reply.success(
        { ...updated, permissions },
        'Navigation item updated successfully',
      );
    } catch (error) {
      request.log.error(`Failed to update navigation item: ${error}`);

      if (
        error instanceof Error &&
        error.message === 'NAVIGATION_ITEM_NOT_FOUND'
      ) {
        return reply.notFound('Navigation item not found');
      }

      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to update navigation item',
        500,
      );
    }
  }

  /**
   * DELETE /api/navigation-items/:id
   * Delete navigation item
   */
  async deleteNavigationItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;

      const deleted = await this.navigationService.deleteNavigationItem(id);

      if (!deleted) {
        return reply.notFound('Navigation item not found');
      }

      return reply.success({ id }, 'Navigation item deleted successfully');
    } catch (error) {
      request.log.error(`Failed to delete navigation item: ${error}`);

      if (
        error instanceof Error &&
        error.message === 'NAVIGATION_ITEM_HAS_CHILDREN'
      ) {
        return reply.error(
          'HAS_CHILDREN',
          'Cannot delete navigation item with children. Delete children first.',
          400,
        );
      }

      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to delete navigation item',
        500,
      );
    }
  }

  /**
   * POST /api/navigation-items/reorder
   * Update multiple navigation items' sort orders
   */
  async reorderNavigationItems(
    request: FastifyRequest<{ Body: UpdateOrdersRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const { orders } = request.body;

      await this.navigationService.updateNavigationItemOrders(orders);

      return reply.success(
        { updated: orders.length },
        'Navigation items reordered successfully',
      );
    } catch (error) {
      request.log.error(`Failed to reorder navigation items: ${error}`);
      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to reorder navigation items',
        500,
      );
    }
  }

  /**
   * GET /api/navigation-items/:id/permissions
   * Get permissions for a navigation item
   */
  async getNavigationItemPermissions(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;

      const permissions =
        await this.navigationService.getNavigationItemPermissions(id);

      return reply.success(
        permissions,
        'Navigation item permissions retrieved successfully',
      );
    } catch (error) {
      request.log.error(`Failed to get navigation item permissions: ${error}`);
      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve permissions',
        500,
      );
    }
  }

  /**
   * POST /api/navigation-items/:id/permissions
   * Assign permissions to navigation item
   */
  async assignPermissions(
    request: FastifyRequest<{
      Params: { id: string };
      Body: AssignPermissionsRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const { permission_ids } = request.body;

      // Check if item exists
      const existing = await this.navigationService.getNavigationItemById(id);
      if (!existing) {
        return reply.notFound('Navigation item not found');
      }

      await this.navigationService.assignPermissionsToNavigationItem(
        id,
        permission_ids,
      );

      const permissions =
        await this.navigationService.getNavigationItemPermissions(id);

      return reply.success(permissions, 'Permissions assigned successfully');
    } catch (error) {
      request.log.error(`Failed to assign permissions: ${error}`);
      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to assign permissions',
        500,
      );
    }
  }

  /**
   * POST /api/navigation-items/:id/duplicate
   * Get navigation item data for duplication (frontend will handle creation via dialog)
   */
  async duplicateNavigationItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;

      // Get source item
      const sourceItem = await this.navigationService.getNavigationItemById(id);
      if (!sourceItem) {
        return reply.notFound('Navigation item not found');
      }

      // Get source permissions
      const permissions =
        await this.navigationService.getNavigationItemPermissions(id);

      // Return source data to frontend for dialog
      // Frontend will handle key modification and actual creation
      return reply.success(
        {
          ...sourceItem,
          permissions: permissions.map((p) => p.id),
        },
        'Navigation item data retrieved for duplication',
      );
    } catch (error) {
      request.log.error(`Failed to duplicate navigation item: ${error}`);
      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to duplicate navigation item',
        500,
      );
    }
  }
}

/**
 * Factory function to create navigation items controller
 */
export function createNavigationItemsController(
  navigationService: NavigationService,
) {
  const controller = new NavigationItemsController(navigationService);

  return {
    listNavigationItems: controller.listNavigationItems.bind(controller),
    getNavigationItem: controller.getNavigationItem.bind(controller),
    createNavigationItem: controller.createNavigationItem.bind(controller),
    updateNavigationItem: controller.updateNavigationItem.bind(controller),
    deleteNavigationItem: controller.deleteNavigationItem.bind(controller),
    reorderNavigationItems: controller.reorderNavigationItems.bind(controller),
    getNavigationItemPermissions:
      controller.getNavigationItemPermissions.bind(controller),
    assignPermissions: controller.assignPermissions.bind(controller),
    duplicateNavigationItem:
      controller.duplicateNavigationItem.bind(controller),
  };
}
