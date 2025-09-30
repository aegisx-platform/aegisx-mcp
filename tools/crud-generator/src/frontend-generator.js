const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Register Handlebars helpers
// Note: Don't register PascalCase as helper since templates use {{PascalCase}} as context variable

Handlebars.registerHelper('pascalCase', function (str) {
  if (!str || typeof str !== 'string') return '';
  return (
    str.charAt(0).toUpperCase() +
    str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase())
  );
});

Handlebars.registerHelper('camelCase', function (str) {
  if (!str || typeof str !== 'string') return '';
  return (
    str.charAt(0).toLowerCase() +
    str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase())
  );
});

Handlebars.registerHelper('kebabCase', function (str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
});

Handlebars.registerHelper('capitalize', function (str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
});

// Removed custom 'each' helper to avoid conflicts with built-in Handlebars helper

// Conditional helpers
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('or', function (...args) {
  for (let i = 0; i < args.length - 1; i++) {
    if (args[i]) return true;
  }
  return false;
});

Handlebars.registerHelper('and', function (...args) {
  for (let i = 0; i < args.length - 1; i++) {
    if (!args[i]) return false;
  }
  return true;
});

Handlebars.registerHelper('unless', function (conditional, options) {
  if (!conditional) {
    return options.fn(this);
  }
  return options.inverse(this);
});

class FrontendGenerator {
  constructor() {
    this.toolsDir = path.resolve(__dirname, '..');
    this.templatesDir = path.join(this.toolsDir, 'frontend-templates');
    this.outputDir = path.resolve(
      this.toolsDir,
      '..',
      '..',
      'apps',
      'web',
      'src',
      'app',
      'features',
    );
  }

  /**
   * Extract TypeScript types from backend TypeBox schemas
   */
  extractTypesFromBackendModule(moduleName) {
    const backendModulePath = path.resolve(
      this.toolsDir,
      '..',
      '..',
      'apps',
      'api',
      'src',
      'modules',
      moduleName,
    );

    try {
      // Read the schemas file
      const schemasPath = path.join(
        backendModulePath,
        'schemas',
        `${moduleName}.schemas.ts`,
      );
      // Use module name for types file consistency with backend
      const typeFileName = `${moduleName}.types.ts`;
      const typesPath = path.join(backendModulePath, 'types', typeFileName);

      if (!fs.existsSync(schemasPath)) {
        throw new Error(`Backend schemas file not found: ${schemasPath}`);
      }

      // Read and parse schema file for type information
      const schemasContent = fs.readFileSync(schemasPath, 'utf8');
      const typesContent = fs.existsSync(typesPath)
        ? fs.readFileSync(typesPath, 'utf8')
        : '';

      return this.parseBackendTypes(schemasContent, typesContent, moduleName);
    } catch (error) {
      console.error('Error extracting types from backend:', error.message);
      throw error;
    }
  }

  /**
   * Parse backend TypeBox schemas to extract TypeScript interface definitions
   */
  parseBackendTypes(schemasContent, typesContent, moduleName) {
    const pascalName = this.toPascalCase(moduleName);

    // Extract basic schema structure
    const types = {};

    // Define the main entity type based on the schema
    const mainEntityFields = this.extractSchemaFields(
      schemasContent,
      `${pascalName}Schema`,
    );
    const createFields = this.extractSchemaFields(
      schemasContent,
      `Create${pascalName}Schema`,
    );
    const updateFields = this.extractSchemaFields(
      schemasContent,
      `Update${pascalName}Schema`,
    );
    const queryFields = this.extractSchemaFields(
      schemasContent,
      `List${pascalName}QuerySchema`,
    );

    // Use the singular form for the main entity (e.g., "Notification" not "Notifications")
    const singularPascalName = pascalName.endsWith('s')
      ? pascalName.slice(0, -1)
      : pascalName;

    types[singularPascalName] = mainEntityFields;
    types[`Create${singularPascalName}Request`] = createFields;
    types[`Update${singularPascalName}Request`] = updateFields;
    types[`List${pascalName}Query`] = queryFields; // Keep plural for List query to match backend

    return types;
  }

  /**
   * Extract field definitions from TypeBox schema
   */
  extractSchemaFields(content, schemaName) {
    const fields = {};

    try {
      // For now, provide basic fallback types based on common patterns
      // In a real implementation, this would parse the actual TypeBox schemas
      if (schemaName.includes('Notifications')) {
        return {
          id: 'string',
          user_id: 'string',
          type: 'string',
          title: 'string',
          message: 'string',
          data: 'Record<string, any> | undefined',
          action_url: 'string | undefined',
          read: 'boolean | undefined',
          read_at: 'string | undefined',
          archived: 'boolean | undefined',
          archived_at: 'string | undefined',
          priority: 'string | undefined',
          expires_at: 'string | undefined',
          created_at: 'string',
          updated_at: 'string',
        };
      }
    } catch (error) {
      console.warn(`Could not parse schema ${schemaName}:`, error.message);
    }

    return fields;
  }

