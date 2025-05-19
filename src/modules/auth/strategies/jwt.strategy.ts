import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'
import { AuthPayload } from '../types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name)

  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || '',
      passReqToCallback: true,
    })
  }

  async validate(request: any, payload: AuthPayload) {
    // Validate payload structure
    if (!payload.sub || !payload.jti) {
      this.logger.error('Invalid token payload: missing sub or jti')
      throw new UnauthorizedException('Invalid token payload')
    }

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request)

    if (!token) {
      this.logger.error('No token found in request')
      throw new UnauthorizedException('No token found in request')
    }

    const isValid = await this.authService.validateToken(token)
    if (!isValid) {
      this.logger.warn(`Token for user ${payload.sub} is invalid`)
      throw new UnauthorizedException('Token is invalid or has been revoked')
    }

    return payload
  }
}
