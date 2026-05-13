import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class AddToCartInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  menuItemId!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
