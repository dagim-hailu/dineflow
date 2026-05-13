# DineFlow Project Coding Standards & AI Behavior Rules

## Project Information

- Project Name: DineFlow v2.1
- Tech Stack: Next.js 15 (App Router) + Tailwind CSS + Zustand + NestJS 10 + GraphQL + PostgreSQL + Drizzle ORM + Redis + Turborepo + Docker
- Package Manager: pnpm 9.x
- Language: TypeScript (strict mode)

## Code Style Guidelines

### Naming Conventions

- Files/Folders: kebab-case (`user-profile.tsx`, `auth-guard.ts`)
- Components: PascalCase (`MenuItemCard`, `TableGrid`)
- Functions/Methods: camelCase (`calculateTotalPrice`, `validateGuestToken`)
- Classes: PascalCase (`AuthService`, `OrderResolver`)
- Interfaces/Types: PascalCase (`IOrderItem`, `UserPreferences`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_CART_ITEMS`, `JWT_EXPIRY`)
- Database Tables/Columns: snake_case (`order_items`, `profile_image_url`)
- GraphQL Types: PascalCase; Fields: camelCase

### Frontend Guidelines

- Use Next.js App Router; components default location: `src/components/`
- UI components must use shadcn/ui, added via `pnpm dlx shadcn@latest add`
- Styling with Tailwind CSS; adhere to design system color variables: `primary` (#F59E0B), `dark-navy` (#0F172A)
- State Management: Zustand (client state) + Apollo Client (server state)
- All async operations must have try/catch error handling
- Form validation using Zod

### Backend Guidelines

- Follow NestJS modular architecture: `modules/[feature]/[feature].module.ts`
- All DTOs must use class-validator decorators for validation
- Database access via Drizzle ORM; raw SQL is forbidden
- GraphQL uses Code-First approach for schema definition
- Sensitive data (passwords, JWT secrets) must be read from environment variables
- WebSocket events must have TypeScript interfaces defined

### General Guidelines

- Forbidden to use `any` type unless absolutely necessary with comment justification
- All public methods must include JSDoc comments
- Async functions must handle Promise rejections properly
- Use pnpm instead of npm/yarn for dependency management
- Turborepo tasks defined in `turbo.json`

## Technology Stack Constraints

- Frontend Framework: Must use Next.js 15 (App Router)
- UI Component Library: Must use shadcn/ui; other libraries (MUI, Ant Design) forbidden
- Styling: Must use Tailwind CSS; custom CSS files forbidden
- Backend Framework: Must use NestJS
- API Protocol: Must use GraphQL (Code-First); REST endpoints forbidden
- ORM: Must use Drizzle ORM
- Caching: Must use Redis

## Interaction Mode

- Output complete file content by default, not just modification snippets
- After code generation, provide a brief explanation of key implementation logic
- When user confirmation is needed, clearly list options and wait for response
- For multi-file modifications, output in logical order

## Directory Structure Constraints (Turborepo)

- Frontend code: `apps/web/`
- Backend code: `apps/api/`
- Shared types: `packages/types/`
- Environment variable templates: `apps/web/.env.example` and `apps/api/.env.example`

## Security Constraints

- All user input must be validated and sanitized
- Passwords must be hashed with bcrypt
- JWT secrets must not be hardcoded
- API endpoints must implement rate limiting

## shadcn/ui Initialization Requirement

Before generating any UI components, ALWAYS ensure:

1. The `src/lib/utils.ts` file exists with the `cn` function.
2. Required dependencies (`clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`) are in `package.json`.
3. The `globals.css` contains shadcn/ui CSS variables and `@tailwind` layers.
4. The `components.json` file is present at the project root with proper configuration.
5. `tailwind.config.js` includes shadcn/ui configuration (colors, dark mode, content paths).
