import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min, Max } from 'class-validator';

@InputType()
export class CreateMenuItemInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nameAm?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descriptionAm?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prepTime?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field()
  @IsString()
  restaurantId!: string;
}
