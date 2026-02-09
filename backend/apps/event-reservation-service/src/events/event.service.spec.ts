import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { prisma } from '../../lib/prisma';
import { EventStatus, UpdateEventDto } from './event.dto';

jest.mock('../../lib/prisma', () => ({
    prisma: {
        event: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('EventService', () => {
    let service: EventService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EventService],
        }).compile();

        service = module.get<EventService>(EventService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createEventDto = {
            title: 'Test Event',
            description: 'Test Description',
            address: 'Test Address',
            startDate: '2024-06-15T09:00:00Z',
            endDate: '2024-06-15T18:00:00Z',
            capacity: 100,
            status: EventStatus.PUBLISHED,
        };

        it('should create an event successfully', async () => {
            const mockEvent = {
                id: 1,
                ...createEventDto,
                startDate: new Date(createEventDto.startDate),
                endDate: new Date(createEventDto.endDate),
                image: null,
            };

            (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

            const result = await service.create(createEventDto);

            expect(result).toEqual(mockEvent);
            expect(prisma.event.create).toHaveBeenCalledWith({
                data: {
                    ...createEventDto,
                    startDate: new Date(createEventDto.startDate),
                    endDate: new Date(createEventDto.endDate),
                    status: 'PUBLISHED',
                },
            });
        });

        it('should create event with DRAFT status by default if not specified', async () => {
            const dtoWithoutStatus = {
                title: 'Test Event',
                description: 'Test Description',
                address: 'Test Address',
                startDate: '2024-06-15T09:00:00Z',
                endDate: '2024-06-15T18:00:00Z',
                capacity: 100,
            };

            const mockEvent = {
                id: 1,
                ...dtoWithoutStatus,
                startDate: new Date(dtoWithoutStatus.startDate),
                endDate: new Date(dtoWithoutStatus.endDate),
                status: 'DRAFT',
                image: null,
            };

            (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

            const result = await service.create(dtoWithoutStatus as any);

            expect(result.status).toBe('DRAFT');
            expect(prisma.event.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    status: 'DRAFT',
                }),
            });
        });

        it('should handle errors during creation', async () => {
            const error = new Error('Database error');
            (prisma.event.create as jest.Mock).mockRejectedValue(error);

            await expect(service.create(createEventDto)).rejects.toThrow('Database error');
        });
    });

    describe('findAll', () => {
        it('should return all events', async () => {
            const mockEvents = [
                {
                    id: 1,
                    title: 'Event 1',
                    description: 'Description 1',
                    address: 'Address 1',
                    startDate: new Date(),
                    endDate: new Date(),
                    capacity: 100,
                    status: 'PUBLISHED',
                    image: null,
                },
                {
                    id: 2,
                    title: 'Event 2',
                    description: 'Description 2',
                    address: 'Address 2',
                    startDate: new Date(),
                    endDate: new Date(),
                    capacity: 50,
                    status: 'DRAFT',
                    image: null,
                },
            ];

            (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

            const result = await service.findAll();

            expect(result).toEqual(mockEvents);
            expect(prisma.event.findMany).toHaveBeenCalled();
        });

        it('should return empty array if no events exist', async () => {
            (prisma.event.findMany as jest.Mock).mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a single event', async () => {
            const mockEvent = {
                id: 1,
                title: 'Test Event',
                description: 'Test Description',
                address: 'Test Address',
                startDate: new Date(),
                endDate: new Date(),
                capacity: 100,
                status: 'PUBLISHED',
                image: null,
            };

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

            const result = await service.findOne(1);

            expect(result).toEqual(mockEvent);
            expect(prisma.event.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        it('should return null if event not found', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await service.findOne(999);

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        const updateEventDto: UpdateEventDto = {
            id: 1,
            title: 'Updated Event',
            description: 'Updated Description',
            address: 'Updated Address',
            startDate: '2024-07-01T09:00:00Z',
            endDate: '2024-07-01T18:00:00Z',
            capacity: 150,
            status: EventStatus.PUBLISHED,
        };

        it('should update an event successfully', async () => {
            const mockUpdatedEvent = {
                id: 1,
                title: 'Updated Event',
                description: 'Original Description',
                address: 'Original Address',
                startDate: new Date(),
                endDate: new Date(),
                capacity: 150,
                status: 'PUBLISHED',
                image: null,
            };

            (prisma.event.update as jest.Mock).mockResolvedValue(mockUpdatedEvent);

            const result = await service.update(1, updateEventDto);

            expect(result).toEqual(mockUpdatedEvent);
            expect(prisma.event.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    title: 'Updated Event',
                    description: 'Updated Description',
                    address: 'Updated Address',
                    capacity: 150,
                    status: 'PUBLISHED',
                    startDate: new Date(updateEventDto.startDate),
                    endDate: new Date(updateEventDto.endDate),
                },
            });
        });

        it('should update dates when provided', async () => {
            const dtoWithDates = {
                id: 1,
                startDate: '2024-07-01T09:00:00Z',
                endDate: '2024-07-01T18:00:00Z',
            };

            const mockUpdatedEvent = {
                id: 1,
                title: 'Event',
                description: 'Description',
                address: 'Address',
                startDate: new Date(dtoWithDates.startDate),
                endDate: new Date(dtoWithDates.endDate),
                capacity: 100,
                status: 'PUBLISHED',
                image: null,
            };

            (prisma.event.update as jest.Mock).mockResolvedValue(mockUpdatedEvent);

            const result = await service.update(1, dtoWithDates as any);

            expect(prisma.event.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: expect.objectContaining({
                    startDate: new Date(dtoWithDates.startDate),
                    endDate: new Date(dtoWithDates.endDate),
                }),
            });
        });
    });

    describe('remove', () => {
        it('should delete an event successfully', async () => {
            const mockDeletedEvent = {
                id: 1,
                title: 'Deleted Event',
                description: 'Description',
                address: 'Address',
                startDate: new Date(),
                endDate: new Date(),
                capacity: 100,
                status: 'CANCELED',
                image: null,
            };

            (prisma.event.delete as jest.Mock).mockResolvedValue(mockDeletedEvent);

            const result = await service.remove(1);

            expect(result).toEqual(mockDeletedEvent);
            expect(prisma.event.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });
    });

    describe('checkEventExists', () => {
        it('should return event with active reservations', async () => {
            const mockEvent = {
                id: 1,
                title: 'Test Event',
                description: 'Description',
                address: 'Address',
                startDate: new Date(),
                endDate: new Date(),
                capacity: 100,
                status: 'PUBLISHED',
                image: null,
                reservations: [
                    { id: 1, status: 'PENDING' },
                    { id: 2, status: 'CONFIRMED' },
                ],
            };

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

            const result = await service.checkEventExists(1);

            expect(result).toEqual(mockEvent);
            expect(prisma.event.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
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
        });

        it('should return null if event does not exist', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await service.checkEventExists(999);

            expect(result).toBeNull();
        });
    });
});
