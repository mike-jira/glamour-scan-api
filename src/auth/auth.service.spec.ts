import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const password = 'testpassword';
  const salt = 'salt';
  const hashedPassword = 'hashedPassword';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash password', () => {
    it('should hash password', async () => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedPassword);

      const result = await service.hashPassword(password);

      expect(result).toEqual({
        error: false,
        status: 0,
        message: 'Hashed Successful',
        result: {
          hashedPassword,
        }
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
    });

    it('should handle errors when hash password failed', async () => {
      (bcrypt.genSalt as jest.Mock).mockRejectedValue({});

      const result = await service.hashPassword(password);

      expect(result).toEqual({
        error: true,
        status: 500,
        message: 'Hash Failed',
      });
    });
  });

  describe('validate password', () => {
    it('should validate a password correctly', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(password, hashedPassword);

      expect(result).toEqual({
        error: false,
        status: 0,
        message: 'Validate Successful',
        result: {
          isCorrect: true,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should handle error when validate password failed', async () => {
      (bcrypt.compare as jest.Mock).mockRejectedValue(true);

      const result = await service.validatePassword(password, hashedPassword);

      expect(result).toEqual({
        error: true,
        status: 500,
        message: 'Validate Failed',
      });
    });
  });
});
