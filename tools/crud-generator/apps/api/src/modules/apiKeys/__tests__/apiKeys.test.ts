import { test, expect, describe, beforeEach, afterEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestApp } from '../../../test/test-helper';
import { ApiKeysService } from '../apiKeys.service';
import { CreateApiKeys, UpdateApiKeys } from '../apiKeys.types';

describe('ApiKeys CRUD Operations', () => {
  let app: FastifyInstance;
  let apiKeysService: ApiKeysService;

  beforeEach(async () => {
    app = await createTestApp({
      plugins: ['apiKeys-plugin']
    });
    
    apiKeysService = new ApiKeysService();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /apiKeys', () => {
    test('should create a new apiKeys', async () => {
      const apiKeysData: CreateApiKeys = {
        user_id: 'test-user_id',
        name: 'test-name',
        key_hash: 'test-key_hash',
        key_prefix: 'test-key_prefix',
        scopes: null,
        last_used_at: null,
        last_used_ip: 'test-last_used_ip',
        expires_at: null,
        is_active: true,
        updated_at: null
      };

      const response = await app.inject({
        method: 'POST',
        url: '/apiKeys',
        payload: apiKeysData
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(apiKeysData);
      expect(result.data.id).toBeDefined();

    });

    test('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/apiKeys',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /apiKeys/:id', () => {
    test('should get apiKeys by id', async () => {
      // Create a apiKeys first
      const apiKeysData: CreateApiKeys = {
        user_id: 'test-user_id',
        name: 'test-name',
        key_hash: 'test-key_hash',
        key_prefix: 'test-key_prefix',
        scopes: null,
        last_used_at: null,
        last_used_ip: 'test-last_used_ip',
        expires_at: null,
        is_active: true,
        updated_at: null
      };

      const createdApiKeys = await apiKeysService.create(apiKeysData);

      const response = await app.inject({
        method: 'GET',
        url: `/apiKeys/${createdApiKeys.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(createdApiKeys.id);
    });

    test('should return 404 for non-existent apiKeys', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/apiKeys/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /apiKeys', () => {
    test('should list apiKeyss with pagination', async () => {
      // Create multiple apiKeyss
      const apiKeysData: CreateApiKeys = {
        user_id: 'test-user_id',
        name: 'test-name',
        key_hash: 'test-key_hash',
        key_prefix: 'test-key_prefix',
        scopes: null,
        last_used_at: null,
        last_used_ip: 'test-last_used_ip',
        expires_at: null,
        is_active: true,
        updated_at: null
      };

      await apiKeysService.create(apiKeysData);
      await apiKeysService.create({...apiKeysData});

      const response = await app.inject({
        method: 'GET',
        url: '/apiKeys?page=1&limit=10'
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
      const apiKeysData: CreateApiKeys = {
        user_id: 'searchable-user_id',
        name: 'searchable-name',
        key_hash: 'searchable-key_hash',
        key_prefix: 'searchable-key_prefix',
        scopes: null,
        last_used_at: null,
        last_used_ip: 'searchable-last_used_ip',
        expires_at: null,
        is_active: true,
        updated_at: null
      };

      await apiKeysService.create(apiKeysData);

      const response = await app.inject({
        method: 'GET',
        url: '/apiKeys?search=searchable'
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /apiKeys/:id', () => {
    test('should update apiKeys', async () => {
      // Create a apiKeys first
      const apiKeysData: CreateApiKeys = {
        user_id: 'original-user_id',
        name: 'original-name',
        key_hash: 'original-key_hash',
        key_prefix: 'original-key_prefix',
        scopes: null,
        last_used_at: null,
        last_used_ip: 'original-last_used_ip',
        expires_at: null,
        is_active: true,
        updated_at: null
      };

      const createdApiKeys = await apiKeysService.create(apiKeysData);

      const updateData: UpdateApiKeys = {
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/apiKeys/${createdApiKeys.id}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(updateData);

    });

    test('should return 404 for non-existent apiKeys', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/apiKeys/99999',
        payload: {}
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /apiKeys/:id', () => {
    test('should delete apiKeys', async () => {
      // Create a apiKeys first
      const apiKeysData: CreateApiKeys = {
        user_id: 'test-user_id',
        name: 'test-name',
        key_hash: 'test-key_hash',
        key_prefix: 'test-key_prefix',
        scopes: null,
        last_used_at: null,
        last_used_ip: 'test-last_used_ip',
        expires_at: null,
        is_active: true,
        updated_at: null
      };

      const createdApiKeys = await apiKeysService.create(apiKeysData);

      const response = await app.inject({
        method: 'DELETE',
        url: `/apiKeys/${createdApiKeys.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');


      // Verify apiKeys is actually deleted
      const deletedApiKeys = await apiKeysService.findById(createdApiKeys.id);
      expect(deletedApiKeys).toBeNull();
    });

    test('should return 404 for non-existent apiKeys', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/apiKeys/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

});