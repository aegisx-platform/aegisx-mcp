# Integration Patterns

> **Complete guide for integrating enterprise systems and third-party services**

**Last Updated:** 2025-11-01

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [REST API Integration](#rest-api-integration)
3. [WebSocket Real-Time Integration](#websocket-real-time-integration)
4. [Third-Party API Integration](#third-party-api-integration)
5. [Webhook Patterns](#webhook-patterns)
6. [Circuit Breaker Pattern](#circuit-breaker-pattern)
7. [Retry Logic](#retry-logic)
8. [API Versioning](#api-versioning)
9. [Integration Testing](#integration-testing)
10. [Integration Checklist](#integration-checklist)

---

## Overview

### Integration Types

| Type              | Use Case                 | Complexity  | Reliability      | Real-Time  |
| ----------------- | ------------------------ | ----------- | ---------------- | ---------- |
| **REST API**      | Standard CRUD operations | ⭐ Low      | ✅✅ Good        | ❌ No      |
| **WebSocket**     | Real-time updates        | ⭐⭐ Medium | ✅ Fair          | ✅✅✅ Yes |
| **Webhooks**      | Event notifications      | ⭐⭐ Medium | ✅ Fair          | ✅ Partial |
| **Message Queue** | Async processing         | ⭐⭐⭐ High | ✅✅✅ Excellent | ❌ No      |
| **GraphQL**       | Flexible data fetching   | ⭐⭐⭐ High | ✅✅ Good        | ✅ Partial |

### Integration Principles

1. **Resilience** - Handle failures gracefully with retries and circuit breakers
2. **Idempotency** - Same request can be retried without side effects
3. **Versioning** - Support multiple API versions for backward compatibility
4. **Monitoring** - Track integration health and performance
5. **Security** - Authenticate, authorize, and encrypt all communications

---

## REST API Integration

### Client Service Pattern

```typescript
// apps/api/src/services/http-client.service.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpClientService {
  private client: AxiosInstance;

  constructor(private config: HttpClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AegisX-API/1.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor (add auth, logging)
    this.client.interceptors.request.use(
      (config) => {
        // Add API key
        if (this.config.apiKey) {
          config.headers['X-API-Key'] = this.config.apiKey;
        }

        // Log request
        this.logger.debug('HTTP Request', {
          method: config.method,
          url: config.url,
          params: config.params,
        });

        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor (error handling, logging)
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('HTTP Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      },
    );
  }

  private handleError(error: any) {
    if (error.response) {
      // Server responded with error status
      this.logger.error('HTTP Error Response', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // No response received
      this.logger.error('HTTP No Response', {
        url: error.config?.url,
      });
    } else {
      // Request setup error
      this.logger.error('HTTP Request Error', error.message);
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}
```

### Third-Party Service Integration

```typescript
// apps/api/src/integrations/payment-gateway.service.ts
@Injectable()
export class PaymentGatewayService {
  private client: HttpClientService;

  constructor(
    httpClientFactory: HttpClientFactory,
    private config: PaymentGatewayConfig,
  ) {
    this.client = httpClientFactory.create({
      baseUrl: config.apiUrl,
      apiKey: config.apiKey,
      timeout: 10000,
    });
  }

  /**
   * Create payment charge
   */
  async createCharge(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentCharge> {
    try {
      return await this.client.post<PaymentCharge>('/charges', {
        amount,
        currency,
        metadata,
      });
    } catch (error) {
      throw new IntegrationError('Payment gateway charge failed', 'PAYMENT_GATEWAY_ERROR', { amount, currency, error });
    }
  }

  /**
   * Get payment status
   */
  async getChargeStatus(chargeId: string): Promise<PaymentStatus> {
    try {
      return await this.client.get<PaymentStatus>(`/charges/${chargeId}`);
    } catch (error) {
      throw new IntegrationError('Failed to fetch payment status', 'PAYMENT_STATUS_ERROR', { chargeId, error });
    }
  }

  /**
   * Refund payment
   */
  async refund(chargeId: string, amount?: number): Promise<PaymentRefund> {
    try {
      return await this.client.post<PaymentRefund>(`/charges/${chargeId}/refund`, { amount });
    } catch (error) {
      throw new IntegrationError('Payment refund failed', 'REFUND_ERROR', { chargeId, amount, error });
    }
  }
}
```

### Frontend HTTP Client

```typescript
// apps/web/src/app/core/services/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params }).pipe(
      catchError(this.handleError),
      tap((response) => this.logResponse('GET', endpoint, response)),
    );
  }

  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body).pipe(
      catchError(this.handleError),
      tap((response) => this.logResponse('POST', endpoint, response)),
    );
  }

  patch<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body).pipe(
      catchError(this.handleError),
      tap((response) => this.logResponse('PATCH', endpoint, response)),
    );
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`).pipe(
      catchError(this.handleError),
      tap((response) => this.logResponse('DELETE', endpoint, response)),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message;
    }

    console.error('HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private logResponse(method: string, endpoint: string, response: any) {
    console.debug(`${method} ${endpoint}`, response);
  }
}
```

---

## WebSocket Real-Time Integration

### Backend WebSocket Server

```typescript
// apps/api/src/services/event.service.ts
import { Server as SocketIOServer } from 'socket.io';

@Injectable()
export class EventService {
  private io: SocketIOServer;

  init(httpServer: any) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      },
      path: '/ws',
    });

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  private setupAuthentication() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token
        const user = await this.authService.verifyToken(token);
        socket.data.user = user;

        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user;

      this.logger.info('WebSocket connected', {
        socketId: socket.id,
        userId: user.id,
      });

      // Join user-specific room
      socket.join(`user:${user.id}`);

      // Join role-based rooms
      socket.join(`role:${user.role}`);

      // Handle disconnection
      socket.on('disconnect', () => {
        this.logger.info('WebSocket disconnected', {
          socketId: socket.id,
          userId: user.id,
        });
      });
    });
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit event to all users with role
   */
  emitToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  /**
   * Get connected users count
   */
  async getConnectedUsersCount(): Promise<number> {
    const sockets = await this.io.fetchSockets();
    return sockets.length;
  }
}
```

### Using EventService in Business Logic

```typescript
// apps/api/src/modules/orders/orders.service.ts
@Injectable()
export class OrdersService {
  constructor(
    private repository: OrdersRepository,
    private eventService: EventService,
  ) {}

  async create(data: CreateOrderRequest, userId: string): Promise<Order> {
    const order = await this.repository.create({
      ...data,
      user_id: userId,
      status: 'pending',
    });

    // Emit real-time event
    this.eventService.emitToUser(userId, 'order:created', {
      orderId: order.id,
      status: order.status,
      total: order.total,
    });

    // Notify admins
    this.eventService.emitToRole('admin', 'order:new', {
      orderId: order.id,
      userId,
    });

    return order;
  }

  async updateStatus(id: string, status: OrderStatus, userId: string): Promise<Order> {
    const order = await this.repository.update(id, { status });

    // Emit status change event
    this.eventService.emitToUser(order.user_id, 'order:status_changed', {
      orderId: order.id,
      status: order.status,
    });

    return order;
  }
}
```

### Frontend WebSocket Client

```typescript
// apps/web/src/app/core/services/websocket.service.ts
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket | null = null;
  private connected = signal(false);

  constructor(private authService: AuthService) {}

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = this.authService.getToken();

    this.socket = io(environment.wsUrl, {
      path: '/ws',
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connected.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connected.set(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connected.set(false);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected.set(false);
    }
  }

  on<T>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string): void {
    this.socket?.off(event);
  }

  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.connected();
  }
}
```

### Component Using WebSocket

```typescript
// apps/web/src/app/features/orders/order-list.component.ts
@Component({
  selector: 'app-order-list',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Orders</mat-card-title>
        @if (wsService.isConnected()) {
          <span class="status-badge connected">🟢 Live</span>
        } @else {
          <span class="status-badge disconnected">🔴 Offline</span>
        }
      </mat-card-header>

      <mat-card-content>
        @for (order of orders(); track order.id) {
          <app-order-item [order]="order" />
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class OrderListComponent implements OnInit, OnDestroy {
  orders = signal<Order[]>([]);

  constructor(
    private orderService: OrderService,
    public wsService: WebSocketService,
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.setupWebSocket();
  }

  ngOnDestroy() {
    this.wsService.off('order:created');
    this.wsService.off('order:status_changed');
  }

  private async loadOrders() {
    const data = await this.orderService.getAll();
    this.orders.set(data);
  }

  private setupWebSocket() {
    // Listen for new orders
    this.wsService.on<{ orderId: string }>('order:created', (data) => {
      this.orderService.getById(data.orderId).then((order) => {
        this.orders.update((orders) => [order, ...orders]);
      });
    });

    // Listen for status changes
    this.wsService.on<{ orderId: string; status: string }>('order:status_changed', (data) => {
      this.orders.update((orders) => orders.map((order) => (order.id === data.orderId ? { ...order, status: data.status } : order)));
    });
  }
}
```

---

## Third-Party API Integration

### Wrapper Service Pattern

```typescript
// apps/api/src/integrations/email-provider.service.ts
@Injectable()
export class EmailProviderService {
  private client: HttpClientService;

  constructor(
    httpClientFactory: HttpClientFactory,
    private config: EmailProviderConfig,
  ) {
    this.client = httpClientFactory.create({
      baseUrl: config.apiUrl,
      apiKey: config.apiKey,
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.client.post('/send', {
        to,
        from: this.config.fromEmail,
        subject,
        html: body,
      });

      this.logger.info('Email sent successfully', { to, subject });
    } catch (error) {
      this.logger.error('Email send failed', { to, subject, error });
      throw new IntegrationError('Failed to send email', 'EMAIL_SEND_ERROR', { to, subject });
    }
  }

  async sendTemplateEmail(to: string, templateId: string, variables: Record<string, any>): Promise<void> {
    try {
      await this.client.post('/send-template', {
        to,
        from: this.config.fromEmail,
        template_id: templateId,
        variables,
      });

      this.logger.info('Template email sent', { to, templateId });
    } catch (error) {
      this.logger.error('Template email failed', { to, templateId, error });
      throw new IntegrationError('Failed to send template email', 'EMAIL_TEMPLATE_ERROR', { to, templateId });
    }
  }
}
```

### Configuration Management

```typescript
// apps/api/src/config/integrations.config.ts
export interface IntegrationConfig {
  paymentGateway: {
    apiUrl: string;
    apiKey: string;
    webhookSecret: string;
  };
  emailProvider: {
    apiUrl: string;
    apiKey: string;
    fromEmail: string;
  };
  smsProvider: {
    apiUrl: string;
    apiKey: string;
    fromNumber: string;
  };
}

export const integrationsConfig = (): IntegrationConfig => ({
  paymentGateway: {
    apiUrl: process.env.PAYMENT_GATEWAY_URL!,
    apiKey: process.env.PAYMENT_GATEWAY_API_KEY!,
    webhookSecret: process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET!,
  },
  emailProvider: {
    apiUrl: process.env.EMAIL_PROVIDER_URL!,
    apiKey: process.env.EMAIL_PROVIDER_API_KEY!,
    fromEmail: process.env.EMAIL_FROM!,
  },
  smsProvider: {
    apiUrl: process.env.SMS_PROVIDER_URL!,
    apiKey: process.env.SMS_PROVIDER_API_KEY!,
    fromNumber: process.env.SMS_FROM_NUMBER!,
  },
});
```

---

## Webhook Patterns

### Webhook Receiver

```typescript
// apps/api/src/webhooks/payment-webhook.controller.ts
@Controller()
export class PaymentWebhookController {
  constructor(
    private paymentService: PaymentService,
    private config: PaymentGatewayConfig,
  ) {}

  @Post('/webhooks/payment')
  async handlePaymentWebhook(request: FastifyRequest, reply: FastifyReply) {
    // Verify webhook signature
    const signature = request.headers['x-webhook-signature'] as string;

    if (!this.verifySignature(request.body, signature)) {
      return reply.code(401).send({ error: 'Invalid signature' });
    }

    const event = request.body as PaymentWebhookEvent;

    try {
      await this.processWebhookEvent(event);
      return reply.code(200).send({ received: true });
    } catch (error) {
      this.logger.error('Webhook processing failed', { event, error });
      return reply.code(500).send({ error: 'Processing failed' });
    }
  }

  private verifySignature(payload: any, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto.createHmac('sha256', this.config.webhookSecret).update(JSON.stringify(payload)).digest('hex');

    return signature === expectedSignature;
  }

  private async processWebhookEvent(event: PaymentWebhookEvent) {
    switch (event.type) {
      case 'charge.succeeded':
        await this.paymentService.handleChargeSucceeded(event.data);
        break;

      case 'charge.failed':
        await this.paymentService.handleChargeFailed(event.data);
        break;

      case 'refund.created':
        await this.paymentService.handleRefund(event.data);
        break;

      default:
        this.logger.warn('Unknown webhook event type', { type: event.type });
    }
  }
}
```

### Idempotent Webhook Processing

```typescript
// apps/api/src/webhooks/webhook-event.service.ts
@Injectable()
export class WebhookEventService {
  constructor(private knex: Knex) {}

  /**
   * Process webhook event idempotently
   * Prevents duplicate processing
   */
  async processIdempotently(eventId: string, handler: () => Promise<void>): Promise<void> {
    const trx = await this.knex.transaction();

    try {
      // Check if event already processed
      const existing = await trx('webhook_events').where({ event_id: eventId }).first();

      if (existing) {
        this.logger.info('Webhook event already processed', { eventId });
        await trx.commit();
        return;
      }

      // Mark event as processing
      await trx('webhook_events').insert({
        event_id: eventId,
        status: 'processing',
        received_at: new Date(),
      });

      await trx.commit();

      // Process event
      await handler();

      // Mark as completed
      await this.knex('webhook_events').where({ event_id: eventId }).update({
        status: 'completed',
        processed_at: new Date(),
      });
    } catch (error) {
      await trx.rollback();

      // Mark as failed
      await this.knex('webhook_events').where({ event_id: eventId }).update({
        status: 'failed',
        error: error.message,
        processed_at: new Date(),
      });

      throw error;
    }
  }
}
```

### Database Schema for Webhooks

```sql
-- Track webhook events to prevent duplicate processing
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100),
  status VARCHAR(50) NOT NULL, -- processing, completed, failed
  payload JSONB,
  error TEXT,
  received_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
```

---

## Circuit Breaker Pattern

### Implementation

```typescript
// apps/api/src/utils/circuit-breaker.ts
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;

  constructor(
    private threshold: number = 5, // Open after 5 failures
    private timeout: number = 60000, // Try again after 60s
    private successThreshold: number = 2, // Close after 2 successes in half-open
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  private shouldAttemptReset(): boolean {
    return this.lastFailureTime !== null && Date.now() - this.lastFailureTime >= this.timeout;
  }

  getState(): string {
    return this.state;
  }
}
```

### Using Circuit Breaker

```typescript
// apps/api/src/integrations/external-api.service.ts
@Injectable()
export class ExternalApiService {
  private circuitBreaker = new CircuitBreaker(5, 60000, 2);

  async fetchData(endpoint: string): Promise<any> {
    try {
      return await this.circuitBreaker.execute(async () => {
        return await this.httpClient.get(endpoint);
      });
    } catch (error) {
      if (error.message === 'Circuit breaker is OPEN') {
        this.logger.warn('Circuit breaker open, using fallback');
        return this.getFallbackData();
      }
      throw error;
    }
  }

  private getFallbackData(): any {
    // Return cached data or default response
    return { status: 'unavailable' };
  }
}
```

---

## Retry Logic

### Exponential Backoff

```typescript
// apps/api/src/utils/retry.ts
export async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 3, baseDelay: number = 1000, maxDelay: number = 10000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const totalDelay = delay + jitter;

      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw new Error('Max retries exceeded');
}
```

### Retry with Specific Error Types

```typescript
// apps/api/src/utils/retry-on-error.ts
export async function retryOnSpecificErrors<T>(fn: () => Promise<T>, retryableErrors: string[] = ['ECONNRESET', 'ETIMEDOUT', '503'], maxRetries: number = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const shouldRetry = attempt < maxRetries && retryableErrors.some((code) => error.code === code || error.status?.toString() === code || error.message?.includes(code));

      if (!shouldRetry) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}
```

### Usage Example

```typescript
// apps/api/src/integrations/payment-gateway.service.ts
async createCharge(amount: number): Promise<PaymentCharge> {
  return await retryWithBackoff(
    async () => {
      return await this.client.post('/charges', { amount });
    },
    3, // Max 3 retries
    1000, // Start with 1s delay
    10000 // Max 10s delay
  );
}
```

---

## API Versioning

### URL Path Versioning

```typescript
// apps/api/src/modules/users/users.routes.ts
export async function usersRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // V1 endpoints
  fastify.get('/api/v1/users', {
    schema: {
      tags: ['Users V1'],
      response: {
        200: UsersListResponseSchemaV1,
      },
    },
    handler: async (request, reply) => {
      const users = await usersServiceV1.getAll();
      return reply.send({ success: true, data: users });
    },
  });

  // V2 endpoints (enhanced response)
  fastify.get('/api/v2/users', {
    schema: {
      tags: ['Users V2'],
      response: {
        200: UsersListResponseSchemaV2,
      },
    },
    handler: async (request, reply) => {
      const users = await usersServiceV2.getAll();
      return reply.send({
        success: true,
        data: users,
        pagination: {
          /* ... */
        },
        meta: {
          /* ... */
        },
      });
    },
  });
}
```

### Header-Based Versioning

```typescript
// apps/api/src/plugins/api-version.plugin.ts
export const apiVersionPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request, reply) => {
    const version = request.headers['api-version'] || '1';
    request.apiVersion = version;
  });
};

