import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  WAITER = 'waiter',
  KITCHEN = 'kitchen',
  CUSTOMER = 'customer',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The role of the user in the system',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field(() => UserRole)
  role!: UserRole;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  profileImageUrl?: string;

  @Field(() => String, { nullable: true })
  preferences?: string; // JSON string of preferences

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class AuthPayload {
  @Field(() => User)
  user!: User;
}

@ObjectType()
export class GuestSession {
  @Field()
  token!: string;

  @Field()
  sessionId!: string;

  @Field()
  expiresAt!: Date;
}
