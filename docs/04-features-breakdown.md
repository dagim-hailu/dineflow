# Features Breakdown Document: DineFlow v2.1

**Version:** 1.0  
**Date:** 2026-04-11  
**Purpose:** Decompose high-level features into actionable development tasks for sprint planning and implementation tracking.

---

## 1. Feature Map Overview

| Epic / Module                      | Major Feature                 | Sub-Features (Tasks)                                                                                                                                                                       |
| :--------------------------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication & Authorization** | Hybrid Auth System            | 1.1 Email/Password Registration & Login<br>1.2 Guest Session Management<br>1.3 Role-Based Access Control (RBAC)<br>1.4 Magic Link Invites for Staff<br>1.5 Post-Payment Account Conversion |
| **Profile Management**             | User Profiles & Avatars       | 2.1 Avatar Upload & Cropping<br>2.2 Profile Data CRUD<br>2.3 Dietary Preferences Management<br>2.4 Waiter Bio & Shift Status                                                               |
| **Menu System**                    | Menu Management & Display     | 3.1 Menu Item CRUD with Image Upload<br>3.2 Category & Tab Navigation<br>3.3 Dynamic Menu Rendering (QR Context)<br>3.4 Personalization Filters (Registered Users)                         |
| **Ordering & Cart**                | Guest & Registered Order Flow | 4.1 Cart Management (LocalStorage & Server)<br>4.2 Order Placement & Validation<br>4.3 Split Bill Interface<br>4.4 Order History & "Order Again"                                           |
| **Waiter Dashboard**               | Table & Order Management      | 5.1 Table Grid View with Timers<br>5.2 Order Notifications & Status Updates<br>5.3 Customer Identification (Avatar + Preferences)<br>5.4 Service Request Handling                          |
| **Kitchen Display System (KDS)**   | Real-time Order Ticketing     | 6.1 Order Queue Display<br>6.2 Status Updates (Cooking → Ready)<br>6.3 Item "86" (Disable) Functionality<br>6.4 Estimated Time Display                                                     |
| **Notifications & WebSockets**     | Real-time Communication       | 7.1 WebSocket Gateway Setup<br>7.2 Event Subscription Management<br>7.3 Push Notifications for Order Status Changes                                                                        |
| **Loyalty & Smart Features**       | Personalization & Retention   | 8.1 Smart Upsell Algorithm<br>8.2 Allergy Warning System<br>8.3 Guest Cart Recovery<br>8.4 Priority Waitlist (Registered Users)                                                            |
| **Manager & Admin Panel**          | Staff & Analytics             | 9.1 Staff Onboarding (Invite Links)<br>9.2 Menu Engineering Dashboard<br>9.3 Performance Analytics & Reporting<br>9.4 System Health Monitoring                                             |

---

## 2. Detailed Feature Breakdown

### 2.1 Authentication & Authorization

**Feature:** Hybrid Authentication System (Guest + Registered)

| Task ID     | Task Name                         | Description                                                                                                                              | Dependencies      | Est. Effort |
| :---------- | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :---------- |
| **AUTH-01** | Setup Auth.js v5 with NestJS      | Integrate Auth.js (NextAuth) handlers in Next.js API routes; configure JWT and session callbacks.                                        | None              | 3 pts       |
| **AUTH-02** | Email/Password Registration       | Create registration form with validation (email format, password strength); hash password using bcrypt; store in `users` table.          | AUTH-01           | 2 pts       |
| **AUTH-03** | Email/Password Login              | Create login form; validate credentials; issue JWT stored in HTTP-only cookie.                                                           | AUTH-02           | 2 pts       |
| **AUTH-04** | Guest Session Token Generation    | On QR scan (if no active session), generate short-lived signed token (HMAC-SHA256) containing `sessionId`, `tableId`, expiry (15 min).   | AUTH-01           | 2 pts       |
| **AUTH-05** | Guest Token Validation Middleware | Backend middleware to verify guest token signature and expiry; attach `guestSessionId` to request context.                               | AUTH-04           | 2 pts       |
| **AUTH-06** | Role-Based Access Control (RBAC)  | Implement `RolesGuard` in NestJS; define permissions matrix (Admin, Manager, Waiter, Kitchen, Customer).                                 | AUTH-01           | 3 pts       |
| **AUTH-07** | Magic Link Invites for Staff      | Manager triggers invite email with unique signed token; staff clicks to set password; link expires in 24h.                               | AUTH-06           | 3 pts       |
| **AUTH-08** | Post-Payment Account Conversion   | After guest order completion, prompt: "Save history? Create account"; link existing guest cart/order to new user via `guest_session_id`. | AUTH-05, ORDER-05 | 2 pts       |

