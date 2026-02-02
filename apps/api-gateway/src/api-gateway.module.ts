import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [ClientsModule.register([
    {
        name: "AUTH_SERVICE",
        transport: Transport.TCP,
        options: {
          host: "127.0.0.1",
          port: 4001,
        },
      },
  ])],
  controllers: [ApiGatewayController, AuthController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
