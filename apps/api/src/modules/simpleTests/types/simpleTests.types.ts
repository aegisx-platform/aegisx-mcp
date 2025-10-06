// Import and re-export types from schemas for convenience
import {
  type SimpleTests,
  type CreateSimpleTests,
  type UpdateSimpleTests,
  type SimpleTestsIdParam,
  type GetSimpleTestsQuery,
  type ListSimpleTestsQuery,
} from '../schemas/simpleTests.schemas';

export {
  type SimpleTests,
  type CreateSimpleTests,
  type UpdateSimpleTests,
  type SimpleTestsIdParam,
  type GetSimpleTestsQuery,
  type ListSimpleTestsQuery,
};

// Additional type definitions
export interface SimpleTestsRepository {
  create(data: CreateSimpleTests): Promise<SimpleTests>;
  findById(id: number | string): Promise<SimpleTests | null>;
  findMany(query: ListSimpleTestsQuery): Promise<{
    data: SimpleTests[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateSimpleTests,
  ): Promise<SimpleTests | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface SimpleTestsEntity {
  id: string;
  is_active: boolean | null;
  small_number: number | null;
  regular_number: number | null;
  big_number: number | null;
  decimal_field: number | null;
  float_field: number | null;
  name: string | null;
  description: string | null;
  date_field: Date | null;
  datetime_field: Date | null;
  json_field: Record<string, any> | null;
  uuid_field: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}
