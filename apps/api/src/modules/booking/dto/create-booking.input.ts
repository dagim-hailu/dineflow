import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateBookingInput {
  @Field()
  restaurantId!: string;

  @Field()
  guestName!: string;

  @Field()
  guestEmail!: string;

  @Field({ nullable: true })
  guestPhone?: string;

  @Field()
  date!: string; // YYYY-MM-DD

  @Field()
  time!: string; // HH:MM

  @Field(() => Int)
  partySize!: number;

  @Field({ nullable: true })
  specialRequest?: string;
}