---

### 2.2 Profile Management

**Feature:** User Profiles & Avatars

| Task ID     | Task Name                        | Description                                                                                                                            | Dependencies | Est. Effort |
| :---------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :----------- | :---------- |
| **PROF-01** | Avatar Upload Endpoint           | NestJS endpoint to accept multipart/form-data; validate file type (JPG/PNG) and size (<2MB); generate unique filename.                 | STORAGE-01   | 2 pts       |
| **PROF-02** | Image Storage Service            | Integrate with S3/MinIO; upload file and return public URL; save URL to `users.profile_image_url`.                                     | PROF-01      | 2 pts       |
| **PROF-03** | Frontend Crop & Upload Component | React component using `react-image-crop`; allow user to crop square avatar before upload.                                              | PROF-01      | 3 pts       |
| **PROF-04** | Profile Data CRUD                | GraphQL mutations/queries for updating `display_name`, `bio`, `preferences` JSON field.                                                | AUTH-01      | 2 pts       |
| **PROF-05** | Dietary Preferences UI           | Multi-select chips for dietary restrictions (Vegan, Vegetarian, Gluten-Free) and allergies (Nuts, Dairy); store in `preferences` JSON. | PROF-04      | 2 pts       |
| **PROF-06** | Waiter Bio & Shift Status        | Waiter can set a short bio (e.g., "I recommend the Tiramisu!") and toggle "On Shift" status.                                           | PROF-04      | 2 pts       |

---

### 2.3 Menu System

**Feature:** Menu Management & Dynamic Display

| Task ID     | Task Name                           | Description                                                                                                                                                           | Dependencies      | Est. Effort |
| :---------- | :---------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :---------- |
| **MENU-01** | Menu Item Database Schema           | Define `menu_items` table with fields: `id`, `restaurant_id`, `name`, `description`, `price`, `category`, `image_url`, `is_available`, `spicy_level`, `dietary_tags`. | None              | 1 pt        |
| **MENU-02** | Menu Item CRUD (Manager)            | GraphQL resolvers for creating, updating, deleting items; restrict to Manager role.                                                                                   | MENU-01, AUTH-06  | 3 pts       |
| **MENU-03** | Image Upload for Menu Items         | Reuse image upload service; associate image URL with menu item.                                                                                                       | PROF-02           | 2 pts       |
| **MENU-04** | Public Menu Query (QR Context)      | GraphQL query `menu(tableId)` returns items filtered by restaurant, with caching via Redis (TTL 5 min).                                                               | MENU-01, CACHE-01 | 2 pts       |
| **MENU-05** | Category Tabs on Frontend           | Dynamic tab generation from item categories; active tab styling with orange underline.                                                                                | MENU-04           | 2 pts       |
| **MENU-06** | Personalization Filter (Registered) | If user has `spicy_preference` or allergies, apply client-side filtering/highlighting on menu items.                                                                  | PROF-05           | 2 pts       |
| **MENU-07** | "86" Item (Kitchen)                 | Kitchen staff can toggle `is_available = false` with optional reason note; instantly reflected in menu query.                                                         | MENU-02, AUTH-06  | 2 pts       |

---

### 2.4 Ordering & Cart

**Feature:** Guest & Registered Order Flow

| Task ID     | Task Name                      | Description                                                                                                                             | Dependencies      | Est. Effort |
| :---------- | :----------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :---------- |
| **CART-01** | Cart Schema & State (Frontend) | Zustand store with persistence for guest (localStorage) and server sync for registered users.                                           | None              | 3 pts       |
| **CART-02** | Add to Cart Mutation           | GraphQL mutation validates item availability; for guests, store in Redis with `guest_session_id` key; for users, store in DB.           | CART-01, AUTH-05  | 3 pts       |
| **CART-03** | Guest Cart Recovery            | On QR scan, check Redis for `guest:cart:{sessionId}`; if exists, prompt "Restore cart?" and hydrate Zustand store.                      | CART-02, CACHE-01 | 2 pts       |
| **CART-04** | Place Order Mutation           | Validate cart items, calculate total, create `order` record; for guests, link via `guest_session_id`; emit WebSocket event `order:new`. | CART-02, WS-01    | 4 pts       |
| **CART-05** | Split Bill Interface           | UI component to assign items to "Seat 1", "Seat 2", etc.; store `seat_number` on `order_items`; allow separate or even split payment.   | CART-04           | 5 pts       |
| **CART-06** | Order History Page             | Registered users view past orders; each order has "Order Again" button that repopulates cart.                                           | CART-04, AUTH-01  | 3 pts       |

