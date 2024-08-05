import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Models, ModelFindManyArgs, OffsetPaginate, ModelOrderByArgs } from './pagination.types';

@Injectable()
export class PaginationService {
  constructor(private readonly prisma: PrismaService) {}


  async offset<Model extends Models>(
    model: Model,
    query: ModelFindManyArgs[Model],
    paginate: { page?: number; limit?: number, orderBy?: ModelOrderByArgs[Model] }
  ): Promise<OffsetPaginate<Model>> {
    const { page = 1, limit = 10, orderBy } = paginate;
    const skip = (page - 1) * limit;
    const take = limit;

    const client = this.prisma[model] as any;

    const [data, total] = await Promise.all([
      client.findMany({ ...query, skip, take, orderBy }),
      client.count({ ...query }),
    ])

    return {
      data,
      meta: {
        page: paginate.page,
        limit: paginate.limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async infiniteScroll() {}

}
