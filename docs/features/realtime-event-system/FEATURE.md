# Real-time Event System

**Status**: 🟡 In Progress  
**Priority**: High  
**Branch**: feature/realtime-event-system  
**Started**: 2025-09-22  
**Target**: 2025-09-25

## 📋 Requirements

**User Story**: As a developer, I want a decoupled real-time event system that enhances existing Socket.IO infrastructure with EventEmitter2 patterns, so that services can emit events without WebSocket knowledge and support switchable transports for future performance optimization

### Functional Requirements

- [ ] Enhance existing Socket.IO WebSocket infrastructure with EventEmitter2
- [ ] Implement switchable transport architecture (Socket.IO ↔ ws)  
- [ ] Create decoupled service layer with event publishing
- [ ] Add Redis adapter support for multi-instance deployments (PM2/Kubernetes)
- [ ] Implement wildcard event pattern matching and subscriptions
- [ ] Provide clean API for event emission without WebSocket knowledge
- [ ] Support event priority levels (low, normal, high, critical)
- [ ] Auto-forward events from EventBus to WebSocket clients
- [ ] Maintain backward compatibility with existing WebSocket infrastructure
- [ ] Add real-time event monitoring and statistics

### Non-Functional Requirements

- [ ] Performance: Event emission latency < 5ms, support 1000+ concurrent WebSocket connections
- [ ] Scalability: Support multi-instance deployments with Redis clustering
- [ ] Reliability: 99.9% event delivery success rate, auto-reconnection for WebSocket clients
- [ ] Maintainability: Clean service decoupling, zero breaking changes to existing WebSocket code
- [ ] Security: Secure WebSocket authentication, event validation, no sensitive data exposure
- [ ] Compatibility: Support Node.js EventEmitter patterns, Socket.IO Redis adapter integration

## 🎯 Success Criteria

### Backend

- [ ] RealtimeEventBus class with EventEmitter2 integration working
- [ ] Socket.IO + Redis adapter configuration functional
- [ ] Switchable transport interface (IWebSocketTransport) implemented
- [ ] Service decoupling complete - no direct WebSocket dependencies
- [ ] Event auto-forwarding from EventBus to Socket.IO working
- [ ] Unit tests passing (>90% coverage) for event system components
- [ ] Integration tests passing for multi-instance Redis scenarios

### Frontend

- [ ] WebSocket service maintains compatibility with existing components
- [ ] Real-time event subscriptions working with new EventBus patterns
- [ ] Admin dashboard for event monitoring and WebSocket stats implemented
- [ ] Connection status indicators and reconnection handling improved
- [ ] Component tests passing for enhanced WebSocket features

### Integration

- [ ] Zero breaking changes to existing WebSocket functionality
- [ ] Services can emit events without WebSocket knowledge
- [ ] Redis clustering working in PM2/Kubernetes multi-instance setup
- [ ] Event patterns and wildcard subscriptions functional
- [ ] Transport switching (Socket.IO ↔ ws) working seamlessly
- [ ] E2E tests passing for real-time event flows

## 🚨 Conflict Prevention

### Database Changes

- [ ] Tables reserved: event_store (optional), websocket_sessions
- [ ] No migration required - enhances existing infrastructure  
- [ ] No conflicts with RBAC and user-profile features

### API Changes

