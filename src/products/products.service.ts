import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private model: Model<Product>) {}

  create(dto: CreateProductDto) {
    return new this.model(dto).save();
  }

  findByRestaurant(restaurant: string) {
    return this.model.find({ restaurant }).exec();
  }

  findByCategory(category: string) {
    return this.model.find({ category }).exec();
  }
}
