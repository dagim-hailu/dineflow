### Skill 4: WebSocket Real-time Features

**File Path:** `.trae/skills/websocket-realtime/SKILL.md`

````markdown
---
name: websocket-realtime
description: Standardized workflow for implementing Socket.io real-time features in DineFlow.
globs: apps/api/src/modules/notification/**/*.ts,apps/web/src/hooks/useSocket.ts
alwaysApply: false
---

# Implement WebSocket Real-time Features

## Trigger Conditions

Trigger when user says "add real-time notifications," "WebSocket functionality," "order status push."

## Execution Flow

### 1. Backend: Define Event Interfaces

In `apps/api/src/modules/notification/dto/`, define event types:

```typescript
export interface OrderPlacedEvent {
  orderId: string;
  tableId: string;
  items: OrderItem[];
  customerName?: string;
  avatar?: string;
}

2. Backend: Add Handler in Gateway
In events.gateway.ts:

@SubscribeMessage('order:new')
async handleOrderPlaced(
  @MessageBody() data: OrderPlacedEvent,
  @ConnectedSocket() client: Socket,
) {
  // Broadcast to relevant waiter
  this.server.to(`waiter:${waiterId}`).emit('order:new', data);
}

3. Backend: Emit Event in Service

// Inject EventsGateway
constructor(private readonly eventsGateway: EventsGateway) {}

// Emit during business logic
await this.eventsGateway.emitOrderPlaced(order);

4. Frontend: Create useSocket Hook
In apps/web/src/hooks/useSocket.ts:

export const useSocket = () => {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);

    socket.on('order:new', (data) => {
      // Update Zustand store or trigger notification
    });

    return () => socket.disconnect();
  }, []);
};

5. Frontend: Use in Components
Wrap app with Socket provider and use hook in components.


> ⚠️ **Important**: You already have the frontend skill file. You still need to create the other three:
> 1. `.trae/skills/nestjs-graphql-module/SKILL.md` (new)
> 2. `.trae/skills/drizzle-migration/SKILL.md` (new)
> 3. `.trae/skills/websocket-realtime/SKILL.md` (new)

---

## 3) How to Configure the Automation Pipeline

The Pipeline feature in TRAE uses **slash commands** that you type directly into the AI chat dialog. Here's exactly how to do it:

**Step 1: Open the AI Dialog**
- Press `Cmd+I` (Mac) or `Ctrl+I` (Windows/Linux) to open the TRAE AI chat panel.

**Step 2: Enable the Pipeline**
- In the AI chat input box, type exactly this command:
```
````
