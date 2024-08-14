import { Injectable } from '@nestjs/common';
import { PrismaService } from './../utility/prisma/prisma.service';

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
