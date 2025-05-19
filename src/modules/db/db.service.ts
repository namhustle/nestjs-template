import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, ConnectionStates } from 'mongoose'

@Injectable()
export class DbService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DbService.name)

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onApplicationBootstrap() {
    try {
      if (this.connection.readyState === ConnectionStates.connected) {
        this.logger.log('MongoDB connection established successfully')
      } else {
        this.logger.error('Failed to connect to MongoDB')
      }
    } catch (error) {
      const err = error as Error
      this.logger.error(`MongoDB connection error: ${err.message}`, err.stack)
    }
  }

  getConnection(): Connection {
    return this.connection
  }

  isConnected(): boolean {
    return this.connection.readyState === ConnectionStates.connected
  }

  async runMigrations() {}
}
