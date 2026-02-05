import { Controller, Get } from '@nestjs/common';
import { EventReservationServiceService } from './event-reservation-service.service';

@Controller()
export class EventReservationServiceController {
  constructor(private readonly eventReservationServiceService: EventReservationServiceService) {}

  @Get()
  getHello(): string {
    return this.eventReservationServiceService.getHello();
  }
}
