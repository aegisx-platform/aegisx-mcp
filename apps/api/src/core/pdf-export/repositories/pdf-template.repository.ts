import { Knex } from 'knex';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import {
  CreatePdfTemplate,
  PdfRender,
  PdfTemplate,
  PdfTemplateListQuery,
  PdfTemplateStats,
  PdfTemplateVersion,
  UpdatePdfTemplate,
} from '../../../types/pdf-template.types';

/**
 * PDF Template Repository
 *
 * Handles database operations for PDF templates
 */
export class PdfTemplateRepository extends BaseRepository<
  PdfTemplate,
  CreatePdfTemplate,
  UpdatePdfTemplate
> {
  constructor(knex: Knex) {
    super(
      knex,
      'pdf_templates',
      ['name', 'display_name', 'description', 'category', 'type'],
      ['id', 'created_by', 'updated_by'],
    );
  }

  // Implement abstract methods from BaseRepository
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToEntity(dbRow: any): PdfTemplate {
    return dbRow; // No transformation needed for this model
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToDb(dto: CreatePdfTemplate | UpdatePdfTemplate): any {
    const transformed = { ...dto };

    // Stringify JSONB fields for Postgres
    if (transformed.asset_file_ids !== undefined) {
      (transformed as Record<string, unknown>).asset_file_ids = JSON.stringify(
        transformed.asset_file_ids,
      );
    }

    if (transformed.logo_settings !== undefined) {
      (transformed as Record<string, unknown>).logo_settings = JSON.stringify(
        transformed.logo_settings,
      );
    }

    return transformed;
  }

  getJoinQuery(): Knex.QueryBuilder {
    return this.knex(this.tableName); // No joins needed for this model
  }

  /**
   * Override create to support userId
   */
  async create(data: CreatePdfTemplate, userId?: string): Promise<PdfTemplate> {
    const transformed = this.transformToDb(data);
    const dbData = {
      ...transformed,
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [row] = await this.query().insert(dbData).returning('*');
    return row;
  }

  /**
   * Override update to support userId
   */
  async update(
    id: string,
    data: UpdatePdfTemplate,
    userId?: string,
  ): Promise<PdfTemplate> {
    const transformed = this.transformToDb(data);
    const dbData = {
      ...transformed,
      updated_by: userId,
      updated_at: new Date(),
    };

    const [row] = await this.query()
      .where({ id })
      .update(dbData)
      .returning('*');

    if (!row) {
      throw new Error('Template not found');
    }

    return row;
  }

  /**
   * Find template by name
   */
  async findByName(
    name: string,
    includeInactive: boolean = false,
  ): Promise<PdfTemplate | null> {
    try {
      const query = this.knex(this.tableName).where('name', name);

      if (!includeInactive) {
        query.where('is_active', true);
      }

      const template = await query.first();
      return template || null;
    } catch (error) {
      console.error('Error finding template by name:', error);
      throw new Error(`Failed to find template: ${error.message}`);
    }
  }

  /**
   * Get templates with advanced filtering
   */
  async findManyWithFilters(query: PdfTemplateListQuery) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        type,
        isActive,
        search,
        sortBy = 'updated_at',
        sortOrder = 'desc',
      } = query;

      // Build base query for filters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buildFilteredQuery = (query: any) => {
        if (category) {
          query = query.where('category', category);
        }
        if (type) {
          query = query.where('type', type);
        }
        if (isActive !== undefined) {
          query = query.where('is_active', isActive);
        }
        if (search) {
          query = query.where((builder) => {
            builder
              .whereILike('name', `%${search}%`)
              .orWhereILike('display_name', `%${search}%`)
              .orWhereILike('description', `%${search}%`);
          });
        }
        return query;
      };

      // Get total count with filters
      let countQuery = this.knex(this.tableName);
      countQuery = buildFilteredQuery(countQuery);
      const [{ count }] = await countQuery.count('* as count');
      const total = parseInt(count.toString());

      // Get paginated data with filters
      let dataQuery = this.knex(this.tableName).select('*');
      dataQuery = buildFilteredQuery(dataQuery);
      const offset = (page - 1) * limit;
      const templates = await dataQuery
        .orderBy(sortBy, sortOrder)
        .limit(limit)
        .offset(offset);

      return {
        data: templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error finding templates with filters:', error);
      throw new Error(`Failed to query templates: ${error.message}`);
    }
  }

  /**
   * Get template categories
   */
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      const categories = await this.knex(this.tableName)
        .select('category')
        .count('* as count')
        .where('is_active', true)
        .groupBy('category')
        .orderBy('count', 'desc');

      return categories.map((cat) => ({
        category: cat.category,
        count: parseInt(cat.count.toString()),
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  /**
   * Get template types
   */
  async getTypes(): Promise<Array<{ type: string; count: number }>> {
    try {
      const types = await this.knex(this.tableName)
        .select('type')
        .count('* as count')
        .where('is_active', true)
        .groupBy('type')
        .orderBy('count', 'desc');

      return types.map((type) => ({
        type: type.type,
        count: parseInt(type.count.toString()),
      }));
    } catch (error) {
      console.error('Error getting types:', error);
      throw new Error(`Failed to get types: ${error.message}`);
    }
  }

  /**
   * Get template starters
   */
  async getTemplateStarters(): Promise<PdfTemplate[]> {
    try {
      const starters = await this.knex(this.tableName)
        .where('is_template_starter', true)
        .where('is_active', true)
        .orderBy('display_name', 'asc');

      return starters.map(this.transformToEntity.bind(this));
    } catch (error) {
      console.error('Error getting template starters:', error);
      throw new Error(`Failed to get template starters: ${error.message}`);
    }
  }

  /**
   * Get active templates for actual use (excludes template starters)
   */
  async getActiveTemplatesForUse(): Promise<PdfTemplate[]> {
    try {
      const templates = await this.knex(this.tableName)
        .where('is_active', true)
        .where(function () {
          this.where('is_template_starter', false).orWhereNull(
            'is_template_starter',
          );
        })
        .orderBy('display_name', 'asc');

      return templates.map(this.transformToEntity.bind(this));
    } catch (error) {
      console.error('Error getting active templates for use:', error);
      throw new Error(
        `Failed to get active templates for use: ${error.message}`,
      );
    }
  }

  /**
   * Increment usage count
   */
  async incrementUsageCount(templateId: string): Promise<void> {
    try {
      await this.knex(this.tableName)
        .where('id', templateId)
        .increment('usage_count', 1);
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      throw new Error(`Failed to increment usage count: ${error.message}`);
    }
  }

  /**
   * Create template version
   */
  async createVersion(
    templateId: string,
    version: string,
    data: Partial<PdfTemplateVersion>,
    userId?: string,
  ): Promise<PdfTemplateVersion> {
    try {
      const versionData = {
        template_id: templateId,
        version,
        changelog: data.changelog,
        template_data: data.template_data,
        sample_data: data.sample_data,
        schema: data.schema,
        styles: data.styles,
        fonts: data.fonts,
        asset_file_ids: data.asset_file_ids
          ? JSON.stringify(data.asset_file_ids)
          : undefined,
        created_by: userId,
        created_at: new Date(),
      };

      const [createdVersion] = await this.knex('pdf_template_versions')
        .insert(versionData)
        .returning('*');

      return createdVersion;
    } catch (error) {
      console.error('Error creating template version:', error);
      throw new Error(`Failed to create template version: ${error.message}`);
    }
  }

  /**
   * Get template versions
   */
  async getVersions(templateId: string): Promise<PdfTemplateVersion[]> {
    try {
      const versions = await this.knex('pdf_template_versions')
        .where('template_id', templateId)
        .orderBy('created_at', 'desc');

      return versions;
    } catch (error) {
      console.error('Error getting template versions:', error);
      throw new Error(`Failed to get template versions: ${error.message}`);
    }
  }

  /**
   * Get specific template version
   */
  async getVersion(
    templateId: string,
    version: string,
  ): Promise<PdfTemplateVersion | null> {
    try {
      const versionData = await this.knex('pdf_template_versions')
        .where('template_id', templateId)
        .where('version', version)
        .first();

      return versionData || null;
    } catch (error) {
      console.error('Error getting template version:', error);
      throw new Error(`Failed to get template version: ${error.message}`);
    }
  }

  /**
   * Create render record
   */
  async createRender(
    renderData: Omit<PdfRender, 'id' | 'rendered_at'>,
  ): Promise<PdfRender> {
    try {
      const data = {
        ...renderData,
        rendered_at: new Date(),
      };

      const [render] = await this.knex('pdf_renders')
        .insert(data)
        .returning('*');

      return render;
    } catch (error) {
      console.error('Error creating render record:', error);
      throw new Error(`Failed to create render record: ${error.message}`);
    }
  }

  /**
   * Update render record
   */
  async updateRender(
    renderId: string,
    updates: Partial<PdfRender>,
  ): Promise<PdfRender> {
    try {
      const [updatedRender] = await this.knex('pdf_renders')
        .where('id', renderId)
        .update(updates)
        .returning('*');

      if (!updatedRender) {
        throw new Error('Render record not found');
      }

      return updatedRender;
    } catch (error) {
      console.error('Error updating render record:', error);
      throw new Error(`Failed to update render record: ${error.message}`);
    }
  }

  /**
   * Get render by ID
   */
  async getRender(renderId: string): Promise<PdfRender | null> {
    try {
      const render = await this.knex('pdf_renders')
        .where('id', renderId)
        .first();

      return render || null;
    } catch (error) {
      console.error('Error getting render:', error);
      throw new Error(`Failed to get render: ${error.message}`);
    }
  }

  /**
   * Get template statistics
   */
  async getStats(): Promise<PdfTemplateStats> {
    try {
      // Get basic counts
      const templatesResult = await this.knex(this.tableName)
        .count('* as total')
        .count(this.knex.raw('CASE WHEN is_active = true THEN 1 END as active'))
        .first();

      const rendersResult = await this.knex('pdf_renders')
        .count('* as total')
        .first();

      // Get popular templates
      const popularTemplates = await this.knex(this.tableName)
        .select('id', 'name', 'usage_count')
        .where('is_active', true)
        .orderBy('usage_count', 'desc')
        .limit(10);

      // Get renders by category
      const rendersByCategory = await this.knex('pdf_renders as r')
        .join('pdf_templates as t', 'r.template_id', 't.id')
        .select('t.category')
        .count('* as count')
        .groupBy('t.category')
        .orderBy('count', 'desc');

      // Get recent activity
      const recentActivity = await this.knex('pdf_renders as r')
        .join('pdf_templates as t', 'r.template_id', 't.id')
        .select('t.name as template_name', 'r.rendered_at', 'r.rendered_by')
        .where('r.status', 'completed')
        .orderBy('r.rendered_at', 'desc')
        .limit(20);

      return {
        totalTemplates: parseInt(templatesResult.total.toString()),
        activeTemplates: parseInt(templatesResult.active?.toString() || '0'),
        totalRenders: parseInt(rendersResult.total.toString()),
        popularTemplates: popularTemplates.map((t) => ({
          id: t.id,
          name: t.name,
          usage_count: t.usage_count,
        })),
        rendersByCategory: rendersByCategory.reduce((acc, item) => {
          acc[item.category] = parseInt(item.count.toString());
          return acc;
        }, {}),
        recentActivity: recentActivity.map((activity) => ({
          template_name: activity.template_name,
          rendered_at: activity.rendered_at,
          rendered_by: activity.rendered_by,
        })),
      };
    } catch (error) {
      console.error('Error getting template stats:', error);
      throw new Error(`Failed to get template stats: ${error.message}`);
    }
  }

  /**
   * Clean up expired renders
   */
  async cleanupExpiredRenders(): Promise<number> {
    try {
      const deletedCount = await this.knex('pdf_renders')
        .where('expires_at', '<', new Date())
        .whereNotNull('expires_at')
        .del();

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired renders:', error);
      throw new Error(`Failed to cleanup expired renders: ${error.message}`);
    }
  }

  /**
   * Search templates by content
   */
  async searchTemplateContent(searchTerm: string): Promise<PdfTemplate[]> {
    try {
      // Search in template_data JSON field
      const templates = await this.knex(this.tableName)
        .where('is_active', true)
        .where((builder) => {
          builder
            .whereILike('name', `%${searchTerm}%`)
            .orWhereILike('display_name', `%${searchTerm}%`)
            .orWhereILike('description', `%${searchTerm}%`)
            .orWhereRaw('CAST(template_data AS TEXT) ILIKE ?', [
              `%${searchTerm}%`,
            ]);
        })
        .orderBy('usage_count', 'desc');

      return templates;
    } catch (error) {
      console.error('Error searching template content:', error);
      throw new Error(`Failed to search template content: ${error.message}`);
    }
  }

  /**
   * Get default template by category/type
   */
  async getDefaultTemplate(
    category?: string,
    type?: string,
  ): Promise<PdfTemplate | null> {
    try {
      let query = this.knex(this.tableName)
        .where('is_active', true)
        .where('is_default', true);

      if (category) {
        query = query.where('category', category);
      }

      if (type) {
        query = query.where('type', type);
      }

      const template = await query.first();
      return template || null;
    } catch (error) {
      console.error('Error getting default template:', error);
      throw new Error(`Failed to get default template: ${error.message}`);
    }
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(
    templateId: string,
    newName: string,
    userId?: string,
  ): Promise<PdfTemplate> {
    try {
      const originalTemplate = await this.findById(templateId);
      if (!originalTemplate) {
        throw new Error('Template not found');
      }

      const duplicateData: CreatePdfTemplate = {
        name: newName,
        display_name: `${originalTemplate.display_name} (Copy)`,
        description: originalTemplate.description,
        category: originalTemplate.category,
        type: originalTemplate.type,
        template_data: originalTemplate.template_data,
        sample_data: originalTemplate.sample_data,
        schema: originalTemplate.schema,
        page_size: originalTemplate.page_size,
        orientation: originalTemplate.orientation,
        styles: originalTemplate.styles,
        fonts: originalTemplate.fonts,
        version: '1.0.0',
        is_active: true,
        is_default: false,
        assets: originalTemplate.assets,
        permissions: originalTemplate.permissions,
      };

      return await this.create(duplicateData, userId);
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw new Error(`Failed to duplicate template: ${error.message}`);
    }
  }
}
