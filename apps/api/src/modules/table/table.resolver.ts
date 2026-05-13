import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { TableService } from './table.service';
import { Table } from '../order/models/table.model';
import { UseGuards, Optional } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Resolver(() => Table)
export class TableResolver {
  constructor(private readonly tableService: TableService) {}

  /** Returns all tables — accessible by staff. Used by waiter dashboard. */
  @Public()
  @Query(() => [Table], { name: 'tables' })
  async getTables(
    @Args('restaurantId', { type: () => ID, nullable: true }) restaurantId?: string,
  ): Promise<Table[]> {
    const rows = await this.tableService.getTables(restaurantId);
    return rows.map((t) => ({
      id: t.id,
      restaurantId: t.restaurantId,
      tableNumber: t.tableNumber,
      qrUuid: t.qrUuid,
      status: t.status,
      currentWaiterId: t.currentWaiterId ?? null,
      createdAt: t.createdAt!,
      updatedAt: t.updatedAt!,
    }));
  }

  @Public()
  @Query(() => Table, { name: 'table', nullable: true })
  async getTable(@Args('id', { type: () => ID }) id: string): Promise<Table | null> {
    const t = await this.tableService.getTableById(id);
    if (!t) return null;
    return {
      id: t.id,
      restaurantId: t.restaurantId,
      tableNumber: t.tableNumber,
      qrUuid: t.qrUuid,
      status: t.status,
      currentWaiterId: t.currentWaiterId ?? null,
      createdAt: t.createdAt!,
      updatedAt: t.updatedAt!,
    };
  }
}
