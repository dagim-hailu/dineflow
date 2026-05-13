import { Resolver, Query, Mutation, Args, ID, Subscription, Context } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { Order, OrderStatus } from './models/order.model';
import { Cart } from './models/cart.model';
import { AddToCartInput } from './dto/add-to-cart.input';
import { PlaceOrderInput } from './dto/place-order.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/models/user.model';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  private getGuestId(request: any): string | undefined {
    return request.cookies?.dineflow_guest;
  }

  // ─── Cart ───────────────────────────────────────────────────────────────────

  @Public()
  @Mutation(() => Cart, { name: 'addToCart' })
  async addToCart(
    @Args('input') input: AddToCartInput,
    @Context() context: any,
    @CurrentUser() user?: any,
  ): Promise<Cart> {
    const guestId = this.getGuestId(context.req);
    return this.orderService.addToCart(input, user?.id, guestId);
  }

  @Public()
  @Query(() => Cart, { name: 'cart' })
  async getCart(@Context() context: any, @CurrentUser() user?: any): Promise<Cart> {
    const guestId = this.getGuestId(context.req);
    return this.orderService.getCart(user?.id, guestId);
  }

  @Public()
  @Mutation(() => Cart, { name: 'removeFromCart' })
  async removeFromCart(
    @Args('menuItemId', { type: () => ID }) menuItemId: string,
    @Context() context: any,
    @CurrentUser() user?: any,
  ): Promise<Cart> {
    const guestId = this.getGuestId(context.req);
    return this.orderService.removeFromCart(menuItemId, user?.id, guestId);
  }

  @Public()
  @Mutation(() => Boolean, { name: 'clearCart' })
  async clearCart(@Context() context: any, @CurrentUser() user?: any): Promise<boolean> {
    const guestId = this.getGuestId(context.req);
    await this.orderService.clearCart(user?.id, guestId);
    return true;
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────

  @Public()
  @Mutation(() => Order, { name: 'placeOrder' })
  async placeOrder(
    @Args('input') input: PlaceOrderInput,
    @Context() context: any,
    @CurrentUser() user?: any,
  ): Promise<Order> {
    const guestId = this.getGuestId(context.req);
    return this.orderService.placeOrder(input, user?.id, guestId);
  }

  @Public()
  @Query(() => Order, { name: 'order' })
  async getOrder(@Args('id', { type: () => ID }) id: string): Promise<Order> {
    return this.orderService.getOrder(id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Order], { name: 'myOrders' })
  async getMyOrders(@CurrentUser() user: any): Promise<Order[]> {
    return this.orderService.getMyOrders(user.id);
  }

  /** Kitchen display: returns PENDING + COOKING + READY orders for the restaurant. */
  @Public()
  @Query(() => [Order], { name: 'kitchenOrders' })
  async getKitchenOrders(
    @Args('restaurantId', { type: () => ID, nullable: true }) restaurantId?: string,
  ): Promise<Order[]> {
    return this.orderService.getKitchenOrders(restaurantId);
  }

  // ─── Status updates ─────────────────────────────────────────────────────────

  /** Staff mutation — takes `id` (ID) to match the Order model primary key */
  @Mutation(() => Order, { name: 'updateOrderStatus' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.WAITER, UserRole.KITCHEN, UserRole.MANAGER, UserRole.ADMIN)
  async updateOrderStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
    @CurrentUser() user: any,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(id, status, user.id);
  }
}
