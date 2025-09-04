# CRUD Template Generator

## Automatic CRUD Generation from Database Tables

### CRUD Generator Service

```typescript
// apps/api/src/generators/crud-generator.service.ts
import { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  primaryKey: string;
  foreignKeys: ForeignKeyInfo[];
  indexes: IndexInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: any;
  maxLength?: number;
  isAutoIncrement: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface ForeignKeyInfo {
  column: string;
  referencesTable: string;
  referencesColumn: string;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
}

export class CrudGeneratorService {
  private knex: Knex;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.knex = fastify.knex;
  }

  // Database introspection
  async getTableInfo(tableName: string): Promise<TableInfo> {
    const columns = await this.getTableColumns(tableName);
    const foreignKeys = await this.getForeignKeys(tableName);
    const indexes = await this.getIndexes(tableName);

    const primaryKey = columns.find(col => col.isPrimaryKey)?.name || 'id';

    return {
      name: tableName,
      columns,
      primaryKey,
      foreignKeys,
      indexes
    };
  }

  private async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
    const columnInfo = await this.knex.raw(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns
      WHERE table_name = ?
      ORDER BY ordinal_position
    `, [tableName]);

    const primaryKeys = await this.knex.raw(`
      SELECT column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      WHERE tc.table_name = ? AND tc.constraint_type = 'PRIMARY KEY'
    `, [tableName]);

    const foreignKeys = await this.knex.raw(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.constraint_column_usage ccu
        ON kcu.constraint_name = ccu.constraint_name
      JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      WHERE tc.table_name = ? AND tc.constraint_type = 'FOREIGN KEY'
    `, [tableName]);

    const pkColumns = primaryKeys.rows.map(row => row.column_name);
    const fkMap = new Map(
      foreignKeys.rows.map(row => [
        row.column_name,
        { table: row.foreign_table_name, column: row.foreign_column_name }
      ])
    );

    return columnInfo.rows.map(col => ({
      name: col.column_name,
      type: this.mapPostgresType(col.data_type),
      nullable: col.is_nullable === 'YES',
      defaultValue: col.column_default,
      maxLength: col.character_maximum_length,
      isAutoIncrement: col.column_default?.includes('nextval'),
      isPrimaryKey: pkColumns.includes(col.column_name),
      isForeignKey: fkMap.has(col.column_name),
      references: fkMap.get(col.column_name)
    }));
  }

  private async getForeignKeys(tableName: string): Promise<ForeignKeyInfo[]> {
    const result = await this.knex.raw(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.constraint_column_usage ccu
        ON kcu.constraint_name = ccu.constraint_name
      JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      WHERE tc.table_name = ? AND tc.constraint_type = 'FOREIGN KEY'
    `, [tableName]);

    return result.rows.map(row => ({
      column: row.column_name,
      referencesTable: row.foreign_table_name,
      referencesColumn: row.foreign_column_name
    }));
  }

  private async getIndexes(tableName: string): Promise<IndexInfo[]> {
    const result = await this.knex.raw(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = ?
    `, [tableName]);

    return result.rows.map(row => ({
      name: row.indexname,
      columns: this.parseIndexColumns(row.indexdef),
      unique: row.indexdef.includes('UNIQUE')
    }));
  }

  private mapPostgresType(pgType: string): string {
    const typeMap: Record<string, string> = {
      'uuid': 'string',
      'varchar': 'string',
      'character varying': 'string',
      'text': 'string',
      'integer': 'number',
      'bigint': 'number',
      'numeric': 'number',
      'decimal': 'number',
      'boolean': 'boolean',
      'timestamp with time zone': 'Date',
      'timestamp without time zone': 'Date',
      'date': 'Date',
      'json': 'object',
      'jsonb': 'object'
    };

    return typeMap[pgType] || 'any';
  }

  private parseIndexColumns(indexDef: string): string[] {
    // Simple parser for index definition
    const match = indexDef.match(/\(([^)]+)\)/);
    if (match) {
      return match[1].split(',').map(col => col.trim());
    }
    return [];
  }

  // Generate complete CRUD module
  async generateCrudModule(tableName: string, options: GenerateOptions = {}): Promise<GeneratedFiles> {
    const tableInfo = await this.getTableInfo(tableName);
    const moduleInfo = this.getModuleInfo(tableInfo, options);

    const files: GeneratedFiles = {
      types: await this.generateTypes(moduleInfo),
      repository: await this.generateRepository(moduleInfo),
      service: await this.generateService(moduleInfo),
      controller: await this.generateController(moduleInfo),
      validation: await this.generateValidation(moduleInfo),
      tests: await this.generateTests(moduleInfo),
      index: await this.generateIndexFile(moduleInfo)
    };

    if (options.writeToFile) {
      await this.writeGeneratedFiles(moduleInfo.moduleName, files);
    }

    return files;
  }

  private getModuleInfo(tableInfo: TableInfo, options: GenerateOptions): ModuleInfo {
    const moduleName = options.moduleName || this.toCamelCase(tableInfo.name);
    const className = this.toPascalCase(moduleName);

    return {
      tableName: tableInfo.name,
      moduleName,
      className,
      typeInterface: `${className}`,
      createDtoInterface: `Create${className}Dto`,
      updateDtoInterface: `Update${className}Dto`,
      repositoryClass: `${className}Repository`,
      serviceClass: `${className}Service`,
      controllerClass: `${className}Controller`,
      validationClass: `${className}Validation`,
      tableInfo,
      options
    };
  }

  // Type generation
  private async generateTypes(moduleInfo: ModuleInfo): Promise<string> {
    const { tableInfo, typeInterface, createDtoInterface, updateDtoInterface } = moduleInfo;

    const baseInterface = this.generateBaseInterface(tableInfo, typeInterface);
    const createDto = this.generateCreateDto(tableInfo, createDtoInterface);
    const updateDto = this.generateUpdateDto(tableInfo, updateDtoInterface);
    const responseTypes = this.generateResponseTypes(moduleInfo);

    return `// apps/api/src/modules/${moduleInfo.moduleName}/${moduleInfo.moduleName}.types.ts
${baseInterface}

${createDto}

${updateDto}

${responseTypes}
`;
  }

  private generateBaseInterface(tableInfo: TableInfo, interfaceName: string): string {
    const properties = tableInfo.columns.map(col => {
      const optional = col.nullable || col.defaultValue ? '?' : '';
      const type = col.type === 'Date' ? 'Date' : col.type;
      return `  ${col.name}${optional}: ${type};`;
    }).join('\n');

    return `export interface ${interfaceName} {
${properties}
}`;
  }

  private generateCreateDto(tableInfo: TableInfo, interfaceName: string): string {
    const properties = tableInfo.columns
      .filter(col => !col.isAutoIncrement && col.name !== 'created_at' && col.name !== 'updated_at')
      .map(col => {
        const optional = col.nullable || col.defaultValue ? '?' : '';
        return `  ${col.name}${optional}: ${col.type};`;
      }).join('\n');

    return `export interface ${interfaceName} {
${properties}
}`;
  }

  private generateUpdateDto(tableInfo: TableInfo, interfaceName: string): string {
    const properties = tableInfo.columns
      .filter(col => !col.isPrimaryKey && !col.isAutoIncrement && col.name !== 'created_at' && col.name !== 'updated_at')
      .map(col => `  ${col.name}?: ${col.type};`)
      .join('\n');

    return `export interface ${interfaceName} {
${properties}
}`;
  }

  private generateResponseTypes(moduleInfo: ModuleInfo): string {
    const { className } = moduleInfo;

    return `export interface ${className}ListResponse {
  data: ${className}[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ${className}Response {
  success: boolean;
  data: ${className};
  message?: string;
}

export interface ${className}ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  ${this.generateFilterProperties(moduleInfo.tableInfo)}
}`;
  }

  private generateFilterProperties(tableInfo: TableInfo): string {
    return tableInfo.columns
      .filter(col => ['string', 'boolean', 'Date'].includes(col.type))
      .map(col => `  ${col.name}?: ${col.type === 'Date' ? 'string' : col.type};`)
      .join('\n  ');
  }

  // Repository generation
  private async generateRepository(moduleInfo: ModuleInfo): Promise<string> {
    const {
      tableName,
      className,
      repositoryClass,
      typeInterface,
      createDtoInterface,
      updateDtoInterface
    } = moduleInfo;

    const searchFields = this.getSearchableFields(moduleInfo.tableInfo);
    const filterableFields = this.getFilterableFields(moduleInfo.tableInfo);

    return `// apps/api/src/modules/${moduleInfo.moduleName}/${moduleInfo.moduleName}.repository.ts
import { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import {
  ${typeInterface},
  ${createDtoInterface},
  ${updateDtoInterface},
  ${className}ListQuery
} from './${moduleInfo.moduleName}.types';

export class ${repositoryClass} {
  private knex: Knex;
  private table: string = '${tableName}';

  constructor(fastify: FastifyInstance) {
    this.knex = fastify.knex;
  }

  async findAll(query: ${className}ListQuery = {}): Promise<{ data: ${typeInterface}[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      ...filters
    } = query;

    const offset = (page - 1) * limit;

    // Build base query
    let baseQuery = this.knex(this.table);
    let countQuery = this.knex(this.table);

    // Apply search
    if (search) {
      const searchCondition = (builder: Knex.QueryBuilder) => {
        ${this.generateSearchConditions(searchFields)}
      };

      baseQuery = baseQuery.where(searchCondition);
      countQuery = countQuery.where(searchCondition);
    }

    // Apply filters
    ${this.generateFilterConditions(filterableFields)}

    // Apply sorting
    baseQuery = baseQuery.orderBy(sortBy, sortOrder);

    // Execute queries
    const [data, totalResult] = await Promise.all([
      baseQuery.limit(limit).offset(offset),
      countQuery.count('* as count').first()
    ]);

    const total = parseInt(totalResult?.count as string) || 0;

    return { data, total };
  }

  async findById(id: string): Promise<${typeInterface} | null> {
    const result = await this.knex(this.table)
      .where('${moduleInfo.tableInfo.primaryKey}', id)
      .first();

    return result || null;
  }

  async findByIds(ids: string[]): Promise<${typeInterface}[]> {
    return this.knex(this.table)
      .whereIn('${moduleInfo.tableInfo.primaryKey}', ids);
  }

  async create(data: ${createDtoInterface}): Promise<${typeInterface}> {
    const [created] = await this.knex(this.table)
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return created;
  }

  async bulkCreate(items: ${createDtoInterface}[]): Promise<${typeInterface}[]> {
    const dataWithTimestamps = items.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    return this.knex(this.table)
      .insert(dataWithTimestamps)
      .returning('*');
  }

  async update(id: string, data: ${updateDtoInterface}): Promise<${typeInterface} | null> {
    const [updated] = await this.knex(this.table)
      .where('${moduleInfo.tableInfo.primaryKey}', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');

    return updated || null;
  }

  async bulkUpdate(updates: Array<{ id: string; data: ${updateDtoInterface} }>): Promise<${typeInterface}[]> {
    const results: ${typeInterface}[] = [];

    for (const { id, data } of updates) {
      const updated = await this.update(id, data);
      if (updated) {
        results.push(updated);
      }
    }

    return results;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.knex(this.table)
      .where('${moduleInfo.tableInfo.primaryKey}', id)
      .del();

    return deleted > 0;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.knex(this.table)
      .whereIn('${moduleInfo.tableInfo.primaryKey}', ids)
      .del();
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.knex(this.table)
      .where('${moduleInfo.tableInfo.primaryKey}', id)
      .first('${moduleInfo.tableInfo.primaryKey}');

    return !!result;
  }

  async count(filters: any = {}): Promise<number> {
    let query = this.knex(this.table);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.where(key, value);
      }
    });

    const result = await query.count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  ${this.generateCustomMethods(moduleInfo)}
}`;
  }

  // Service generation
  private async generateService(moduleInfo: ModuleInfo): Promise<string> {
    const {
      className,
      serviceClass,
      repositoryClass,
      typeInterface,
      createDtoInterface,
      updateDtoInterface
    } = moduleInfo;

    return `// apps/api/src/modules/${moduleInfo.moduleName}/${moduleInfo.moduleName}.service.ts
import { FastifyInstance } from 'fastify';
import { ${repositoryClass} } from './${moduleInfo.moduleName}.repository';
import {
  ${typeInterface},
  ${createDtoInterface},
  ${updateDtoInterface},
  ${className}ListQuery,
  ${className}ListResponse
} from './${moduleInfo.moduleName}.types';
import { CacheInvalidationService } from '../../services/cache-invalidation.service';

export class ${serviceClass} {
  private ${moduleInfo.moduleName}Repository: ${repositoryClass};
  private cacheInvalidation: CacheInvalidationService;

  constructor(fastify: FastifyInstance) {
    this.${moduleInfo.moduleName}Repository = new ${repositoryClass}(fastify);
    this.cacheInvalidation = new CacheInvalidationService(fastify);
  }

  async get${className}s(query: ${className}ListQuery = {}): Promise<${className}ListResponse> {
    const { page = 1, limit = 10 } = query;

    const result = await this.${moduleInfo.moduleName}Repository.findAll(query);

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  }

  async get${className}ById(id: string): Promise<${typeInterface} | null> {
    return this.${moduleInfo.moduleName}Repository.findById(id);
  }

  async create${className}(data: ${createDtoInterface}): Promise<${typeInterface}> {
    // Business logic validation
    await this.validateCreate${className}(data);

    const created = await this.${moduleInfo.moduleName}Repository.create(data);

    // Cache invalidation
    await this.cacheInvalidation.invalidateByOperationType('create', '${moduleInfo.moduleName}');

    return created;
  }

  async update${className}(id: string, data: ${updateDtoInterface}): Promise<${typeInterface} | null> {
    // Check if exists
    const exists = await this.${moduleInfo.moduleName}Repository.exists(id);
    if (!exists) {
      return null;
    }

    // Business logic validation
    await this.validateUpdate${className}(id, data);

    const updated = await this.${moduleInfo.moduleName}Repository.update(id, data);

    if (updated) {
      // Cache invalidation
      await this.cacheInvalidation.invalidateByOperationType('update', '${moduleInfo.moduleName}');
    }

    return updated;
  }

  async delete${className}(id: string): Promise<boolean> {
    // Check if exists
    const exists = await this.${moduleInfo.moduleName}Repository.exists(id);
    if (!exists) {
      return false;
    }

    // Business logic validation
    await this.validateDelete${className}(id);

    const deleted = await this.${moduleInfo.moduleName}Repository.delete(id);

    if (deleted) {
      // Cache invalidation
      await this.cacheInvalidation.invalidateByOperationType('delete', '${moduleInfo.moduleName}');
    }

    return deleted;
  }

  async bulkCreate${className}s(items: ${createDtoInterface}[]): Promise<${typeInterface}[]> {
    // Validate all items
    for (const item of items) {
      await this.validateCreate${className}(item);
    }

    const created = await this.${moduleInfo.moduleName}Repository.bulkCreate(items);

    // Cache invalidation
    await this.cacheInvalidation.invalidateByOperationType('create', '${moduleInfo.moduleName}');

    return created;
  }

  async bulkUpdate${className}s(updates: Array<{ id: string; data: ${updateDtoInterface} }>): Promise<${typeInterface}[]> {
    // Validate all updates
    for (const { id, data } of updates) {
      await this.validateUpdate${className}(id, data);
    }

    const updated = await this.${moduleInfo.moduleName}Repository.bulkUpdate(updates);

    // Cache invalidation
    await this.cacheInvalidation.invalidateByOperationType('update', '${moduleInfo.moduleName}');

    return updated;
  }

  async bulkDelete${className}s(ids: string[]): Promise<number> {
    // Validate all deletes
    for (const id of ids) {
      await this.validateDelete${className}(id);
    }

    const deletedCount = await this.${moduleInfo.moduleName}Repository.bulkDelete(ids);

    // Cache invalidation
    await this.cacheInvalidation.invalidateByOperationType('delete', '${moduleInfo.moduleName}');

    return deletedCount;
  }

  // Statistics and analytics
  async get${className}Statistics(): Promise<any> {
    const [total, active, recentCount] = await Promise.all([
      this.${moduleInfo.moduleName}Repository.count(),
      this.${moduleInfo.moduleName}Repository.count({ is_active: true }),
      this.${moduleInfo.moduleName}Repository.count({
        created_at: this.knex.raw('> NOW() - INTERVAL \\'7 days\\'')
      })
    ]);

    return {
      total,
      active,
      inactive: total - active,
      recentlyCreated: recentCount
    };
  }

  // Business logic validation methods
  private async validateCreate${className}(data: ${createDtoInterface}): Promise<void> {
    ${this.generateCreateValidation(moduleInfo)}
  }

  private async validateUpdate${className}(id: string, data: ${updateDtoInterface}): Promise<void> {
    ${this.generateUpdateValidation(moduleInfo)}
  }

  private async validateDelete${className}(id: string): Promise<void> {
    ${this.generateDeleteValidation(moduleInfo)}
  }
}`;
  }

  // Controller generation
  private async generateController(moduleInfo: ModuleInfo): Promise<string> {
    const {
      className,
      controllerClass,
      serviceClass,
      typeInterface,
      createDtoInterface,
      updateDtoInterface
    } = moduleInfo;

    return `// apps/api/src/modules/${moduleInfo.moduleName}/${moduleInfo.moduleName}.controller.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ${serviceClass} } from './${moduleInfo.moduleName}.service';
import {
  ${typeInterface},
  ${createDtoInterface},
  ${updateDtoInterface},
  ${className}ListQuery
} from './${moduleInfo.moduleName}.types';
import { ${moduleInfo.validationClass} } from './${moduleInfo.moduleName}.validation';

export class ${controllerClass} {
  private ${moduleInfo.moduleName}Service: ${serviceClass};
  private validation: ${moduleInfo.validationClass};

  constructor(fastify: FastifyInstance) {
    this.${moduleInfo.moduleName}Service = new ${serviceClass}(fastify);
    this.validation = new ${moduleInfo.validationClass}();
  }

  async register(fastify: FastifyInstance) {
    const opts = { prefix: '/${moduleInfo.moduleName}s' };

    await fastify.register(async function (fastify) {
      // List ${moduleInfo.moduleName}s
      fastify.get('/', {
        schema: {
          description: 'Get list of ${moduleInfo.moduleName}s',
          tags: ['${className}'],
          querystring: {
            type: 'object',
            properties: {
              page: { type: 'integer', minimum: 1, default: 1 },
              limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
              search: { type: 'string' },
              sortBy: { type: 'string', default: 'created_at' },
              sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
              ${this.generateQueryStringSchema(moduleInfo.tableInfo)}
            }
          },
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/${className}' }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  }
                }
              }
            }
          }
        },
        preHandler: [fastify.authenticate]
      }, this.get${className}s.bind(this));

      // Get ${moduleInfo.moduleName} by ID
      fastify.get('/:id', {
        schema: {
          description: 'Get ${moduleInfo.moduleName} by ID',
          tags: ['${className}'],
          params: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' }
            },
            required: ['id']
          },
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { $ref: '#/components/schemas/${className}' }
              }
            },
            404: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                error: { type: 'string' }
              }
            }
          }
        },
        preHandler: [fastify.authenticate]
      }, this.get${className}ById.bind(this));

      // Create ${moduleInfo.moduleName}
      fastify.post('/', {
        schema: {
          description: 'Create new ${moduleInfo.moduleName}',
          tags: ['${className}'],
          body: { $ref: '#/components/schemas/Create${className}Dto' },
          response: {
            201: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { $ref: '#/components/schemas/${className}' },
                message: { type: 'string' }
              }
            },
            400: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                error: { type: 'string' },
                details: { type: 'array' }
              }
            }
          }
        },
        preHandler: [
          fastify.authenticate,
          this.validation.validateCreate.bind(this.validation)
        ]
      }, this.create${className}.bind(this));

      // Update ${moduleInfo.moduleName}
      fastify.put('/:id', {
        schema: {
          description: 'Update ${moduleInfo.moduleName}',
          tags: ['${className}'],
          params: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' }
            },
            required: ['id']
          },
          body: { $ref: '#/components/schemas/Update${className}Dto' },
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { $ref: '#/components/schemas/${className}' },
                message: { type: 'string' }
              }
            },
            404: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                error: { type: 'string' }
              }
            }
          }
        },
        preHandler: [
          fastify.authenticate,
          this.validation.validateUpdate.bind(this.validation)
        ]
      }, this.update${className}.bind(this));

      // Delete ${moduleInfo.moduleName}
      fastify.delete('/:id', {
        schema: {
          description: 'Delete ${moduleInfo.moduleName}',
          tags: ['${className}'],
          params: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' }
            },
            required: ['id']
          },
          response: {
            204: {
              description: '${className} deleted successfully'
            },
            404: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                error: { type: 'string' }
              }
            }
          }
        },
        preHandler: [fastify.authenticate]
      }, this.delete${className}.bind(this));

      // Bulk operations
      fastify.post('/bulk', {
        schema: {
          description: 'Bulk create ${moduleInfo.moduleName}s',
          tags: ['${className}'],
          body: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/Create${className}Dto' }
              }
            },
            required: ['items']
          }
        },
        preHandler: [fastify.authenticate]
      }, this.bulkCreate${className}s.bind(this));

      // Statistics
      fastify.get('/statistics', {
        schema: {
          description: 'Get ${moduleInfo.moduleName} statistics',
          tags: ['${className}'],
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                    active: { type: 'integer' },
                    inactive: { type: 'integer' },
                    recentlyCreated: { type: 'integer' }
                  }
                }
              }
            }
          }
        },
        preHandler: [fastify.authenticate]
      }, this.get${className}Statistics.bind(this));
    }, opts);
  }

  // Route handlers
  async get${className}s(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as ${className}ListQuery;
      const result = await this.${moduleInfo.moduleName}Service.get${className}s(query);

      return reply.success(result, '${className}s retrieved successfully');
    } catch (error) {
      return reply.error(error.message, 'Failed to retrieve ${moduleInfo.moduleName}s');
    }
  }

  async get${className}ById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const ${moduleInfo.moduleName} = await this.${moduleInfo.moduleName}Service.get${className}ById(id);

      if (!${moduleInfo.moduleName}) {
        return reply.notFound('${className} not found');
      }

      return reply.success(${moduleInfo.moduleName}, '${className} retrieved successfully');
    } catch (error) {
      return reply.error(error.message, 'Failed to retrieve ${moduleInfo.moduleName}');
    }
  }

  async create${className}(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as ${createDtoInterface};
      const created = await this.${moduleInfo.moduleName}Service.create${className}(data);

      return reply.created(created, '${className} created successfully');
    } catch (error) {
      return reply.error('CREATE_FAILED', error.message, 400);
    }
  }

  async update${className}(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as ${updateDtoInterface};

      const updated = await this.${moduleInfo.moduleName}Service.update${className}(id, data);

      if (!updated) {
        return reply.notFound('${className} not found');
      }

      return reply.success(updated, '${className} updated successfully');
    } catch (error) {
      return reply.error(error.message, 'Failed to update ${moduleInfo.moduleName}');
    }
  }

  async delete${className}(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const deleted = await this.${moduleInfo.moduleName}Service.delete${className}(id);

      if (!deleted) {
        return reply.notFound('${className} not found');
      }

      return reply.success({ deleted: true }, '${className} deleted successfully');
    } catch (error) {
      return reply.error('DELETE_FAILED', error.message, 400);
    }
  }

  async bulkCreate${className}s(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { items } = request.body as { items: ${createDtoInterface}[] };
      const created = await this.${moduleInfo.moduleName}Service.bulkCreate${className}s(items);

      return reply.success(created, \`\${created.length} ${moduleInfo.moduleName}s created successfully\`);
    } catch (error) {
      return reply.error(error.message, 'Failed to bulk create ${moduleInfo.moduleName}s');
    }
  }

  async get${className}Statistics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const statistics = await this.${moduleInfo.moduleName}Service.get${className}Statistics();
      return reply.success(statistics, 'Statistics retrieved successfully');
    } catch (error) {
      return reply.error(error.message, 'Failed to retrieve statistics');
    }
  }
}`;
  }

  // Validation generation
  private async generateValidation(moduleInfo: ModuleInfo): Promise<string> {
    const { validationClass, createDtoInterface, updateDtoInterface } = moduleInfo;

    return `// apps/api/src/modules/${moduleInfo.moduleName}/${moduleInfo.moduleName}.validation.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const create${moduleInfo.className}Schema = z.object({
  ${this.generateZodSchema(moduleInfo.tableInfo, 'create')}
});

const update${moduleInfo.className}Schema = z.object({
  ${this.generateZodSchema(moduleInfo.tableInfo, 'update')}
});

export class ${validationClass} {
  async validateCreate(request: FastifyRequest, reply: FastifyReply) {
    try {
      create${moduleInfo.className}Schema.parse(request.body);
    } catch (error) {
      return reply.error('VALIDATION_ERROR', 'Validation failed', 400, error.errors);
    }
  }

  async validateUpdate(request: FastifyRequest, reply: FastifyReply) {
    try {
      update${moduleInfo.className}Schema.parse(request.body);
    } catch (error) {
      return reply.error('VALIDATION_ERROR', 'Validation failed', 400, error.errors);
    }
  }
}

export const ${moduleInfo.moduleName}Schemas = {
  create: create${moduleInfo.className}Schema,
  update: update${moduleInfo.className}Schema
};`;
  }

  // Test generation
  private async generateTests(moduleInfo: ModuleInfo): Promise<string> {
    const { className, serviceClass, repositoryClass } = moduleInfo;

    return `// apps/api/src/modules/${moduleInfo.moduleName}/__tests__/${moduleInfo.moduleName}.test.ts
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../../app';
import { ${className}, Create${className}Dto } from '../${moduleInfo.moduleName}.types';

describe('${className} Module', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await app.knex('${moduleInfo.tableName}').del();
  });

  describe('${repositoryClass}', () => {
    it('should create ${moduleInfo.moduleName}', async () => {
      const ${moduleInfo.moduleName}Data: Create${className}Dto = ${this.generateTestData(moduleInfo)};

      const repository = new ${repositoryClass}(app);
      const created = await repository.create(${moduleInfo.moduleName}Data);

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      ${this.generateTestAssertions(moduleInfo)}
    });

    it('should find ${moduleInfo.moduleName} by id', async () => {
      const ${moduleInfo.moduleName}Data: Create${className}Dto = ${this.generateTestData(moduleInfo)};

      const repository = new ${repositoryClass}(app);
      const created = await repository.create(${moduleInfo.moduleName}Data);
      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should update ${moduleInfo.moduleName}', async () => {
      const ${moduleInfo.moduleName}Data: Create${className}Dto = ${this.generateTestData(moduleInfo)};

      const repository = new ${repositoryClass}(app);
      const created = await repository.create(${moduleInfo.moduleName}Data);

      const updateData = ${this.generateUpdateTestData(moduleInfo)};
      const updated = await repository.update(created.id, updateData);

      expect(updated).toBeDefined();
      ${this.generateUpdateTestAssertions(moduleInfo)}
    });

    it('should delete ${moduleInfo.moduleName}', async () => {
      const ${moduleInfo.moduleName}Data: Create${className}Dto = ${this.generateTestData(moduleInfo)};

      const repository = new ${repositoryClass}(app);
      const created = await repository.create(${moduleInfo.moduleName}Data);

      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should list ${moduleInfo.moduleName}s with pagination', async () => {
      const repository = new ${repositoryClass}(app);

      // Create test data
      const testItems = Array.from({ length: 15 }, (_, i) => ({
        ${this.generateBulkTestData(moduleInfo)}
      }));

      await repository.bulkCreate(testItems);

      // Test pagination
      const page1 = await repository.findAll({ page: 1, limit: 10 });
      expect(page1.data).toHaveLength(10);
      expect(page1.total).toBe(15);

      const page2 = await repository.findAll({ page: 2, limit: 10 });
      expect(page2.data).toHaveLength(5);
      expect(page2.total).toBe(15);
    });

    it('should search ${moduleInfo.moduleName}s', async () => {
      const repository = new ${repositoryClass}(app);
      const searchableData = ${this.generateSearchTestData(moduleInfo)};

      await repository.create(searchableData);

      const results = await repository.findAll({
        search: '${this.getSearchTerm(moduleInfo)}'
      });

      expect(results.data).toHaveLength(1);
      ${this.generateSearchTestAssertions(moduleInfo)}
    });
  });

  describe('${serviceClass}', () => {
    it('should handle business logic validation', async () => {
      // Test business logic specific to this entity
    });

    it('should generate statistics', async () => {
      const service = new ${serviceClass}(app);
      const stats = await service.get${className}Statistics();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
    });
  });

  describe('API Endpoints', () => {
    it('should return ${moduleInfo.moduleName} list via GET /${moduleInfo.moduleName}s', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/${moduleInfo.moduleName}s',
        headers: {
          authorization: 'Bearer valid-jwt-token'
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toBeDefined();
    });

    it('should create ${moduleInfo.moduleName} via POST /${moduleInfo.moduleName}s', async () => {
      const ${moduleInfo.moduleName}Data = ${this.generateTestData(moduleInfo)};

      const response = await app.inject({
        method: 'POST',
        url: '/${moduleInfo.moduleName}s',
        headers: {
          authorization: 'Bearer valid-jwt-token',
          'content-type': 'application/json'
        },
        payload: ${moduleInfo.moduleName}Data
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const invalidData = {};

      const response = await app.inject({
        method: 'POST',
        url: '/${moduleInfo.moduleName}s',
        headers: {
          authorization: 'Bearer valid-jwt-token',
          'content-type': 'application/json'
        },
        payload: invalidData
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });
  });
});`;
  }

  // Index file generation
  private async generateIndexFile(moduleInfo: ModuleInfo): Promise<string> {
    const { controllerClass, serviceClass, repositoryClass } = moduleInfo;

    return `// apps/api/src/modules/${moduleInfo.moduleName}/index.ts
import { FastifyInstance } from 'fastify';
import { ${controllerClass} } from './${moduleInfo.moduleName}.controller';

export async function ${moduleInfo.moduleName}Module(fastify: FastifyInstance) {
  const controller = new ${controllerClass}(fastify);
  await controller.register(fastify);
}

export * from './${moduleInfo.moduleName}.types';
export * from './${moduleInfo.moduleName}.repository';
export * from './${moduleInfo.moduleName}.service';
export * from './${moduleInfo.moduleName}.controller';
export * from './${moduleInfo.moduleName}.validation';

// Auto-registration for @fastify/autoload
export default ${moduleInfo.moduleName}Module;`;
  }

  // File writing
  private async writeGeneratedFiles(moduleName: string, files: GeneratedFiles): Promise<void> {
    const moduleDir = path.join(process.cwd(), 'apps', 'api', 'src', 'modules', moduleName);

    // Create module directory
    await fs.mkdir(moduleDir, { recursive: true });
    await fs.mkdir(path.join(moduleDir, '__tests__'), { recursive: true });

    // Write files
    await Promise.all([
      fs.writeFile(path.join(moduleDir, `${moduleName}.types.ts`), files.types),
      fs.writeFile(path.join(moduleDir, `${moduleName}.repository.ts`), files.repository),
      fs.writeFile(path.join(moduleDir, `${moduleName}.service.ts`), files.service),
      fs.writeFile(path.join(moduleDir, `${moduleName}.controller.ts`), files.controller),
      fs.writeFile(path.join(moduleDir, `${moduleName}.validation.ts`), files.validation),
      fs.writeFile(path.join(moduleDir, '__tests__', `${moduleName}.test.ts`), files.tests),
      fs.writeFile(path.join(moduleDir, 'index.ts'), files.index)
    ]);

    this.fastify.log.info(\`Generated CRUD module for \${moduleName} at \${moduleDir}\`);
  }

  // Utility methods for code generation
  private getSearchableFields(tableInfo: TableInfo): string[] {
    return tableInfo.columns
      .filter(col => col.type === 'string' && !col.isPrimaryKey)
      .map(col => col.name);
  }

  private getFilterableFields(tableInfo: TableInfo): ColumnInfo[] {
    return tableInfo.columns.filter(col =>
      ['string', 'boolean', 'Date'].includes(col.type) &&
      !col.isPrimaryKey
    );
  }

  private generateSearchConditions(searchFields: string[]): string {
    if (searchFields.length === 0) return '';

    const conditions = searchFields.map(field =>
      `        builder.orWhereILike('${field}', \`%\${search}%\`);`
    ).join('\n');

    return conditions;
  }

  private generateFilterConditions(filterableFields: ColumnInfo[]): string {
    return filterableFields.map(field => `
    if (filters.${field.name} !== undefined) {
      baseQuery = baseQuery.where('${field.name}', filters.${field.name});
      countQuery = countQuery.where('${field.name}', filters.${field.name});
    }`).join('');
  }

  private generateQueryStringSchema(tableInfo: TableInfo): string {
    return tableInfo.columns
      .filter(col => ['string', 'boolean'].includes(col.type) && !col.isPrimaryKey)
      .map(col => {
        const type = col.type === 'boolean' ? 'boolean' : 'string';
        return `              ${col.name}: { type: '${type}' }`;
      }).join(',\n');
  }

  private generateZodSchema(tableInfo: TableInfo, type: 'create' | 'update'): string {
    const columns = type === 'create'
      ? tableInfo.columns.filter(col => !col.isAutoIncrement && col.name !== 'created_at' && col.name !== 'updated_at')
      : tableInfo.columns.filter(col => !col.isPrimaryKey && !col.isAutoIncrement && col.name !== 'created_at' && col.name !== 'updated_at');

    return columns.map(col => {
      let schema = this.getZodType(col);

      if (type === 'update' || col.nullable || col.defaultValue) {
        schema += '.optional()';
      }

      return `  ${col.name}: ${schema}`;
    }).join(',\n');
  }

  private getZodType(col: ColumnInfo): string {
    const typeMap: Record<string, string> = {
      'string': 'z.string()',
      'number': 'z.number()',
      'boolean': 'z.boolean()',
      'Date': 'z.string().datetime()',
      'object': 'z.object({})'
    };

    let zodType = typeMap[col.type] || 'z.any()';

    // Add constraints
    if (col.type === 'string' && col.maxLength) {
      zodType += `.max(${col.maxLength})`;
    }

    if (col.type === 'string' && col.name.includes('email')) {
      zodType += '.email()';
    }

    if (col.type === 'string' && col.name.includes('url')) {
      zodType += '.url()';
    }

    return zodType;
  }

  private generateCustomMethods(moduleInfo: ModuleInfo): string {
    const methods = [];

    // Generate relationship methods
    for (const fk of moduleInfo.tableInfo.foreignKeys) {
      const relatedEntity = this.toPascalCase(fk.referencesTable);
      methods.push(`
  async findBy${relatedEntity}(${fk.referencesColumn}: string): Promise<${moduleInfo.typeInterface}[]> {
    return this.knex(this.table).where('${fk.column}', ${fk.referencesColumn});
  }`);
    }

    // Generate status methods if has status column
    const statusColumn = moduleInfo.tableInfo.columns.find(col =>
      col.name === 'status' || col.name === 'is_active'
    );

    if (statusColumn) {
      const statusMethod = statusColumn.name === 'is_active'
        ? `
  async findActive(): Promise<${moduleInfo.typeInterface}[]> {
    return this.knex(this.table).where('is_active', true);
  }

  async findInactive(): Promise<${moduleInfo.typeInterface}[]> {
    return this.knex(this.table).where('is_active', false);
  }`
        : `
  async findByStatus(status: string): Promise<${moduleInfo.typeInterface}[]> {
    return this.knex(this.table).where('status', status);
  }`;

      methods.push(statusMethod);
    }

    return methods.join('\n');
  }

  private generateCreateValidation(moduleInfo: ModuleInfo): string {
    const validations = [];

    // Check for unique constraints
    const uniqueFields = moduleInfo.tableInfo.columns.filter(col =>
      col.name === 'email' || col.name === 'username'
    );

    for (const field of uniqueFields) {
      validations.push(`
    // Check if ${field.name} already exists
    const existing = await this.${moduleInfo.moduleName}Repository.knex('${moduleInfo.tableName}')
      .where('${field.name}', data.${field.name})
      .first();

    if (existing) {
      throw new Error('${field.name} already exists');
    }`);
    }

    return validations.join('\n') || '    // No additional validation needed';
  }

  private generateUpdateValidation(moduleInfo: ModuleInfo): string {
    return '    // Add update-specific validation here';
  }

  private generateDeleteValidation(moduleInfo: ModuleInfo): string {
    // Check for foreign key relationships
    const hasRelationships = moduleInfo.tableInfo.foreignKeys.length > 0;

    if (hasRelationships) {
      return `
    // Check if ${moduleInfo.moduleName} can be safely deleted
    // Add checks for dependent records here`;
    }

    return '    // No delete validation needed';
  }

  private generateTestData(moduleInfo: ModuleInfo): string {
    const testData = moduleInfo.tableInfo.columns
      .filter(col => !col.isAutoIncrement && col.name !== 'created_at' && col.name !== 'updated_at')
      .map(col => {
        const value = this.generateTestValue(col);
        return `      ${col.name}: ${value}`;
      })
      .join(',\n');

    return `{
${testData}
    }`;
  }

  private generateTestValue(col: ColumnInfo): string {
    if (col.name === 'email') return `'test@example.com'`;
    if (col.name === 'username') return `'testuser'`;
    if (col.name === 'name' || col.name === 'title') return `'Test ${this.toPascalCase(col.name)}'`;
    if (col.name === 'description') return `'Test description'`;
    if (col.name === 'is_active') return 'true';
    if (col.name === 'status') return `'active'`;

    switch (col.type) {
      case 'string': return `'test-${col.name}'`;
      case 'number': return '1';
      case 'boolean': return 'true';
      case 'Date': return 'new Date()';
      default: return 'null';
    }
  }

  private generateUpdateTestData(moduleInfo: ModuleInfo): string {
    const updateFields = moduleInfo.tableInfo.columns
      .filter(col => !col.isPrimaryKey && !col.isAutoIncrement && col.name !== 'created_at' && col.name !== 'updated_at')
      .slice(0, 2); // Update first 2 fields only

    const testData = updateFields.map(col => {
      const value = this.generateTestValue(col).replace('test', 'updated');
      return `        ${col.name}: ${value}`;
    }).join(',\n');

    return `{
${testData}
      }`;
  }

  private generateBulkTestData(moduleInfo: ModuleInfo): string {
    const nameField = moduleInfo.tableInfo.columns.find(col =>
      col.name === 'name' || col.name === 'title' || col.name === 'email'
    );

    if (nameField) {
      return `...testItems[0], ${nameField.name}: \`test-\${i}\``;
    }

    return '...testItems[0]';
  }

  private generateSearchTestData(moduleInfo: ModuleInfo): string {
    const searchableField = this.getSearchableFields(moduleInfo.tableInfo)[0];
    if (!searchableField) return this.generateTestData(moduleInfo);

    const testData = this.generateTestData(moduleInfo);
    return testData.replace(
      new RegExp(`${searchableField}': '[^']*'`),
      `${searchableField}': 'unique-searchable-value'`
    );
  }

  private getSearchTerm(moduleInfo: ModuleInfo): string {
    return 'unique-searchable';
  }

  private generateTestAssertions(moduleInfo: ModuleInfo): string {
    const requiredFields = moduleInfo.tableInfo.columns
      .filter(col => !col.nullable && !col.isAutoIncrement)
      .map(col => `      expect(created.${col.name}).toBeDefined();`)
      .join('\n');

    return requiredFields;
  }

  private generateUpdateTestAssertions(moduleInfo: ModuleInfo): string {
    return '      expect(updated?.updated_at).not.toBe(created.updated_at);';
  }

  private generateSearchTestAssertions(moduleInfo: ModuleInfo): string {
    const searchableField = this.getSearchableFields(moduleInfo.tableInfo)[0];
    if (!searchableField) return '';

    return `      expect(results.data[0].${searchableField}).toContain('unique-searchable');`;
  }

  // Utility methods
  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private toPascalCase(str: string): string {
    const camelCase = this.toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}

interface GenerateOptions {
  moduleName?: string;
  writeToFile?: boolean;
  includeCache?: boolean;
  includeValidation?: boolean;
  includeTests?: boolean;
  permissions?: string[];
}

interface ModuleInfo {
  tableName: string;
  moduleName: string;
  className: string;
  typeInterface: string;
  createDtoInterface: string;
  updateDtoInterface: string;
  repositoryClass: string;
  serviceClass: string;
  controllerClass: string;
  validationClass: string;
  tableInfo: TableInfo;
  options: GenerateOptions;
}

interface GeneratedFiles {
  types: string;
  repository: string;
  service: string;
  controller: string;
  validation: string;
  tests: string;
  index: string;
}
```

## CLI Generator Tool

### Command Line Interface

```typescript
// apps/api/src/cli/generate-crud.ts
import { Command } from 'commander';
import { CrudGeneratorService } from '../generators/crud-generator.service';
import { buildApp } from '../app';

const program = new Command();

program
  .name('generate-crud')
  .description('Generate CRUD module from database table')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate CRUD module for a table')
  .argument('<tableName>', 'Database table name')
  .option('-m, --module <name>', 'Module name (defaults to table name)')
  .option('-f, --force', 'Overwrite existing files')
  .option('--no-cache', 'Skip cache integration')
  .option('--no-validation', 'Skip validation generation')
  .option('--no-tests', 'Skip test generation')
  .option('-p, --permissions <permissions...>', 'Required permissions')
  .action(async (tableName: string, options) => {
    try {
      const app = await buildApp();
      await app.ready();

      const generator = new CrudGeneratorService(app);

      console.log(\`🚀 Generating CRUD module for table: \${tableName}\`);

      const files = await generator.generateCrudModule(tableName, {
        moduleName: options.module,
        writeToFile: true,
        includeCache: options.cache !== false,
        includeValidation: options.validation !== false,
        includeTests: options.tests !== false,
        permissions: options.permissions
      });

      console.log('✅ Generated files:');
      console.log(\`   📁 apps/api/src/modules/\${options.module || tableName}/\`);
      console.log('   📄 types.ts');
      console.log('   📄 repository.ts');
      console.log('   📄 service.ts');
      console.log('   📄 controller.ts');
      console.log('   📄 validation.ts');
      console.log('   📄 index.ts');
      console.log('   📄 __tests__/test.ts');

      await app.close();

    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('list-tables')
  .description('List all available tables')
  .action(async () => {
    try {
      const app = await buildApp();
      await app.ready();

      const generator = new CrudGeneratorService(app);

      const tables = await app.knex.raw(\`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      \`);

      console.log('📋 Available tables:');
      tables.rows.forEach((table, index) => {
        console.log(\`   \${index + 1}. \${table.table_name}\`);
      });

      await app.close();

    } catch (error) {
      console.error('❌ Failed to list tables:', error.message);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze table structure')
  .argument('<tableName>', 'Database table name')
  .action(async (tableName: string) => {
    try {
      const app = await buildApp();
      await app.ready();

      const generator = new CrudGeneratorService(app);
      const tableInfo = await generator.getTableInfo(tableName);

      console.log(\`📊 Table Analysis: \${tableName}\`);
      console.log(\`   Primary Key: \${tableInfo.primaryKey}\`);
      console.log(\`   Columns: \${tableInfo.columns.length}\`);
      console.log(\`   Foreign Keys: \${tableInfo.foreignKeys.length}\`);
      console.log(\`   Indexes: \${tableInfo.indexes.length}\`);

      console.log('\\n📝 Columns:');
      tableInfo.columns.forEach(col => {
        const flags = [
          col.isPrimaryKey ? 'PK' : '',
          col.isForeignKey ? 'FK' : '',
          col.nullable ? 'NULL' : 'NOT NULL',
          col.isAutoIncrement ? 'AUTO' : ''
        ].filter(Boolean).join(', ');

        console.log(\`   \${col.name} (\${col.type}) [\${flags}]\`);
      });

      if (tableInfo.foreignKeys.length > 0) {
        console.log('\\n🔗 Foreign Keys:');
        tableInfo.foreignKeys.forEach(fk => {
          console.log(\`   \${fk.column} → \${fk.referencesTable}.\${fk.referencesColumn}\`);
        });
      }

      await app.close();

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  });

// Package.json script
program.parse(process.argv);
```

### Package.json Scripts

```json
{
  "scripts": {
    "generate:crud": "tsx apps/api/src/cli/generate-crud.ts generate",
    "generate:list-tables": "tsx apps/api/src/cli/generate-crud.ts list-tables",
    "generate:analyze": "tsx apps/api/src/cli/generate-crud.ts analyze"
  }
}
```

## Usage Examples

### Generate CRUD for Users Table

```bash
# List available tables
yarn generate:list-tables

# Analyze table structure
yarn generate:analyze users

# Generate full CRUD module
yarn generate:crud users

# Generate with custom options
yarn generate:crud products --module product --permissions product.read product.write

# Generate without cache integration
yarn generate:crud categories --no-cache

# Generate minimal version (no tests, no validation)
yarn generate:crud tags --no-tests --no-validation
```

### Generated File Structure

```
apps/api/src/modules/users/
├── users.types.ts           # TypeScript interfaces
├── users.repository.ts      # Database operations
├── users.service.ts         # Business logic
├── users.controller.ts      # HTTP routes
├── users.validation.ts      # Zod schemas
├── index.ts                # Module exports
└── __tests__/
    └── users.test.ts       # Complete test suite
```

## Advanced Generator Features

### Multi-Table Generation

```typescript
// Generate multiple related tables at once
export class MultiTableGenerator extends CrudGeneratorService {
  async generateRelatedModules(tableNames: string[]): Promise<void> {
    const tableInfos = await Promise.all(
      tableNames.map(name => this.getTableInfo(name))
    );

    // Generate in dependency order
    const orderedTables = this.sortByDependencies(tableInfos);

    for (const tableInfo of orderedTables) {
      await this.generateCrudModule(tableInfo.name, {
        writeToFile: true,
        includeCache: true
      });
    }

    // Generate relationship helpers
    await this.generateRelationshipHelpers(tableInfos);
  }

  private sortByDependencies(tables: TableInfo[]): TableInfo[] {
    // Sort tables by foreign key dependencies
    const graph = new Map<string, string[]>();

    // Build dependency graph
    tables.forEach(table => {
      const dependencies = table.foreignKeys.map(fk => fk.referencesTable);
      graph.set(table.name, dependencies);
    });

    // Topological sort
    const sorted: TableInfo[] = [];
    const visited = new Set<string>();

    const visit = (tableName: string) => {
      if (visited.has(tableName)) return;
      visited.add(tableName);

      const deps = graph.get(tableName) || [];
      deps.forEach(visit);

      const table = tables.find(t => t.name === tableName);
      if (table) sorted.push(table);
    };

    tables.forEach(table => visit(table.name));

    return sorted;
  }

  private async generateRelationshipHelpers(tables: TableInfo[]): Promise<void> {
    // Generate helper methods for loading related data
    const helpers = tables.map(table => {
      const relationships = table.foreignKeys.map(fk => {
        const relatedTable = tables.find(t => t.name === fk.referencesTable);
        if (!relatedTable) return '';

        return \`
  async load\${this.toPascalCase(fk.referencesTable)}For\${this.toPascalCase(table.name)}(
    \${table.name}Id: string
  ): Promise<\${this.toPascalCase(fk.referencesTable)}[]> {
    return this.knex('\${fk.referencesTable}')
      .where('\${fk.referencesColumn}', \${table.name}Id);
  }\`;
      }).filter(Boolean).join('');

      return relationships;
    }).join('');

    const helperFile = \`
// apps/api/src/services/relationship.service.ts
import { FastifyInstance } from 'fastify';

export class RelationshipService {
  private knex: Knex;

  constructor(fastify: FastifyInstance) {
    this.knex = fastify.knex;
  }

  \${helpers}
}
\`;

    await fs.writeFile(
      path.join(process.cwd(), 'apps', 'api', 'src', 'services', 'relationship.service.ts'),
      helperFile
    );
  }
}
```

### Custom Template System

```typescript
// apps/api/src/generators/template.system.ts
export class TemplateSystem {
  private templates: Map<string, string> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  private loadDefaultTemplates(): void {
    this.templates.set('controller', `
{{#if hasAuth}}
import { authenticate } from '../../middleware/auth.middleware';
{{/if}}

export class {{className}}Controller {
  {{#each methods}}
  async {{name}}(request: FastifyRequest, reply: FastifyReply) {
    {{body}}
  }
  {{/each}}
}
    `);

    this.templates.set('service', `
export class {{className}}Service {
  {{#each methods}}
  async {{name}}({{parameters}}): Promise<{{returnType}}> {
    {{body}}
  }
  {{/each}}
}
    `);
  }

  render(templateName: string, context: any): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(\`Template \${templateName} not found\`);
    }

    return this.processTemplate(template, context);
  }

  private processTemplate(template: string, context: any): string {
    // Simple template engine - replace {{variable}} and handle {{#if}} {{/if}}
    let result = template;

    // Replace variables
    Object.entries(context).forEach(([key, value]) => {
      const regex = new RegExp(\`{{\${key}}}\`, 'g');
      result = result.replace(regex, String(value));
    });

    // Handle conditionals
    result = result.replace(
      /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g,
      (match, condition, content) => {
        return context[condition] ? content : '';
      }
    );

    // Handle loops
    result = result.replace(
      /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g,
      (match, arrayName, content) => {
        const array = context[arrayName] || [];
        return array.map((item: any) =>
          this.processTemplate(content, { ...context, ...item })
        ).join('');
      }
    );

    return result;
  }

  addCustomTemplate(name: string, template: string): void {
    this.templates.set(name, template);
  }
}
```

## REST API for CRUD Generator

### Generator Controller

```typescript
// apps/api/src/modules/generator/generator.controller.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CrudGeneratorService } from '../../generators/crud-generator.service';

export class GeneratorController {
  private generatorService: CrudGeneratorService;

  constructor(fastify: FastifyInstance) {
    this.generatorService = new CrudGeneratorService(fastify);
  }

  async register(fastify: FastifyInstance) {
    await fastify.register(async function (fastify) {
      // List tables
      fastify.get('/tables', {
        schema: {
          description: 'List all database tables',
          tags: ['Generator'],
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      columnCount: { type: 'integer' },
                      hasTimestamps: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          }
        },
        preHandler: [fastify.authenticate, fastify.requireAdmin]
      }, this.listTables.bind(this));

      // Analyze table
      fastify.get('/tables/:tableName/analyze', {
        schema: {
          description: 'Analyze table structure',
          tags: ['Generator'],
          params: {
            type: 'object',
            properties: {
              tableName: { type: 'string' }
            },
            required: ['tableName']
          }
        },
        preHandler: [fastify.authenticate, fastify.requireAdmin]
      }, this.analyzeTable.bind(this));

      // Preview generated code
      fastify.post('/preview', {
        schema: {
          description: 'Preview generated CRUD code',
          tags: ['Generator'],
          body: {
            type: 'object',
            properties: {
              tableName: { type: 'string' },
              options: {
                type: 'object',
                properties: {
                  moduleName: { type: 'string' },
                  includeCache: { type: 'boolean' },
                  includeValidation: { type: 'boolean' },
                  includeTests: { type: 'boolean' }
                }
              }
            },
            required: ['tableName']
          }
        },
        preHandler: [fastify.authenticate, fastify.requireAdmin]
      }, this.previewGeneration.bind(this));

      // Generate CRUD module
      fastify.post('/generate', {
        schema: {
          description: 'Generate CRUD module',
          tags: ['Generator'],
          body: {
            type: 'object',
            properties: {
              tableName: { type: 'string' },
              options: {
                type: 'object',
                properties: {
                  moduleName: { type: 'string' },
                  writeToFile: { type: 'boolean', default: true },
                  includeCache: { type: 'boolean', default: true },
                  includeValidation: { type: 'boolean', default: true },
                  includeTests: { type: 'boolean', default: true },
                  permissions: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            },
            required: ['tableName']
          }
        },
        preHandler: [fastify.authenticate, fastify.requireAdmin]
      }, this.generateCrud.bind(this));

    }, { prefix: '/api/generator' });
  }

  async listTables(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tables = await request.server.knex.raw(\`
        SELECT
          table_name,
          (
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_name = t.table_name
          ) as column_count,
          (
            SELECT EXISTS(
              SELECT 1 FROM information_schema.columns
              WHERE table_name = t.table_name
              AND column_name IN ('created_at', 'updated_at')
            )
          ) as has_timestamps
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      \`);

      const data = tables.rows.map(row => ({
        name: row.table_name,
        columnCount: parseInt(row.column_count),
        hasTimestamps: row.has_timestamps
      }));

      return reply.success(data, 'Tables retrieved successfully');
    } catch (error) {
      return reply.error(error.message, 'Failed to list tables');
    }
  }

  async analyzeTable(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { tableName } = request.params as { tableName: string };
      const tableInfo = await this.generatorService.getTableInfo(tableName);

      return reply.success(tableInfo, 'Table analyzed successfully');
    } catch (error) {
      return reply.error(error.message, 'Failed to analyze table');
    }
  }

  async previewGeneration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { tableName, options = {} } = request.body as any;

      const files = await this.generatorService.generateCrudModule(tableName, {
        ...options,
        writeToFile: false
      });

      return reply.success(files, 'Code preview generated successfully');
    } catch (error) {
      return reply.error(error.message, 'Failed to generate preview');
    }
  }

  async generateCrud(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { tableName, options = {} } = request.body as any;

      const files = await this.generatorService.generateCrudModule(tableName, {
        writeToFile: true,
        includeCache: true,
        includeValidation: true,
        includeTests: true,
        ...options
      });

      const moduleName = options.moduleName || tableName;

      return reply.success(
        {
          moduleName,
          filesGenerated: Object.keys(files),
          location: \`apps/api/src/modules/\${moduleName}/\`
        },
        'CRUD module generated successfully'
      );
    } catch (error) {
      return reply.error(error.message, 'Failed to generate CRUD module');
    }
  }
}
```

## Admin UI for CRUD Generator

### Frontend Generator Service

```typescript
// libs/ui-kit/src/lib/services/crud-generator.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/client';

export interface TableInfo {
  name: string;
  columnCount: number;
  hasTimestamps: boolean;
}

export interface GenerateRequest {
  tableName: string;
  options: {
    moduleName?: string;
    includeCache?: boolean;
    includeValidation?: boolean;
    includeTests?: boolean;
    permissions?: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class CrudGeneratorService {
  private http = inject(HttpClient);

  // State signals
  private tablesSignal = signal<TableInfo[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly tables = this.tablesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  async loadTables(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http.get<{ data: TableInfo[] }>('/api/generator/tables').toPromise();
      this.tablesSignal.set(response?.data || []);
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load tables');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async analyzeTable(tableName: string): Promise<any> {
    try {
      const response = await this.http.get<{ data: any }>(\`/api/generator/tables/\${tableName}/analyze\`).toPromise();
      return response?.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to analyze table');
    }
  }

  async previewGeneration(request: GenerateRequest): Promise<any> {
    try {
      const response = await this.http.post<{ data: any }>('/api/generator/preview', request).toPromise();
      return response?.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate preview');
    }
  }

  async generateCrud(request: GenerateRequest): Promise<any> {
    try {
      const response = await this.http.post<{ data: any }>('/api/generator/generate', request).toPromise();
      return response?.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate CRUD');
    }
  }
}
```

### Generator UI Component

```typescript
// apps/admin-portal/src/app/features/generator/generator.component.ts
@Component({
  selector: 'app-crud-generator',
  standalone: true,
  template: \`
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">CRUD Generator</h1>

      <!-- Table Selection -->
      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title>Select Database Table</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (generatorService.loading()) {
            <div class="flex justify-center py-8">
              <mat-spinner></mat-spinner>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (table of generatorService.tables(); track table.name) {
                <div class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                     [class.ring-2]="selectedTable() === table.name"
                     [class.ring-blue-500]="selectedTable() === table.name"
                     (click)="selectTable(table.name)">
                  <h3 class="font-medium text-gray-900">{{ table.name }}</h3>
                  <p class="text-sm text-gray-500">{{ table.columnCount }} columns</p>
                  @if (table.hasTimestamps) {
                    <span class="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Has Timestamps
                    </span>
                  }
                </div>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Generation Options -->
      @if (selectedTable()) {
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-card-title>Generation Options</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="optionsForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Module Name</mat-label>
                <input matInput formControlName="moduleName" [placeholder]="selectedTable()">
              </mat-form-field>

              <div class="space-y-2">
                <h4 class="text-sm font-medium text-gray-700">Include Features</h4>
                <mat-checkbox formControlName="includeCache">Cache Integration</mat-checkbox>
                <mat-checkbox formControlName="includeValidation">Validation Schemas</mat-checkbox>
                <mat-checkbox formControlName="includeTests">Test Suite</mat-checkbox>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Preview -->
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-card-title>Code Preview</mat-card-title>
            <button mat-button (click)="generatePreview()">
              <mat-icon>preview</mat-icon>
              Generate Preview
            </button>
          </mat-card-header>
          <mat-card-content>
            @if (previewLoading()) {
              <mat-spinner diameter="30"></mat-spinner>
            } @else if (preview()) {
              <mat-tab-group>
                @for (file of previewFiles(); track file.name) {
                  <mat-tab [label]="file.name">
                    <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                      <code>{{ file.content }}</code>
                    </pre>
                  </mat-tab>
                }
              </mat-tab-group>
            }
          </mat-card-content>
        </mat-card>

        <!-- Generate Button -->
        <div class="flex justify-end">
          <button mat-raised-button color="primary"
                  [disabled]="!selectedTable() || generating()"
                  (click)="generateCrud()">
            @if (generating()) {
              <mat-spinner diameter="20" class="mr-2"></mat-spinner>
            }
            Generate CRUD Module
          </button>
        </div>
      }
    </div>
  \`
})
export class CrudGeneratorComponent implements OnInit {
  generatorService = inject(CrudGeneratorService);
  private fb = inject(FormBuilder);

  // Component state
  selectedTable = signal<string | null>(null);
  preview = signal<any>(null);
  previewLoading = signal(false);
  generating = signal(false);

  // Form
  optionsForm = this.fb.group({
    moduleName: [''],
    includeCache: [true],
    includeValidation: [true],
    includeTests: [true]
  });

  // Computed
  previewFiles = computed(() => {
    const previewData = this.preview();
    if (!previewData) return [];

    return Object.entries(previewData).map(([name, content]) => ({
      name: \`\${name}.ts\`,
      content
    }));
  });

  async ngOnInit() {
    await this.generatorService.loadTables();
  }

  selectTable(tableName: string) {
    this.selectedTable.set(tableName);
    this.optionsForm.patchValue({
      moduleName: tableName
    });
  }

  async generatePreview() {
    const tableName = this.selectedTable();
    if (!tableName) return;

    this.previewLoading.set(true);

    try {
      const options = this.optionsForm.value;
      const preview = await this.generatorService.previewGeneration({
        tableName,
        options
      });

      this.preview.set(preview);
    } catch (error: any) {
      console.error('Preview generation failed:', error);
    } finally {
      this.previewLoading.set(false);
    }
  }

  async generateCrud() {
    const tableName = this.selectedTable();
    if (!tableName) return;

    this.generating.set(true);

    try {
      const options = this.optionsForm.value;
      const result = await this.generatorService.generateCrud({
        tableName,
        options: {
          ...options,
          writeToFile: true
        }
      });

      // Show success message
      console.log('CRUD module generated successfully:', result);

      // Could redirect to the generated module or show success notification
    } catch (error: any) {
      console.error('CRUD generation failed:', error);
    } finally {
      this.generating.set(false);
    }
  }
}
```

## Integration with Existing Architecture

### Module Auto-Registration

```typescript
// apps/api/src/app.ts
import { AutoloadPluginOptions } from '@fastify/autoload';

// Auto-load generated modules
await app.register(import('@fastify/autoload'), {
  dir: path.join(__dirname, 'modules'),
  options: { prefix: '/api' },
  forceESM: true,
  dirNameRoutePrefix: false, // Don't use folder name as prefix
  scriptPattern: /.*\.(ts|js)$/,
  indexPattern: /^index\.(ts|js)$/,
} as AutoloadPluginOptions);
```

### Generated Module Template

```typescript
// Template for auto-generated modules
export default async function (fastify: FastifyInstance) {
  // Generated module auto-registers itself
  const controller = new {{className}}Controller(fastify);
  await controller.register(fastify);

  fastify.log.info('{{className}} module loaded');
}
```

## Best Practices for Generated Code

### Code Quality Standards

1. **Type Safety**: All generated code is fully typed
2. **Error Handling**: Proper error handling in all layers
3. **Validation**: Zod schemas for runtime validation
4. **Testing**: Complete test coverage
5. **Documentation**: Auto-generated API docs
6. **Cache Integration**: Built-in caching support
7. **Security**: Authentication and authorization
8. **Performance**: Optimized queries and pagination

### Customization Points

1. **Business Logic**: Override validation methods
2. **Custom Endpoints**: Add additional routes
3. **Relationships**: Extend with relationship methods
4. **Permissions**: Configure fine-grained permissions
5. **Cache Strategy**: Customize caching behavior
6. **Search Logic**: Enhance search capabilities
7. **Audit Trail**: Add audit logging
8. **Soft Delete**: Implement soft delete pattern

### Generated Module Usage

```bash
# Generate basic CRUD
yarn generate:crud products

# Access generated API
GET    /api/products              # List products
GET    /api/products/:id          # Get product
POST   /api/products              # Create product
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Delete product
GET    /api/products/statistics   # Get statistics

# Test the generated module
yarn test apps/api/src/modules/products
```

แล้วเสร็จครับ! ตอนนี้มี CRUD Generator ที่สามารถ:

- 🔍 Analyze database tables automatically
- 🚀 Generate complete CRUD modules (repository, service, controller, types, validation, tests)
- 🎛️ CLI tool และ Admin UI interface
- ✅ Integration กับ Knex plugin pattern
- 🏗️ Follow enterprise architecture patterns
- 📝 Auto-generate tests และ documentation
