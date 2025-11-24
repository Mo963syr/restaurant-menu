import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)  
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  // إنشاء فئة جديدة
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  // الحصول على فئات طبقًا للمطعم
  @Get(':restaurant') 
  findByRestaurant(@Param('restaurant') id: string) {
    return this.service.findByRestaurant(id);  
  }
}
