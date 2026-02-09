import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import * as bcrypt from 'bcrypt';

// Mock Prisma
jest.mock('../lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('register', () => {
        const registerDto = {
            email: 'test@example.com',
            password: 'Password123!',
            name: 'Test User',
        };

        it('should register a new user successfully', async () => {
            const mockUser = {
                id: 1,
                email: registerDto.email,
                name: registerDto.name,
                password: 'hashedPassword',
                role: 'PARTICIPANT',
                createdAt: new Date(),
            };

            const mockToken = 'mock.jwt.token';

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

            const result = await service.register(registerDto);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(registerDto.email);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: registerDto.email },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: registerDto.email,
                    password: 'hashedPassword',
                    name: registerDto.name,
                    role: 'PARTICIPANT',
                },
            });
        });

        it('should throw ConflictException if email already exists', async () => {
            const existingUser = {
                id: 1,
                email: registerDto.email,
                name: 'Existing User',
                password: 'hashedPassword',
                role: 'PARTICIPANT',
                createdAt: new Date(),
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
            await expect(service.register(registerDto)).rejects.toThrow('Email already in use');
        });

        it('should hash the password before storing', async () => {
            const mockUser = {
                id: 1,
                email: registerDto.email,
                name: registerDto.name,
                password: 'hashedPassword',
                role: 'PARTICIPANT',
                createdAt: new Date(),
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (jwtService.sign as jest.Mock).mockReturnValue('token');

            await service.register(registerDto);

            expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    password: 'hashedPassword',
                }),
            });
        });

        it('should assign PARTICIPANT role by default', async () => {
            const mockUser = {
                id: 1,
                email: registerDto.email,
                name: registerDto.name,
                password: 'hashedPassword',
                role: 'PARTICIPANT',
                createdAt: new Date(),
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (jwtService.sign as jest.Mock).mockReturnValue('token');

            const result = await service.register(registerDto);

            expect(result.user.role).toBe('PARTICIPANT');
        });
    });

    describe('login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'Password123!',
        };

        const mockUser = {
            id: 1,
            email: loginDto.email,
            name: 'Test User',
            password: 'hashedPassword',
            role: 'PARTICIPANT',
            createdAt: new Date(),
        };

        it('should login successfully with valid credentials', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwtService.sign as jest.Mock).mockReturnValue('mock.jwt.token');

            const result = await service.login(loginDto);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(loginDto.email);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: loginDto.email },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
        });

        it('should compare password with hashed password', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwtService.sign as jest.Mock).mockReturnValue('token');

            await service.login(loginDto);

            expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, 'hashedPassword');
        });
    });

    describe('generateToken', () => {
        it('should generate JWT token with user data', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword',
                role: 'ADMIN',
                createdAt: new Date(),
            };

            const mockToken = 'mock.jwt.token';
            (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

            const result = (service as any).generateToken(mockUser);

            expect(result).toHaveProperty('accessToken', mockToken);
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(mockUser.email);
            expect(result.user.name).toBe(mockUser.name);
            expect(result.user.role).toBe(mockUser.role);
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                name: mockUser.name,
            });
        });

        it('should not include password in returned user object', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword',
                role: 'PARTICIPANT',
                createdAt: new Date(),
            };

            (jwtService.sign as jest.Mock).mockReturnValue('token');

            const result = (service as any).generateToken(mockUser);

            expect(result.user).not.toHaveProperty('password');
        });
    });

    describe('edge cases', () => {
        it('should handle database errors during registration', async () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'Password123!',
                name: 'Test User',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (prisma.user.create as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(service.register(registerDto)).rejects.toThrow('Database error');
        });

        it('should handle database errors during login', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'Password123!',
            };

            (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(service.login(loginDto)).rejects.toThrow('Database error');
        });

        it('should handle bcrypt hashing errors', async () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'Password123!',
                name: 'Test User',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing error'));

            await expect(service.register(registerDto)).rejects.toThrow('Hashing error');
        });
    });
});
