/**
 * Layer Classification Utility
 *
 * Determines the correct layer (Core, Platform, or Domains) for a given module
 * based on proven categorization rules from the API Architecture Standardization project.
 *
 * @module layer-classifier
 */

const chalk = require('chalk');

/**
 * Classification result object
 * @typedef {Object} LayerClassification
 * @property {'core' | 'platform' | 'domains'} layer - The architectural layer
 * @property {string} path - File system path for the module
 * @property {string} urlPrefix - URL prefix for routes
 * @property {boolean} useFpWrapper - Whether to use fastify-plugin wrapper
 * @property {string} moduleType - Type of module (leaf, aggregator, infrastructure)
 * @property {string} reasoning - Explanation of classification decision
 */

/**
 * Infrastructure modules that belong in Core layer
 * These modules decorate Fastify instance or provide system-wide infrastructure
 */
const INFRASTRUCTURE_MODULES = [
  'auth',
  'authentication',
  'security',
  'api-keys',
  'rate-limiting',
  'monitoring',
  'logging',
  'metrics',
  'health-check',
  'audit',
  'audit-trail',
  'compliance',
];

/**
 * Platform modules - shared services used by multiple domains
 * These provide horizontal functionality across the application
 */
const PLATFORM_MODULES = [
  'users',
  'user',
  'rbac',
  'roles',
  'permissions',
  'departments',
  'department',
  'files',
  'file-upload',
  'file-download',
  'attachments',
  'attachment',
  'pdf',
  'pdf-export',
  'pdf-templates',
  'settings',
  'setting',
  'configuration',
  'config',
  'navigation',
  'menu',
  'import',
  'export',
  'import-export',
];

/**
 * Known business domains
 */
const BUSINESS_DOMAINS = [
  'inventory',
  'hr',
  'human-resources',
  'finance',
  'accounting',
  'procurement',
  'sales',
  'marketing',
  'admin',
  'administration',
  'budget',
  'budgeting',
];

/**
 * Module types that indicate master data / lookup tables
 * Even if they contain domain names, these are typically Platform layer
 */
const MASTER_DATA_INDICATORS = [
  'master-data',
  'types',
  'categories',
  'status',
  'statuses',
  'lookup',
  'reference',
  'codes',
  'config',
  'configuration',
];

/**
 * Module types that indicate operational/transactional data
 * These typically belong in Domain layer
 */
const OPERATIONAL_INDICATORS = [
  'operations',
  'transactions',
  'movements',
  'requisitions',
  'requests',
  'orders',
  'allocations',
  'approvals',
  'workflows',
];

/**
 * Normalize a string for comparison (lowercase, remove hyphens/underscores)
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[-_]/g, '');
}

/**
 * Check if a module name matches any item in a list
 * @param {string} moduleName - Module name to check
 * @param {string[]} list - List of patterns to match against
 * @returns {boolean} True if match found
 */
function matchesAny(moduleName, list) {
  const normalized = normalize(moduleName);
  return list.some(
    (item) =>
      normalized.includes(normalize(item)) ||
      normalize(item).includes(normalized),
  );
}

/**
 * Determine if a module is infrastructure-level
 * @param {string} moduleName - Name of the module
 * @param {string} domain - Domain name (if any)
 * @returns {boolean} True if infrastructure module
 */
function isInfrastructureModule(moduleName, domain) {
  // Check if explicitly in infrastructure list
  if (matchesAny(moduleName, INFRASTRUCTURE_MODULES)) {
    return true;
  }

  // Check if domain is infrastructure-related
  if (domain && matchesAny(domain, ['core', 'infrastructure', 'system'])) {
    return true;
  }

  return false;
}

/**
 * Determine if a module is platform-level (shared service)
 * @param {string} moduleName - Name of the module
 * @param {string} domain - Domain name (if any)
 * @param {string} type - Module type (e.g., 'master-data', 'operations')
 * @returns {boolean} True if platform module
 */
