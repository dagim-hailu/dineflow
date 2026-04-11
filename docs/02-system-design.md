Here is a comprehensive System Design Document (SDD) for **DineFlow v2.1**, based on the finalized PRD. It covers architecture, data flows, API design, security, and scalability with a focus on clean separation of concerns and production readiness.

---

# System Design Document (SDD): DineFlow v2.1

| Document Status   | Final         |
| :---------------- | :------------ |
| Version           | 1.0           |
| Last Updated      | 2026-04-11    |
| Corresponding PRD | DineFlow v2.1 |

---

## 1. Introduction & Design Goals

This document outlines the technical architecture, component interactions, data models, and security protocols for **DineFlow**, a hybrid QR‑based restaurant ordering system.

### 1.1 Core Design Principles

- **Separation of Concerns:** Clear boundaries between Frontend (Next.js), Backend API (NestJS + GraphQL), and Data Layer (PostgreSQL + Redis).
- **Scalability:** Stateless backend services with Redis caching and horizontal scaling capabilities.
- **Security:** Role‑Based Access Control (RBAC), short‑lived guest tokens, and strict CORS policies.
- **Real‑time Communication:** WebSockets for low‑latency updates between customers, waiters, and kitchen staff.

### 1.2 Technology Stack Summary

| Layer                | Technology                                                       |
| :------------------- | :--------------------------------------------------------------- |
| **Frontend**         | Next.js 14 (App Router), TypeScript, Tailwind CSS, Apollo Client |
| **State Management** | Zustand (client) + Apollo Cache (server)                         |
| **Backend**          | NestJS (Node.js), GraphQL (Code‑First Approach), Socket.io       |
| **Database**         | PostgreSQL 15, Drizzle ORM                                       |
| **Cache & Sessions** | Redis (Upstash / Valkey)                                         |
| **Auth**             | Auth.js v5 (NextAuth.js)                                         |
| **File Storage**     | AWS S3 / MinIO                                                   |
| **Infrastructure**   | Docker, Docker Compose, GitHub Actions (CI)                      |

---

## 2. High‑Level Architecture

The system follows a modular monorepo structure suitable for Dockerized deployment.

```mermaid
graph TD
    subgraph Client
        A[Next.js Frontend<br/>PWA Ready]
    end

    subgraph Edge / CDN
        B[Vercel / Cloudflare]
    end

    subgraph Backend Services
        C[NestJS API<br/>GraphQL + WebSockets]
        D[Redis<br/>Cache & Session Store]
        E[PostgreSQL<br/>Primary Database]
        F[Object Storage<br/>S3 / MinIO]
    end

    A <-->|HTTPS / WSS| B
    B --> C
    C <--> D
    C <--> E
    C <--> F
```

### 2.1 Request Flow Summary

1.  **Static Assets:** Next.js static pages served via CDN.
2.  **API Requests:** GraphQL queries/mutations authenticated via JWT or Guest Session Token.
3.  **Real‑time Events:** WebSocket connections managed by NestJS Gateway, scaled via Redis Adapter.

---

## 3. Frontend Architecture (Next.js)

The frontend is structured to support both **Guest** (SSR) and **Registered** (CSR heavy) experiences efficiently.

### 3.1 Directory Structure

```
apps/web/
├── public/                # Static assets (icons, manifest.json for PWA)
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Login / Register routes
│   │   ├── (menu)/        # Public QR menu routes [tenantId]/[tableId]
│   │   ├── (dashboard)/   # Protected routes for Staff (Waiter, Kitchen, Manager)
│   │   └── api/           # Next.js API routes (Auth.js handlers)
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── menu/          # MenuItem, CartDrawer, SplitBillModal
│   │   └── dashboard/     # TableGrid, KDS View
│   ├── lib/
│   │   ├── apollo-client.ts  # GraphQL client setup
│   │   ├── socket.ts         # Socket.io client wrapper
│   │   └── store/            # Zustand stores (CartStore, NotificationStore)
│   └── types/             # Generated GraphQL types
```

### 3.2 State Management Strategy

- **Guest Cart:** Stored in `localStorage` (Zustand persist middleware). On session expiry or device change, data is lost unless the `guest_session_id` is recovered via Redis.
- **Registered User Cart:** Stored in Apollo Cache, synced with backend on each update.
- **Real‑time Notifications:** Zustand store subscribed to Socket.io events.

### 3.3 PWA Configuration

- `manifest.json` configured with `"display": "standalone"`.
- Service Worker handles caching of menu images for offline menu browsing (read‑only).

---

## 4. Backend Architecture (NestJS)

The backend is organized into feature modules using GraphQL Code‑First approach.

### 4.1 Module Structure

