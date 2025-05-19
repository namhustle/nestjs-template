import { SetMetadata } from '@nestjs/common'
import { UserRole } from '../../users/enums'
import { ROLES_KEY } from '../../../common/constants'

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
