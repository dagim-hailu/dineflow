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

```tsx
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
```
