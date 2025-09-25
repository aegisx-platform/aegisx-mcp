import { test, expect, describe, beforeEach, afterEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestApp } from '../../../test/test-helper';
import { UsersService } from '../users.service';
import { CreateUsers, UpdateUsers } from '../users.types';

describe('Users CRUD Operations', () => {
  let app: FastifyInstance;
  let usersService: UsersService;

  beforeEach(async () => {
    app = await createTestApp({
      plugins: ['users-plugin']
    });
    
    usersService = new UsersService();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    test('should create a new users', async () => {
      const usersData: CreateUsers = {
        email: 'test-email',
        username: 'test-username',
        password: 'test-password',
        first_name: 'test-first_name',
        last_name: 'test-last_name',
        is_active: true,
        last_login_at: null,
        updated_at: null,
        avatar_url: 'test-avatar_url',
        name: 'test-name',
        status: 'test-status',
        email_verified: true,
        email_verified_at: null,
        two_factor_enabled: true,
        two_factor_secret: 'test-two_factor_secret',
        two_factor_backup_codes: null,
        deleted_at: null,
        bio: 'test-bio',
        timezone: 'test-timezone',
        language: 'test-language',
        date_of_birth: null,
        phone: 'test-phone',
        deletion_reason: 'test-deletion_reason',
        recovery_deadline: null,
        deleted_by_ip: 'test-deleted_by_ip',
        deleted_by_user_agent: 'test-deleted_by_user_agent'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: usersData
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(usersData);
      expect(result.data.id).toBeDefined();

    });

    test('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /users/:id', () => {
    test('should get users by id', async () => {
      // Create a users first
      const usersData: CreateUsers = {
        email: 'test-email',
        username: 'test-username',
        password: 'test-password',
        first_name: 'test-first_name',
        last_name: 'test-last_name',
        is_active: true,
        last_login_at: null,
        updated_at: null,
        avatar_url: 'test-avatar_url',
        name: 'test-name',
        status: 'test-status',
        email_verified: true,
        email_verified_at: null,
        two_factor_enabled: true,
        two_factor_secret: 'test-two_factor_secret',
        two_factor_backup_codes: null,
        deleted_at: null,
        bio: 'test-bio',
        timezone: 'test-timezone',
        language: 'test-language',
        date_of_birth: null,
        phone: 'test-phone',
        deletion_reason: 'test-deletion_reason',
        recovery_deadline: null,
        deleted_by_ip: 'test-deleted_by_ip',
        deleted_by_user_agent: 'test-deleted_by_user_agent'
      };

      const createdUsers = await usersService.create(usersData);

      const response = await app.inject({
        method: 'GET',
        url: `/users/${createdUsers.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(createdUsers.id);
    });

    test('should return 404 for non-existent users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /users', () => {
    test('should list userss with pagination', async () => {
      // Create multiple userss
      const usersData: CreateUsers = {
        email: 'test-email',
        username: 'test-username',
        password: 'test-password',
        first_name: 'test-first_name',
        last_name: 'test-last_name',
        is_active: true,
        last_login_at: null,
        updated_at: null,
        avatar_url: 'test-avatar_url',
        name: 'test-name',
        status: 'test-status',
        email_verified: true,
        email_verified_at: null,
        two_factor_enabled: true,
        two_factor_secret: 'test-two_factor_secret',
        two_factor_backup_codes: null,
        deleted_at: null,
        bio: 'test-bio',
        timezone: 'test-timezone',
        language: 'test-language',
        date_of_birth: null,
        phone: 'test-phone',
        deletion_reason: 'test-deletion_reason',
        recovery_deadline: null,
        deleted_by_ip: 'test-deleted_by_ip',
        deleted_by_user_agent: 'test-deleted_by_user_agent'
      };

      await usersService.create(usersData);
      await usersService.create({...usersData});

      const response = await app.inject({
        method: 'GET',
        url: '/users?page=1&limit=10'
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
      const usersData: CreateUsers = {
        email: 'searchable-email',
        username: 'searchable-username',
        password: 'searchable-password',
        first_name: 'searchable-first_name',
        last_name: 'searchable-last_name',
        is_active: true,
        last_login_at: null,
        updated_at: null,
        avatar_url: 'searchable-avatar_url',
        name: 'searchable-name',
        status: 'searchable-status',
        email_verified: true,
        email_verified_at: null,
        two_factor_enabled: true,
        two_factor_secret: 'searchable-two_factor_secret',
        two_factor_backup_codes: null,
        deleted_at: null,
        bio: 'searchable-bio',
        timezone: 'searchable-timezone',
        language: 'searchable-language',
        date_of_birth: null,
        phone: 'searchable-phone',
        deletion_reason: 'searchable-deletion_reason',
        recovery_deadline: null,
        deleted_by_ip: 'searchable-deleted_by_ip',
        deleted_by_user_agent: 'searchable-deleted_by_user_agent'
      };

      await usersService.create(usersData);

      const response = await app.inject({
        method: 'GET',
        url: '/users?search=searchable'
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /users/:id', () => {
    test('should update users', async () => {
      // Create a users first
      const usersData: CreateUsers = {
        email: 'original-email',
        username: 'original-username',
        password: 'original-password',
        first_name: 'original-first_name',
        last_name: 'original-last_name',
        is_active: true,
        last_login_at: null,
        updated_at: null,
        avatar_url: 'original-avatar_url',
        name: 'original-name',
        status: 'original-status',
        email_verified: true,
        email_verified_at: null,
        two_factor_enabled: true,
        two_factor_secret: 'original-two_factor_secret',
        two_factor_backup_codes: null,
        deleted_at: null,
        bio: 'original-bio',
        timezone: 'original-timezone',
        language: 'original-language',
        date_of_birth: null,
        phone: 'original-phone',
        deletion_reason: 'original-deletion_reason',
        recovery_deadline: null,
        deleted_by_ip: 'original-deleted_by_ip',
        deleted_by_user_agent: 'original-deleted_by_user_agent'
      };

      const createdUsers = await usersService.create(usersData);

      const updateData: UpdateUsers = {
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/users/${createdUsers.id}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(updateData);

    });

    test('should return 404 for non-existent users', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/99999',
        payload: {}
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    test('should delete users', async () => {
      // Create a users first
      const usersData: CreateUsers = {
        email: 'test-email',
        username: 'test-username',
        password: 'test-password',
        first_name: 'test-first_name',
        last_name: 'test-last_name',
        is_active: true,
        last_login_at: null,
        updated_at: null,
        avatar_url: 'test-avatar_url',
        name: 'test-name',
        status: 'test-status',
        email_verified: true,
        email_verified_at: null,
        two_factor_enabled: true,
        two_factor_secret: 'test-two_factor_secret',
        two_factor_backup_codes: null,
        deleted_at: null,
        bio: 'test-bio',
        timezone: 'test-timezone',
        language: 'test-language',
        date_of_birth: null,
        phone: 'test-phone',
        deletion_reason: 'test-deletion_reason',
        recovery_deadline: null,
        deleted_by_ip: 'test-deleted_by_ip',
        deleted_by_user_agent: 'test-deleted_by_user_agent'
      };

      const createdUsers = await usersService.create(usersData);

      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${createdUsers.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');


      // Verify users is actually deleted
      const deletedUsers = await usersService.findById(createdUsers.id);
      expect(deletedUsers).toBeNull();
    });

    test('should return 404 for non-existent users', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/users/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

});