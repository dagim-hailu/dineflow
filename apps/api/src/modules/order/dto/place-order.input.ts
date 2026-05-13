import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddToCartInput } from './add-to-cart.input';

@InputType()
export class PlaceOrderInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  tableId!: string;

  /** Items are stored in the Redis cart; this field is optional and ignored by the service. */
  @Field(() => [AddToCartInput], { nullable: true, defaultValue: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddToCartInput)
  items?: AddToCartInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
