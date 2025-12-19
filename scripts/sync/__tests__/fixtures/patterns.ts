/**
 * Development patterns for AegisX platform
 * Fixture file for testing pattern extraction
 */

export interface CodePattern {
  name: string;
  category: 'backend' | 'frontend' | 'database' | 'testing';
  description: string;
  code: string;
  language: string;
  notes: string[];
  relatedPatterns: string[];
}

export const patterns: CodePattern[] = [
  {
    name: 'TypeBox Schema Definition',
    category: 'backend',
    description:
      'Standard pattern for defining request/response validation schemas using TypeBox in Fastify',
    code: `import { Type } from '@sinclair/typebox';

export const CreateUserSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  name: Type.String({ minLength: 1 }),
  age: Type.Optional(Type.Integer({ minimum: 0, maximum: 120 })),
});

export type CreateUserRequest = typeof CreateUserSchema.static;`,
    language: 'typescript',
    notes: [
      'Always use Type.Object for root schema',
      'Mark optional fields with Type.Optional()',
      'Use format validators for common types',
      'Export both schema and type for type safety',
    ],
    relatedPatterns: ['Fastify Route Handler', 'Error Response Schema'],
  },
  {
    name: 'Angular Signal-based Component',
    category: 'frontend',
    description:
      'Modern Angular component using signals for reactive state management',
    code: `import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: '<button (click)="increment()">Count: {{ count() }}</button>'
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.update(v => v + 1);
  }
}`,
    language: 'typescript',
    notes: [
      'Use signal() for reactive state',
      'Use computed() for derived state',
      'Avoid subscribe() with signals',
      'Signals are standalone-compatible',
    ],
    relatedPatterns: ['RxJS Observable Pattern', 'Component State Management'],
  },
  {
    name: 'Repository Pattern',
    category: 'backend',
    description: 'Data access abstraction pattern using TypeORM repository',
    code: `import { Repository } from 'typeorm';

export class UserRepository {
  constructor(private repository: Repository<User>) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}`,
    language: 'typescript',
    notes: [
      'Wrap database operations in repository',
      'Return domain objects, not database entities',
      'Handle null cases explicitly',
      'Use dependency injection',
    ],
    relatedPatterns: ['Dependency Injection', 'Database Query Pattern'],
  },
  {
    name: 'Jest Test Suite',
    category: 'testing',
    description: 'Standard pattern for writing unit tests with Jest',
    code: `import { describe, it, expect, beforeEach } from '@jest/globals';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should create a user', async () => {
    const user = await service.createUser({ email: 'test@example.com' });
    expect(user.email).toBe('test@example.com');
  });

  it('should throw on duplicate email', async () => {
    await expect(service.createUser({ email: 'test@example.com' }))
      .rejects.toThrow('Email already exists');
  });
});`,
    language: 'typescript',
    notes: [
      'Group related tests with describe()',
      'Use beforeEach for setup',
      'Test both success and failure cases',
      'Use descriptive test names',
    ],
    relatedPatterns: ['Mocking Pattern', 'Integration Test Pattern'],
  },
  {
    name: 'Fastify preValidation Hook',
    category: 'backend',
    description:
      'Pattern for authentication and authorization in Fastify using preValidation hook',
    code: `import { FastifyRequest, FastifyReply } from 'fastify';

fastify.addHook('preValidation', async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return reply.unauthorized();
  }

  try {
    const decoded = await verifyToken(token);
    request.user = decoded;
  } catch (error) {
    return reply.forbidden();
  }
});`,
    language: 'typescript',
    notes: [
      'NEVER throw errors in preValidation (causes timeouts)',
      'Use reply.unauthorized() or reply.forbidden()',
      'Store user context in request object',
      'Validate tokens early in the pipeline',
    ],
    relatedPatterns: ['JWT Authentication', 'Authorization Pattern'],
  },
];
