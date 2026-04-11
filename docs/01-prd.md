Here is the fully integrated Product Requirements Document (PRD). All strategic recommendations have been woven into the existing structure, marked clearly with `[INTEGRATED RECOMMENDATION]` for full transparency. This document is now ready for engineering handoff.

---

# Product Requirements Document (PRD): "DineFlow" Digital Ordering System (v2.1 - Final)

| **Document Status** | Final Draft v2.1                               |
| :------------------ | :--------------------------------------------- |
| **Product Name**    | DineFlow                                       |
| **Version**         | 2.1 (Hybrid Auth + Integrated Recommendations) |
| **Author**          | Product Team                                   |

---

## 1. Introduction & Executive Summary

**Product Name:** DineFlow  
**Purpose:** A web-based multi-role restaurant management system connecting customers, waiters, kitchen staff, and managers. DineFlow supports both anonymous walk-ins (Guest) and loyal registered customers (VIP), providing a seamless dining experience via QR codes without requiring app downloads.  
**Target Audience:** Dine-in restaurants wanting to build customer loyalty and increase Average Order Value (AOV) without creating high friction.

**[INTEGRATED RECOMMENDATION] - Market Positioning & PWA Strategy:**  
DineFlow will be built as a **Progressive Web App (PWA)** . While the primary flow is browser-based, Registered Users will receive a subtle prompt: _"Add DineFlow to Home Screen for faster reordering."_ This boosts retention and load speeds without the overhead of native app store management.

---

## 2. Technical Architecture & Stack

| Layer                  | Technology                  | Justification                                                                                                                                                |
| :--------------------- | :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**           | Next.js (App Router)        | Server-side rendering for fast initial QR scan load; API routes for secure token handling.                                                                   |
| **Backend**            | NestJS + GraphQL            | Structured modularity for role-based resolvers; efficient menu data fetching.                                                                                |
| **Database**           | PostgreSQL + Drizzle ORM    | Relational integrity for orders; type-safe schema migrations.                                                                                                |
| **Caching & Sessions** | **Redis**                   | **[INTEGRATED RECOMMENDATION]** Used for **Real-time Cart Locking** (preventing table collisions) and **Menu Caching** (reducing DB load during peak hours). |
| **Authentication**     | Auth.js (v5)                | **Hybrid Strategy**: JWTs for staff/registered users; Short-lived signed session tokens for Guests.                                                          |
| **Infrastructure**     | Docker Compose              | Ensures parity between local dev and production environments.                                                                                                |
| **File Storage**       | Object Storage (S3 / MinIO) | Secure hosting for Profile Pictures and Menu Images.                                                                                                         |

---

## 3. User Roles & Permissions

### 3.1 Super Admin

- **Access:** Standard Email/Password login.
- **Capabilities:**
  - System Oversight: View global health and tenant stats.
  - Staff Privacy Compliance: Can reset staff passwords but **cannot** view/edit personal profile data (Bio/Picture) without explicit consent.

### 3.2 Restaurant Manager

- **Profile:** Uploads a professional headshot (visible to staff).
- **Capabilities:**
  - **Staff Onboarding:** Sends invite links (Magic Links) to Waiters/Kitchen staff.
  - **Menu Engineering:** Full CRUD on items + Image Uploads.
  - **Performance Review:** Detailed stats on Waiter speed and Customer retention.

### 3.3 Waiter

- **Profile:** **Mandatory** Profile Picture. Displayed to customers on menu header: _"Your server tonight is Alex"_.
- **Capabilities:**
  - Table Assignment: Grid view of assigned tables.
  - Smart Notifications: "New Order," "Order Ready," "Service Request."
  - **[INTEGRATED RECOMMENDATION] - Tip Management:** Private view showing estimated tips based on order total (requires future POS integration field).
  - **Profile Management:** Update display name, photo, and **[INTEGRATED] Shift Bio** (e.g., _"I recommend the Tiramisu tonight!"_).

### 3.4 Kitchen Staff

- **Profile:** Basic avatar (internal use only).
- **Capabilities:**
  - KDS (Kitchen Display System): Real-time order ticketing.
  - Inventory Control: "86" (disable) items instantly with an optional reason note.

### 3.5 The Customer (Hybrid Model)

This role is the core of v2.0, managing two distinct states with a seamless bridge.

#### A. Guest Customer (Default)

- **Access:** Scan QR -> Instant Menu Access. **No login wall.**
- **Data Storage:** Favorites and Cart stored in **LocalStorage** (device-specific).
- **[INTEGRATED RECOMMENDATION] - Guest Cart Recovery:** If a Guest closes the browser before paying and re-scans the same QR within **15 minutes**, the system detects the `guest_session_id` and prompts: _"You have items in your cart. Restore?"_

#### B. Registered Customer (VIP)

- **Access:** Scan QR -> Auto-login (persistent session) OR Sign In.
- **Incentives to Register & Stay Logged In:**
  1.  **Unified History:** One-tap _"Order Again"_ from previous visits.
  2.  **Cloud Favorites:** Syncs across phone, tablet, and desktop.
  3.  **Profile Avatar:** Visible to Waiter for personalized greeting (_"Happy Birthday, Sarah!"_).
  4.  **Dietary Safety:** Permanent filters (Vegan, Nut Allergy) that auto-filter menus and trigger warnings.
  5.  **[INTEGRATED RECOMMENDATION] - Priority Waitlist:** During peak hours, Registered Users can join a "Priority Waitlist" queue before Guests.

---

## 4. Functional Requirements (Enhanced & Integrated)

