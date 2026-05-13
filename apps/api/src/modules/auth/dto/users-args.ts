import { ArgsType, Field, Int } from '@nestjs/graphql';
import { UserRole } from '../models/user.model';

@ArgsType()
export class UsersArgs {
  @Field({ nullable: true })
  search?: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;

  @Field(() => Int, { defaultValue: 10 })
  limit!: number;

  @Field(() => Int, { defaultValue: 0 })
  offset!: number;
}
