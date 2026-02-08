import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateEventDto, UpdateEventDto } from 'apps/event-reservation-service/src/dto/event.dto';
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
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    async findAll() {
        try {
            return await firstValueFrom(this.eventClient.send('findAllEvents', {}));
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return await firstValueFrom(this.eventClient.send('findOneEvent', +id));
        } catch (error) {
            throw new HttpException(error, HttpStatus.NOT_FOUND);
        }
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        try {
            return await firstValueFrom(this.eventClient.send('updateEvent', { ...updateEventDto, id: +id }));
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async remove(@Param('id') id: string) {
        try {
            return await firstValueFrom(this.eventClient.send('removeEvent', +id));
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }
}