  /**
   * Map TypeBox types to TypeScript types
   */
  mapTypeBoxToTypeScript(typeboxType, params = '') {
    const mapping = {
      String: 'string',
      Number: 'number',
      Boolean: 'boolean',
      Optional: 'string | undefined', // Default for optional
      Union: 'string | number', // Default union
      Array: 'any[]',
      Record: 'Record<string, any>',
      Any: 'any',
    };

    // Handle optional fields
    if (params.includes('Optional')) {
      return mapping[typeboxType] + ' | undefined';
    }

    // Handle UUID format
    if (params.includes('uuid')) {
      return 'string';
    }

    // Handle date-time format
    if (params.includes('date-time')) {
      return 'string';
    }

    return mapping[typeboxType] || 'any';
  }

  /**
   * Analyze backend API structure to determine features
   */
  analyzeBackendAPI(moduleName) {
    const backendModulePath = path.resolve(
      this.toolsDir,
      '..',
      '..',
      'apps',
      'api',
      'src',
      'modules',
      moduleName,
    );

    try {
      // Check routes file to determine available endpoints
      const routesPath = path.join(backendModulePath, 'routes', 'index.ts');

      if (!fs.existsSync(routesPath)) {
        throw new Error(`Backend routes file not found: ${routesPath}`);
      }

      const routesContent = fs.readFileSync(routesPath, 'utf8');

      return {
        hasEnhancedOps: this.hasEnhancedOperations(routesContent),
        hasFullOps: this.hasFullOperations(routesContent),
        hasEvents: this.hasWebSocketEvents(backendModulePath),
        searchFields: this.extractSearchFields(routesContent),
        endpoints: this.extractEndpoints(routesContent),
      };
    } catch (error) {
      console.error('Error analyzing backend API:', error.message);
      return {
        hasEnhancedOps: false,
        hasFullOps: false,
        hasEvents: false,
        searchFields: [],
        endpoints: [],
      };
    }
  }

  /**
   * Check if backend has enhanced operations (bulk operations)
   */
  hasEnhancedOperations(routesContent) {
    return (
      routesContent.includes('/bulk') || routesContent.includes('/dropdown')
    );
  }

  /**
   * Check if backend has full operations (validation, stats, etc.)
   */
  hasFullOperations(routesContent) {
    return (
      routesContent.includes('/validate') ||
      routesContent.includes('/stats') ||
      routesContent.includes('/check/:field')
    );
  }

  /**
   * Check if backend has WebSocket events
   */
  hasWebSocketEvents(backendModulePath) {
    const serviceFile = path.join(
      backendModulePath,
      'services',
      `${path.basename(backendModulePath)}.service.ts`,
    );

    if (!fs.existsSync(serviceFile)) {
      return false;
    }

    const serviceContent = fs.readFileSync(serviceFile, 'utf8');
    return (
      serviceContent.includes('EventService') ||
      serviceContent.includes('websocket')
    );
  }

  /**
   * Extract search fields from backend
   */
  extractSearchFields(routesContent) {
    // This is a simplified approach - in a real implementation,
    // you'd parse the schema more thoroughly
    return ['title', 'name', 'description']; // Common search fields
  }

  /**
   * Extract available endpoints
   */
  extractEndpoints(routesContent) {
    const endpoints = [];

    // Standard CRUD
    if (routesContent.includes("fastify.post('/'")) endpoints.push('create');
    if (routesContent.includes("fastify.get('/:id'")) endpoints.push('read');
    if (routesContent.includes("fastify.get('/'")) endpoints.push('list');
    if (routesContent.includes("fastify.put('/:id'")) endpoints.push('update');
    if (routesContent.includes("fastify.delete('/:id'"))
      endpoints.push('delete');

    // Enhanced operations
    if (routesContent.includes('/dropdown')) endpoints.push('dropdown');
    if (routesContent.includes('/bulk')) endpoints.push('bulk');

    // Full operations
    if (routesContent.includes('/validate')) endpoints.push('validate');
    if (routesContent.includes('/check/:field')) endpoints.push('uniqueness');
    if (routesContent.includes('/stats')) endpoints.push('stats');

    return endpoints;
  }

  /**
   * Generate display columns for table
   */
  generateDisplayColumns(types, entityName, context = {}) {
    const entityType = types[entityName];
    if (!entityType) return [];

    const columns = [];

    Object.keys(entityType).forEach((fieldName) => {
      // Skip certain fields from display
      if (['id', 'created_at', 'updated_at'].includes(fieldName)) {
        return;
      }

      const fieldType = entityType[fieldName];
      const column = {
        name: fieldName,
        label: this.fieldNameToLabel(fieldName),
        isDate: fieldType === 'string' && fieldName.includes('_at'),
        isBoolean: fieldType === 'boolean',
        isTruncated:
          fieldType === 'string' &&
          ['description', 'message', 'content'].includes(fieldName),
        truncateLength: 50,
        showEllipsis: true,
        // Add context variables for template access
        camelCase: context.camelCase || entityName.toLowerCase(),
        moduleName: context.moduleName || entityName.toLowerCase(),
      };

      columns.push(column);
    });

    return columns.slice(0, 6); // Limit to 6 columns for better UX
  }

