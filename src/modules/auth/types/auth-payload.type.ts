import { UserRole } from '../../users/enums'

export type AuthPayload = {
  sub: string
  fullName: string
  roles?: UserRole[]
  jti?: string
}
