# Master Prompt Document: DineFlow v2.1

**Purpose:** This document serves as the authoritative, self-contained specification for building the DineFlow application. It is designed to be consumed by an AI code-generation assistant or a development team to produce a production-ready, full-stack web application with zero ambiguity.

---

## 1. Project Overview

**DineFlow** is a web-based, multi-role restaurant management system that connects customers, waiters, kitchen staff, and managers. It supports both anonymous walk-ins (Guest) and loyal registered customers (VIP) via a hybrid authentication system.

**Key Value Proposition:**

- **For Customers:** Scan a QR code, browse a digital menu, order, and pay—no app download required.
- **For Restaurants:** Increase average order value (AOV) with smart upsells, build loyalty through seamless registration incentives, and streamline kitchen operations with a real-time Kitchen Display System (KDS).

**Core Differentiators:**

- **Hybrid Auth:** Guest session tokens (15min TTL) with cart recovery; seamless post-payment conversion to registered account.
- **Real-time WebSockets:** Order status updates from kitchen to customer and waiter dashboards.
- **Personalization:** Dietary preference filtering, allergy warnings, and "Buy it Again" recommendations.

---

## 2. Strict Instructions

You are tasked with generating the complete codebase for DineFlow. **Failure to adhere to the following rules will result in rejection of the output.**

### 2.1 No Placeholder or Stub Code

- Every file must contain **complete, functional, production-grade code**.
- Do not use comments like `// TODO: implement this` or `// Add logic here`.
- All functions, resolvers, components, and services must be fully implemented according to the specifications.

### 2.2 TypeScript Strict Mode

- The entire codebase (frontend and backend) must use **TypeScript** with `strict: true`.
- No use of `any` unless absolutely necessary (e.g., third-party library workarounds). If used, justify with a comment.
- All GraphQL resolvers must use generated types from schema (GraphQL Codegen).

### 2.3 Security First

- **Never expose sensitive data:** Passwords must be hashed with `bcrypt`. JWT secrets must be stored in environment variables.
- **Input Validation:** Use `class-validator` and `class-transformer` in NestJS DTOs. Sanitize all user inputs.
- **CORS:** Configured strictly for the frontend origin.
- **Rate Limiting:** Apply on authentication and order placement endpoints.

### 2.4 Consistent Patterns

- Follow the **module-based architecture** defined in the System Design Document.
- Use **repository pattern** (Drizzle) for database access.
- Use **Data Transfer Objects (DTOs)** for all API inputs.
- Frontend state management: **Zustand** for client state, **Apollo Client** for server state.

### 2.5 Error Handling

- All async operations must be wrapped in `try/catch` blocks.
- GraphQL errors must be thrown as appropriate `GraphQLError` instances with user-friendly messages.
- Frontend must display toast notifications for errors and success states.

### 2.6 Environment Configuration

- Use `.env` files for all secrets and configuration variables.
- Provide a `.env.example` file with all required keys (no real values).

### 2.7 Code Comments

- Comments are mandatory for **complex business logic** (e.g., smart upsell algorithm, guest token validation).
- Use JSDoc style for all public methods and components.

---

## 3. Tech Stack (Locked Versions)

| Layer                  | Technology              | Version    | Justification                         |
| :--------------------- | :---------------------- | :--------- | :------------------------------------ |
| **Package Manager**    | pnpm                    | 9.x        | Fast, disk-efficient monorepo support |
| **Frontend Framework** | Next.js (App Router)    | 15.x       | SSR for fast menu loading, API routes |
| **Frontend Language**  | TypeScript              | 5.x        | Type safety                           |
| **Styling**            | Tailwind CSS            | 3.x        | Utility-first, matches design system  |
| **UI Components**      | shadcn/ui               | Latest     | Accessible, customizable components   |
| **State Management**   | Zustand                 | 4.x        | Lightweight, persist middleware       |
| **GraphQL Client**     | Apollo Client           | 3.x        | Caching, subscriptions                |
| **Backend Framework**  | NestJS                  | 10.x       | Modular, GraphQL support              |
| **API Protocol**       | GraphQL (Code-First)    | -          | Efficient data fetching               |
| **Database ORM**       | Drizzle ORM             | 0.30.x     | Type-safe, lightweight                |
| **Database**           | PostgreSQL              | 15         | Relational integrity                  |
| **Cache & Session**    | Redis                   | 7.x        | Cart recovery, WebSocket scaling      |
| **Auth**               | Auth.js (NextAuth)      | 5.x (beta) | Hybrid JWT + session tokens           |
| **WebSockets**         | Socket.io               | 4.x        | Real-time updates                     |
| **File Storage**       | AWS S3 / MinIO          | -          | Profile and menu images               |
| **Infrastructure**     | Docker / Docker Compose | -          | Consistent environments               |
| **Validation**         | Zod                     | 3.x        | Frontend form validation              |
| **Backend Validation** | class-validator         | 0.14.x     | DTO validation                        |

