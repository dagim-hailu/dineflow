import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, MinLength } from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  preferences?: string; // JSON string
}
