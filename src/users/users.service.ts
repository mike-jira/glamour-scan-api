import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utility/prisma/prisma.service';
import { InvitesService } from '../invites/invites.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitesService: InvitesService,
    private readonly authService: AuthService,
  ) {}

  async createUser(data: { inviteToken: string, username: string, password: string }) {
    return this.prisma.$transaction(async (prisma) => {
      const isUsernameExisted = await prisma.user.findUnique({ where: { username: data.username } });
      if (isUsernameExisted) {
        return {
          error: true,
          status: 400,
          message: 'Username already exists'
        }
      }

      const hashed = await this.authService.hashPassword(data.password);
      if (hashed.error) {
        return hashed;
      }
      console.log('yyy')
      // update invite 
      const invite = await this.invitesService.useInvite(data.inviteToken, prisma);
      console.log('invite', invite);
      if (invite.error) {
        return invite;
      }
      console.log('xxx')

      const user = await prisma.user.create({
        data: {
          username: data.username,
          password: hashed.result.hashedPassword,
          email: invite.result.email,
          role: invite.result.role,
          loginStategy: 'LOCAL',
          useInvited: {
            connect: { id: invite.result.id },
          },
          company: {
            connect: { id: invite.result.companyId }
          }
        }
      });

      return {
        error: false,
        status: 0,
        message: 'Create User Successful',
        result: user,
      };
    });
  }

}
