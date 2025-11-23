import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Get(':restaurant')
  findByRestaurant(@Param('restaurant') id: string) {
    return this.service.findByRestaurant(id);
  }
}
