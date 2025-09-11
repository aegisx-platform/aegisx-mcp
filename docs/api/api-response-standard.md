# API Response Standardization

> **MANDATORY**: All API endpoints must follow this standardized response format

## Standard Response Format

### TypeScript Interfaces

```typescript
// Shared types (libs/shared/types/api.types.ts)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  pagination?: Pagination;
  meta?: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## Backend Implementation

### Response Handler Plugin

```typescript
// apps/api/src/plugins/response-handler.plugin.ts
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(async function responseHandlerPlugin(fastify: FastifyInstance) {
  // Success response
  fastify.decorateReply('success', function (data: any, message?: string) {
    return this.send({
      success: true,
      data,
      message,
    });
  });

  // Created response (201)
  fastify.decorateReply('created', function (data: any, message?: string) {
    return this.code(201).send({
      success: true,
      data,
      message,
    });
  });

  // Paginated response
  fastify.decorateReply('paginated', function (data: any[], page: number, limit: number, total: number, message?: string) {
    return this.send({
      success: true,
      data,
      message,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // Error response
  fastify.decorateReply('error', function (code: string, message: string, statusCode: number = 400, details?: any) {
    return this.code(statusCode).send({
      success: false,
      error: {
        code,
        message,
        details,
        statusCode,
      },
    });
  });

  // Not found response
  fastify.decorateReply('notFound', function (message: string = 'Resource not found') {
    return this.code(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message,
        statusCode: 404,
      },
    });
  });
});
```

### Usage Examples

#### Success Responses

```typescript
// GET single resource
fastify.get('/api/users/:id', async (request, reply) => {
  const user = await userService.findById(request.params.id);
  if (!user) {
    return reply.notFound('User not found');
  }
  return reply.success(user);
});

// POST create resource
fastify.post('/api/users', async (request, reply) => {
  const user = await userService.create(request.body);
  return reply.created(user, 'User created successfully');
});

// GET paginated list
fastify.get('/api/users', async (request, reply) => {
  const { data, total } = await userService.findAll(request.query);
  const { page = 1, limit = 10 } = request.query;
  return reply.paginated(data, page, limit, total);
});

// PUT update resource
fastify.put('/api/users/:id', async (request, reply) => {
  const updated = await userService.update(request.params.id, request.body);
  return reply.success(updated, 'User updated successfully');
});

// DELETE resource
fastify.delete('/api/users/:id', async (request, reply) => {
  await userService.delete(request.params.id);
  return reply.success({ deleted: true }, 'User deleted successfully');
});
```

#### Error Responses

```typescript
// Validation error
if (error.validation) {
  return reply.error('VALIDATION_ERROR', 'Invalid request data', 400, error.validation);
}

// Business logic error
if (!user.canPerformAction()) {
  return reply.error('FORBIDDEN_ACTION', 'User cannot perform this action', 403);
}

// Not found
if (!resource) {
  return reply.notFound('Resource not found');
}

// Internal server error
return reply.error('INTERNAL_SERVER_ERROR', 'An unexpected error occurred', 500);
```

## Frontend Implementation

### HTTP Interceptor

```typescript
// apps/frontend/src/app/core/interceptors/api.interceptor.ts
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // All successful responses should have success: true
        if (event.body && !event.body.hasOwnProperty('success')) {
          console.warn('Non-standard API response:', event.url);
        }
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      // Transform to standard error format
      const apiError: ApiError = {
        code: error.error?.error?.code || 'UNKNOWN_ERROR',
        message: error.error?.error?.message || error.message,
        statusCode: error.status,
        details: error.error?.error?.details,
      };

      return throwError(() => apiError);
    }),
  );
};
```

### Service Usage with Signals

```typescript
// apps/frontend/src/app/features/user/services/user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  // State management with signals
  private _users = signal<User[]>([]);
  private _loading = signal(false);
  private _error = signal<ApiError | null>(null);

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async loadUsers(params?: any): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Response is typed as ApiResponse<User[]>
      const response = await firstValueFrom(this.http.get<ApiResponse<User[]>>('/api/users', { params }));

      if (response.success && response.data) {
        this._users.set(response.data);
      }
    } catch (error: any) {
      this._error.set(error);
    } finally {
      this._loading.set(false);
    }
  }

  async createUser(data: CreateUserRequest): Promise<User | null> {
    try {
      const response = await firstValueFrom(this.http.post<ApiResponse<User>>('/api/users', data));

      if (response.success && response.data) {
        // Update local state
        this._users.update((users) => [...users, response.data!]);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this._error.set(error);
      throw error;
    }
  }
}
```

## Error Codes Reference

| Code                    | Description                   | HTTP Status |
| ----------------------- | ----------------------------- | ----------- |
| `VALIDATION_ERROR`      | Request validation failed     | 400         |
| `UNAUTHORIZED`          | Authentication required       | 401         |
| `FORBIDDEN`             | Insufficient permissions      | 403         |
| `NOT_FOUND`             | Resource not found            | 404         |
| `CONFLICT`              | Resource conflict (duplicate) | 409         |
| `RATE_LIMIT_EXCEEDED`   | Too many requests             | 429         |
| `INTERNAL_SERVER_ERROR` | Server error                  | 500         |
| `SERVICE_UNAVAILABLE`   | Service temporarily down      | 503         |

### Domain-Specific Error Codes

- `USER_*` - User-related errors
- `AUTH_*` - Authentication errors
- `PAYMENT_*` - Payment errors
- `FILE_*` - File operation errors

## OpenAPI Schema

```yaml
components:
  schemas:
    ApiResponse:
      type: object
      required: [success]
      properties:
        success:
          type: boolean
        data:
          type: object
        error:
          $ref: '#/components/schemas/ApiError'
        message:
          type: string
        pagination:
          $ref: '#/components/schemas/Pagination'
        meta:
          type: object

    ApiError:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
        message:
          type: string
        statusCode:
          type: integer
        details:
          type: object

    Pagination:
      type: object
      required: [page, limit, total, totalPages]
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer
```

## Migration Checklist

- [ ] Create shared types library with interfaces
- [ ] Implement response handler plugin
- [ ] Update all backend controllers
- [ ] Add HTTP interceptor to frontend
- [ ] Update all frontend services
- [ ] Update OpenAPI schemas
- [ ] Update API documentation
- [ ] Add response format validation tests

## Mobile Support

This API response format is designed to work seamlessly across all platforms including mobile applications.

### iOS (Swift) Integration

```swift
// Models/ApiResponse.swift
struct ApiResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: ApiError?
    let message: String?
    let pagination: Pagination?
    let meta: [String: Any]?
}

