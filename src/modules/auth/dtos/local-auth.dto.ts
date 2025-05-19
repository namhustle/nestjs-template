import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LocalRegisterDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  fullName: string

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  password: string
}

export class LocalLoginDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  password: string
}
