import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator'
import { UserGender } from '../enums'

export class UpdateProfileDto {
  @ApiProperty({
    type: String,
    example: 'Joe Doe',
    required: false,
  })
  @IsString()
  @Length(1, 50)
  @IsOptional()
  fullName?: string

  @ApiProperty({
    type: String,
    example: 'johndoe123',
    required: false,
  })
  @IsString()
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  @IsOptional()
  username?: string

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
}
