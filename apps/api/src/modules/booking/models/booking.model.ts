import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Booking {
  @Field(() => ID)
  id!: string;

  @Field()
  restaurantId!: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field({ nullable: true })
  guestEmail?: string;

  @Field({ nullable: true })
  guestName?: string;

  @Field({ nullable: true })
  guestPhone?: string;

  @Field()
  date!: string;

  @Field()
  time!: string;

  @Field(() => Int)
  partySize!: number;

  @Field()
  status!: string;

  @Field({ nullable: true })
  specialRequest?: string;

  @Field(() => ID, { nullable: true })
  tableId?: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
