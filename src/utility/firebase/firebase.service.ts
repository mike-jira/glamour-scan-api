import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  constructor(private configService: ConfigService) {
    const config = {
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(config),
      storageBucket: `${this.configService.get<string>('FIREBASE_PROJECT_ID')}.appspot.com`,
    })
  }

  getBucket() {
    return admin.storage().bucket();
  }
}
