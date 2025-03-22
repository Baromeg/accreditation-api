import { UseGuards, Controller, Get, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccreditationsService } from './accreditations.service';
import { AccreditationResponseDto } from './dto/accreditation-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('accreditations')
export class AccreditationsController {
  constructor(private accreditationsService: AccreditationsService) {}

  @Get()
  async findAll(@Request() req): Promise<AccreditationResponseDto[]> {
    const userId = req.user.userId;
    return this.accreditationsService.findAllForUser(userId);
  }
}