// Usage in route
handler: async (request, reply) => {
  if (request.apiVersion === '2') {
    return await this.getUsersV2();
  }
  return await this.getUsersV1();
};
```

### Deprecation Strategy

```typescript
// apps/api/src/utils/deprecated-endpoint.decorator.ts
export function DeprecatedEndpoint(
  version: string,
  sunsetDate: string,
  replacementUrl: string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const reply = args[1] as FastifyReply;

      // Add deprecation headers
      reply.header('Deprecation', 'true');
      reply.header('Sunset', sunsetDate);
      reply.header('Link', `<${replacementUrl}>; rel="successor-version"`);

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Usage
@DeprecatedEndpoint(
  'v1',
  '2025-12-31',
  '/api/v2/users'
)
async getUsersV1() {
  // Old implementation
}
```

---

## Integration Testing

### Testing Third-Party APIs

```typescript
// apps/api/src/integrations/__tests__/payment-gateway.service.spec.ts
describe('PaymentGatewayService', () => {
  let service: PaymentGatewayService;
  let httpClientMock: jest.Mocked<HttpClientService>;

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn(),
    } as any;

    service = new PaymentGatewayService(httpClientMock, config);
  });

  describe('createCharge', () => {
    it('should create charge successfully', async () => {
      const mockResponse = {
        id: 'ch_123',
        amount: 1000,
        status: 'succeeded',
      };

      httpClientMock.post.mockResolvedValue(mockResponse);

      const result = await service.createCharge(1000, 'USD', {});

      expect(httpClientMock.post).toHaveBeenCalledWith('/charges', {
        amount: 1000,
        currency: 'USD',
        metadata: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      httpClientMock.post.mockRejectedValue(new Error('API Error'));

      await expect(service.createCharge(1000, 'USD', {})).rejects.toThrow(IntegrationError);
    });

    it('should retry on network errors', async () => {
      httpClientMock.post.mockRejectedValueOnce(new Error('ECONNRESET')).mockRejectedValueOnce(new Error('ETIMEDOUT')).mockResolvedValueOnce({ id: 'ch_123', status: 'succeeded' });

      const result = await service.createCharge(1000, 'USD', {});

      expect(httpClientMock.post).toHaveBeenCalledTimes(3);
      expect(result.status).toBe('succeeded');
    });
  });
});
```

### Testing WebSocket Events

```typescript
// apps/api/src/services/__tests__/event.service.spec.ts
import { io as Client, Socket as ClientSocket } from 'socket.io-client';

