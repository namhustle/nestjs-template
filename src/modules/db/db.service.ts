import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection } from 'mongoose'

@Injectable()
export class DbService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DbService.name)

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onApplicationBootstrap() {
    try {
      if (this.connection.readyState === 1) {
        this.logger.log('MongoDB connection established successfully')
      } else {
        this.logger.error('Failed to connect to MongoDB')
      }
    } catch (error) {
      this.logger.error(
        `MongoDB connection error: ${error.message}`,
        error.stack,
      )
    }
  }

  getConnection(): Connection {
    return this.connection
  }

  async isConnected(): Promise<boolean> {
    return this.connection.readyState === 1
  }

  async runMigrations() {}
}