  /**
   * Generate form fields for dialog components with enhanced database detection
   */
  generateFormFields(
    types,
    entityName,
    isCreate = true,
    enhancedSchema = null,
  ) {
    const typeKey = isCreate
      ? `Create${entityName}Request`
      : `Update${entityName}Request`;
    const entityType = types[typeKey] || types[entityName];
    if (!entityType) return [];

    const fields = [];

    Object.keys(entityType).forEach((fieldName) => {
      // Skip auto-generated fields but include audit user fields
      if (['id', 'created_at', 'updated_at'].includes(fieldName)) {
        return;
      }

      const fieldType = entityType[fieldName];
      const isOptional = fieldType.includes('undefined');
      const baseType = fieldType.replace(' | undefined', '');

      // Get enhanced field info if available
      const enhancedColumn = enhancedSchema?.columns?.find(
        (col) => col.name === fieldName,
      );

      // Determine required status from database schema (more reliable than TS types)
      let isRequired = !isOptional; // fallback to TS type
      if (enhancedColumn && typeof enhancedColumn.isNullable === 'boolean') {
        isRequired =
          !enhancedColumn.isNullable &&
          !enhancedColumn.isPrimaryKey &&
          !enhancedColumn.defaultValue;
      }

      const field = {
        name: fieldName,
        label: this.fieldNameToLabel(fieldName),
        type: this.getFormFieldType(fieldName, baseType, enhancedColumn),
        inputType: this.getFormInputType(fieldName, baseType, enhancedColumn),
        required: isRequired,
        placeholder: this.generatePlaceholder(fieldName),
        defaultValue: this.getDefaultValue(fieldName, baseType),
      };

      // Add validation rules
      field.maxLength = this.getMaxLength(fieldName, baseType);
      field.min = this.getMinValue(fieldName, baseType);
      field.max = this.getMaxValue(fieldName, baseType);

      // Enhanced field type handling
      if (enhancedColumn) {
        // Foreign key dropdown
        if (
          enhancedColumn.fieldType === 'foreign-key-dropdown' &&
          enhancedColumn.dropdownInfo
        ) {
          field.type = 'dropdown';
          field.dropdownEndpoint = enhancedColumn.dropdownInfo.endpoint;
          field.dropdownDisplayFields =
            enhancedColumn.dropdownInfo.displayFields;
          field.referencedTable = enhancedColumn.foreignKeyInfo.referencedTable;
        }
        // Enum select
        else if (enhancedColumn.fieldType === 'enum-select') {
          field.type = 'select';
          field.options = enhancedColumn.enumInfo
            ? enhancedColumn.enumInfo.values.map((val) => ({
                value: val,
                label: this.formatEnumLabel(val),
              }))
            : enhancedColumn.constraintValues?.map((val) => ({
                value: val,
                label: this.formatEnumLabel(val),
              })) || [];
        }
        // Convention-based select fields (for fields like priority, status, type)
        else if (this.isSelectField(fieldName, baseType)) {
          field.type = 'select';
          field.options = this.getSelectOptions(fieldName);
        }
      }
      // Fallback to original logic if no enhanced schema
      else if (this.isSelectField(fieldName, baseType)) {
        field.type = 'select';
        field.options = this.getSelectOptions(fieldName);
      }

      fields.push(field);
    });

    return fields;
  }

  /**
   * Generate view fields for view dialog
   */
  generateViewFields(types, entityName, context = {}) {
    const entityType = types[entityName];
    if (!entityType) return [];

    const fields = [];

    Object.keys(entityType).forEach((fieldName) => {
      // Skip user_id but include everything else
      if (['user_id'].includes(fieldName)) {
        return;
      }

      const fieldType = entityType[fieldName];
      const baseType = fieldType.replace(' | undefined', '');

      const field = {
        name: fieldName,
        label: this.fieldNameToLabel(fieldName),
        type: this.getViewFieldType(fieldName, baseType),
        inputType: this.getFormInputType(fieldName, baseType),
        // Add context variables for template access
        camelCase: context.camelCase || entityName.toLowerCase(),
        moduleName: context.moduleName || entityName.toLowerCase(),
      };

      fields.push(field);
    });

    return fields;
  }

