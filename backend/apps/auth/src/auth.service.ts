import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '../lib/prisma';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuth2Client } from 'google-auth-library';
import { decode } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new UnauthorizedException('Email already in use');

    // Find or create default role
    let role = await prisma.role.findFirst({ where: { name: 'User' } });
    if (!role) {
      role = await prisma.role.create({
        data: { name: 'User', description: 'Default user role' },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        roleId: role.id,
      },
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  async googleLogin(idToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');
    // DEBUG: Log payload to see the actual audience BEFORE verification fails
    const decoded = decode(idToken) as any;
    console.log('--- DEBUG AUDIENCE CHECK ---');
    console.log('Env GOOGLE_CLIENT_ID:', clientId);
    console.log('Token aud:', decoded?.aud);
    console.log('Match?', clientId === decoded?.aud);
    console.log('----------------------------');

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload) throw new UnauthorizedException('Invalid Google token');

    const { email, name, picture } = payload;

    if (!email) throw new UnauthorizedException('Email not found in Google token');

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      
      let role = await prisma.role.findFirst({ where: { name: 'User' } });
      if (!role) {
        role = await prisma.role.create({
          data: { name: 'User', description: 'Default user role' },
        });
      }

      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          password: '', 
          roleId: role.id,
        },
      });
    }

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { accessToken: token, user };
  }
}
