import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // If no @Roles decorator present, allow (endpoint may be public or auth-only)
    if (required === undefined) return true;
    // Explicit @Roles() with empty list means deny by default (no role may perform this action)
    if (required.length === 0) throw new ForbiddenException('Action not permitted');
    const { user } = context.switchToHttp().getRequest();
    const roles: string[] = user?.roles || [];
    const ok = required.some((r) => roles.includes(r));
    if (!ok) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
