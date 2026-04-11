### Skill 3: Drizzle Database Migration

**File Path:** `.trae/skills/drizzle-migration/SKILL.md`

````markdown
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
export const newTable = pgTable("new_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```
````
