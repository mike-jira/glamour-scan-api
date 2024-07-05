import { Module } from '@nestjs/common';
import { MailerService } from './mailer/mailer.service';
import { PrismaService } from './prisma/prisma.service';
import { PaginationService } from './pagination/pagination.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MailerService, PrismaService, PaginationService]
})
export class UtilityModule {}
