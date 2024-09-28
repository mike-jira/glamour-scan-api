import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvitesModule } from './invites/invites.module';
import { UtilityModule } from './utility/utility.module';
import { CompaniesModule } from './companies/companies.module';
import { ProductModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';

console.log('process.env.NODE_ENV', process.env.NODE_ENV);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}` || '.env.development',
    }),
    AuthModule,
    UsersModule,
    InvitesModule,
    UtilityModule,
    CompaniesModule,
    ProductModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
