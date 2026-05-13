# DineFlow: Full-Stack End-to-End Connection

## Overview

The audit reveals the frontend and backend exist but have multiple disconnects — wrong GraphQL field names, missing backend queries, broken subscriptions, mock data in place of real queries, and an incompatible WebSocket implementation. This plan fixes every layer for a fully working end-to-end system.

---

## User Review Required

> [!WARNING]
> **WebSocket Architecture Decision**: The backend uses **Socket.io** (`/events` namespace), but the frontend `useSocket.ts` uses the **native browser WebSocket API** which is incompatible with Socket.io's protocol. The fix requires adding the `socket.io-client` npm package to the frontend and rewriting `useSocket.ts`. This plan does this.

> [!IMPORTANT]
> **GraphQL Subscriptions vs Socket.io**: The backend has GraphQL `orderCreated` and `orderStatusChanged` subscriptions defined but they **return `null`** (not connected to PubSub). The Socket.io gateway IS fully implemented and emits the right events. The plan replaces broken Apollo `useSubscription` calls on the Kitchen/Waiter/Track pages with Socket.io listeners — which are actually implemented on the backend.

> [!IMPORTANT]
> **No Table/Staff Modules in Backend**: The waiter page queries `tables` and kitchen queries `kitchenOrders` — neither exist in the backend. These queries must be added to the existing `OrderResolver` and a simple `TableResolver`.

> [!CAUTION]
> **Seed adds staff users**: The current seed only creates `test@example.com` (customer). A manager, waiter, and kitchen staff user will be added so all dashboards can be tested.

---

## Bugs Found (Audit Summary)

| #   | Location                | Issue                                                                       | Fix                               |
| --- | ----------------------- | --------------------------------------------------------------------------- | --------------------------------- |
| 1   | `lib/graphql/cart.ts`   | `GET_CART` queries `getCart` but backend exposes as `cart`                  | Rename query                      |
| 2   | `store/cartStore.ts`    | `syncCart()` fetches cart but never updates local `items` state             | Fix sync logic                    |
| 3   | `store/cartStore.ts`    | `addItem()` calls server first, cart stays empty on failure                 | Make local-first with server sync |
| 4   | `kitchen/page.tsx`      | `updateOrderStatus` sends `orderId: String!` but resolver expects `id: ID!` | Fix arg name                      |
| 5   | `kitchen/page.tsx`      | Queries `kitchenOrders` — not in backend                                    | Add backend query                 |
| 6   | `kitchen/page.tsx`      | Uses Apollo `useSubscription` for `orderUpdated` — not implemented          | Switch to Socket.io               |
| 7   | `waiter/page.tsx`       | Queries `tables` — no table resolver in backend                             | Add backend query                 |
| 8   | `waiter/page.tsx`       | Uses Apollo `useSubscription` for `orderCreated` — not implemented          | Switch to Socket.io               |
| 9   | `profile/page.tsx`      | 100% hardcoded mock data, no GraphQL                                        | Connect to `me` + `updateProfile` |
| 10  | `manager/page.tsx`      | Placeholder content only                                                    | Connect menu CRUD, staff list     |
| 11  | `hooks/useSocket.ts`    | Uses native `new WebSocket()` against a Socket.io server                    | Rewrite with `socket.io-client`   |
| 12  | `drinks/page.tsx`       | "Order" button has no `onClick`                                             | Wire to cart store                |
| 13  | `orders/page.tsx`       | Queries `totalPrice` but backend has `totalAmount`                          | Fix field name                    |
| 14  | `middleware.ts`         | Does not protect `/profile` or `/orders`                                    | Add protection                    |
| 15  | Backend seed            | Only customer user, no staff users                                          | Add waiter/kitchen/manager        |
| 16  | Backend                 | No `tables` query                                                           | Add to new resolver               |
| 17  | Backend                 | No `kitchenOrders` query                                                    | Add to order resolver             |
| 18  | Backend                 | `myOrders` returns `totalPrice` in model but schema says `totalAmount`      | Verify/fix model field            |
| 19  | `authStore.ts` register | Sends `displayName` but backend `RegisterInput` may expect `name`           | Verify DTO fields                 |

---

## Proposed Changes

### Backend — `apps/api/`

#### [MODIFY] [order.resolver.ts](file:///home/dhz/PROJECTS/our/dineflow/apps/api/src/modules/order/order.resolver.ts)

- Add `kitchenOrders` query: returns orders with status PENDING/COOKING/READY for any restaurant (staff-protected)
- Fix `updateOrderStatus` to ensure field naming consistency
- Add `tableNumber` field resolution via the joined `table` record

