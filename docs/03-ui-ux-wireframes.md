# UI/UX Wireframes Document: DineFlow Restaurant Website

**Version:** 1.0  
**Date:** 2026-04-11  
**Project:** DineFlow Digital Ordering System – Public-Facing Restaurant Site

---

## 1. Design Overview

The DineFlow public website serves as the restaurant's digital storefront, seamlessly integrating with the QR‑based ordering system. The design language is modern, clean, and appetizing—balancing a premium dark aesthetic with vibrant orange accents that guide user action.

### 1.1 Design Principles

| Principle       | Description                                                                              |
| :-------------- | :--------------------------------------------------------------------------------------- |
| **Clarity**     | High contrast between text and backgrounds ensures readability of menu items and CTAs.   |
| **Warmth**      | Orange (`#F59E0B`) conveys energy and appetite, used sparingly for maximum impact.       |
| **Depth**       | Layered shadows, rounded corners, and subtle overlays create a tactile, card‑based UI.   |
| **Consistency** | Tailwind CSS utility classes enforce a strict spacing and color system across all pages. |

---

## 2. Global Design System

### 2.1 Color Palette

| Token                     | Hex Code  | Usage                                                 |
| :------------------------ | :-------- | :---------------------------------------------------- |
| **Primary Orange**        | `#F59E0B` | Buttons, icons, active states, price tags, highlights |
| **Background Dark Navy**  | `#0F172A` | Header overlay, footer, dark section backgrounds      |
| **Text White**            | `#FFFFFF` | Primary text on dark backgrounds                      |
| **Text Black**            | `#1F2937` | Headings on light backgrounds                         |
| **Text Gray**             | `#6B7280` | Secondary text, descriptions, placeholders            |
| **Light Gray Background** | `#F9FAFB` | Page background for sections with white cards         |

### 2.2 Typography

- **Font Family:** `'Inter', 'Poppins', system-ui, sans-serif`
- **Headings:** Weight `700`–`800`, responsive sizes (`text-3xl` to `text-5xl`), color adapts to background.
- **Body Text:** Weight `400`–`500`, size `text-base` or `text-lg`, color gray or white.
- **Menu Item Descriptions:** `italic text-sm text-gray-500`
- **Buttons & Nav Links:** `font-semibold`, uppercase optional.

### 2.3 Spacing & Layout System (Tailwind Scale)

| Scale             | Value  | Usage                       |
| :---------------- | :----- | :-------------------------- |
| `p-4` / `m-4`     | 1rem   | Compact padding             |
| `p-6` / `m-6`     | 1.5rem | Standard card padding       |
| `p-8` / `m-8`     | 2rem   | Section inner spacing       |
| `py-16` / `my-16` | 4rem   | Section vertical separation |

**Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### 2.4 Iconography & Imagery

- **Icons:** Heroicons (Outline) or Lucide React, colored with `text-[#F59E0B]` when active.
- **Images:** Rounded corners (`rounded-lg`, `rounded-full`), object‑fit cover, subtle shadows.
- **Overlays:** `bg-gradient-to-r from-black/70 to-black/30` on hero images for text legibility.

---

## 3. Component Library

### 3.1 Buttons

| Variant           | Classes                                                                                                        | Example      |
| :---------------- | :------------------------------------------------------------------------------------------------------------- | :----------- |
| **Primary Solid** | `bg-[#F59E0B] text-white px-6 py-3 rounded-md font-semibold shadow-md hover:bg-yellow-500 transition`          | BOOK A TABLE |
| **Outline Light** | `border border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition` | SEE MENU     |
| **Text Link**     | `text-white hover:text-[#F59E0B] font-semibold`                                                                | Home         |

### 3.2 Cards

| Type                 | Structure                                                                            |
| :------------------- | :----------------------------------------------------------------------------------- |
| **Menu Item Card**   | `flex items-center space-x-6` → Image `w-24 h-24 rounded-lg` → Text + Price          |
| **Team Card**        | `bg-white shadow-md rounded-lg p-6 text-center w-48` → Circular Image → Name → Role  |
| **Testimonial Card** | `bg-white p-6 rounded-lg shadow-lg w-80` (Orange variant: `bg-[#F59E0B] text-white`) |

### 3.3 Form Elements

| Element              | Classes                                                                                             |
| :------------------- | :-------------------------------------------------------------------------------------------------- |
| **Input / Textarea** | `w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]` |
| **Select Dropdown**  | Same as input + `appearance-none`                                                                   |

---

## 4. Key Screens Wireframes

