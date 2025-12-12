import { Knex } from 'knex';
import {
  TmtConcept,
  TmtConceptWithChildrenType,
  TmtHierarchy,
  RelatedDrug,
  TmtStats,
  TmtLevel,
} from './tmt.schemas';

export class TmtRepository {
  constructor(private knex: Knex) {}

  /**
   * Search TMT concepts by code or name
   */
  async search(
    query: string,
    options: {
      levels?: TmtLevel[];
      limit?: number;
      includeInactive?: boolean;
    } = {},
  ): Promise<TmtConcept[]> {
    const { levels, limit = 20, includeInactive = false } = options;
    const searchTerm = `%${query}%`;

    let qb = this.knex('inventory.tmt_concepts')
      .select(
        'id',
        'tmt_id',
        'concept_code',
        'level',
        'fsn',
        'preferred_term',
        'strength',
        'dosage_form',
        'manufacturer',
        'pack_size',
        'unit_of_use',
        'route_of_administration',
        'effective_date',
        'release_date',
        'is_active',
      )
      .where(function () {
        this.where('concept_code', 'ILIKE', searchTerm)
          .orWhere('fsn', 'ILIKE', searchTerm)
          .orWhere('preferred_term', 'ILIKE', searchTerm);
      });

    if (levels && levels.length > 0) {
      qb = qb.whereIn('level', levels);
    }

    if (!includeInactive) {
      qb = qb.where('is_active', true);
    }

    // Order by exact match first, then alphabetically
    qb = qb
      .orderByRaw('CASE WHEN concept_code = ? THEN 0 ELSE 1 END', [query])
      .orderBy('concept_code')
      .limit(limit);

    return qb;
  }

  /**
   * Get TMT concept by ID
   */
  async getById(id: number): Promise<TmtConcept | null> {
    const result = await this.knex('inventory.tmt_concepts')
      .select(
        'id',
        'tmt_id',
        'concept_code',
        'level',
        'fsn',
        'preferred_term',
        'strength',
        'dosage_form',
        'manufacturer',
        'pack_size',
        'unit_of_use',
        'route_of_administration',
        'effective_date',
        'release_date',
        'is_active',
        'created_at',
        'updated_at',
      )
      .where('id', id)
      .first();

    return result || null;
  }

  /**
   * Get TMT concept by code
   */
  async getByCode(code: string): Promise<TmtConcept | null> {
    const result = await this.knex('inventory.tmt_concepts')
      .select(
        'id',
        'tmt_id',
        'concept_code',
        'level',
        'fsn',
        'preferred_term',
        'strength',
        'dosage_form',
        'manufacturer',
        'pack_size',
        'unit_of_use',
        'route_of_administration',
        'effective_date',
        'release_date',
        'is_active',
        'created_at',
        'updated_at',
      )
      .where('concept_code', code)
      .first();

    return result || null;
  }

  /**
   * Get TMT concept by TMT ID
   */
  async getByTmtId(tmtId: number): Promise<TmtConcept | null> {
    const result = await this.knex('inventory.tmt_concepts')
      .select(
        'id',
        'tmt_id',
        'concept_code',
        'level',
        'fsn',
        'preferred_term',
        'strength',
        'dosage_form',
        'manufacturer',
        'pack_size',
        'unit_of_use',
        'route_of_administration',
        'effective_date',
        'release_date',
        'is_active',
        'created_at',
        'updated_at',
      )
      .where('tmt_id', tmtId)
      .first();

    return result || null;
  }

  /**
   * Get hierarchy for a TMT concept (ancestors + descendants)
   */
  async getHierarchy(
    id: number,
    options: {
      maxDepth?: number;
      includeInactive?: boolean;
    } = {},
  ): Promise<TmtHierarchy | null> {
    const { maxDepth = 5, includeInactive = false } = options;

    // Get the concept itself
    const concept = await this.getById(id);
    if (!concept) return null;

    // Get ancestors (parents going up)
    const ancestors = await this.getAncestors(id, includeInactive);

    // Get descendants (children going down)
    const descendants = await this.getDescendants(
      id,
      maxDepth,
      includeInactive,
    );

    return {
      concept,
      ancestors,
      descendants,
    };
  }

