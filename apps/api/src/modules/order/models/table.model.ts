import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Table {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  restaurantId!: string;

  @Field(() => Int)
  tableNumber!: number;

  @Field()
  qrUuid!: string;

  @Field(() => String)
  status!: string;

  @Field(() => ID, { nullable: true })
  currentWaiterId?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
