import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { LocalRegisterDto } from './dtos'
import { UserService } from '../users/user.service'
import * as bcrypt from 'bcrypt'
import { UserDocument } from '../users/schemas'
import { JwtService } from '@nestjs/jwt'
import { Cache } from 'cache-manager'
import { TokenPayload, TokenResponse } from './interfaces/token.interface'
import { UserRole } from '../users/enums'
import { ConfigService } from '@nestjs/config'
import { v4 } from 'uuid'
import { REFRESH_TOKEN_EXPIRES_IN } from '../../common/constants'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async localRegister(payload: LocalRegisterDto) {
    const existingUser = await this.userService.exists({
      username: payload.username,
    })
    if (existingUser) throw new ConflictException('Username already exists')
    const { password, ...subPayload } = payload
    const user = await this.userService.create({
      hashedPassword: bcrypt.hashSync(password, 10),
      ...subPayload,
    })

    return user.toJSON() as UserDocument
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const payload: TokenPayload | null = this.jwtService.decode(token)
      if (!payload?.jti || !payload?.sub) {
        this.logger.error('Invalid token payload: missing jti or sub')
        return false
      }

      // Check if token is blacklisted
      if (await this.cacheManager.get(`token_blacklist:${payload.jti}`)) {
        this.logger.warn(`Token with jti ${payload.jti} is blacklisted`)
        return false
      }

      // Check if token was issued before password change
      if (payload.iat) {
        const tokenIatAvailable = await this.cacheManager.get<number>(
          `token_iat_available:${payload.sub}`,
        )

        if (tokenIatAvailable && payload.iat < tokenIatAvailable) {
          this.logger.warn(
            `Token for user ${payload.sub} was issued before password change`,
          )
          return false
        }
      }

      return true
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to validate token: ${errorMessage}`)
      return false
    }
  }

  async localLogin(user: Express.User | undefined): Promise<TokenResponse> {
    const userDoc = user as unknown as UserDocument
    if (!userDoc._id || !userDoc.fullName || !userDoc.roles) {
      throw new UnauthorizedException('Invalid user data')
    }

    return this.generateTokens(
      userDoc._id.toString(),
      userDoc.fullName,
      userDoc.roles || [],
    )
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload: TokenPayload | object = this.jwtService.verify(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      )
      const { sub, jti, exp } = payload as TokenPayload
      const user = await this.userService.findOne({ _id: sub })
      if (!user) throw new Error('User not found')

      await this.revokeToken(jti, exp)

      return this.generateTokens(
        user._id.toString(),
        user.fullName,
        user.roles || [],
      )
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to validate token: ${errorMessage}`)
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    const accessTokenPayload: TokenPayload =
      await this.jwtService.decode(accessToken)
    const refreshTokenPayload: TokenPayload =
      await this.jwtService.decode(refreshToken)

    await Promise.all([
      this.revokeToken(accessTokenPayload.jti, accessTokenPayload.exp),
      this.revokeToken(refreshTokenPayload.jti, refreshTokenPayload.exp),
    ])
  }

  private async generateTokens(
    userId: string,
    fullName: string,
    roles: UserRole[],
  ): Promise<TokenResponse> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.sign(
          {
            sub: userId,
            jti: v4(),
            fullName,
            roles,
          },
          {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          },
        ),
        this.jwtService.sign(
          {
            sub: userId,
            jti: v4(),
          },
          {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
          },
        ),
      ])

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to generate tokens: ${errorMessage}`)
      throw new UnauthorizedException(
        `Failed to generate tokens: ${errorMessage}`,
      )
    }
  }

  private async revokeToken(jti: string, exp: number): Promise<void> {
    try {
      // Calculate TTL based on token expiration
      const now = Math.floor(Date.now() / 1000)
      const ttl = Math.max(exp - now, 0) * 1000

      // Add token to blacklist
      await this.cacheManager.set(`token_blacklist:${jti}`, true, ttl)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to validate token: ${errorMessage}`)
      throw new Error('Failed to revoke token')
    }
  }
}