---

## 4. Code Style Guidelines

### 4.1 Naming Conventions

| Entity                      | Convention                                              | Example                                     |
| :-------------------------- | :------------------------------------------------------ | :------------------------------------------ |
| **Files/Folders**           | kebab-case                                              | `user-profile.tsx`, `auth-guard.ts`         |
| **Components**              | PascalCase                                              | `MenuItemCard`, `TableGrid`                 |
| **Functions/Methods**       | camelCase                                               | `calculateTotalPrice`, `validateGuestToken` |
| **Classes**                 | PascalCase                                              | `AuthService`, `OrderResolver`              |
| **Interfaces/Types**        | PascalCase, prefixed with `I` for interfaces (optional) | `IOrderItem`, `UserPreferences`             |
| **Constants**               | SCREAMING_SNAKE_CASE                                    | `MAX_CART_ITEMS`, `JWT_EXPIRY`              |
| **Environment Variables**   | SCREAMING_SNAKE_CASE                                    | `DATABASE_URL`, `REDIS_URL`                 |
| **Database Tables/Columns** | snake_case                                              | `order_items`, `profile_image_url`          |
| **GraphQL Types/Fields**    | PascalCase / camelCase                                  | `type Menu { items: [MenuItem!]! }`         |

### 4.2 Folder Structure (Monorepo)

