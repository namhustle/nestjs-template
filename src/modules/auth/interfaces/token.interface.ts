import { UserRole } from '../../users/enums'

export interface TokenResponse {
  access_token: string
  refresh_token: string
}

export interface TokenPayload {
  sub: string
  jti: string
  fullName?: string
  roles: UserRole[]
  iat: number
  exp: number
}
