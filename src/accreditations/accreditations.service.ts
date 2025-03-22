import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAccreditationDto } from './dto/create-accreditation.dto';

@Injectable()
export class AccreditationsService {
  private readonly logger = new Logger(AccreditationsService.name);

  constructor(private prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.accreditation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createForUser(userId: string, dto: CreateAccreditationDto) {
    const accreditation = await this.prisma.accreditation.create({
      data: {
        name: dto.name,
        status: 'PENDING',
        expirationDate: null,
        userId,
      },
    });

    this.logger.log(
      `New accreditation created: "${dto.name}" (userId=${userId}, id=${accreditation.id})`,
    );

    return accreditation;
  }
}
