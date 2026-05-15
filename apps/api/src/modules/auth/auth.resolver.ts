import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthPayload, GuestSession, User } from './models/user.model';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { GuestSessionInput } from './dto/guest-session.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { PaginatedUsers } from './models/paginated-users.model';
import { UsersArgs } from './dto/users-args';
import { UserRole } from './models/user.model';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload)
  async register(
    @Args('input') input: RegisterInput,
    @Context() ctx: { req: Request; res: Response },
  ): Promise<AuthPayload> {
    try {
      const user = await this.authService.register(input);
      const { accessToken } = await this.authService.login(user);

      // Set HTTP-only cookie
      ctx.res.cookie('dineflow_token', accessToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'lax',
        maxAge: user.role === 'customer' ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      });

      return { user, accessToken };
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx: { req: Request; res: Response },
  ): Promise<AuthPayload> {
    try {
      const user = await this.authService.validateUser(input.email, input.password);
      const { accessToken } = await this.authService.login(user);

      // Set HTTP-only cookie
      ctx.res.cookie('dineflow_token', accessToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'lax',
        maxAge: user.role === 'customer' ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      });

      return { user, accessToken };
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Mutation(() => GuestSession)
  async guestSession(
    @Args('input') input: GuestSessionInput,
    @Context() ctx: { req: Request; res: Response },
  ): Promise<GuestSession> {
    try {
      const { token, sessionId, expiresAt } = this.authService.generateGuestToken(input.tableId);

      // Set HTTP-only guest cookie with 15-minute expiry
      ctx.res.cookie('dineflow_guest', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      return {
        token,
        sessionId,
        expiresAt,
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async me(@CurrentUser() user: any): Promise<User> {
    try {
      // For guest users, return a minimal user object
      if (user.type === 'guest') {
        return {
          id: user.sessionId,
          role: 'customer' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // For authenticated users, return full user data
      const fullUser = await this.authService.findUserById(user.id);
      if (!fullUser) {
        throw new Error('User not found');
      }

      return fullUser;
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: { req: Request; res: Response }): Promise<boolean> {
    try {
      // Clear both authentication cookies
      ctx.res.clearCookie('dineflow_token');
      ctx.res.clearCookie('dineflow_guest');

      return true;
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Mutation(() => AuthPayload)
  async refreshToken(@Args('token') token: string): Promise<AuthPayload> {
    try {
      // This would typically validate the old token and issue a new one
      // For now, we'll just return the same token (implementation would vary)
      throw new Error('Refresh token not implemented');
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @CurrentUser() user: any,
  ): Promise<User> {
    return this.authService.updateProfile(user.id, input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @Query(() => PaginatedUsers)
  async paginatedUsers(@Args() args: UsersArgs): Promise<PaginatedUsers> {
    return this.authService.getPaginatedUsers(args);
  }
}