```
apps/api/
├── src/
│   ├── modules/
│   │   ├── auth/           # Auth.js NestJS integration, Guards
│   │   ├── user/           # Profile management, Avatar upload
│   │   ├── menu/           # Item CRUD, Categories
│   │   ├── order/          # Order lifecycle, Cart management
│   │   ├── table/          # QR assignment, Waiter mapping
│   │   ├── notification/   # WebSocket Gateway
│   │   └── analytics/      # Manager reporting
│   ├── common/
│   │   ├── guards/         # GqlAuthGuard, RolesGuard
│   │   ├── decorators/     # @CurrentUser, @Public
│   │   └── scalars/        # DateTime, JSON
│   └── infrastructure/
│       ├── cache/          # Redis service abstraction
│       └── storage/        # S3/MinIO service
```

### 4.2 GraphQL Schema Design (High‑Level)

```graphql
# Queries
type Query {
  menu(tableId: ID!): Menu!
  me: User
  tableStatus(tableId: ID!): TableStatus!
  waiterOrders: [Order!]!
  kitchenQueue: [OrderItem!]!
}

# Mutations
type Mutation {
  # Guest & Cart
  addToCart(input: AddToCartInput!): Cart!
  placeOrder(input: PlaceOrderInput!): Order!

  # Registered User
  updateProfile(input: UpdateProfileInput!): User!
  reorder(orderId: ID!): Cart!

  # Staff
  updateOrderStatus(orderId: ID!, status: OrderStatus!): Order!
  assignWaiter(tableId: ID!, waiterId: ID!): Table!
}

# Subscriptions (WebSockets)
type Subscription {
  orderPlaced(restaurantId: ID!): Order!
  orderStatusChanged(orderId: ID!): Order!
  tableNotification(waiterId: ID!): TableEvent!
}
```

### 4.3 WebSocket Events (Socket.io)

| Event Name      | Emitter  | Payload                                     |
| :-------------- | :------- | :------------------------------------------ |
| `order:new`     | Customer | `{ tableId, items, customerName, avatar }`  |
| `order:status`  | Kitchen  | `{ orderId, status, estimatedTime }`        |
| `table:request` | Customer | `{ tableId, requestType: 'bill'\|'water' }` |

---

## 5. API Structure & Data Flow

### 5.1 Guest Cart & Recovery Flow

This flow leverages **Redis** to bridge the gap between anonymous and registered users.

```mermaid
sequenceDiagram
    participant C as Guest Browser
    participant N as Next.js SSR
    participant API as NestJS GraphQL
    participant R as Redis
    participant DB as PostgreSQL

    C->>N: Scan QR (Table 5)
    N->>API: Query { menu(tableId: 5) }
    API-->>N: Return Menu Data
    N-->>C: Render Menu

    C->>API: Mutation { addToCart(input) }
    API->>R: SET guest:cart:{sessionId} (TTL 15m)

    Note over C: User closes browser

    C->>N: Re-scan QR
    N->>API: Query { checkGuestSession(sessionId) }
    API->>R: GET guest:cart:{sessionId}
    alt Cart Exists
        API-->>N: Return existing cart
        N-->>C: "Restore previous cart?"
    else Cart Expired
        API-->>N: Empty cart
    end
```

### 5.2 Order Placement Flow (Hybrid)

```mermaid
sequenceDiagram
    participant C as Customer
    participant API as Backend
    participant WS as WebSocket Gateway
    participant W as Waiter UI
    participant K as Kitchen UI

    C->>API: placeOrder (cart + guest_session_id)
    API->>DB: Create Order (status: PENDING)
    API->>WS: Emit "order:new"
    WS-->>W: Notification (Table 5 - Guest)
    WS-->>K: Ticket appears in KDS Queue

    K->>API: updateOrderStatus (COOKING)
    API->>WS: Emit "order:status"
    WS-->>C: "Kitchen started your burger"
```

---

## 6. Database Schema (Detailed)

The schema is managed via **Drizzle ORM**, ensuring type safety between TypeScript and PostgreSQL.

```typescript
// schema.ts (Drizzle)

// Enums
export const roleEnum = pgEnum('role', ['admin', 'manager', 'waiter', 'kitchen', 'customer']);
export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'COOKING',
  'READY',
  'SERVED',
  'PAID',
]);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: roleEnum('role').notNull(),
  profileImageUrl: text('profile_image_url'),
  preferences: jsonb('preferences')
    .$type<{ dietary: string[]; allergies: string[]; spicy: boolean }>()
    .default({ dietary: [], allergies: [], spicy: false }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tables (Physical Restaurant Tables)
export const tables = pgTable('tables', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: integer('number').notNull(),
  qrUuid: uuid('qr_uuid').unique().defaultRandom(),
  currentWaiterId: uuid('current_waiter_id').references(() => users.id),
  restaurantId: uuid('restaurant_id').notNull(), // Multi-tenant support
});

// Orders (Core)
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableId: uuid('table_id')
    .references(() => tables.id)
    .notNull(),
  userId: uuid('user_id').references(() => users.id), // Null for pure Guest
  guestSessionId: varchar('guest_session_id', { length: 255 }), // References Redis key
  status: orderStatusEnum('status').notNull().default('PENDING'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Favorites (Many-to-Many)
export const favorites = pgTable(
  'favorites',
  {
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    menuItemId: uuid('menu_item_id').references(() => menuItems.id, {
      onDelete: 'cascade',
    }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.menuItemId] }),
  }),
);
```

