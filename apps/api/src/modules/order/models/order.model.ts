import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { MenuItem } from '../../menu/models/menu-item.model';
import { User } from '../../auth/models/user.model';
import { Table } from './table.model';

@ObjectType()
export class OrderItem {
  @Field(() => ID)
  id!: string;

  @Field(() => MenuItem)
  menuItem!: MenuItem;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Float)
  price!: number; // snapshot of price at order time

  @Field({ nullable: true })
  notes?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  READY = 'READY',
  SERVED = 'SERVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'The status of an order',
});

@ObjectType()
export class Order {
  @Field(() => ID)
  id!: string;

  @Field(() => Table)
  table!: Table;

  @Field(() => User, { nullable: true })
  customer?: User;

  @Field({ nullable: true })
  guestId?: string;

  @Field(() => [OrderItem])
  items!: OrderItem[];

  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field(() => Float)
  totalAmount!: number;

  @Field({ nullable: true })
  specialInstructions?: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
