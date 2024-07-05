import { Test, TestingModule } from '@nestjs/testing';
import { InvitesService } from './invites.service';
import { MailerService } from '../utility/mailer/mailer.service'
import { PrismaService } from '../utility/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import * as uuid from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}))

describe('InvitesService', () => {
  let service: InvitesService;
  let prismaService: PrismaClient;

  // CONSTANT
  const email = 'test@example.com';
  const mockToken = '1234-5678-91011-1213';
  const mockCompanyId = '1312-11109-8765-4321';

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
              count: jest.fn(),
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
      const prismaResult = {
        token: mockToken,
        role: 'PRODUCTOWNER',
        email,
        used: false,
        companyId: mockCompanyId,
        expiresAt: new Date(),
      };

      (uuid.v4 as jest.Mock).mockReturnValue(mockToken);
      (prismaService.invite.create as jest.Mock).mockResolvedValue(prismaResult);
      
      const result = await service.createInvite(email, 'PRODUCTOWNER', mockCompanyId);

      expect(prismaService.invite.create).toBeCalledWith({
        data: {
          email,
          token: mockToken,
          role: 'PRODUCTOWNER',
          companyId: mockCompanyId,
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
      
      const result = await service.createInvite(email, 'PRODUCTOWNER', mockCompanyId);
      
      expect(result).toEqual({
        error: true,
        status: 500,
        message: 'Create Invite Failed',
      });
    });
  });

  describe('findAll invites', () => {
    const prismaResult = [{
      id: '123',
      token: mockToken,
      email,
      role: 'PRODUCTOWNER',
      used: false,
    }];

    it('should findAll invites by companyId without pagination', async () => {
      (prismaService.invite.findMany as jest.Mock).mockResolvedValue(prismaResult);

      const result = await service.findAllInvite({ companyId: mockCompanyId });

      expect(prismaService.invite.findMany).toBeCalledWith({ where: { companyId: mockCompanyId } });
      expect(result).toEqual({
        error: false,
        message: 'Retrive Invite Success',
        result: prismaResult,
      });
    });

    it('should findAll invites by email without pagination', async () => {
      (prismaService.invite.findMany as jest.Mock).mockResolvedValue(prismaResult);

      const result = await service.findAllInvite({ email });

      expect(prismaService.invite.findMany).toBeCalledWith({ where:{ email } });
      expect(result).toEqual({
        error: false,
        message: 'Retrive Invite Success',
        result: prismaResult,
      });
    });

    it('should findAll invites by invitedByUserId without pagination', async () => {
      (prismaService.invite.findMany as jest.Mock).mockResolvedValue(prismaResult);

      const result = await service.findAllInvite({ invitedByUserId: '123456' })

      expect(prismaService.invite.findMany).toBeCalledWith({ where: { invitedByUserId: '123456' } });
      expect(result).toEqual({
        error: false,
        message: 'Retrive Invite Success',
        result: prismaResult,
      });
    });

    it('should findAll invites by companyId with pagination', async () => {
      const expectedResult = {
        error: false,
        message: 'Retrive Invite Success',
        result: prismaResult,
        pageInfo: {
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: 10,
        }
      };

      (prismaService.invite.count as jest.Mock).mockResolvedValue(1);
      (prismaService.invite.findMany as jest.Mock).mockResolvedValue(prismaResult);

      const result = await service.findAllInvite({ companyId: mockCompanyId }, { page: 1, limit: 10 });

      expect(prismaService.invite.count).toBeCalled();
      expect(prismaService.invite.findMany).toBeCalledWith();
      expect(result).toEqual(expectedResult);
    });

    // it('should findAll invites by ')
  });
});
