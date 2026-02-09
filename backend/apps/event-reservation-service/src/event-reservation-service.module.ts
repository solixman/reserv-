import { Module } from '@nestjs/common';
import { EventController } from './events/event.controller';
import { EventService } from './events/event.service';
import { ReservationController } from './reservations/reservation.controller';
import { ReservationService } from './reservations/reservation.service';

@Module({
  imports: [],
  controllers: [EventController, ReservationController],
  providers: [EventService, ReservationService],
})
export class EventReservationServiceModule { }
