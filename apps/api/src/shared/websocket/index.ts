// WebSocket System Exports
export { WebSocketManager, WebSocketMessage, WebSocketMessageSchema } from './websocket.gateway';
export { EventService } from './event.service';
export { default as websocketPlugin } from './websocket.plugin';

// Real-time Event System Exports
export { RealtimeEventBus } from './realtime-event-bus';
export { SocketIOTransport } from './socket-io-transport';
export type { 
  IWebSocketTransport, 
  TransportConfig, 
  TransportType, 
  ConnectionInfo 
} from './transport.interface';
export type { 
  EventPayload, 
  EventPriority, 
  EventBusConfig 
} from './realtime-event-bus';

// Re-export common types
export type {
  WebSocketMessage as WSMessage,
} from './websocket.gateway';