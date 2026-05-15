import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { EventsGateway } from '../events/events.gateway';
import { orders, orderItems, menuItems, tables, users } from '../../infrastructure/database/schema';
import { eq, and, inArray, or } from 'drizzle-orm';
import { AddToCartInput } from './dto/add-to-cart.input';
import { PlaceOrderInput } from './dto/place-order.input';
import { Order, OrderItem, OrderStatus } from './models/order.model';
import { menuItemFromDb } from '../menu/db-menu-mapper';

function orderStatusFromDb(status: string): OrderStatus {
  const key = status.toUpperCase();
  if (key in OrderStatus) {
    return OrderStatus[key as keyof typeof OrderStatus];
  }
  return OrderStatus.PENDING;
}

interface CartItem {
  menuItemId: string;
  menuItemName: string; // Added
  quantity: number;
  price: number; // Added
  notes?: string;
  addedAt: Date;
}

interface Cart {
  items: CartItem[];
  tableId?: string;
  createdAt: Date;
  updatedAt: Date;
  totalAmount: number;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  private async calculateCartTotalAmount(cart: Cart, menuItemIds: string[]): Promise<number> {
    if (cart.items.length === 0) {
      return 0;
    }
    const menuItemsPrices = await this.databaseService.db
      .select({ id: menuItems.id, price: menuItems.price })
      .from(menuItems)
      .where(inArray(menuItems.id, menuItemIds));

    const priceMap = new Map(menuItemsPrices.map((item) => [item.id, parseFloat(item.price)]));

    let totalAmount = 0;
    for (const item of cart.items) {
      const price = priceMap.get(item.menuItemId);
      if (price !== undefined) {
        totalAmount += price * item.quantity;
      }
    }
    return totalAmount;
  }

  private getCartKey(userId?: string, guestId?: string): string {
    if (userId) {
      return `user:cart:${userId}`;
    }
    if (guestId) {
      return `guest:cart:${guestId}`;
    }
    throw new BadRequestException('Either userId or guestId must be provided');
  }

