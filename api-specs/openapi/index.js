/**
 * AegisX Platform OpenAPI Specifications Index
 *
 * This file exports all OpenAPI specifications and provides utilities
 * for working with the API documentation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load and parse a YAML specification file
 * @param {string} filename - The YAML file name
 * @returns {Object} Parsed OpenAPI specification
 */
function loadSpec(filename) {
  const filePath = path.join(__dirname, filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return yaml.load(fileContent);
}

/**
 * All available OpenAPI specifications
 */
export const specifications = {
  // Complete combined API specification
  complete: {
    name: 'AegisX Complete API',
    description: 'Combined specification with all endpoints',
    file: 'aegisx-complete-api.yaml',
    version: '1.0.0',
    endpoints: 18,
    tags: ['Authentication', 'Navigation', 'User Profile', 'Settings', 'Theme'],
    load: () => loadSpec('aegisx-complete-api.yaml'),
  },

  // Individual API specifications
  navigation: {
    name: 'Navigation API',
    description: 'Navigation structure and menu management',
    file: 'navigation-api.yaml',
    version: '1.0.0',
    endpoints: 2,
    tags: ['Navigation'],
    load: () => loadSpec('navigation-api.yaml'),
  },

  userProfile: {
    name: 'User Profile API',
    description: 'User profile, avatar, and preferences management',
    file: 'user-profile-api.yaml',
    version: '1.0.0',
    endpoints: 4,
    tags: ['User Profile'],
    load: () => loadSpec('user-profile-api.yaml'),
  },

  settings: {
    name: 'Settings API',
    description: 'Application settings, themes, and user preferences',
    file: 'settings-api.yaml',
    version: '1.0.0',
    endpoints: 6,
    tags: ['Settings', 'Theme', 'Layout', 'Notifications'],
    load: () => loadSpec('settings-api.yaml'),
  },

  authExtensions: {
    name: 'Auth Extensions API',
    description:
      'Extended authentication, logout, refresh, and session management',
    file: 'auth-extensions-api.yaml',
    version: '1.0.0',
    endpoints: 6,
    tags: ['Authentication', 'Sessions'],
    load: () => loadSpec('auth-extensions-api.yaml'),
  },
};

/**
 * Get specification metadata
 * @returns {Array} Array of specification metadata
 */
export function getSpecificationList() {
  return Object.entries(specifications).map(([key, spec]) => ({
    key,
    name: spec.name,
    description: spec.description,
    file: spec.file,
    version: spec.version,
    endpoints: spec.endpoints,
    tags: spec.tags,
  }));
}

/**
 * Load a specific specification by key
 * @param {string} key - Specification key
 * @returns {Object|null} Loaded specification or null if not found
 */
export function loadSpecification(key) {
  const spec = specifications[key];
  if (!spec) {
    return null;
  }
  return spec.load();
}

/**
 * Get all available tags across specifications
 * @returns {Array} Unique list of tags
 */
export function getAllTags() {
  const tags = new Set();
  Object.values(specifications).forEach((spec) => {
    spec.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Get specifications by tag
 * @param {string} tag - Tag name
 * @returns {Array} Specifications that include the tag
 */
export function getSpecificationsByTag(tag) {
  return Object.entries(specifications)
    .filter(([key, spec]) => spec.tags.includes(tag))
    .map(([key, spec]) => ({ key, ...spec }));
}

/**
 * Validate that all specification files exist
 * @returns {Object} Validation results
 */
export function validateSpecifications() {
  const results = {
    valid: true,
    missing: [],
    invalid: [],
    total: Object.keys(specifications).length,
  };

  Object.entries(specifications).forEach(([key, spec]) => {
    const filePath = path.join(__dirname, spec.file);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      results.missing.push(spec.file);
      results.valid = false;
      return;
    }

    // Try to parse YAML
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = yaml.load(content);

      // Basic validation
      if (!parsed.openapi || !parsed.info || !parsed.paths) {
        results.invalid.push(spec.file);
        results.valid = false;
      }
    } catch (error) {
      results.invalid.push(spec.file);
      results.valid = false;
    }
  });

  return results;
}

/**
 * Get combined OpenAPI specification merging all individual specs
 * @returns {Object} Combined OpenAPI specification
 */
export function getCombinedSpecification() {
  // Load the complete specification which already combines everything
  return specifications.complete.load();
}

/**
 * Export Swagger configuration
 */
export {
  swaggerConfig,
  swaggerUiConfig,
  commonSchemas,
  commonResponses,
} from './swagger-config.js';

/**
 * CLI utility functions for development
 */
export const cli = {
  /**
   * List all specifications
   */
  list() {
    console.log('📋 AegisX Platform OpenAPI Specifications\n');

    const specs = getSpecificationList();
    specs.forEach((spec) => {
      console.log(`🔹 ${spec.name}`);
      console.log(`   Description: ${spec.description}`);
      console.log(`   File: ${spec.file}`);
      console.log(`   Version: ${spec.version}`);
      console.log(`   Endpoints: ${spec.endpoints}`);
      console.log(`   Tags: ${spec.tags.join(', ')}`);
      console.log('');
    });
  },

  /**
   * Validate all specifications
   */
  validate() {
    console.log('🔍 Validating OpenAPI specifications...\n');

    const results = validateSpecifications();

    if (results.valid) {
      console.log('✅ All specifications are valid!');
      console.log(`   Total: ${results.total} specifications`);
    } else {
      console.log('❌ Validation errors found:');

      if (results.missing.length > 0) {
        console.log(`   Missing files: ${results.missing.join(', ')}`);
      }

      if (results.invalid.length > 0) {
        console.log(`   Invalid files: ${results.invalid.join(', ')}`);
      }
    }
    console.log('');
  },

  /**
   * Show specification details
   */
  info(key) {
    const spec = specifications[key];
    if (!spec) {
      console.log(`❌ Specification '${key}' not found`);
      console.log(`   Available: ${Object.keys(specifications).join(', ')}`);
      return;
    }

    console.log(`📄 ${spec.name}\n`);
    console.log(`Description: ${spec.description}`);
    console.log(`File: ${spec.file}`);
    console.log(`Version: ${spec.version}`);
    console.log(`Endpoints: ${spec.endpoints}`);
    console.log(`Tags: ${spec.tags.join(', ')}`);
    console.log('');

    try {
      const loaded = spec.load();
      console.log('Paths:');
      Object.keys(loaded.paths).forEach((path) => {
        const methods = Object.keys(loaded.paths[path]);
        console.log(
          `  ${methods.map((m) => m.toUpperCase()).join(', ')} ${path}`,
        );
      });
    } catch (error) {
      console.log(`❌ Error loading specification: ${error.message}`);
    }
  },

  /**
   * Show all available tags
   */
  tags() {
    console.log('🏷️  Available Tags\n');

    const tags = getAllTags();
    tags.forEach((tag) => {
      const specs = getSpecificationsByTag(tag);
      console.log(`📋 ${tag}`);
      specs.forEach((spec) => {
        console.log(`   - ${spec.name} (${spec.endpoints} endpoints)`);
      });
      console.log('');
    });
  },
};

// CLI support when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'list':
      cli.list();
      break;
    case 'validate':
      cli.validate();
      break;
    case 'info':
      cli.info(arg);
      break;
    case 'tags':
      cli.tags();
      break;
    default:
      console.log('AegisX OpenAPI Specifications CLI\n');
      console.log('Usage:');
      console.log('  node openapi/index.js list     - List all specifications');
      console.log(
        '  node openapi/index.js validate - Validate all specifications',
      );
      console.log(
        '  node openapi/index.js info <key> - Show specification details',
      );
      console.log('  node openapi/index.js tags     - Show all available tags');
      console.log('');
      console.log('Available specification keys:');
      console.log(`  ${Object.keys(specifications).join(', ')}`);
  }
}

export default {
  specifications,
  getSpecificationList,
  loadSpecification,
  getAllTags,
  getSpecificationsByTag,
  validateSpecifications,
  getCombinedSpecification,
  cli,
};
