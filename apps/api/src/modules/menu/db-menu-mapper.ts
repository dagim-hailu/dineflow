import { menuItems } from '../../infrastructure/database/schema';
import type { MenuItem } from './models/menu-item.model';

export type MenuItemRow = typeof menuItems.$inferSelect;

/** Row shape from DB or JSON cache (price may deserialize as number). */
export type MenuItemRowLike = Omit<MenuItemRow, 'price'> & {
  price: string | number;
};

export function priceFromDb(value: string | number): number {
  if (typeof value === 'number') return value;
  return parseFloat(value);
}

export function menuItemFromDb(row: MenuItemRowLike): MenuItem {
  return {
    id: row.id,
    name: row.name,
    nameAm: row.nameAm ?? undefined,
    description: row.description ?? undefined,
    descriptionAm: row.descriptionAm ?? undefined,
    price: priceFromDb(row.price),
    imageUrl: row.imageUrl ?? undefined,
    isAvailable: row.isAvailable,
    prepTime: row.prepTime ?? 15,
    createdAt: row.createdAt!,
    updatedAt: row.updatedAt!,
    categoryId: row.categoryId,
    restaurantId: row.restaurantId,
  } as MenuItem;
}
