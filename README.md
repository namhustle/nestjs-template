A comprehensive and production-ready NestJS template for building scalable backend applications. This template provides a solid foundation with essential features pre-configured, allowing developers to focus on building business logic rather than setting up infrastructure.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Key Features

- **Authentication System**: Complete JWT-based auth with local login/register and refresh token functionality
- **MongoDB Integration**: Configured with Mongoose for data persistence with pagination support
- **Redis Caching**: Implemented with cache manager for improved performance
- **API Documentation**: Swagger UI setup with versioning support
- **Docker Ready**: Includes Dockerfile and docker-compose for easy deployment
- **Validation**: Request validation using class-validator
- **Role-Based Access Control**: User roles and permissions system
- **Standardized Response Format**: Consistent API responses with interceptors

The template follows best practices for NestJS development with a modular architecture, making it easy to extend and customize for your specific project needs.

## Project Setup

```bash
$ npm install
```

## Compile and Run the Project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment with Docker

The project is pre-configured for Docker deployment. You can use docker-compose to start the entire system including MongoDB and Redis:

```bash
$ docker-compose up -d
```

## Project Structure

```
src/
├── common/              # Common components (decorators, interceptors, etc.)
├── modules/             # Feature modules
│   ├── auth/            # Authentication module
│   ├── db/              # Database connection module
│   └── users/           # User management module
└── main.ts              # Application entry point
```

## API Documentation

After starting the application, you can access the Swagger documentation at:

```
http://localhost:3000/docs
```

## Environment Variables

Copy the `.env.example` file to `.env` and configure the environment variables:

```
# Application
PORT=3000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/your_database

# Redis
REDIS_URI=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```
