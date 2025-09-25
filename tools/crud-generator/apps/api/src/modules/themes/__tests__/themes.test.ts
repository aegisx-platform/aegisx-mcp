import { test, expect, describe, beforeEach, afterEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestApp } from '../../../test/test-helper';
import { ThemesService } from '../themes.service';
import { CreateThemes, UpdateThemes } from '../themes.types';

describe('Themes CRUD Operations', () => {
  let app: FastifyInstance;
  let themesService: ThemesService;

  beforeEach(async () => {
    app = await createTestApp({
      plugins: ['themes-plugin']
    });
    
    themesService = new ThemesService();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /themes', () => {
    test('should create a new themes', async () => {
      const themesData: CreateThemes = {
        name: 'test-name',
        display_name: 'test-display_name',
        description: 'test-description',
        preview_image_url: 'test-preview_image_url',
        color_palette: null,
        css_variables: null,
        is_active: true,
        is_default: true,
        sort_order: 123,
        updated_at: null
      };

      const response = await app.inject({
        method: 'POST',
        url: '/themes',
        payload: themesData
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(themesData);
      expect(result.data.id).toBeDefined();

    });

    test('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/themes',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /themes/:id', () => {
    test('should get themes by id', async () => {
      // Create a themes first
      const themesData: CreateThemes = {
        name: 'test-name',
        display_name: 'test-display_name',
        description: 'test-description',
        preview_image_url: 'test-preview_image_url',
        color_palette: null,
        css_variables: null,
        is_active: true,
        is_default: true,
        sort_order: 123,
        updated_at: null
      };

      const createdThemes = await themesService.create(themesData);

      const response = await app.inject({
        method: 'GET',
        url: `/themes/${createdThemes.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(createdThemes.id);
    });

    test('should return 404 for non-existent themes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/themes/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /themes', () => {
    test('should list themess with pagination', async () => {
      // Create multiple themess
      const themesData: CreateThemes = {
        name: 'test-name',
        display_name: 'test-display_name',
        description: 'test-description',
        preview_image_url: 'test-preview_image_url',
        color_palette: null,
        css_variables: null,
        is_active: true,
        is_default: true,
        sort_order: 123,
        updated_at: null
      };

      await themesService.create(themesData);
      await themesService.create({...themesData});

      const response = await app.inject({
        method: 'GET',
        url: '/themes?page=1&limit=10'
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
      const themesData: CreateThemes = {
        name: 'searchable-name',
        display_name: 'searchable-display_name',
        description: 'searchable-description',
        preview_image_url: 'searchable-preview_image_url',
        color_palette: null,
        css_variables: null,
        is_active: true,
        is_default: true,
        sort_order: 123,
        updated_at: null
      };

      await themesService.create(themesData);

      const response = await app.inject({
        method: 'GET',
        url: '/themes?search=searchable'
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /themes/:id', () => {
    test('should update themes', async () => {
      // Create a themes first
      const themesData: CreateThemes = {
        name: 'original-name',
        display_name: 'original-display_name',
        description: 'original-description',
        preview_image_url: 'original-preview_image_url',
        color_palette: null,
        css_variables: null,
        is_active: true,
        is_default: true,
        sort_order: 123,
        updated_at: null
      };

      const createdThemes = await themesService.create(themesData);

      const updateData: UpdateThemes = {
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/themes/${createdThemes.id}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(updateData);

    });

    test('should return 404 for non-existent themes', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/themes/99999',
        payload: {}
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /themes/:id', () => {
    test('should delete themes', async () => {
      // Create a themes first
      const themesData: CreateThemes = {
        name: 'test-name',
        display_name: 'test-display_name',
        description: 'test-description',
        preview_image_url: 'test-preview_image_url',
        color_palette: null,
        css_variables: null,
        is_active: true,
        is_default: true,
        sort_order: 123,
        updated_at: null
      };

      const createdThemes = await themesService.create(themesData);

      const response = await app.inject({
        method: 'DELETE',
        url: `/themes/${createdThemes.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');


      // Verify themes is actually deleted
      const deletedThemes = await themesService.findById(createdThemes.id);
      expect(deletedThemes).toBeNull();
    });

    test('should return 404 for non-existent themes', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/themes/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

});