import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator'
import { UserGender } from '../enums'

export class UpdateProfileDto {
  @ApiPropertyOptional({
    type: String,
    example: 'Joe Doe',
  })
  @IsString()
  @Length(1, 50)
  @IsOptional()
  fullName?: string

  @ApiPropertyOptional({
    type: String,
    example: 'johndoe123',
  })
  @IsString()
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  @IsOptional()
  username?: string

  @ApiPropertyOptional({
    enum: UserGender,
    enumName: 'UserGender',
    example: UserGender.MALE,
  })
  @IsEnum(UserGender, {
    message: `Gender must be one of: ${Object.values(UserGender).join(', ')}`,
  })
  @IsOptional()
  gender?: UserGender
}
