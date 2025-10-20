// Import and re-export types from schemas for convenience
import {
  type Authors,
  type CreateAuthors,
  type UpdateAuthors,
  type AuthorsIdParam,
  type GetAuthorsQuery,
  type ListAuthorsQuery,
  type AuthorsCreatedEvent,
  type AuthorsUpdatedEvent,
  type AuthorsDeletedEvent,
} from '../schemas/authors.schemas';

export {
  type Authors,
  type CreateAuthors,
  type UpdateAuthors,
  type AuthorsIdParam,
  type GetAuthorsQuery,
  type ListAuthorsQuery,
  type AuthorsCreatedEvent,
  type AuthorsUpdatedEvent,
  type AuthorsDeletedEvent,
};

// Additional type definitions
export interface AuthorsRepository {
  create(data: CreateAuthors): Promise<Authors>;
  findById(id: number | string): Promise<Authors | null>;
  findMany(query: ListAuthorsQuery): Promise<{
    data: Authors[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateAuthors): Promise<Authors | null>;
  delete(id: number | string): Promise<boolean>;
}

// Real-time event type definitions
export interface AuthorsEventHandlers {
  onCreated?: (data: Authors) => void | Promise<void>;
  onUpdated?: (data: Authors) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface AuthorsWebSocketSubscription {
  subscribe(handlers: AuthorsEventHandlers): void;
  unsubscribe(): void;
}

// Database entity type (matches database table structure exactly)
export interface AuthorsEntity {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  birth_date: Date | null;
  country: string | null;
  active: boolean | null;
  created_at: Date;
  updated_at: Date;
}
