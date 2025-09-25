import { FastifyInstance } from 'fastify';

export default async function testWebSocketRoutes(fastify: FastifyInstance) {
  // Test WebSocket event emission
  fastify.post('/test/websocket/emit', async (request, reply) => {
    const {
      feature = 'rbac',
      entity = 'role',
      action = 'created',
      data = {},
    } = request.body as any;

    try {
      // Emit WebSocket event using EventService
      if (fastify.eventService) {
        fastify.eventService.emit(feature, entity, action, data, 'normal');

        const eventName = `${feature}.${entity}.${action}`;

        return reply.send({
          success: true,
          data: {
            message: 'WebSocket event emitted successfully',
            event: eventName,
            emitted: true,
          },
        });
      } else {
        return reply.code(503).send({
          success: false,
          error: {
            code: 'WEBSOCKET_NOT_AVAILABLE',
            message: 'WebSocket service is not available',
          },
        });
      }
    } catch (error: any) {
      console.error('Failed to emit WebSocket event:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'EMISSION_FAILED',
          message: 'Failed to emit WebSocket event',
        },
      });
    }
  });

  // Test RBAC role creation (for realistic testing)
  fastify.post('/test/rbac/role', async (request, reply) => {
    const {
      name = 'Test Role',
      description,
      category = 'Test',
    } = request.body as any;

    try {
      // Create mock role data
      const roleId = `test-role-${Date.now()}`;
      const role = {
        id: roleId,
        name,
        description: description || `Test role: ${name}`,
        category,
        isActive: true,
        level: 1,
        permissions: [],
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const events: string[] = [];

      // Emit role created event
      if (fastify.eventService) {
        fastify.eventService.for('rbac', 'role').emitCreated(role);
        events.push('rbac.role.created');

        // Also emit a permission assignment event for testing using generic pattern
        const permissionData = {
          roleId: role.id,
          permissionId: 'test-permission-123',
          assignedBy: 'system',
        };
        fastify.eventService.for('rbac', 'permission').emitCustom('assigned', permissionData);
        events.push('rbac.permission.assigned');

        // Emit hierarchy change event using custom event
        const hierarchyData = {
          roleId: role.id,
          oldParentId: undefined,
          newParentId: 'root',
          changedBy: 'system',
        };
        fastify.eventService.for('rbac', 'hierarchy').emitCustom('changed', hierarchyData, 'high');
        events.push('rbac.hierarchy.changed');
      }

      return reply.send({
        success: true,
        data: {
          role,
          events,
        },
      });
    } catch (error: any) {
      console.error('Failed to create test role:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'ROLE_CREATION_FAILED',
          message: 'Failed to create test role',
        },
      });
    }
  });

  // Test bulk operations
  fastify.post('/test/rbac/bulk-operation', async (request, reply) => {
    const { operationType = 'update', itemCount = 5 } = request.body as any;
    const operationId = `bulk-${operationType}-${Date.now()}`;
    const events: string[] = [];

    try {
      if (fastify.eventService) {
        // Emit bulk started event
        fastify.eventService.emitBulkStarted('rbac', 'role', {
          operationId,
          total: itemCount,
          operation: operationType,
        });
        events.push('rbac.role.bulk_started');

        // Simulate progress with delay
        setTimeout(() => {
          for (let i = 1; i <= itemCount; i++) {
            setTimeout(() => {
              if (fastify.eventService) {
                // Emit progress event
                fastify.eventService.emitBulkProgress('rbac', 'role', {
                  operationId,
                  progress: {
                    total: itemCount,
                    completed: i,
                    failed: 0,
                    percentage: Math.round((i / itemCount) * 100),
                  },
                });

                // If this is the last item, emit completion
                if (i === itemCount) {
                  setTimeout(() => {
                    if (fastify.eventService) {
                      fastify.eventService.emitBulkCompleted('rbac', 'role', {
                        operationId,
                        results: {
                          successful: itemCount,
                          failed: 0,
                        },
                      });
                    }
                  }, 100);
                }
              }
            }, i * 200); // 200ms delay between each progress update
          }
        }, 500); // 500ms delay before starting

        events.push('rbac.role.bulk_progress (multiple)');
        events.push('rbac.role.bulk_completed');
      }

      return reply.send({
        success: true,
        data: {
          operationId,
          totalItems: itemCount,
          events,
        },
      });
    } catch (error: any) {
      console.error('Failed to simulate bulk operation:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'BULK_OPERATION_FAILED',
          message: 'Failed to simulate bulk operation',
        },
      });
    }
  });

  // Get WebSocket connection stats
  fastify.get('/test/websocket/stats', async (request, reply) => {
    try {
      if (fastify.eventService && fastify.websocketManager) {
        const stats = fastify.eventService.getConnectionStats();

        return reply.send({
          success: true,
          data: {
            websocketAvailable: true,
            stats,
          },
        });
      } else {
        return reply.send({
          success: true,
          data: {
            websocketAvailable: false,
            stats: null,
          },
        });
      }
    } catch (error: any) {
      console.error('Failed to get WebSocket stats:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'STATS_FAILED',
          message: 'Failed to get WebSocket statistics',
        },
      });
    }
  });
}