---

### 2.5 Waiter Dashboard

**Feature:** Table & Order Management

| Task ID       | Task Name                             | Description                                                                                                                | Dependencies       | Est. Effort |
| :------------ | :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------- | :----------------- | :---------- |
| **WAITER-01** | Table Grid View Component             | Fetch assigned tables via GraphQL; display as cards with number, seated timer (color-coded), customer avatar, last action. | AUTH-06, TABLES-01 | 4 pts       |
| **WAITER-02** | Seated Timer Logic                    | Timer starts when customer scans QR (or order placed); uses WebSocket to sync across devices; color changes at thresholds. | WAITER-01, WS-01   | 2 pts       |
| **WAITER-03** | Order Notifications Subscription      | Subscribe to `orderPlaced(waiterId)`; display toast with table number and customer name.                                   | WS-01              | 2 pts       |
| **WAITER-04** | Update Order Status (Waiter)          | Mutation to mark order as `SERVED` or `PAID`; triggers WebSocket update to Kitchen (remove from queue).                    | CART-04, WS-01     | 2 pts       |
| **WAITER-05** | Service Request Handling              | Customer can request "Water" or "Bill"; subscription `tableNotification` pushes to Waiter dashboard.                       | WS-01              | 3 pts       |
| **WAITER-06** | Customer Identification on Order Card | Display registered customer avatar and dietary alerts on order detail modal.                                               | PROF-05            | 2 pts       |

---

### 2.6 Kitchen Display System (KDS)

**Feature:** Real-time Order Ticketing

| Task ID    | Task Name                     | Description                                                                                                 | Dependencies   | Est. Effort |
| :--------- | :---------------------------- | :---------------------------------------------------------------------------------------------------------- | :------------- | :---------- |
| **KDS-01** | KDS View Component            | Full-screen view optimized for kitchen; displays list of active orders sorted by time.                      | AUTH-06        | 3 pts       |
| **KDS-02** | Order Queue Subscription      | Subscribe to `orderPlaced(restaurantId)`; add new order to queue.                                           | WS-01          | 2 pts       |
| **KDS-03** | Update Order Status (Kitchen) | Kitchen can move order from `PENDING` → `COOKING` → `READY`; emits `orderStatusChanged` event.              | CART-04, WS-01 | 2 pts       |
| **KDS-04** | Item "86" Toggle              | Button on menu item (or quick action) to set `is_available = false` with optional note; confirmation modal. | MENU-07        | 2 pts       |
| **KDS-05** | Estimated Time Display        | Kitchen can input estimated minutes for order; displayed to customer via WebSocket.                         | KDS-03         | 2 pts       |

---

### 2.7 Notifications & WebSockets

**Feature:** Real-time Communication Infrastructure

| Task ID   | Task Name                            | Description                                                                                                    | Dependencies     | Est. Effort |
| :-------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------- | :--------------- | :---------- |
| **WS-01** | NestJS WebSocket Gateway Setup       | Create `EventsGateway` using `@nestjs/websockets` and Socket.io; configure CORS and authentication middleware. | None             | 3 pts       |
| **WS-02** | Redis Adapter for Horizontal Scaling | Integrate `@socket.io/redis-adapter` to sync events across multiple server instances.                          | WS-01, CACHE-01  | 2 pts       |
| **WS-03** | Connection Authentication            | Validate JWT or guest token on handshake; attach user context to socket.                                       | AUTH-01, AUTH-05 | 3 pts       |
| **WS-04** | Room Management                      | Join rooms based on `restaurantId`, `waiterId`, or `tableId` for targeted event emission.                      | WS-01            | 2 pts       |
| **WS-05** | Event Definitions & Payloads         | Define TypeScript interfaces for all events (`order:new`, `order:status`, `table:request`).                    | WS-01            | 1 pt        |
| **WS-06** | Frontend Socket Client               | React hook `useSocket` to manage connection, reconnection, and event listeners.                                | WS-01            | 3 pts       |

---

### 2.8 Loyalty & Smart Features

**Feature:** Personalization & Retention Mechanics

