import { Body, Controller, ForbiddenException, Post, Request } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Tokens } from './auth.types';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Request() req): Promise<Tokens> {
    const token = dto.refresh_token;
    const decoded = this.jwtService.decode(token) as { sub: string };

    if (!decoded?.sub) {
      throw new ForbiddenException('Invalid token');
    }

    return this.authService.refreshTokens(decoded.sub, token);
  }
}