struct ApiError: Codable {
    let code: String
    let message: String
    let statusCode: Int?
    let details: [String: Any]?
}

// Usage
func fetchUsers() async throws -> [User] {
    let response = try await apiClient.get("/api/users", responseType: ApiResponse<[User]>.self)

    if response.success, let users = response.data {
        return users
    } else if let error = response.error {
        throw AppError(code: error.code, message: error.message)
    }

    throw AppError.unknown
}
```

### Android (Kotlin) Integration

```kotlin
// models/ApiResponse.kt
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: ApiError? = null,
    val message: String? = null,
    val pagination: Pagination? = null,
    val meta: Map<String, Any>? = null
)

data class ApiError(
    val code: String,
    val message: String,
    val statusCode: Int? = null,
    val details: Map<String, Any>? = null
)

// Usage with Retrofit
interface ApiService {
    @GET("api/users")
    suspend fun getUsers(): ApiResponse<List<User>>
}

// Handle response
viewModelScope.launch {
    try {
        val response = apiService.getUsers()
        when {
            response.success && response.data != null -> {
                _users.value = response.data
            }
            response.error != null -> {
                _error.value = response.error.message
            }
        }
    } catch (e: Exception) {
        _error.value = "Network error"
    }
}
```

### Flutter (Dart) Integration

```dart
// models/api_response.dart
class ApiResponse<T> {
  final bool success;
  final T? data;
  final ApiError? error;
  final String? message;
  final Pagination? pagination;
  final Map<String, dynamic>? meta;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.message,
    this.pagination,
    this.meta,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(Map<String, dynamic>) fromJsonT) {
    return ApiResponse<T>(
      success: json['success'] as bool,
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      error: json['error'] != null ? ApiError.fromJson(json['error']) : null,
      message: json['message'] as String?,
      pagination: json['pagination'] != null ? Pagination.fromJson(json['pagination']) : null,
      meta: json['meta'] as Map<String, dynamic>?,
    );
  }
}

