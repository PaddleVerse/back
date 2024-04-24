import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(express.json()); // Add this line if not already present
  app.use(cookieParser());
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  app.enableCors({
      origin: '*',
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
      credentials: true
  });
  
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(8080);
}
bootstrap();