- [ ] Endpoints reserved: /api/events/*, /api/websocket/health, /api/websocket/stats
- [ ] Enhanced existing WebSocket plugin - no breaking changes
- [ ] Backward compatibility with existing EventService maintained

### Frontend Changes

- [ ] Routes reserved: /admin/events, /admin/websocket
- [ ] Enhanced existing WebSocketService - no breaking changes
- [ ] Shared utilities: RealtimeEventBus, WebSocketTransport coordination required

## 📊 Dependencies

### Depends On

- [ ] Existing WebSocket Infrastructure - Socket.IO + WebSocketManager + EventService
- [ ] Library: eventemitter2 - ^7.2.2 for wildcard event patterns
- [ ] Library: @socket.io/redis-adapter - ^8.2.1 for multi-instance support
- [ ] Library: redis - ^4.6.8 for Redis connection management

### Blocks

- [ ] Feature: CRUD Generator - Requires Event System for progress updates
- [ ] Future real-time features - Will build on this foundation

## 🎨 Design Decisions

### Architecture

- **Pattern**: Event-driven architecture with switchable WebSocket transports
- **Integration**: Enhance existing Socket.IO infrastructure, not replace
- **Decoupling**: Services emit events via EventBus, auto-forward to WebSocket
- **Scalability**: Redis adapter for multi-instance synchronization
- **Database**: Optional event_store table for event sourcing, websocket_sessions table for connection management, no breaking changes to existing schema
- **Frontend**: Signal-based state management with optimistic updates, conflict detection and resolution, connection status monitoring with auto-reconnection

### Technology Choices

- **Backend**: EventEmitter2 (v7.2.2) for wildcard event patterns, @socket.io/redis-adapter (v8.2.1) for multi-instance clustering, Redis (v4.6.8) for state synchronization
- **Frontend**: Enhanced Angular WebSocketService with signals integration, state management using BaseRealtimeStateManager pattern, TypeScript strict mode
- **Testing**: Jest for backend unit tests, Angular Testing Utilities for frontend, Redis memory server for integration tests, Playwright E2E for real-time scenarios

## 🔄 Implementation Plan

### Phase 1: Core EventBus Implementation (Days 1-2)

- [ ] Install EventEmitter2 and Redis dependencies
- [ ] Create RealtimeEventBus class with wildcard pattern support
- [ ] Implement Redis adapter integration for multi-instance support
- [ ] Create IWebSocketTransport interface for switchable transports
- [ ] Enhance existing EventService with EventBus integration
- [ ] Unit tests for EventBus and transport layer

### Phase 2: WebSocket Enhancement (Days 2-3)

- [ ] Enhance WebSocketManager with EventBus auto-forwarding
- [ ] Create WebSocketTransport implementation for Socket.IO
- [ ] Add event priority levels and queue management
- [ ] Implement connection pooling and health monitoring
- [ ] Add WebSocket statistics and monitoring endpoints
- [ ] Integration tests for WebSocket + EventBus

### Phase 3: Frontend State Management (Days 3-4)

- [ ] Create BaseRealtimeStateManager with signals integration
- [ ] Implement optimistic update patterns
- [ ] Add conflict detection and resolution mechanisms
- [ ] Create connection status monitoring components
- [ ] Build admin dashboard for event monitoring
- [ ] Component tests for state management

### Phase 4: Integration & Production Ready (Days 4-5)

- [ ] E2E tests for real-time event flows
- [ ] Performance testing with 1000+ concurrent connections
- [ ] Redis clustering configuration for Kubernetes
- [ ] Error handling and fallback mechanisms
- [ ] Documentation and API reference
- [ ] Update realtime-integration.md template with Fastify syntax

## 📝 Notes & Decisions

### Technical Decisions

- **2025-09-22** Decision: Use EventEmitter2 + Socket.IO hybrid approach instead of replacing Socket.IO
  - Rationale: Maintains backward compatibility while adding powerful event patterns
  - Benefits: Wildcard event matching, service decoupling, future transport flexibility

- **2025-09-22** Decision: Implement switchable transport architecture
  - Rationale: Future-proof design allows migration from Socket.IO to ws without breaking changes
  - Implementation: IWebSocketTransport interface with Socket.IO and ws implementations

- **2025-09-22** Decision: Use Redis for multi-instance synchronization
  - Rationale: Required for PM2/Kubernetes deployments with multiple app instances
  - Alternative considered: In-memory only (rejected due to scaling limitations)

### Challenges & Solutions

- **2025-09-22** Challenge: Avoid tight coupling between services and WebSocket infrastructure
- **2025-09-22** Solution: EventBus pattern where services emit events without WebSocket knowledge, auto-forwarding handles delivery

- **2025-09-22** Challenge: Template uses NestJS syntax instead of Fastify
- **2025-09-22** Solution: Update realtime-integration.md to use Fastify plugin patterns and native Node.js approaches

### Review Feedback

- **2025-09-22** Analysis: Existing WebSocket infrastructure is well-architected and should be enhanced, not replaced
- **2025-09-22** Requirements: Must support PM2/Kubernetes multi-instance deployments with Redis clustering
- **2025-09-22** Architecture: Socket.IO + EventEmitter2 + Redis provides optimal balance of stability and functionality
