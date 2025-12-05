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
async delete(id:string){
const   product = await this.model.findByIdAndDelete(id);
if (!product) {
  throw new BadRequestException('الطبق غير موجود.');
}}
//  عرض الأطباق بناءً على المطعم
  async findByRestaurant(restaurant: string) {

    return this.model.find({ restaurant }).exec();

  }
  //  عرض الأطباق بناءً على الفئة
  async findByCategory(category: string, status?: string) {
  const filter: any = { category };

  // لو بعت status نضيفه للفلتر
  if (status) {
    filter.status = status;
  }

  // لو ما بعت status ممكن تضيف قيمة افتراضية:
  else {
    filter.status = 'active';
  }

  return this.model.find(filter).exec();
}

async update(id: string, dto: CreateProductDto) {
  // ------------------------------------
  // 1️⃣ التحقق من صحة الـ ObjectId
  // ------------------------------------
  if (!isValidObjectId(id)) {
    throw new BadRequestException('المعرّف غير صالح.');
  }

  // ------------------------------------
  // 2️⃣ التحقق من أن المنتج موجود مسبقاً
  // ------------------------------------
  const existingProduct = await this.model.findById(id);
  if (!existingProduct) {
    throw new BadRequestException('الطبق غير موجود.');
  }




  if (dto.status && !['active', 'inactive'].includes(dto.status)) {
    throw new BadRequestException('الحالة يجب أن تكون active أو inactive فقط.');
  }

  try {
    const updated = await this.model.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });

    return updated;
  } catch (error) {
    console.error(error);

    // أخطاء Mongoose validation
    if (error.name === 'ValidationError') {
      throw new BadRequestException('خطأ في البيانات المرسلة.');
    }

    // CastError (مثل Category/Restaurant invalid type)
    if (error.name === 'CastError') {
      throw new BadRequestException('القيم المرسلة غير صالحة.');
    }

    throw new BadRequestException('حدث خطأ غير متوقع.');
  }
}


}
