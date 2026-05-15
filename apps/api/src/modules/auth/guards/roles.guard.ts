import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '../models/user.model';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    console.log('[RolesGuard] Checking roles for user:', user?.id, 'Role:', user?.role);
    console.log('[RolesGuard] Required roles:', requiredRoles);

    if (!user) {
      console.log('[RolesGuard] No user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      console.log('[RolesGuard] Role mismatch. User role:', user.role, 'is not in:', requiredRoles);
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
