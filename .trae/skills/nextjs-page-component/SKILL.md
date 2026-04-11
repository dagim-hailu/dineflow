---
name: nextjs-page-component
description: Standardized workflow for creating Next.js (App Router) pages and components, adhering to DineFlow design system.
globs: apps/web/src/app/**/*.tsx,apps/web/src/components/**/*.tsx
alwaysApply: false
---

# Create Next.js Page & Component

## Trigger Conditions

Trigger when user says "create a new page," "add XXX component," "generate XXX interface."

## Execution Flow

### 1. Determine Type

- Page: Place under `apps/web/src/app/`
- Reusable Component: Place under `apps/web/src/components/`

### 2. Create File

Page
src/app/(section)/[route]/page.tsx

Component
src/components/[category]/[ComponentName].tsx

### 3. Component Template

````tsx
'use client'; // If client interaction needed

import { FC } from 'react';
// Import shadcn/ui components
// Import custom hooks

interface [ComponentName]Props {
  // Define props types
}

export const [ComponentName]: FC<[ComponentName]Props> = ({ ... }) => {
  // Use Zustand store
  // Use Apollo hooks
  // Use custom hooks

  return (
    <div className="..."> {/* Tailwind classes */}
      {/* Component content */}
    </div>
  );
};

4. Styling Guidelines
Use Tailwind CSS classes

Primary color: primary (#F59E0B)

Buttons: bg-primary text-white px-4 py-2 rounded-md font-semibold

Cards: bg-white rounded-lg shadow-md p-6

5. State Management
Client global state: Zustand store

Server data: Apollo Client hooks

Form state: React Hook Form + Zod


#### Skill 3: Generate Drizzle Database Migration

**File Path:** `.trae/skills/drizzle-migration/SKILL.md`

```markdown
---
name: drizzle-migration
description: Standardized workflow for generating and managing database migrations using Drizzle ORM.
globs: apps/api/src/infrastructure/database/schema.ts
alwaysApply: false
---

# Generate Drizzle Database Migration

## Trigger Conditions
Trigger when user says "update database structure," "add new table/field," "generate migration file."

## Execution Flow

### 1. Modify Schema
Add/modify table definitions in `apps/api/src/infrastructure/database/schema.ts`.

Naming conventions: snake_case for tables and columns.

Example:
```typescript
export const newTable = pgTable('new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

2. Generate Migration
Run in apps/api directory:
pnpm drizzle-kit generate

3. Apply Migration
Run in apps/api directory:
pnpm drizzle-kit migrate
````

4. Update Types
   Run GraphQL Codegen to update generated types:
   pnpm graphql-codegen

#### Skill 4: Implement WebSocket Real-time Features

**File Path:** `.trae/skills/websocket-realtime/SKILL.md`

`````markdown
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

````typescript
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


### 5.3 Skills Automatic Activation

TRAE reads each Skill's `description` and `globs` to automatically determine activation:

- When user query matches Skill `description`
- When currently edited file matches `globs` pattern

For instance, editing files under `apps/api/src/modules/` puts the `nestjs-graphql-module` Skill in standby; saying "help me create an order module" activates it, and AI follows the workflow defined in `SKILL.md`.

---

## 6. Create DineFlow Custom Agents

Agents are "AI experts" with specific roles, tools, and prompts, invoked via `@` symbol. For a complex full-stack project like DineFlow, creating specialized agents greatly enhances development efficiency.

### 6.1 Steps to Create an Agent

1. In the TRAE AI dialog, type `@`, then click **Create Agent** at the bottom of the panel.
2. Choose creation method:
   - **Smart Generate (Recommended)**: Enter description, let AI auto-generate agent configuration.
   - **Manual Create**: Manually fill avatar, name, prompt, tool permissions.

### 6.2 Recommended Agents for DineFlow

#### Agent 1: Backend Architect (NestJS + GraphQL)

**Configuration Description** (for Smart Generate):


#### Agent 2: Frontend Component Specialist (Next.js + Tailwind)

**Configuration Description** (for Smart Generate):


#### Agent 3: Database & Migration Specialist

**Configuration Description** (for Smart Generate):


### 6.3 Using Agents

After creation, type `@Backend Architect` in the AI dialog to activate that agent, which will use its dedicated prompt and tools to handle your request.

---

## 7. Configure Automation Workflow (Pipeline)

TRAE supports creating automation pipelines using natural language—no YAML configuration required. This is extremely useful for maintaining code quality in the DineFlow project.

### 7.1 Recommended Pipeline Configuration

In the AI dialog, enter the following commands sequentially to configure automation:

**1. Base Pipeline (Format + Test + Commit on Save)**

/enable pipeline: format + test + conventional-commit

This command:
- Auto-detects ESLint + Prettier configuration
- Links to Jest test configuration
- Executes automatically on file save

**2. Add Type Checking**

/update pipeline: add type-check before test

This adds TypeScript type checking before tests run.

**3. Use Domestic Mirror for Faster Installs (optional)**

/update pipeline: use npmmirror registry


### 7.2 Pipeline Workflow

Once configured, on each file save:
1. Automatically run Prettier + ESLint to fix formatting issues.
2. Run TypeScript type checking.
3. Run affected unit tests (Turborepo-aware).
4. If all pass, automatically stage changes and generate Conventional Commit message.
5. If tests fail, display error and pause commit.

### 7.3 Control Pipeline

```bash
/pause pipeline   # Temporarily pause (for quick experiments)
/resume pipeline  # Resume automation
````
`````

```

```
