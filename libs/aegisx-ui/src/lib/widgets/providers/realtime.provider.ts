import { Observable } from 'rxjs';

/**
 * Connection status for realtime provider
 */
export type RealtimeConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'error';

/**
 * Interface for real-time data updates via WebSocket.
 * Applications implement this to provide real-time capabilities.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class SocketIoRealtimeProvider implements WidgetRealtimeProvider {
 *   private socket = io('wss://api.example.com');
 *   private status$ = new BehaviorSubject<RealtimeConnectionStatus>('disconnected');
 *
 *   connect(): void {
 *     this.socket.connect();
 *     this.status$.next('connected');
 *   }
 *
 *   disconnect(): void {
 *     this.socket.disconnect();
 *     this.status$.next('disconnected');
 *   }
 *
 *   subscribe<T>(channel: string): Observable<T> {
 *     return new Observable(subscriber => {
 *       this.socket.on(channel, (data: T) => subscriber.next(data));
 *       return () => this.socket.off(channel);
 *     });
 *   }
 *
 *   get connectionStatus$(): Observable<RealtimeConnectionStatus> {
 *     return this.status$.asObservable();
 *   }
 * }
 * ```
 */
export interface WidgetRealtimeProvider {
  /**
   * Connect to realtime service
   */
  connect(): void;

  /**
   * Disconnect from realtime service
   */
  disconnect(): void;

  /**
   * Subscribe to a channel for real-time updates
   * @param channel - Channel name to subscribe
   * @returns Observable of channel data
   */
  subscribe<T>(channel: string): Observable<T>;

  /**
   * Observable of connection status
   */
  connectionStatus$: Observable<RealtimeConnectionStatus>;
}
