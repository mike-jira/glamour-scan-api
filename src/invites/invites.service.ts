import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utility/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Invite, Prisma } from '@prisma/client';

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

  async useInvite(token: string): Promise<{ error: boolean; status: number; message: string; result?: Invite }> {
    try {
      const invite = await this.prisma.invite.findUnique({ where: { token }});
      if (invite === null || invite.used) {
        return {
          error: true,
          status: invite?.used ? 400 : 404,
          message: invite?.used ? 'This Invite Already Used' : 'Invite Not Existed',
        }
      }

      const result = await this.prisma.invite.update({
        where: { token },
        data: {
          used: true,
          useAt: new Date()
        },
      });
      return {
        error: false,
        status: 0,
        message: 'Use Invite Successful',
        result,
      }
    } catch (e) {
      console.log(e);
    }
  }
}
