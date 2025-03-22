import { UseGuards, Controller, Get, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accreditations')
export class AccreditationsController {
  @Get()
  findAll(@Request() req) {
    // WIP req.user is set by the JwtStrategy
    return `This would list accreditations for user ${req.user.userId}`;
  }
}
