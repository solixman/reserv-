import { Test, TestingModule } from '@nestjs/testing';
import { EventReservationServiceController } from './event-reservation-service.controller';
import { EventReservationServiceService } from './event-reservation-service.service';

describe('EventReservationServiceController', () => {
  let eventReservationServiceController: EventReservationServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventReservationServiceController],
      providers: [EventReservationServiceService],
    }).compile();

    eventReservationServiceController = app.get<EventReservationServiceController>(EventReservationServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(eventReservationServiceController.getHello()).toBe('Hello World!');
    });
  });
});
