// Import and re-export types from schemas for convenience
import {
  type Articles,
  type CreateArticles,
  type UpdateArticles,
  type ArticlesIdParam,
  type GetArticlesQuery,
  type ListArticlesQuery,
} from '../schemas/articles.schemas';

export {
  type Articles,
  type CreateArticles,
  type UpdateArticles,
  type ArticlesIdParam,
  type GetArticlesQuery,
  type ListArticlesQuery,
};

// Additional type definitions
export interface ArticlesRepository {
  create(data: CreateArticles): Promise<Articles>;
  findById(id: number | string): Promise<Articles | null>;
  findMany(query: ListArticlesQuery): Promise<{
    data: Articles[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateArticles): Promise<Articles | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface ArticlesEntity {
  id: string;
  title: string;
  content: string | null;
  author_id: string;
  published: boolean | null;
  published_at: Date | null;
  view_count: number | null;
  created_at: Date;
  updated_at: Date;
}
