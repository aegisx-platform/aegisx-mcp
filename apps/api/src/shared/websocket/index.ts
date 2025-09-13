// WebSocket System Exports
export { WebSocketManager, WebSocketMessage, WebSocketMessageSchema } from './websocket.gateway';
export { EventService } from './event.service';
export { default as websocketPlugin } from './websocket.plugin';

// Re-export common types
export type {
  WebSocketMessage as WSMessage,
} from './websocket.gateway';