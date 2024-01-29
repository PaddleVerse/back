import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(express.json()); // Add this line if not already present
  app.use(cookieParser());

  app.enableCors({
      origin: 'http://localhost:3000',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(8080);
}
bootstrap();
