# Frontend WebSocket Integration

## WebSocket Service with Signals

```typescript
// libs/websocket/src/lib/services/websocket.service.ts
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private authService = inject(AuthService);

  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  // Connection state signals
  private connectedSignal = signal(false);
  private connectingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private lastMessageSignal = signal<any>(null);

  // Message handling
  private messageHandlers = new Map<string, Set<(data: any) => void>>();

  // Public readonly signals
  readonly connected = this.connectedSignal.asReadonly();
  readonly connecting = this.connectingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly lastMessage = this.lastMessageSignal.asReadonly();

  // Connection status computed
  readonly connectionStatus = computed(() => {
    if (this.connecting()) return 'connecting';
    if (this.connected()) return 'connected';
    if (this.error()) return 'error';
    return 'disconnected';
  });

  constructor() {
    // Auto-connect when user logs in
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.connectingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const token = this.authService.token();
      const wsUrl = `${this.getWebSocketUrl()}/ws?token=${token}`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.connectedSignal.set(true);
        this.connectingSignal.set(false);
        this.reconnectAttempts = 0;
        console.log('WebSocket connected');
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.socket.onclose = () => {
        this.connectedSignal.set(false);
        this.connectingSignal.set(false);
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        this.errorSignal.set('WebSocket connection failed');
        this.connectingSignal.set(false);
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      this.errorSignal.set('Failed to establish WebSocket connection');
      this.connectingSignal.set(false);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectedSignal.set(false);
    this.connectingSignal.set(false);
  }

  send(type: string, data: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    }
  }

  // Subscribe to message type
  subscribe(type: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  // Join room
  joinRoom(roomId: string): void {
    this.send('join_room', { roomId });
  }

  // Leave room
  leaveRoom(roomId: string): void {
    this.send('leave_room', { roomId });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this.lastMessageSignal.set(message);

      // Dispatch to handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach((handler) => handler(message.data));
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        if (this.authService.isAuthenticated()) {
          this.connect();
        }
      }, delay);
    }
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}`;
  }
}
```

## Real-time Notification Service

```typescript
// libs/notifications/src/lib/services/notification.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private websocketService = inject(WebSocketService);
  private snackBar = inject(MatSnackBar);

  // Notification state
  private notificationsSignal = signal<Notification[]>([]);
  private unreadCountSignal = signal(0);

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = this.unreadCountSignal.asReadonly();

  // Computed
  readonly hasUnread = computed(() => this.unreadCount() > 0);
  readonly recentNotifications = computed(() => this.notifications().slice(0, 5));

  constructor() {
    this.initializeWebSocketHandlers();
  }

  private initializeWebSocketHandlers(): void {
    // Subscribe to notification events
    this.websocketService.subscribe('notification', (data) => {
      this.addNotification(data);
      this.showToast(data);
    });

    this.websocketService.subscribe('system-notification', (data) => {
      this.addNotification({ ...data, type: 'system' });
      this.showToast(data, 'warn');
    });
  }

  private addNotification(notification: any): void {
    const newNotification: Notification = {
      id: notification.id || Date.now().toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      timestamp: new Date(notification.timestamp || Date.now()),
      isRead: false,
      data: notification.data,
    };

    this.notificationsSignal.update(
      (notifications) => [newNotification, ...notifications].slice(0, 100), // Keep last 100
    );

    this.unreadCountSignal.update((count) => count + 1);
  }

  private showToast(notification: any, type: 'success' | 'warn' | 'error' = 'success'): void {
    this.snackBar.open(notification.message, 'Close', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  markAsRead(notificationId: string): void {
    this.notificationsSignal.update((notifications) => notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));

    this.unreadCountSignal.update((count) => Math.max(0, count - 1));
  }

  markAllAsRead(): void {
    this.notificationsSignal.update((notifications) => notifications.map((n) => ({ ...n, isRead: true })));

    this.unreadCountSignal.set(0);
  }

  clearNotifications(): void {
    this.notificationsSignal.set([]);
    this.unreadCountSignal.set(0);
  }
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  timestamp: Date;
  isRead: boolean;
  data?: any;
}
```

## HTTP Service with ApiResponse Format

```typescript
// libs/http/src/lib/services/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Generic API methods that handle backend ApiResponse format
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.http.get<ApiResponse<T>>(url, { params }).toPromise();
    return this.handleResponse(response!);
  }

  async post<T>(url: string, body: any): Promise<T> {
    const response = await this.http.post<ApiResponse<T>>(url, body).toPromise();
    return this.handleResponse(response!);
  }

  async put<T>(url: string, body: any): Promise<T> {
    const response = await this.http.put<ApiResponse<T>>(url, body).toPromise();
    return this.handleResponse(response!);
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.http.delete<ApiResponse<T>>(url).toPromise();
    return this.handleResponse(response!);
  }

  // Paginated requests
  async getPaginated<T>(url: string, params: any): Promise<PaginatedResponse<T>> {
    const response = await this.http.get<ApiResponse<T[]>>(url, { params }).toPromise();

    if (!response!.success) {
      throw new Error(response!.error || 'Request failed');
    }

    return {
      data: response!.data!,
      pagination: response!.pagination!,
    };
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new ApiError(response.error || 'Request failed', response.details);
    }

    return response.data!;
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  pagination?: PaginationInfo;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