### 4.1 Profile Picture System

- **Upload Logic:**
  - Frontend provides a **Crop/Resize UI** (mandatory).
  - Backend (NestJS) validates size (< 2MB) and type (JPG/PNG).
  - Images stored in Object Storage; URL saved to DB `profile_image_url`.
- **Display Context:**
  - **Customer View:** Waiter's photo + **[INTEGRATED] Shift Bio** at the top of the menu.
  - **Waiter View:** Registered Customer's avatar on the order card for easy table-side identification.

### 4.2 Authentication & "Soft Registration" Flow

1.  **QR Scan:** User scans table code.
2.  **Landing State Check:**
    - _Logged In:_ `Welcome back, [Name]!` with personalized "Buy it Again" section.
    - _New/Guest:_ Two prominent buttons: **"Continue as Guest"** (Primary CTA) and **"Sign Up / Login"** (Secondary).
3.  **Post-Payment Conversion (The Hook):** After a Guest completes payment, a non-blocking toast notification appears: _"Save this order to history & get 10% off next visit. Create Account (1-click)."_ This links the guest cart to a new account seamlessly.

### 4.3 The Menu & Ordering Experience

- **Personalization (Registered Only):**
  - If `preferences.spicy == true`, highlight spicy items with a 🌶️ icon.
  - **"Buy it Again" Carousel:** Top of menu showing 3 most frequent items.
- **[INTEGRATED RECOMMENDATION] - Split Bill Interface:**
  - **Feature:** Toggle in the cart view.
  - **Functionality:** Users can split items by **Seat Number** (e.g., Seat 1: Burger, Seat 2: Pasta) OR **Even Split** (50/50).
  - _Rationale: Addresses the #1 pain point of group dining with QR menus._

### 4.4 Smart Notifications & Safety Gates

- **Transport:** WebSockets (NestJS Gateway).
- **Mandatory Safety Gate:**
  - **Allergy Warning:** If Registered User adds "Peanut Salad" and `preferences.allergies` contains 'Nuts', trigger a **bold modal**: _"⚠️ Chef Warning: This item contains Nuts. Are you sure you want to proceed?"_ (Requires explicit confirmation).
- **Smart Upsell:**
  - **Algorithm:** Check order history. If User orders "Burger" and has "Coke" in >70% of past pairings, prompt: _"Add your usual Coke?"_ (Target: +12-15% AOV).

### 4.5 Waiter Dashboard (Grid View)

- **Layout:** Tables rendered as Cards.
- **Card Data Points:**
  - Table Number.
  - **Seated Timer** (Color-coded: Green <5m, Yellow 5-10m, Red >10m).
  - **Customer Avatar** (if Registered).
  - **Last Action** (e.g., "Waiting for drinks").

---

## 5. Data Model (Drizzle ORM Schema - Integrated)

_This schema includes fields for Guest recovery and Redis session mapping._

```sql
-- Users Table (Staff + Registered Customers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'waiter', 'kitchen', 'customer')),
  email VARCHAR(255) UNIQUE, -- NULL for Guest placeholder records
  password_hash VARCHAR(255), -- NULL for Guest
  profile_image_url TEXT,
  preferences JSONB DEFAULT '{"dietary": [], "allergies": [], "spicy_preference": false}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tables
CREATE TABLE tables (
  id UUID PRIMARY KEY,
  number INTEGER NOT NULL,
  qr_uuid UUID UNIQUE NOT NULL,
  current_waiter_id UUID REFERENCES users(id)
);

-- Orders (Hybrid Support)
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  table_id UUID REFERENCES tables(id),
  user_id UUID REFERENCES users(id), -- NULL if pure guest, links to 'customer' role user if registered
  guest_session_id VARCHAR(255), -- [INTEGRATED] Links to Redis key for Guest Cart Recovery logic
  status VARCHAR(50) NOT NULL,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites Junction
CREATE TABLE favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, menu_item_id)
);
```

---

## 6. UI/UX Guidelines

- **Customer - Guest:** **Frictionless.** Menu load time target: < 1.5s. **Zero popups** blocking menu items before the user interacts.
- **Customer - Registered:** **Personalized.** Display Avatar and "Rewards Points" badge in a fixed top bar.
- **Accessibility:** **[INTEGRATED]** All interactive elements must meet WCAG 2.1 AA contrast ratios. Waiters often work in dim restaurant lighting.

---

## 7. Development Roadmap (Final Integrated Timeline)

**Phase 1: Core & Infrastructure (Weeks 1-3)**

- Docker setup (Postgres, NestJS, **Redis**, MinIO).
- Auth.js configuration (Hybrid Token strategy).
- Menu CRUD with Image Upload.

**Phase 2: The Ordering Loop (Weeks 4-7)**

- QR Scan routing logic (Guest vs. User detection).
- **Guest Cart Recovery** logic implementation (Redis TTL).
- Real-time Socket integration (Waiter + KDS).
- Basic Profile Avatar upload and cropping.

**Phase 3: Loyalty & Conversion (Weeks 8-10)**

- "Sign up to save history" post-payment modal.
- **Smart Upsell** recommendation algorithm (count-based).
- **Split Bill UI** component development.
- Order History page with "Order Again" CTA.

**Phase 4: Polish & PWA (Weeks 11-12)**

- End-to-end testing of Guest Token expiration and Cart Recovery.
- Security audit (CORS, Rate Limiting on QR scans).
- **PWA Manifest configuration** for "Add to Home Screen" prompt.
- Deployment & Go-Live.
