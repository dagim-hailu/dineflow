import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infrastructure/database/schema.ts',
  out: './src/infrastructure/database/migrations',
  driver: 'pg',
  dbCredentials: {
    // @ts-ignore
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