// Usage
Future<List<User>> fetchUsers() async {
  final response = await http.get('/api/users');
  final apiResponse = ApiResponse.fromJson(
    response.data,
    (json) => (json as List).map((e) => User.fromJson(e)).toList(),
  );

  if (apiResponse.success && apiResponse.data != null) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

### React Native Integration

```typescript
// hooks/useApi.ts
interface UseApiOptions {
  onError?: (error: ApiError) => void;
  showErrorAlert?: boolean;
}

export const useApi = <T>(options?: UseApiOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (promise: Promise<ApiResponse<T>>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await promise;

      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else if (response.error) {
        setError(response.error);

        if (options?.showErrorAlert) {
          Alert.alert('Error', response.error.message);
        }

        options?.onError?.(response.error);
        throw response.error;
      }
    } catch (err) {
      const error: ApiError = {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        statusCode: 0
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, data };
};

// Usage
const UserList = () => {
  const { execute, loading, data: users } = useApi<User[]>({
    showErrorAlert: true
  });

  useEffect(() => {
    execute(api.get('/api/users'));
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserItem user={item} />}
    />
  );
};
```

### Mobile-Specific Error Handling

```typescript
// Error codes for mobile scenarios
export const MobileErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR', // No internet connection
  TOKEN_EXPIRED: 'TOKEN_EXPIRED', // Need to re-authenticate
  VERSION_OUTDATED: 'VERSION_OUTDATED', // Force app update
  MAINTENANCE_MODE: 'MAINTENANCE_MODE', // Server maintenance
  OFFLINE_MODE: 'OFFLINE_MODE', // Using cached data
  BIOMETRIC_FAILED: 'BIOMETRIC_FAILED', // Biometric auth failed
  DEVICE_JAILBROKEN: 'DEVICE_JAILBROKEN', // Security issue
} as const;

// Mobile-specific response handling
if (response.error?.code === MobileErrorCodes.VERSION_OUTDATED) {
  // Show force update dialog
  showForceUpdateDialog(response.meta?.minVersion);
} else if (response.error?.code === MobileErrorCodes.TOKEN_EXPIRED) {
  // Navigate to login
  navigation.navigate('Login');
}
```

### Offline Support & Caching

```typescript
// Mobile apps can cache responses
const cacheResponse = <T>(key: string, response: ApiResponse<T>) => {
  AsyncStorage.setItem(
    key,
    JSON.stringify({
      ...response,
      meta: {
        ...response.meta,
        cachedAt: Date.now(),
        fromCache: true,
      },
    }),
  );
};

// Check cache first
const getCachedOrFetch = async <T>(key: string, fetchFn: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> => {
  try {
    // Try network first
    const response = await fetchFn();
    cacheResponse(key, response);
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      return {
        ...JSON.parse(cached),
        message: 'Loaded from cache (offline mode)',
      };
    }
    throw error;
  }
};
```

### Push Notification Payloads

```typescript
// Consistent format for push notifications
interface PushNotificationPayload {
  type: 'api_response';
  response: ApiResponse<any>;
  action?: string;
}

// Handle push notification
const handleNotification = (payload: PushNotificationPayload) => {
  if (payload.response.success) {
    // Update local state with new data
    updateLocalData(payload.response.data);
  } else {
    // Show error notification
    showErrorBanner(payload.response.error);
  }
};
```

### SDK Generation for Mobile

```bash
# Generate mobile SDKs from OpenAPI spec
# iOS Swift SDK
openapi-generator generate \
  -i api-spec.yaml \
  -g swift5 \
  -o ios-sdk \
  --additional-properties=responseAs=AsyncAwait

# Android Kotlin SDK
openapi-generator generate \
  -i api-spec.yaml \
  -g kotlin \
  -o android-sdk \
  --additional-properties=library=retrofit2,serializationLibrary=gson

# Flutter Dart SDK
openapi-generator generate \
  -i api-spec.yaml \
  -g dart-dio \
  -o flutter-sdk \
  --additional-properties=nullSafe=true
```

## Benefits

1. **Consistency** - Same format across all endpoints and platforms
2. **Type Safety** - Full TypeScript/Swift/Kotlin/Dart support
3. **Error Handling** - Standardized error structure for all platforms
4. **Cross-Platform** - Works with Web, iOS, Android, Flutter, React Native
5. **Offline Support** - Easy to cache and handle offline scenarios
6. **SDK Generation** - Auto-generate client libraries
7. **Testing** - Predictable responses across all platforms

---

> ⚠️ **Important**: All new endpoints MUST follow this standard. Legacy endpoints should be migrated progressively. Mobile apps should implement proper offline handling and caching strategies.