  async addToCart(input: AddToCartInput, userId?: string, guestId?: string): Promise<Cart> {
    const cartKey = this.getCartKey(userId, guestId);

    // Verify menu item exists and is available
    const menuItemResult = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, input.menuItemId), eq(menuItems.isAvailable, true)))
      .limit(1);

    const menuItem = menuItemResult[0];
    if (!menuItem) {
      throw new NotFoundException('Menu item not found or not available');
    }

    // Get current cart or create new one
    const cachedCart = await this.redisService.getCachedObject<Cart>(cartKey);
    const currentCart: Cart = cachedCart || {
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalAmount: 0,
    };

    // Check if item already exists in cart
    const existingItemIndex = currentCart.items.findIndex(
      (item) => item.menuItemId === input.menuItemId,
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = currentCart.items[existingItemIndex];
      if (existingItem) {
        existingItem.quantity += input.quantity;
        if (input.notes) {
          existingItem.notes = input.notes;
        }
        // Ensure price and name are always up-to-date from the current menuItem
        existingItem.price = parseFloat(menuItem.price);
        existingItem.menuItemName = menuItem.name;
      }
    } else {
      // Add new item
      currentCart.items.push({
        menuItemId: input.menuItemId,
        quantity: input.quantity,
        notes: input.notes,
        addedAt: new Date(),
        price: parseFloat(menuItem.price),
        menuItemName: menuItem.name,
      });
    }

    currentCart.updatedAt = new Date();

    const menuItemIds = currentCart.items.map((item) => item.menuItemId);
    currentCart.totalAmount = await this.calculateCartTotalAmount(currentCart, menuItemIds);

    // Save cart to Redis with 15-minute TTL for guest carts
    const ttl = guestId ? 900 : undefined; // 15 minutes for guest carts
    await this.redisService.setCachedObject(cartKey, currentCart, ttl);

    return currentCart;
  }

  async getCart(userId?: string, guestId?: string): Promise<Cart> {
    const cartKey = this.getCartKey(userId, guestId);
    const cart = await this.redisService.getCachedObject<Cart>(cartKey);

    if (!cart) {
      return {
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        totalAmount: 0, // Default to 0 for empty cart
      };
    }

    const menuItemIds = cart.items.map((item) => item.menuItemId);
    cart.totalAmount = await this.calculateCartTotalAmount(cart, menuItemIds);

    return cart;
  }

  async removeFromCart(menuItemId: string, userId?: string, guestId?: string): Promise<Cart> {
    const cartKey = this.getCartKey(userId, guestId);
    const cart = await this.redisService.getCachedObject<Cart>(cartKey);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Remove item from cart
    cart.items = cart.items.filter((item) => item.menuItemId !== menuItemId);
    cart.updatedAt = new Date();

    const menuItemIds = cart.items.map((item) => item.menuItemId);
    cart.totalAmount = await this.calculateCartTotalAmount(cart, menuItemIds);

    // Save updated cart
    const ttl = guestId ? 900 : undefined;
    await this.redisService.setCachedObject(cartKey, cart, ttl);

    return cart;
  }

  async clearCart(userId?: string, guestId?: string): Promise<void> {
    const cartKey = this.getCartKey(userId, guestId);
    await this.redisService.del(cartKey);
  }

  async placeOrder(input: PlaceOrderInput, userId?: string, guestId?: string) {
    // Build effective cart: prefer Redis cart, fall back to items passed in the request body
    let effectiveItems: Array<{ menuItemId: string; quantity: number; notes?: string }> = [];

    // Try Redis cart first (requires a session)
    if (userId || guestId) {
      try {
        const cartKey = this.getCartKey(userId, guestId);
        const cart = await this.redisService.getCachedObject<Cart>(cartKey);
        if (cart && cart.items.length > 0) {
          effectiveItems = cart.items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            notes: i.notes,
          }));
        }
      } catch (_) {
        /* ignore Redis errors */
      }
    }

    // Fall back to items passed directly in the mutation (guest flow without cookie)
    if (effectiveItems.length === 0 && input.items && input.items.length > 0) {
      effectiveItems = input.items.map((i) => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        notes: i.notes,
      }));
    }

    if (effectiveItems.length === 0) {
      throw new BadRequestException('Cart is empty — add items before placing an order');
    }

    // Verify table exists
    const [table] = await this.databaseService.db
      .select()
      .from(tables)
      .where(eq(tables.id, input.tableId))
      .limit(1);

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Get menu item details and verify availability
    const menuItemIds = effectiveItems.map((item) => item.menuItemId);
    const menuItemsList = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(and(inArray(menuItems.id, menuItemIds), eq(menuItems.isAvailable, true)));

    // Create a map of available menu items for quick lookup
    const availableMenuItems = new Set(menuItemsList.map((item) => item.id));

    // Check if all requested menu items are available
    const unavailableItems = menuItemIds.filter((id) => !availableMenuItems.has(id));

    if (unavailableItems.length > 0) {
      throw new BadRequestException(`Menu items not available: ${unavailableItems.join(', ')}`);
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItemsData: Array<{
      menuItemId: string;
      quantity: number;
      price: any;
      notes?: string;
    }> = [];

    for (const cartItem of effectiveItems) {
      const menuItem = menuItemsList.find((item) => item.id === cartItem.menuItemId);
      if (!menuItem) continue;

      const itemTotal = Number(menuItem.price) * cartItem.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        menuItemId: cartItem.menuItemId,
        quantity: cartItem.quantity,
        price: menuItem.price,
        notes: cartItem.notes,
      });
    }

    // Create order in database
    const [newOrder] = await this.databaseService.db
      .insert(orders)
      .values({
        restaurantId: table.restaurantId,
        tableId: input.tableId,
        userId: userId || null,
        guestId: guestId || null,
        status: OrderStatus.PENDING,
        totalAmount: totalAmount.toString(),
        specialInstructions: input.specialInstructions,
      })
      .returning();

    if (!newOrder) {
      throw new Error('Failed to create order');
    }

    // Create order items
    for (const itemData of orderItemsData) {
      await this.databaseService.db.insert(orderItems).values({
        orderId: newOrder.id,
        menuItemId: itemData.menuItemId,
        quantity: itemData.quantity,
        price: itemData.price,
        notes: itemData.notes,
      });
    }

    // Clear the cart after successful order placement if a session exists
    if (userId || guestId) {
      await this.clearCart(userId, guestId);
    }

    // Emit WebSocket event for new order
    if (newOrder) {
      this.eventsGateway.emitOrderPlaced({
        orderId: newOrder.id,
        tableId: newOrder.tableId,
        restaurantId: newOrder.restaurantId,
        items: orderItemsData.map((item) => ({
          name: menuItemsList.find((mi) => mi.id === item.menuItemId)?.name || 'Unknown Item',
          quantity: item.quantity,
        })),
        totalAmount: totalAmount,
        createdAt: newOrder.createdAt || new Date(),
      });
    }

    return this.getOrderWithDetails(newOrder.id);
  }

  async getOrderWithDetails(orderId: string) {
    const [order] = await this.databaseService.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const [table] = await this.databaseService.db
      .select()
      .from(tables)
      .where(eq(tables.id, order.tableId))
      .limit(1);

    if (!table) {
      throw new NotFoundException('Table not found for order');
    }

    const orderItemsList = await this.databaseService.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const menuItemIds = orderItemsList.map((item) => item.menuItemId);
    const menuItemsDetails = await this.databaseService.db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, menuItemIds));

    const enrichedOrderItems = orderItemsList.map((item) => ({
      ...item,
      menuItem: menuItemsDetails.find((mi) => mi.id === item.menuItemId),
    }));

    const items: OrderItem[] = enrichedOrderItems
      .filter(
        (row): row is typeof row & { menuItem: NonNullable<(typeof row)['menuItem']> } =>
          row.menuItem != null,
      )
      .map((row) => ({
        id: row.id,
        quantity: row.quantity,
        price: parseFloat(String(row.price)),
        notes: row.notes ?? undefined,
        menuItem: menuItemFromDb(row.menuItem),
      }));

    const mapped: Order = {
      id: order.id,
      table,
      customer: undefined,
      guestId: order.guestId ?? undefined,
      items,
      status: orderStatusFromDb(order.status),
      totalAmount: parseFloat(String(order.totalAmount)),
      createdAt: order.createdAt!,
      updatedAt: order.updatedAt!,
    };

    return mapped;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, userId: string) {
    // Verify user has permission to update order status
    await this.verifyStaffPermission(userId);

    const [order] = await this.databaseService.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const [updatedOrder] = await this.databaseService.db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();

    // Emit WebSocket event for status change
    if (updatedOrder) {
      this.eventsGateway.emitOrderStatusChanged({
        orderId: updatedOrder.id,
        status: updatedOrder.status as OrderStatus,
        restaurantId: updatedOrder.restaurantId,
      });
    }

    if (!updatedOrder) {
      throw new Error('Failed to update order status');
    }
    return this.getOrderWithDetails(updatedOrder.id);
  }

  async getOrder(orderId: string) {
    return this.getOrderWithDetails(orderId);
  }

  async getMyOrders(userId?: string, guestId?: string) {
    const conditions = [];
    if (userId) conditions.push(eq(orders.userId, userId));
    if (guestId) conditions.push(eq(orders.guestId, guestId));

    if (conditions.length === 0) return [];

    const userOrders = await this.databaseService.db
      .select()
      .from(orders)
      .where(or(...conditions))
      .orderBy(orders.createdAt);

    return Promise.all(userOrders.map((order) => this.getOrderWithDetails(order.id)));
  }

  async getKitchenOrders(restaurantId?: string): Promise<Order[]> {
    const activeStatuses = [OrderStatus.PENDING, OrderStatus.COOKING, OrderStatus.READY];

    let query: any;
    if (restaurantId) {
      query = this.databaseService.db
        .select()
        .from(orders)
        .where(and(eq(orders.restaurantId, restaurantId), inArray(orders.status, activeStatuses)))
        .orderBy(orders.createdAt);
    } else {
      query = this.databaseService.db
        .select()
        .from(orders)
        .where(inArray(orders.status, activeStatuses))
        .orderBy(orders.createdAt);
    }

    const activeOrders = await query;
    return Promise.all(activeOrders.map((o: any) => this.getOrderWithDetails(o.id)));
  }

  private async verifyStaffPermission(userId: string) {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (
      !user ||
      (user.role !== 'waiter' &&
        user.role !== 'kitchen' &&
        user.role !== 'manager' &&
        user.role !== 'admin')
    ) {
      throw new ForbiddenException('Only staff members can update order status');
    }
  }
}
