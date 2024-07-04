import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaClient } from '@prisma/client';
import { MailerService } from '../mailer/mailer.service'
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaClient;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            invite: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: MailerService,
          useValue: {
            send: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create invite', () => {
    it('should create new invite', () => {
      const email = 'test@example.com';
      service.createInvite();
    });
  });
});
