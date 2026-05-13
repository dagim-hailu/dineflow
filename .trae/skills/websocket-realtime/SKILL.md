---
name: 'websocket-realtime'
description: 'Sets up Socket.io WebSocket gateway for real-time communication. Invoke when implementing real-time features or user asks for WebSocket functionality.'
---

# WebSocket Real-time Skill

This skill sets up Socket.io WebSocket gateway for real-time communication in NestJS applications.

## When to Use

- When implementing real-time order updates
- When setting up live notifications
- When user requests WebSocket functionality
- When building real-time dashboards

## Execution Flow

### 1. Create WebSocket Gateway

Create `apps/api/src/modules/events/events.gateway.ts` with:

- Socket.io server setup
- Authentication middleware
- Event handlers for real-time communication

### 2. Implement Redis Adapter

Set up Redis adapter for horizontal scaling:

- Install `@socket.io/redis-adapter`
- Configure Redis pub/sub for event broadcasting

### 3. Define Event Types

Create TypeScript interfaces for all WebSocket events:

- `order:new` - New order placed
- `order:status` - Order status changes
- `table:request` - Table service requests
- `notification` - General notifications

### 4. Authentication Middleware

Implement JWT and guest token validation for WebSocket connections.

### 5. Room Management

Create room management for:

- Restaurant-specific rooms
- Waiter-specific rooms
- Table-specific rooms
- Kitchen display rooms

### 6. Frontend Integration

Create React hook for WebSocket client connection and event handling.
