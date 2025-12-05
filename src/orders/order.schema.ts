import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../products/product.schema';

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  // ملاحظة خاصة لكل طبق داخل الطلب
  @Prop()
  note?: string;

  // السعر لحظة إنشاء الطلب (اختياري)
  @Prop()
  unitPrice?: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Table', required: true })
  tableId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  waiterId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 0 })
  discount?: number;

  @Prop({
    enum: ['cash', 'card', 'other'],
    default: 'cash',
  })
  paymentMethod: string;

  @Prop({
    enum: ['active', 'paid', 'cancelled','completed'],
    default: 'active',
  })
  status: string;

  @Prop()
  finishedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