  /**
   * Get ancestors (parent chain) for a concept
   */
  private async getAncestors(
    conceptId: number,
    includeInactive: boolean,
  ): Promise<TmtConcept[]> {
    const query = `
      WITH RECURSIVE ancestors AS (
        -- Base case: get immediate parent
        SELECT
          c.id, c.tmt_id, c.concept_code, c.level, c.fsn,
          c.preferred_term, c.strength, c.dosage_form, c.manufacturer,
          c.pack_size, c.unit_of_use, c.route_of_administration, c.is_active,
          1 as depth
        FROM inventory.tmt_concepts c
        JOIN inventory.tmt_relationships r ON r.parent_id = c.id
        WHERE r.child_id = ?
          AND r.relationship_type = 'IS_A'
          ${!includeInactive ? 'AND c.is_active = true' : ''}

        UNION ALL

        -- Recursive: get parent of parent
        SELECT
          c.id, c.tmt_id, c.concept_code, c.level, c.fsn,
          c.preferred_term, c.strength, c.dosage_form, c.manufacturer,
          c.pack_size, c.unit_of_use, c.route_of_administration, c.is_active,
          a.depth + 1
        FROM inventory.tmt_concepts c
        JOIN inventory.tmt_relationships r ON r.parent_id = c.id
        JOIN ancestors a ON r.child_id = a.id
        WHERE r.relationship_type = 'IS_A'
          AND a.depth < 10
          ${!includeInactive ? 'AND c.is_active = true' : ''}
      )
      SELECT id, tmt_id, concept_code, level, fsn, preferred_term,
             strength, dosage_form, manufacturer, pack_size, unit_of_use,
             route_of_administration, is_active
      FROM ancestors
      ORDER BY depth DESC
    `;

    const result = await this.knex.raw(query, [conceptId]);
    return result.rows || [];
  }

  /**
   * Get descendants (children tree) for a concept
   */
  private async getDescendants(
    conceptId: number,
    maxDepth: number,
    includeInactive: boolean,
  ): Promise<TmtConceptWithChildrenType[]> {
    const query = `
      WITH RECURSIVE descendants AS (
        -- Base case: get immediate children
        SELECT
          c.id, c.tmt_id, c.concept_code, c.level, c.fsn,
          c.preferred_term, c.strength, c.dosage_form, c.manufacturer,
          c.pack_size, c.unit_of_use, c.route_of_administration, c.is_active,
          1 as depth,
          ?::bigint as parent_id
        FROM inventory.tmt_concepts c
        JOIN inventory.tmt_relationships r ON r.child_id = c.id
        WHERE r.parent_id = ?
          AND r.relationship_type = 'IS_A'
          ${!includeInactive ? 'AND c.is_active = true' : ''}

        UNION ALL

        -- Recursive: get children of children
        SELECT
          c.id, c.tmt_id, c.concept_code, c.level, c.fsn,
          c.preferred_term, c.strength, c.dosage_form, c.manufacturer,
          c.pack_size, c.unit_of_use, c.route_of_administration, c.is_active,
          d.depth + 1,
          d.id as parent_id
        FROM inventory.tmt_concepts c
        JOIN inventory.tmt_relationships r ON r.child_id = c.id
        JOIN descendants d ON r.parent_id = d.id
        WHERE r.relationship_type = 'IS_A'
          AND d.depth < ?
          ${!includeInactive ? 'AND c.is_active = true' : ''}
      )
      SELECT id, tmt_id, concept_code, level, fsn, preferred_term,
             strength, dosage_form, manufacturer, pack_size, unit_of_use,
             route_of_administration, is_active, depth, parent_id
      FROM descendants
      ORDER BY depth, concept_code
    `;

    const result = await this.knex.raw(query, [conceptId, conceptId, maxDepth]);
    const rows = result.rows || [];

    // Build tree structure
    return this.buildTree(rows, conceptId);
  }

