import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAccreditationDto } from './dto/create-accreditation.dto';
import { UpdateAccreditationDto } from './dto/update-accreditation.dto';

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

  async updateForUser(userId: string, id: string, dto: UpdateAccreditationDto) {
    this.logger.log(`Updating accreditation ${id} for userId=${userId}`);
    const accreditation = await this.prisma.accreditation.findUnique({ where: { id } });

    if (!accreditation) {
      throw new NotFoundException('Accreditation not found');
    }

    if (accreditation.userId !== userId) {
      throw new ForbiddenException('You cannot modify this accreditation');
    }

    this.logger.log(
      `Accreditation updated: "${dto.name}" (userId=${userId}, id=${accreditation.id})`,
    );

    return this.prisma.accreditation.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async deleteForUser(userId: string, id: string): Promise<void> {
    this.logger.log(`Attempting to delete accreditation ${id} for userId=${userId}`);

    const accreditation = await this.prisma.accreditation.findUnique({ where: { id } });

    if (!accreditation) {
      throw new NotFoundException('Accreditation not found');
    }

    if (accreditation.userId !== userId) {
      throw new ForbiddenException('You cannot delete this accreditation');
    }

    if (accreditation.status !== 'PENDING') {
      this.logger.warn(`User ${userId} attempted to delete non-pending accreditation ${id}`);
      throw new ForbiddenException('Only pending accreditations can be deleted');
    }

    await this.prisma.accreditation.delete({ where: { id } });
    this.logger.log(`Deleted accreditation ${id} for userId=${userId}`);
  }
}