### 4.1 Homepage (Landing)

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]  Home About Service Menu Pages Contact  [BOOK A TABLE]      │  ← Navbar (transparent overlay)
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────────────────────┐   ┌──────────────────────────┐   │
│   │  Enjoy Our                   │   │                          │   │
│   │  Delicious Meal              │   │   [Circular Grill Image] │   │
│   │                              │   │                          │   │
│   │  "Welcome to a place where   │   │                          │   │
│   │   flavor shines..."          │   │                          │   │
│   │                              │   │                          │   │
│   │  [FOOD MENU] [DRINK MENU]    │   │                          │   │
│   └──────────────────────────────┘   └──────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    Food Menu (Popular Items)                         │
│         ┌─────────────────────────────────────────────────────┐      │
│         │ [Pizza] [Burgers] [Pasta]  ← Tabs                  │      │
│         └─────────────────────────────────────────────────────┘      │
│                                                                     │
│   ┌──────────────────────┐           ┌──────────────────────┐       │
│   │ [IMG] Pizza traces   │           │ [IMG] Chicken Burger │       │
│   │      Ipsum ipsum...  │ $115      │      Ipsum ipsum...  │ $115  │
│   └──────────────────────┘           └──────────────────────┘       │
│   ┌──────────────────────┐           ┌──────────────────────┐       │
│   │ [IMG] Specil samosas │           │ [IMG] Fried Chicken  │       │
│   │      Ipsum ipsum...  │ $115      │      Ipsum ipsum...  │ $115  │
│   └──────────────────────┘           └──────────────────────┘       │
│                         [VIEW FULL MENU]                             │
├─────────────────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │           Book A Table Online (Reservation Section)         │   │
│   │  ┌──────────────────┐   ┌────────────────────────────────┐ │   │
│   │  │                  │   │  Your Name      [____________]  │ │   │
│   │  │   [Video Thumb]  │   │  Your Email     [____________]  │ │   │
│   │  │      with        │   │  Date & Time    [____________]  │ │   │
│   │  │   Play Button    │   │  No Of People   [▼ People 1]    │ │   │
│   │  │                  │   │  Special Request[____________]  │ │   │
│   │  │                  │   │                [BOOK NOW]        │ │   │
│   │  └──────────────────┘   └────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                         Our Master Chefs                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│   │ [Photo] │  │ [Photo] │  │ [Photo] │  │ [Photo] │               │
│   │Full Name│  │Full Name│  │Full Name│  │Full Name│               │
│   │Chef     │  │Chef     │  │Chef     │  │Chef     │               │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│                         Testimonials Carousel                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                          │
│   │"Great!"  │  │"Amazing!"│  │"Best!"   │  ← scrollable            │
│   │Client    │  │Client    │  │Client    │                          │
│   └──────────┘  └──────────┘  └──────────┘                          │
├─────────────────────────────────────────────────────────────────────┤
│                         Footer (Dark Navy)                           │
│   Company   │   Contact        │   Opening Hours  │   Newsletter     │
│   About Us  │   Address...     │   Mon-Sat 9-9    │   [Email Input]  │
│   Contact   │   Phone/Email    │   Sun 10-8       │   [SIGN UP]      │
│   Privacy   │                  │                  │                  │
│   © 2026 DineFlow                                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Interactions:**

- **Hero:** Two prominent CTAs: `FOOD MENU` (solid orange) and `DRINK MENU` (outline).
- **Menu Tabs:** Clicking switches between categories; active tab underlined in orange.
- **Reservation Form:** All fields required; date picker triggers on focus.

---

### 4.2 Food Menu Page

**Breadcrumb:** `HOME / MENU / FOOD`

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Navbar]                                                       │
├─────────────────────────────────────────────────────────────────┤
│                    Food Menu                                     │
│                  Home / Menu / Food                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐    ┌───────────────────────┐        │
│  │ [IMG] Pizza traces    │    │ [IMG] Chicken Burger  │        │
│  │ Ipsum ipsum clita...  │$115│ Ipsum ipsum clita...  │$115    │
│  └───────────────────────┘    └───────────────────────┘        │
│  ┌───────────────────────┐    ┌───────────────────────┐        │
│  │ [IMG] Specil samosas  │    │ [IMG] Fried Chicken   │        │
│  │ Ipsum ipsum clita...  │$115│ Ipsum ipsum clita...  │$115    │
│  └───────────────────────┘    └───────────────────────┘        │
│  ┌───────────────────────┐    ┌───────────────────────┐        │
│  │ [IMG] Grilled Meat    │    │ [IMG] Burrito         │        │
│  │ Ipsum ipsum clita...  │$115│ Ipsum ipsum clita...  │$115    │
│  └───────────────────────┘    └───────────────────────┘        │
│  ┌───────────────────────┐    ┌───────────────────────┐        │
│  │ [IMG] Classic Lasagna │    │ [IMG] Maple-Butter    │        │
│  │ Ipsum ipsum clita...  │$115│ Ipsum ipsum clita...  │$115    │
│  └───────────────────────┘    └───────────────────────┘        │
├─────────────────────────────────────────────────────────────────┤
│  [Footer]                                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Notes:**

- 2‑column grid on desktop, single column on mobile.
- Each item includes: square image, name (bold), italic description, orange price aligned right.

---

### 4.3 Drink Menu Page

