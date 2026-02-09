import { Injectable, UnauthorizedException, ConflictException, } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '../lib/prisma';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuth2Client } from 'google-auth-library';
import { decode } from 'jsonwebtoken';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(private readonly jwtService: JwtService) { }

  async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: Role.PARTICIPANT,
      },
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    console.log('here in login service', user);
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.generateToken(user);
  }

  async googleLogin(idToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');

    const decoded = decode(idToken) as any;

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload) throw new UnauthorizedException('Invalid Google token');

    const { email, name, picture } = payload;

    if (!email)
      throw new UnauthorizedException('Email not found in Google token');

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPassword = randomBytes(32).toString('hex');
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          password: await bcrypt.hash(randomPassword, 10),
          role: Role.PARTICIPANT,
        },
      });
    }

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const token = this.jwtService.sign(payload);
    const { password, ...userSafe } = user;
    return { accessToken: token, user: userSafe };
  }
}
