
export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    REFUSED = 'REFUSED',
    CANCELED = 'CANCELED',
}

export interface Reservation {
    id: number;
    userId: string;
    userName?: string;
    eventId: number;
    status: ReservationStatus;
    createdAt: string;
    event?: {
        id: number;
        title: string;
        capacity: number;
        status: string;
    };
}

export interface CreateReservationDto {
    eventId: number;
}

export interface EventStatistics {
    eventId: number;
    eventTitle: string;
    capacity: number;
    total: number;
    pending: number;
    confirmed: number;
    refused: number;
    canceled: number;
    activeReservations: number;
    availableSpots: number;
    fillRate: number;
}
