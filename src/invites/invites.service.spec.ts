import { Test, TestingModule } from '@nestjs/testing';
import { InvitesService } from './invites.service';
import { MailerService } from '../mailer/mailer.service'
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import * as uuid from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}))

describe('InvitesService', () => {
  let service: InvitesService;
  let prismaService: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitesService,
        {
          provide: PrismaService,
          useValue: {
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

    service = module.get<InvitesService>(InvitesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create invite', () => {
    it('should create a new invite with a token', async () => {
      const email = 'test@example.com';
      const mockToken = '1234-5678-91011-1213';
      const prismaResult = {
        token: mockToken,
        role: 'PRODUCTOWNER',
        email,
        used: false,
        expiresAt: new Date(),
      };

      (uuid.v4 as jest.Mock).mockReturnValue(mockToken);
      (prismaService.invite.create as jest.Mock).mockResolvedValue(prismaResult);
      
      const result = await service.createInvite(email, 'PRODUCTOWNER');

      expect(prismaService.invite.create).toBeCalledWith({
        data: {
          email,
          token: mockToken,
          role: 'PRODUCTOWNER',
          expiresAt: expect.any(Date),
        }
      });
      expect(uuid.v4).toHaveBeenCalled();
      expect(result).toEqual({
        error: false,
        status: 0,
        message: 'Create Invite Successful',
        result: prismaResult,
      });
    });

    it('should handle errors when create invite', async () => {
      const email = 'test@example.com';

      (prismaService.invite.create as jest.Mock).mockRejectedValue({});
      
      const result = await service.createInvite(email, 'PRODUCTOWNER');
      
      expect(result).toEqual({
        error: true,
        status: 500,
        message: 'Create Invite Failed',
      });
    });
  });

  describe('findAll invites', () => {
    const email = 'test@example.com';
    const prismaResult = [{
      id: '123',
      token: '123456789',
      email,
      role: 'PRODUCTOWNER',
      used: false,
    }];

    it('should findAll invites by token without pagination', async () => {
      (prismaService.invite.findMany as jest.Mock).mockResolvedValue(prismaResult);

      const result = await service.findAllInvite({ token: '123456' });

      expect(prismaService.invite.findMany).toBeCalledWith({ where: { token: '123456' } });
      expect(result).toEqual(prismaResult);
    });
    it('should findAll invites by email without pagination', async () => {
      (prismaService.invite.findMany as jest.Mock).mockResolvedValue(prismaResult);

      const result = await service.findAllInvite({ email });

      expect(prismaService.invite.findMany).toBeCalledWith({ where:{ email } });
      expect(result).toEqual(result);
    });
  });
});
