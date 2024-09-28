import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from 'src/utility/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

describe('ProductService', () => {
  let service: ProductsService;
  let prismaService: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
            }
          },
        }
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create product', () => {
    it('should create product', () => {
      const result = {
        name: 'test product',
        describe: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ac urna eu sapien cursus posuere id suscipit nulla. Phasellus maximus nisi a molestie euismod. Morbi vel nisl felis. Donec nec egestas tellus, congue finibus dui. Etiam quis bibendum ligula. Quisque efficitur, leo vel pharetra ullamcorper, nisi nisl aliquet dui, sed pharetra augue sem at erat. Donec aliquam sem et ligula placerat, et vulputate ipsum rutrum. Aliquam sollicitudin fringilla aliquet. Fusce laoreet, massa ut auctor varius, ipsum erat molestie libero, vitae pulvinar purus elit ultricies leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean ante turpis, mollis eu risus eu, laoreet vulputate orci. Aenean id lacus tempus, pellentesque arcu a, auctor nibh. Mauris purus quam, semper a pharetra nec, laoreet vitae dolor. Aenean hendrerit tempor ante, ac vestibulum nisi semper eget. Praesent pretium metus arcu, in consequat urna semper eu.',
        images: [
          'https://placehold.co/300',
          'https://placehold.co/300',
          'https://placehold.co/300',
          'https://placehold.co/300',
        ],
        category: '1234-5678-9101-1112',
        status: 'ACTIVE',
      };

      (prismaService.product.create as jest.Mock).mockResolvedValue(result);
    });
  });
});
