import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/utility/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(data: { name: string; description: string; images?: string[], category: string, lazadaUrl: string }) {
    try {
      const result = await this.prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          images: data.images,
          lazadaUrl: data.lazadaUrl,
          category: {
            connect: {
              id: data.category,
            },
          },
        }
      });

      return {
        error: false,
        stauts: 0,
        message: 'Create Product Success',
        result,
      }
    } catch (e) {
      console.log(e);
      return {
        error: true,
        status: 500,
        message: 'Create Product Failed',
      }
    }
  }

  async findAll() {
    try {
      const result = await this.prisma.product.findMany();

      return {
        status: 0,
        error: false,
        message: 'Retrive products success',
        result
      }
    } catch (e) {
      return {
        status: 500,
        error: true,
        message: 'Retrive products failed',
      }
    }
  }

  async findOne(id) {
    try {
      const result = await this.prisma.product.findUnique({
        where: { id },
        include: { category: true }
      });

      return {
        status: 0,
        error: false,
        message: 'Retrive product success',
        result
      }
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        error: true,
        message: 'Retrive product failed',
      }
    }
  }

  async update(id: string, data) {
    try {
      if (data.category) {
        data.category = {
          connect: {
            id: data.category,
          },
        }
      }

      const result = await this.prisma.product.update({
        where: {
          id,
        },
        data,
      });

      return {
        status: 0,
        error: false,
        message: 'Update product success',
        result,
      }
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        error: true,
        message: 'Update product failed',
      }
    }
  }
}