#### [MODIFY] [order.service.ts](file:///home/dhz/PROJECTS/our/dineflow/apps/api/src/modules/order/order.service.ts)

- Add `getKitchenOrders(restaurantId?: string)` method filtering by active statuses

#### [NEW] `apps/api/src/modules/table/table.resolver.ts`

- Add `tables` query (staff-protected): returns all tables with number, status, currentWaiterId
- Add simple `tableModule` wiring

#### [NEW] `apps/api/src/modules/table/table.service.ts`

- `getTables(restaurantId?: string)` — queries the existing `tables` DB table

#### [MODIFY] [app.module.ts](file:///home/dhz/PROJECTS/our/dineflow/apps/api/src/app.module.ts)

- Register new `TableModule`

#### [MODIFY] [seed.ts](file:///home/dhz/PROJECTS/our/dineflow/apps/api/src/scripts/seed.ts)

- Add seed staff users: `manager@example.com / password` (manager), `waiter@example.com / password` (waiter), `kitchen@example.com / password` (kitchen)

---

### Frontend — `apps/web/`

#### [MODIFY] [lib/graphql/cart.ts](file:///home/dhz/PROJECTS/our/dineflow/apps/web/lib/graphql/cart.ts)

- Rename `getCart` query field to `cart` to match backend resolver

#### [NEW] `apps/web/lib/graphql/orders.ts`

- `GET_MY_ORDERS` — with correct `totalAmount` field
- `GET_ORDER` — single order by ID
- `ORDER_STATUS_SUBSCRIPTION` — Apollo subscription (for track page if WS works)
- `REORDER` mutation

#### [NEW] `apps/web/lib/graphql/tables.ts`

- `GET_TABLES` — returns table list for waiter dashboard
- `GET_KITCHEN_ORDERS` — for kitchen dashboard

#### [NEW] `apps/web/lib/graphql/profile.ts`

- `UPDATE_PROFILE` mutation
- Re-export `GET_CURRENT_USER`

#### [MODIFY] [store/cartStore.ts](file:///home/dhz/PROJECTS/our/dineflow/apps/web/store/cartStore.ts)

- Make cart **local-first** with optimistic updates (avoids auth dependency for guest ordering)
- `addItem()`: update local state immediately, then fire GraphQL mutation (fire-and-forget)
- `placeOrder()`: calls `PLACE_ORDER` mutation, clears local cart
- `syncCart()`: properly maps server cart items to local `CartItem[]` format

#### [MODIFY] [hooks/useSocket.ts](file:///home/dhz/PROJECTS/our/dineflow/apps/web/hooks/useSocket.ts)

- Replace native `WebSocket` with `socket.io-client` (package already likely in deps or needs install)
- Export typed event emitter helpers: `onOrderNew`, `onOrderStatus`, `onTableRequest`
- Connect to `ws://localhost/events` namespace (or `NEXT_PUBLIC_WS_URL`)

#### [NEW] `apps/web/hooks/useStaffSocket.ts`

- Composable hook for staff pages using the Socket.io connection
- Handles auth handshake with JWT token from authStore

#### [MODIFY] [app/(customer)/profile/page.tsx](<file:///home/dhz/PROJECTS/our/dineflow/apps/web/app/(customer)/profile/page.tsx>)

- Replace all mock data with real `me` query
- Connect Save to `updateProfile` mutation
- Pre-populate name/email from user data

#### [MODIFY] [app/(customer)/orders/page.tsx](<file:///home/dhz/PROJECTS/our/dineflow/apps/web/app/(customer)/orders/page.tsx>)

- Fix `totalPrice` → `totalAmount` in GraphQL query
- Fix `table { number }` field if backend model exposes differently

#### [MODIFY] [app/(customer)/track/[orderId]/page.tsx](<file:///home/dhz/PROJECTS/our/dineflow/apps/web/app/(customer)/track/%5BorderId%5D/page.tsx>)

- Replace broken Apollo subscription with Socket.io `order:status` event listener
- Query `order(id)` on mount and update state on socket events

#### [MODIFY] [app/(staff)/waiter/page.tsx](<file:///home/dhz/PROJECTS/our/dineflow/apps/web/app/(staff)/waiter/page.tsx>)

- Replace Apollo `useSubscription` with Socket.io listeners via `useStaffSocket`
- Fix `tables` query to use new `GET_TABLES` operation

