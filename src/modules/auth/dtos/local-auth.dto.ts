import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LocalLoginDto {
  @ApiProperty({ type: String, example: 'john_doe123' })
  @IsString()
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  @IsNotEmpty()
  username: string

  @ApiProperty({
    type: String,
    example: 'john_doe123',
  })
  @IsString()
  @Length(8, 100, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/,
    {
      message:
        'Password must contain at least one uppercase letter, one number, and one special character',
    },
  )
  @IsNotEmpty()
  password: string
}

export class LocalRegisterDto extends LocalLoginDto {
  @ApiProperty({
    type: String,
    example: 'Joe Doe',
  })
  @IsString()
  @Length(1, 50)
  @IsNotEmpty()
  fullName: string
}
