import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailerService', () => {
  let service: MailerService;
  let configService: ConfigService;
  let transporter = {
    sendMail: jest.fn(),
  }

  const to = 'test@example.com';
  const subject = 'test subject';
  const text = 'test text';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [MailerService, ConfigService],
    }).compile();

    service = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);

    (nodemailer.createTransport as jest.Mock).mockReturnValue(transporter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    it('should send an email', async () => {
      transporter.sendMail.mockResolvedValue({});
      const result = await service.send(to, subject, text);

      expect(result).toEqual({ error: false });
      expect(transporter.sendMail).toBeCalledWith({
        from: configService.get<string>('MAIL_FROM'),
        to,
        subject,
        text,
      });
    });

    it('should handle email sending failure', async () => {
      transporter.sendMail.mockRejectedValue({});

      const result = await service.send(to, subject, text);
      expect(result).toEqual({ error: true });
      expect(transporter.sendMail).toBeCalledWith({
        from: configService.get<string>('MAIL_FROM'),
        to,
        subject,
        text,
      })
    });
  });
});
