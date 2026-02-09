import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { prisma } from '../../lib/prisma';
import {
    CreateReservationDto,
    UpdateReservationDto,
    CancelReservationDto,
    ConfirmReservationDto,
    RefuseReservationDto,
    ReservationStatus,
} from './reservation.dto';
import {
    EventNotFoundException,
    EventNotPublishedException,
    EventCanceledException,
    EventFullException,
    ReservationNotFoundException,
    DuplicateReservationException,
    UnauthorizedReservationAccessException,
    InvalidReservationStatusException,
    TicketNotAvailableException,
} from './reservation.exceptions';

@Injectable()
export class ReservationService {
    private prisma = prisma;

    async create(createReservationDto: CreateReservationDto) {
        const { userId, eventId } = createReservationDto;

        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                reservations: {
                    where: {
                        status: {
                            in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
                        },
                    },
                },
            },
        });

        if (!event) {
            throw new EventNotFoundException(eventId);
        }

        if (event.status !== 'PUBLISHED') {
            throw new EventNotPublishedException(eventId);
        }

        const existingReservation = await this.prisma.reservation.findFirst({
            where: {
                userId,
                eventId,
                status: {
                    in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
                },
            },
        });

        if (existingReservation) {
            throw new DuplicateReservationException(userId, eventId);
        }

        const activeReservationsCount = event.reservations.length;

        if (activeReservationsCount >= event.capacity) {
            throw new EventFullException(eventId);
        }

        const reservation = await this.prisma.reservation.create({
            data: {
                userId,
                eventId,
                status: createReservationDto.status || ReservationStatus.PENDING,
            },
            include: {
                event: true,
            },
        });

        return reservation;
    }

    async findAll(filters?: { eventId?: number; userId?: string }) {
        const where: Record<string, any> = {};

        if (filters?.eventId) {
            where.eventId = filters.eventId;
        }

        if (filters?.userId) {
            where.userId = filters.userId;
        }

        return this.prisma.reservation.findMany({
            where,
            include: {
                event: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: number) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: {
                event: true,
                tickets: true,
            },
        });

        if (!reservation) {
            throw new ReservationNotFoundException(id);
        }

        return reservation;
    }

    async findByUserId(userId: string) {
        return this.prisma.reservation.findMany({
            where: { userId },
            include: {
                event: true,
                tickets: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findByEventId(eventId: number) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new EventNotFoundException(eventId);
        }

        return this.prisma.reservation.findMany({
            where: { eventId },
            include: {
                event: true,
                tickets: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async update(id: number, updateReservationDto: UpdateReservationDto) {
        await this.findOne(id);

        return this.prisma.reservation.update({
            where: { id },
            data: {
                status: updateReservationDto.status as ReservationStatus,
            },
            include: {
                event: true,
            },
        });
    }

    async confirm(confirmReservationDto: ConfirmReservationDto) {
        const { reservationId } = confirmReservationDto;
        const reservation = await this.findOne(reservationId);

        if (reservation.status !== ReservationStatus.PENDING) {
            throw new InvalidReservationStatusException(
                reservation.status as ReservationStatus,
                'confirm'
            );
        }

        const event = await this.prisma.event.findUnique({
            where: { id: reservation.eventId },
            include: {
                reservations: {
                    where: {
                        status: ReservationStatus.CONFIRMED,
                    },
                },
            },
        });

        if (!event) {
            throw new EventNotFoundException(reservation.eventId);
        }

        if (event.reservations.length >= event.capacity) {
            throw new EventFullException(event.id);
        }

        return this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: ReservationStatus.CONFIRMED,
            },
            include: {
                event: true,
            },
        });
    }

    async refuse(refuseReservationDto: RefuseReservationDto) {
        const { reservationId } = refuseReservationDto;
        const reservation = await this.findOne(reservationId);

        if (reservation.status !== ReservationStatus.PENDING) {
            throw new InvalidReservationStatusException(
                reservation.status as ReservationStatus,
                'refuse'
            );
        }

        return this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: ReservationStatus.REFUSED,
            },
            include: {
                event: true,
            },
        });
    }

    async cancel(cancelReservationDto: CancelReservationDto, isAdmin: boolean = false) {
        const { reservationId, userId } = cancelReservationDto;
        const reservation = await this.findOne(reservationId);

        if (!isAdmin && reservation.userId !== userId) {
            throw new UnauthorizedReservationAccessException();
        }

        if (!isAdmin) {
            if (
                reservation.status !== ReservationStatus.PENDING &&
                reservation.status !== ReservationStatus.CONFIRMED
            ) {
                throw new InvalidReservationStatusException(
                    reservation.status as ReservationStatus,
                    'cancel'
                );
            }
        }

        return this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: ReservationStatus.CANCELED,
            },
            include: {
                event: true,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);

        return this.prisma.$transaction(async (tx) => {
            await tx.ticket.deleteMany({
                where: {
                    reservationId: id,
                },
            });

            return await tx.reservation.delete({
                where: { id },
            });
        });
    }

    async getEventStatistics(eventId: number) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                reservations: true,
            },
        });

        if (!event) {
            throw new EventNotFoundException(eventId);
        }

        const total = event.reservations.length;
        const pending = event.reservations.filter(
            (r) => r.status === ReservationStatus.PENDING
        ).length;
        const confirmed = event.reservations.filter(
            (r) => r.status === ReservationStatus.CONFIRMED
        ).length;
        const refused = event.reservations.filter(
            (r) => r.status === ReservationStatus.REFUSED
        ).length;
        const canceled = event.reservations.filter(
            (r) => r.status === ReservationStatus.CANCELED
        ).length;

        const activeReservations = pending + confirmed;
        const availableSpots = event.capacity - activeReservations;
        const fillRate = event.capacity > 0 ? (activeReservations / event.capacity) * 100 : 0;

        return {
            eventId,
            eventTitle: event.title,
            capacity: event.capacity,
            total,
            pending,
            confirmed,
            refused,
            canceled,
            activeReservations,
            availableSpots: Math.max(0, availableSpots),
            fillRate: Math.round(fillRate * 100) / 100,
        };
    }

    async canDownloadTicket(reservationId: number, userId: string): Promise<boolean> {
        const reservation = await this.findOne(reservationId);

        if (!reservation) {
            throw new ReservationNotFoundException(reservationId);
        }

        if (reservation.userId !== userId) {
            throw new UnauthorizedReservationAccessException();
        }

        if (reservation.status !== ReservationStatus.CONFIRMED) {
            throw new TicketNotAvailableException(reservationId, reservation.status as ReservationStatus);
        }

        return true;
    }

    async downloadTicket(reservationId: number, userId: string, userName: string) {
        await this.canDownloadTicket(reservationId, userId);

        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { event: true }
        });

        if (!reservation || !reservation.event) {
            throw new ReservationNotFoundException(reservationId);
        }

        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        return new Promise((resolve, reject) => {
            doc.on('end', async () => {
                const pdfBuffer = Buffer.concat(chunks);
                const pdfBase64 = pdfBuffer.toString('base64');

                const ticket = await this.prisma.ticket.findFirst({
                    where: { reservationId }
                });

                if (!ticket) {
                    await this.prisma.ticket.create({
                        data: {
                            reservationId,
                            pdfPath: `internal://generated-${reservationId}`,
                        }
                    });
                }

                resolve({
                    pdfBase64,
                    filename: `ticket-${reservationId}.pdf`
                });
            });

            doc.on('error', reject);

            doc.fontSize(25).text('EVENT TICKET', { align: 'center' });
            doc.moveDown();
            doc.fontSize(18).text(`Event: ${reservation.event.title}`);
            doc.fontSize(14).text(`Date: ${reservation.event.startDate.toLocaleDateString()}`);
            doc.text(`Location: ${reservation.event.address}`);
            doc.moveDown();
            doc.fontSize(16).text(`Reservation ID: ${reservation.id}`);
            doc.text(`Attendee: ${userName || 'Valued Guest'}`);
            doc.text(`Status: CONFIRMED`);
            doc.moveDown();
            doc.fontSize(10).text('Show this ticket at the entrance.', { align: 'center' });

            doc.end();
        });
    }
}