function isPlatformModule(moduleName, domain, type) {
  // Check if explicitly in platform modules list
  if (matchesAny(moduleName, PLATFORM_MODULES)) {
    return true;
  }

  // Check if domain is platform
  if (domain && matchesAny(domain, ['platform', 'shared', 'common'])) {
    return true;
  }

  // Edge case: Lookup tables are Platform even if named after domain
  // Check if module name ends with lookup indicators (types, categories, etc.)
  const normalized = normalize(moduleName);
  const isLookupTable = MASTER_DATA_INDICATORS.some((indicator) => {
    const normalizedIndicator = normalize(indicator);
    // Skip checking against 'master-data' and 'operations' as they're type indicators, not name patterns
    if (
      normalizedIndicator === 'masterdata' ||
      normalizedIndicator === 'operations'
    ) {
      return false;
    }
    return normalized.endsWith(normalizedIndicator);
  });

  if (isLookupTable) {
    return true;
  }

  return false;
}

/**
 * Determine if a module belongs to a business domain
 * @param {string} moduleName - Name of the module
 * @param {string} domain - Domain name (if any)
 * @param {string} type - Module type
 * @returns {boolean} True if domain module
 */
function isDomainModule(moduleName, domain, type) {
  // First check if it's a lookup table (ends with types, categories, etc.)
  // These are Platform even if they have a business domain
  const normalized = normalize(moduleName);
  const isLookupTable = MASTER_DATA_INDICATORS.some((indicator) => {
    const normalizedIndicator = normalize(indicator);
    // Skip checking against 'master-data' and 'operations' as they're type indicators, not name patterns
    if (
      normalizedIndicator === 'masterdata' ||
      normalizedIndicator === 'operations'
    ) {
      return false;
    }
    return normalized.endsWith(normalizedIndicator);
  });

  if (isLookupTable) {
    return false; // Lookup tables go to Platform
  }

  // If domain is explicitly a business domain (and not a lookup table)
  if (domain && matchesAny(domain, BUSINESS_DOMAINS)) {
    return true;
  }

  // If type indicates operational/transactional data
  if (type && matchesAny(type, OPERATIONAL_INDICATORS)) {
    return true;
  }

  // If module name contains business domain keywords
  if (
    BUSINESS_DOMAINS.some((businessDomain) =>
      normalized.includes(normalize(businessDomain)),
    )
  ) {
    // But not if it's a simple type/category (those are Platform)
    if (!isLookupTable) {
      return true;
    }
  }

  return false;
}

/**
 * Determine if a module should use fastify-plugin (fp) wrapper
 * @param {string} layer - The layer (core, platform, domains)
 * @param {string} moduleName - Name of the module
 * @param {boolean} isAggregator - Whether module aggregates child plugins
 * @returns {boolean} True if should use fp() wrapper
 */
function shouldUseFpWrapper(layer, moduleName, isAggregator = false) {
  // Core layer: ALWAYS use fp() wrapper (infrastructure services)
  if (layer === 'core') {
    return true;
  }

  // Aggregator plugins: ALWAYS use fp() wrapper
  if (isAggregator) {
    return true;
  }

  // Platform layer: Plain async function for leaf modules
  if (layer === 'platform') {
    return false; // Leaf modules don't need fp()
  }

  // Domains layer: Plain async function for leaf modules
  if (layer === 'domains') {
    return false; // Leaf modules don't need fp()
  }

  return false; // Default: no fp() wrapper
}

/**
 * Build file system path for a module
 * @param {string} layer - The layer
 * @param {string} domain - Domain name
 * @param {string} type - Module type
 * @param {string} moduleName - Module name
 * @returns {string} File system path
 */
function buildModulePath(layer, domain, type, moduleName) {
  const parts = ['apps', 'api', 'src', 'layers', layer];

  if (layer === 'domains') {
    // Domains: layers/domains/{domain}/{type}/{module}
    if (domain) parts.push(domain);
    if (type) parts.push(type);
    parts.push(moduleName);
  } else if (layer === 'platform') {
    // Platform: layers/platform/{module}
    parts.push(moduleName);
  } else if (layer === 'core') {
    // Core: layers/core/{module}
    parts.push(moduleName);
  }

  return parts.join('/');
}

/**
 * Build URL prefix for a module
 * @param {string} layer - The layer
 * @param {string} domain - Domain name
 * @param {string} moduleName - Module name
 * @returns {string} URL prefix (without /api - bootstrap adds that)
 */
