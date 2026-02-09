import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Inject,
    UseGuards,
    UseFilters,
    HttpException,
    HttpStatus,
    Request,
    Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { AllExceptionsFilter } from '../../../../common/filters/all-exceptions.filter';
import { firstValueFrom } from 'rxjs';

@Controller('reservations')
@UseFilters(AllExceptionsFilter)
export class ReservationsController {
    constructor(@Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy) { }

    /**
     * Create a new reservation (Authenticated users)
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: { eventId: number }, @Request() req) {
        try {
            const dto = {
                eventId: body.eventId,
                userId: req.user.userId,
            };
            return await firstValueFrom(this.eventClient.send('createReservation', dto));
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Failed to create reservation';
            throw new HttpException(message, statusCode);
        }
    }


    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async findAll(@Request() req) {
        try {
            const filters: any = {};
            if (req.query.eventId) {
                filters.eventId = parseInt(req.query.eventId);
            }
            if (req.query.userId) {
                filters.userId = req.query.userId;
            }
            return await firstValueFrom(this.eventClient.send('findAllReservations', filters));
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error?.error?.message || error?.message || 'Failed to fetch reservations';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Get current user's reservations (Authenticated users)
     */
    @Get('my-reservations')
    @UseGuards(JwtAuthGuard)
    async getMyReservations(@Request() req) {
        try {
            return await firstValueFrom(
                this.eventClient.send('findReservationsByUserId', req.user.userId)
            );
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error?.error?.message || error?.message || 'Failed to fetch your reservations';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Get reservations for a specific event (Admin only)
     */
    @Get('event/:eventId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async getEventReservations(@Param('eventId') eventId: string) {
        try {
            return await firstValueFrom(
                this.eventClient.send('findReservationsByEventId', +eventId)
            );
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.NOT_FOUND;
            const message = error?.error?.message || error?.message || 'Failed to fetch event reservations';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Get event statistics (Admin only)
     */
    @Get('statistics/:eventId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async getEventStatistics(@Param('eventId') eventId: string) {
        try {
            return await firstValueFrom(
                this.eventClient.send('getEventStatistics', +eventId)
            );
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.NOT_FOUND;
            const message = error?.error?.message || error?.message || 'Failed to fetch event statistics';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Get a specific reservation (Owner or Admin)
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string, @Request() req) {
        try {
            const reservation = await firstValueFrom(
                this.eventClient.send('findOneReservation', +id)
            );

            // Check if user is owner or admin
            if (req.user.role !== 'ADMIN' && reservation.userId !== req.user.userId) {
                throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
            }

            return reservation;
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.NOT_FOUND;
            const message = error?.error?.message || error?.message || 'Reservation not found';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Confirm a reservation (Admin only)
     */
    @Patch(':id/confirm')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async confirm(@Param('id') id: string) {
        try {
            return await firstValueFrom(
                this.eventClient.send('confirmReservation', { reservationId: +id })
            );
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Failed to confirm reservation';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Refuse a reservation (Admin only)
     */
    @Patch(':id/refuse')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async refuse(@Param('id') id: string) {
        try {
            return await firstValueFrom(
                this.eventClient.send('refuseReservation', { reservationId: +id })
            );
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Failed to refuse reservation';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Cancel a reservation (Owner or Admin)
     */
    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    async cancel(@Param('id') id: string, @Request() req) {
        try {
            const isAdmin = req.user.role === 'ADMIN';
            const dto = {
                reservationId: +id,
                userId: req.user.userId,
            };
            return await firstValueFrom(
                this.eventClient.send('cancelReservation', { dto, isAdmin })
            );
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Failed to cancel reservation';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Update reservation status (Admin only)
     */
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async update(@Param('id') id: string, @Body() body: { status?: string }) {
        try {
            return await firstValueFrom(
                this.eventClient.send('updateReservation', { ...body, id: +id })
            );
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Failed to update reservation';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Delete a reservation (Admin only)
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async remove(@Param('id') id: string) {
        try {
            return await firstValueFrom(this.eventClient.send('removeReservation', +id));
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.NOT_FOUND;
            const message = error?.error?.message || error?.message || 'Failed to delete reservation';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Check if user can download ticket (Owner only)
     */
    @Get(':id/can-download-ticket')
    @UseGuards(JwtAuthGuard)
    async canDownloadTicket(@Param('id') id: string, @Request() req) {
        try {
            return await firstValueFrom(
                this.eventClient.send('canDownloadTicket', {
                    reservationId: +id,
                    userId: req.user.userId,
                })
            );
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Ticket not available';
            throw new HttpException(message, statusCode);
        }
    }

    /**
     * Download ticket (Owner only)
     */
    @Get(':id/download-ticket')
    @UseGuards(JwtAuthGuard)
    async downloadTicket(@Param('id') id: string, @Request() req, @Res() res: Response) {
        try {
            const ticketData = await firstValueFrom(
                this.eventClient.send('downloadTicket', {
                    reservationId: +id,
                    userId: req.user.userId,
                    userName: req.user.name,
                })
            );

            const buffer = Buffer.from(ticketData.pdfBase64, 'base64');

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=${ticketData.filename}`,
                'Content-Length': buffer.length,
            });

            res.end(buffer);
        } catch (error) {
            const statusCode = error?.error?.statusCode || error?.statusCode || HttpStatus.BAD_REQUEST;
            const message = error?.error?.message || error?.message || 'Failed to download ticket';
            throw new HttpException(message, statusCode);
        }
    }
}
