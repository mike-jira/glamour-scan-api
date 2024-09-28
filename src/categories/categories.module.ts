import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { UtilityModule } from 'src/utility/utility.module';

@Module({
  imports: [UtilityModule],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService]
})
export class CategoriesModule {}
