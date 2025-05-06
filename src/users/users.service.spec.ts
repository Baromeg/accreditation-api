import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: { create: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('createUser()', () => {
    it('should hash the password and create the user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'plaintext',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash: 'hashed-password',
      });

      const result = await service.createUser(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash: expect.any(String),
        }),
      });

      const stored = prisma.user.create.mock.calls[0][0].data.passwordHash;
      expect(await bcrypt.compare(dto.password, stored)).toBe(true);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(dto.email);
    });
  });

  describe('updateRefreshToken()', () => {
    it('should update the user refresh token', async () => {
      prisma.user.update = jest.fn().mockResolvedValue({
        id: 'user-1',
        hashedRefreshToken: 'new-hash',
      });

      await service.updateRefreshToken('user-1', 'new-hash');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { hashedRefreshToken: 'new-hash' },
      });
    });
  });
});
