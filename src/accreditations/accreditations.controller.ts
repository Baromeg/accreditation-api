import { UseGuards, Controller, Get, Post, Body, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccreditationsService } from './accreditations.service';
import { AccreditationResponseDto } from './dto/accreditation-response.dto';
import { CreateAccreditationDto } from './dto/create-accreditation.dto';

@UseGuards(JwtAuthGuard)
@Controller('accreditations')
export class AccreditationsController {
  constructor(private accreditationsService: AccreditationsService) {}

  @Get()
  async findAll(@Request() req): Promise<AccreditationResponseDto[]> {
    const userId = req.user.userId;
    return this.accreditationsService.findAllForUser(userId);
  }

  @Post()
  async create(
    @Request() req,
    @Body() dto: CreateAccreditationDto,
  ): Promise<AccreditationResponseDto> {
    const acc = await this.accreditationsService.createForUser(req.user.userId, dto);
    return new AccreditationResponseDto(acc);
  }
}