  /**
   * Build tree structure from flat list
   */
  private buildTree(
    rows: Array<TmtConcept & { depth: number; parent_id: number }>,
    rootParentId: number,
  ): TmtConceptWithChildrenType[] {
    const map = new Map<number, TmtConceptWithChildrenType>();
    const roots: TmtConceptWithChildrenType[] = [];

    // First pass: create all nodes
    // Note: PostgreSQL bigint columns are returned as strings
    for (const row of rows) {
      const nodeId = Number(row.id);
      map.set(nodeId, {
        id: nodeId,
        tmt_id: Number(row.tmt_id),
        concept_code: row.concept_code,
        level: row.level,
        fsn: row.fsn,
        preferred_term: row.preferred_term,
        strength: row.strength,
        dosage_form: row.dosage_form,
        manufacturer: row.manufacturer,
        pack_size: row.pack_size,
        unit_of_use: row.unit_of_use,
        route_of_administration: row.route_of_administration,
        is_active: row.is_active,
        children: [],
      });
    }

    // Second pass: build tree
    for (const row of rows) {
      const nodeId = Number(row.id);
      const parentId = Number(row.parent_id);
      const node = map.get(nodeId)!;

      if (parentId === rootParentId) {
        roots.push(node);
      } else {
        const parent = map.get(parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    }

    return roots;
  }

  /**
   * Get related drugs in system mapped to this TMT concept
   */
  async getRelatedDrugs(tmtId: number): Promise<RelatedDrug[]> {
    const concept = await this.getById(tmtId);
    if (!concept) return [];

    const results: RelatedDrug[] = [];

    // Check drug_generics (GPU mapping)
    if (concept.level === 'GPU') {
      const generics = await this.knex('inventory.drug_generics')
        .select('id', 'working_code as code', 'generic_name as name')
        .where('tmt_gpu_id', tmtId)
        .orWhere('tmt_gpu_code', concept.concept_code);

      for (const g of generics) {
        results.push({
          id: g.id,
          code: g.code || '',
          name: g.name || '',
          source: 'drug_generics',
          mapping_field: 'tmt_gpu_id',
        });
      }
    }

    // Check drugs (TPU mapping)
    if (concept.level === 'TPU') {
      const drugs = await this.knex('inventory.drugs')
        .select('id', 'drug_code as code', 'trade_name as name')
        .where('tmt_tpu_id', tmtId);

      for (const d of drugs) {
        results.push({
          id: d.id,
          code: d.code || '',
          name: d.name || '',
          source: 'drugs',
          mapping_field: 'tmt_tpu_id',
        });
      }
    }

    return results;
  }

  /**
   * Get TMT statistics
   */
  async getStats(): Promise<TmtStats> {
    // Total concepts
    const totalResult = await this.knex('inventory.tmt_concepts')
      .count('* as count')
      .first();
    const totalConcepts = parseInt(totalResult?.count as string, 10) || 0;

    // By level
    const byLevelResult = await this.knex('inventory.tmt_concepts')
      .select('level')
      .count('* as count')
      .groupBy('level');

    const byLevel: Record<string, number> = {};
    for (const row of byLevelResult) {
      byLevel[row.level] = parseInt(row.count as string, 10);
    }

    // Drug generics mapping
    const genericsTotal = await this.knex('inventory.drug_generics')
      .count('* as count')
      .first();
    const genericsMapped = await this.knex('inventory.drug_generics')
      .count('* as count')
      .whereNotNull('tmt_gpu_id')
      .first();

    const genericsCount = parseInt(genericsTotal?.count as string, 10) || 0;
    const genericsMappedCount =
      parseInt(genericsMapped?.count as string, 10) || 0;

    // Drugs mapping
    const drugsTotal = await this.knex('inventory.drugs')
      .count('* as count')
      .first();
    const drugsMapped = await this.knex('inventory.drugs')
      .count('* as count')
      .whereNotNull('tmt_tpu_id')
      .first();

    const drugsCount = parseInt(drugsTotal?.count as string, 10) || 0;
    const drugsMappedCount = parseInt(drugsMapped?.count as string, 10) || 0;

    return {
      total_concepts: totalConcepts,
      by_level: byLevel,
      mappings: {
        drug_generics: {
          total: genericsCount,
          mapped: genericsMappedCount,
          coverage:
            genericsCount > 0
              ? Math.round((genericsMappedCount / genericsCount) * 10000) / 100
              : 0,
        },
        drugs: {
          total: drugsCount,
          mapped: drugsMappedCount,
          coverage:
            drugsCount > 0
              ? Math.round((drugsMappedCount / drugsCount) * 10000) / 100
              : 0,
        },
      },
    };
  }
}
