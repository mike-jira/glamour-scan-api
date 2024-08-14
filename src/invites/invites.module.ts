import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { UtilityModule } from 'src/utility/utility.module';

@Module({
  providers: [InvitesService],
  controllers: [InvitesController],
  imports: [UtilityModule],
})
export class InvitesModule {}
