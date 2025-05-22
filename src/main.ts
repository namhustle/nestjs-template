import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common'
import { ResponseInterceptor } from './common/interceptors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get<ConfigService>(ConfigService)

  // CORS
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  })

  // Filters
  app.useGlobalFilters()

  // Interceptors
  app.useGlobalInterceptors(new ResponseInterceptor())

  // Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) =>
          error.constraints ? Object.values(error.constraints) : [],
        )

        return new BadRequestException(messages)
      },
    }),
  )

  // Versioning
  app.enableVersioning({
    type: VersioningType.MEDIA_TYPE,
    key: 'v=',
  })

  // Open APIs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nestjs template APIs')
    .setVersion('1')
    .addServer(
      `http://localhost:${config.get('PORT')}`,
      `Development API[PORT=${config.get('PORT')}]`,
    )
    .addBearerAuth({
      description: `Please enter token in following format: Bearer <JWT>`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .setDescription(
      `
      ## API Versioning
      This API uses Media Type Versioning. When making requests, include the header:
      \`\`\`
      Accept: application/json;v=1
      \`\`\`
      All endpoints require this header with the appropriate version.
    `,
    )
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  })

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Template NestJS API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'agate',
      },
      requestInterceptor: (req: { headers: { [x: string]: string } }) => {
        if (!req.headers['Accept']) {
          req.headers['Accept'] = 'application/json;v=1'
        }
        return req
      },
    },
  })

  await app.listen(config.get<number>('PORT') ?? 3000)

  return app.getUrl()
}
void bootstrap().then((url) => {
  console.log(`Server is running on: ${url}`)
})
