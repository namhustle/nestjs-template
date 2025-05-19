import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { AuthPayload } from '../types'

export const AuthUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>()

    return request.user as AuthPayload
  },
)
