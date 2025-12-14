/**
 * Unit tests for layer-classifier
 *
 * Tests the layer classification logic based on proven patterns from
 * API Architecture Standardization project (Phase 3 migrations)
 */

const {
  determineLayer,
  validateClassification,
  getExamples,
  _internal,
} = require('../layer-classifier');

describe('Layer Classifier', () => {
  describe('determineLayer()', () => {
    describe('Core Layer Classification', () => {
      it('should classify auth as Core infrastructure', () => {
        const result = determineLayer('auth');

        expect(result.layer).toBe('core');
        expect(result.useFpWrapper).toBe(true);
        expect(result.moduleType).toBe('infrastructure');
        expect(result.urlPrefix).toBe('/v1/core/auth');
        expect(result.path).toContain('layers/core/auth');
      });

      it('should classify authentication as Core infrastructure', () => {
        const result = determineLayer('authentication');

        expect(result.layer).toBe('core');
        expect(result.useFpWrapper).toBe(true);
      });

      it('should classify monitoring as Core infrastructure', () => {
        const result = determineLayer('monitoring');

        expect(result.layer).toBe('core');
        expect(result.useFpWrapper).toBe(true);
        expect(result.moduleType).toBe('infrastructure');
      });

      it('should classify audit-trail as Core infrastructure', () => {
        const result = determineLayer('audit-trail');

        expect(result.layer).toBe('core');
        expect(result.useFpWrapper).toBe(true);
      });

      it('should classify security modules as Core', () => {
        const result = determineLayer('api-keys');

        expect(result.layer).toBe('core');
        expect(result.useFpWrapper).toBe(true);
      });
    });

    describe('Platform Layer Classification', () => {
      it('should classify users as Platform shared service', () => {
        const result = determineLayer('users');

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(false);
        expect(result.moduleType).toBe('leaf');
        expect(result.urlPrefix).toBe('/v1/platform/users');
        expect(result.path).toContain('layers/platform/users');
      });

      it('should classify RBAC as Platform shared service', () => {
        const result = determineLayer('rbac');

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(false);
      });

      it('should classify departments as Platform', () => {
        const result = determineLayer('departments');

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(false);
        expect(result.reasoning).toContain('multiple domains');
      });

      it('should classify file-upload as Platform', () => {
        const result = determineLayer('file-upload');

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(false);
      });

      it('should classify attachments as Platform', () => {
        const result = determineLayer('attachments');

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(false);
      });

      it('should classify pdf-export as Platform', () => {
        const result = determineLayer('pdf-export');

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(false);
      });

      it('should classify settings as Platform', () => {
        const result = determineLayer('settings');

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(false);
      });

      it('should classify navigation as Platform', () => {
        const result = determineLayer('navigation');

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(false);
      });

      it('should classify import as Platform', () => {
        const result = determineLayer('import');

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(false);
      });

      it('should use fp() for platform aggregators', () => {
        const result = determineLayer('import', { isAggregator: true });

        expect(result.layer).toBe('platform');
        expect(result.useFpWrapper).toBe(true);
        expect(result.moduleType).toBe('aggregator');
      });
    });

    describe('Domains Layer Classification', () => {
      it('should classify drugs in inventory domain as Domains', () => {
        const result = determineLayer('drugs', {
          domain: 'inventory',
          type: 'master-data',
        });

        expect(result.layer).toBe('domains');
        expect(result.useFpWrapper).toBe(false);
        expect(result.moduleType).toBe('leaf');
        expect(result.urlPrefix).toBe('/v1/domains/inventory/drugs');
        expect(result.path).toContain('layers/domains/inventory/master-data/drugs');
      });

      it('should classify equipment in inventory as Domains', () => {
        const result = determineLayer('equipment', {
          domain: 'inventory',
          type: 'master-data',
        });

        expect(result.layer).toBe('domains');
        expect(result.useFpWrapper).toBe(false);
      });

      it('should classify requisitions as Domains operational', () => {
        const result = determineLayer('requisitions', {
          domain: 'inventory',
          type: 'operations',
        });

        expect(result.layer).toBe('domains');
        expect(result.useFpWrapper).toBe(false);
        expect(result.reasoning).toContain('Transactional/operational');
      });

      it('should classify budget allocations as Domains', () => {
        const result = determineLayer('budget-allocations', {
          domain: 'inventory',
          type: 'budget',
        });

        expect(result.layer).toBe('domains');
        expect(result.useFpWrapper).toBe(false);
      });

      it('should use fp() for domain aggregators', () => {
        const result = determineLayer('inventory', {
          domain: 'inventory',
          isAggregator: true,
        });

        expect(result.layer).toBe('domains');
        expect(result.useFpWrapper).toBe(true);
        expect(result.moduleType).toBe('aggregator');
      });

      it('should classify admin/system-init as Domains', () => {
        const result = determineLayer('system-init', {
          domain: 'admin',
        });

        expect(result.layer).toBe('domains');
        expect(result.useFpWrapper).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should classify lookup tables (types/categories) as Platform', () => {
        const result = determineLayer('budget-types', {
          domain: 'inventory',
          type: 'master-data',
        });

        // Edge case: Even though it has "budget" and is in inventory domain,
        // it's a lookup table (ends with "types") so it should be Platform
        expect(result.layer).toBe('platform');
        expect(result.reasoning).toContain('master data/lookup configuration');
      });

      it('should classify drug-categories as Platform (lookup)', () => {
        const result = determineLayer('drug-categories', {
          domain: 'inventory',
          type: 'master-data',
        });

        expect(result.layer).toBe('platform');
        expect(result.reasoning).toContain('master data/lookup');
      });

      it('should classify status tables as Platform', () => {
        const result = determineLayer('requisition-statuses', {
          domain: 'inventory',
          type: 'master-data',
        });

        expect(result.layer).toBe('platform');
      });

      it('should classify transactions as Domains operational', () => {
        const result = determineLayer('stock-transactions', {
          domain: 'inventory',
          type: 'operations',
        });

        expect(result.layer).toBe('domains');
      });

      it('should default to Platform when no domain specified', () => {
        const result = determineLayer('some-new-module');

        expect(result.layer).toBe('platform');
        expect(result.reasoning).toContain('No specific domain specified');
      });

      it('should classify explicit platform domain as Platform', () => {
        const result = determineLayer('custom-module', {
          domain: 'platform',
        });

        expect(result.layer).toBe('platform');
      });

      it('should classify explicit shared domain as Platform', () => {
        const result = determineLayer('shared-service', {
          domain: 'shared',
        });

        expect(result.layer).toBe('platform');
      });
    });

    describe('Input Validation', () => {
      it('should throw error for missing moduleName', () => {
        expect(() => determineLayer()).toThrow('moduleName is required');
      });

      it('should throw error for null moduleName', () => {
        expect(() => determineLayer(null)).toThrow('moduleName is required');
      });

      it('should throw error for non-string moduleName', () => {
        expect(() => determineLayer(123)).toThrow('must be a string');
      });

      it('should handle empty options object', () => {
        const result = determineLayer('users', {});

        expect(result.layer).toBe('platform');
      });

      it('should handle undefined options', () => {
        const result = determineLayer('users');

        expect(result.layer).toBe('platform');
      });
    });

    describe('Naming Variations', () => {
      it('should handle hyphenated names', () => {
        const result = determineLayer('file-upload');

        expect(result.layer).toBe('platform');
      });

      it('should handle underscored names', () => {
        const result = determineLayer('user_profiles');

        expect(result.layer).toBe('platform');
      });

      it('should handle camelCase names', () => {
        const result = determineLayer('userProfiles');

        expect(result.layer).toBe('platform');
      });

      it('should be case-insensitive', () => {
        const result1 = determineLayer('USERS');
        const result2 = determineLayer('users');
        const result3 = determineLayer('Users');

        expect(result1.layer).toBe(result2.layer);
        expect(result2.layer).toBe(result3.layer);
      });
    });
  });

  describe('validateClassification()', () => {
    it('should validate correct Core layer classification', () => {
      const classification = determineLayer('auth');
      const validation = validateClassification(classification);

      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should validate correct Platform layer classification', () => {
      const classification = determineLayer('users');
      const validation = validateClassification(classification);

      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should validate correct Domains layer classification', () => {
      const classification = determineLayer('drugs', {
        domain: 'inventory',
        type: 'master-data',
      });
      const validation = validateClassification(classification);

      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should warn if Core module does not use fp() wrapper', () => {
      const classification = {
        layer: 'core',
        useFpWrapper: false,
        moduleType: 'infrastructure',
      };

      const validation = validateClassification(classification);

      expect(validation.isValid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('Core layer modules should use fp()');
    });

    it('should warn if Platform leaf module uses fp() wrapper', () => {
      const classification = {
        layer: 'platform',
        useFpWrapper: true,
        moduleType: 'leaf',
      };

      const validation = validateClassification(classification);

      expect(validation.isValid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('should NOT use fp()');
    });
  });

  describe('getExamples()', () => {
    it('should return array of examples', () => {
      const examples = getExamples();

      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeGreaterThan(0);
    });

    it('should include infrastructure example (auth)', () => {
      const examples = getExamples();
      const authExample = examples.find(ex => ex.input.moduleName === 'auth');

      expect(authExample).toBeDefined();
      expect(authExample.expected.layer).toBe('core');
      expect(authExample.expected.useFpWrapper).toBe(true);
    });

    it('should include platform example (users)', () => {
      const examples = getExamples();
      const usersExample = examples.find(ex => ex.input.moduleName === 'users');

      expect(usersExample).toBeDefined();
      expect(usersExample.expected.layer).toBe('platform');
      expect(usersExample.expected.useFpWrapper).toBe(false);
    });

    it('should include domain example (drugs)', () => {
      const examples = getExamples();
      const drugsExample = examples.find(ex => ex.input.moduleName === 'drugs');

      expect(drugsExample).toBeDefined();
      expect(drugsExample.expected.layer).toBe('domains');
      expect(drugsExample.expected.useFpWrapper).toBe(false);
    });

    it('should include edge case example (budget-types)', () => {
      const examples = getExamples();
      const budgetTypesExample = examples.find(ex => ex.input.moduleName === 'budget-types');

      expect(budgetTypesExample).toBeDefined();
      expect(budgetTypesExample.expected.layer).toBe('platform');
      expect(budgetTypesExample.description).toContain('Lookup table');
    });

    it('examples should match actual determineLayer results', () => {
      const examples = getExamples();

      examples.forEach(example => {
        const result = determineLayer(example.input.moduleName, example.input);

        expect(result.layer).toBe(example.expected.layer);
        expect(result.useFpWrapper).toBe(example.expected.useFpWrapper);
      });
    });
  });

  describe('Internal Helper Functions', () => {
    describe('normalize()', () => {
      it('should normalize strings to lowercase without hyphens/underscores', () => {
        expect(_internal.normalize('User-Profile')).toBe('userprofile');
        expect(_internal.normalize('user_profile')).toBe('userprofile');
        expect(_internal.normalize('USER')).toBe('user');
        expect(_internal.normalize('camelCase')).toBe('camelcase');
      });

      it('should handle empty string', () => {
        expect(_internal.normalize('')).toBe('');
      });

      it('should handle null/undefined', () => {
        expect(_internal.normalize(null)).toBe('');
        expect(_internal.normalize(undefined)).toBe('');
      });
    });

    describe('matchesAny()', () => {
      it('should match module name against list', () => {
        const list = ['users', 'departments', 'files'];

        expect(_internal.matchesAny('users', list)).toBe(true);
        expect(_internal.matchesAny('user', list)).toBe(true); // Partial match
        expect(_internal.matchesAny('departments', list)).toBe(true);
        expect(_internal.matchesAny('inventory', list)).toBe(false);
      });

      it('should be case-insensitive', () => {
        const list = ['Users'];

        expect(_internal.matchesAny('USERS', list)).toBe(true);
        expect(_internal.matchesAny('users', list)).toBe(true);
      });

      it('should handle hyphens and underscores', () => {
        const list = ['file-upload'];

        expect(_internal.matchesAny('file_upload', list)).toBe(true);
        expect(_internal.matchesAny('fileupload', list)).toBe(true);
      });
    });

    describe('isInfrastructureModule()', () => {
      it('should identify infrastructure modules', () => {
        expect(_internal.isInfrastructureModule('auth', null)).toBe(true);
        expect(_internal.isInfrastructureModule('monitoring', null)).toBe(true);
        expect(_internal.isInfrastructureModule('audit-trail', null)).toBe(true);
        expect(_internal.isInfrastructureModule('users', null)).toBe(false);
      });

      it('should check domain for infrastructure keywords', () => {
        expect(_internal.isInfrastructureModule('custom', 'core')).toBe(true);
        expect(_internal.isInfrastructureModule('custom', 'infrastructure')).toBe(true);
        expect(_internal.isInfrastructureModule('custom', 'inventory')).toBe(false);
      });
    });

    describe('isPlatformModule()', () => {
      it('should identify platform modules', () => {
        expect(_internal.isPlatformModule('users', null, null)).toBe(true);
        expect(_internal.isPlatformModule('departments', null, null)).toBe(true);
        expect(_internal.isPlatformModule('rbac', null, null)).toBe(true);
        expect(_internal.isPlatformModule('auth', null, null)).toBe(false);
      });

      it('should identify master data as platform', () => {
        expect(_internal.isPlatformModule('custom-types', null, 'master-data')).toBe(true);
        expect(_internal.isPlatformModule('status-codes', null, 'lookup')).toBe(true);
      });

      it('should check domain for platform keywords', () => {
        expect(_internal.isPlatformModule('custom', 'platform', null)).toBe(true);
        expect(_internal.isPlatformModule('custom', 'shared', null)).toBe(true);
      });
    });

    describe('isDomainModule()', () => {
      it('should identify domain modules', () => {
        expect(_internal.isDomainModule('drugs', 'inventory', null)).toBe(true);
        expect(_internal.isDomainModule('employees', 'hr', null)).toBe(true);
        expect(_internal.isDomainModule('invoices', 'finance', null)).toBe(true);
      });

      it('should identify operational indicators', () => {
        expect(_internal.isDomainModule('transactions', null, 'operations')).toBe(true);
        expect(_internal.isDomainModule('movements', null, 'operations')).toBe(true);
        expect(_internal.isDomainModule('requisitions', null, 'operations')).toBe(true);
      });

      it('should not classify lookup tables as domain', () => {
        expect(_internal.isDomainModule('drug-types', 'inventory', 'master-data')).toBe(false);
        expect(_internal.isDomainModule('status-codes', 'inventory', 'lookup')).toBe(false);
      });
    });

    describe('shouldUseFpWrapper()', () => {
      it('should always use fp() for Core layer', () => {
        expect(_internal.shouldUseFpWrapper('core', 'auth', false)).toBe(true);
        expect(_internal.shouldUseFpWrapper('core', 'auth', true)).toBe(true);
      });

      it('should always use fp() for aggregators', () => {
        expect(_internal.shouldUseFpWrapper('platform', 'import', true)).toBe(true);
        expect(_internal.shouldUseFpWrapper('domains', 'inventory', true)).toBe(true);
      });

      it('should not use fp() for platform leaf modules', () => {
        expect(_internal.shouldUseFpWrapper('platform', 'users', false)).toBe(false);
      });

      it('should not use fp() for domain leaf modules', () => {
        expect(_internal.shouldUseFpWrapper('domains', 'drugs', false)).toBe(false);
      });
    });

    describe('buildModulePath()', () => {
      it('should build correct path for Core layer', () => {
        const path = _internal.buildModulePath('core', null, null, 'auth');
        expect(path).toBe('apps/api/src/layers/core/auth');
      });

      it('should build correct path for Platform layer', () => {
        const path = _internal.buildModulePath('platform', null, null, 'users');
        expect(path).toBe('apps/api/src/layers/platform/users');
      });

      it('should build correct path for Domains layer', () => {
        const path = _internal.buildModulePath('domains', 'inventory', 'master-data', 'drugs');
        expect(path).toBe('apps/api/src/layers/domains/inventory/master-data/drugs');
      });

      it('should handle domains without type', () => {
        const path = _internal.buildModulePath('domains', 'admin', null, 'system-init');
        expect(path).toBe('apps/api/src/layers/domains/admin/system-init');
      });
    });

    describe('buildUrlPrefix()', () => {
      it('should build correct URL for Core layer', () => {
        const url = _internal.buildUrlPrefix('core', null, 'auth');
        expect(url).toBe('/v1/core/auth');
      });

      it('should build correct URL for Platform layer', () => {
        const url = _internal.buildUrlPrefix('platform', null, 'users');
        expect(url).toBe('/v1/platform/users');
      });

      it('should build correct URL for Domains layer', () => {
        const url = _internal.buildUrlPrefix('domains', 'inventory', 'drugs');
        expect(url).toBe('/v1/domains/inventory/drugs');
      });

      it('should handle domains without domain name', () => {
        const url = _internal.buildUrlPrefix('domains', null, 'custom');
        expect(url).toBe('/v1/domains/custom');
      });
    });
  });

  describe('Real-World Scenarios from Phase 3 Migrations', () => {
    it('should correctly classify all Batch 1 modules', () => {
      // Batch 1: departments, settings, navigation
      expect(determineLayer('departments').layer).toBe('platform');
      expect(determineLayer('settings').layer).toBe('platform');
      expect(determineLayer('navigation').layer).toBe('platform');
    });

    it('should correctly classify all Batch 2 modules', () => {
      // Batch 2: users, RBAC, file-upload, attachments, pdf-export, import-discovery
      expect(determineLayer('users').layer).toBe('platform');
      expect(determineLayer('rbac').layer).toBe('platform');
      expect(determineLayer('file-upload').layer).toBe('platform');
      expect(determineLayer('attachments').layer).toBe('platform');
      expect(determineLayer('pdf-export').layer).toBe('platform');
      expect(determineLayer('import').layer).toBe('platform');
    });

    it('should use correct plugin pattern for all migrated modules', () => {
      // All Platform leaf modules should NOT use fp() wrapper
      const batch1And2 = [
        'departments',
        'settings',
        'navigation',
        'users',
        'rbac',
        'file-upload',
        'attachments',
        'pdf-export',
      ];

      batch1And2.forEach(module => {
        const result = determineLayer(module);
        expect(result.useFpWrapper).toBe(false);
      });
    });

    it('should match migration patterns from documentation', () => {
      // From migration guide examples
      const drugsResult = determineLayer('drugs', {
        domain: 'inventory',
        type: 'master-data',
      });
      expect(drugsResult.layer).toBe('domains');
      expect(drugsResult.path).toContain('domains/inventory/master-data');

      const usersResult = determineLayer('users');
      expect(usersResult.layer).toBe('platform');
      expect(usersResult.urlPrefix).toBe('/v1/platform/users');
    });
  });
});
