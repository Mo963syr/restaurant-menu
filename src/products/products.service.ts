import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model } from 'mongoose';
import { Category } from '../categories/category.schema';
import { Restaurant } from '../restaurants/restaurant.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private model: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
  ) {}

  async create(dto: CreateProductDto) {
    const { name, price, category, restaurant } = dto;

    if (!name) {
      throw new BadRequestException('اسم الطبق مطلوب.');
    }

    if (!price && price !== 0) {
      throw new BadRequestException('السعر مطلوب.');
    }

    if (!category) {
      throw new BadRequestException('معرف الفئة (category) مطلوب.');
    }

    if (!restaurant) {
      throw new BadRequestException('معرف المطعم (restaurant) مطلوب.');
    }

   
    if (!isValidObjectId(category)) {
      throw new BadRequestException('معرف الفئة غير صالح.');
    }

    if (!isValidObjectId(restaurant)) {
      throw new BadRequestException('معرف المطعم غير صالح.');
    }

 
    const categoryExists = await this.categoryModel.findById(category);
    if (!categoryExists) {
      throw new BadRequestException('الفئة غير موجودة في قاعدة البيانات.');
    }

   
    const restaurantExists = await this.restaurantModel.findById(restaurant);
    if (!restaurantExists) {
      throw new BadRequestException('المطعم غير موجود في قاعدة البيانات.');
    }


    const duplicate = await this.model.findOne({
      name,
      restaurant,
    });

    if (duplicate) {
      throw new BadRequestException('هذا الطبق موجود مسبقاً لهذا المطعم.');
    }

    const product = new this.model(dto);
    return product.save();
  }

  findByRestaurant(restaurant: string) {
    return this.model.find({ restaurant }).exec();
  }

  findByCategory(category: string) {
    return this.model.find({ category }).exec();
  }
}
