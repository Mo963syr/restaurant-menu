import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private model: Model<Order>) {}

  async create(dto: CreateOrderDto) {
    // حساب المجموع الكلي تلقائي حسب عدد كل منتج وسعره
    const total = dto.items.reduce((sum, i) => sum + i.quantity, 0); // لاحقاً يمكن تعديل لحساب السعر الحقيقي من المنتج

    const order = new this.model({ ...dto, total });
    return order.save();
  }

  findAllByRestaurant(restaurantId: string) {
    return this.model.find({ restaurantId }).exec();
  }

  updateStatus(orderId: string, status: string) {
    return this.model.findByIdAndUpdate(orderId, { status }, { new: true });
  }
}
