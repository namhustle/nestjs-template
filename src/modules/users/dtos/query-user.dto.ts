import { PaginationDto } from '../../../common/dtos'
import { ApiProperty } from '@nestjs/swagger'
import { UserGender, UserRole } from '../enums'
import { IsArray, IsEnum, IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'

export class QueryUserDto extends PaginationDto {
  @ApiProperty({
    enum: UserGender,
    enumName: 'UserGender',
    example: UserGender.MALE,
    required: false,
  })
  @IsEnum(UserGender, {
    message: `Gender must be one of: ${Object.values(UserGender).join(', ')}`,
  })
  @IsOptional()
  gender?: UserGender

  @ApiProperty({
    type: [String],
    enum: UserRole,
    enumName: 'UserRole',
    example: [UserRole.USER],
    required: false,
  })
  @IsArray({ message: `Roles must be an array` })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value]
    if (Array.isArray(value)) return value
    if (value === undefined || value === null) return undefined
    return [value]
  })
  @IsEnum(UserRole, {
    each: true,
    message: `Roles must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  @IsOptional()
  roles?: UserRole[]
}
