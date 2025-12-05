// src/payments/payments.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';   

import { CreatePaymentDto } from './dto/create-payment.dto';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  // فتح جلسة كاشير (فتح صندوق)
  @Post('sessions/open')
  openSession(@Body() dto: OpenSessionDto) {
    return this.service.openSession(dto);
  }

  // إغلاق جلسة كاشير (تصفير الصندوق)
  @Post('sessions/close')
  closeSession(@Body() dto: CloseSessionDto) {
    return this.service.closeSession(dto);
  }

  // تسجيل دفعة لطلب معيّن
  @Post()
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.service.createPayment(dto);
  }

  // تقارير الكاشير (يومي / أسبوعي / شهري)
  @Get('cashier/:cashierId')
  getCashierTransactions(
    @Param('cashierId') cashierId: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('period') period?: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.service.getCashierTransactions(
      cashierId,
      restaurantId,
      period || 'daily',
    );
  }

    // تقارير مبيعات المطعم (لصاحب المطعم)
  @Get('restaurant/:restaurantId/report')
  getRestaurantReport(
    @Param('restaurantId') restaurantId: string,
    @Query('period') period?: 'daily' | 'weekly' | 'monthly' | 'yearly',
  ) {
    return this.service.getRestaurantSalesReport(
      restaurantId,
      period || 'daily',
    );
  }

}
