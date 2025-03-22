import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) {}

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    this.logger.log(`Creating user with email: ${data.email}`);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: hashedPassword,
      },
    });

    this.logger.log(`User created successfully: ${user.email}`);

    return user;
  }

  async updateRefreshToken(userId: string, hashedToken: string) {
    const token = this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashedToken },
    });

    this.logger.log(`Updated refresh token for userId=${userId}`);

    return token;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