function buildUrlPrefix(layer, domain, moduleName) {
  if (layer === 'domains') {
    // Domains: /v1/domains/{domain}/{module}
    return domain
      ? `/v1/domains/${domain}/${moduleName}`
      : `/v1/domains/${moduleName}`;
  } else if (layer === 'platform') {
    // Platform: /v1/platform/{module}
    return `/v1/platform/${moduleName}`;
  } else if (layer === 'core') {
    // Core: /v1/core/{module}
    return `/v1/core/${moduleName}`;
  }

  return `/v1/${moduleName}`;
}

/**
 * Determine the architectural layer for a given module
 *
 * Uses proven categorization rules from API Architecture Standardization:
 * 1. Infrastructure services → Core layer
 * 2. Multi-domain shared services → Platform layer
 * 3. Domain-specific business logic → Domains layer
 *
 * @param {string} moduleName - Name of the module/table
 * @param {Object} options - Classification options
 * @param {string} [options.domain] - Business domain (e.g., 'inventory', 'hr')
 * @param {string} [options.type] - Module type (e.g., 'master-data', 'operations')
 * @param {boolean} [options.isAggregator=false] - Whether module registers child plugins
 * @returns {LayerClassification} Classification result
 *
 * @example
 * // Platform module (shared service)
 * const result = determineLayer('users');
 * // => { layer: 'platform', path: 'apps/api/src/layers/platform/users', ... }
 *
 * @example
 * // Domain module
 * const result = determineLayer('drugs', { domain: 'inventory', type: 'master-data' });
 * // => { layer: 'domains', path: 'apps/api/src/layers/domains/inventory/master-data/drugs', ... }
 *
 * @example
 * // Core infrastructure module
 * const result = determineLayer('auth');
 * // => { layer: 'core', path: 'apps/api/src/layers/core/auth', useFpWrapper: true, ... }
 */
function determineLayer(moduleName, options = {}) {
  const { domain = null, type = null, isAggregator = false } = options;

  // Input validation
  if (!moduleName || typeof moduleName !== 'string') {
    throw new Error('moduleName is required and must be a string');
  }

  let layer;
  let reasoning;
  let moduleType = 'leaf';

  // Decision tree based on architecture specification

  // Step 1: Check if infrastructure module → Core layer
  if (isInfrastructureModule(moduleName, domain)) {
    layer = 'core';
    moduleType = 'infrastructure';
    reasoning =
      'Infrastructure service that decorates Fastify instance or provides system-wide functionality';
  }
  // Step 2: Check if platform module → Platform layer
  else if (isPlatformModule(moduleName, domain, type)) {
    layer = 'platform';
    moduleType = isAggregator ? 'aggregator' : 'leaf';
    reasoning =
      'Shared service used by multiple domains (horizontal functionality)';

    // Edge case reasoning
    const normalized = normalize(moduleName);
    const isLookupTable = MASTER_DATA_INDICATORS.some((indicator) =>
      normalized.endsWith(normalize(indicator)),
    );
    if ((type && matchesAny(type, MASTER_DATA_INDICATORS)) || isLookupTable) {
      reasoning +=
        ". Classified as Platform because it's master data/lookup configuration, not transactional business logic";
    }
  }
  // Step 3: Check if domain module → Domains layer
  else if (isDomainModule(moduleName, domain, type)) {
    layer = 'domains';
    moduleType = isAggregator ? 'aggregator' : 'leaf';
    reasoning = `Domain-specific business logic for ${domain || 'specific business area'}`;

    if (type && matchesAny(type, OPERATIONAL_INDICATORS)) {
      reasoning += '. Transactional/operational data specific to this domain';
    }
  }
  // Step 4: Default to Platform if no domain specified
  else if (!domain || domain === 'platform' || domain === 'shared') {
    layer = 'platform';
    moduleType = isAggregator ? 'aggregator' : 'leaf';
    reasoning =
      'No specific domain specified - defaulting to Platform layer as shared service';
  }
  // Step 5: Has domain but not matched → Domains layer
  else {
    layer = 'domains';
    moduleType = isAggregator ? 'aggregator' : 'leaf';
    reasoning = `Module belongs to ${domain} domain by explicit classification`;
  }

  // Determine if fp() wrapper should be used
  const useFpWrapper = shouldUseFpWrapper(layer, moduleName, isAggregator);

  // Build paths
  const path = buildModulePath(layer, domain, type, moduleName);
  const urlPrefix = buildUrlPrefix(layer, domain, moduleName);

  return {
    layer,
    path,
    urlPrefix,
    useFpWrapper,
    moduleType,
    reasoning,
  };
}

