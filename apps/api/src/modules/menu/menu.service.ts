import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import {
  menuItems,
  menuCategories,
  restaurants,
  tables,
  users,
} from '../../infrastructure/database/schema';
import { eq, and, desc, asc, ilike, or, count } from 'drizzle-orm';
import { CreateMenuItemInput } from './dto/create-menu-item.input';
import { UpdateMenuItemInput } from './dto/update-menu-item.input';
import { Menu, MenuItem } from './models/menu-item.model';
import { menuItemFromDb, type MenuItemRowLike } from './db-menu-mapper';

type CategoryWithItems = {
  id: string;
  name: string;
  nameAm: string | null;
  description: string | null;
  descriptionAm: string | null;
  displayOrder: number;
  restaurantId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  items: MenuItemRowLike[];
};

@Injectable()
export class MenuService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  private formatMenu(tableId: string, restaurantId: string, categories: CategoryWithItems[]): Menu {
    return {
      tableId,
      restaurantId,
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        nameAm: cat.nameAm ?? undefined,
        description: cat.description ?? undefined,
        descriptionAm: cat.descriptionAm ?? undefined,
        displayOrder: cat.displayOrder,
        items: cat.items.map((item) => menuItemFromDb(item)),
      })),
    };
  }

  async getMenuByTableId(tableId: string): Promise<Menu> {
    const cacheKey = `menu:table:${tableId}`;

    // Try to get from cache first
    const cached = await this.redisService.getCachedObject<{
      categories: CategoryWithItems[];
      restaurantId: string;
      tableId: string;
    }>(cacheKey);
    if (cached) {
      return this.formatMenu(cached.tableId, cached.restaurantId, cached.categories);
    }

    // Get table and restaurant info
    const [table] = await this.databaseService.db
      .select()
      .from(tables)
      .where(eq(tables.id, tableId))
      .limit(1);

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Get all categories with their items, sorted by displayOrder
    const categories = await this.databaseService.db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.restaurantId, table.restaurantId))
      .orderBy(asc(menuCategories.displayOrder));

    const menuWithItems = await Promise.all(
      categories.map(async (category) => {
        const items = await this.databaseService.db
          .select()
          .from(menuItems)
          .where(and(eq(menuItems.categoryId, category.id), eq(menuItems.isAvailable, true)));

        return {
          ...category,
          items,
        };
      }),
    );

    const result = {
      categories: menuWithItems as CategoryWithItems[],
      restaurantId: table.restaurantId,
      tableId,
    };

    // Cache for 5 minutes
    await this.redisService.setCachedObject(cacheKey, result, 300);

    return this.formatMenu(tableId, table.restaurantId, result.categories);
  }

  async createMenuItem(input: CreateMenuItemInput, userId: string) {
    // Verify user has permission to manage menu (manager role)
    await this.verifyManagerPermission(userId, input.restaurantId);

    const [newItem] = await this.databaseService.db
      .insert(menuItems)
      .values({
        name: input.name,
        description: input.description,
        price: String(input.price),
        imageUrl: input.imageUrl,
        prepTime: input.prepTime || 0,
        categoryId: input.categoryId,
        restaurantId: input.restaurantId,
        isAvailable: true,
      })
      .returning();

    // Invalidate menu cache for this restaurant
    await this.redisService.invalidateMenuCache(input.restaurantId);

    return menuItemFromDb(newItem);
  }

  async updateMenuItem(input: UpdateMenuItemInput, userId: string) {
    // Get existing item to check restaurant ID
    const [existingItem] = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, input.id))
      .limit(1);

    if (!existingItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Verify user has permission
    await this.verifyManagerPermission(userId, existingItem.restaurantId);

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) updateData.price = String(input.price);
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.prepTime !== undefined) updateData.prepTime = input.prepTime;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
    if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable;

    const [updatedItem] = await this.databaseService.db
      .update(menuItems)
      .set(updateData)
      .where(eq(menuItems.id, input.id))
      .returning();

    // Invalidate menu cache
    await this.redisService.invalidateMenuCache(existingItem.restaurantId);

    return menuItemFromDb(updatedItem!);
  }

  async deleteMenuItem(id: string, userId: string) {
    // Get existing item to check restaurant ID
    const [existingItem] = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!existingItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Verify user has permission
    await this.verifyManagerPermission(userId, existingItem.restaurantId);

    await this.databaseService.db.delete(menuItems).where(eq(menuItems.id, id));

    // Invalidate menu cache
    await this.redisService.invalidateMenuCache(existingItem.restaurantId);

    return true;
  }

  async getMenuItemById(id: string) {
    const [item] = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    return menuItemFromDb(item);
  }

  async getMenuItemsByRestaurant(restaurantId: string) {
    const items = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurantId));

    return items.map((row) => menuItemFromDb(row));
  }

  async toggleAvailability(id: string, userId: string): Promise<MenuItem> {
    // Get existing item to check restaurant ID
    const [existingItem] = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!existingItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Verify user has permission (manager or kitchen staff)
    await this.verifyKitchenOrManagerPermission(userId, existingItem.restaurantId);

    const [updatedItem] = await this.databaseService.db
      .update(menuItems)
      .set({ isAvailable: !existingItem.isAvailable })
      .where(eq(menuItems.id, id))
      .returning();

    // Invalidate menu cache
    await this.redisService.invalidateMenuCache(existingItem.restaurantId);

    return menuItemFromDb(updatedItem);
  }

  async findByTable(tableId: string): Promise<MenuItem[]> {
    const cacheKey = `menu:table:${tableId}:items`;

    // Try to get from cache first
    const cached = await this.redisService.getCachedObject<MenuItemRowLike[]>(cacheKey);
    if (cached) {
      return cached.map((row) => menuItemFromDb(row));
    }

    // Get table and restaurant info
    const [table] = await this.databaseService.db
      .select()
      .from(tables)
      .where(eq(tables.id, tableId))
      .limit(1);

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Get all available menu items for this restaurant
    const items = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.restaurantId, table.restaurantId), eq(menuItems.isAvailable, true)));

    // Cache for 300 seconds (5 minutes)
    await this.redisService.setCachedObject(cacheKey, items, 300);

    return items.map((row) => menuItemFromDb(row));
  }

  private async verifyManagerPermission(userId: string, restaurantId: string) {
    // In a real implementation, you would check if the user is a manager
    // and has access to this specific restaurant
    // For now, we'll just check if the user exists and has manager role

    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.role !== 'manager') {
      throw new ForbiddenException('Only managers can modify menu items');
    }

    // Additional check: verify the manager has access to this restaurant
    // This would require a staff_assignments table check
  }

  private async verifyKitchenOrManagerPermission(userId: string, restaurantId: string) {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || (user.role !== 'manager' && user.role !== 'kitchen')) {
      throw new ForbiddenException(
        'Only managers and kitchen staff can toggle menu item availability',
      );
    }
  }

  async getPaginatedMenuItems(args: {
    search?: string;
    categoryId?: string;
    isAvailable?: boolean;
    restaurantId?: string;
    tableId?: string;
    limit: number;
    offset: number;
  }) {
    const conditions = [];

    // If tableId is provided, get the restaurantId from it
    let targetRestaurantId = args.restaurantId;
    if (args.tableId && !targetRestaurantId) {
      const [table] = await this.databaseService.db
        .select()
        .from(tables)
        .where(eq(tables.id, args.tableId))
        .limit(1);
      if (table) {
        targetRestaurantId = table.restaurantId;
      }
    }

    if (targetRestaurantId) {
      conditions.push(eq(menuItems.restaurantId, targetRestaurantId));
    }

    if (args.categoryId) {
      conditions.push(eq(menuItems.categoryId, args.categoryId));
    }

    if (args.isAvailable !== undefined) {
      conditions.push(eq(menuItems.isAvailable, args.isAvailable));
    }

    if (args.search) {
      conditions.push(
        or(
          ilike(menuItems.name, `%${args.search}%`),
          ilike(menuItems.nameAm, `%${args.search}%`),
          ilike(menuItems.description, `%${args.search}%`),
          ilike(menuItems.descriptionAm, `%${args.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCountResult] = await this.databaseService.db
      .select({ count: count() })
      .from(menuItems)
      .where(whereClause);

    const items = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(whereClause)
      .limit(args.limit)
      .offset(args.offset)
      .orderBy(asc(menuItems.categoryId)); // Or sort by displayOrder if joining categories

    return {
      items: items.map((row) => menuItemFromDb(row)),
      totalCount: Number(totalCountResult.count),
    };
  }
}
