import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_ANY_KEY, PERMISSIONS_KEY } from './require-permissions.decorator';
import { PermissionsService } from './permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissions: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const all = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    const any = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_ANY_KEY, [context.getHandler(), context.getClass()]);
    if (all === undefined && any === undefined) return true;
    if ((all && all.length === 0) || (any && any.length === 0)) {
      throw new ForbiddenException('Action not permitted');
    }

    const req = context.switchToHttp().getRequest();
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();

    const access = await this.permissions.getEffectiveAccess(userId);
    if (access.permissions.length === 0) throw new ForbiddenException('Insufficient permissions');

    const allOk = !all || all.every((code) => access.permissions.includes(code));
    const anyOk = !any || any.some((code) => access.permissions.includes(code));
    if (!allOk || !anyOk) throw new ForbiddenException('Insufficient permissions');

    req.effectiveAccess = access;
    return true;
  }
}
