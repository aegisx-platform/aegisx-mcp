// Import and re-export types from schemas for convenience
import {
  type Simpletest,
  type CreateSimpletest,
  type UpdateSimpletest,
  type SimpletestIdParam,
  type GetSimpletestQuery,
  type ListSimpletestQuery,
} from '../schemas/simpletest.schemas';

export {
  type Simpletest,
  type CreateSimpletest,
  type UpdateSimpletest,
  type SimpletestIdParam,
  type GetSimpletestQuery,
  type ListSimpletestQuery,
};

// Additional type definitions
export interface SimpletestRepository {
  create(data: CreateSimpletest): Promise<Simpletest>;
  findById(id: number | string): Promise<Simpletest | null>;
  findMany(query: ListSimpletestQuery): Promise<{
    data: Simpletest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateSimpletest,
  ): Promise<Simpletest | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface SimpletestEntity {
  id: string;
  name: string | null;
  status: boolean | null;
  created_at: Date | null;
}
