import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurant.model';
import { TablesModule } from './tables/tables.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/restaurant-menu'),

    UsersModule,
    RestaurantsModule,
    TablesModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
  ],
})
export class AppModule {}

    
    
    
    
    