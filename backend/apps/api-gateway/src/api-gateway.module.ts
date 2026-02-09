import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { EventsController } from './events/events.controller';
import { ReservationsController } from './reservations/reservations.controller';
import { JwtStrategy } from './auth/guards/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    ClientsModule.register([
      {
        name: "AUTH_SERVICE",
        transport: Transport.TCP,
        options: {
          host: "auth",
          port: 3001,
        },
      },
      {
        name: "EVENT_SERVICE",
        transport: Transport.TCP,
        options: {
          host: "reserve-event",
          port: 3002,
        },
      },
    ])],
  controllers: [ApiGatewayController, AuthController, EventsController, ReservationsController],
  providers: [ApiGatewayService, JwtStrategy],
})
export class ApiGatewayModule { }
