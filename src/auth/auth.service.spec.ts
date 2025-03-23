import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    getUserById: jest.Mock;
    updateRefreshToken: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      getUserById: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login()', () => {
    it('should return tokens for valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      usersService.findByEmail.mockResolvedValue(mockUser);

      const tokens = await service.login({
        email: mockUser.email,
        password: 'password123',
      });

      expect(tokens).toHaveProperty('access_token');
      expect(tokens).toHaveProperty('refresh_token');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, expect.any(String));
    });

    it('should throw if user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'ghost@example.com', password: 'nope' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if password is incorrect', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('correct', 10),
      };

      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.login({ email: mockUser.email, password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens()', () => {
    it('should return new tokens if refresh token is valid', async () => {
      const plainToken = 'refresh-token';
      const hashedToken = await bcrypt.hash(plainToken, 10);

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        hashedRefreshToken: hashedToken,
      };

      usersService.getUserById.mockResolvedValue(mockUser);

      const tokens = await service.refreshTokens(mockUser.id, plainToken);

      expect(tokens).toHaveProperty('access_token');
      expect(tokens).toHaveProperty('refresh_token');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, expect.any(String));
    });

    it('should throw if user does not exist', async () => {
      usersService.getUserById.mockResolvedValue(null);

      await expect(service.refreshTokens('bad-id', 'some-token')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw if no refresh token is stored', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        hashedRefreshToken: null,
      };

      usersService.getUserById.mockResolvedValue(mockUser);

      await expect(service.refreshTokens(mockUser.id, 'some-token')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw if provided token does not match stored hash', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        hashedRefreshToken: await bcrypt.hash('some-other-token', 10),
      };

      usersService.getUserById.mockResolvedValue(mockUser);

      await expect(service.refreshTokens(mockUser.id, 'wrong-token')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
