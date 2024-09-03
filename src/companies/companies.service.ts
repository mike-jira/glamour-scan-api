import { Injectable } from '@nestjs/common';
import { PrismaService } from './../utility/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompany(name: string) {
    try {
      const result = await this.prisma.company.create({
        data: { name }
      });
      return {
        error: false,
        status: 0,
        message: 'Create Company Success',
        result,
      };
    } catch (e) {
      if (e.code === 'P2002') {
        return {
          error: true,
          status: 400,
          message: `Duplicate company ${e.meta.taget[0]}`,
        };
      }
      return {
        error: true,
        status: 500,
        message: 'Create Company Failed'
      }
    }
  }

  async findById(id: string, transaction?: Prisma.TransactionClient) {
    try {
      const client = transaction ? transaction.company : this.prisma.company;
      const result = await client.findUnique({ where: { id } });

      if (!result) {
        return {
          error: true,
          status: 404,
          message: 'Company Not Found',
        }
      }
      
      return {
        error: false,
        status: 0,
        message: 'Company Found',
        result,
      }
    } catch (e) {
      return {
        error: true,
        status: 500,
        message: 'Company Find Failed',
      };
    } 
  }

  async updateCompany(id: string, data: { name?: string, userId?: string }) {
    try {
      const result = await this.prisma.company.update({
        where: { id },
        data: {
          name: data.name,
          userId: data.userId,
        },
      });
      return {
        error: false,
        status: 0,
        message: 'Update Company Success',
        result,
      }
    } catch (e) {
      if (e.code === 'P2002') {
        return {
          error: true,
          status: 400,
          message: `Duplicate company ${e.meta.taget[0]}`,
        };
      }
      return {
        error: true,
        status: 500,
        message: 'Update Company Failed'
      }
    }
  }

}
