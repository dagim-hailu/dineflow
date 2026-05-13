import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { MenuService } from './menu.service';
import { Menu, MenuItem } from './models/menu-item.model';
import { CreateMenuItemInput } from './dto/create-menu-item.input';
import { UpdateMenuItemInput } from './dto/update-menu-item.input';
import { MenuItemsArgs } from './dto/menu-items-args';
import { PaginatedMenuItems } from './models/paginated-menu-items.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/models/user.model';
import { Public } from '../auth/decorators/public.decorator';

@Resolver(() => Menu)
export class MenuResolver {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Query(() => Menu, { name: 'menu' })
  async getMenuByTableId(@Args('tableId', { type: () => ID }) tableId: string): Promise<Menu> {
    return this.menuService.getMenuByTableId(tableId);
  }

  @Public()
  @Query(() => MenuItem, { name: 'menuItem' })
  async getMenuItemById(@Args('id', { type: () => ID }) id: string): Promise<MenuItem> {
    return this.menuService.getMenuItemById(id);
  }

  @Public()
  @Query(() => [MenuItem], { name: 'menuItemsByRestaurant' })
  async getMenuItemsByRestaurant(
    @Args('restaurantId', { type: () => ID }) restaurantId: string,
  ): Promise<MenuItem[]> {
    return this.menuService.getMenuItemsByRestaurant(restaurantId);
  }

  @Mutation(() => MenuItem, { name: 'createMenuItem' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async createMenuItem(
    @Args('input') input: CreateMenuItemInput,
    @CurrentUser() user: any,
  ): Promise<MenuItem> {
    return this.menuService.createMenuItem(input, user.id);
  }

  @Mutation(() => MenuItem, { name: 'updateMenuItem' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async updateMenuItem(
    @Args('input') input: UpdateMenuItemInput,
    @CurrentUser() user: any,
  ): Promise<MenuItem> {
    return this.menuService.updateMenuItem(input, user.id);
  }

  @Mutation(() => Boolean, { name: 'deleteMenuItem' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async deleteMenuItem(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.menuService.deleteMenuItem(id, user.id);
  }

  @Mutation(() => MenuItem, { name: 'toggleMenuItemAvailability' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.KITCHEN, UserRole.ADMIN)
  async toggleMenuItemAvailability(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<MenuItem> {
    return this.menuService.toggleAvailability(id, user.id);
  }

  @Public()
  @Query(() => [MenuItem], { name: 'menuItemsByTable' })
  async getMenuItemsByTable(
    @Args('tableId', { type: () => ID }) tableId: string,
  ): Promise<MenuItem[]> {
    return this.menuService.findByTable(tableId);
  }

  @Public()
  @Query(() => PaginatedMenuItems, { name: 'paginatedMenuItems' })
  async paginatedMenuItems(@Args() args: MenuItemsArgs): Promise<PaginatedMenuItems> {
    return this.menuService.getPaginatedMenuItems(args);
  }
}
