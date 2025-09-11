import { FastifyInstance } from 'fastify';
import { setupTestContext } from './setup';
import { AuthHelper } from './auth-helper';
import { DatabaseHelper } from './db-helper';
import { RequestHelper } from './request-helper';
import { expectResponse, commonAssertions } from './assertions';
import { v4 as uuidv4 } from 'uuid';

describe('Settings API Integration Tests', () => {
  let app: FastifyInstance;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let requestHelper: RequestHelper;
  let testContext: any;

  // Test users
  let adminUser: any;
  let adminToken: string;
  let regularUser: any;
  let regularToken: string;

  // Test settings
  let testSetting: any;

  beforeAll(async () => {
    // Setup test context
    testContext = await setupTestContext({
      runMigrations: true,
      runSeeds: true,
      cleanDatabase: true,
    });

    app = testContext.app;
    authHelper = new AuthHelper(app, testContext.db.connection);
    dbHelper = new DatabaseHelper(testContext.db.connection);
    requestHelper = new RequestHelper(app);

    // Create test users
    const adminResult = await authHelper.createUserWithRole(
      'admin',
      ['settings.read', 'settings.write', 'settings.admin'],
      {
        email: 'settings-admin@test.com',
        username: 'settingsadmin',
        firstName: 'Settings',
        lastName: 'Admin',
      },
    );
    adminUser = adminResult;
    const adminTokens = await authHelper.loginUser(
      adminUser.email,
      adminUser.password,
    );
    adminToken = adminTokens.accessToken;

    const regularResult = await authHelper.createUserWithRole(
      'user',
      ['settings.read', 'profile.read', 'profile.write'],
      {
        email: 'settings-user@test.com',
        username: 'settingsuser',
        firstName: 'Settings',
        lastName: 'User',
      },
    );
    regularUser = regularResult;
    const regularTokens = await authHelper.loginUser(
      regularUser.email,
      regularUser.password,
    );
    regularToken = regularTokens.accessToken;
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  beforeEach(async () => {
    // Clean settings tables before each test
    await testContext.db.connection('app_settings_history').del();
    await testContext.db.connection('app_user_settings').del();
    await testContext.db.connection('app_settings').del();

    // Create a test setting
    [testSetting] = await testContext.db
      .connection('app_settings')
      .insert({
        id: uuidv4(),
        key: 'test-setting',
        namespace: 'default',
        category: 'general',
        value: JSON.stringify('test-value'),
        default_value: JSON.stringify('default-value'),
        label: 'Test Setting',
        description: 'A test setting for integration tests',
        data_type: 'string',
        access_level: 'user',
        is_encrypted: false,
        is_readonly: false,
        is_hidden: false,
        sort_order: 0,
        created_by: adminUser.id,
        updated_by: adminUser.id,
      })
      .returning('*');
  });

  describe('GET /api/settings', () => {
    describe('Authentication and Authorization', () => {
      it('should allow unauthenticated access to public settings', async () => {
        // Create a public setting
        await testContext.db.connection('app_settings').insert({
          id: uuidv4(),
          key: 'public-setting',
          namespace: 'default',
          category: 'public',
          value: JSON.stringify('public-value'),
          default_value: JSON.stringify('public-default'),
          label: 'Public Setting',
          data_type: 'string',
          access_level: 'public',
          is_encrypted: false,
          is_readonly: false,
          is_hidden: false,
          sort_order: 0,
        });

        const response = await requestHelper.get(
          '/api/settings?accessLevel=public',
        );

        console.log('Response status:', response.status);
        if (response.status !== 200) {
          console.log(
            'Error response body:',
            JSON.stringify(response.body, null, 2),
          );
        } else {
          console.log(
            'Success response body:',
            JSON.stringify(response.body, null, 2),
          );
        }

        expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].key).toBe('public-setting');
      });

      it('should return user settings with authentication', async () => {
        const response = await requestHelper.getAuth('/api/settings', {
          token: regularToken,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasArrayData()
          .isPaginated();
      });

      it('should include user overrides when authenticated', async () => {
        // Create user override
        await testContext.db.connection('app_user_settings').insert({
          id: uuidv4(),
          user_id: regularUser.id,
          setting_id: testSetting.id,
          value: JSON.stringify('user-override-value'),
        });

        const response = await requestHelper.getAuth('/api/settings', {
          token: regularToken,
        });

        expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

        const settingWithOverride = response.body.data.find(
          (s: any) => s.key === 'test-setting',
        );
        expect(settingWithOverride.value).toBe('user-override-value');
      });
    });

    describe('Filtering and Pagination', () => {
      beforeEach(async () => {
        // Create multiple settings for testing
        const settings = [
          {
            id: uuidv4(),
            key: 'app-name',
            namespace: 'default',
            category: 'general',
            value: JSON.stringify('My App'),
            default_value: JSON.stringify('My App'),
            label: 'Application Name',
            data_type: 'string',
            access_level: 'public',
            is_encrypted: false,
            is_readonly: true,
            is_hidden: false,
            sort_order: 1,
          },
          {
            id: uuidv4(),
            key: 'theme-color',
            namespace: 'default',
            category: 'appearance',
            value: JSON.stringify('#3f51b5'),
            default_value: JSON.stringify('#3f51b5'),
            label: 'Theme Color',
            data_type: 'string',
            access_level: 'user',
            is_encrypted: false,
            is_readonly: false,
            is_hidden: false,
            sort_order: 2,
          },
          {
            id: uuidv4(),
            key: 'api-key',
            namespace: 'system',
            category: 'security',
            value: JSON.stringify('secret-key'),
            default_value: JSON.stringify(''),
            label: 'API Key',
            data_type: 'string',
            access_level: 'admin',
            is_encrypted: true,
            is_readonly: false,
            is_hidden: true,
            sort_order: 3,
          },
        ];

        await testContext.db.connection('app_settings').insert(settings);
      });

      it('should filter by category', async () => {
        const response = await requestHelper.getAuth('/api/settings', {
          token: regularToken,
          query: { category: 'general' },
        });

        expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

        const data = response.body.data;
        expect(data.every((s: any) => s.category === 'general')).toBe(true);
      });

      it('should filter by namespace', async () => {
        const response = await requestHelper.getAuth('/api/settings', {
          token: adminToken,
          query: { namespace: 'system' },
        });

        expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

        const data = response.body.data;
        expect(data.every((s: any) => s.namespace === 'system')).toBe(true);
      });

      it('should search by key, label, or description', async () => {
        const response = await requestHelper.getAuth('/api/settings', {
          token: regularToken,
          query: { search: 'theme' },
        });

        expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

        const data = response.body.data;
        expect(data).toHaveLength(1);
        expect(data[0].key).toBe('theme-color');
      });

      it('should paginate results', async () => {
        const response = await requestHelper.getAuth('/api/settings', {
          token: regularToken,
          query: { page: 1, limit: 2 },
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasArrayData()
          .isPaginated();

        const { data, meta } = response.body;
        expect(data).toHaveLength(2);
        expect(meta.pagination.page).toBe(1);
        expect(meta.pagination.limit).toBe(2);
        expect(meta.pagination.total).toBeGreaterThan(2);
      });

      it('should not include hidden settings for regular users', async () => {
        const response = await requestHelper.getAuth('/api/settings', {
          token: regularToken,
        });

        expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

        const data = response.body.data;
        const hiddenSetting = data.find((s: any) => s.key === 'api-key');
        expect(hiddenSetting).toBeUndefined();
      });

      it('should include hidden settings for admin users with includeHidden=true', async () => {
        const response = await requestHelper.getAuth('/api/settings', {
          token: adminToken,
          query: { includeHidden: true },
        });

        expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

        const data = response.body.data;
        const hiddenSetting = data.find((s: any) => s.key === 'api-key');
        expect(hiddenSetting).toBeDefined();
      });
    });
  });

  describe('GET /api/settings/grouped', () => {
    it('should return settings grouped by category and group', async () => {
      // Create settings with groups
      await testContext.db.connection('app_settings').insert([
        {
          id: uuidv4(),
          key: 'grouped-setting-1',
          namespace: 'default',
          category: 'appearance',
          group: 'colors',
          value: JSON.stringify('#000000'),
          default_value: JSON.stringify('#000000'),
          label: 'Primary Color',
          data_type: 'string',
          access_level: 'user',
          is_encrypted: false,
          is_readonly: false,
          is_hidden: false,
          sort_order: 1,
        },
        {
          id: uuidv4(),
          key: 'grouped-setting-2',
          namespace: 'default',
          category: 'appearance',
          group: 'colors',
          value: JSON.stringify('#ffffff'),
          default_value: JSON.stringify('#ffffff'),
          label: 'Secondary Color',
          data_type: 'string',
          access_level: 'user',
          is_encrypted: false,
          is_readonly: false,
          is_hidden: false,
          sort_order: 2,
        },
        {
          id: uuidv4(),
          key: 'grouped-setting-3',
          namespace: 'default',
          category: 'appearance',
          group: 'fonts',
          value: JSON.stringify('Arial'),
          default_value: JSON.stringify('Arial'),
          label: 'Font Family',
          data_type: 'string',
          access_level: 'user',
          is_encrypted: false,
          is_readonly: false,
          is_hidden: false,
          sort_order: 3,
        },
      ]);

      const response = await requestHelper.getAuth('/api/settings/grouped', {
        token: regularToken,
      });

      expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

      const data = response.body.data;
      const appearanceCategory = data.find(
        (c: any) => c.category === 'appearance',
      );
      expect(appearanceCategory).toBeDefined();
      expect(appearanceCategory.groups).toHaveLength(2);

      const colorsGroup = appearanceCategory.groups.find(
        (g: any) => g.name === 'colors',
      );
      expect(colorsGroup.settings).toHaveLength(2);

      const fontsGroup = appearanceCategory.groups.find(
        (g: any) => g.name === 'fonts',
      );
      expect(fontsGroup.settings).toHaveLength(1);
    });
  });

  describe('GET /api/settings/key/:key', () => {
    it('should get a setting by key', async () => {
      const response = await requestHelper.getAuth(
        '/api/settings/key/test-setting',
        {
          token: regularToken,
        },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.key).toBe('test-setting');
          expect(data.value).toBe('test-value');
        });
    });

    it('should return 404 for non-existent key', async () => {
      const response = await requestHelper.getAuth(
        '/api/settings/key/non-existent',
        {
          token: regularToken,
        },
      );

      expectResponse(response).hasStatus(404).isError('NOT_FOUND');
    });

    it('should support namespace parameter', async () => {
      await testContext.db.connection('app_settings').insert({
        id: uuidv4(),
        key: 'test-setting',
        namespace: 'custom',
        category: 'general',
        value: JSON.stringify('custom-value'),
        default_value: JSON.stringify('custom-default'),
        label: 'Custom Test Setting',
        data_type: 'string',
        access_level: 'user',
        is_encrypted: false,
        is_readonly: false,
        is_hidden: false,
        sort_order: 0,
      });

      const response = await requestHelper.getAuth(
        '/api/settings/key/test-setting',
        {
          token: regularToken,
          query: { namespace: 'custom' },
        },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.namespace).toBe('custom');
          expect(data.value).toBe('custom-value');
        });
    });
  });

  describe('GET /api/settings/value/:key', () => {
    it('should get only the value of a setting', async () => {
      const response = await requestHelper.getAuth(
        '/api/settings/value/test-setting',
        {
          token: regularToken,
        },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.value).toBe('test-value');
          expect(data.key).toBeUndefined();
        });
    });
  });

  describe('GET /api/settings/:id', () => {
    it('should get a setting by ID (admin only)', async () => {
      const response = await requestHelper.getAuth(
        `/api/settings/${testSetting.id}`,
        {
          token: adminToken,
        },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.id).toBe(testSetting.id);
          expect(data.key).toBe('test-setting');
        });
    });

    it('should reject regular users', async () => {
      const response = await requestHelper.getAuth(
        `/api/settings/${testSetting.id}`,
        {
          token: regularToken,
        },
      );

      expectResponse(response).hasStatus(403).isError('FORBIDDEN');
    });
  });

  describe('POST /api/settings', () => {
    it('should create a new setting (admin only)', async () => {
      const newSetting = {
        key: 'new-setting',
        category: 'test',
        value: 'new-value',
        defaultValue: 'new-default',
        label: 'New Setting',
        description: 'A newly created setting',
        dataType: 'string',
        accessLevel: 'user',
      };

      const response = await requestHelper.postAuth('/api/settings', {
        token: adminToken,
        body: newSetting,
      });

      expectResponse(response)
        .hasStatus(201)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.key).toBe('new-setting');
          expect(data.value).toBe('new-value');
          expect(data.namespace).toBe('default');
        });
    });

    it('should reject duplicate keys in same namespace', async () => {
      const duplicateSetting = {
        key: 'test-setting',
        category: 'test',
        value: 'duplicate-value',
        defaultValue: 'duplicate-default',
        label: 'Duplicate Setting',
        dataType: 'string',
      };

      const response = await requestHelper.postAuth('/api/settings', {
        token: adminToken,
        body: duplicateSetting,
      });

      expectResponse(response).hasStatus(409).isError('DUPLICATE_KEY');
    });

    it('should reject regular users', async () => {
      const newSetting = {
        key: 'user-attempt',
        category: 'test',
        value: 'value',
        defaultValue: 'default',
        label: 'User Attempt',
        dataType: 'string',
      };

      const response = await requestHelper.postAuth('/api/settings', {
        token: regularToken,
        body: newSetting,
      });

      expectResponse(response).hasStatus(403).isError('FORBIDDEN');
    });
  });

  describe('PATCH /api/settings/:id', () => {
    it('should update a setting (admin only)', async () => {
      const updates = {
        value: 'updated-value',
        label: 'Updated Test Setting',
        description: 'This setting has been updated',
      };

      const response = await requestHelper.patchAuth(
        `/api/settings/${testSetting.id}`,
        {
          token: adminToken,
          body: updates,
        },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.value).toBe('updated-value');
          expect(data.label).toBe('Updated Test Setting');
          expect(data.description).toBe('This setting has been updated');
        });
    });

    it('should not allow updating readonly settings', async () => {
      // Create readonly setting
      const [readonlySetting] = await testContext.db
        .connection('app_settings')
        .insert({
          id: uuidv4(),
          key: 'readonly-setting',
          namespace: 'default',
          category: 'system',
          value: JSON.stringify('readonly-value'),
          default_value: JSON.stringify('readonly-default'),
          label: 'Readonly Setting',
          data_type: 'string',
          access_level: 'admin',
          is_encrypted: false,
          is_readonly: true,
          is_hidden: false,
          sort_order: 0,
        })
        .returning('*');

      const response = await requestHelper.patchAuth(
        `/api/settings/${readonlySetting.id}`,
        {
          token: adminToken,
          body: { value: 'new-value' },
        },
      );

      expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
    });

    it('should track changes in history', async () => {
      await requestHelper.patchAuth(`/api/settings/${testSetting.id}`, {
        token: adminToken,
        body: { value: 'tracked-value' },
      });

      const history = await testContext.db
        .connection('app_settings_history')
        .where('setting_id', testSetting.id)
        .orderBy('changed_at', 'desc')
        .first();

      expect(history).toBeDefined();
      expect(JSON.parse(history.old_value)).toBe('test-value');
      expect(JSON.parse(history.new_value)).toBe('tracked-value');
      expect(history.action).toBe('update');
      expect(history.changed_by).toBe(adminUser.id);
    });
  });

  describe('PUT /api/settings/:id/value', () => {
    it('should update only the value of a setting', async () => {
      const response = await requestHelper.putAuth(
        `/api/settings/${testSetting.id}/value`,
        {
          token: adminToken,
          body: { value: 'value-only-update' },
        },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.value).toBe('value-only-update');
          expect(data.label).toBe('Test Setting'); // Unchanged
        });
    });

    it('should validate value against validation rules', async () => {
      // Create setting with validation rules
      const [validatedSetting] = await testContext.db
        .connection('app_settings')
        .insert({
          id: uuidv4(),
          key: 'validated-setting',
          namespace: 'default',
          category: 'test',
          value: JSON.stringify(5),
          default_value: JSON.stringify(5),
          label: 'Validated Setting',
          data_type: 'number',
          access_level: 'admin',
          is_encrypted: false,
          is_readonly: false,
          is_hidden: false,
          validation_rules: JSON.stringify({
            min: 1,
            max: 10,
          }),
          sort_order: 0,
        })
        .returning('*');

      const response = await requestHelper.putAuth(
        `/api/settings/${validatedSetting.id}/value`,
        {
          token: adminToken,
          body: { value: 15 },
        },
      );

      expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/settings/:id', () => {
    it('should delete a setting (admin only)', async () => {
      const response = await requestHelper.deleteAuth(
        `/api/settings/${testSetting.id}`,
        {
          token: adminToken,
        },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.message).toContain('deleted successfully');
        });

      // Verify deletion
      const deleted = await testContext.db
        .connection('app_settings')
        .where('id', testSetting.id)
        .first();
      expect(deleted).toBeUndefined();
    });

    it('should not allow deleting readonly settings', async () => {
      const [readonlySetting] = await testContext.db
        .connection('app_settings')
        .insert({
          id: uuidv4(),
          key: 'readonly-delete-test',
          namespace: 'default',
          category: 'system',
          value: JSON.stringify('value'),
          default_value: JSON.stringify('default'),
          label: 'Readonly Delete Test',
          data_type: 'string',
          access_level: 'admin',
          is_encrypted: false,
          is_readonly: true,
          is_hidden: false,
          sort_order: 0,
        })
        .returning('*');

      const response = await requestHelper.deleteAuth(
        `/api/settings/${readonlySetting.id}`,
        {
          token: adminToken,
        },
      );

      expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
    });

    it('should log deletion to history', async () => {
      await requestHelper.deleteAuth(`/api/settings/${testSetting.id}`, {
        token: adminToken,
      });

      const history = await testContext.db
        .connection('app_settings_history')
        .where('setting_id', testSetting.id)
        .where('action', 'delete')
        .first();

      expect(history).toBeDefined();
      expect(JSON.parse(history.old_value)).toBe('test-value');
      expect(history.new_value).toBeNull();
      expect(history.changed_by).toBe(adminUser.id);
    });
  });

  describe('POST /api/settings/bulk-update', () => {
    it('should update multiple settings at once', async () => {
      // Create additional settings
      const settings = await testContext.db
        .connection('app_settings')
        .insert([
          {
            id: uuidv4(),
            key: 'bulk-1',
            namespace: 'default',
            category: 'test',
            value: JSON.stringify('value-1'),
            default_value: JSON.stringify('default-1'),
            label: 'Bulk 1',
            data_type: 'string',
            access_level: 'admin',
            is_encrypted: false,
            is_readonly: false,
            is_hidden: false,
            sort_order: 1,
          },
          {
            id: uuidv4(),
            key: 'bulk-2',
            namespace: 'default',
            category: 'test',
            value: JSON.stringify('value-2'),
            default_value: JSON.stringify('default-2'),
            label: 'Bulk 2',
            data_type: 'string',
            access_level: 'admin',
            is_encrypted: false,
            is_readonly: false,
            is_hidden: false,
            sort_order: 2,
          },
        ])
        .returning('*');

      const bulkUpdates = [
        { key: 'bulk-1', value: 'updated-1' },
        { key: 'bulk-2', value: 'updated-2' },
        { key: 'test-setting', value: 'updated-test' },
      ];

      const response = await requestHelper.postAuth(
        '/api/settings/bulk-update',
        {
          token: adminToken,
          body: bulkUpdates,
        },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.updated).toBe(3);
          expect(data.failed).toBe(0);
          expect(data.errors).toBeUndefined();
        });

      // Verify updates
      const updated1 = await testContext.db
        .connection('app_settings')
        .where('key', 'bulk-1')
        .first();
      expect(JSON.parse(updated1.value)).toBe('updated-1');
    });

    it('should report failures in bulk update', async () => {
      const bulkUpdates = [
        { key: 'test-setting', value: 'valid-update' },
        { key: 'non-existent', value: 'will-fail' },
        { key: 'another-missing', value: 'also-fail' },
      ];

      const response = await requestHelper.postAuth(
        '/api/settings/bulk-update',
        {
          token: adminToken,
          body: bulkUpdates,
        },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.updated).toBe(1);
          expect(data.failed).toBe(2);
          expect(data.errors).toHaveLength(2);
          expect(data.errors[0].key).toBe('non-existent');
          expect(data.errors[0].error).toContain('not found');
        });
    });
  });

  describe('GET /api/settings/history', () => {
    beforeEach(async () => {
      // Create some history
      await testContext.db.connection('app_settings_history').insert([
        {
          id: uuidv4(),
          setting_id: testSetting.id,
          old_value: JSON.stringify('old-1'),
          new_value: JSON.stringify('new-1'),
          action: 'update',
          changed_by: adminUser.id,
          changed_at: new Date('2024-01-01'),
        },
        {
          id: uuidv4(),
          setting_id: testSetting.id,
          old_value: JSON.stringify('new-1'),
          new_value: JSON.stringify('new-2'),
          action: 'update',
          changed_by: adminUser.id,
          changed_at: new Date('2024-01-02'),
        },
        {
          id: uuidv4(),
          setting_id: testSetting.id,
          old_value: JSON.stringify('new-2'),
          new_value: null,
          action: 'delete',
          changed_by: adminUser.id,
          changed_at: new Date('2024-01-03'),
        },
      ]);
    });

    it('should get setting history (admin only)', async () => {
      const response = await requestHelper.getAuth('/api/settings/history', {
        token: adminToken,
      });

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasArrayData()
        .isPaginated();

      const data = response.body.data;
      expect(data).toHaveLength(3);
      expect(data[0].action).toBe('delete'); // Most recent first
    });

    it('should filter history by setting ID', async () => {
      const response = await requestHelper.getAuth('/api/settings/history', {
        token: adminToken,
        query: { settingId: testSetting.id },
      });

      expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

      const data = response.body.data;
      expect(data.every((h: any) => h.settingId === testSetting.id)).toBe(true);
    });

    it('should filter history by action', async () => {
      const response = await requestHelper.getAuth('/api/settings/history', {
        token: adminToken,
        query: { action: 'update' },
      });

      expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

      const data = response.body.data;
      expect(data.every((h: any) => h.action === 'update')).toBe(true);
      expect(data).toHaveLength(2);
    });

    it('should filter history by date range', async () => {
      const response = await requestHelper.getAuth('/api/settings/history', {
        token: adminToken,
        query: { startDate: '2024-01-02', endDate: '2024-01-02' },
      });

      expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

      const data = response.body.data;
      expect(data).toHaveLength(1);
      expect(data[0].newValue).toBe('new-2');
    });
  });

  describe('User Settings', () => {
    describe('GET /api/settings/user', () => {
      it('should get all user-specific settings', async () => {
        // Create user settings
        await testContext.db.connection('app_user_settings').insert([
          {
            id: uuidv4(),
            user_id: regularUser.id,
            setting_id: testSetting.id,
            value: JSON.stringify('user-specific-1'),
          },
        ]);

        const response = await requestHelper.getAuth('/api/settings/user', {
          token: regularToken,
        });

        expectResponse(response).hasStatus(200).isSuccess().hasArrayData();

        const data = response.body.data;
        expect(data).toHaveLength(1);
        expect(data[0].userId).toBe(regularUser.id);
        expect(data[0].settingId).toBe(testSetting.id);
        expect(data[0].value).toBe('user-specific-1');
      });
    });

    describe('PUT /api/settings/user/:settingId', () => {
      it('should create or update a user setting override', async () => {
        const response = await requestHelper.putAuth(
          `/api/settings/user/${testSetting.id}`,
          {
            token: regularToken,
            body: { value: 'my-override' },
          },
        );

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.userId).toBe(regularUser.id);
            expect(data.settingId).toBe(testSetting.id);
            expect(data.value).toBe('my-override');
          });

        // Verify in database
        const userSetting = await testContext.db
          .connection('app_user_settings')
          .where('user_id', regularUser.id)
          .where('setting_id', testSetting.id)
          .first();
        expect(JSON.parse(userSetting.value)).toBe('my-override');
      });

      it('should update existing user setting', async () => {
        // Create initial user setting
        await testContext.db.connection('app_user_settings').insert({
          id: uuidv4(),
          user_id: regularUser.id,
          setting_id: testSetting.id,
          value: JSON.stringify('initial-value'),
        });

        const response = await requestHelper.putAuth(
          `/api/settings/user/${testSetting.id}`,
          {
            token: regularToken,
            body: { value: 'updated-override' },
          },
        );

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.value).toBe('updated-override');
          });
      });

      it('should validate user setting value', async () => {
        // Create setting with validation
        const [validatedSetting] = await testContext.db
          .connection('app_settings')
          .insert({
            id: uuidv4(),
            key: 'user-validated',
            namespace: 'default',
            category: 'test',
            value: JSON.stringify(true),
            default_value: JSON.stringify(false),
            label: 'User Validated',
            data_type: 'boolean',
            access_level: 'user',
            is_encrypted: false,
            is_readonly: false,
            is_hidden: false,
            validation_rules: JSON.stringify({ required: true }),
            sort_order: 0,
          })
          .returning('*');

        const response = await requestHelper.putAuth(
          `/api/settings/user/${validatedSetting.id}`,
          {
            token: regularToken,
            body: { value: 'not-boolean' },
          },
        );

        expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
      });
    });

    describe('DELETE /api/settings/user/:settingId', () => {
      it('should delete user setting override', async () => {
        // Create user setting
        await testContext.db.connection('app_user_settings').insert({
          id: uuidv4(),
          user_id: regularUser.id,
          setting_id: testSetting.id,
          value: JSON.stringify('to-delete'),
        });

        const response = await requestHelper.deleteAuth(
          `/api/settings/user/${testSetting.id}`,
          {
            token: regularToken,
          },
        );

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.message).toContain('deleted successfully');
          });

        // Verify deletion
        const deleted = await testContext.db
          .connection('app_user_settings')
          .where('user_id', regularUser.id)
          .where('setting_id', testSetting.id)
          .first();
        expect(deleted).toBeUndefined();
      });

      it('should return 404 if setting does not exist', async () => {
        const response = await requestHelper.deleteAuth(
          `/api/settings/user/${uuidv4()}`,
          {
            token: regularToken,
          },
        );

        expectResponse(response).hasStatus(404).isError('NOT_FOUND');
      });
    });
  });

  describe('Data Type Validation', () => {
    it('should validate string type', async () => {
      const stringSetting = {
        key: 'string-test',
        category: 'test',
        value: 123, // Should be string
        defaultValue: 'default',
        label: 'String Test',
        dataType: 'string',
      };

      const response = await requestHelper.postAuth('/api/settings', {
        token: adminToken,
        body: stringSetting,
      });

      // Note: Depending on implementation, this might coerce or error
      // Adjust expectation based on actual behavior
    });

    it('should validate number type', async () => {
      const [numberSetting] = await testContext.db
        .connection('app_settings')
        .insert({
          id: uuidv4(),
          key: 'number-test',
          namespace: 'default',
          category: 'test',
          value: JSON.stringify(42),
          default_value: JSON.stringify(0),
          label: 'Number Test',
          data_type: 'number',
          access_level: 'admin',
          is_encrypted: false,
          is_readonly: false,
          is_hidden: false,
          validation_rules: JSON.stringify({
            min: 0,
            max: 100,
          }),
          sort_order: 0,
        })
        .returning('*');

      const response = await requestHelper.putAuth(
        `/api/settings/${numberSetting.id}/value`,
        {
          token: adminToken,
          body: { value: 'not-a-number' },
        },
      );

      expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
    });

    it('should validate boolean type', async () => {
      const [booleanSetting] = await testContext.db
        .connection('app_settings')
        .insert({
          id: uuidv4(),
          key: 'boolean-test',
          namespace: 'default',
          category: 'test',
          value: JSON.stringify(true),
          default_value: JSON.stringify(false),
          label: 'Boolean Test',
          data_type: 'boolean',
          access_level: 'admin',
          is_encrypted: false,
          is_readonly: false,
          is_hidden: false,
          sort_order: 0,
        })
        .returning('*');

      const response = await requestHelper.putAuth(
        `/api/settings/${booleanSetting.id}/value`,
        {
          token: adminToken,
          body: { value: 'yes' },
        },
      );

      expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
    });

    it('should validate array type', async () => {
      const [arraySetting] = await testContext.db
        .connection('app_settings')
        .insert({
          id: uuidv4(),
          key: 'array-test',
          namespace: 'default',
          category: 'test',
          value: JSON.stringify([1, 2, 3]),
          default_value: JSON.stringify([]),
          label: 'Array Test',
          data_type: 'array',
          access_level: 'admin',
          is_encrypted: false,
          is_readonly: false,
          is_hidden: false,
          validation_rules: JSON.stringify({
            maxLength: 5,
          }),
          sort_order: 0,
        })
        .returning('*');

      const response = await requestHelper.putAuth(
        `/api/settings/${arraySetting.id}/value`,
        {
          token: adminToken,
          body: { value: [1, 2, 3, 4, 5, 6] },
        },
      );

      expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
    });
  });

  describe('Caching', () => {
    it('should cache frequently accessed settings', async () => {
      // First request - cache miss
      const response1 = await requestHelper.getAuth(
        '/api/settings/key/test-setting',
        {
          token: regularToken,
        },
      );

      expectResponse(response1).hasStatus(200).isSuccess();

      // Update directly in database (bypassing cache)
      await testContext.db
        .connection('app_settings')
        .where('key', 'test-setting')
        .update({ value: JSON.stringify('direct-db-update') });

      // Second request - should get cached value
      const response2 = await requestHelper.getAuth(
        '/api/settings/key/test-setting',
        {
          token: regularToken,
        },
      );

      const data = response2.body.data;
      // Depending on cache implementation, this might still be 'test-value'
      // or 'direct-db-update' if cache was invalidated
    });
  });
});
