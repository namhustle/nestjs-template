import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface PaginationMetadata {
  totalItems: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ApiResponse<T> {
  statusCode: number
  message: string
  data?: T | undefined
  pagination?: PaginationMetadata | undefined
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse()

    return next.handle().pipe(
      map((res) => {
        return {
          statusCode: response.statusCode || HttpStatus.OK,
          message: res.message || 'OK',
          data: this.transformData(res.data),
          pagination: res.pagination ? res.pagination : undefined,
        }
      }),
    )
  }

  private transformData(data: any): any {
    if (data === null || data === undefined) {
      return undefined
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transformData(item))
    }

    if (data && typeof data === 'object') {
      if (typeof data.toJSON === 'function') {
        return data.toJSON()
      }

      return data
    }
  }
}