describe('EventService', () => {
  let eventService: EventService;
  let clientSocket: ClientSocket;

  beforeEach((done) => {
    const httpServer = createServer();
    eventService = new EventService();
    eventService.init(httpServer);

    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = Client(`http://localhost:${port}`, {
        path: '/ws',
        auth: { token: 'valid-token' },
      });

      clientSocket.on('connect', done);
    });
  });

  afterEach(() => {
    clientSocket.disconnect();
  });

  it('should emit event to specific user', (done) => {
    clientSocket.on('order:created', (data) => {
      expect(data.orderId).toBe('order-123');
      done();
    });

    eventService.emitToUser('user-123', 'order:created', {
      orderId: 'order-123',
    });
  });

  it('should broadcast to all users', (done) => {
    clientSocket.on('announcement', (data) => {
      expect(data.message).toBe('System maintenance');
      done();
    });

    eventService.broadcast('announcement', {
      message: 'System maintenance',
    });
  });
});
```

---

## Integration Checklist

### ✅ Planning Phase

- [ ] Identify integration requirements (REST, WebSocket, webhooks)
- [ ] Choose integration strategy (synchronous vs asynchronous)
- [ ] Plan error handling and retry logic
- [ ] Design fallback mechanisms
- [ ] Document API contracts

### ✅ Implementation

- [ ] Create HTTP client service with interceptors
- [ ] Implement authentication (API keys, OAuth)
- [ ] Add request/response logging
- [ ] Implement circuit breaker for external APIs
- [ ] Add retry logic with exponential backoff
- [ ] Handle timeout errors gracefully
- [ ] Implement webhook signature verification
- [ ] Add idempotency for webhooks
- [ ] Set up WebSocket authentication
- [ ] Implement reconnection logic for WebSocket

### ✅ Security

- [ ] Use HTTPS for all external communications
- [ ] Verify webhook signatures
- [ ] Store API keys in environment variables
- [ ] Implement rate limiting
- [ ] Validate all incoming data
- [ ] Sanitize error messages (don't leak sensitive data)

### ✅ Testing

- [ ] Unit tests with mocked external services
- [ ] Integration tests with test environments
- [ ] Test retry logic and circuit breaker
- [ ] Test webhook signature verification
- [ ] Test WebSocket connection/reconnection
- [ ] Load test integrations

### ✅ Monitoring

- [ ] Log all integration requests/responses
- [ ] Track integration success/failure rates
- [ ] Monitor circuit breaker state
- [ ] Alert on high error rates
- [ ] Dashboard for integration health

### ✅ Documentation

- [ ] Document API endpoints and schemas
- [ ] Document webhook event types
- [ ] Document retry and timeout configuration
- [ ] Add integration examples
- [ ] Document error codes and handling

---

## Best Practices Summary

### DO ✅

- **Use circuit breaker** - Prevent cascading failures
- **Implement retry logic** - Handle transient errors
- **Verify webhooks** - Always check signatures
- **Log everything** - Track all integration activity
- **Use idempotency** - Make operations safe to retry
- **Test with mocks** - Don't depend on external services for tests
- **Version APIs** - Support backward compatibility
- **Monitor health** - Track integration metrics

### DON'T ❌

- **Don't trust external data** - Always validate
- **Don't expose API keys** - Use environment variables
- **Don't skip timeouts** - Prevent hanging requests
- **Don't ignore errors** - Handle all error cases
- **Don't skip idempotency** - Webhooks may be delivered multiple times
- **Don't hardcode URLs** - Use configuration
- **Don't forget rate limits** - Respect external API limits

---

## Related Standards

- **[Security Best Practices](./security-best-practices.md)** - API security
- **[Performance & Scalability Guidelines](./performance-scalability-guidelines.md)** - Async operations
- **[Multi-User Concurrency Standards](./multi-user-concurrency-standards.md)** - Distributed locking

---

**Last Updated:** 2025-11-01
**Version:** 1.0.0
