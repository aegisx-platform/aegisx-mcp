# Fastify Plugin Development Standards

**Last Updated**: 2025-09-04  
**Purpose**: Ensure consistency and prevent integration issues in Fastify plugin development

## 🎯 Core Principles

1. **Consistent Naming**: Plugin name must match across file, export, and dependencies
2. **Clear Dependencies**: Explicitly declare all plugin dependencies
3. **Type Safety**: Always provide TypeScript declarations
4. **Error Handling**: Graceful degradation with proper error messages
5. **Documentation**: Clear purpose and usage examples

## 📋 Plugin Structure Template

### Basic Plugin Structure

```typescript
// filename: my-feature.plugin.ts
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

// Define plugin options interface
interface MyFeatureOptions {
  enabled?: boolean;
  config?: {
    // Add configuration options
  };
}

// Plugin implementation
async function myFeaturePlugin(fastify: FastifyInstance, options: MyFeatureOptions) {
  // Plugin initialization
  const { enabled = true, config = {} } = options;

  if (!enabled) {
    fastify.log.warn('My Feature plugin is disabled');
    return;
  }

  // Add decorators
  fastify.decorate('myFeature', {
    // Plugin functionality
  });

  // Add hooks if needed
  fastify.addHook('onRequest', async (request, reply) => {
    // Hook logic
  });

  // Log successful initialization
  fastify.log.info('My Feature plugin initialized', {
    enabled,
    config,
  });
}

// Export with fastify-plugin wrapper
export default fp(myFeaturePlugin, {
  name: 'my-feature-plugin', // MUST match dependency references
  dependencies: ['logging-plugin'], // List all required plugins
  fastify: '>=4.x', // Specify Fastify version
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    myFeature: {
      // Add type definitions
    };
  }
}
```

## 🔧 Naming Conventions

### 1. File Naming

```
✅ Good: knex.plugin.ts
✅ Good: redis-cache.plugin.ts
❌ Bad: knexPlugin.ts
❌ Bad: redis_cache_plugin.ts
```

### 2. Plugin Name Registration

```typescript
// The name in fp() MUST be consistent
export default fp(knexPlugin, {
  name: 'knex-plugin', // This name is used for dependencies
  // ...
});
```

### 3. Dependency References

```typescript
export default fp(healthCheckPlugin, {
  name: 'health-check-plugin',
  dependencies: ['knex-plugin', 'redis-plugin'], // Must match exact names
});
```

## 📝 Complete Plugin Example

### Database Plugin (knex.plugin.ts)

```typescript
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import knex, { Knex } from 'knex';

interface KnexPluginOptions extends FastifyPluginOptions {
  connectionString?: string;
  poolMin?: number;
  poolMax?: number;
  migrations?: {
    directory: string;
    tableName: string;
  };
}

async function knexPlugin(fastify: FastifyInstance, options: KnexPluginOptions) {
  // Configuration with defaults
  const config = {
    client: 'postgresql',
    connection: options.connectionString || {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'aegisx_db',
    },
    pool: {
      min: options.poolMin || 2,
      max: options.poolMax || 10,
    },
    migrations: options.migrations || {
      directory: './database/migrations',
      tableName: 'knex_migrations',
    },
  };

  // Initialize Knex
  const db = knex(config);

  // Test connection
  try {
    await db.raw('SELECT 1');
    fastify.log.info('Database connected successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Database connection failed');
    throw error;
  }

  // Decorate fastify instance
  fastify.decorate('knex', db);
  fastify.decorate('db', db); // Alias for convenience

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await db.destroy();
    fastify.log.info('Database connection closed');
  });
}

export default fp(knexPlugin, {
  name: 'knex-plugin',
  fastify: '>=4.x',
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    knex: Knex;
    db: Knex;
  }
}

export { KnexPluginOptions };
```

## 🔌 Plugin Dependencies

### Declaring Dependencies

```typescript
export default fp(myPlugin, {
  name: 'my-plugin',
  dependencies: [
    'logging-plugin', // Must be registered before this plugin
    'knex-plugin', // Database must be ready
    'schemas-plugin', // Schemas must be loaded
  ],
});
```

### Common Plugin Dependencies

| Plugin                | Common Dependencies                 | Purpose                  |
| --------------------- | ----------------------------------- | ------------------------ |
| `health-check-plugin` | `['logging-plugin', 'knex-plugin']` | Needs DB to check health |
| `auth-plugin`         | `['jwt-plugin', 'knex-plugin']`     | Needs JWT and DB         |
| `swagger-plugin`      | `['schemas-plugin']`                | Needs schemas for docs   |
| Feature plugins       | `['auth-plugin', 'schemas-plugin']` | Need auth and validation |

## 🎨 Plugin Categories

### 1. Infrastructure Plugins

