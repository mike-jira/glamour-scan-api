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
      (prismaService.invite.create as jest.Mock).mockRejectedValue({});
      
      const result = await service.createInvite(email, 'PRODUCTOWNER', mockCompanyId);
      
      expect(result).toEqual({
        error: true,
        status: 500,
        message: 'Create Invite Failed',
      });
    });
  });

  describe('use invites', () => {
    it('should handle use invite', async () => {
      const expectedUseAtDate = new Date();
      const expectedData = {
        token: mockToken,
        role: 'PRODUCTOWNER',
        email,
        used: false,
        useAt: expectedUseAtDate,
        companyId: mockCompanyId,
      };

      (prismaService.invite.findUnique as jest.Mock).mockResolvedValue(expectedData);
      (prismaService.invite.update as jest.Mock).mockResolvedValue({ ...expectedData, used: true });

      const result = await service.useInvite(mockToken);

      expect(prismaService.invite.update).toHaveBeenCalledWith({
        where: { token: mockToken },
        data: { used: true, useAt: expect.any(Date) }
      });
      expect(result).toEqual({
        error: false,
        status: 0,
        message: 'Use Invite Successful',
        result: { ...expectedData, used: true, },
      });
    });

    it('should return error when use invite with used token', async () => {
      const expectedData = {
        token: mockToken,
        role: 'PRODUCTOWNER',
        email,
        used: true,
        companyId: mockCompanyId,
      };

      (prismaService.invite.findUnique as jest.Mock).mockResolvedValue(expectedData);

      const result = await service.useInvite(mockToken);

      expect(prismaService.invite.findUnique).toHaveBeenCalledWith({ where: { token: mockToken } });
      expect(result).toStrictEqual({
        error: true,
        status: 400,
        message: 'This Invite Already Used',
      });
    });

    it('should return error when invite not existed', async () => {
      (prismaService.invite.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.useInvite(mockToken);

      expect(prismaService.invite.findUnique).toHaveBeenCalledWith({ where: { token: mockToken } });
      expect(result).toStrictEqual({
        error: true,
        status: 404,
        message: 'Invite Not Existed',
      });
    })
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
  });
});
