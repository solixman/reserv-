import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { prisma } from '../../lib/prisma';
import {
    EventNotFoundException,
    EventNotPublishedException,
    EventFullException,
    DuplicateReservationException,
    ReservationNotFoundException,
    UnauthorizedReservationAccessException,
    InvalidReservationStatusException,
    TicketNotAvailableException,
} from './reservation.exceptions';
import { ReservationStatus } from './reservation.dto';

jest.mock('../../lib/prisma', () => ({
    prisma: {
        event: {
            findUnique: jest.fn(),
        },
        reservation: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('ReservationService', () => {
    let service: ReservationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ReservationService],
        }).compile();

        service = module.get<ReservationService>(ReservationService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createDto = {
            userId: 'user-uuid-123',
            eventId: 1,
        };

        const mockEvent = {
            id: 1,
            title: 'Test Event',
            description: 'Test Description',
            address: 'Test Address',
            startDate: new Date(),
            endDate: new Date(),
            capacity: 100,
            status: 'PUBLISHED',
            reservations: [],
        };

        it('should create a reservation successfully', async () => {
            const mockReservation = {
                id: 1,
                userId: 'user-uuid-123',
                eventId: 1,
                status: ReservationStatus.PENDING,
                createdAt: new Date(),
                event: mockEvent,
            };

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.reservation.create as jest.Mock).mockResolvedValue(mockReservation);

            const result = await service.create(createDto);

            expect(result).toEqual(mockReservation);
            expect(prisma.event.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
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
        });

        it('should throw EventNotFoundException if event does not exist', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow(EventNotFoundException);
        });

        it('should throw EventNotPublishedException if event is not published', async () => {
            const draftEvent = { ...mockEvent, status: 'DRAFT' };
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(draftEvent);

            await expect(service.create(createDto)).rejects.toThrow(EventNotPublishedException);
        });

        it('should throw DuplicateReservationException if user already has active reservation', async () => {
            const existingReservation = {
                id: 1,
                userId: 'user-uuid-123',
                eventId: 1,
                status: ReservationStatus.PENDING,
            };

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(existingReservation);

            await expect(service.create(createDto)).rejects.toThrow(DuplicateReservationException);
        });

        it('should throw EventFullException if event is at capacity', async () => {
            const fullEvent = {
                ...mockEvent,
                capacity: 2,
                reservations: [
                    { id: 1, status: ReservationStatus.CONFIRMED },
                    { id: 2, status: ReservationStatus.PENDING },
                ],
            };

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(fullEvent);
            (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow(EventFullException);
        });
    });

    describe('findOne', () => {
        it('should return a reservation', async () => {
            const mockReservation = {
                id: 1,
                userId: 'user-uuid-123',
                eventId: 1,
                status: ReservationStatus.PENDING,
                createdAt: new Date(),
                event: {},
                tickets: [],
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

            const result = await service.findOne(1);

            expect(result).toEqual(mockReservation);
            expect(prisma.reservation.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    event: true,
                    tickets: true,
                },
            });
        });

        it('should throw ReservationNotFoundException if not found', async () => {
            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(ReservationNotFoundException);
        });
    });

    describe('confirm', () => {
        const mockReservation = {
            id: 1,
            userId: 'user-uuid-123',
            eventId: 1,
            status: ReservationStatus.PENDING,
            createdAt: new Date(),
            event: {},
            tickets: [],
        };

        const mockEvent = {
            id: 1,
            capacity: 100,
            reservations: [],
        };

        it('should confirm a pending reservation', async () => {
            const confirmedReservation = {
                ...mockReservation,
                status: ReservationStatus.CONFIRMED,
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.reservation.update as jest.Mock).mockResolvedValue(confirmedReservation);

            const result = await service.confirm({ reservationId: 1 });

            expect(result.status).toBe(ReservationStatus.CONFIRMED);
            expect(prisma.reservation.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: ReservationStatus.CONFIRMED },
                include: { event: true },
            });
        });

        it('should throw InvalidReservationStatusException if not pending', async () => {
            const confirmedReservation = {
                ...mockReservation,
                status: ReservationStatus.CONFIRMED,
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(confirmedReservation);

            await expect(service.confirm({ reservationId: 1 })).rejects.toThrow(
                InvalidReservationStatusException
            );
        });

        it('should throw EventFullException if event is full', async () => {
            const fullEvent = {
                id: 1,
                capacity: 2,
                reservations: [
                    { id: 1, status: ReservationStatus.CONFIRMED },
                    { id: 2, status: ReservationStatus.CONFIRMED },
                ],
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(fullEvent);

            await expect(service.confirm({ reservationId: 1 })).rejects.toThrow(
                EventFullException
            );
        });
    });

    describe('refuse', () => {
        it('should refuse a pending reservation', async () => {
            const mockReservation = {
                id: 1,
                userId: 'user-uuid-123',
                eventId: 1,
                status: ReservationStatus.PENDING,
                createdAt: new Date(),
                event: {},
                tickets: [],
            };

            const refusedReservation = {
                ...mockReservation,
                status: ReservationStatus.REFUSED,
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
            (prisma.reservation.update as jest.Mock).mockResolvedValue(refusedReservation);

            const result = await service.refuse({ reservationId: 1 });

            expect(result.status).toBe(ReservationStatus.REFUSED);
        });

        it('should throw InvalidReservationStatusException if not pending', async () => {
            const confirmedReservation = {
                id: 1,
                status: ReservationStatus.CONFIRMED,
                event: {},
                tickets: [],
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(confirmedReservation);

            await expect(service.refuse({ reservationId: 1 })).rejects.toThrow(
                InvalidReservationStatusException
            );
        });
    });

    describe('cancel', () => {
        const mockReservation = {
            id: 1,
            userId: 'user-uuid-123',
            eventId: 1,
            status: ReservationStatus.PENDING,
            createdAt: new Date(),
            event: {},
            tickets: [],
        };

        it('should allow user to cancel their own pending reservation', async () => {
            const canceledReservation = {
                ...mockReservation,
                status: ReservationStatus.CANCELED,
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
            (prisma.reservation.update as jest.Mock).mockResolvedValue(canceledReservation);

            const result = await service.cancel(
                { reservationId: 1, userId: 'user-uuid-123' },
                false
            );

            expect(result.status).toBe(ReservationStatus.CANCELED);
        });

        it('should throw UnauthorizedReservationAccessException if user is not owner', async () => {
            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

            await expect(
                service.cancel({ reservationId: 1, userId: 'different-uuid' }, false)
            ).rejects.toThrow(UnauthorizedReservationAccessException);
        });

        it('should allow admin to cancel any reservation', async () => {
            const canceledReservation = {
                ...mockReservation,
                status: ReservationStatus.CANCELED,
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
            (prisma.reservation.update as jest.Mock).mockResolvedValue(canceledReservation);

            const result = await service.cancel(
                { reservationId: 1, userId: 'different-uuid' },
                true
            );

            expect(result.status).toBe(ReservationStatus.CANCELED);
        });

        it('should throw InvalidReservationStatusException if user tries to cancel refused reservation', async () => {
            const refusedReservation = {
                ...mockReservation,
                status: ReservationStatus.REFUSED,
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(refusedReservation);

            await expect(
                service.cancel({ reservationId: 1, userId: 'user-uuid-123' }, false)
            ).rejects.toThrow(InvalidReservationStatusException);
        });
    });

    describe('canDownloadTicket', () => {
        it('should return true for confirmed reservation owned by user', async () => {
            const confirmedReservation = {
                id: 1,
                userId: 'user-uuid-123',
                eventId: 1,
                status: ReservationStatus.CONFIRMED,
                event: {},
                tickets: [],
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(confirmedReservation);

            const result = await service.canDownloadTicket(1, 'user-uuid-123');

            expect(result).toBe(true);
        });

        it('should throw UnauthorizedReservationAccessException if user is not owner', async () => {
            const reservation = {
                id: 1,
                userId: 'user-uuid-123',
                status: ReservationStatus.CONFIRMED,
                event: {},
                tickets: [],
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(reservation);

            await expect(service.canDownloadTicket(1, 'different-uuid')).rejects.toThrow(
                UnauthorizedReservationAccessException
            );
        });

        it('should throw TicketNotAvailableException if reservation is not confirmed', async () => {
            const pendingReservation = {
                id: 1,
                userId: 'user-uuid-123',
                status: ReservationStatus.PENDING,
                event: {},
                tickets: [],
            };

            (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(pendingReservation);

            await expect(service.canDownloadTicket(1, 'user-uuid-123')).rejects.toThrow(
                TicketNotAvailableException
            );
        });
    });

    describe('getEventStatistics', () => {
        it('should return correct statistics for an event', async () => {
            const mockEvent = {
                id: 1,
                title: 'Test Event',
                capacity: 100,
                reservations: [
                    { id: 1, status: ReservationStatus.PENDING },
                    { id: 2, status: ReservationStatus.PENDING },
                    { id: 3, status: ReservationStatus.CONFIRMED },
                    { id: 4, status: ReservationStatus.CONFIRMED },
                    { id: 5, status: ReservationStatus.CONFIRMED },
                    { id: 6, status: ReservationStatus.REFUSED },
                    { id: 7, status: ReservationStatus.CANCELED },
                ],
            };

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

            const result = await service.getEventStatistics(1);

            expect(result).toEqual({
                eventId: 1,
                eventTitle: 'Test Event',
                capacity: 100,
                total: 7,
                pending: 2,
                confirmed: 3,
                refused: 1,
                canceled: 1,
                activeReservations: 5,
                availableSpots: 97,
                fillRate: 3.00,
            });
        });

        it('should throw EventNotFoundException if event does not exist', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.getEventStatistics(999)).rejects.toThrow(
                EventNotFoundException
            );
        });
    });

    describe('findByUserId', () => {
        it('should return all reservations for a user', async () => {
            const mockReservations = [
                {
                    id: 1,
                    userId: 'user-uuid-123',
                    eventId: 1,
                    status: ReservationStatus.CONFIRMED,
                    event: {},
                    tickets: [],
                },
                {
                    id: 2,
                    userId: 'user-uuid-123',
                    eventId: 2,
                    status: ReservationStatus.PENDING,
                    event: {},
                    tickets: [],
                },
            ];

            (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

            const result = await service.findByUserId('user-uuid-123');

            expect(result).toEqual(mockReservations);
            expect(prisma.reservation.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-uuid-123' },
                include: {
                    event: true,
                    tickets: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        });
    });

    describe('findByEventId', () => {
        it('should return all reservations for an event', async () => {
            const mockEvent = { id: 1 };
            const mockReservations = [
                {
                    id: 1,
                    userId: 'user-uuid-123',
                    eventId: 1,
                    status: ReservationStatus.CONFIRMED,
                    event: {},
                    tickets: [],
                },
            ];

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

            const result = await service.findByEventId(1);

            expect(result).toEqual(mockReservations);
        });

        it('should throw EventNotFoundException if event does not exist', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.findByEventId(999)).rejects.toThrow(EventNotFoundException);
        });
    });
});
