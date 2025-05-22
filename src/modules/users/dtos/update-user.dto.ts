import { UserRole } from '../enums'
import { IsArray, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UpdateProfileDto } from './update-profile.dto'

export class UpdateUserDto extends UpdateProfileDto {
  @ApiProperty({
    type: [String],
    enum: UserRole,
    enumName: 'UserRole',
    example: [UserRole.USER],
    required: false,
  })
  @IsArray({ message: `Role must be an array` })
  @IsEnum(UserRole, {
    each: true,
    message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  @IsOptional()
  roles?: UserRole[]
}
