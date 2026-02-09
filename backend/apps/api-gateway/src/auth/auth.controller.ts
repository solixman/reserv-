import { Body, Controller, HttpException, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { lastValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await lastValueFrom(this.authClient.send('register', registerDto));
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await lastValueFrom(this.authClient.send('login', loginDto));
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  @Post('google')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    try {
      return await lastValueFrom(this.authClient.send('google-login', googleLoginDto));
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }
}
