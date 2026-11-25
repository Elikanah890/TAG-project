import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Roles are always loaded from the database (never trusted from the token)
   * so that role revocation and account suspension take effect immediately.
   */
  async validate(payload: any) {
    if (!payload?.sub) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new UnauthorizedException();
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');
    const roles = user.roles.filter((ur) => ur.role.isActive).map((ur) => ur.role.name);
    return { userId: user.id, email: user.email, roles };
  }
}
