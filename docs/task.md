# DineFlow E2E Connection Tasks

## Backend

- [ ] Verify RegisterInput DTO fields (name vs displayName)
- [ ] Add `kitchenOrders` query to order resolver + service
- [ ] Create table module (resolver, service, module)
- [ ] Register TableModule in app.module.ts
- [ ] Add staff seed users (manager, waiter, kitchen)
- [ ] Fix `updateOrderStatus` field name consistency

## Frontend — GraphQL Operations

- [ ] Fix cart.ts — rename `getCart` → `cart`
- [ ] Create lib/graphql/orders.ts
- [ ] Create lib/graphql/tables.ts
- [ ] Create lib/graphql/profile.ts

## Frontend — Stores & Hooks

- [ ] Fix cartStore.ts — local-first with server sync
- [ ] Rewrite useSocket.ts — socket.io-client
- [ ] Create useStaffSocket.ts

## Frontend — Pages

- [ ] Fix profile/page.tsx — connect to me + updateProfile
- [ ] Fix orders/page.tsx — fix totalAmount field
- [ ] Fix track/[orderId]/page.tsx — socket.io listener
- [ ] Fix waiter/page.tsx — socket.io + real tables query
- [ ] Fix kitchen/page.tsx — fix args, socket.io, kitchenOrders
- [ ] Fix manager/page.tsx — real menu CRUD + staff
- [ ] Fix drinks/page.tsx — wire Order button
- [ ] Fix middleware.ts — protect profile/orders
- [ ] Fix next.config.mjs — add localhost remotePattern

## Verification

- [ ] Check socket.io-client in web package.json
- [ ] docker compose build
- [ ] Run seed
- [ ] Manual smoke test
