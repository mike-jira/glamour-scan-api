import { Module } from '@nestjs/common';
import { MailerService } from './mailer/mailer.service';
import { PrismaService } from './prisma/prisma.service';
import { PaginationService } from './pagination/pagination.service';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { FirebaseModule } from './firebase/firebase.module';
import { UploadService } from './upload/upload.service';

@Module({
  imports: [ConfigModule, UploadModule, FirebaseModule],
  providers: [MailerService, PrismaService, PaginationService, UploadService],
  exports: [MailerService, PrismaService, PaginationService, UploadService],
})
export class UtilityModule {}
