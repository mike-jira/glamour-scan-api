import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utility/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvite(email: string, role: 'PRODUCTOWNER' | 'PRODUCTOFFICER' | 'SUBADMIN', company: string) {
    try {
      const result = await this.prisma.invite.create({
        data: {
          email,
          role,
          token: uuidv4(),
          companyId: company,
          expiresAt: new Date(),
        },
      });
  
      return {
        error: false,
        status: 0,
        message: 'Create Invite Successful',
        result,
      }
    } catch (e) {
      return {
        error: true,
        status: 500,
        message: 'Create Invite Failed'
      }
    }
  }

  async findAllInvite(query?: Prisma.InviteWhereInput, paginationQuery?: { page: number, limit: number }) {
    if (paginationQuery && (paginationQuery.page || paginationQuery.limit)) {
      const totalItems = await this.prisma.invite.count({ where: query });
      const totalPages = Math.ceil(totalItems / paginationQuery.limit);
      
    }
    const result = await this.prisma
      .invite
      .findMany({ where: query });
      
    return {
      error: false,
      message: 'Retrive Invite Success',
      result,
    };
  }
}
