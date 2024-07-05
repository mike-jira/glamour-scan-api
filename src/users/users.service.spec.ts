import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service'

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaClient;

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
              findMany: jest.fn(),
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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register user with invite', () => {

  });
});
