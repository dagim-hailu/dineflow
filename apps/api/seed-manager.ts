import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as schema from './src/infrastructure/database/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dineflow';
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  const passwordHash = await bcrypt.hash('password123', 12);

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'manager@example.com'));
  if (existing.length === 0) {
    await db.insert(schema.users).values({
      name: 'Manager User',
      email: 'manager@example.com',
      passwordHash,
      role: 'manager',
    });
    console.log('Created manager@example.com');
  } else {
    console.log('manager@example.com already exists');
  }

  // Also create a non-manager test user
  const existingCustomer = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'customer@example.com'));
  if (existingCustomer.length === 0) {
    await db.insert(schema.users).values({
      name: 'Customer User',
      email: 'customer@example.com',
      passwordHash,
      role: 'customer',
    });
    console.log('Created customer@example.com');
  }

  process.exit(0);
}

main().catch(console.error);
