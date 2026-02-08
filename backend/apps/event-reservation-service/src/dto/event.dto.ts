import { IsString, IsNotEmpty, IsDateString, IsInt, IsEnum, IsOptional } from 'class-validator';

export enum EventStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    CANCELED = 'CANCELED',
}

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsInt()
    @IsNotEmpty()
    capacity: number;

    @IsEnum(EventStatus)
    @IsOptional()
    status?: EventStatus;

    @IsString()
    @IsOptional()
    image?: string;
}

export class UpdateEventDto extends CreateEventDto {
    @IsInt()
    @IsNotEmpty()
    id: number;
}
