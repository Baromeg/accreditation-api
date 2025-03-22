import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccreditationsService {
  constructor(private prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.accreditation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
