import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly saltRounds = Number(process.env.SALT_ROUND);

  async hashPassword(password: string) {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      return {
        error: false,
        status: 0,
        message: 'Hashed Successful',
        result: {
          hashedPassword,
        },
      }
    } catch (e) {
      return {
        error: true,
        status: 500,
        message: 'Hash Failed',
      }
    }
  }

  async validatePassword(password: string, hashedPassword: string) {
    try {
      const result = await bcrypt.compare(password, hashedPassword);

      return {
        error: false,
        status: 0,
        message: 'Validate Successful',
        result: {
          isCorrect: result,
        },
      }
    } catch (e) {
      return {
        error: true,
        status: 500,
        message: 'Validate Failed',
      };
    }
  }
}
