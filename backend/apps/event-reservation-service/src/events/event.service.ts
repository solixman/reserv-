import { Injectable } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { prisma } from '../../lib/prisma';

@Injectable()
export class EventService {
    private prisma = prisma;

    async create(createEventDto: CreateEventDto) {
        try {
            return await this.prisma.event.create({
                data: {
                    ...createEventDto,
                    startDate: new Date(createEventDto.startDate),
                    endDate: new Date(createEventDto.endDate),
                    status: createEventDto.status || 'DRAFT',
                },
            });
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    async findAll() {
        return this.prisma.event.findMany();
    }

    async findOne(id: number) {
        return this.prisma.event.findUnique({
            where: { id },
        });
    }

    async update(id: number, updateEventDto: UpdateEventDto) {
        const { id: _, ...data } = updateEventDto;
        return this.prisma.event.update({
            where: { id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }

    async remove(id: number) {
        return this.prisma.$transaction(async (tx) => {
            await tx.ticket.deleteMany({
                where: {
                    reservation: {
                        eventId: id,
                    },
                },
            });

            await tx.reservation.deleteMany({
                where: {
                    eventId: id,
                },
            });

            return await tx.event.delete({
                where: { id },
            });
        });
    }

    async checkEventExists(id: number) {
        return this.prisma.event.findUnique({
            where: { id },
            include: {
                reservations: {
                    where: {
                        status: {
                            in: ['PENDING', 'CONFIRMED'],
                        },
                    },
                },
            },
        });
    }
}