Similar layout to Food Menu, with tab navigation switching between Food/Drink. The drink items follow the same card structure but with beverage imagery.

---

### 4.4 Reservation Page

**Breadcrumb:** `HOME / PAGES / RESERVATION`

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Navbar]                                                       │
├─────────────────────────────────────────────────────────────────┤
│                    Reservation                                   │
│                  Home / Pages / Reservation                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│          ┌───────────────────────────────────────────┐          │
│          │             Book A Table Online           │          │
│          │                                           │          │
│          │  Your Name        [___________________]   │          │
│          │  Your Email       [___________________]   │          │
│          │  Date & Time      [___Pick Date & Time_]  │          │
│          │  No Of People     [▼ People 1         ]   │          │
│          │  Special Request  [___________________]   │          │
│          │                                           │          │
│          │               [ BOOK NOW ]                │          │
│          └───────────────────────────────────────────┘          │
│                                                                 │
│   (Optional: embed an image or illustration next to form)       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Footer]                                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.5 About Us Page

**Breadcrumb:** `HOME / PAGES / ABOUT`

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Navbar]                                                       │
├─────────────────────────────────────────────────────────────────┤
│                    About Us                                      │
│                  Home / Pages / About                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│   │                         │  │  Welcome to 🍴 DineFlow      │  │
│   │   [Grid of 4 images]    │  │  Tempor erat elitr rebum...  │  │
│   │   (Masonry style)       │  │  Diam dolor diam ipsum sit.  │  │
│   │                         │  │                              │  │
│   │                         │  │   15 Years       50 Chefs    │  │
│   │                         │  │   EXPERIENCE   MASTER CHEFS  │  │
│   │                         │  │                              │  │
│   │                         │  │        [READ MORE]           │  │
│   └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     Our Master Chefs (Team Section)              │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│   │ [Photo] │  │ [Photo] │  │ [Photo] │  │ [Photo] │           │
│   │Full Name│  │Full Name│  │Full Name│  │Full Name│           │
│   │Chef     │  │Chef     │  │Chef     │  │Chef     │           │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  [Footer]                                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.6 Contact Page

**Breadcrumb:** `HOME / PAGES / CONTACT`

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Navbar]                                                       │
├─────────────────────────────────────────────────────────────────┤
│                    Contact Us                                    │
│                  Home / Pages / Contact                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│   │   Contact For Any Query     │  │  Your Name   [_______]  │  │
│   │                             │  │  Your Email  [_______]  │  │
│   │  📧 Booking: book@...       │  │  Subject     [_______]  │  │
│   │  📧 General: info@...       │  │  Message     [_______]  │  │
│   │  📧 Technical: tech@...     │  │                         │  │
│   │                             │  │    [SEND MESSAGE]        │  │
│   │  📍 Locations:              │  └─────────────────────────┘  │
│   │     New York, USA           │                               │
│   │     Montreal, Canada        │                               │
│   │     Vermont, USA            │                               │
│   │     ...                     │                               │
│   └─────────────────────────────┘                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Footer]                                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.7 Service Page (Implied)

Based on the design system, a "Services" page would display:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Our Services                                  │
│                  Home / Pages / Services                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│   │ 🍽️ Icon  │  │ 🍷 Icon  │  │ 🎉 Icon  │  │ 🚚 Icon  │       │
│   │Fine      │  │Beverage  │  │Private   │  │Home      │       │
│   │Dining    │  │Pairing   │  │Events    │  │Delivery  │       │
│   │Description│ │Description│ │Description│ │Description│       │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Footer]                                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Responsive Behavior

### 5.1 Breakpoints (Tailwind Defaults)

| Prefix | Min Width | Layout Changes                                      |
| :----- | :-------- | :-------------------------------------------------- |
| `sm`   | 640px     | 2‑column grid for menu items? No, still 1‑column.   |
| `md`   | 768px     | 2‑column menu grid, footer columns become 2‑column. |
| `lg`   | 1024px    | Hero becomes side‑by‑side, footer becomes 4‑column. |
| `xl`   | 1280px    | Max width container `max-w-7xl` applied.            |

### 5.2 Mobile Considerations

- **Navbar:** Collapses into a hamburger menu.
- **Hero:** Text stacks above image; buttons remain side‑by‑side if space permits.
- **Reservation Form:** Full‑width inputs; image hidden.
- **Testimonials:** Horizontal scroll with snap alignment.

---

## 6. Integration with DineFlow QR Ordering

The public website will feature a subtle **"Order Online"** floating action button (FAB) that links to the QR menu demo or directs users to scan a table QR. Additionally, the menu pages can include a **"Order Now"** button that simulates the QR experience for takeout orders.

---

## 7. Appendix: Tailwind Configuration Reference

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#F59E0B',
        'dark-navy': '#0F172A',
        'text-black': '#1F2937',
        'text-gray': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
};
```

---

_End of UI/UX Wireframes Document_
