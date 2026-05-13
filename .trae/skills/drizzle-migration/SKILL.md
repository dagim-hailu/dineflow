---
name: 'drizzle-migration'
description: 'Creates Drizzle ORM database schema and migrations for PostgreSQL. Invoke when setting up database schema or when user asks for database migrations.'
---

# Drizzle Migration Skill

This skill creates complete Drizzle ORM database schema definitions and generates migrations for PostgreSQL databases.

## When to Use

- When setting up a new database schema
- When adding new tables or modifying existing schema
- When user requests database migrations
- When implementing database changes from system design documents

## Execution Flow

### 1. Create Schema Definition

Create `apps/api/src/infrastructure/database/schema.ts` with:

- Complete table definitions using Drizzle ORM
- Proper foreign key relationships
- Indexes for performance
- Enum types where needed

### 2. Generate Migration Files

Run Drizzle Kit to generate migration files:

```bash
pnpm drizzle-kit generate
```

### 3. Apply Migrations

Apply migrations to development database:

```bash
pnpm drizzle-kit migrate
```

### 4. Database Service Setup

Create database service with connection pooling and query methods.

## Schema Guidelines

- Use snake_case for table and column names
- Define proper constraints (NOT NULL, UNIQUE, etc.)
- Include created_at/updated_at timestamps
- Use UUID primary keys
- Define proper foreign key relationships
- Add indexes for frequently queried columns
