import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MenuItem } from './menu-item.model';

@ObjectType()
export class PaginatedMenuItems {
  @Field(() => [MenuItem])
  items!: MenuItem[];

  @Field(() => Int)
  totalCount!: number;
}
