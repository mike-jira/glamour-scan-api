// types.ts
import { Prisma, PrismaClient } from '@prisma/client';

export type Models = 'user' | 'invite' | 'company';

type ModelMap = {
  user: Prisma.UserDelegate;
  invite: Prisma.InviteDelegate;
  company: Prisma.CompanyDelegate;
};

export type ModelFindManyArgs = {
  user: Prisma.UserFindManyArgs,
  invite: Prisma.InviteFindManyArgs,
  company: Prisma.CompanyFindManyArgs
};

export type ModelOrderByArgs = {
  user: Prisma.UserOrderByWithAggregationInput,
  invite: Prisma.InviteOrderByWithAggregationInput,
  company: Prisma.CompanyOrderByWithAggregationInput,
}

export type MultiModelOrderBy<Model extends Models> = ModelOrderByArgs[Model];

export type OffsetPaginate<Model extends Models> = {
  data: Model[],
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPage: number,
  }
}