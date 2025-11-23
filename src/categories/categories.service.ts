import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './category.schema';
import { Restaurant } from '../restaurants/restaurant.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
  ) {}

  async create(dto: CreateCategoryDto) {

    const restaurantExists = await this.restaurantModel.findById(dto.restaurant);
    if (!restaurantExists) {
      throw new NotFoundException('Restaurant not found ##$$%');
    }


    return this.categoryModel.create(dto);
  }

  findByRestaurant(restaurantId: string) {
    return this.categoryModel.find({ restaurant: restaurantId });
  }
}
