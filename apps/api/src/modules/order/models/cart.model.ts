import { ObjectType, Field, ID } from '@nestjs/graphql';
import { OrderItem } from './order.model';

@ObjectType()
export class CartItem {
  @Field(() => ID)
  menuItemId!: string;

  @Field(() => ID)
  menuItemName!: string;

  @Field()
  quantity!: number;

  @Field()
  price!: number;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  addedAt!: Date;
}

@ObjectType()
export class Cart {
  @Field(() => [CartItem])
  items!: CartItem[];

  @Field(() => ID, { nullable: true })
  tableId?: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field()
  totalAmount!: number;
}
