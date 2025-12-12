import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TmtService } from './tmt.service';
import {
  TmtSearchQuerySchema,
  TmtSearchQuery,
  TmtIdParamSchema,
  TmtCodeParamSchema,
  TmtTmtIdParamSchema,
  TmtHierarchyQuerySchema,
  TmtHierarchyQuery,
  TmtConceptResponseSchema,
  TmtConceptListResponseSchema,
  TmtHierarchyResponseSchema,
  RelatedDrugsResponseSchema,
  TmtStatsResponseSchema,
} from './tmt.schemas';

export async function tmtController(fastify: FastifyInstance) {
  const service = new TmtService(fastify.knex);

  // Search TMT concepts
  fastify.get<{
    Querystring: TmtSearchQuery;
  }>(
    '/concepts/search',
    {
      schema: {
        tags: ['TMT'],
        summary: 'Search TMT concepts',
        description: 'Search TMT concepts by code or name (Thai/English)',
        querystring: TmtSearchQuerySchema,
        response: {
          200: TmtConceptListResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { q, level, limit, includeInactive } = request.query;

      const result = await service.search(q, {
        level,
        limit,
        includeInactive,
      });

      return {
        success: true,
        data: result.data,
        meta: result.meta,
      };
    },
  );

  // Get concept by ID
  fastify.get<{
    Params: { id: number };
  }>(
    '/concepts/:id',
    {
      schema: {
        tags: ['TMT'],
        summary: 'Get TMT concept by ID',
        params: TmtIdParamSchema,
        response: {
          200: TmtConceptResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const concept = await service.getById(id);

      if (!concept) {
        return reply.notFound('TMT concept not found');
      }

      return {
        success: true,
        data: concept,
      };
    },
  );

  // Get concept by code
  fastify.get<{
    Params: { code: string };
  }>(
    '/concepts/code/:code',
    {
      schema: {
        tags: ['TMT'],
        summary: 'Get TMT concept by code',
        params: TmtCodeParamSchema,
        response: {
          200: TmtConceptResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { code } = request.params;
      const concept = await service.getByCode(code);

      if (!concept) {
        return reply.notFound('TMT concept not found');
      }

      return {
        success: true,
        data: concept,
      };
    },
  );

  // Get concept by TMT ID
  fastify.get<{
    Params: { tmtId: number };
  }>(
    '/concepts/tmt-id/:tmtId',
    {
      schema: {
        tags: ['TMT'],
        summary: 'Get TMT concept by TMT ID',
        params: TmtTmtIdParamSchema,
        response: {
          200: TmtConceptResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tmtId } = request.params;
      const concept = await service.getByTmtId(tmtId);

      if (!concept) {
        return reply.notFound('TMT concept not found');
      }

      return {
        success: true,
        data: concept,
      };
    },
  );

  // Get hierarchy for concept
  fastify.get<{
    Params: { id: number };
    Querystring: TmtHierarchyQuery;
  }>(
    '/concepts/:id/hierarchy',
    {
      schema: {
        tags: ['TMT'],
        summary: 'Get TMT concept hierarchy',
        description: 'Get ancestors and descendants for a TMT concept',
        params: TmtIdParamSchema,
        querystring: TmtHierarchyQuerySchema,
        response: {
          200: TmtHierarchyResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { maxDepth, includeInactive } = request.query;

      const hierarchy = await service.getHierarchy(id, {
        maxDepth,
        includeInactive,
      });

      if (!hierarchy) {
        return reply.notFound('TMT concept not found');
      }

      return {
        success: true,
        data: hierarchy,
      };
    },
  );

  // Get related drugs
  fastify.get<{
    Params: { id: number };
  }>(
    '/concepts/:id/related-drugs',
    {
      schema: {
        tags: ['TMT'],
        summary: 'Get related drugs in system',
        description: 'Get drugs mapped to this TMT concept',
        params: TmtIdParamSchema,
        response: {
          200: RelatedDrugsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const drugs = await service.getRelatedDrugs(id);

      return {
        success: true,
        data: drugs,
        meta: {
          total: drugs.length,
        },
      };
    },
  );

  // Get TMT statistics
  fastify.get(
    '/stats',
    {
      schema: {
        tags: ['TMT'],
        summary: 'Get TMT statistics',
        description: 'Get TMT coverage and mapping statistics',
        response: {
          200: TmtStatsResponseSchema,
        },
      },
    },
    async () => {
      const stats = await service.getStats();

      return {
        success: true,
        data: stats,
      };
    },
  );
}
