import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'

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

  // Interceptors

  // Pipes

  // Open APIs

  await app.listen(config.get<number>('PORT') ?? 3000)
  return app.getUrl()
}
bootstrap().then((url) => {
  console.log(`Server is running on: ${url}`)
})
