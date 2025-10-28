import { test, expect, describe, beforeEach, afterEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestApp } from '../../../test/test-helper';
import { SystemSettingsService } from '../systemSettings.service';
import { CreateSystemSettings, UpdateSystemSettings } from '../systemSettings.types';
import { EventService } from '../../../shared/websocket/event.service';

describe('SystemSettings CRUD Operations', () => {
  let app: FastifyInstance;
  let systemSettingsService: SystemSettingsService;
  let eventService: EventService;
  const eventSpy = jest.fn();

  beforeEach(async () => {
    app = await createTestApp({
      plugins: ['systemSettings-plugin']
    });
    
    systemSettingsService = new SystemSettingsService();
    eventService = new EventService();
    
    // Mock event emission for testing
    eventService.emitToRoom = eventSpy;
  });

  afterEach(async () => {
    await app.close();
    eventSpy.mockClear();
  });

  describe('POST /systemSettings', () => {
    test('should create a new systemSettings', async () => {
      const systemSettingsData: CreateSystemSettings = {
        category: 'test-category',
        key: 'test-key',
        value: 'test-value',
        data_type: 'test-data_type',
        description: 'test-description',
        is_public: true,
        requires_restart: true,
        updated_at: null
      };

      const response = await app.inject({
        method: 'POST',
        url: '/systemSettings',
        payload: systemSettingsData
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(systemSettingsData);
      expect(result.data.id).toBeDefined();

      // Verify event was emitted
      expect(eventSpy).toHaveBeenCalledWith(
        'global',
        'systemSettings.created',
        expect.objectContaining(systemSettingsData)
      );
    });

    test('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/systemSettings',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /systemSettings/:id', () => {
    test('should get systemSettings by id', async () => {
      // Create a systemSettings first
      const systemSettingsData: CreateSystemSettings = {
        category: 'test-category',
        key: 'test-key',
        value: 'test-value',
        data_type: 'test-data_type',
        description: 'test-description',
        is_public: true,
        requires_restart: true,
        updated_at: null
      };

      const createdSystemSettings = await systemSettingsService.create(systemSettingsData);

      const response = await app.inject({
        method: 'GET',
        url: `/systemSettings/${createdSystemSettings.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(createdSystemSettings.id);
    });

    test('should return 404 for non-existent systemSettings', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/systemSettings/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /systemSettings', () => {
    test('should list systemSettingss with pagination', async () => {
      // Create multiple systemSettingss
      const systemSettingsData: CreateSystemSettings = {
        category: 'test-category',
        key: 'test-key',
        value: 'test-value',
        data_type: 'test-data_type',
        description: 'test-description',
        is_public: true,
        requires_restart: true,
        updated_at: null
      };

      await systemSettingsService.create(systemSettingsData);
      await systemSettingsService.create({...systemSettingsData});

      const response = await app.inject({
        method: 'GET',
        url: '/systemSettings?page=1&limit=10'
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
      const systemSettingsData: CreateSystemSettings = {
        category: 'searchable-category',
        key: 'searchable-key',
        value: 'searchable-value',
        data_type: 'searchable-data_type',
        description: 'searchable-description',
        is_public: true,
        requires_restart: true,
        updated_at: null
      };

      await systemSettingsService.create(systemSettingsData);

      const response = await app.inject({
        method: 'GET',
        url: '/systemSettings?search=searchable'
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /systemSettings/:id', () => {
    test('should update systemSettings', async () => {
      // Create a systemSettings first
      const systemSettingsData: CreateSystemSettings = {
        category: 'original-category',
        key: 'original-key',
        value: 'original-value',
        data_type: 'original-data_type',
        description: 'original-description',
        is_public: true,
        requires_restart: true,
        updated_at: null
      };

      const createdSystemSettings = await systemSettingsService.create(systemSettingsData);

      const updateData: UpdateSystemSettings = {
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/systemSettings/${createdSystemSettings.id}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(updateData);

      // Verify update event was emitted
      expect(eventSpy).toHaveBeenCalledWith(
        'global',
        'systemSettings.updated',
        expect.objectContaining(updateData)
      );
    });

    test('should return 404 for non-existent systemSettings', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/systemSettings/99999',
        payload: {}
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /systemSettings/:id', () => {
    test('should delete systemSettings', async () => {
      // Create a systemSettings first
      const systemSettingsData: CreateSystemSettings = {
        category: 'test-category',
        key: 'test-key',
        value: 'test-value',
        data_type: 'test-data_type',
        description: 'test-description',
        is_public: true,
        requires_restart: true,
        updated_at: null
      };

      const createdSystemSettings = await systemSettingsService.create(systemSettingsData);

      const response = await app.inject({
        method: 'DELETE',
        url: `/systemSettings/${createdSystemSettings.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');

      // Verify delete event was emitted
      expect(eventSpy).toHaveBeenCalledWith(
        'global',
        'systemSettings.deleted',
        { id: createdSystemSettings.id }
      );

      // Verify systemSettings is actually deleted
      const deletedSystemSettings = await systemSettingsService.findById(createdSystemSettings.id);
      expect(deletedSystemSettings).toBeNull();
    });

    test('should return 404 for non-existent systemSettings', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/systemSettings/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('WebSocket Events', () => {
    test('should emit events for CRUD operations', async () => {
      const systemSettingsData: CreateSystemSettings = {
        category: 'event-test-category',
        key: 'event-test-key',
        value: 'event-test-value',
        data_type: 'event-test-data_type',
        description: 'event-test-description',
        is_public: true,
        requires_restart: true,
        updated_at: null
      };

      // Test create event
      const createdSystemSettings = await systemSettingsService.create(systemSettingsData);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.any(String),
        'systemSettings.created',
        expect.objectContaining(systemSettingsData)
      );

      // Test update event
      const updateData = { /* update data */ };
      await systemSettingsService.update(createdSystemSettings.id, updateData);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.any(String),
        'systemSettings.updated',
        expect.any(Object)
      );

      // Test delete event
      await systemSettingsService.delete(createdSystemSettings.id);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.any(String),
        'systemSettings.deleted',
        { id: createdSystemSettings.id }
      );
    });
  });
});