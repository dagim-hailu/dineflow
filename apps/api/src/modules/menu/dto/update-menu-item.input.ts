import { InputType, Field, Float, Int, PartialType } from '@nestjs/graphql';
import { CreateMenuItemInput } from './create-menu-item.input';

@InputType()
export class UpdateMenuItemInput extends PartialType(CreateMenuItemInput) {
  @Field()
  id!: string;

  @Field({ nullable: true })
  isAvailable?: boolean;
}
