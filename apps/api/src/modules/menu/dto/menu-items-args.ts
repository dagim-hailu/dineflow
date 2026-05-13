import { ArgsType, Field, Int, ID } from '@nestjs/graphql';

@ArgsType()
export class MenuItemsArgs {
  @Field({ nullable: true })
  search?: string;

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => Boolean, { nullable: true })
  isAvailable?: boolean;

  @Field(() => ID, { nullable: true })
  restaurantId?: string;

  @Field(() => ID, { nullable: true })
  tableId?: string;

  @Field(() => Int, { defaultValue: 10 })
  limit!: number;

  @Field(() => Int, { defaultValue: 0 })
  offset!: number;
}
