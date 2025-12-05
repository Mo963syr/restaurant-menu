import { Controller, Post, Get, Body, Param, UseGuards ,Delete, Put, Query} from '@nestjs/common';
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

  // Added endpoint to get products by category
  @Get('category/:id')
  findByCategory(@Param('id') id: string, @Query('status') status?: string) {
    
    return this.service.findByCategory(id, status);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateProductDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

}
