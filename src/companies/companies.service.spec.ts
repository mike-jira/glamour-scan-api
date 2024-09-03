import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../utility/prisma/prisma.service';
import { PrismaClient, Prisma } from '@prisma/client';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prismaService: PrismaClient;
  const companyName = 'test company';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: PrismaService,
          useValue: {
            company: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],

    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create company', () => {
    it('should create company', async () => {
      (prismaService.company.create as jest.Mock).mockResolvedValue({
        id: '1234-5678-0910-1112',
        name: companyName, 
      });
      const result = await service.createCompany(companyName);

      expect(result).toEqual({
        error: false,
        status: 0,
        message: 'Create Company Success',
        result: {
          id: '1234-5678-0910-1112',
          name: companyName, 
        },
      });

      expect(prismaService.company.create).toBeCalledWith({ data: { name: companyName } });
    });

    it('should handle errors when create company with existed company name', async () => {
      (prismaService.company.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        clientVersion: '2.x.x',
        meta: {
          taget: ['name'],
        },
        message: 'Unique constraint failed on the fields: (`name`)'
      });

      const result = await service.createCompany(companyName);

      expect(result).toEqual({
        error: true,
        status: 400,
        message: 'Duplicate company name',
      });
      expect(prismaService.company.create).toBeCalledWith({ data: { name: companyName } });
    });

    it('should handle errors when create company', async () => {
      (prismaService.company.create as jest.Mock).mockRejectedValue({});

      const result = await service.createCompany(companyName);
      expect(result).toEqual({
        error: true,
        status: 500,
        message: 'Create Company Failed'
      });
      expect(prismaService.company.create).toBeCalledWith({ data: { name: companyName } });
    });
  });

  describe('update company', () => {
    const updateCompanyId = '1234-5678-9101-1213';
    const testOwnerUserId = '1211-1009-0807-0605';
    const updateNameCompany = 'test company';

    it('should update owner of company', async () => {
      (prismaService.company.update as jest.Mock).mockResolvedValue({
        id: updateCompanyId,
        name: updateNameCompany,
        userId: testOwnerUserId,
      });

      const data = {
        userId: testOwnerUserId,
      };

      const result = await service.updateCompany(updateCompanyId, data);
      expect(prismaService.company.update).toBeCalledWith({
        where: { id: updateCompanyId },
        data: { userId: testOwnerUserId }
      });
      expect(result).toEqual({
        error: false,
        status: 0,
        message: 'Update Company Success',
        result: {
          id: updateCompanyId,
          name: updateNameCompany,
          userId: testOwnerUserId
        },
      });
    });

    it('should handle error when update company name with existed company name', async () => {
      (prismaService.company.update as jest.Mock).mockRejectedValue({
        code: 'P2002',
        clientVersion: '2.x.x',
        meta: {
          taget: ['name'],
        },
        message: 'Unique constraint failed on the fields: (`name`)'
      });

      const result = await service.updateCompany(updateCompanyId, { name: updateNameCompany });

      expect(result).toStrictEqual({
        error: true,
        status: 400,
        message: 'Duplicate company name',
      });
    });

    it('should handle error when update company', async () => {
      (prismaService.company.update as jest.Mock).mockRejectedValue({});

      const result = await service.updateCompany(updateCompanyId, { name: 'failed' });

      expect(result).toStrictEqual({
        error: true,
        status: 500,
        message: 'Update Company Failed',
      });
    });
  });

  describe('find company by id', () => {
    let testCompanyId = 'testcompanyid';
    let mockResult = {
      id: 'testcompanyid',
      name: 'Test Company Inc.',
      owner: {
        id: 'testownerid',
        username: 'testowner',
        email: 'testowner@gmail.com',
        role: 'PRODUCTOWNER',
        loginStategy: 'LOCAL',
      },
      userId: 'testownerid',
      invite: [{
        id: 'testinvite',
        token: 'testinvitetoken',
        email: 'testinviteemail',
        role: 'PRODUCTOWNER',
        companyId: 'testcompanyid',
        inviteBy: {
          id: 'superadminid',
          username: 'superadmin',
        },
      }],
    }

    it('should find company using default prisma client', async () => {
      (prismaService.company.findUnique as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findById(testCompanyId);

      expect(prismaService.company.findUnique).toBeCalledWith({ where: { id: testCompanyId } });
      expect(result).toEqual({
        status: 0,
        error: false,
        message: 'Company Found',
        result: mockResult,
      });

    });

    it('should find company using trasaction prisma client', async () => {
      const prismaTransaction = {
        company: {
          findUnique: jest.fn().mockResolvedValue(mockResult),
        },
      } as unknown as Prisma.TransactionClient

      const result = await service.findById(testCompanyId, prismaTransaction);

      expect(prismaTransaction.company.findUnique).toBeCalledWith({ where: { id: testCompanyId } });
      expect(result).toEqual({
        status: 0,
        error: false,
        message: 'Company Found',
        result: mockResult,
      })
    });

    it('should handle find non existed company', async () => {
      (prismaService.company.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findById(testCompanyId);

      expect(prismaService.company.findUnique).toBeCalledWith({ where: { id: testCompanyId } });
      expect(result).toEqual({
        status: 404,
        error: true,
        message: 'Company Not Found'
      });
    });

    it('should handle find company error', async () => {
      (prismaService.company.findUnique as jest.Mock).mockRejectedValue({});

      const result = await service.findById(testCompanyId);

      expect(prismaService.company.findUnique).toBeCalledWith({ where: { id: testCompanyId } });
      expect(result).toEqual({
        status: 500,
        error: true,
        message: 'Company Find Failed'
      });
    });
  });
});
