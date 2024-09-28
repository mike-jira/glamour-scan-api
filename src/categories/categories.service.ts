import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utility/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: { name: string }) {
    try {
      const result = await this.prisma.category.create({
        data: {
          name: data.name
        }
      });

      return {
        error: false,
        status: 0,
        message: 'Create Category Successful',
        result,
      }

    } catch (e) {
      console.log(e);
      return {
        error: true,
        status: 500,
        message: 'Create Category Failed',
      }
    }
  }

  async findAll() {
    try {
      const result = await this.prisma.category.findMany({});

      return {
        status: 0,
        error: false,
        message: 'Retrive Categories Successful',
        result,
      }

    } catch(e) {
      console.log(e);
      return {
        status: 500,
        error: true,
        message: 'Retrive Categories failed'
      }
    }
  }
}
