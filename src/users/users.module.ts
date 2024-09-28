import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UtilityModule } from 'src/utility/utility.module';
import { InvitesModule } from 'src/invites/invites.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UtilityModule, InvitesModule, AuthModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
