---
name: nestjs-graphql-module
description: Standardized workflow for creating a NestJS GraphQL module, including resolver, service, DTO, and module files.
globs: apps/api/src/modules/**/*.ts
alwaysApply: false
---

# Create NestJS GraphQL Module

## Trigger Conditions

Trigger when user says "create a new NestJS module," "add GraphQL API for XXX feature."

## Execution Flow

### 1. Create Module Directory Structure

Under `apps/api/src/modules/`, create:
[module-name]/
├── [module-name].module.ts
├── [module-name].resolver.ts
├── [module-name].service.ts
├── dto/
│ ├── create-[entity].input.ts
│ └── update-[entity].input.ts
└── models/
└── [entity].model.ts

### 2. Define GraphQL Types (Code-First)

In resolver, use `@ObjectType()` decorator to define return types.

### 3. Implement DTOs

All input types use `@InputType()` and `class-validator` decorators.

### 4. Implement Service

- Inject DrizzleService
- Implement CRUD methods
- Wrap all database operations in `try/catch`

### 5. Implement Resolver

- Use `@Resolver()` decorator
- Add `@Query()` and `@Mutation()` methods
- Use `@CurrentUser()` and `@Roles()` decorators for authorization

### 6. Register Module

Import the new module in `app.module.ts`.
