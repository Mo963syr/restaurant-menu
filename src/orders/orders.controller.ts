import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  // إنشاء طلب جديد
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  // جميع الطلبات لمطعم معيّن (مع إمكانية فلترة الحالة)
  @Get('restaurant/:id')
  findByRestaurant(
    @Param('id') restaurantId: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAllByRestaurant(restaurantId, status);
  }

  // جلب طلب واحد بالتفصيل
  @Get(':id')
  findOne(@Param('id') orderId: string) {
    return this.service.findOne(orderId);
  }

  // تحديث حالة الطلب
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }
}
