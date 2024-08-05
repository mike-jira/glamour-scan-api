import { Test, TestingModule } from '@nestjs/testing';
import { PaginationService } from './pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PaginationService', () => {
  let service: PaginationService;
  let prismaService: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaginationService,
        {
          provide: PrismaService,
          useValue: {
            invite: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        }
      ],
    }).compile();

    service = module.get<PaginationService>(PaginationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('offset approach', () => {
    it('should paginate invite', async () => {
      const inviteData = [{
        _id: '1',
        companyId: '1',
        token: 'test',
        email: 'test@test.com',
        role: 'SUBADMIN',
      }];

      (prismaService.invite.count as jest.Mock).mockResolvedValue(1);
      (prismaService.invite.findMany as jest.Mock).mockResolvedValue(inviteData);

      const result = await service.offset('invite', { where: { companyId: '1' } }, { page: 1, limit: 10, orderBy: { createdAt: 'desc' } });

      expect(prismaService.invite.findMany).toBeCalledWith({
        where: {
          companyId: '1'
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(prismaService.invite.count).toBeCalledWith({ where: { companyId: '1' } });
      expect(result).toEqual({
        data: inviteData,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPage: 1, 
        },
      });
    });
  });
});
