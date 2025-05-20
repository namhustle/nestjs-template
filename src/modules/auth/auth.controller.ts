import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  UseGuards,
  // Version,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalLoginDto, LocalRegisterDto, RefreshTokenDto } from './dtos'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from './decorators'
import { LocalAuthGuard } from './guards'
import { Request } from 'express'
//import { ApiVersioned } from '../../common/decorators'

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Version('1')
  // @ApiVersioned('1')
  @Post('local/register')
  @Public()
  @ApiOperation({ summary: 'Register a local user' })
  async localRegister(@Body() payload: LocalRegisterDto) {
    return {
      message: 'Register successfully',
      data: await this.authService.localRegister(payload),
    }
  }

  @Post('local/login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login a local user' })
  async localLogin(@Body() payload: LocalLoginDto, @Req() req: Request) {
    return {
      message: 'Login successfully',
      data: await this.authService.localLogin(req.user),
    }
  }

  @Post('refresh-token')
  @Public()
  @ApiOperation({ summary: 'Refresh a token' })
  async refreshToken(@Body() payload: RefreshTokenDto) {
    return {
      message: 'Refresh token successfully',
      data: await this.authService.refreshToken(payload.refreshToken),
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout a user' })
  async logout(@Body() payload: RefreshTokenDto, @Req() req: Request) {
    // Extract access token from Authorization header
    const authHeader = req.headers.authorization
    const accessToken: string | undefined = authHeader?.split(' ')[1]
    if (!accessToken) {
      throw new NotFoundException('No access token found in request')
    }

    // Logout with both refresh token and access token
    await this.authService.logout(payload.refreshToken, accessToken)

    return {
      message: 'Logout successfully',
    }
  }
}
