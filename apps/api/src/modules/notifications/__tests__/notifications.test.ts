import { test, expect, describe, beforeEach, afterEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestApp } from '../../../test/test-helper';
import { NotificationsService } from '../notifications.service';
import { CreateNotifications, UpdateNotifications } from '../notifications.types';
import { EventService } from '../../../shared/websocket/event.service';

describe('Notifications CRUD Operations', () => {
  let app: FastifyInstance;
  let notificationsService: NotificationsService;
  let eventService: EventService;
  const eventSpy = jest.fn();

  beforeEach(async () => {
    app = await createTestApp({
      plugins: ['notifications-plugin']
    });
    
    notificationsService = new NotificationsService();
    eventService = new EventService();
    
    // Mock event emission for testing
    eventService.emitToRoom = eventSpy;
  });

  afterEach(async () => {
    await app.close();
    eventSpy.mockClear();
  });

  describe('POST /notifications', () => {
    test('should create a new notifications', async () => {
      const notificationsData: CreateNotifications = {
        user_id: 'test-user_id',
        type: 'test-type',
        title: 'test-title',
        message: 'test-message',
        data: null,
        action_url: 'test-action_url',
        read: true,
        read_at: null,
        archived: true,
        archived_at: null,
        priority: 'test-priority',
        expires_at: null,
        updated_at: null
      };

      const response = await app.inject({
        method: 'POST',
        url: '/notifications',
        payload: notificationsData
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(notificationsData);
      expect(result.data.id).toBeDefined();

      // Verify event was emitted
      expect(eventSpy).toHaveBeenCalledWith(
        'global',
        'notifications.created',
        expect.objectContaining(notificationsData)
      );
    });

    test('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/notifications',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /notifications/:id', () => {
    test('should get notifications by id', async () => {
      // Create a notifications first
      const notificationsData: CreateNotifications = {
        user_id: 'test-user_id',
        type: 'test-type',
        title: 'test-title',
        message: 'test-message',
        data: null,
        action_url: 'test-action_url',
        read: true,
        read_at: null,
        archived: true,
        archived_at: null,
        priority: 'test-priority',
        expires_at: null,
        updated_at: null
      };

      const createdNotifications = await notificationsService.create(notificationsData);

      const response = await app.inject({
        method: 'GET',
        url: `/notifications/${createdNotifications.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(createdNotifications.id);
    });

    test('should return 404 for non-existent notifications', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/notifications/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /notifications', () => {
    test('should list notificationss with pagination', async () => {
      // Create multiple notificationss
      const notificationsData: CreateNotifications = {
        user_id: 'test-user_id',
        type: 'test-type',
        title: 'test-title',
        message: 'test-message',
        data: null,
        action_url: 'test-action_url',
        read: true,
        read_at: null,
        archived: true,
        archived_at: null,
        priority: 'test-priority',
        expires_at: null,
        updated_at: null
      };

      await notificationsService.create(notificationsData);
      await notificationsService.create({...notificationsData});

      const response = await app.inject({
        method: 'GET',
        url: '/notifications?page=1&limit=10'
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    test('should support search functionality', async () => {
      const notificationsData: CreateNotifications = {
        user_id: 'searchable-user_id',
        type: 'searchable-type',
        title: 'searchable-title',
        message: 'searchable-message',
        data: null,
        action_url: 'searchable-action_url',
        read: true,
        read_at: null,
        archived: true,
        archived_at: null,
        priority: 'searchable-priority',
        expires_at: null,
        updated_at: null
      };

      await notificationsService.create(notificationsData);

      const response = await app.inject({
        method: 'GET',
        url: '/notifications?search=searchable'
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /notifications/:id', () => {
    test('should update notifications', async () => {
      // Create a notifications first
      const notificationsData: CreateNotifications = {
        user_id: 'original-user_id',
        type: 'original-type',
        title: 'original-title',
        message: 'original-message',
        data: null,
        action_url: 'original-action_url',
        read: true,
        read_at: null,
        archived: true,
        archived_at: null,
        priority: 'original-priority',
        expires_at: null,
        updated_at: null
      };

      const createdNotifications = await notificationsService.create(notificationsData);

      const updateData: UpdateNotifications = {
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/notifications/${createdNotifications.id}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(updateData);

      // Verify update event was emitted
      expect(eventSpy).toHaveBeenCalledWith(
        'global',
        'notifications.updated',
        expect.objectContaining(updateData)
      );
    });

    test('should return 404 for non-existent notifications', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/notifications/99999',
        payload: {}
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /notifications/:id', () => {
    test('should delete notifications', async () => {
      // Create a notifications first
      const notificationsData: CreateNotifications = {
        user_id: 'test-user_id',
        type: 'test-type',
        title: 'test-title',
        message: 'test-message',
        data: null,
        action_url: 'test-action_url',
        read: true,
        read_at: null,
        archived: true,
        archived_at: null,
        priority: 'test-priority',
        expires_at: null,
        updated_at: null
      };

      const createdNotifications = await notificationsService.create(notificationsData);

      const response = await app.inject({
        method: 'DELETE',
        url: `/notifications/${createdNotifications.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');

      // Verify delete event was emitted
      expect(eventSpy).toHaveBeenCalledWith(
        'global',
        'notifications.deleted',
        { id: createdNotifications.id }
      );

      // Verify notifications is actually deleted
      const deletedNotifications = await notificationsService.findById(createdNotifications.id);
      expect(deletedNotifications).toBeNull();
    });

    test('should return 404 for non-existent notifications', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/notifications/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('WebSocket Events', () => {
    test('should emit events for CRUD operations', async () => {
      const notificationsData: CreateNotifications = {
        user_id: 'event-test-user_id',
        type: 'event-test-type',
        title: 'event-test-title',
        message: 'event-test-message',
        data: null,
        action_url: 'event-test-action_url',
        read: true,
        read_at: null,
        archived: true,
        archived_at: null,
        priority: 'event-test-priority',
        expires_at: null,
        updated_at: null
      };

      // Test create event
      const createdNotifications = await notificationsService.create(notificationsData);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.any(String),
        'notifications.created',
        expect.objectContaining(notificationsData)
      );

      // Test update event
      const updateData = { /* update data */ };
      await notificationsService.update(createdNotifications.id, updateData);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.any(String),
        'notifications.updated',
        expect.any(Object)
      );

      // Test delete event
      await notificationsService.delete(createdNotifications.id);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.any(String),
        'notifications.deleted',
        { id: createdNotifications.id }
      );
    });
  });
});