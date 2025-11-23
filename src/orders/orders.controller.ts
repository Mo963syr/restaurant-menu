import { Controller, Post, Get, Body, Param, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Get('restaurant/:id')
  findByRestaurant(@Param('id') restaurantId: string) {
    return this.service.findAllByRestaurant(restaurantId);
  }

  @Put(':id/status/:status')
  updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.service.updateStatus(id, status);
  }
}
