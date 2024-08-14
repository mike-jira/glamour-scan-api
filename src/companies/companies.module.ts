import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { UtilityModule } from 'src/utility/utility.module';

@Module({
  providers: [CompaniesService],
  controllers: [CompaniesController],
  imports: [UtilityModule],
})
export class CompaniesModule {}