#### [MODIFY] [app/(staff)/kitchen/page.tsx](<file:///home/dhz/PROJECTS/our/dineflow/apps/web/app/(staff)/kitchen/page.tsx>)

- Fix `updateOrderStatus` arg: `orderId` → `id`
- Replace Apollo `useSubscription` with Socket.io listeners
- Fix `kitchenOrders` query to use new backend query

#### [MODIFY] [app/(staff)/manager/page.tsx](<file:///home/dhz/PROJECTS/our/dineflow/apps/web/app/(staff)/manager/page.tsx>)

- Connect menu CRUD tab to real `menu(tableId)`, `createMenuItem`, `updateMenuItem`, `deleteMenuItem`
- Connect staff tab to `GET_STAFF` query (users with staff roles)
- Analytics tab: show basic order count summary

#### [MODIFY] [app/drinks/page.tsx](file:///home/dhz/PROJECTS/our/dineflow/apps/web/app/drinks/page.tsx)

- Wire "Order" button onClick to `useCartStore().addItem()`
- Add guest session initialization if no session cookie

#### [MODIFY] [middleware.ts](file:///home/dhz/PROJECTS/our/dineflow/apps/web/middleware.ts)

- Add protection for `/profile` and `/orders` — redirect to `/login`
- Fix redirect target from `/staff/login` to `/login` (that page exists, `/staff/login` doesn't have a page)

#### [MODIFY] [next.config.mjs](file:///home/dhz/PROJECTS/our/dineflow/apps/web/next.config.mjs)

- Add `localhost` to `remotePatterns` for local MinIO image hosting

---

## Open Questions

> [!IMPORTANT]
> **Socket.io client package**: Does `apps/web/package.json` already include `socket.io-client`? If not, it will need `pnpm add socket.io-client --filter web`. This will be checked and added as needed.

> [!IMPORTANT]
> **`displayName` vs `name`**: The backend DB schema uses `name` (not `displayName`). The auth model/DTO may alias it to `displayName` in GraphQL. This will be verified against the actual `RegisterInput` DTO and `User` GQL model before touching the frontend.

---

## Verification Plan

### Automated Build Check

```bash
docker compose build --no-cache
docker compose up -d
docker compose exec api node dist/scripts/seed.js
```

### Manual E2E Verification

1. **Homepage** → `http://localhost` — menu loads with categories (Breakfast, Lunch, Dinner, Drinks)
2. **Drinks page** → `/drinks` — drinks menu loads, "Order" button adds item to cart (toast appears)
3. **Login** → `/login` with `test@example.com / password` — success, redirects to `/`
4. **Login (manager)** → `/login` with `manager@example.com / password` — redirects to `/manager`
5. **Profile** → `/profile` — shows real user name/email
6. **Orders** → `/orders` — shows order history (empty for new user)
7. **Place order** → Add items to cart → Place Order → redirect to `/track/[id]`
8. **Waiter** → `/login` as `waiter@example.com`, then `/waiter` — table grid appears
9. **Kitchen** → `/login` as `kitchen@example.com`, then `/kitchen` — order cards appear
10. **Manager menu editor** → `/manager` → Menu tab — items list with edit/delete
11. **Real-time** → Place order as customer, observe new order appear in `/kitchen` and `/waiter` via Socket.io

### Files Modified/Created Summary

**Backend (8 files):**

- `order.resolver.ts` (modify)
- `order.service.ts` (modify)
- `table/table.resolver.ts` (new)
- `table/table.service.ts` (new)
- `table/table.module.ts` (new)
- `app.module.ts` (modify)
- `seed.ts` (modify)
- `modules/auth/dto/register.input.ts` (verify/fix if needed)

**Frontend (14 files):**

- `lib/graphql/cart.ts` (modify)
- `lib/graphql/orders.ts` (new)
- `lib/graphql/tables.ts` (new)
- `lib/graphql/profile.ts` (new)
- `store/cartStore.ts` (modify)
- `hooks/useSocket.ts` (rewrite)
- `hooks/useStaffSocket.ts` (new)
- `app/(customer)/profile/page.tsx` (rewrite)
- `app/(customer)/orders/page.tsx` (modify)
- `app/(customer)/track/[orderId]/page.tsx` (modify)
- `app/(staff)/waiter/page.tsx` (modify)
- `app/(staff)/kitchen/page.tsx` (modify)
- `app/(staff)/manager/page.tsx` (modify)
- `app/drinks/page.tsx` (modify)
- `middleware.ts` (modify)
- `next.config.mjs` (modify)