  /**
   * Format enum label for display
   */
  formatEnumLabel(enumValue) {
    if (!enumValue) return '';
    return enumValue
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get form field type for form generation
   */
  getFormFieldType(fieldName, fieldType, enhancedColumn = null) {
    // Use enhanced column info if available
    if (enhancedColumn) {
      switch (enhancedColumn.fieldType) {
        case 'foreign-key-dropdown':
          return 'dropdown';
        case 'enum-select':
          return 'select';

        // Text Types
        case 'email':
          return 'string';
        case 'password':
          return 'string';
        case 'url':
          return 'string';
        case 'phone':
          return 'string';
        case 'textarea':
          return 'string';
        case 'varchar':
          return 'string';
        case 'char':
          return 'string';
        case 'search':
          return 'string';
        case 'slug':
          return 'string';

        // Date/Time Types
        case 'datetime':
          return 'date';
        case 'date':
          return 'date';
        case 'timestamp':
          return 'datetime';
        case 'timestamptz':
          return 'datetime-tz';
        case 'time':
          return 'time';
        case 'timetz':
          return 'time-tz';
        case 'interval':
          return 'interval';

        // Numeric Types
        case 'number':
          return 'number';
        case 'bigint':
          return 'bigint';
        case 'decimal':
          return 'decimal';
        case 'float':
          return 'float';
        case 'serial':
          return 'serial';
        case 'currency':
          return 'currency';
        case 'percentage':
          return 'percentage';

        // Boolean
        case 'boolean':
          return 'boolean';

        // Special Types
        case 'uuid':
          return 'uuid';
        case 'json':
          return 'json';
        case 'jsonb':
          return 'jsonb';
        case 'xml':
          return 'xml';
        case 'color':
          return 'color';

        // Array Types
        case 'array':
          return 'array';

        // Network Types
        case 'inet':
          return 'inet';
        case 'cidr':
          return 'cidr';
        case 'macaddr':
          return 'macaddr';

        // Binary Types
        case 'binary':
          return 'binary';
        case 'file':
          return 'file';
        case 'image':
          return 'image';

        // Geometric Types
        case 'point':
          return 'point';
        case 'box':
          return 'box';
        case 'polygon':
          return 'polygon';
        case 'line':
          return 'line';
        case 'lseg':
          return 'lseg';
        case 'path':
          return 'path';
        case 'circle':
          return 'circle';

        // Bit Types
        case 'bit':
          return 'bit';
        case 'varbit':
          return 'varbit';

        default:
          return 'string';
      }
    }

    // Fallback to original logic
    if (fieldType.includes('boolean')) return 'boolean';
    if (fieldType.includes('number')) return 'number';
    if (fieldName.includes('_at') || fieldName.includes('date')) return 'date';
    if (fieldName.includes('url')) return 'string';
    if (fieldName === 'message' || fieldName === 'description') return 'string';
    if (
      fieldType.includes('Record<') ||
      fieldType.includes('object') ||
      fieldName === 'data'
    )
      return 'json';
    return 'string';
  }

  /**
   * Get view field type for view dialog
   */
  getViewFieldType(fieldName, fieldType) {
    if (fieldType.includes('boolean')) return 'boolean';
    if (fieldType.includes('number')) return 'number';
    if (fieldName.includes('_at') || fieldName.includes('date')) return 'date';
    if (fieldName.includes('url')) return 'url';
    if (fieldType.includes('Record<') || fieldName === 'data') return 'json';
    return 'string';
  }

  /**
   * Get form input type
   */
  getFormInputType(fieldName, fieldType, enhancedColumn = null) {
    // Use enhanced column info if available
    if (enhancedColumn) {
      switch (enhancedColumn.fieldType) {
        case 'foreign-key-dropdown':
          return 'dropdown';
        case 'enum-select':
          return 'select';
        case 'email':
          return 'email';
        case 'password':
          return 'password';
        case 'url':
          return 'url';
        case 'textarea':
          return 'textarea';
        case 'datetime':
          return 'date';
        case 'boolean':
          return 'checkbox';
        case 'number':
          return 'number';
        default:
          return 'text';
      }
    }

    // Fallback to original logic
    if (fieldType.includes('number')) return 'number';
    if (fieldName.includes('email')) return 'email';
    if (fieldName.includes('password')) return 'password';
    if (fieldName.includes('url')) return 'url';
    if (['message', 'description', 'content'].includes(fieldName))
      return 'textarea';
    return 'text';
  }

  /**
   * Generate placeholder text
   */
  generatePlaceholder(fieldName) {
    const placeholders = {
      title: 'Enter title',
      name: 'Enter name',
      email: 'Enter email address',
      message: 'Enter message',
      description: 'Enter description',
      type: 'Select type',
      priority: 'Select priority',
      status: 'Select status',
    };

    return (
      placeholders[fieldName] ||
      `Enter ${this.fieldNameToLabel(fieldName).toLowerCase()}`
    );
  }

  /**
   * Get default value for field
   */
  getDefaultValue(fieldName, fieldType) {
    if (fieldType.includes('boolean')) return false;
    if (fieldType.includes('number')) return null;
    return null;
  }

  /**
   * Get max length for string fields
   */
  getMaxLength(fieldName, fieldType) {
    if (!fieldType.includes('string')) return null;

    const maxLengths = {
      title: 255,
      name: 255,
      email: 255,
      message: 1000,
      description: 1000,
      type: 50,
      priority: 20,
      status: 20,
    };

    return maxLengths[fieldName] || null;
  }

  /**
   * Get min value for number fields
   */
  getMinValue(fieldName, fieldType) {
    if (!fieldType.includes('number')) return null;
    return 0; // Default minimum
  }

  /**
   * Get max value for number fields
   */
  getMaxValue(fieldName, fieldType) {
    if (!fieldType.includes('number')) return null;
    return null; // No default maximum
  }

  /**
   * Generate query filters for the list component
   */
  generateQueryFilters(types, entityName) {
    const queryType = types[`List${entityName}Query`];
    if (!queryType) return [];

    const filters = [];

    Object.keys(queryType).forEach((fieldName) => {
      // Skip pagination and search fields
      if (
        ['page', 'limit', 'search', 'include', 'sortBy', 'sortOrder'].includes(
          fieldName,
        )
      ) {
        return;
      }

      const fieldType = queryType[fieldName];
      const filter = {
        name: fieldName,
        label: this.fieldNameToLabel(fieldName),
        type: fieldType,
        inputType: this.getInputType(fieldType),
        isSelect: this.isSelectField(fieldName, fieldType),
      };

      // Add options for select fields
      if (filter.isSelect) {
        filter.options = this.getSelectOptions(fieldName);
      }

      filters.push(filter);
    });

    return filters;
  }

  /**
   * Generate the Angular service
   */
  async generateService(moduleName, options = {}) {
    try {
      console.log(`🎯 Generating Angular service for ${moduleName}...`);

      // Extract types and analyze API
      const types = this.extractTypesFromBackendModule(moduleName);
      const apiInfo = this.analyzeBackendAPI(moduleName);

      // Get enhanced database schema if available
      let enhancedSchema = null;
      try {
        const { getEnhancedSchema } = require('./database.js');
        enhancedSchema = await getEnhancedSchema(moduleName);
        console.log(`✅ Enhanced schema loaded for ${moduleName} service`);
      } catch (error) {
        console.warn(
          `⚠️ Could not load enhanced schema for ${moduleName} service:`,
          error.message,
        );
      }

      const pascalName = this.toPascalCase(moduleName);
      const camelName = this.toCamelCase(moduleName);
      const kebabName = this.toKebabCase(moduleName);

      // Prepare template context
      const typesFileName =
        moduleName === 'notifications'
          ? 'notification.types'
          : `${kebabName}.types`;
      // Use singular form for entity types (e.g., "Notification" not "Notifications")
      const singularPascalName = pascalName.endsWith('s')
        ? pascalName.slice(0, -1)
        : pascalName;
      const singularCamelName = camelName.endsWith('s')
        ? camelName.slice(0, -1)
        : camelName;

      // Extract dropdown dependencies from enhanced schema
      const dropdownDependencies = [];
      if (enhancedSchema) {
        enhancedSchema.columns.forEach((column) => {
          if (
            column.fieldType === 'foreign-key-dropdown' &&
            column.dropdownInfo
          ) {
            dropdownDependencies.push({
              field: column.name,
              referencedTable: column.foreignKeyInfo.referencedTable,
              endpoint: column.dropdownInfo.endpoint,
              displayFields: column.dropdownInfo.displayFields,
              pascalCase: this.toPascalCase,
            });
          }
        });
      }

      const context = {
        moduleName,
        PascalCase: singularPascalName,
        camelCase: camelName,
        kebabCase: kebabName,
        singularCamelName: singularCamelName,
        typesFileName,
        types,
        baseUrlPath: moduleName,
        searchFields: apiInfo.searchFields.length > 0,
        searchFieldsDisplay: apiInfo.searchFields.join(', '),
        queryFilters: this.generateQueryFilters(types, pascalName),
        includeEnhanced:
          options.enhanced ||
          apiInfo.hasEnhancedOps ||
          dropdownDependencies.length > 0,
        includeFull: options.full || apiInfo.hasFullOps,
        dropdownDependencies: dropdownDependencies,
        title: this.fieldNameToLabel(moduleName),
      };

      // Load and compile template
      const templatePath = path.join(this.templatesDir, 'service.hbs');
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);

      // Debug context
      console.log('🔍 Template context:', JSON.stringify(context, null, 2));

      // Generate code
      const generatedCode = template(context);

      // Debug generated code length
      console.log('📝 Generated code length:', generatedCode.length);
      if (generatedCode.length < 100) {
        console.log(
          '⚠️ Generated code seems too short:',
          generatedCode.substring(0, 200),
        );
      }

      // Prepare output directory
      const outputDir = path.join(
        this.outputDir,
        this.toKebabCase(moduleName),
        'services',
      );
      this.ensureDirectoryExists(outputDir);

      // Write file
      const outputFile = path.join(
        outputDir,
        `${this.toKebabCase(moduleName)}.service.ts`,
      );
      fs.writeFileSync(outputFile, generatedCode);

      console.log(`✅ Service generated: ${outputFile}`);
      return outputFile;
    } catch (error) {
      console.error(`❌ Error generating service:`, error.message);
      throw error;
    }
  }