class ApiError extends Error {
  constructor(
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

## Error Handling Service

```typescript
// libs/error-handling/src/lib/services/error-handler.service.ts
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private notificationService = inject(NotificationService);

  handleError(error: any, context?: string): void {
    console.error('Error occurred:', error, { context });

    if (error instanceof ApiError) {
      this.handleApiError(error);
    } else if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleGenericError(error);
    }
  }

  private handleApiError(error: ApiError): void {
    // Handle structured API errors from backend
    if (error.details?.type === 'VALIDATION_ERROR') {
      this.handleValidationError(error.details);
    } else if (error.details?.type === 'BUSINESS_LOGIC_ERROR') {
      this.notificationService.error('Business Rule Violation', error.message);
    } else {
      this.notificationService.error('Error', error.message);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    let message = 'An error occurred';

    switch (error.status) {
      case 400:
        message = 'Bad request - please check your input';
        break;
      case 401:
        message = 'Unauthorized - please log in again';
        break;
      case 403:
        message = 'Access denied - insufficient permissions';
        break;
      case 404:
        message = 'Resource not found';
        break;
      case 429:
        message = 'Too many requests - please try again later';
        break;
      case 500:
        message = 'Server error - please try again';
        break;
    }

    this.notificationService.error('Error', message);
  }

  private handleValidationError(details: any): void {
    if (details.errors && Array.isArray(details.errors)) {
      const messages = details.errors.map((err: any) => err.message).join(', ');
      this.notificationService.error('Validation Error', messages);
    }
  }

  private handleGenericError(error: any): void {
    this.notificationService.error('Unexpected Error', 'Something went wrong');
  }
}
```

## File Upload Integration

```typescript
// libs/file-upload/src/lib/services/file-upload.service.ts
@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private apiService = inject(ApiService);

  private uploadProgressSignal = signal<Map<string, number>>(new Map());
  private uploadingFilesSignal = signal<Set<string>>(new Set());

  readonly uploadProgress = this.uploadProgressSignal.asReadonly();
  readonly uploadingFiles = this.uploadingFilesSignal.asReadonly();

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadedFile> {
    const fileId = this.generateFileId();

    // Track upload
    this.uploadingFilesSignal.update((files) => new Set([...files, fileId]));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.http
        .post<UploadedFile>('/api/files/upload', formData, {
          reportProgress: true,
          observe: 'events',
        })
        .pipe(
          tap((event) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              const progress = Math.round((100 * event.loaded) / event.total);
              this.updateProgress(fileId, progress);
              onProgress?.(progress);
            }
          }),
          filter((event) => event.type === HttpEventType.Response),
          map((event: any) => event.body),
        )
        .toPromise();

      return response!;
    } finally {
      this.uploadingFilesSignal.update((files) => {
        const newFiles = new Set(files);
        newFiles.delete(fileId);
        return newFiles;
      });

      this.uploadProgressSignal.update((progress) => {
        const newProgress = new Map(progress);
        newProgress.delete(fileId);
        return newProgress;
      });
    }
  }

  async uploadMultiple(files: File[]): Promise<UploadedFile[]> {
    const uploads = files.map((file) => this.uploadFile(file));
    return Promise.all(uploads);
  }

  private updateProgress(fileId: string, progress: number): void {
    this.uploadProgressSignal.update((map) => new Map(map).set(fileId, progress));
  }

  private generateFileId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
```