### 6.1 Indexing Strategy for Scale

- `orders.table_id` (B‑Tree) for fast table lookup.
- `orders.status` (B‑Tree) for filtering Kitchen Display views.
- `users.email` (Unique B‑Tree).
- **Recommendation:** Use `pg_trgm` extension for fuzzy search on menu item names if required.

---

## 7. Authentication & Security Flow

### 7.1 Hybrid Authentication Strategy

| User Type               | Auth Method              | Token Storage                   | Expiry  |
| :---------------------- | :----------------------- | :------------------------------ | :------ |
| **Staff**               | Email/Password (JWT)     | HTTP‑Only Cookie                | 24h     |
| **Registered Customer** | Email/Password OR OTP    | HTTP‑Only Cookie                | 30 days |
| **Guest**               | Short‑lived Signed Token | `localStorage` (Sent as Header) | 15 min  |

### 7.2 Auth.js (v5) Configuration

- **Providers:** Credentials (Email/Password), Google (Optional).
- **Session Strategy:** JWT (Database session optional).
- **Callbacks:**
  - `jwt`: Enrich token with `role` and `restaurantId`.
  - `session`: Expose only necessary user data to client.

### 7.3 GraphQL Authorization Guard (NestJS)

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req, connection } = ctx.getContext();
    // For WebSockets, token is passed in connectionParams
    return connection?.context?.headers ? connection.context : req;
  }
}

// Custom Decorator
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

### 7.4 Guest Token Security

- Guest tokens are **signed HMAC‑SHA256** with a server secret.
- They contain `{ sessionId: uuid, tableId: uuid, iat, exp }`.
- Backend validates signature and expiry before executing order mutations.

---

## 8. Scalability & Performance Considerations

### 8.1 Horizontal Scaling

- **NestJS Instances:** Stateless. Multiple containers can run behind a load balancer (Nginx / AWS ALB).
- **WebSocket Scaling:** Use `@socket.io/redis-adapter` to synchronize events across multiple NestJS pods.

### 8.2 Caching Strategy (Redis)

| Key Pattern              | TTL    | Purpose                                   |
| :----------------------- | :----- | :---------------------------------------- |
| `menu:{restaurantId}`    | 5 min  | Menu JSON (invalidated on Manager update) |
| `guest:cart:{sessionId}` | 15 min | Guest cart recovery                       |
| `table:lock:{tableId}`   | 30 sec | Prevent concurrent cart editing           |

### 8.3 Database Optimization

- **Read Replicas:** Offload analytics queries (Manager Dashboard) to a replica.
- **Connection Pooling:** PgBouncer configured in Docker stack for efficient connection management.

---

## 9. Infrastructure & Deployment (Docker)

### 9.1 Docker Compose Stack (Development)

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dineflow
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - '9000:9000'
      - '9001:9001'

  api:
    build: ./apps/api
    depends_on: [postgres, redis, minio]
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/dineflow
      REDIS_URL: redis://redis:6379
    ports:
      - '3001:3001'

  web:
    build: ./apps/web
    depends_on: [api]
    ports:
      - '3000:3000'
```

### 9.2 Production Considerations

- **Frontend Hosting:** Vercel (optimized for Next.js) or Dockerized Node server.
- **Backend Hosting:** AWS ECS Fargate or Kubernetes.
- **Database:** AWS RDS PostgreSQL with Multi‑AZ enabled.
- **Redis:** Upstash Redis (serverless) or AWS ElastiCache.

---

## 10. Appendix: Key Data Flows

### 10.1 Smart Upsell Algorithm Flow

1.  **Input:** `userId` + `currentItemId`.
2.  **Query:** Aggregate `order_items` where `user_id = X` and `item_id = currentItemId`.
3.  **Co‑occurrence Count:** Find most frequent `item_id` paired in same `order_id`.
4.  **Threshold:** If co‑occurrence > 70% and item not in cart, trigger GraphQL field `recommendedAddon` in MenuItem resolver.

### 10.2 Split Bill Flow

1.  Customer taps "Split Bill" in cart.
2.  UI displays list of items with dropdowns for "Seat 1", "Seat 2", etc.
3.  On checkout, the system creates **sub‑orders** (linked to parent `order_id`) or adds a `seat_number` column to `order_items`.
4.  Payment can be processed per seat via Stripe Connect or summed and split evenly.

---

_End of System Design Document_
