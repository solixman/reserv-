import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventReservationServiceService } from './event-reservation-service.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Controller()
export class EventReservationServiceController {
  constructor(private readonly eventService: EventReservationServiceService) { }

  @MessagePattern('createEvent')
  create(@Payload() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @MessagePattern('findAllEvents')
  findAll() {
    return this.eventService.findAll();
  }

  @MessagePattern('findOneEvent')
  findOne(@Payload() id: number) {
    return this.eventService.findOne(id);
  }

  @MessagePattern('updateEvent')
  update(@Payload() updateEventDto: UpdateEventDto) {
    return this.eventService.update(updateEventDto.id, updateEventDto);
  }

  @MessagePattern('removeEvent')
  remove(@Payload() id: number) {
    return this.eventService.remove(id);
  }
}
