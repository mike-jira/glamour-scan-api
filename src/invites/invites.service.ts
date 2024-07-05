import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvite(email: string, role: 'PRODUCTOWNER' | 'PRODUCTOFFICER' | 'SUBADMIN') {
    try {
      const result = await this.prisma.invite.create({
        data: {
          email,
          role,
          token: uuidv4(),
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
      
    }
    const result = await this.prisma
      .invite
      .findMany({ where: query });
      
    return result;
  }
}
