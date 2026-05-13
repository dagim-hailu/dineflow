import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class MenuItem {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  nameAm?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  descriptionAm?: string;

  @Field(() => Float)
  price!: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  isAvailable!: boolean;

  @Field(() => Int, { nullable: true })
  prepTime?: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => ID)
  restaurantId!: string;
}

@ObjectType()
export class MenuCategory {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  nameAm?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  descriptionAm?: string;

  @Field(() => Int, { nullable: true })
  displayOrder?: number;

  @Field(() => [MenuItem])
  items!: MenuItem[];
}

@ObjectType()
export class Menu {
  @Field(() => [MenuCategory])
  categories!: MenuCategory[];

  @Field()
  restaurantId!: string;

  @Field()
  tableId!: string;
}
