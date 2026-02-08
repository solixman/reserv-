import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    const logger = new Logger('RolesGuard');
    logger.log(`Required roles: ${JSON.stringify(requiredRoles)}`);
    logger.log(`User from request: ${JSON.stringify(user)}`);

    if (!user || !requiredRoles.includes(user.role)) {
      logger.warn(`Access denied for user: ${user?.email || 'unknown'}`);
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
