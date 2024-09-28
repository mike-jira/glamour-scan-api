import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { UtilityModule } from 'src/utility/utility.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UtilityModule, UsersModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService]
})
export class ProductModule {}