/**
 * Validate a layer classification against known rules
 * @param {LayerClassification} classification - Classification to validate
 * @returns {Object} Validation result with warnings
 */
function validateClassification(classification) {
  const warnings = [];

  // Validate Core layer
  if (classification.layer === 'core') {
    if (!classification.useFpWrapper) {
      warnings.push(
        'Core layer modules should use fp() wrapper for infrastructure services',
      );
    }
  }

  // Validate Platform layer
  if (classification.layer === 'platform') {
    if (classification.useFpWrapper && classification.moduleType === 'leaf') {
      warnings.push(
        'Platform leaf modules should NOT use fp() wrapper (use plain async function)',
      );
    }
  }

  // Validate Domains layer
  if (classification.layer === 'domains') {
    if (classification.useFpWrapper && classification.moduleType === 'leaf') {
      warnings.push(
        'Domain leaf modules should NOT use fp() wrapper (use plain async function)',
      );
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Get classification examples for documentation/testing
 * @returns {Array<Object>} Array of example classifications
 */
function getExamples() {
  return [
    {
      input: { moduleName: 'auth' },
      expected: { layer: 'core', useFpWrapper: true },
      description: 'Infrastructure service - authentication',
    },
    {
      input: { moduleName: 'users' },
      expected: { layer: 'platform', useFpWrapper: false },
      description: 'Shared service used by all domains',
    },
    {
      input: { moduleName: 'departments' },
      expected: { layer: 'platform', useFpWrapper: false },
      description: 'Multi-domain organizational structure',
    },
    {
      input: { moduleName: 'drugs', domain: 'inventory', type: 'master-data' },
      expected: { layer: 'domains', useFpWrapper: false },
      description: 'Domain-specific master data',
    },
    {
      input: {
        moduleName: 'requisitions',
        domain: 'inventory',
        type: 'operations',
      },
      expected: { layer: 'domains', useFpWrapper: false },
      description: 'Domain-specific operational data',
    },
    {
      input: {
        moduleName: 'budget-types',
        domain: 'inventory',
        type: 'master-data',
      },
      expected: { layer: 'platform', useFpWrapper: false },
      description: 'Lookup table - Platform despite domain association',
    },
    {
      input: { moduleName: 'inventory', isAggregator: true },
      expected: { layer: 'domains', useFpWrapper: true },
      description: 'Domain aggregator plugin',
    },
  ];
}

/**
 * Display classification result in a human-readable format
 * @param {LayerClassification} classification - Classification result
 * @param {boolean} verbose - Show detailed information
 */
function displayClassification(classification, verbose = false) {
  console.log(chalk.bold('\n📍 Layer Classification Result:'));
  console.log(
    chalk.cyan('  Layer:'),
    chalk.bold.green(classification.layer.toUpperCase()),
  );
  console.log(chalk.cyan('  Module Type:'), classification.moduleType);
  console.log(
    chalk.cyan('  Use fp() Wrapper:'),
    classification.useFpWrapper ? chalk.green('Yes') : chalk.yellow('No'),
  );
  console.log(chalk.cyan('  File Path:'), chalk.gray(classification.path));
  console.log(
    chalk.cyan('  URL Prefix:'),
    chalk.gray(classification.urlPrefix),
  );

  if (verbose) {
    console.log(
      chalk.cyan('  Reasoning:'),
      chalk.italic(classification.reasoning),
    );

    const validation = validateClassification(classification);
    if (!validation.isValid) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      validation.warnings.forEach((warning) => {
        console.log(chalk.yellow(`  - ${warning}`));
      });
    }
  }

  console.log('');
}

module.exports = {
  determineLayer,
  validateClassification,
  getExamples,
  displayClassification,
  // Export for testing
  _internal: {
    isInfrastructureModule,
    isPlatformModule,
    isDomainModule,
    shouldUseFpWrapper,
    buildModulePath,
    buildUrlPrefix,
    normalize,
    matchesAny,
  },
};