```
dineflow/
├── apps/
│   ├── web/                      # Next.js Frontend
│   │   ├── public/
│   │   │   ├── manifest.json     # PWA manifest
│   │   │   └── icons/            # Favicon, app icons
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/       # Auth route group
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── register/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (dashboard)/  # Protected staff routes
│   │   │   │   │   ├── waiter/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── kitchen/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── manager/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (menu)/       # Public QR menu routes
│   │   │   │   │   └── [restaurantSlug]/
│   │   │   │   │       └── [tableId]/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── api/          # Next.js API routes (Auth.js)
│   │   │   │   │   └── auth/
│   │   │   │   │       └── [...nextauth]/
│   │   │   │   │           └── route.ts
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── globals.css   # Tailwind imports
│   │   │   │   └── providers.tsx # Apollo, Auth, Socket providers
│   │   │   ├── components/
│   │   │   │   ├── ui/           # shadcn/ui components (generated)
│   │   │   │   ├── menu/
│   │   │   │   │   ├── MenuItemCard.tsx
│   │   │   │   │   ├── CategoryTabs.tsx
│   │   │   │   │   └── CartDrawer.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── TableGrid.tsx
│   │   │   │   │   └── KdsOrderQueue.tsx
│   │   │   │   ├── forms/
│   │   │   │   │   ├── ReservationForm.tsx
│   │   │   │   │   └── ProfileForm.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── AvatarUpload.tsx
│   │   │   │       └── SplitBillModal.tsx
│   │   │   ├── lib/
│   │   │   │   ├── apollo-client.ts  # Apollo Client setup
│   │   │   │   ├── socket.ts         # Socket.io client instance
│   │   │   │   ├── auth.ts           # Auth.js client helpers
│   │   │   │   └── utils.ts          # Generic helpers
│   │   │   ├── hooks/
│   │   │   │   ├── useSocket.ts
│   │   │   │   ├── useCart.ts        # Zustand store hook
│   │   │   │   └── useAuth.ts
│   │   │   ├── store/
│   │   │   │   ├── cartStore.ts      # Zustand store with persist
│   │   │   │   └── notificationStore.ts
│   │   │   ├── graphql/              # Auto-generated types & documents
│   │   │   │   ├── queries/
│   │   │   │   ├── mutations/
│   │   │   │   └── subscriptions/
│   │   │   └── types/                # Shared TypeScript types
│   │   ├── .env.local.example
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── package.json
│   │
│   └── api/                          # NestJS Backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   │   ├── gql-auth.guard.ts
│       │   │   │   └── roles.guard.ts
│       │   │   ├── decorators/
│       │   │   │   ├── current-user.decorator.ts
│       │   │   │   └── public.decorator.ts
│       │   │   ├── filters/
│       │   │   │   └── http-exception.filter.ts
│       │   │   ├── interceptors/
│       │   │   │   └── logging.interceptor.ts
│       │   │   └── scalars/
│       │   │       └── date.scalar.ts
│       │   ├── infrastructure/
│       │   │   ├── database/
│       │   │   │   ├── drizzle.module.ts
│       │   │   │   ├── drizzle.provider.ts
│       │   │   │   └── schema.ts        # Drizzle ORM schema
│       │   │   ├── cache/
│       │   │   │   ├── redis.module.ts
│       │   │   │   └── redis.service.ts
│       │   │   ├── storage/
│       │   │   │   ├── storage.module.ts
│       │   │   │   └── s3.service.ts
│       │   │   └── config/
│       │   │       └── configuration.ts
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.resolver.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── login.input.ts
│       │   │   │   │   └── register.input.ts
│       │   │   │   └── strategies/
│       │   │   │       └── jwt.strategy.ts
│       │   │   ├── user/
│       │   │   │   ├── user.module.ts
│       │   │   │   ├── user.resolver.ts
│       │   │   │   ├── user.service.ts
│       │   │   │   └── dto/
│       │   │   │       └── update-profile.input.ts
│       │   │   ├── menu/
│       │   │   │   ├── menu.module.ts
│       │   │   │   ├── menu.resolver.ts
│       │   │   │   ├── menu.service.ts
│       │   │   │   └── dto/
│       │   │   │       ├── create-item.input.ts
│       │   │   │       └── update-item.input.ts
│       │   │   ├── order/
│       │   │   │   ├── order.module.ts
│       │   │   │   ├── order.resolver.ts
│       │   │   │   ├── order.service.ts
│       │   │   │   └── dto/
│       │   │   │       ├── add-to-cart.input.ts
│       │   │   │       └── place-order.input.ts
│       │   │   ├── table/
│       │   │   │   ├── table.module.ts
│       │   │   │   ├── table.resolver.ts
│       │   │   │   └── table.service.ts
│       │   │   ├── notification/
│       │   │   │   ├── notification.module.ts
│       │   │   │   ├── events.gateway.ts
│       │   │   │   └── dto/
│       │   │   │       └── notification.dto.ts
│       │   │   └── analytics/
│       │   │       ├── analytics.module.ts
│       │   │       └── analytics.resolver.ts
│       │   └── graphql/                 # Generated GraphQL types (output)
│       ├── .env.example
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                            # Shared packages (if needed)
│   └── types/                           # Shared TypeScript types across apps
│
├── docker-compose.yml
├── Dockerfile.web
├── Dockerfile.api
├── .eslintrc.js
├── .prettierrc
├── pnpm-workspace.yaml
└── README.md
```

### 4.3 Code Snippet Examples (Mandatory Style)

**Backend Service (NestJS):**

```typescript
// apps/api/src/modules/order/order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../infrastructure/database/drizzle.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { orders, orderItems } from '../../infrastructure/database/schema';
import { PlaceOrderInput } from './dto/place-order.input';
import { eq } from 'drizzle-orm';

@Injectable()
export class OrderService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Places an order for either a registered user or a guest.
   * Handles cart validation, inventory check, and emits a WebSocket event.
   */
  async placeOrder(input: PlaceOrderInput, userId?: string, guestSessionId?: string) {
    // Validate cart items exist and are available
    // Calculate total
    // Insert order and items in transaction
    // Clear cart from Redis if guest
    // Emit event via EventsGateway (injected)
  }
}
```

**Frontend Component (Next.js):**

