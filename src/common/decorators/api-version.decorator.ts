import { applyDecorators, Version } from '@nestjs/common'
import { ApiHeader, ApiOperation } from '@nestjs/swagger'

/**
 * Decorator to document API version in Swagger
 * @param version API version
 * @param options Additional ApiOperation options
 */
export function ApiVersioned(
  version: string,
  options: Partial<{ summary: string; description: string }> = {},
) {
  return applyDecorators(
    Version(version),
    ApiOperation({
      summary: options.summary || '',
      description: `${options.description || ''}\n\n**Version:** ${version}\n\n**Required Header:** \`Accept: application/json;v=${version}\``,
    }),
    ApiHeader({
      name: 'Accept',
      description: `API version header. Use: application/json;v=${version}`,
      required: true,
      schema: {
        type: 'string',
        default: `application/json;v=${version}`,
      },
    }),
  )
}
