import { IsInt, IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    REFUSED = 'REFUSED',
    CANCELED = 'CANCELED',
}

export class CreateReservationDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsInt()
    @IsNotEmpty()
    eventId: number;

    @IsEnum(ReservationStatus)
    @IsOptional()
    status?: ReservationStatus;
}

export class UpdateReservationDto {
    @IsInt()
    @IsNotEmpty()
    id: number;

    @IsEnum(ReservationStatus)
    @IsOptional()
    status?: ReservationStatus;
}

export class CancelReservationDto {
    @IsInt()
    @IsNotEmpty()
    reservationId: number;

    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class ConfirmReservationDto {
    @IsInt()
    @IsNotEmpty()
    reservationId: number;
}

export class RefuseReservationDto {
    @IsInt()
    @IsNotEmpty()
    reservationId: number;
}
