import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ReservationService } from './reservation.service';
import {
    CreateReservationDto,
    UpdateReservationDto,
    CancelReservationDto,
    ConfirmReservationDto,
    RefuseReservationDto,
} from './reservation.dto';

@Controller()
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) { }

    @MessagePattern('createReservation')
    async create(@Payload() createReservationDto: CreateReservationDto) {
        try {
            return await this.reservationService.create(createReservationDto);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 400,
                message: error.message || 'Failed to create reservation',
            });
        }
    }

    @MessagePattern('findAllReservations')
    async findAll(@Payload() filters?: { eventId?: number; userId?: string }) {
        try {
            return await this.reservationService.findAll(filters);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 500,
                message: error.message || 'Failed to fetch reservations',
            });
        }
    }

    @MessagePattern('findOneReservation')
    async findOne(@Payload() id: number) {
        try {
            return await this.reservationService.findOne(id);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 404,
                message: error.message || 'Reservation not found',
            });
        }
    }

    @MessagePattern('findReservationsByUserId')
    async findByUserId(@Payload() userId: string) {
        try {
            return await this.reservationService.findByUserId(userId);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 500,
                message: error.message || 'Failed to fetch user reservations',
            });
        }
    }

    @MessagePattern('findReservationsByEventId')
    async findByEventId(@Payload() eventId: number) {
        try {
            return await this.reservationService.findByEventId(eventId);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 404,
                message: error.message || 'Failed to fetch event reservations',
            });
        }
    }

    @MessagePattern('updateReservation')
    async update(@Payload() updateReservationDto: UpdateReservationDto) {
        try {
            return await this.reservationService.update(
                updateReservationDto.id,
                updateReservationDto
            );
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 400,
                message: error.message || 'Failed to update reservation',
            });
        }
    }

    @MessagePattern('confirmReservation')
    async confirm(@Payload() confirmReservationDto: ConfirmReservationDto) {
        try {
            return await this.reservationService.confirm(confirmReservationDto);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 400,
                message: error.message || 'Failed to confirm reservation',
            });
        }
    }

    @MessagePattern('refuseReservation')
    async refuse(@Payload() refuseReservationDto: RefuseReservationDto) {
        try {
            return await this.reservationService.refuse(refuseReservationDto);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 400,
                message: error.message || 'Failed to refuse reservation',
            });
        }
    }

    @MessagePattern('cancelReservation')
    async cancel(@Payload() payload: { dto: CancelReservationDto; isAdmin: boolean }) {
        try {
            return await this.reservationService.cancel(payload.dto, payload.isAdmin);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 400,
                message: error.message || 'Failed to cancel reservation',
            });
        }
    }

    @MessagePattern('removeReservation')
    async remove(@Payload() id: number) {
        try {
            return await this.reservationService.remove(id);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 404,
                message: error.message || 'Failed to delete reservation',
            });
        }
    }

    @MessagePattern('getEventStatistics')
    async getEventStatistics(@Payload() eventId: number) {
        try {
            return await this.reservationService.getEventStatistics(eventId);
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 404,
                message: error.message || 'Failed to fetch event statistics',
            });
        }
    }

    @MessagePattern('canDownloadTicket')
    async canDownloadTicket(@Payload() payload: { reservationId: number; userId: string }) {
        try {
            return await this.reservationService.canDownloadTicket(
                payload.reservationId,
                payload.userId
            );
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 400,
                message: error.message || 'Ticket not available',
            });
        }
    }

    @MessagePattern('downloadTicket')
    async downloadTicket(@Payload() payload: { reservationId: number; userId: string; userName: string }) {
        try {
            return await this.reservationService.downloadTicket(
                payload.reservationId,
                payload.userId,
                payload.userName
            );
        } catch (error) {
            throw new RpcException({
                statusCode: error.status || error.statusCode || 400,
                message: error.message || 'Failed to download ticket',
            });
        }
    }
}