  /**
   * Generate the Angular list component
   */
  async generateListComponent(moduleName, options = {}) {
    try {
      console.log(`🎯 Generating Angular list component for ${moduleName}...`);

      // Extract types and analyze API
      const types = this.extractTypesFromBackendModule(moduleName);
      const apiInfo = this.analyzeBackendAPI(moduleName);

      const pascalName = this.toPascalCase(moduleName);
      const camelName = this.toCamelCase(moduleName);
      const kebabName = this.toKebabCase(moduleName);

      // Prepare template context
      const typesFileName =
        moduleName === 'notifications'
          ? 'notification.types'
          : `${kebabName}.types`;
      // Use singular form for entity types (e.g., "Notification" not "Notifications")
      const singularPascalName = pascalName.endsWith('s')
        ? pascalName.slice(0, -1)
        : pascalName;
      const singularCamelName = camelName.endsWith('s')
        ? camelName.slice(0, -1)
        : camelName;

      const context = {
        moduleName,
        PascalCase: singularPascalName,
        camelCase: camelName,
        kebabCase: kebabName,
        singularCamelName: singularCamelName,
        typesFileName,
        title: this.fieldNameToLabel(moduleName),
        types,
        searchFields: apiInfo.searchFields.length > 0,
        searchFieldsDisplay: apiInfo.searchFields.join(', '),
        displayColumns: this.generateDisplayColumns(types, singularPascalName, {
          camelCase: camelName,
          moduleName,
        }),
        filters: this.generateQueryFilters(types, pascalName),
        includeEnhanced: options.enhanced || apiInfo.hasEnhancedOps,
        includeFull: options.full || apiInfo.hasFullOps,
      };

      // Load and compile template
      const templatePath = path.join(this.templatesDir, 'list-component.hbs');
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);

      // Generate code
      const generatedCode = template(context);

      // Prepare output directory
      const outputDir = path.join(
        this.outputDir,
        this.toKebabCase(moduleName),
        'components',
      );
      this.ensureDirectoryExists(outputDir);

      // Write file
      const outputFile = path.join(
        outputDir,
        `${this.toKebabCase(moduleName)}-list.component.ts`,
      );
      fs.writeFileSync(outputFile, generatedCode);

      console.log(`✅ List component generated: ${outputFile}`);
      return outputFile;
    } catch (error) {
      console.error(`❌ Error generating list component:`, error.message);
      throw error;
    }
  }

  /**
   * Generate dialog components (Create, Edit, View)
   */
  async generateDialogComponents(moduleName, options = {}) {
    try {
      console.log(`🎯 Generating dialog components for ${moduleName}...`);

      // Extract types and analyze API
      const types = this.extractTypesFromBackendModule(moduleName);
      const apiInfo = this.analyzeBackendAPI(moduleName);

      // Get enhanced database schema if available
      let enhancedSchema = null;
      try {
        const { getEnhancedSchema } = require('./database.js');
        enhancedSchema = await getEnhancedSchema(moduleName);
        console.log(`✅ Enhanced schema loaded for ${moduleName}`);
      } catch (error) {
        console.warn(
          `⚠️ Could not load enhanced schema for ${moduleName}:`,
          error.message,
        );
      }

      const pascalName = this.toPascalCase(moduleName);
      const camelName = this.toCamelCase(moduleName);
      const kebabName = this.toKebabCase(moduleName);

      const typesFileName =
        moduleName === 'notifications'
          ? 'notification.types'
          : `${kebabName}.types`;
      // Use singular form for entity types (e.g., "Notification" not "Notifications")
      const singularPascalName = pascalName.endsWith('s')
        ? pascalName.slice(0, -1)
        : pascalName;
      const singularCamelName = camelName.endsWith('s')
        ? camelName.slice(0, -1)
        : camelName;

      const baseContext = {
        moduleName,
        PascalCase: singularPascalName,
        camelCase: camelName,
        kebabCase: kebabName,
        singularCamelName: singularCamelName,
        typesFileName,
        title: this.fieldNameToLabel(moduleName),
        types,
      };

      const generatedFiles = [];
      const outputDir = path.join(
        this.outputDir,
        this.toKebabCase(moduleName),
        'components',
      );
      this.ensureDirectoryExists(outputDir);

      // 1. Generate Create Dialog
      const createFormFields = this.generateFormFields(
        types,
        singularPascalName,
        true,
        enhancedSchema,
      );
      const createContext = {
        ...baseContext,
        formFields: createFormFields,
        hasJsonFields: createFormFields.some((field) => field.type === 'json'),
        hasDateTimeFields: createFormFields.some((field) =>
          ['datetime', 'datetime-tz'].includes(field.type),
        ),
        hasNewFieldTypes: createFormFields.some((field) =>
          [
            'uuid',
            'array',
            'inet',
            'cidr',
            'macaddr',
            'binary',
            'xml',
            'point',
            'box',
            'polygon',
          ].includes(field.type),
        ),
      };

      const createTemplateContent = fs.readFileSync(
        path.join(this.templatesDir, 'create-dialog.hbs'),
        'utf8',
      );
      const createTemplate = Handlebars.compile(createTemplateContent);
      const createCode = createTemplate(createContext);
      const createFile = path.join(outputDir, `${kebabName}-create.dialog.ts`);
      fs.writeFileSync(createFile, createCode);
      generatedFiles.push(createFile);

      // 2. Generate Edit Dialog
      const editFormFields = this.generateFormFields(
        types,
        singularPascalName,
        false,
        enhancedSchema,
      );
      const editContext = {
        ...baseContext,
        formFields: editFormFields,
        hasJsonFields: editFormFields.some((field) => field.type === 'json'),
        hasDateTimeFields: editFormFields.some((field) =>
          ['datetime', 'datetime-tz'].includes(field.type),
        ),
        hasNewFieldTypes: editFormFields.some((field) =>
          [
            'uuid',
            'array',
            'inet',
            'cidr',
            'macaddr',
            'binary',
            'xml',
            'point',
            'box',
            'polygon',
          ].includes(field.type),
        ),
      };

      const editTemplateContent = fs.readFileSync(
        path.join(this.templatesDir, 'edit-dialog.hbs'),
        'utf8',
      );
      const editTemplate = Handlebars.compile(editTemplateContent);
      const editCode = editTemplate(editContext);
      const editFile = path.join(outputDir, `${kebabName}-edit.dialog.ts`);
      fs.writeFileSync(editFile, editCode);
      generatedFiles.push(editFile);

      // 3. Generate Shared Form Component
      const sharedFormFields = this.generateFormFields(
        types,
        singularPascalName,
        false,
        enhancedSchema,
      );
      const foreignKeyServices = this.extractForeignKeyServices(
        sharedFormFields,
        enhancedSchema,
      );

      const sharedFormContext = {
        ...baseContext,
        formFields: sharedFormFields,
        hasForeignKeys: foreignKeyServices.length > 0,
        foreignKeyServices: foreignKeyServices,
        hasJsonFields: sharedFormFields.some((field) => field.type === 'json'),
        hasDateTimeFields: sharedFormFields.some((field) =>
          ['datetime', 'datetime-tz'].includes(field.type),
        ),
        hasNewFieldTypes: sharedFormFields.some((field) =>
          [
            'uuid',
            'array',
            'inet',
            'cidr',
            'macaddr',
            'binary',
            'xml',
            'point',
            'box',
            'polygon',
          ].includes(field.type),
        ),
      };

      const sharedFormTemplateContent = fs.readFileSync(
        path.join(this.templatesDir, 'shared-form.hbs'),
        'utf8',
      );
      const sharedFormTemplate = Handlebars.compile(sharedFormTemplateContent);
      const sharedFormCode = sharedFormTemplate(sharedFormContext);
      const sharedFormFile = path.join(
        outputDir,
        `${kebabName}-form.component.ts`,
      );
      fs.writeFileSync(sharedFormFile, sharedFormCode);
      generatedFiles.push(sharedFormFile);

      // 4. Generate View Dialog
      const viewContext = {
        ...baseContext,
        viewFields: this.generateViewFields(types, singularPascalName, {
          camelCase: camelName,
          moduleName,
        }),
      };

      const viewTemplateContent = fs.readFileSync(
        path.join(this.templatesDir, 'view-dialog.hbs'),
        'utf8',
      );
      const viewTemplate = Handlebars.compile(viewTemplateContent);
      const viewCode = viewTemplate(viewContext);
      const viewFile = path.join(outputDir, `${kebabName}-view.dialog.ts`);
      fs.writeFileSync(viewFile, viewCode);
      generatedFiles.push(viewFile);

      console.log(
        `✅ Dialog components generated: ${generatedFiles.length} files`,
      );
      return generatedFiles;
    } catch (error) {
      console.error(`❌ Error generating dialog components:`, error.message);
      throw error;
    }
  }

  /**
   * Generate routes file
   */
  async generateRoutes(moduleName, options = {}) {
    try {
      console.log(`🎯 Generating routes for ${moduleName}...`);

      const pascalName = this.toPascalCase(moduleName);
      const camelName = this.toCamelCase(moduleName);
      const kebabName = this.toKebabCase(moduleName);

      const typesFileName =
        moduleName === 'notifications'
          ? 'notification.types'
          : `${kebabName}.types`;
      // Use singular form for entity types (e.g., "Notification" not "Notifications")
      const singularPascalName = pascalName.endsWith('s')
        ? pascalName.slice(0, -1)
        : pascalName;
      const singularCamelName = camelName.endsWith('s')
        ? camelName.slice(0, -1)
        : camelName;

      const context = {
        moduleName,
        PascalCase: singularPascalName,
        camelCase: camelName,
        kebabCase: kebabName,
        singularCamelName: singularCamelName,
        typesFileName,
        title: this.fieldNameToLabel(moduleName),
      };

      // Load and compile template
      const templatePath = path.join(this.templatesDir, 'routes.hbs');
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);

      // Generate code
      const generatedCode = template(context);

      // Prepare output directory
      const outputDir = path.join(this.outputDir, this.toKebabCase(moduleName));
      this.ensureDirectoryExists(outputDir);

      // Write file
      const outputFile = path.join(
        outputDir,
        `${this.toKebabCase(moduleName)}.routes.ts`,
      );
      fs.writeFileSync(outputFile, generatedCode);

      console.log(`✅ Routes generated: ${outputFile}`);
      return outputFile;
    } catch (error) {
      console.error(`❌ Error generating routes:`, error.message);
      throw error;
    }
  }

  /**
   * Generate complete frontend module
   */
  async generateFrontendModule(moduleName, options = {}) {
    try {
      console.log(`\n🚀 Starting frontend generation for: ${moduleName}`);
      console.log(`📊 Options:`, options);

      const generatedFiles = [];

      // Generate service
      const serviceFile = await this.generateService(moduleName, options);
      generatedFiles.push(serviceFile);

      // Generate dialog components
      const dialogFiles = await this.generateDialogComponents(
        moduleName,
        options,
      );
      generatedFiles.push(...dialogFiles);

      // Generate list component (must be after dialogs for imports)
      const listComponentFile = await this.generateListComponent(
        moduleName,
        options,
      );
      generatedFiles.push(listComponentFile);

      // Generate routes
      const routesFile = await this.generateRoutes(moduleName, options);
      generatedFiles.push(routesFile);

      console.log(`\n✅ Frontend module generation completed!`);
      console.log(`📁 Generated files:`, generatedFiles.length);
      generatedFiles.forEach((file) => console.log(`   - ${file}`));

      return generatedFiles;
    } catch (error) {
      console.error(`\n❌ Frontend generation failed:`, error.message);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  toPascalCase(str) {
    return (
      str.charAt(0).toUpperCase() +
      str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    );
  }

  toCamelCase(str) {
    return (
      str.charAt(0).toLowerCase() +
      str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    );
  }

  toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[_\s]+/g, '-');
  }

  fieldNameToLabel(fieldName) {
    return fieldName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getInputType(fieldType) {
    if (fieldType.includes('number')) return 'number';
    if (fieldType.includes('date')) return 'date';
    if (fieldType.includes('boolean')) return 'checkbox';
    return 'text';
  }

  isSelectField(fieldName, fieldType) {
    const selectFields = ['status', 'type', 'priority', 'role'];
    return selectFields.some((field) => fieldName.includes(field));
  }

  getSelectOptions(fieldName) {
    const optionsMap = {
      status: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
      type: [
        { value: 'info', label: 'Info' },
        { value: 'warning', label: 'Warning' },
        { value: 'error', label: 'Error' },
      ],
      priority: [
        { value: 'low', label: 'Low' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
      ],
    };

    const key = Object.keys(optionsMap).find((k) => fieldName.includes(k));
    return optionsMap[key] || [];
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Extract foreign key services needed for the shared form
   */
  extractForeignKeyServices(formFields, enhancedSchema) {
    const services = [];

    if (!enhancedSchema) return services;

    formFields.forEach((field) => {
      if (field.type === 'dropdown' && field.referencedTable) {
        const referencedTable = field.referencedTable;
        const serviceName = this.toCamelCase(referencedTable) + 'Service';
        const serviceClass = this.toPascalCase(referencedTable) + 'Service';

        // Find the enhanced column for more details
        const enhancedColumn = enhancedSchema.columns.find(
          (col) => col.name === field.name,
        );
        const dropdownFields = enhancedColumn?.dropdownInfo?.displayFields || [
          'id',
        ];

        if (!services.find((s) => s.serviceName === serviceName)) {
          services.push({
            serviceName: serviceName,
            serviceClass: serviceClass,
            referencedTable: referencedTable,
            displayFields: dropdownFields,
            import: `../../../${this.toKebabCase(referencedTable)}/services/${this.toKebabCase(referencedTable)}.service`,
          });
        }
      }
    });

    return services;
  }
}

// Main execution
if (require.main === module) {
  const moduleName = process.argv[2];

  if (!moduleName) {
    console.error('Usage: node frontend-generator.js <module-name>');
    process.exit(1);
  }

  const generator = new FrontendGenerator();
  generator
    .generateFrontendModule(moduleName)
    .then(() => {
      console.log(`✅ Frontend generated successfully for ${moduleName}`);
    })
    .catch((error) => {
      console.error('❌ Frontend generation failed:', error.message);
      process.exit(1);
    });
}

module.exports = FrontendGenerator;
