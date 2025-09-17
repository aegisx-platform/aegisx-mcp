import { Knex } from 'knex';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export async function buildPaginationQuery<T>(
  baseQuery: Knex.QueryBuilder,
  query: PaginationQuery,
  defaultSort = 'created_at',
  defaultOrder: 'asc' | 'desc' = 'desc',
): Promise<PaginatedResult<T>> {
  // Parse pagination parameters
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(1000, Math.max(1, query.limit || 10));
  const sort = query.sort || defaultSort;
  const order = query.order || defaultOrder;

  // Clone the base query for counting
  const countQuery = baseQuery
    .clone()
    .clearSelect()
    .clearOrder()
    .count('* as count')
    .first();

  // Apply sorting and pagination to main query
  const itemsQuery = baseQuery
    .orderBy(sort, order)
    .limit(limit)
    .offset((page - 1) * limit);

  // Execute both queries
  const [countResult, items] = await Promise.all([countQuery, itemsQuery]);

  const total = parseInt((countResult?.count as string) || '0', 10);
  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return {
    items,
    pagination,
  };
}

export function calculateOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * Math.max(1, limit);
}

export function validatePaginationParams(
  page?: number,
  limit?: number,
): { page: number; limit: number } {
  return {
    page: Math.max(1, page || 1),
    limit: Math.min(1000, Math.max(1, limit || 10)),
  };
}
