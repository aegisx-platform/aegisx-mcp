import { Knex } from 'knex';
import { TmtRepository } from './tmt.repository';
import {
  TmtConcept,
  TmtHierarchy,
  RelatedDrug,
  TmtStats,
  TmtLevel,
} from './tmt.schemas';

export class TmtService {
  private repository: TmtRepository;

  constructor(knex: Knex) {
    this.repository = new TmtRepository(knex);
  }

  /**
   * Search TMT concepts
   */
  async search(
    query: string,
    options: {
      level?: string; // Comma-separated levels
      limit?: number;
      includeInactive?: boolean;
    } = {},
  ): Promise<{
    data: TmtConcept[];
    meta: { total: number; query: string; level?: string };
  }> {
    const levels = options.level
      ? (options.level.split(',').map((l) => l.trim()) as TmtLevel[])
      : undefined;

    const data = await this.repository.search(query, {
      levels,
      limit: options.limit,
      includeInactive: options.includeInactive,
    });

    return {
      data,
      meta: {
        total: data.length,
        query,
        level: options.level,
      },
    };
  }

  /**
   * Get concept by ID
   */
  async getById(id: number): Promise<TmtConcept | null> {
    return this.repository.getById(id);
  }

  /**
   * Get concept by code
   */
  async getByCode(code: string): Promise<TmtConcept | null> {
    return this.repository.getByCode(code);
  }

  /**
   * Get concept by TMT ID
   */
  async getByTmtId(tmtId: number): Promise<TmtConcept | null> {
    return this.repository.getByTmtId(tmtId);
  }

  /**
   * Get hierarchy for concept
   */
  async getHierarchy(
    id: number,
    options?: {
      maxDepth?: number;
      includeInactive?: boolean;
    },
  ): Promise<TmtHierarchy | null> {
    return this.repository.getHierarchy(id, options);
  }

  /**
   * Get related drugs in system
   */
  async getRelatedDrugs(tmtId: number): Promise<RelatedDrug[]> {
    return this.repository.getRelatedDrugs(tmtId);
  }

  /**
   * Get TMT statistics
   */
  async getStats(): Promise<TmtStats> {
    return this.repository.getStats();
  }
}