```tsx
// apps/web/src/components/menu/MenuItemCard.tsx
'use client';

import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { MenuItem } from '@/graphql/generated/graphql';

interface MenuItemCardProps {
  item: MenuItem;
  isGuest: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, isGuest }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
      {item.imageUrl && (
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-md" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500 italic">{item.description}</p>
        <span className="text-primary font-bold">${item.price.toFixed(2)}</span>
      </div>
      <button
        onClick={handleAddToCart}
        className="bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-yellow-500 transition"
      >
        Add
      </button>
    </div>
  );
};
```

---

## 5. Output Format & Delivery Instructions

### 5.1 Delivery Method

The output must be a **single ZIP archive** containing the complete monorepo as described in Section 4.2. The root of the ZIP should contain the `dineflow/` folder.

### 5.2 Required Files Checklist

The following files **must** be present and fully implemented:

- [ ] `docker-compose.yml` (with PostgreSQL, Redis, MinIO, API, Web services)
- [ ] `apps/api/src/infrastructure/database/schema.ts` (Complete Drizzle schema)
- [ ] `apps/api/src/modules/auth/auth.service.ts` (Full JWT + Guest token logic)
- [ ] `apps/api/src/modules/order/order.resolver.ts` (All mutations with guards)
- [ ] `apps/api/src/modules/notification/events.gateway.ts` (Socket.io handlers)
- [ ] `apps/web/src/app/(menu)/[restaurantSlug]/[tableId]/page.tsx` (QR landing)
- [ ] `apps/web/src/lib/apollo-client.ts` (With auth link and WebSocket link)
- [ ] `apps/web/src/store/cartStore.ts` (Zustand store with persist)
- [ ] `apps/web/src/components/menu/CartDrawer.tsx` (Full cart UI with split bill)
- [ ] `apps/web/src/app/(dashboard)/waiter/page.tsx` (Waiter dashboard)
- [ ] `apps/web/src/app/(dashboard)/kitchen/page.tsx` (KDS view)
- [ ] `.env.example` for both `web` and `api`

### 5.3 Environment Variables (.env.example)

**API (`apps/api/.env.example`):**

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dineflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
AUTH_SECRET=your-auth-secret-for-nextauth
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=dineflow
PORT=3001
```

**Web (`apps/web/.env.example`):**

```
NEXT_PUBLIC_API_URL=http://localhost:3001/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-auth-secret-for-nextauth
```

### 5.4 Production Readiness Checklist

Before finalizing the output, ensure:

- [ ] All database migrations are generated (`drizzle-kit generate`).
- [ ] GraphQL schema is generated from code (`graphql-codegen`).
- [ ] No `console.log` statements remain (use proper logger).
- [ ] All `try/catch` blocks include proper error handling and user-facing messages.
- [ ] WebSocket connections include reconnection logic and heartbeat.
- [ ] Docker containers start successfully with `docker-compose up`.
- [ ] README.md includes clear setup instructions.

---

## 6. Key Algorithm Implementations (Must be Exact)

### 6.1 Guest Cart Recovery (Redis)

```typescript
// Pseudo-code for exact implementation
const CART_TTL = 15 * 60; // 15 minutes

async function getGuestCart(sessionId: string): Promise<Cart | null> {
  const data = await redis.get(`guest:cart:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

async function saveGuestCart(sessionId: string, cart: Cart): Promise<void> {
  await redis.setex(`guest:cart:${sessionId}`, CART_TTL, JSON.stringify(cart));
}
```

### 6.2 Smart Upsell Logic

- Query: Get all `order_items` for the user.
- Group by `order_id` to find item pairs.
- Count co-occurrences of current item with other items.
- Return the item with highest co-occurrence percentage > 70%.

### 6.3 Allergy Warning

- When adding item to cart, check `item.allergens` array against `user.preferences.allergies`.
- If intersection exists, return a `warning` field in GraphQL response; frontend displays modal.

---

## 7. Final Directive

**Generate the complete codebase now.** Adhere strictly to every instruction in this document. The output must be a production-ready, fully functional application that can be started with `docker-compose up` and immediately used.

Do not include any explanatory text outside the code files. The ZIP archive should contain only the codebase.
