import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccreditationsModule } from './accreditations/accreditations.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AccreditationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
