import { NestFactory } from '@nestjs/core';
import { EventReservationServiceModule } from './event-reservation-service.module';

async function bootstrap() {
  const app = await NestFactory.create(EventReservationServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
