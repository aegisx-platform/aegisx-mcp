// Re-exports for frontend consumers
export * from './types/books.types';
export { BookService } from './services/books.service';

// Re-export commonly used types for external use
export type {
  Book,
  CreateBookRequest,
  UpdateBookRequest,
  ListBookQuery,
} from './types/books.types';

// Module name constant
export const MODULE_NAME = 'books' as const;
