// WebSocket System Exports
export { WebSocketService } from '../services/websocket.service';
export { BaseRealtimeStateManager } from '../state/base-realtime-state.manager';

// Re-export types
export type {
  WebSocketMessage,
  ConnectionStatus,
  SubscriptionOptions,
} from '../services/websocket.service';

export type {
  StateItem,
  OptimisticUpdate,
  ConflictResolution,
  StateManagerConfig,
} from '../state/base-realtime-state.manager';