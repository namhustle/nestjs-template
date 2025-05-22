import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    type: Number,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    type: Number,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10

  @ApiPropertyOptional({
    description:
      'Field to sort by, format: fieldName:asc|desc (e.g. createdAt:desc)',
    example: 'createdAt:desc',
    type: String,
  })
  @IsString({ message: 'Sort must be a string' })
  @IsOptional()
  sort?: string = 'createdAt:desc'

  @ApiPropertyOptional({
    description: 'Search term to filter results',
    type: String,
  })
  @IsString({ message: 'Search term must be a string' })
  @IsOptional()
  search?: string

  getSortObject(): Record<string, 1 | -1> {
    if (!this.sort) {
      return { createdAt: -1 } // Default sort
    }

    const sortObject: Record<string, 1 | -1> = {}
    const sortFields = this.sort.split(',')

    sortFields.forEach((sortItem) => {
      const [field, order] = sortItem.trim().split(':')
      if (field) {
        sortObject[field] = order?.toLowerCase() === 'desc' ? -1 : 1
      }
    })

    // If no valid sort fields were found, use default
    if (Object.keys(sortObject).length === 0) {
      return { createdAt: -1 }
    }

    return sortObject
  }
}
