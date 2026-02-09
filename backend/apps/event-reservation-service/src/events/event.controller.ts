import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './event.dto';

@Controller()
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @MessagePattern('createEvent')
    async create(@Payload() createEventDto: CreateEventDto) {
        try {
            return await this.eventService.create(createEventDto);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || 500,
                message: error.message || 'Failed to create event',
            });
        }
    }

    @MessagePattern('findAllEvents')
    async findAll() {
        try {
            return await this.eventService.findAll();
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || 500,
                message: error.message || 'Failed to fetch events',
            });
        }
    }

    @MessagePattern('findOneEvent')
    async findOne(@Payload() id: number) {
        try {
            const event = await this.eventService.findOne(id);
            if (!event) {
                throw new RpcException({
                    statusCode: 404,
                    message: `Event with ID ${id} not found`,
                });
            }
            return event;
        } catch (error) {
            if (error instanceof RpcException) throw error;
            throw new RpcException({
                statusCode: error.status || 500,
                message: error.message || 'Failed to fetch event',
            });
        }
    }

    @MessagePattern('updateEvent')
    async update(@Payload() updateEventDto: UpdateEventDto) {
        try {
            return await this.eventService.update(updateEventDto.id, updateEventDto);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || 500,
                message: error.message || 'Failed to update event',
            });
        }
    }

    @MessagePattern('removeEvent')
    async remove(@Payload() id: number) {
        try {
            return await this.eventService.remove(id);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || 500,
                message: error.message || 'Failed to delete event',
            });
        }
    }
}
