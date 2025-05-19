import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { instanceToPlain } from 'class-transformer'
import { Response } from 'express'
import { PaginateResult } from 'mongoose'

export interface PaginationMeta {
  totalItems: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T | null
  pagination?: PaginationMeta
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse<Response>()
    const statusCode = response.statusCode || HttpStatus.OK

    return next.handle().pipe(
      map((data: unknown) => {
        response.status(statusCode)

        return this.transformResponse(data, statusCode)
      }),
    )
  }

  private transformResponse(
    data: unknown,
    statusCode: number = HttpStatus.OK,
  ): ApiResponse<T> {
    const standardResponse: ApiResponse<T> = {
      statusCode,
      message: 'Success',
      data: null,
    }

    if (data === null || data === undefined) {
      return standardResponse
    }

    // Use a more specific type instead of 'any'
    const plainData = this.transformToPlain(data) as Record<string, unknown>

    if (plainData && typeof plainData === 'object') {
      // Check for statusCode
      if (
        'statusCode' in plainData &&
        typeof plainData.statusCode === 'number'
      ) {
        standardResponse.statusCode = plainData.statusCode
      }

      // Check for message
      if ('message' in plainData && typeof plainData.message === 'string') {
        standardResponse.message = plainData.message
      }

      // Check for data
      if ('data' in plainData) {
        standardResponse.data = plainData.data as T

        if (
          standardResponse.data &&
          typeof standardResponse.data === 'object' &&
          'items' in standardResponse.data &&
          'meta' in standardResponse.data
        ) {
          const { items, meta } = standardResponse.data as unknown as {
            items: T
            meta: Record<string, unknown>
          }

          standardResponse.data = items

          if (meta && typeof meta === 'object') {
            standardResponse.pagination = {
              totalItems:
                typeof meta.totalItems === 'number' ? meta.totalItems : 0,
              totalPages:
                typeof meta.totalPages === 'number' ? meta.totalPages : 0,
              currentPage:
                typeof meta.currentPage === 'number' ? meta.currentPage : 1,
              hasNextPage:
                meta.hasNextPage !== undefined
                  ? Boolean(meta.hasNextPage)
                  : typeof meta.currentPage === 'number' &&
                    typeof meta.totalPages === 'number' &&
                    meta.currentPage < meta.totalPages,
              hasPrevPage:
                meta.hasPrevPage !== undefined
                  ? Boolean(meta.hasPrevPage)
                  : typeof meta.currentPage === 'number' &&
                    meta.currentPage > 1,
            }
          }
        } else if (
          standardResponse.data &&
          typeof standardResponse.data === 'object' &&
          '_pagination' in standardResponse.data
        ) {
          const paginationResult = (
            standardResponse.data as unknown as {
              _pagination: PaginateResult<any>
            }
          )._pagination

          if (paginationResult) {
            standardResponse.pagination = {
              totalItems: paginationResult.totalDocs || 0,
              totalPages: paginationResult.totalPages || 0,
              currentPage: paginationResult.page || 1,
              hasNextPage: paginationResult.hasNextPage || false,
              hasPrevPage: paginationResult.hasPrevPage || false,
            }

            delete (standardResponse.data as Record<string, unknown>)
              ._pagination
          }
        }

        return standardResponse
      }

      if (
        'docs' in plainData &&
        'totalDocs' in plainData &&
        'page' in plainData &&
        'totalPages' in plainData
      ) {
        standardResponse.data = plainData.docs as T
        standardResponse.pagination = {
          totalItems: (plainData.totalDocs as number) || 0,
          totalPages: (plainData.totalPages as number) || 0,
          currentPage: (plainData.page as number) || 1,
          hasNextPage: (plainData.hasNextPage as boolean) || false,
          hasPrevPage: (plainData.hasPrevPage as boolean) || false,
        }
        return standardResponse
      }
    }

    standardResponse.data = plainData as unknown as T
    return standardResponse
  }

  private transformToPlain(data: unknown): unknown {
    // Handle null/undefined values
    if (data === null || data === undefined) {
      return null
    }

    // Handle arrays by recursively transforming each element
    if (Array.isArray(data)) {
      return data.map((item) => this.transformToPlain(item))
    }

    // Handle Date objects by converting to ISO string
    if (data instanceof Date) {
      return data.toISOString()
    }

    // Handle objects
    if (data && typeof data === 'object') {
      const dataObj = data as Record<string, unknown>

      // Use toJSON method if available (common in many libraries)
      if (typeof dataObj.toJSON === 'function') {
        return (dataObj.toJSON as () => unknown)()
      }

      // Handle Map objects by converting to plain objects
      if (data instanceof Map) {
        return this.transformToPlain(Object.fromEntries(data))
      }

      // Handle Set objects by converting to arrays
      if (data instanceof Set) {
        return this.transformToPlain(Array.from(data))
      }

      // Handle plain objects by recursively transforming each property
      if (Object.getPrototypeOf(data) === Object.prototype) {
        const result: Record<string, unknown> = {}
        for (const key in dataObj) {
          if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
            result[key] = this.transformToPlain(dataObj[key])
          }
        }
        return result
      }
    }

    // For class instances, use class-transformer's instanceToPlain
    // If that fails, return the original data
    try {
      return instanceToPlain(data)
    } catch {
      return data
    }
  }
}
