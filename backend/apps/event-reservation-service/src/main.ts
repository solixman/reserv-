import { NestFactory } from '@nestjs/core';
import { EventReservationServiceModule } from './event-reservation-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EventReservationServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'reserve-event',
        port: 3002,
      },
    },
  );
  await app.listen();
}
bootstrap();
