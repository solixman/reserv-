import { HttpException, HttpStatus } from '@nestjs/common';

export class EventNotFoundException extends HttpException {
    constructor(eventId: number) {
        super(`Event with ID ${eventId} not found`, HttpStatus.NOT_FOUND);
    }
}

export class EventNotPublishedException extends HttpException {
    constructor(eventId: number) {
        super(`Event with ID ${eventId} is not published`, HttpStatus.BAD_REQUEST);
    }
}

export class EventCanceledException extends HttpException {
    constructor(eventId: number) {
        super(`Event with ID ${eventId} has been canceled`, HttpStatus.BAD_REQUEST);
    }
}

export class EventFullException extends HttpException {
    constructor(eventId: number) {
        super(`Event with ID ${eventId} is full`, HttpStatus.BAD_REQUEST);
    }
}

export class ReservationNotFoundException extends HttpException {
    constructor(reservationId: number) {
        super(`Reservation with ID ${reservationId} not found`, HttpStatus.NOT_FOUND);
    }
}

export class DuplicateReservationException extends HttpException {
    constructor(userId: string, eventId: number) {
        super(
            `User ${userId} already has an active reservation for event ${eventId}`,
            HttpStatus.CONFLICT
        );
    }
}

export class UnauthorizedReservationAccessException extends HttpException {
    constructor() {
        super('You are not authorized to access this reservation', HttpStatus.FORBIDDEN);
    }
}

export class InvalidReservationStatusException extends HttpException {
    constructor(currentStatus: string, attemptedAction: string) {
        super(
            `Cannot ${attemptedAction} reservation with status ${currentStatus}`,
            HttpStatus.BAD_REQUEST
        );
    }
}

export class TicketNotAvailableException extends HttpException {
    constructor(reservationId: number, status: string) {
        super(
            `Ticket not available for reservation ${reservationId}. Reservation must be CONFIRMED (current status: ${status})`,
            HttpStatus.BAD_REQUEST
        );
    }
}
