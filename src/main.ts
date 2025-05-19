import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
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

  // Open APIs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nestjs template APIs')
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
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  })
  SwaggerModule.setup('docs', app, document, {
    customCssUrl: '.',
    swaggerOptions: {
      persistAuthorization: true,
      uiConfig: {
        docExpansion: 'none',
      },
      docExpansion: 'none',
    },
  })

  await app.listen(config.get<number>('PORT') ?? 3000)

  return app.getUrl()
}
void bootstrap().then((url) => {
  console.log(`Server is running on: ${url}`)
})
