import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class GuestSessionInput {
  @Field(() => ID)
  @IsUUID()
  tableId: string;
}
