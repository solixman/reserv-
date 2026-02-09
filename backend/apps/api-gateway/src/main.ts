import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from 'common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
