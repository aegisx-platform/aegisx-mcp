// Import and re-export types from schemas for convenience
import {
  type ComprehensiveTests,
  type CreateComprehensiveTests,
  type UpdateComprehensiveTests,
  type ComprehensiveTestsIdParam,
  type GetComprehensiveTestsQuery,
  type ListComprehensiveTestsQuery,
} from '../schemas/comprehensive-tests.schemas';

export {
  type ComprehensiveTests,
  type CreateComprehensiveTests,
  type UpdateComprehensiveTests,
  type ComprehensiveTestsIdParam,
  type GetComprehensiveTestsQuery,
  type ListComprehensiveTestsQuery,
};

// Additional type definitions
export interface ComprehensiveTestsRepository {
  create(data: CreateComprehensiveTests): Promise<ComprehensiveTests>;
  findById(id: number | string): Promise<ComprehensiveTests | null>;
  findMany(query: ListComprehensiveTestsQuery): Promise<{
    data: ComprehensiveTests[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateComprehensiveTests,
  ): Promise<ComprehensiveTests | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface ComprehensiveTestsEntity {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  short_code: string | null;
  price: number | null;
  quantity: number | null;
  weight: number | null;
  rating: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  is_available: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
  published_at: Date | null;
  expires_at: Date | null;
  start_time: string | null;
  metadata: Record<string, any> | null;
  tags: string[] | null;
  ip_address: any | null;
  website_url: string | null;
  email_address: string | null;
  status: string | null;
  priority: string | null;
  content: string | null;
  notes: string | null;
}
