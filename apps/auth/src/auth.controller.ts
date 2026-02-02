import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  @MessagePattern('register')
  async register(@Payload() data: RegisterDto) {
    return this.authService.register(data);
  }

  
  @MessagePattern('login')
  async login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  
  @MessagePattern('google-login')
  async googleLogin(@Payload() data: GoogleLoginDto) {
    return this.authService.googleLogin(data.idToken);
  }
}
