import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateEventDto, UpdateEventDto } from 'apps/event-reservation-service/src/events/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { AllExceptionsFilter } from '../../../../common/filters/all-exceptions.filter';
import { firstValueFrom } from 'rxjs';

@Controller('events')
@UseFilters(AllExceptionsFilter)
export class EventsController {
    constructor(@Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async create(@Body() createEventDto: CreateEventDto) {
        try {
            return await firstValueFrom(this.eventClient.send('createEvent', createEventDto));
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Failed to create event';
            throw new HttpException(message, statusCode);
        }
    }

    @Get()
    async findAll() {
        try {
            return await firstValueFrom(this.eventClient.send('findAllEvents', {}));
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error?.error?.message || error?.message || 'Failed to fetch events';
            throw new HttpException(message, statusCode);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return await firstValueFrom(this.eventClient.send('findOneEvent', +id));
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.NOT_FOUND;
            const message = error?.error?.message || error?.message || 'Event not found';
            throw new HttpException(message, statusCode);
        }
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        try {
            return await firstValueFrom(this.eventClient.send('updateEvent', { ...updateEventDto, id: +id }));
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Failed to update event';
            throw new HttpException(message, statusCode);
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async remove(@Param('id') id: string) {
        try {
            return await firstValueFrom(this.eventClient.send('removeEvent', +id));
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Failed to delete event';
            throw new HttpException(message, statusCode);
        }
    }
}
