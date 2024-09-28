import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [UploadService],
  exports: [UploadService]
})
export class UploadModule {}
