import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { FirebaseService } from '../firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn()
}))

describe('UploadService', () => {
  let service: UploadService;
  let firebaseService: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: FirebaseService,
          useValue: {
            getBucket: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload images', () => {
    const mockFile = {
      originalname: 'test-file.png',
      mimetype: 'image/png',
      buffer: Buffer.from('test-content'),
    } as Express.Multer.File

    it('should upload multiple files and return thier URLs', async () => {
      const mockBucket = {
        file: jest.fn().mockReturnValue({
          createWreiteStream: jest.fn().mockReturnValue({
            on: jest.fn((event, callback) => {
              if (event === 'finish') {
                callback();
              }
            }),
            end: jest.fn(),
          }),
        })
      };

      (firebaseService.getBucket as jest.Mock).mockReturnValue(mockBucket);

      const result = await service.uploadFiles('products', [mockFile]);
      
    });
  });
});
