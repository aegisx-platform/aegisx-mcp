import { Type, Static } from '@sinclair/typebox';
import { ApiSuccessResponseSchema } from '../../../schemas/base.schemas';

// TMT Level Enum
export const TmtLevelEnum = Type.Union([
  Type.Literal('VTM'),
  Type.Literal('GP'),
  Type.Literal('GPU'),
  Type.Literal('TP'),
  Type.Literal('TPU'),
  Type.Literal('GPP'),
  Type.Literal('TPP'),
  Type.Literal('SUBS'),
  Type.Literal('GP_F'),
  Type.Literal('GP_X'),
]);

// TMT Concept Schema
export const TmtConceptSchema = Type.Object({
  id: Type.Number(),
  tmt_id: Type.Number(),
  concept_code: Type.String(),
  level: TmtLevelEnum,
  fsn: Type.Union([Type.String(), Type.Null()]),
  preferred_term: Type.Union([Type.String(), Type.Null()]),
  strength: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  dosage_form: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  manufacturer: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  pack_size: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  unit_of_use: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  route_of_administration: Type.Optional(
    Type.Union([Type.String(), Type.Null()]),
  ),
  effective_date: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  release_date: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  is_active: Type.Boolean(),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// TMT Concept with children (for hierarchy)
export const TmtConceptWithChildrenSchema = Type.Object({
  id: Type.Number(),
  tmt_id: Type.Number(),
  concept_code: Type.String(),
  level: TmtLevelEnum,
  fsn: Type.Union([Type.String(), Type.Null()]),
  preferred_term: Type.Union([Type.String(), Type.Null()]),
  strength: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  dosage_form: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  manufacturer: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  pack_size: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  unit_of_use: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  route_of_administration: Type.Optional(
    Type.Union([Type.String(), Type.Null()]),
  ),
  is_active: Type.Boolean(),
  children: Type.Optional(Type.Array(Type.Any())), // Recursive reference
});

// TypeScript interface for TmtConceptWithChildren (for repository use)
export interface TmtConceptWithChildrenType {
  id: number;
  tmt_id: number;
  concept_code: string;
  level: string;
  fsn: string | null;
  preferred_term: string | null;
  strength?: string | null;
  dosage_form?: string | null;
  manufacturer?: string | null;
  pack_size?: string | null;
  unit_of_use?: string | null;
  route_of_administration?: string | null;
  is_active: boolean;
  children?: TmtConceptWithChildrenType[];
}

// TMT Hierarchy Response
export const TmtHierarchySchema = Type.Object({
  concept: TmtConceptSchema,
  ancestors: Type.Array(TmtConceptSchema),
  descendants: Type.Array(TmtConceptWithChildrenSchema),
});

// Related Drug Schema
export const RelatedDrugSchema = Type.Object({
  id: Type.Number(),
  code: Type.String(),
  name: Type.String(),
  source: Type.Union([Type.Literal('drug_generics'), Type.Literal('drugs')]),
  mapping_field: Type.String(),
});

// TMT Stats Schema
export const TmtStatsSchema = Type.Object({
  total_concepts: Type.Number(),
  by_level: Type.Record(Type.String(), Type.Number()),
  mappings: Type.Object({
    drug_generics: Type.Object({
      total: Type.Number(),
      mapped: Type.Number(),
      coverage: Type.Number(),
    }),
    drugs: Type.Object({
      total: Type.Number(),
      mapped: Type.Number(),
      coverage: Type.Number(),
    }),
  }),
});

// === Query Schemas ===

// Search Query
export const TmtSearchQuerySchema = Type.Object({
  q: Type.String({ minLength: 1, maxLength: 100 }),
  level: Type.Optional(Type.String()), // Comma-separated levels
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
  includeInactive: Type.Optional(Type.Boolean({ default: false })),
});

// Hierarchy Query
export const TmtHierarchyQuerySchema = Type.Object({
  maxDepth: Type.Optional(Type.Number({ minimum: 1, maximum: 10, default: 5 })),
  includeInactive: Type.Optional(Type.Boolean({ default: false })),
});

// === Param Schemas ===

export const TmtIdParamSchema = Type.Object({
  id: Type.Number({ minimum: 1 }),
});

export const TmtCodeParamSchema = Type.Object({
  code: Type.String({ minLength: 1, maxLength: 20 }),
});

// === Response Schemas ===

export const TmtConceptResponseSchema =
  ApiSuccessResponseSchema(TmtConceptSchema);

export const TmtConceptListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(TmtConceptSchema),
  meta: Type.Optional(
    Type.Object({
      total: Type.Optional(Type.Number()),
      returned: Type.Optional(Type.Number()),
      query: Type.Optional(Type.String()),
      level: Type.Optional(Type.String()),
    }),
  ),
});

export const TmtHierarchyResponseSchema =
  ApiSuccessResponseSchema(TmtHierarchySchema);

export const RelatedDrugsResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(RelatedDrugSchema),
  meta: Type.Optional(
    Type.Object({
      total: Type.Number(),
    }),
  ),
});

export const TmtStatsResponseSchema = ApiSuccessResponseSchema(TmtStatsSchema);

// === Type Exports ===

export type TmtLevel = Static<typeof TmtLevelEnum>;
export type TmtConcept = Static<typeof TmtConceptSchema>;
export type TmtConceptWithChildren = Static<
  typeof TmtConceptWithChildrenSchema
>;
export type RelatedDrug = Static<typeof RelatedDrugSchema>;
export type TmtStats = Static<typeof TmtStatsSchema>;
export type TmtSearchQuery = Static<typeof TmtSearchQuerySchema>;
export type TmtHierarchyQuery = Static<typeof TmtHierarchyQuerySchema>;

// TypeScript interface for TmtHierarchy (for repository use)
export interface TmtHierarchy {
  concept: TmtConcept;
  ancestors: TmtConcept[];
  descendants: TmtConceptWithChildrenType[];
}
