'use strict';

const { defineConfig } = require('drizzle-kit');

/** Used only by docker-entrypoint + drizzle-kit@0.20.x (`push:pg`). CWD must be `/app`. */
module.exports = defineConfig({
  schema: './apps/api/src/infrastructure/database/schema.ts',
  out: './apps/api/src/infrastructure/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  /** Must be false in Docker so `push:pg` does not block on interactive prompts. */
  strict: false,
});
