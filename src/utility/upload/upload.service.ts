import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(private firebaseService: FirebaseService) {}

  async uploadFiles(path: string, files: Express.Multer.File[]) {
    const bucket = this.firebaseService.getBucket();
    const uploadPromise = files.map((file) => {
      const fileName = `${uuidv4()}-${file.originalname}`;
      const stream = bucket.file(`${path}/${fileName}`)
        .createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        return new Promise<string>((reslove, reject) => {
          stream.on('error', reject);
          stream.on('finish', () => {
            const url = `https://firebasestorage.googleapis.com/v0/b/glarmour-scan.appspot.com/o/products%2F${fileName}?alt=media`;
            reslove(url);
          });

          stream.end(file.buffer);
        });
    });

    return Promise.all(uploadPromise);
  }
}
