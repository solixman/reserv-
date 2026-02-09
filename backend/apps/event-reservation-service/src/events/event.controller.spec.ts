import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto, EventStatus } from './event.dto';

describe('EventController', () => {
    let controller: EventController;
    let service: EventService;

    const mockEventService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockEvent = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        address: 'Test Address',
        startDate: new Date(),
        endDate: new Date(),
        capacity: 100,
        status: EventStatus.DRAFT,
        image: 'test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventController],
            providers: [
                {
                    provide: EventService,
                    useValue: mockEventService,
                },
            ],
        }).compile();

        controller = module.get<EventController>(EventController);
        service = module.get<EventService>(EventService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create an event', async () => {
            const dto: CreateEventDto = {
                title: 'Test Event',
                description: 'Test Description',
                address: 'Test Address',
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                capacity: 100,
            };
            mockEventService.create.mockResolvedValue(mockEvent);

            expect(await controller.create(dto)).toEqual(mockEvent);
            expect(mockEventService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return an array of events', async () => {
            mockEventService.findAll.mockResolvedValue([mockEvent]);

            expect(await controller.findAll()).toEqual([mockEvent]);
            expect(mockEventService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single event', async () => {
            mockEventService.findOne.mockResolvedValue(mockEvent);

            expect(await controller.findOne(1)).toEqual(mockEvent);
            expect(mockEventService.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('should update an event', async () => {
            const dto: UpdateEventDto = {
                id: 1,
                title: 'Updated Title',
                description: 'Test Description',
                address: 'Test Address',
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                capacity: 100,
            };
            const updatedEvent = { ...mockEvent, title: 'Updated Title' };
            mockEventService.update.mockResolvedValue(updatedEvent);

            expect(await controller.update(dto)).toEqual(updatedEvent);
            expect(mockEventService.update).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('remove', () => {
        it('should remove an event', async () => {
            mockEventService.remove.mockResolvedValue(mockEvent);

            expect(await controller.remove(1)).toEqual(mockEvent);
            expect(mockEventService.remove).toHaveBeenCalledWith(1);
        });
    });
});