| Task ID      | Task Name                   | Description                                                                                                                              | Dependencies      | Est. Effort |
| :----------- | :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :---------- |
| **SMART-01** | Smart Upsell Algorithm      | On "Add to Cart", query user's past orders; if item X is frequently paired with Y (≥70%), return `recommendedAddon` in GraphQL response. | CART-02, ORDER-06 | 3 pts       |
| **SMART-02** | Allergy Warning System      | When item with allergen is added to cart, check user `preferences.allergies`; trigger warning modal requiring confirmation.              | CART-02, PROF-05  | 2 pts       |
| **SMART-03** | Guest Cart Recovery (Redis) | Already covered in CART-03; ensure TTL management and cleanup.                                                                           | CART-03           | 2 pts       |
| **SMART-04** | Priority Waitlist Logic     | If restaurant is full, Registered Users can join "Priority" queue; Guests join "Standard" queue; implement queue management.             | AUTH-06           | 4 pts       |
| **SMART-05** | "Buy it Again" Carousel     | For registered user, query top 3 frequent items and display at top of menu.                                                              | ORDER-06          | 2 pts       |

---

### 2.9 Manager & Admin Panel

**Feature:** Staff Management & Analytics

| Task ID    | Task Name                        | Description                                                                                            | Dependencies | Est. Effort |
| :--------- | :------------------------------- | :----------------------------------------------------------------------------------------------------- | :----------- | :---------- |
| **MGR-01** | Staff Onboarding Interface       | Manager enters email + role; system sends magic link invite (AUTH-07). List view of staff with status. | AUTH-07      | 3 pts       |
| **MGR-02** | Menu Engineering Dashboard       | Manager can reorder categories, set featured items, view item popularity analytics.                    | MENU-02      | 4 pts       |
| **MGR-03** | Waiter Performance Analytics     | Query average order fulfillment time per waiter; display charts.                                       | ORDERS-01    | 3 pts       |
| **MGR-04** | Customer Retention Metrics       | Registered user signup rate, repeat order rate, average order value (AOV).                             | ORDERS-01    | 3 pts       |
| **MGR-05** | System Health Monitoring (Admin) | Dashboard showing active connections, Redis memory, DB query latency; accessible only to Super Admin.  | INFRA-01     | 3 pts       |

---

## 3. Infrastructure & DevOps Tasks

| Task ID      | Task Name                          | Description                                                                               | Est. Effort |
| :----------- | :--------------------------------- | :---------------------------------------------------------------------------------------- | :---------- |
| **INFRA-01** | Docker Compose Environment         | Configure `docker-compose.yml` with PostgreSQL, Redis, MinIO, NestJS, Next.js.            | 3 pts       |
| **INFRA-02** | Database Migration Setup (Drizzle) | Define schema and generate migration files; integrate with NestJS startup.                | 2 pts       |
| **INFRA-03** | Redis Cache Service                | Abstract Redis client in NestJS with methods for get/set/del with TTL.                    | 2 pts       |
| **INFRA-04** | S3/MinIO Storage Service           | Abstract file upload/delete; handle presigned URLs for direct browser uploads (optional). | 3 pts       |
| **INFRA-05** | CI/CD Pipeline (GitHub Actions)    | Lint, test, build Docker images, push to registry.                                        | 3 pts       |
| **INFRA-06** | PWA Configuration                  | Generate manifest.json, service worker for offline menu caching.                          | 2 pts       |

---

## 4. Suggested Sprint Allocation

| Sprint       | Focus                      | Tasks                                                                        |
| :----------- | :------------------------- | :--------------------------------------------------------------------------- |
| **Sprint 1** | Foundation                 | INFRA-01, INFRA-02, AUTH-01, AUTH-02, AUTH-03, MENU-01                       |
| **Sprint 2** | Guest Flow & Menu          | AUTH-04, AUTH-05, MENU-02, MENU-03, MENU-04, CART-01, CART-02                |
| **Sprint 3** | Ordering Core              | CART-03, CART-04, WS-01, WS-02, WS-03, WS-04, WS-05                          |
| **Sprint 4** | Staff Dashboards           | WAITER-01 to WAITER-06, KDS-01 to KDS-03, WS-06                              |
| **Sprint 5** | Profiles & Personalization | PROF-01 to PROF-06, MENU-06, SMART-01, SMART-02, SMART-05                    |
| **Sprint 6** | Loyalty & Management       | SMART-03, SMART-04, AUTH-07, AUTH-08, MGR-01 to MGR-05                       |
| **Sprint 7** | Polish & Deployment        | INFRA-03, INFRA-04, INFRA-05, INFRA-06, CART-05, CART-06, end-to-end testing |

---

_End of Features Breakdown Document_