Load first, provide core functionality

```
- logging-plugin
- knex-plugin
- redis-plugin
- monitoring-plugin
```

### 2. Security Plugins

Load after infrastructure

```
- jwt-plugin
- auth-plugin
- rate-limit-plugin
- cors-plugin
```

### 3. Enhancement Plugins

Load after security

```
- response-handler-plugin
- error-handler-plugin
- schemas-plugin
- swagger-plugin
```

### 4. Feature Plugins

Load last, use all other plugins

```
- user-profile-plugin
- settings-plugin
- navigation-plugin
```

## ✅ Checklist for New Plugins

- [ ] File follows naming convention: `feature-name.plugin.ts`
- [ ] Plugin name in `fp()` matches: `feature-name-plugin`
- [ ] Dependencies are correctly declared
- [ ] TypeScript declarations added
- [ ] Options interface defined
- [ ] Error handling implemented
- [ ] Logging for initialization
- [ ] Graceful shutdown in `onClose` hook (if needed)
- [ ] Documentation comments added
- [ ] Unit tests written

## 🚨 Common Mistakes to Avoid

### 1. Mismatched Plugin Names

```typescript
// ❌ BAD: Name doesn't match
export default fp(knexPlugin, {
  name: 'knex', // Other plugins will look for 'knex-plugin'
});

// ✅ GOOD: Consistent naming
export default fp(knexPlugin, {
  name: 'knex-plugin',
});
```

### 2. Missing Dependencies

```typescript
// ❌ BAD: Uses fastify.knex without declaring dependency
async function myPlugin(fastify: FastifyInstance) {
  const data = await fastify.knex('users').select('*');
}

// ✅ GOOD: Declares knex-plugin dependency
export default fp(myPlugin, {
  name: 'my-plugin',
  dependencies: ['knex-plugin'],
});
```

### 3. Not Handling Missing Optional Dependencies

```typescript
// ✅ GOOD: Check if optional dependency exists
async function myPlugin(fastify: FastifyInstance) {
  if (!fastify.redis) {
    fastify.log.warn('Redis not available, caching disabled');
    return;
  }
  // Use redis...
}
```

## 📚 Plugin Registration Order

In `main.ts`, register plugins in this order:

```typescript
// 1. Infrastructure
await app.register(loggingPlugin);
await app.register(knexPlugin);
await app.register(redisPlugin);

// 2. Security
await app.register(fastifyJwt, { secret: '...' });
await app.register(authPlugin);
await app.register(rateLimitPlugin);

// 3. Enhancement
await app.register(responseHandlerPlugin);
await app.register(errorHandlerPlugin);
await app.register(schemasPlugin);

// 4. Documentation
await app.register(swaggerPlugin);

// 5. Features
await app.register(userProfilePlugin);
await app.register(settingsPlugin);
await app.register(navigationPlugin);
```

## 🧪 Testing Plugins

### Unit Test Template

```typescript
import Fastify from 'fastify';
import myPlugin from './my-feature.plugin';

describe('My Feature Plugin', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    // Register dependencies first
    await app.register(loggingPlugin);
    // Then register plugin under test
    await app.register(myPlugin, {
      enabled: true,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should decorate fastify with myFeature', async () => {
    expect(app.myFeature).toBeDefined();
  });

  it('should handle disabled state', async () => {
    const testApp = Fastify();
    await testApp.register(myPlugin, { enabled: false });
    expect(testApp.myFeature).toBeUndefined();
  });
});
```

## 🔍 Debugging Plugin Issues

### Common Error Messages

1. **"The dependency 'X' of plugin 'Y' is not registered"**
   - Check plugin name matches in fp() export
   - Ensure dependency is registered before this plugin
   - Verify dependency name spelling

2. **"Plugin did not start in time"**
   - Check for unhandled promises in plugin
   - Ensure async operations complete
   - Add timeout option if needed

3. **"Decorator 'X' already registered"**
   - Plugin being registered twice
   - Check for duplicate registrations in main.ts

### Debug Logging

```typescript
// Add debug logging to track plugin loading
fastify.addHook('onRegister', (instance, opts) => {
  console.log(`Registering plugin: ${opts.prefix || '/'}`);
});
```

## 📖 References

- [Fastify Plugin Guide](https://www.fastify.io/docs/latest/Guides/Plugins-Guide/)
- [fastify-plugin Documentation](https://github.com/fastify/fastify-plugin)
- [TypeScript Plugin Development](https://www.fastify.io/docs/latest/Reference/TypeScript/)

---

By following these standards, we ensure:

- ✅ Consistent plugin architecture
- ✅ Predictable dependency resolution
- ✅ Type-safe integrations
- ✅ Easier debugging and maintenance
- ✅ Better team collaboration
