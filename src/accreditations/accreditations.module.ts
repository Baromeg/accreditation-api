import { Module } from '@nestjs/common';
import { AccreditationsService } from './accreditations.service';
import { AccreditationsController } from './accreditations.controller';

@Module({
  providers: [AccreditationsService],
  controllers: [AccreditationsController]
})
export class AccreditationsModule {}
