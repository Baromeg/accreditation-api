import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { Tokens } from './auth.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(dto: RegisterDto): Promise<Tokens> {
    try {
      const user = await this.usersService.createUser(dto);

      const tokens = await this.generateTokens(user.id, user.email);
      const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);

      await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

      this.logger.log(`New user registered: ${user.email}`);

      return tokens;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error &&
        'code' in error &&
        (error as PrismaClientKnownRequestError).code === 'P2002'
      ) {
        this.logger.warn(`Registration failed: Email already exists (${dto.email})`);
        throw new ConflictException('Email already in use');
      }

      this.logger.error(
        `Unexpected registration error for ${dto.email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async generateTokens(userId: string, email: string): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '15m' }),
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '7d' }),
    ]);

    return { access_token, refresh_token };
  }
}
