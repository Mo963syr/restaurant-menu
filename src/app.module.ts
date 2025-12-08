import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurant.model';
import { TablesModule } from './tables/tables.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './Payment/payments.module';

@Module({
  imports: [
    // تحميل متغيرات البيئة من .env وجعلها متاحة في كل المشروع
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // الاتصال بقاعدة البيانات
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb+srv://menuapp:qr7aXaG8rfSA1ERo@menuapp.mggtsul.mongodb.net/menuapp?retryWrites=true&w=majority&appName=menuapp',
    ),

    // بقية الموديولات
    UsersModule,
    RestaurantsModule,
    TablesModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
    PaymentsModule,
  ],
  // غالباً لا تحتاج تصدير MongooseModule هنا، إلا لو عندك سبب معين
  exports: [UsersModule],
})
export class AppModule {}
