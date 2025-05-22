import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserService } from './user.service'
import { QueryUserDto, UpdateProfileDto, UpdateUserDto } from './dtos'
import { AuthUser, Roles } from '../auth/decorators'
import { UserRole } from './enums'
import { AuthPayload } from '../auth/types'

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of users' })
  async paginateUsers(@Query() query: QueryUserDto) {
    return {
      message: 'List of users found',
      data: await this.userService.paginate(query),
    }
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get profile' })
  async getProfile(@AuthUser() authUser: AuthPayload) {
    return {
      message: 'Profile found',
      data: await this.userService.findOneById(authUser.sub),
    }
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(
    @AuthUser() authUser: AuthPayload,
    @Body() payload: UpdateProfileDto,
  ) {
    return {
      message: 'Profile updated',
      data: await this.userService.findOneAndUpdate(
        { _id: authUser.sub },
        payload,
      ),
    }
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user by userId' })
  async findUserById(@Param('userId') userId: string) {
    return {
      message: 'User found',
      data: await this.userService.findOneById(userId),
    }
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update a user' })
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Param('userId') userId: string,
    @Body() payload: UpdateUserDto,
  ) {
    return {
      message: 'User updated',
      data: await this.userService.findOneAndUpdate({ _id: userId }, payload),
    }
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete a user' })
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('userId') userId: string) {
    return {
      message: 'User deleted',
      data: await this.userService.deleteOne({ _id: userId }),
    }
  }
}
