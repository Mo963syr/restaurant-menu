// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payment.schema';
import { CashSession, CashSessionSchema } from './cash-session.schema';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Order, OrderSchema } from '../orders/order.schema';
import { User, UserSchema } from '../users/user.schema'; // عدّل المسار حسب مشروعك
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema'; // عدّل المسار

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: CashSession.name, schema: CashSessionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
