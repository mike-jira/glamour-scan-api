import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Invite, PrismaClient } from '@prisma/client';
import { PrismaService } from '../utility/prisma/prisma.service';
import { MailerService } from '../utility/mailer/mailer.service'
import { InvitesService } from '../invites/invites.service';
import { AuthService } from '../auth/auth.service';

const transactionClient = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  }
}

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaClient;
  let invitesService: InvitesService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            $transaction: jest.fn((fn) => fn(transactionClient)),
          },
        },
        {
          provide: MailerService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: InvitesService,
          useValue: {
            useInvite: jest.fn(),
          }
        },
        {
          provide: AuthService,
          useValue: {
            hashPassword: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    invitesService = module.get<InvitesService>(InvitesService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register user', () => {
    const password = 'testpassword';
    const hashedPassword = 'hashedPassword';
    const invite = {
      token: 'testtoken',
      role: 'PRODUCTOWNER',
      email: 'testemail',
      used: false,
      companyId: '1234-5678-9101-1245',
    }
    const user = {
      id: '1234-9874-4562-7845',
      email: invite.email,
      username: 'testusername',
      password: hashedPassword,
      role: invite.role,
      googleId: null,
      facebookId: null,
      loginStategy: 'LOCAL',
    }
    
    it('should create user with invite', async () => {
      (invitesService.useInvite as jest.Mock).mockResolvedValueOnce({
        error: false,
        status: 0,
        message: 'User Invite Successful',
        result: invite,
      });
      (authService.hashPassword as jest.Mock).mockResolvedValueOnce({
        error: false,
        status: 0,
        message: 'Hashed Successful',
        result: {
          hashedPassword,
        }
      });
      (transactionClient.user.create as jest.Mock).mockResolvedValueOnce(user);
      (transactionClient.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.createUser({ inviteToken: invite.token, username: user.username, password });

      expect(invitesService.useInvite).toBeCalledWith(invite.token, expect.anything());
      expect(authService.hashPassword).toBeCalledWith(password);
      expect(transactionClient.user.findUnique).toBeCalledWith({
        where: { username: user.username },
      });
      expect(result).toEqual({
        error: false,
        status: 0,
        message: 'Create User Successful',
        result: user,
      })
    });

    it('should handle create user with error invite', async () => {
      (authService.hashPassword as jest.Mock).mockResolvedValue({
        error: false,
        status: 0,
        message: 'Hashed Successful',
        result: {
          hashedPassword,
        }
      });
      (invitesService.useInvite as jest.Mock).mockRejectedValue({
        status: 500,
        error: true,
        message: 'Use Invite Failed',
      });
      const result = await service.createUser({ inviteToken: invite.token, username: user.username, password });
      console.log('result', result);
      expect(transactionClient.user.findUnique).toBeCalledWith({ where: { username: user.username } });
      expect(result).toEqual({
        status: 500,
        error: true,
        message: 'Use Invite Failed',
      });
    })
  });
});
