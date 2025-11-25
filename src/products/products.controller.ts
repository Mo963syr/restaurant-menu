import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
  import { JwtAuthGuard } from '../common/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get('restaurant/:id')
  findByRestaurant(@Param('id') id: string) {
    return this.service.findByRestaurant(id);
  }

  @Get('category/:id')
  findByCategory(@Param('id') id: string) {
    return this.service.findByCategory(id);
  }
}
