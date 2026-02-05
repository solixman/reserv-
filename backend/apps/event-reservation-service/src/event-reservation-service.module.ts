import { Module } from '@nestjs/common';
import { EventReservationServiceController } from './event-reservation-service.controller';
import { EventReservationServiceService } from './event-reservation-service.service';

@Module({
  imports: [],
  controllers: [EventReservationServiceController],
  providers: [EventReservationServiceService],
})
export class EventReservationServiceModule {}
