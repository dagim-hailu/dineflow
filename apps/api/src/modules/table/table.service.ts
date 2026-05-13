import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { tables, restaurants } from '../../infrastructure/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class TableService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getTables(restaurantId?: string) {
    if (restaurantId) {
      return this.databaseService.db
        .select()
        .from(tables)
        .where(eq(tables.restaurantId, restaurantId));
    }
    // Return all tables if no restaurantId filter (e.g. for demo)
    return this.databaseService.db.select().from(tables).orderBy(tables.tableNumber);
  }

  async getTableById(id: string) {
    const [table] = await this.databaseService.db
      .select()
      .from(tables)
      .where(eq(tables.id, id))
      .limit(1);
    return table ?? null;
  }
}
